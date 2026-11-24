import type { NextConfig } from "next";

/**
 * Site tamamen statik olarak dışa aktarılır (out/ klasörü) ve GitHub Pages'te yayınlanır.
 * Proje sayfalarında adres https://<kullanıcı>.github.io/<depo>/ olduğundan alt yol (basePath)
 * yayın sırasında NEXT_PUBLIC_BASE_PATH ile verilir; yerelde ve özel alan adında boştur.
 * Aynı değer public/ altındaki dosyaların yolunu kurmak için de kullanılır (bkz. lib/utils → asset).
 */
const nextConfig: NextConfig = {
  output: "export",
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
