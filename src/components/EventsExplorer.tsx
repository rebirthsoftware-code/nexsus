"use client";

import { useState } from "react";
import { CalendarX2 } from "lucide-react";
import { eventCategories, splitEvents, type EventCategory } from "@/content/events";
import { site } from "@/content/site";
import { EventTicket } from "./EventTicket";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

type Filter = "Tümü" | EventCategory;

/** Etkinlik takvimi: kategoriye göre filtrelenebilir, yaklaşan ve geçmiş olarak ayrılır. */
export function EventsExplorer({ today }: { today: string }) {
  const [filter, setFilter] = useState<Filter>("Tümü");
  const all = splitEvents(today);
  const match = (c: EventCategory) => filter === "Tümü" || c === filter;
  const upcoming = all.upcoming.filter((e) => match(e.category));
  const past = all.past.filter((e) => match(e.category));

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Kategoriye göre filtrele">
        {(["Tümü", ...eventCategories] as Filter[]).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={cn(
              "rounded-full border-2 border-ink px-4 py-2 font-display text-sm font-bold tracking-tight transition-all",
              filter === c ? "bg-ink text-paper shadow-none" : "bg-paper shadow-hard-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-brand hover:text-paper"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <section className="mt-12" aria-live="polite">
        <h2 className="flex items-center gap-3 font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
          Yaklaşan
          <span className="label-mono rounded-full border-2 border-ink bg-brand px-2.5 py-1 text-paper">{upcoming.length}</span>
        </h2>
        {upcoming.length ? (
          <div className="mt-7 grid gap-6 lg:grid-cols-2">
            {upcoming.map((e, i) => (
              <div key={e.slug} className={cn(i === 0 && "lg:col-span-2")}>
                <EventTicket event={e} today={today} featured={i === 0} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-7 flex flex-col items-center gap-4 rounded-[1.75rem] border-2 border-dashed border-ink p-10 text-center">
            <CalendarX2 className="h-10 w-10" aria-hidden="true" />
            <p className="max-w-sm text-ink-soft">
              {filter === "Tümü" ? "Şu an planlanmış bir etkinlik yok." : `Bu kategoride yaklaşan etkinlik yok.`} Yeni duyurular için Instagram&apos;ı takip et.
            </p>
            <Button href={site.socials.instagram} variant="paper" external>
              {site.instagramHandle}
            </Button>
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Geçmiş etkinlikler</h2>
          <div className="mt-7 grid gap-6 lg:grid-cols-2">
            {past.map((e) => (
              <EventTicket key={e.slug} event={e} today={today} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
