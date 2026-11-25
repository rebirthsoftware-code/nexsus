import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "./Button";
import { Reveal } from "./Reveal";
import { Burst, SpinBadge } from "./Shapes";

export function CTA() {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-brand px-6 py-16 text-paper shadow-hard-lg sm:rounded-[2.5rem] sm:px-14 sm:py-24">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,#f5f2ea_1.2px,transparent_1.2px)] [background-size:22px_22px]" aria-hidden="true" />
        <Burst points={10} inner={0.6} className="absolute -bottom-10 -left-10 h-40 w-40 rotate-12 text-coral" />
        <span className="absolute -right-8 top-10 hidden h-28 w-28 rounded-full border-2 border-ink bg-sun sm:block" aria-hidden="true" />

        <div className="relative flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label-mono text-lime">Üyelik açık</p>
            <h2 className="display-tight mt-4 text-[clamp(3.25rem,min(11vw,22vh),8rem)]">
              Sıra <span className="font-serif font-normal italic tracking-[-0.02em] text-lime">sende.</span>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-paper/85">Başvuru iki dakika sürüyor. Bölümün, sınıfın fark etmez; merakın yeter.</p>
            <Button href="/basvuru" variant="lime" className="mt-8 px-8 py-4 text-base">
              Başvuru formu <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          <SpinBadge id="cta-badge" text="ARAMIZA KATIL ✦ ARAMIZA KATIL ✦ " className="hidden h-36 w-36 shrink-0 bg-lime text-ink lg:grid">
            <ArrowUpRight className="h-10 w-10" strokeWidth={2.5} />
          </SpinBadge>
        </div>
      </div>
    </Reveal>
  );
}
