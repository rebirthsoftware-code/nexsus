/**
 * Veritabanı tablolarını kendiliğinden kurar.
 *
 * Site Vercel'de derlenirken çalışır ("npm run build" öncesi). Vercel projesine bir Supabase
 * veritabanı bağlandıysa Vercel bağlantı bilgisini ortam değişkeni olarak verir; bu betik o
 * bilgiyle bağlanıp supabase/schema.sql dosyasını uygular. Böylece tabloları elle kurmak gerekmez.
 *
 * - Veritabanı bağlı değilse hiçbir şey yapmaz (ör. GitHub Pages derlemesi).
 * - Şema dosyası değişmediyse tekrar uygulamaz.
 * - Panelin "yazılımcı" hesabı yoksa açar. Yazılımcı, yönetim ekibini panelden ekleyip değiştirir.
 *   Hesabın geçici şifresi yalnızca bu derleme günlüğüne yazılır (günlüğü yalnızca Vercel
 *   projesinin sahibi görebilir) ve ilk girişten sonra panelden değiştirilir.
 * - Bir sorun çıkarsa siteyi yayından alıkoymaz; ne olduğunu derleme günlüğüne yazar.
 * - Bağlantı adresini ve şifreyi asla günlüğe yazmaz.
 */
import { createHash, createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

const log = (msg) => console.log(`[veritabanı] ${msg}`);

/** PostgreSQL sürücüsü; yalnızca bir veritabanı bağlıysa yüklenir */
let pg;

/** Vercel'in (ve yaygın kurulumların) verdiği bağlantı adresleri, tercih sırasıyla */
function candidates() {
  const env = process.env;
  const list = [
    ["POSTGRES_URL_NON_POOLING", env.POSTGRES_URL_NON_POOLING],
    ["POSTGRES_URL", env.POSTGRES_URL],
    ["POSTGRES_PRISMA_URL", env.POSTGRES_PRISMA_URL],
    ["DATABASE_URL", env.DATABASE_URL],
  ];
  if (env.POSTGRES_HOST && env.POSTGRES_USER && env.POSTGRES_PASSWORD) {
    const u = new URL("postgres://x");
    u.hostname = env.POSTGRES_HOST;
    u.username = encodeURIComponent(env.POSTGRES_USER);
    u.password = encodeURIComponent(env.POSTGRES_PASSWORD);
    u.pathname = `/${env.POSTGRES_DATABASE || "postgres"}`;
    list.push(["POSTGRES_HOST + POSTGRES_USER", u.toString()]);
  }
  const seen = new Set();
  return list.filter(([, url]) => url && !seen.has(url) && seen.add(url));
}

const CERT_ERRORS = new Set([
  "SELF_SIGNED_CERT_IN_CHAIN",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_GET_ISSUER_CERT",
  "ERR_TLS_CERT_ALTNAME_INVALID",
]);

/**
 * Bağlanır. Önce sunucu sertifikasını tam doğrulayarak dener. Supabase kendi sertifika
 * otoritesini kullandığı için bu doğrulama çoğu ortamda başarısız olur; o durumda bağlantı
 * adresindeki "sslmode=require" ayarının anlamına uyulur: bağlantı şifrelidir ama sertifika
 * doğrulanmaz. Tam doğrulamayı zorunlu kılmak için SUPABASE_CA_CERT (PEM) ve
 * NEXUS_DB_STRICT_TLS=1 tanımlanabilir.
 */
async function connect(connectionString) {
  const url = new URL(connectionString);
  const base = {
    host: url.hostname,
    port: Number(url.port) || 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")) || "postgres",
    connectionTimeoutMillis: 12_000,
    statement_timeout: 60_000,
    application_name: "nexus-kurulum",
  };
  const sslmode = url.searchParams.get("sslmode");
  const attempts =
    sslmode === "disable"
      ? [{ label: "şifresiz (sslmode=disable)", ssl: false }]
      : [
          { label: "sertifika doğrulamalı", ssl: { rejectUnauthorized: true, ...(process.env.SUPABASE_CA_CERT ? { ca: process.env.SUPABASE_CA_CERT } : {}) } },
          ...(process.env.NEXUS_DB_STRICT_TLS === "1" ? [] : [{ label: "şifreli, sertifika doğrulamasız (sslmode=require)", ssl: { rejectUnauthorized: false } }]),
        ];

  let lastError;
  for (const attempt of attempts) {
    const client = new pg.Client({ ...base, ssl: attempt.ssl });
    client.on("error", () => {}); // kopan bağlantı derlemeyi düşürmesin
    try {
      await client.connect();
      return { client, host: base.host, mode: attempt.label, secret: base.password };
    } catch (error) {
      lastError = error;
      await client.end().catch(() => {});
      if (!CERT_ERRORS.has(error.code)) break; // sertifika dışı hata: diğer modu denemek anlamsız
    }
  }
  throw lastError;
}

async function main() {
  const urls = candidates();
  if (!urls.length) {
    log("Bağlı bir veritabanı yok, kurulum atlandı. (Panel demo modunda çalışır.)");
    return;
  }

  // Sürücü yüklenemezse (ör. bağımlılık kurulmamışsa) derlemeyi düşürme
  try {
    pg = (await import("pg")).default;
  } catch {
    log("UYARI: Veritabanı sürücüsü (pg) yüklenemedi; kurulum atlandı.");
    return;
  }

  const schema = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");
  const version = `nexus-schema:${createHash("sha256").update(schema).digest("hex").slice(0, 16)}`;

  let connection;
  for (const [name, url] of urls) {
    try {
      connection = await connect(url);
      log(`${name} ile bağlanıldı (${connection.host}, ${connection.mode}).`);
      break;
    } catch (error) {
      log(`${name} ile bağlanılamadı: ${error.code || error.message}`);
    }
  }
  if (!connection) {
    log("UYARI: Veritabanına bağlanılamadı; tablolar kurulmadı. Site yine de yayınlanacak.");
    return;
  }

  const { client } = connection;
  try {
    let ready = true;
    try {
      // Şema daha önce bu sürümle uygulandıysa tekrar çalıştırma (sürüm, tablo açıklamasında tutulur)
      const { rows } = await client.query("select obj_description(to_regclass('public.applications')) as v");
      if (rows[0]?.v === version) {
        log("Tablolar güncel, değişiklik gerekmedi.");
      } else {
        const firstTime = rows[0]?.v == null;
        // Tek sorguda gönderilir; PostgreSQL bunu tek işlem olarak çalıştırır: ya hepsi uygulanır ya hiçbiri
        await client.query(`${schema}\ncomment on table public.applications is '${version}';`);
        const check = await client.query(
          "select count(*)::int as n from information_schema.tables where table_schema = 'public' and table_name in ('applications', 'admins', 'push_subscriptions')"
        );
        log(`${firstTime ? "Tablolar kuruldu" : "Tablolar güncellendi"} (${check.rows[0].n}/3 tablo hazır).`);
      }
    } catch (error) {
      ready = false;
      log(`UYARI: Tablolar kurulamadı: ${error.message}`);
      log("Site yine de yayınlanacak. Şema, Supabase SQL Editor'den elle de çalıştırılabilir (supabase/schema.sql).");
    }
    if (ready) {
      try {
        await ensureDeveloper(client, connection.secret);
      } catch (error) {
        log(`UYARI: Yazılımcı hesabı hazırlanamadı: ${error.message}`);
      }
    }
  } finally {
    await client.end().catch(() => {});
  }
}

/**
 * Okunması ve yazması kolay geçici şifre: karıştırılan harfler (0/O, 1/l/I) yok. Yaklaşık 80 bit.
 *
 * Şifre rastgele seçilmez; veritabanı bağlantı şifresinden türetilir. Böylece yazılımcı ilk kez
 * girene kadar her derlemede AYNI geçici şifre yazılır (arada yeni bir yayın çıksa da geçerli kalır)
 * ve şifrenin açık hali hiçbir yerde saklanmaz. Bağlantı şifresini bilmeyen biri türetemez.
 */
function temporaryPassword(secret, salt) {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let n = BigInt(`0x${createHmac("sha256", secret).update(`nexus-yazilimci-gecici-sifre:${salt}`).digest("hex")}`);
  const chars = [];
  for (let i = 0; i < 16; i++) {
    chars.push(alphabet[Number(n % BigInt(alphabet.length))]);
    n /= BigInt(alphabet.length);
  }
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join("")).join("-");
}

