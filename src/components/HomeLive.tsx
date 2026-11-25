"use client";

import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { splitAnnouncements } from "@/content/announcements";
import { splitEvents } from "@/content/events";
import { useToday } from "@/lib/useToday";
import { EventTicket } from "./EventTicket";
import { Reveal } from "./Reveal";

/**
 * Ana sayfanın tarihe bağlı parçaları. Tarih tarayıcıda hesaplandığı için ayrı bileşenlerdir:
 * hangi duyurunun güncel, hangi etkinliğin "sıradaki" olduğu ziyaret edilen güne göre belirlenir.
 */

/** En güncel duyuru: tek satırlık şerit */
export function HomeHeadline({ buildDate }: { buildDate: string }) {
  const today = useToday(buildDate);
  const headline = splitAnnouncements(today).active[0];
  if (!headline) return null;
  return (
    <Reveal>
      <Link href={`/duyurular#${headline.slug}`} className="pressable group flex items-center gap-3 rounded-full border-2 border-ink bg-paper py-2 pl-2 pr-4 sm:gap-4">
        <span className="label-mono flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink bg-coral px-3 py-1.5">
          <Megaphone className="h-3.5 w-3.5" aria-hidden="true" /> Duyuru
        </span>
        <span className="min-w-0 flex-1 truncate font-display font-bold tracking-tight sm:text-lg">{headline.title}</span>
        <span className="label-mono hidden shrink-0 text-ink-soft sm:inline">Tüm duyurular</span>
        <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
      </Link>
    </Reveal>
  );
}

/** Sıradaki etkinlik büyük bilet olarak, ardından iki etkinlik daha */
export function HomeEvents({ buildDate }: { buildDate: string }) {
  const today = useToday(buildDate);
  const { upcoming, past } = splitEvents(today);
  const [next, ...rest] = [...upcoming, ...past];
  return (
    <>
      {next && (
        <Reveal>
          <EventTicket event={next} today={today} featured />
        </Reveal>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {rest.slice(0, 2).map((e, i) => (
          <Reveal key={e.slug} delay={i * 100}>
            <EventTicket event={e} today={today} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
