import { ArrowRight, Star } from "lucide-react";
import { site } from "@/content/site";
import { Container } from "./Container";
import { Button } from "./Button";
import { ConnectionMap } from "./ConnectionMap";
import { Mark, SpinBadge } from "./Shapes";

const faces = [
  { code: "MK", cls: "bg-sun" },
  { code: "TP", cls: "bg-coral" },
  { code: "HK", cls: "bg-lilac" },
  { code: "PS", cls: "bg-lime" },
  { code: "İŞ", cls: "bg-brand text-paper" },
];

export function Hero() {
  return (
    <section className="relative overflow-x-clip pb-16 pt-28 sm:pt-36 short:pt-24 lg:pb-24">
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-[36rem] [mask-image:linear-gradient(black,transparent)]" aria-hidden="true" />
      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
          <div>
            <p className="label-mono animate-rise inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 max-sm:text-[0.66rem] max-sm:tracking-[0.05em]">
              <span className="h-2 w-2 rounded-full bg-coral" aria-hidden="true" />
              {site.university} · Öğrenci Kulübü
            </p>

            <h1 className="display-tight animate-rise mt-6 text-[clamp(3.25rem,min(11vw,19vh),7.5rem)] leading-[0.97]" style={{ animationDelay: "80ms" }}>
              Kampüsün <Mark>bağlantı</Mark> noktası.
            </h1>

            <p className="animate-rise mt-7 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl" style={{ animationDelay: "160ms" }}>
              <strong className="font-bold text-ink">Nexus</strong>, makineciyle psikoloğu, hukukçuyla tasarımcıyı aynı masaya oturtan
              öğrenci kulübü. Tanış, birlikte üret, İŞKUR onaylı sertifikanı al.
            </p>

            <div className="animate-rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
              <Button href="/basvuru" className="px-7 py-3.5 text-base">
                Aramıza katıl <ArrowRight className="h-5 w-5" />
              </Button>
              <Button href="/etkinlikler" variant="paper" className="px-7 py-3.5 text-base">
                Etkinlik takvimi
              </Button>
            </div>

            <div className="animate-rise mt-10 flex items-center gap-4" style={{ animationDelay: "320ms" }}>
              <ul className="flex -space-x-3" aria-hidden="true">
                {faces.map((f) => (
                  <li key={f.code} className={`grid h-11 w-11 place-items-center rounded-full border-2 border-ink font-mono text-[0.68rem] font-bold ${f.cls}`}>
                    {f.code}
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-snug text-ink-soft">
                <strong className="block font-display text-base font-extrabold tracking-tight text-ink">
                  {site.stats[1].value}
                  {site.stats[1].suffix} bölüm, tek kulüp
                </strong>
                Üyelik ücretsiz ve herkese açık
              </p>
            </div>
          </div>

          <div className="animate-rise relative" style={{ animationDelay: "200ms" }}>
            <ConnectionMap className="h-[26rem] sm:h-[32rem] short:h-[19rem] lg:h-[37rem]" />
            <SpinBadge
              id="hero-badge"
              text="HER BÖLÜME AÇIK ✦ ÜCRETSİZ ✦ "
              className="absolute -right-3 -top-9 h-[6.5rem] w-[6.5rem] rotate-12 bg-sun shadow-hard-sm sm:-right-8 sm:h-32 sm:w-32"
            >
              <Star className="h-7 w-7 fill-ink sm:h-9 sm:w-9" />
            </SpinBadge>
          </div>
        </div>
      </Container>
    </section>
  );
}
