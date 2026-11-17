import { phoneForWhatsApp } from "@/lib/customer";

function envValue(value: string | undefined) {
  return (value ?? "").trim().replace(/^"(.*)"$/, "$1").trim();
}

function greenApiConfig() {
  const idInstance = envValue(process.env.GREENAPI_ID_INSTANCE);
  const apiToken = envValue(process.env.GREENAPI_API_TOKEN);
  if (!idInstance || !apiToken) return null;
  const apiUrl = (
    envValue(process.env.GREENAPI_API_URL) || "https://7107.api.greenapi.com"
  ).replace(/\/+$/, "");
  return { idInstance, apiToken, apiUrl };
}

function metaConfig() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  return token && phoneId ? { token, phoneId } : null;
}

export function isWhatsAppApiConfigured() {
  return Boolean(greenApiConfig() || metaConfig());
}

export type WhatsAppStatus = {
  provider: "green" | "meta" | "none";
  state: string | null;
  phone: string | null;
};

async function greenApiFetch(
  label: string,
  url: string,
  retries = 1,
): Promise<Response | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (response.status === 429 && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return greenApiFetch(label, url, retries - 1);
    }
    if (!response.ok) {
      console.error(`Green API ${label} responded with HTTP ${response.status}`);
      return null;
    }
    return response;
  } catch (error) {
    console.error(
      `Green API ${label} request failed:`,
      error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    );
    return null;
  }
}

export async function getWhatsAppStatus(): Promise<WhatsAppStatus> {
  const green = greenApiConfig();
  if (!green) {
    return {
      provider: metaConfig() ? "meta" : "none",
      state: null,
      phone: null,
    };
  }

  const base = `${green.apiUrl}/waInstance${green.idInstance}`;
  const stateResponse = await greenApiFetch(
    "getStateInstance",
    `${base}/getStateInstance/${green.apiToken}`,
  );
  if (!stateResponse) {
    return { provider: "green", state: "unreachable", phone: null };
  }

  const stateJson = (await stateResponse.json().catch(() => null)) as {
    stateInstance?: string;
  } | null;
  const state = stateJson?.stateInstance ?? "unknown";

  let phone: string | null = null;
  if (state === "authorized") {
    const settingsResponse = await greenApiFetch(
      "getSettings",
      `${base}/getSettings/${green.apiToken}`,
    );
    const settingsJson = (await settingsResponse?.json().catch(() => null)) as {
      wid?: string;
    } | null;
    const wid = typeof settingsJson?.wid === "string" ? settingsJson.wid : "";
    phone = wid.split("@")[0].replace(/\D/g, "") || null;
  }

  return { provider: "green", state, phone };
}

export async function getWhatsAppQrImage() {
  const green = greenApiConfig();
  if (!green) return null;

  const response = await greenApiFetch(
    "qr",
    `${green.apiUrl}/waInstance${green.idInstance}/qr/${green.apiToken}`,
  );
  if (!response) return null;

  // Green API يعيد {"type":"qrCode","message":"<base64 PNG>"}
  try {
    const data = (await response.json()) as {
      type?: string;
      message?: string;
    };
    if (data?.type !== "qrCode" || typeof data.message !== "string") {
      return null;
    }
    return {
      body: Buffer.from(data.message, "base64"),
      contentType: "image/png",
    };
  } catch {
    return null;
  }
}

type SendResult = {
  sent: boolean;
  reason?: "not-configured" | "failed";
};

export async function sendWhatsAppOtp(
  phone: string,
  code: string,
  text: string,
): Promise<SendResult> {
  const green = greenApiConfig();
  if (green) return sendViaGreenApi(green, phone, text);

  const meta = metaConfig();
  if (meta) return sendViaMetaCloud(meta, phone, code, text);

  return { sent: false, reason: "not-configured" };
}

async function sendViaGreenApi(
  config: NonNullable<ReturnType<typeof greenApiConfig>>,
  phone: string,
  text: string,
): Promise<SendResult> {
  const chatId = `${phoneForWhatsApp(phone)}@c.us`;
  const url = `${config.apiUrl}/waInstance${config.idInstance}/sendMessage/${config.apiToken}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message: text }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error("Green API OTP send failed:", response.status);
      return { sent: false, reason: "failed" };
    }
    const data = (await response.json().catch(() => null)) as {
      idMessage?: string;
      code?: number;
      description?: string;
    } | null;
    if (!data?.idMessage) {
      console.error(
        "Green API OTP send rejected:",
        data?.code,
        data?.description,
      );
      return { sent: false, reason: "failed" };
    }
    return { sent: true };
  } catch (error) {
    console.error(
      "Green API OTP send error:",
      error instanceof Error ? error.message : error,
    );
    return { sent: false, reason: "failed" };
  }
}

async function sendViaMetaCloud(
  config: NonNullable<ReturnType<typeof metaConfig>>,
  phone: string,
  code: string,
  text: string,
): Promise<SendResult> {
  const version = process.env.WHATSAPP_API_VERSION || "v22.0";
  const templateName = process.env.WHATSAPP_OTP_TEMPLATE;

  const body = templateName
    ? {
        messaging_product: "whatsapp",
        to: phoneForWhatsApp(phone),
        type: "template",
        template: {
          name: templateName,
          language: {
            code: process.env.WHATSAPP_OTP_TEMPLATE_LANG || "ar",
          },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: code }],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to: phoneForWhatsApp(phone),
        type: "text",
        text: { body: text, preview_url: false },
      };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${version}/${config.phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      },
    );

    return response.ok ? { sent: true } : { sent: false, reason: "failed" };
  } catch {
    return { sent: false, reason: "failed" };
  }
}
