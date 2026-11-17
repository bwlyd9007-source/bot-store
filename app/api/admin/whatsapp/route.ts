import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getWhatsAppQrImage, getWhatsAppStatus } from "@/lib/whatsapp";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("format") === "qr") {
    const qr = await getWhatsAppQrImage();
    if (!qr) {
      return NextResponse.json({ error: "unavailable" }, { status: 404 });
    }
    return new NextResponse(qr.body, {
      headers: {
        "Content-Type": qr.contentType,
        "Cache-Control": "no-store",
      },
    });
  }

  const status = await getWhatsAppStatus();
  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}
