import { ArrowRight } from "lucide-react";
import { Button } from "./Button";
import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700/40 via-night-800 to-accent-500/20 px-8 py-16 text-center sm:px-16">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-500/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-accent-400/30 blur-3xl" />
        <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">Ağın bir parçası ol.</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
          Başvuru iki dakika sürüyor. Bölümün, sınıfın fark etmez; merakın yeter.
        </p>
        <div className="relative mt-8">
          <Button href="/basvuru" className="px-8">
            Hemen Başvur <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Reveal>
  );
}
