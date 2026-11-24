import type { NextConfig } from "next";

/**
 * Site tamamen statik olarak dışa aktarılır (out/ klasörü) ve GitHub Pages'te yayınlanır.
 * Proje sayfalarında adres https://<kullanıcı>.github.io/<depo>/ olduğundan alt yol (basePath)
 * yayın sırasında PAGES_BASE_PATH ile verilir; yerelde ve özel alan adında boştur.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.PAGES_BASE_PATH || "",
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
