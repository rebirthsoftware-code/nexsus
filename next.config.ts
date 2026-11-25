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

const nextConfig: NextConfig = {
  output: "export",
  ...(siteUrl ? { env: { NEXT_PUBLIC_SITE_URL: siteUrl } } : {}),
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
