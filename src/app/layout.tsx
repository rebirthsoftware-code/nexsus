import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { site } from "@/content/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-space-grotesk", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.fullName} | ${site.university}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: ["Nexus", "Karabük Üniversitesi", "öğrenci kulübü", "KBÜ kulüp", "İŞKUR sertifika", "networking", "kariyer"],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: site.fullName,
    title: `${site.fullName} | ${site.university}`,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title: site.fullName, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${inter.variable} ${spaceGrotesk.variable} h-full`}>
      <head>
        {/* Scroll animasyonları için JS'in aktif olduğunu işaretler; JS yoksa içerik gizlenmez */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-js','')" }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a href="#icerik" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-night-900">
          İçeriğe atla
        </a>
        <Navbar />
        <main id="icerik" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
