import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-display-face", display: "swap" });
const body = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["italic"], variable: "--font-serif-face", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-mono-face", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: ["Nexus", "Karabük Üniversitesi", "öğrenci kulübü", "KBÜ kulüp", "İŞKUR sertifika", "kariyer", "öğrenci topluluğu"],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: site.fullName,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    images: [{ url: `${site.url}/og.png`, width: 1200, height: 630, alt: `${site.name} | ${site.tagline}` }],
  },
  twitter: { card: "summary_large_image", title: site.fullName, description: site.description, images: [`${site.url}/og.png`] },
  // Önizleme sürümü arama motorlarına kapalıdır (bkz. src/content/site.ts → preview)
  robots: site.preview ? { index: false, follow: false } : { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f5f2ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${display.variable} ${body.variable} ${serif.variable} ${mono.variable} h-full`}>
      <head>
        {/* Scroll animasyonları için JS'in aktif olduğunu işaretler; JS yoksa içerik gizlenmez */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-js','')" }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
