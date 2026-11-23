import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Stats } from "@/components/Stats";
import { Features } from "@/components/Features";
import { EventCard } from "@/components/EventCard";
import { TeamCard } from "@/components/TeamCard";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { Reveal } from "@/components/Reveal";
import { events } from "@/content/events";
import { team } from "@/content/team";

export default function HomePage() {
  const upcoming = events.filter((e) => e.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date));
  const recentPast = events.filter((e) => e.status === "past").sort((a, b) => b.date.localeCompare(a.date));
  const highlighted = [...upcoming, ...recentPast].slice(0, 3);
  const leadership = team[0]?.members.slice(0, 4) ?? [];

  return (
    <>
      <Hero />

      <Container className="-mt-6 relative z-10">
        <Reveal>
          <Stats />
        </Reveal>
      </Container>

      <section className="py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Neler yapıyoruz"
              title="Tek bir bölümün değil, bütün kampüsün kulübü."
              description="Nexus, Latince 'bağ' demek. Biz de tam olarak bunu yapıyoruz: farklı fakültelerden öğrencileri ortak etkinlikler, eğitimler ve projeler etrafında birbirine bağlıyoruz."
            />
          </Reveal>
          <div className="mt-14">
            <Features />
          </div>
        </Container>
      </section>

      <section className="py-24 bg-gradient-to-b from-transparent via-night-900/60 to-transparent">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading align="left" eyebrow="Etkinlikler" title="Takvimde neler var?" description="Sertifika programlarından tanışma buluşmalarına kadar yaklaşan ve geçmiş etkinliklerimiz." />
            <Link href="/etkinlikler" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-200 hover:text-white">
              Tüm etkinlikler <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {highlighted.map((e, i) => (
              <Reveal key={e.slug} delay={i * 80}>
                <EventCard event={e} featured={i === 0 && e.status === "upcoming"} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Ekip" title="Kulübü ayakta tutan insanlar" description="Farklı bölümlerden gelen, gönüllü çalışan yönetim kurulumuzla tanışın." />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {leadership.map((m, i) => (
              <Reveal key={`${m.name}-${i}`} delay={i * 80}>
                <TeamCard member={m} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <Link href="/ekip" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-200 hover:text-white">
              Tüm ekibi gör <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="SSS" title="Merak edilenler" />
          </Reveal>
          <Reveal className="mt-12" delay={100}>
            <FAQ />
          </Reveal>
        </Container>
      </section>

      <Container className="pb-8">
        <CTA />
      </Container>
    </>
  );
}
