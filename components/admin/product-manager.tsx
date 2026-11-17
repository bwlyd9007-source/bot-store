"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import {
  deleteProductAction,
  saveProductAction,
  type ActionState,
} from "@/app/admin/actions";
import {
  AlertIcon,
  BoxIcon,
  CheckIcon,
  CloseIcon,
  EditIcon,
  ImageIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { categorySuggestions, formatPrice } from "@/lib/products";
import type { Product } from "@/lib/types";

const initialState: ActionState = { status: "idle" };

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-accent/60 focus:bg-white/[0.06]";

const labelClass = "text-xs font-bold text-white/60";

export function ProductManager({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startDelete] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setOpen(true);
  }

  function handleDelete(product: Product) {
    if (!window.confirm(`حذف «${product.name}» نهائياً؟ لا يمكن التراجع.`)) return;

    setBusyId(product.id);
    startDelete(async () => {
      await deleteProductAction(product.id);
      setBusyId(null);
      setToast("تم حذف المنتج.");
    });
  }

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-white/40">
          {products.length > 0
            ? `${products.length} منتج في المتجر`
            : "لا توجد منتجات بعد"}
        </p>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-extrabold text-[#04242a] transition hover:bg-accent-soft"
        >
          <PlusIcon />
          إضافة منتج
        </button>
      </div>

      {products.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-white/12 bg-white/[0.015] px-6 py-14 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
            <BoxIcon className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-extrabold">ابدأ بإضافة أول منتج</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-white/40">
            أضف بوتاً أو خدمة مع السعر والميزات، وسيظهر فوراً في صفحة المتجر.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 text-sm font-bold text-accent transition hover:bg-accent/15"
          >
            <PlusIcon />
            إضافة منتج
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 hidden overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] text-white/35">
                  <th className="px-5 py-3 text-start font-bold">المنتج</th>
                  <th className="px-4 py-3 text-start font-bold">الفئة</th>
                  <th className="px-4 py-3 text-start font-bold">السعر</th>
                  <th className="px-4 py-3 text-start font-bold">الميزات</th>
                  <th className="px-5 py-3 text-end font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <ProductThumb product={product} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-bold text-white/85">
                              {product.name}
                            </span>
                            {product.badge && (
                              <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                                {product.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 max-w-[20rem] truncate text-[11px] text-white/35">
                            {product.tagline}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold text-white/50">
                        {product.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="font-bold">{formatPrice(product.price)}</span>
                      <span className="ms-1 text-[11px] text-white/35">ر.س</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-white/40">
                      {product.features.length} ميزة
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          aria-label={`تعديل ${product.name}`}
                          className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/50 transition hover:border-accent/40 hover:text-accent"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          disabled={busyId === product.id}
                          aria-label={`حذف ${product.name}`}
                          className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/50 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-40"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 md:hidden">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
              >
                <div className="flex items-start gap-3">
                  <ProductThumb product={product} className="size-11 text-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-white/85">{product.name}</h3>
                      {product.badge && (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white/35">
                      {product.tagline}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] text-white/45">
                      {product.category}
                    </span>
                    <span className="font-bold text-white/75">
                      {formatPrice(product.price)} ر.س
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      aria-label={`تعديل ${product.name}`}
                      className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/50 transition hover:text-accent"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      disabled={busyId === product.id}
                      aria-label={`حذف ${product.name}`}
                      className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/50 transition hover:text-red-300 disabled:opacity-40"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setOpen(false)}
            className="fixed inset-0 cursor-default bg-black/75 backdrop-blur-sm"
          />
          <div className="animate-pop relative my-6 w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0e161c] p-6 shadow-2xl shadow-black/60 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold">
                  {editing ? "تعديل المنتج" : "منتج جديد"}
                </h2>
                <p className="mt-1 text-xs text-white/40">
                  تظهر البيانات مباشرة في صفحة المتجر بعد الحفظ.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:text-accent"
              >
                <CloseIcon />
              </button>
            </div>

            <ProductForm
              key={editing?.id ?? "new"}
              product={editing}
              onSaved={(message) => {
                setOpen(false);
                setToast(message);
              }}
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-accent/30 bg-[#0c1a20] px-4 py-3 text-xs font-bold text-accent shadow-2xl shadow-black/50">
          <CheckIcon className="size-4" />
          {toast}
        </div>
      )}
    </div>
  );
}

function ProductForm({
  product,
  onSaved,
  onCancel,
}: {
  product: Product | null;
  onSaved: (message: string) => void;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    saveProductAction,
    initialState,
  );
  const handled = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | undefined>(product?.image);
  const [imageUrl, setImageUrl] = useState(
    product?.image && !product.image.startsWith("data:") ? product.image : "",
  );
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImageError(null);
    setImageBusy(true);
    try {
      setImage(await imageFileToDataUrl(file));
      setImageUrl("");
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "تعذر رفع الصورة.");
    } finally {
      setImageBusy(false);
    }
  }

  function handleUrl(value: string) {
    setImageUrl(value);
    setImageError(null);
    setImage(value.trim() || undefined);
  }

  function clearImage() {
    setImage(undefined);
    setImageUrl("");
    setImageError(null);
  }

  useEffect(() => {
    if (
      state.status === "success" &&
      state.savedAt &&
      handled.current !== state.savedAt
    ) {
      handled.current = state.savedAt;
      onSaved(state.message ?? "تم الحفظ.");
    }
  }, [state, onSaved]);

  return (
    <form action={formAction} className="mt-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={labelClass}>
            اسم المنتج
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product?.name}
            placeholder="مثال: بوت التذاكر"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="tagline" className={labelClass}>
            الوصف المختصر
          </label>
          <input
            id="tagline"
            name="tagline"
            defaultValue={product?.tagline}
            placeholder="جملة قصيرة توضح فائدة المنتج"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>
            الوصف التفصيلي (اختياري)
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={2000}
            defaultValue={product?.description}
            placeholder="اشرح ما يقدمه المنتج، مميزاته، ولمن يناسب — يظهر في نافذة «تفاصيل المنتج»."
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-accent/60 focus:bg-white/[0.06]"
          />
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            الفئة
          </label>
          <input
            id="category"
            name="category"
            list="product-categories"
            defaultValue={product?.category}
            placeholder="حماية"
            className={inputClass}
          />
          <datalist id="product-categories">
            {categorySuggestions.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="price" className={labelClass}>
            السعر (ر.س)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step="any"
            required
            defaultValue={product?.price ?? ""}
            placeholder="99"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="emoji" className={labelClass}>
            الأيقونة (إيموجي)
          </label>
          <input
            id="emoji"
            name="emoji"
            maxLength={8}
            defaultValue={product?.emoji}
            placeholder="🎟️"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="badge" className={labelClass}>
            شارة مميزة (اختياري)
          </label>
          <input
            id="badge"
            name="badge"
            maxLength={24}
            defaultValue={product?.badge}
            placeholder="الأكثر طلباً"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <p className={labelClass}>صورة المنتج (اختياري)</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] text-white/25">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt="معاينة صورة المنتج"
                  className="size-full object-cover"
                />
              ) : (
                <ImageIcon className="size-7" />
              )}
            </span>

            <div className="min-w-[12rem] flex-1">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={imageBusy}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 text-xs font-bold text-accent transition hover:bg-accent/15 disabled:opacity-50"
                >
                  <ImageIcon className="size-4" />
                  {imageBusy ? "جارٍ معالجة الصورة..." : "رفع صورة من الجهاز"}
                </button>
                {image && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-bold text-white/50 transition hover:border-red-400/40 hover:text-red-300"
                  >
                    <TrashIcon className="size-3.5" />
                    إزالة
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>

              <input
                value={imageUrl}
                onChange={(event) => handleUrl(event.target.value)}
                dir="ltr"
                placeholder="أو ضع رابط صورة https://..."
                className={`${inputClass} mt-2 h-10`}
              />

              <p className="mt-1.5 text-[11px] leading-5 text-white/30">
                PNG أو JPG أو WebP حتى 8MB — تُضغط الصورة تلقائياً. يفضل مقاس
                أفقي.
              </p>
              {imageError && (
                <p className="mt-1 text-[11px] font-semibold text-red-300">
                  {imageError}
                </p>
              )}
            </div>
          </div>
          <input type="hidden" name="image" value={image ?? ""} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="features" className={labelClass}>
            الميزات — كل ميزة في سطر
          </label>
          <textarea
            id="features"
            name="features"
            rows={4}
            defaultValue={product?.features.join("\n")}
            placeholder={"تذاكر بأزرار وقوائم\nلوحة إدارة وتقارير\nإشعارات تلقائية"}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-accent/60 focus:bg-white/[0.06]"
          />
        </div>
      </div>

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300"
        >
          <AlertIcon className="size-4 shrink-0" />
          {state.message}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-white/[0.06] pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-xl border border-white/10 px-5 text-sm font-bold text-white/60 transition hover:text-white"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-xl bg-accent px-6 text-sm font-extrabold text-[#04242a] transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "جارٍ الحفظ..." : product ? "حفظ التعديلات" : "إضافة المنتج"}
        </button>
      </div>
    </form>
  );
}

function ProductThumb({
  product,
  className = "size-10 text-lg",
}: {
  product: Product;
  className?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-xl border border-accent/15 bg-accent/10 ${className}`}
    >
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product.name}
          className="size-full object-cover"
        />
      ) : (
        product.emoji
      )}
    </span>
  );
}

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

async function imageFileToDataUrl(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("صيغة غير مدعومة، استخدم PNG أو JPG أو WebP.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("حجم الصورة كبير جداً، الحد الأقصى 8 ميجابايت.");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const element = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("تعذر قراءة الصورة، جرب صورة أخرى."));
      img.src = objectUrl;
    });

    const maxSide = 900;
    const scale = Math.min(
      1,
      maxSide / Math.max(element.naturalWidth, element.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(element.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(element.naturalHeight * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("تعذر معالجة الصورة.");
    context.drawImage(element, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/webp", 0.8);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
