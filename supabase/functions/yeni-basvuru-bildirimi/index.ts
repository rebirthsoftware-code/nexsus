/**
 * Nexus - yeni başvuru bildirimi (Supabase Edge Function)
 *
 * "applications" tablosuna yeni satır eklendiğinde bir veritabanı webhook'u bu fonksiyonu çağırır.
 * Fonksiyon, yöneticilerin kayıtlı cihazlarına Web Push bildirimi gönderir; böylece
 * panel kapalıyken de telefona bildirim düşer.
 *
 * Gerekli gizli değişkenler (Edge Functions > Secrets):
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  -> "npm run vapid" ile üretilir
 *   VAPID_SUBJECT                        -> "mailto:kulup@ornek.com" biçiminde bir iletişim adresi
 * SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY Supabase tarafından kendiliğinden sağlanır.
 *
 * Dış kütüphane kullanılmaz: şifreleme tarayıcı standardı Web Crypto ile yapılır
 * (VAPID: RFC 8292, ileti şifreleme: RFC 8291 "aes128gcm").
 */

// ---------- Base64url ve bayt yardımcıları ----------

export function b64urlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function bytesToB64url(bytes: Uint8Array): string {
  let raw = "";
  for (const b of bytes) raw += String.fromCharCode(b);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function concat(...parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(new ArrayBuffer(parts.reduce((n, p) => n + p.length, 0)));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

const utf8 = (s: string) => new TextEncoder().encode(s) as Uint8Array<ArrayBuffer>;

async function hkdf(salt: Uint8Array<ArrayBuffer>, ikm: Uint8Array<ArrayBuffer>, info: Uint8Array<ArrayBuffer>, length: number) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, length * 8));
}

// ---------- VAPID (sunucunun kimliğini kanıtlayan imzalı belirteç) ----------

export type Vapid = { publicKey: string; privateKey: string; subject: string };

export async function vapidAuthorization(endpoint: string, vapid: Vapid, now = Date.now()): Promise<string> {
  const pub = b64urlToBytes(vapid.publicKey); // 65 bayt: 0x04 || X || Y
  const key = await crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", d: vapid.privateKey, x: bytesToB64url(pub.slice(1, 33)), y: bytesToB64url(pub.slice(33, 65)), ext: true },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  const header = bytesToB64url(utf8(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = bytesToB64url(utf8(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(now / 1000) + 12 * 3600, sub: vapid.subject })));
  const signature = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, utf8(`${header}.${claims}`)));
  return `vapid t=${header}.${claims}.${bytesToB64url(signature)}, k=${vapid.publicKey}`;
}

// ---------- İleti şifreleme (RFC 8291, aes128gcm) ----------

export type Subscription = { endpoint: string; p256dh: string; auth: string };

export async function encryptPayload(subscription: Pick<Subscription, "p256dh" | "auth">, plaintext: string): Promise<Uint8Array<ArrayBuffer>> {
  const clientPublic = b64urlToBytes(subscription.p256dh);
  const authSecret = b64urlToBytes(subscription.auth);

  // Her ileti için tek kullanımlık anahtar çifti
  const local = (await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"])) as CryptoKeyPair;
  const localPublic = new Uint8Array(await crypto.subtle.exportKey("raw", local.publicKey));
  const clientKey = await crypto.subtle.importKey("raw", clientPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: clientKey }, local.privateKey, 256));

  const ikm = await hkdf(authSecret, shared, concat(utf8("WebPush: info\0"), clientPublic, localPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
  const contentKey = await hkdf(salt, ikm, utf8("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, utf8("Content-Encoding: nonce\0"), 12);

  const aesKey = await crypto.subtle.importKey("raw", contentKey, "AES-GCM", false, ["encrypt"]);
  // 0x02: "bu son kayıt" işareti
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, concat(utf8(plaintext), new Uint8Array([2]))));

  // Başlık: salt(16) | kayıt boyutu(4) | anahtar uzunluğu(1) | sunucu açık anahtarı(65)
  const recordSize = new Uint8Array([0, 0, 16, 0]); // 4096
  return concat(salt, recordSize, new Uint8Array([localPublic.length]), localPublic, ciphertext);
}

/** Tek bir cihaza bildirim gönderir. 404/410 dönerse abonelik artık geçersizdir. */
export async function sendPush(subscription: Subscription, payload: string, vapid: Vapid): Promise<number> {
  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: await vapidAuthorization(subscription.endpoint, vapid),
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "86400",
      Urgency: "high",
    },
    body: await encryptPayload(subscription, payload),
  });
  return response.status;
}

// ---------- İstek işleyici ----------

type Env = { get(name: string): string | undefined };

async function handle(request: Request, env: Env): Promise<Response> {
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  if (request.method !== "POST") return json({ error: "Yalnızca POST" }, 405);

  const url = env.get("SUPABASE_URL");
  const serviceKey = env.get("SUPABASE_SERVICE_ROLE_KEY");
  const vapid: Vapid = { publicKey: env.get("VAPID_PUBLIC_KEY") ?? "", privateKey: env.get("VAPID_PRIVATE_KEY") ?? "", subject: env.get("VAPID_SUBJECT") ?? "" };
  if (!url || !serviceKey || !vapid.publicKey || !vapid.privateKey || !vapid.subject) return json({ error: "Eksik ortam değişkeni" }, 500);

  const body = await request.json().catch(() => null);
  const id = body?.record?.id;
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "Geçersiz istek" }, 400);

  const db = (path: string, init: RequestInit = {}) =>
    fetch(`${url}/rest/v1/${path}`, { ...init, headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", ...init.headers } });

  // Gelen veriye güvenme: başvuruyu veritabanından oku ve "bildirildi" olarak işaretle.
  // Aynı başvuru için ikinci çağrı (ya da uydurma bir istek) hiçbir satırı güncelleyemez ve bildirim gitmez.
  const claimed = await db(`applications?id=eq.${id}&notified=eq.false&select=id,full_name,department`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ notified: true }),
  });
  const rows = claimed.ok ? ((await claimed.json()) as Array<{ id: string; full_name: string; department: string }>) : [];
  if (!rows.length) return json({ sent: 0, skipped: true });
  const application = rows[0];

  const subs = await db("push_subscriptions?select=endpoint,p256dh,auth");
  const subscriptions = subs.ok ? ((await subs.json()) as Subscription[]) : [];
  const payload = JSON.stringify({ title: "Yeni üyelik başvurusu", body: `${application.full_name} · ${application.department}`, id: application.id });

  let sent = 0;
  await Promise.all(
    subscriptions.map(async (s) => {
      try {
        const status = await sendPush(s, payload, vapid);
        if (status >= 200 && status < 300) sent++;
        // Abonelik iptal edilmiş ya da süresi dolmuş: kaydı temizle
        else if (status === 404 || status === 410) await db(`push_subscriptions?endpoint=eq.${encodeURIComponent(s.endpoint)}`, { method: "DELETE" });
      } catch {
        /* tek bir cihazdaki hata diğerlerini engellemesin */
      }
    })
  );
  return json({ sent, total: subscriptions.length });
}

// Supabase (Deno) üzerinde çalışırken sunucuyu başlat. Yerel testlerde bu blok atlanır.
const deno = (globalThis as { Deno?: { serve(handler: (request: Request) => Promise<Response>): void; env: Env } }).Deno;
if (deno) deno.serve((request) => handle(request, deno.env));

export { handle };
