"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { announcementCategories, splitAnnouncements, type AnnouncementCategory } from "@/content/announcements";
import { cn } from "@/lib/utils";
import { AnnouncementCard } from "./AnnouncementCard";

type Filter = "Tümü" | AnnouncementCategory;

/** Duyuru panosu: türe göre filtrelenir; süresi dolanlar ayrı bir bölümde durur. */
export function AnnouncementsBoard({ today }: { today: string }) {
  const [filter, setFilter] = useState<Filter>("Tümü");
  const all = splitAnnouncements(today);
  const match = (c: AnnouncementCategory) => filter === "Tümü" || c === filter;
  const active = all.active.filter((a) => match(a.category));
  const past = all.past.filter((a) => match(a.category));

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Türe göre filtrele">
        {(["Tümü", ...announcementCategories] as Filter[]).map((c) => (
          <button
            key={c}
            type="button"
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

      <section className="mt-12" aria-live="polite" aria-label="Güncel duyurular">
        {active.length ? (
          <div className="grid gap-x-7 gap-y-10 lg:grid-cols-2">
            {active.map((a, i) => {
              const featured = i === 0 && !!a.pinned;
              return (
                <div key={a.slug} className={cn(featured && "lg:col-span-2")}>
                  <AnnouncementCard item={a} today={today} featured={featured} index={i} />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="flex flex-col items-center gap-3 rounded-[1.75rem] border-2 border-dashed border-ink p-12 text-center text-ink-soft">
            <Megaphone className="h-10 w-10" aria-hidden="true" />
            {filter === "Tümü" ? "Şu an güncel bir duyuru yok." : "Bu türde güncel duyuru yok."}
          </p>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Geçmiş duyurular</h2>
          <div className="mt-9 grid gap-x-7 gap-y-10 lg:grid-cols-2">
            {past.map((a, i) => (
              <AnnouncementCard key={a.slug} item={a} today={today} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