const setting = async (client, key) => (await client.query("select value from nexus_private.settings where key = $1", [key])).rows[0]?.value ?? null;
const setSetting = (client, key, value) =>
  client.query("insert into nexus_private.settings (key, value) values ($1, $2) on conflict (key) do update set value = excluded.value, updated_at = now()", [key, value]);
const clearSetting = (client, key) => client.query("delete from nexus_private.settings where key = $1", [key]);

/**
 * Panelin yazılımcı hesabını hazırlar.
 *
 * - Hesap yoksa açar. Giriş e-postası NEXUS_DEVELOPER_EMAIL ile değiştirilebilir (gerçek bir
 *   posta kutusu olması gerekmez; hiçbir e-posta gönderilmez).
 * - Şifre: NEXUS_DEVELOPER_PASSWORD tanımlıysa o kullanılır ve günlüğe YAZILMAZ. Tanımlı değilse
 *   geçici bir şifre üretilip günlüğe yazılır; yazılımcı ilk kez girene kadar her derlemede aynı
 *   şifre yeniden yazılır, girdikten sonra bir daha yazılmaz.
 * - Şifre unutulursa: Vercel'de NEXUS_DEVELOPER_RESET değişkenine yeni bir değer (ör. bugünün tarihi)
 *   yazıp yeniden yayınlamak yeni bir geçici şifre üretir. Aynı değer ikinci kez sıfırlamaz.
 */
