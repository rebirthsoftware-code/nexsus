import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Container } from "@/components/Container";
import { Marquee } from "@/components/Marquee";
import { Stats } from "@/components/Stats";
import { Bento } from "@/components/Bento";
import { CertificateSpotlight } from "@/components/CertificateSpotlight";
import { EventTicket } from "@/components/EventTicket";
import { Steps } from "@/components/Steps";
import { TeamCard } from "@/components/TeamCard";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { Mark, SectionLabel } from "@/components/Shapes";
import { splitEvents } from "@/content/events";
import { team } from "@/content/team";
import { getToday } from "@/lib/today";

const tape = ["Tanış", "Birlikte üret", "Sertifikanı al", "Bölümünün dışına çık", "Kampüse karış", "Bağ kur"];

function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2 border-b-2 border-ink pb-0.5 font-display text-lg font-bold tracking-tight">
      {children}
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export default async function HomePage() {
  const today = await getToday();
  const { upcoming, past } = splitEvents(today);
  const [next, ...rest] = [...upcoming, ...past];
  const others = rest.slice(0, 2);
  const leadership = team[0]?.members.slice(0, 4) ?? [];

  return (
    <>
      <Hero />

      {/* Kayan şerit */}
      <div className="overflow-x-clip py-6">
        <Marquee items={tape} className="-rotate-[1.5deg] scale-[1.03] bg-navy font-display text-2xl font-extrabold uppercase tracking-tight text-paper sm:text-3xl" />
      </div>

      <Container className="mt-16 sm:mt-20">
        <Reveal>
          <Stats />
        </Reveal>
      </Container>

      {/* 01 Neler yapıyoruz */}
      <section className="py-24 sm:py-32">
        <Container>
          <Reveal className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel index="01">Neler yapıyoruz</SectionLabel>
              <h2 className="display-tight mt-6 max-w-3xl text-5xl sm:text-6xl lg:text-7xl">
                Tek bölümün değil, <Mark className="bg-sun">bütün</Mark> kampüsün kulübü.
              </h2>
            </div>
            <p className="max-w-sm text-lg leading-relaxed text-ink-soft">
              Nexus, Latince &quot;bağ&quot; demek. Biz de tam olarak bunu yapıyoruz: farklı fakültelerden öğrencileri ortak etkinlikler ve projeler etrafında buluşturuyoruz.
            </p>
          </Reveal>
          <Bento />
        </Container>
      </section>

      {/* 02 Etkinlikler */}
      <section className="pb-24 sm:pb-32">
        <Container>
          <Reveal className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel index="02">Takvim</SectionLabel>
              <h2 className="display-tight mt-6 text-5xl sm:text-6xl lg:text-7xl">
                Sırada <Mark className="bg-coral">ne</Mark> var?
              </h2>
            </div>
            <TextLink href="/etkinlikler">Tüm etkinlikler</TextLink>
          </Reveal>
          {next && (
            <Reveal>
              <EventTicket event={next} today={today} featured />
            </Reveal>
          )}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {others.map((e, i) => (
              <Reveal key={e.slug} delay={i * 100}>
                <EventTicket event={e} today={today} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 03 Sertifika */}
      <CertificateSpotlight />

      {/* 04 Nasıl katılırım */}
      <section className="py-24 sm:py-32">
        <Container>
          <Reveal className="mb-14">
            <SectionLabel index="04">Nasıl katılırım</SectionLabel>
            <h2 className="display-tight mt-6 text-5xl sm:text-6xl lg:text-7xl">
              Üç adımda <Mark className="bg-lilac">aramızdasın.</Mark>
            </h2>
          </Reveal>
          <Steps />
          <Reveal className="mt-14">
            <Button href="/basvuru" variant="ink" className="px-7 py-3.5 text-base">
              Başvuruya başla <ArrowRight className="h-5 w-5" />
            </Button>
          </Reveal>
        </Container>
      </section>

      {/* 05 Ekip */}
      <section className="border-y-2 border-ink bg-paper-deep py-24 sm:py-32">
        <Container>
          <Reveal className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel index="05">Ekip</SectionLabel>
              <h2 className="display-tight mt-6 text-5xl sm:text-6xl lg:text-7xl">
                Kulübü <Mark>ayakta</Mark> tutanlar.
              </h2>
            </div>
            <TextLink href="/ekip">Tüm ekip</TextLink>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {leadership.map((m, i) => (
              <Reveal key={i} delay={i * 90}>
                <TeamCard member={m} index={i} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 06 SSS */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal className="lg:sticky lg:top-32 lg:self-start">
              <SectionLabel index="06">Sık sorulanlar</SectionLabel>
              <h2 className="display-tight mt-6 text-5xl sm:text-6xl">
                Aklına <Mark className="bg-sun">takılan</Mark> mı var?
              </h2>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-ink-soft">Cevabını burada bulamadıysan bize Instagram&apos;dan yaz.</p>
              <div className="mt-6">
                <TextLink href="/iletisim">İletişime geç</TextLink>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <FAQ />
            </Reveal>
          </div>
        </Container>
      </section>

      <Container>
        <CTA />
      </Container>
    </>
  );
}
