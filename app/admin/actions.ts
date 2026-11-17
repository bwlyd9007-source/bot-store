"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, requireAdmin, startSession } from "@/lib/auth";
import {
  hashPassword,
  newId,
  readDb,
  updateDb,
  verifyPassword,
} from "@/lib/db";
import { discordResultMessage, sendTestOrderCard } from "@/lib/discord";
import type { OrderEventType, OrderStatus, StoreOrder } from "@/lib/types";
import { sanitizeImage } from "@/lib/products";

function pushEvent(order: StoreOrder, type: OrderEventType, text: string) {
  const events = Array.isArray(order.events) ? order.events : [];
  order.events = [...events, { at: new Date().toISOString(), type, text }].slice(-100);
}

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  savedAt?: number;
};

export type LoginState = {
  error?: string;
};

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function refreshStore() {
  updateTag("store");
  revalidatePath("/store");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/settings");
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = field(formData, "password");
  if (!password) return { error: "أدخل كلمة المرور أولاً." };

  const db = await readDb();
  if (!verifyPassword(password, db.auth.passwordHash)) {
    return { error: "كلمة المرور غير صحيحة، حاول مرة أخرى." };
  }

  await startSession();
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

export async function saveProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = field(formData, "id");
  const name = field(formData, "name");
  const tagline = field(formData, "tagline");
  const description = field(formData, "description").slice(0, 2000);
  const category = field(formData, "category") || "عام";
  const emoji = field(formData, "emoji") || "🤖";
  const badge = field(formData, "badge");
  const rawImage = String(formData.get("image") ?? "").trim();
  const image = sanitizeImage(rawImage);
  const price = Number(field(formData, "price"));
  const features = String(formData.get("features") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (name.length < 2) {
    return { status: "error", message: "اسم المنتج مطلوب (حرفان على الأقل)." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { status: "error", message: "أدخل سعراً صحيحاً بالريال." };
  }
  if (rawImage && !image) {
    return {
      status: "error",
      message: "صورة المنتج غير صالحة، ارفع صورة جديدة أو ضع رابطاً يبدأ بـ https://",
    };
  }

  if (id) {
    const updated = await updateDb((db) => {
      const index = db.products.findIndex((product) => product.id === id);
      if (index === -1) return false;

      db.products[index] = {
        ...db.products[index],
        name,
        tagline,
        description: description || undefined,
        category,
        price,
        emoji,
        badge: badge || undefined,
        features,
        image,
      };
      return true;
    });

    if (!updated) {
      return { status: "error", message: "هذا المنتج لم يعد موجوداً." };
    }
  } else {
    await updateDb((db) => {
      db.products.unshift({
        id: newId(),
        name,
        tagline,
        description: description || undefined,
        category,
        price,
        emoji,
        badge: badge || undefined,
        features,
        image,
        createdAt: new Date().toISOString(),
      });
    });
  }

  refreshStore();
  return {
    status: "success",
    message: id ? "تم تحديث المنتج." : "تمت إضافة المنتج.",
    savedAt: Date.now(),
  };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();

  await updateDb((db) => {
    db.products = db.products.filter((product) => product.id !== id);
  });
  refreshStore();
}

export async function setOrderStatusAction(id: string, status: OrderStatus) {
  await requireAdmin();

  await updateDb((db) => {
    const order = db.orders.find((item) => item.id === id);
    if (!order || order.status === status) return;

    order.status = status;
    pushEvent(
      order,
      "status",
      status === "done"
        ? "تم تحويل حالة الطلب إلى «تم»"
        : "تمت إعادة حالة الطلب إلى «جديد»",
    );
  });
  refreshStore();
}

export async function deleteOrderAction(id: string) {
  await requireAdmin();

  await updateDb((db) => {
    db.orders = db.orders.filter((order) => order.id !== id);
  });
  refreshStore();
}

export async function updateOrderNoteAction(id: string, note: string) {
  await requireAdmin();

  const nextNote = note.trim().slice(0, 500) || undefined;

  await updateDb((db) => {
    const order = db.orders.find((item) => item.id === id);
    if (!order) return;
    if ((order.note ?? undefined) === nextNote) return;

    order.note = nextNote;
    pushEvent(
      order,
      "note",
      nextNote ? "تم تحديث ملاحظات المتابعة" : "تم حذف ملاحظات المتابعة",
    );
  });
  refreshStore();
}

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const whatsappUrl = field(formData, "whatsappUrl");
  const discordUrl = field(formData, "discordUrl");

  if (!/^https?:\/\//i.test(whatsappUrl) || !/^https?:\/\//i.test(discordUrl)) {
    return {
      status: "error",
      message: "الروابط يجب أن تبدأ بـ https:// أو http://",
    };
  }

  await updateDb((db) => {
    db.settings = { whatsappUrl, discordUrl };
  });
  refreshStore();
  return {
    status: "success",
    message: "تم حفظ بيانات التواصل.",
    savedAt: Date.now(),
  };
}

export async function sendDiscordTestAction(): Promise<ActionState> {
  await requireAdmin();

  const db = await readDb();
  const sample = db.products[0];
  const result = await sendTestOrderCard(
    sample
      ? { productName: sample.name, price: sample.price, image: sample.image }
      : undefined,
  );

  if (result.ok) {
    return {
      status: "success",
      message: "تم إرسال البطاقة التجريبية إلى ديسكورد — تحقق من الروم الآن.",
      savedAt: Date.now(),
    };
  }

  return {
    status: "error",
    message: discordResultMessage(result) ?? "تعذّر إرسال البطاقة التجريبية.",
  };
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const current = field(formData, "current");
  const next = field(formData, "next");
  const confirm = field(formData, "confirm");

  if (next.length < 8) {
    return { status: "error", message: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل." };
  }

  const change = await updateDb((db) => {
    if (!verifyPassword(current, db.auth.passwordHash)) return "wrong-current";
    if (next !== confirm) return "mismatch";

    db.auth.passwordHash = hashPassword(next);
    return "ok";
  });

  if (change === "wrong-current") {
    return { status: "error", message: "كلمة المرور الحالية غير صحيحة." };
  }
  if (change === "mismatch") {
    return { status: "error", message: "تأكيد كلمة المرور غير مطابق." };
  }

  return { status: "success", message: "تم تحديث كلمة المرور.", savedAt: Date.now() };
}
