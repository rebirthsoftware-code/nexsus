import type { Metadata } from "next";
import { CalendarX2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { EventCard } from "@/components/EventCard";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { events } from "@/content/events";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Etkinlikler",
  description: "Nexus'un yaklaşan ve geçmiş etkinlikleri: sertifika programları, seminerler, atölyeler ve sosyal buluşmalar.",
};

export default function EventsPage() {
  const upcoming = events.filter((e) => e.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date));
  const past = events.filter((e) => e.status === "past").sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader eyebrow="Etkinlikler" title="Takvim" description="Sertifika programlarından kampüs buluşmalarına, tüm etkinliklerimiz burada. Kayıt bağlantıları her etkinliğin kartında." />

      <Container>
        <section>
          <Reveal className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-white">Yaklaşan Etkinlikler</h2>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">{upcoming.length}</span>
          </Reveal>
          {upcoming.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {upcoming.map((e, i) => (
                <Reveal key={e.slug} delay={i * 80}>
                  <EventCard event={e} featured={i === 0} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="card mt-8 flex flex-col items-center gap-4 p-12 text-center">
              <CalendarX2 className="h-10 w-10 text-slate-500" />
              <p className="text-slate-400">Şu an planlanmış bir etkinlik yok. Yeni duyurular için Instagram&apos;ı takip et.</p>
              <Button href={site.socials.instagram} variant="secondary" external>Instagram</Button>
            </Reveal>
          )}
        </section>

        <section className="mt-24">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-white">Geçmiş Etkinlikler</h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {past.map((e, i) => (
              <Reveal key={e.slug} delay={(i % 3) * 80}>
                <EventCard event={e} />
              </Reveal>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}
