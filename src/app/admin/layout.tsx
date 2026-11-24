import type { Metadata, Viewport } from "next";
import { asset } from "@/lib/utils";

/**
 * Yönetim paneli ayrı bir "uygulama" gibi davranır: kendi manifest dosyası vardır,
 * telefona yüklenebilir ve arama motorlarına kapalıdır.
 */
export const metadata: Metadata = {
  title: "Yönetim Paneli",
  description: "Nexus üyelik başvurularını yönetme paneli.",
  robots: { index: false, follow: false },
  manifest: asset("/admin/manifest.webmanifest"),
  appleWebApp: { capable: true, title: "Nexus Panel", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: asset("/icons/admin-192.png"), sizes: "192x192", type: "image/png" }],
    apple: [{ url: asset("/icons/apple-touch-icon.png"), sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#011e45",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
