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
      <Navbar />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <Footer />
      {site.preview && (
        <p className="label-mono pointer-events-none fixed bottom-3 left-1/2 z-30 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 rounded-full border-2 border-ink bg-sun px-3 py-1.5 text-center shadow-hard-sm max-sm:text-[0.6rem] max-sm:tracking-[0.04em]">
          Önizleme · ekip, etkinlik ve duyurular örnektir
        </p>
      )}
    </>
  );
}
