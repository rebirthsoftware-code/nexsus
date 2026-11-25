import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Mark } from "@/components/Shapes";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Container className="flex min-h-[80vh] flex-col items-start justify-center pb-10 pt-28">
          <p className="label-mono rounded-full border-2 border-ink bg-coral px-3 py-1.5">Hata 404</p>
          <h1 className="display-tight mt-6 text-[clamp(3.25rem,min(12vw,20vh),8rem)]">
            Bu bağlantı <Mark>kopmuş.</Mark>
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink-soft">Aradığın sayfa taşınmış ya da hiç var olmamış olabilir. Seni yeniden ağa bağlayalım.</p>
          <Button href="/" className="mt-8">
            Ana sayfaya dön
          </Button>
        </Container>
      </main>
      <Footer />
    </>
  );
}
