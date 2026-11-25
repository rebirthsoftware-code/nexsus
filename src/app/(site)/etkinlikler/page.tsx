import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { EventsExplorer } from "@/components/EventsExplorer";
import { CTA } from "@/components/CTA";
import { Burst, Mark } from "@/components/Shapes";
import { getToday } from "@/lib/today";

export const metadata: Metadata = {
  title: "Etkinlikler",
  description: "Nexus'un yaklaşan ve geçmiş etkinlikleri: sertifika programları, seminerler, atölyeler ve sosyal buluşmalar.",
};

export default async function EventsPage() {
  const today = await getToday();
  return (
    <>
      <PageHeader
        eyebrow="Etkinlikler"
        title={
          <>
            Takvimi <Mark className="bg-coral">boş</Mark> bırakmıyoruz.
          </>
        }
        description="Sertifika programlarından kahve buluşmalarına bütün etkinlikler burada. Kategori seç, biletini kap."
        aside={
          <span className="relative hidden h-36 w-36 rotate-12 place-items-center text-lime lg:grid">
            <Burst points={12} className="absolute inset-0 h-full w-full" />
            <span className="relative text-center font-display text-lg font-extrabold leading-none tracking-tight text-ink">
              hepsi
              <br />
              ücretsiz
            </span>
          </span>
        }
      />
      <Container>
        <EventsExplorer today={today} />
        <p className="mt-14 flex flex-wrap items-center gap-x-3 gap-y-1 border-t-2 border-dashed border-ink/30 pt-6 text-lg text-ink-soft">
          Geçmiş etkinliklerden fotoğraflar mı arıyorsun?
          <Link href="/sizden-kalanlar" className="inline-flex items-center gap-1.5 border-b-2 border-ink font-display font-bold text-ink">
            Sizden Kalanlar <ArrowRight className="h-4 w-4" />
          </Link>
        </p>
      </Container>
      <Container className="mt-24">
        <CTA />
      </Container>
    </>
  );
}
