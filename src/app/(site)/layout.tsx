import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { site } from "@/content/site";

/** Herkese açık sayfaların ortak çerçevesi: menü, alt bilgi ve önizleme şeridi. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#icerik" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:border-2 focus:border-ink focus:bg-lime focus:px-4 focus:py-2 focus:font-bold">
        İçeriğe atla
      </a>
      {site.preview && (
        <p className="label-mono border-b-2 border-ink bg-sun px-3 py-1 text-center text-[0.62rem] tracking-[0.08em]">
          Önizleme sürümü<span className="max-sm:hidden"> · ekip, etkinlik ve duyurular örnektir</span>
          <span className="sm:hidden"> · içerikler örnektir</span>
        </p>
      )}
      <Navbar />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