async function ensureDeveloper(client, secret) {
  const email = (process.env.NEXUS_DEVELOPER_EMAIL || "yazilimci@nexus.panel").trim().toLowerCase();
  const chosen = process.env.NEXUS_DEVELOPER_PASSWORD || "";
  const resetToken = (process.env.NEXUS_DEVELOPER_RESET || "").trim();

  const existing = (
    await client.query(
      "select a.user_id, u.email::text as email from public.admins a join auth.users u on u.id = a.user_id where a.role = 'yazilimci' order by a.created_at limit 1"
    )
  ).rows[0];

  let reason = null;
  if (!existing) reason = "created";
  else if (resetToken && resetToken !== (await setting(client, "developer_reset_token"))) reason = "reset";
  else if ((await setting(client, "developer_first_login_pending")) === "1" && !chosen) reason = "pending";

  if (!reason) {
    const team = (await client.query("select count(*)::int as n from public.admins where role <> 'yazilimci'")).rows[0].n;
    log(`Yazılımcı hesabı hazır. Yönetim ekibi: ${team}/3 kişi.`);
    return;
  }
  if (chosen && chosen.length < 8) {
    log("UYARI: NEXUS_DEVELOPER_PASSWORD en az 8 karakter olmalı; yazılımcı hesabı bu derlemede değiştirilmedi.");
    return;
  }

  // Sıfırlama isteği yoksa önceki sıfırlamanın değeri kullanılır: geçici şifre derlemeler arasında değişmez
  const salt = resetToken || (await setting(client, "developer_reset_token")) || "";
  let login = existing?.email || email;
  let password = chosen;
  await client.query("begin");
  try {
    if (existing) {
      password ||= temporaryPassword(secret, `${existing.user_id}:${salt}`);
      await client.query("select nexus_private.set_password($1, $2)", [existing.user_id, password]);
    } else {
      const user = (await client.query("select id from auth.users where lower(email) = $1", [email])).rows[0];
      let id = user?.id;
      if (!id) id = (await client.query("select nexus_private.create_account($1, $2) as id", [email, `${temporaryPassword(secret, "ilk")}-x`])).rows[0].id;
      password ||= temporaryPassword(secret, `${id}:${salt}`);
      await client.query("select nexus_private.set_password($1, $2)", [id, password]);
      await client.query("insert into public.admins (user_id, full_name, role) values ($1, $2, 'yazilimci')", [id, (process.env.NEXUS_DEVELOPER_NAME || "Rebirth Software").trim().slice(0, 80) || "Yazılımcı"]);
      login = email;
    }
    if (chosen) {
      await clearSetting(client, "developer_first_login_pending");
      await clearSetting(client, "developer_temp_password");
    } else {
      await setSetting(client, "developer_first_login_pending", "1");
      await setSetting(client, "developer_temp_password", "1");
    }
    if (resetToken) await setSetting(client, "developer_reset_token", resetToken);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  }

  // Açılan hesapla gerçekten giriş yapılabiliyor mu? (Sonuç gizli bilgi içermez; dışarıdan da okunabilir.)
  const test = await loginSelfTest(login, password);
  await setSetting(client, "account_selftest", test);
  const title = reason === "created" ? "PANELİN YAZILIMCI HESABI AÇILDI" : reason === "reset" ? "YAZILIMCI ŞİFRESİ SIFIRLANDI" : "YAZILIMCI HESABI İLK GİRİŞİ BEKLİYOR";
  const lines = [
    "",
    "==================================================================",
    `  ${title}`,
    "",
    `  Giriş e-postası : ${login}`,
    chosen ? "  Şifre           : NEXUS_DEVELOPER_PASSWORD değişkenindeki şifre" : `  Geçici şifre    : ${password}`,
    "",
    "  Panele (/admin) bu bilgilerle gir. \"Ekip yönetimi\" bölümünden başkanı ve",
    "  başkan yardımcılarını ekle.",
    ...(chosen ? [] : ["  İlk girişten sonra Ayarlar bölümünden kendi şifreni belirle.", "  Sen panele girene kadar bu bilgi her yayında buraya yeniden yazılır; girdikten sonra yazılmaz."]),
    test === "ok" ? "  Giriş denemesi  : başarılı" : test === "skipped" ? "  Giriş denemesi  : atlandı (Supabase adresi bu derlemede tanımlı değil)" : `  Giriş denemesi  : BAŞARISIZ (${test})`,
    "==================================================================",
    "",
  ];
  for (const line of lines) console.log(line ? `[veritabanı] ${line}` : "");
}

/** Supabase giriş servisine gerçek bir şifreli giriş dener; sonucu kısa bir kodla döndürür. */
async function loginSelfTest(email, password) {
  const env = process.env;
  const base = (env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || "";
  if (!base || !key) return "skipped";
  try {
    const response = await fetch(`${base}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(15_000),
    });
    if (response.ok) return "ok";
    const body = await response.json().catch(() => ({}));
    return `failed:${response.status}:${String(body.error_code || body.code || body.error || "").slice(0, 40)}`;
  } catch (error) {
    return `failed:network:${String(error.name || "").slice(0, 30)}`;
  }
}

// Hiçbir koşulda derlemeyi durdurma
const guard = setTimeout(() => {
  log("UYARI: Kurulum zaman aşımına uğradı, atlandı.");
  process.exit(0);
}, 90_000);
main()
  .catch((error) => log(`UYARI: Beklenmeyen hata: ${error.message}`))
  .finally(() => {
    clearTimeout(guard);
    process.exit(0);
  });
