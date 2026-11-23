import type { MetadataRoute } from "next";
import { site, navLinks } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [...navLinks.map((l) => l.href), "/basvuru"];
  return routes.map((path) => ({
    url: `${site.url}${path === "/" ? "" : path}`,
    changeFrequency: path === "/etkinlikler" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
