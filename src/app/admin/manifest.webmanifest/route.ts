import { asset } from "@/lib/utils";

// Statik dışa aktarımda bu dosya derleme anında üretilir
export const dynamic = "force-static";

/**
 * Yönetim panelinin uygulama manifesti. Panelin telefona ya da bilgisayara
 * "uygulama" olarak yüklenebilmesini sağlar. Adresler yayın alt yoluna göre kurulur.
 */
export function GET() {
  const manifest = {
    id: asset("/admin/"),
    name: "Nexus Yönetim Paneli",
    short_name: "Nexus Panel",
    description: "Nexus üyelik başvurularını yönet, yeni başvurularda bildirim al.",
    lang: "tr",
    start_url: asset("/admin/"),
    scope: asset("/admin/"),
    display: "standalone",
    orientation: "portrait",
    background_color: "#011e45",
    theme_color: "#011e45",
    icons: [
      { src: asset("/icons/admin-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: asset("/icons/admin-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: asset("/icons/admin-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { "Content-Type": "application/manifest+json; charset=utf-8" } });
}
