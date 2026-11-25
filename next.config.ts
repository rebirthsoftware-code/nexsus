import type { NextConfig } from "next";

/**
 * Site tamamen statik olarak dışa aktarılır (out/ klasörü) ve GitHub Pages'te yayınlanır.
 * Proje sayfalarında adres https://<kullanıcı>.github.io/<depo>/ olduğundan alt yol (basePath)
 * yayın sırasında NEXT_PUBLIC_BASE_PATH ile verilir; yerelde ve özel alan adında boştur.
 * Aynı değer public/ altındaki dosyaların yolunu kurmak için de kullanılır (bkz. lib/utils → asset).
 */
/**
 * Sitenin yayın adresi (paylaşım görseli, site haritası vb. için).
 * GitHub Pages yayınında iş akışı NEXT_PUBLIC_SITE_URL verir; Vercel'de ise Vercel'in
 * kendiliğinden tanımladığı üretim adresi kullanılır. Özel alan adı için NEXT_PUBLIC_SITE_URL tanımlayın.
 */
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : "");

/**
 * Veritabanının HERKESE AÇIK bağlantı değerleri. Vercel'in Supabase eklentisi bunları farklı
 * adlarla verebildiği için bilinen bütün adlar tek ada indirgenir. Yalnızca herkese açık olan
 * adres ve "publishable / anon" anahtarı alınır; gizli anahtarlar (service_role, secret) ASLA eklenmez.
 */
const e = process.env;
const supabaseUrl = e.NEXT_PUBLIC_SUPABASE_URL || e.SUPABASE_URL || "";
const supabaseKey =
  e.NEXT_PUBLIC_SUPABASE_ANON_KEY || e.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || e.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || e.SUPABASE_PUBLISHABLE_KEY || e.SUPABASE_ANON_KEY || "";

const publicEnv: Record<string, string> = {
  ...(siteUrl ? { NEXT_PUBLIC_SITE_URL: siteUrl } : {}),
  ...(supabaseUrl && supabaseKey ? { NEXT_PUBLIC_SUPABASE_URL: supabaseUrl, NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey } : {}),
};

const nextConfig: NextConfig = {
  output: "export",
  env: publicEnv,
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
