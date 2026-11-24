import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Statik dışa aktarımda bu dosya derleme anında üretilir
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Önizleme sürümünde site arama motorlarına kapalıdır
  if (site.preview) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
