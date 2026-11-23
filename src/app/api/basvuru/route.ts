import { NextResponse } from "next/server";
import { applicationSchema } from "@/lib/schema";

/**
 * Üyelik başvurusu ucu.
 * - Gelen veriyi sunucu tarafında tekrar doğrular (istemciye güvenilmez).
 * - APPLICATION_WEBHOOK_URL tanımlıysa başvuruyu oraya iletir
 *   (ör. Google Apps Script → Google Sheets, Make/Zapier, Discord webhook).
 * - Tanımlı değilse yalnızca sunucu günlüğüne yazar; geliştirme için yeterlidir.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Form bilgileri eksik veya hatalı", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // Bot koruması: gizli alan doluysa sessizce "başarılı" dön.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { website: _ignored, ...application } = parsed.data;
  void _ignored;
  const payload = { ...application, submittedAt: new Date().toISOString(), source: "nexus-web" };

  const webhook = process.env.APPLICATION_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Webhook ${res.status}`);
    } catch (err) {
      console.error("[basvuru] webhook hatası:", err);
      return NextResponse.json(
        { ok: false, message: "Başvuru şu an kaydedilemedi, lütfen biraz sonra tekrar dene." },
        { status: 502 }
      );
    }
  } else {
    console.info("[basvuru] yeni başvuru (webhook tanımlı değil):", payload);
  }

  return NextResponse.json({ ok: true });
}
