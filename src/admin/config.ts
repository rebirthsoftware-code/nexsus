/**
 * Yönetim panelinin bağlantı ayarları.
 *
 * Buradaki üç değer HERKESE AÇIK değerlerdir; siteyi açan herkesin tarayıcısına zaten gönderilir
 * ve koruma veritabanındaki erişim kurallarıyla sağlanır. Bu yüzden doğrudan bu dosyaya yazılabilir.
 *
 * !!! Gizli değerleri (Supabase "service_role" anahtarı, VAPID_PRIVATE_KEY, veritabanı şifresi)
 *     ASLA bu dosyaya ya da depoya yazmayın. Onlar yalnızca Supabase paneline girilir.
 *
 * Alanlar boşsa panel örnek verilerle "demo" modunda çalışır.
 * Aynı değerler ortam değişkeniyle de verilebilir (NEXT_PUBLIC_...); doluysa o kullanılır.
 * Site Vercel'de yayınlanıyorsa ve Supabase, Vercel'in "Storage" bölümünden eklendiyse bu değişkenler
 * kendiliğinden tanımlanır; bu dosyaya bir şey yazmak gerekmez.
 */
const settings = {
  /** Supabase → Project Settings → API → Project URL (ör. "https://abcd1234.supabase.co") */
  supabaseUrl: "",
  /** Supabase → Project Settings → API Keys → "publishable" (eski adıyla "anon" / "public") anahtarı */
  supabaseAnonKey: "",
  /** Bildirim sunucusunun AÇIK anahtarı ("npm run vapid" çıktısındaki VAPID_PUBLIC_KEY) */
  vapidPublicKey: "",
};

export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || settings.supabaseUrl).replace(/\/+$/, "");
/**
 * Herkese açık anahtar. Supabase bu anahtara eskiden "anon", yeni projelerde "publishable" diyor;
 * Vercel'in Supabase eklentisi de yeni adı kullanıyor. Hangisi tanımlıysa o kullanılır.
 */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  settings.supabaseAnonKey;
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || settings.vapidPublicKey;

/** Veritabanı bağlantısı tanımlı mı? Tanımlı değilse panel demo modunda çalışır. */
export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
