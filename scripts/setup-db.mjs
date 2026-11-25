/**
 * Veritabanı tablolarını kendiliğinden kurar.
 *
 * Site Vercel'de derlenirken çalışır ("npm run build" öncesi). Vercel projesine bir Supabase
 * veritabanı bağlandıysa Vercel bağlantı bilgisini ortam değişkeni olarak verir; bu betik o
 * bilgiyle bağlanıp supabase/schema.sql dosyasını uygular. Böylece tabloları elle kurmak gerekmez.
 *
 * - Veritabanı bağlı değilse hiçbir şey yapmaz (ör. GitHub Pages derlemesi).
 * - Şema dosyası değişmediyse tekrar uygulamaz.
 * - Bir sorun çıkarsa siteyi yayından alıkoymaz; ne olduğunu derleme günlüğüne yazar.
 * - Bağlantı adresini ve şifreyi asla günlüğe yazmaz.
 */
import { createHash } from "node:crypto";
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
      return { client, host: base.host, mode: attempt.label };
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
    // Şema daha önce bu sürümle uygulandıysa tekrar çalıştırma (sürüm, tablo açıklamasında tutulur)
    const { rows } = await client.query("select obj_description(to_regclass('public.applications')) as v");
    if (rows[0]?.v === version) {
      log("Tablolar güncel, değişiklik gerekmedi.");
      return;
    }
    const firstTime = rows[0]?.v == null;
    // Tek sorguda gönderilir; PostgreSQL bunu tek işlem olarak çalıştırır: ya hepsi uygulanır ya hiçbiri
    await client.query(`${schema}\ncomment on table public.applications is '${version}';`);
    const check = await client.query(
      "select count(*)::int as n from information_schema.tables where table_schema = 'public' and table_name in ('applications', 'admins', 'push_subscriptions')"
    );
    log(`${firstTime ? "Tablolar kuruldu" : "Tablolar güncellendi"} (${check.rows[0].n}/3 tablo hazır).`);
    const team = await client.query("select count(*)::int as n from public.admins");
    if (team.rows[0].n === 0) log("Not: Yönetim ekibi henüz boş. Panele girebilmek için ekip üyeleri eklenmeli (bkz. docs/YONETIM-PANELI-KURULUM.md, 3. adım).");
  } catch (error) {
    log(`UYARI: Tablolar kurulamadı: ${error.message}`);
    log("Site yine de yayınlanacak. Şema, Supabase SQL Editor'den elle de çalıştırılabilir (supabase/schema.sql).");
  } finally {
    await client.end().catch(() => {});
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
