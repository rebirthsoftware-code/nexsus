import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center pt-28 text-center">
      <p className="font-display text-7xl font-bold text-gradient">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-white">Bu bağlantı kopmuş.</h1>
      <p className="mt-2 text-slate-400">Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.</p>
      <Button href="/" className="mt-8">Ana sayfaya dön</Button>
    </Container>
  );
}
