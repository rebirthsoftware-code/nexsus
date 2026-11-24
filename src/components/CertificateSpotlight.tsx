import { ArrowRight, Check } from "lucide-react";
import { Container } from "./Container";
import { Button } from "./Button";
import { Logo } from "./Logo";
import { Reveal } from "./Reveal";
import { Burst, Mark, SectionLabel } from "./Shapes";

const points = [
  "İŞKUR onaylı iş kulübü eğitimi",
  "Özgeçmiş ve mülakat atölyeleri",
  "Etkinlik ve atölye katılım belgeleri",
];

export function CertificateSpotlight() {
  return (
    <section className="overflow-x-clip border-y-2 border-ink bg-navy py-20 text-paper sm:py-28">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <SectionLabel index="03">Sertifika programları</SectionLabel>
            <h2 className="display-tight mt-6 text-5xl sm:text-6xl lg:text-7xl">
              Mezun olmadan <Mark>sertifikalı</Mark> ol.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-paper/85">
              Kulübümüz İŞKUR ile birlikte kariyer eğitimleri düzenliyor. Eğitimi tamamlayan her üye, iş başvurularında
              kullanabileceği onaylı sertifikasını alıyor.
            </p>
            <ul className="mt-8 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3 font-display text-lg font-bold tracking-tight">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-paper bg-brand" aria-hidden="true">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <Button href="/etkinlikler" variant="lime" className="mt-9">
              Sıradaki eğitime bak <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>

          {/* Örnek sertifika görseli */}
          <Reveal delay={120} className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 translate-x-4 translate-y-4 -rotate-3 rounded-2xl border-2 border-ink bg-brand" aria-hidden="true" />
            <div className="relative rotate-2 rounded-2xl border-2 border-ink bg-paper p-7 text-ink shadow-hard sm:p-9" aria-hidden="true">
              <div className="flex items-center justify-between">
                <Logo asLink={false} className="h-6" />
                <span className="label-mono text-ink-soft">No. NX-0001</span>
              </div>
              <p className="label-mono mt-9">Katılım sertifikası</p>
              <p className="mt-2 border-b-2 border-ink pb-2 font-serif text-5xl italic leading-none">Senin Adın</p>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                <strong className="text-ink">İş Kulübü Eğitimi</strong> programını başarıyla tamamlayarak bu belgeyi almaya hak kazanmıştır.
              </p>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <svg viewBox="0 0 120 40" className="h-9 w-28" fill="none" stroke="#0b0b0c" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 30c10-22 18-26 20-14s-8 18-4 14 12-22 18-16-2 14 4 12 10-14 16-12 0 10 8 8 16-10 26-10 18 6 24 4" />
                  </svg>
                  <p className="label-mono mt-1 border-t-2 border-ink pt-1 text-ink-soft">Kulüp başkanı</p>
                </div>
                <span className="relative grid h-20 w-20 place-items-center text-coral">
                  <Burst points={14} inner={0.84} className="absolute inset-0 h-full w-full" />
                  <span className="label-mono relative text-center text-[0.55rem] leading-tight text-ink">
                    onaylı
                    <br />
                    belge
                  </span>
                </span>
              </div>
            </div>
            <span className="label-mono absolute -bottom-4 left-6 rotate-2 rounded-md border-2 border-ink bg-lime px-2 py-1 text-ink">örnek görsel</span>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
