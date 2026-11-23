import type { Metadata } from "next";
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
      </Container>
      <Container className="mt-24">
        <CTA />
      </Container>
    </>
  );
}
