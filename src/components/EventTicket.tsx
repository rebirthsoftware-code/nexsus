import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import { categoryAccent, type ClubEvent } from "@/content/events";
import { accentBg } from "@/lib/accents";
import { cn, dateParts, daysBetween } from "@/lib/utils";

/** Bilet görünümlü etkinlik kartı: solda tarih koçanı, sağda detaylar. */
export function EventTicket({ event, today, featured = false }: { event: ClubEvent; today: string; featured?: boolean }) {
  const { day, month, year, weekday } = dateParts(event.date);
  const diff = daysBetween(today, event.date);
  const upcoming = diff >= 0;
  const countdown = diff === 0 ? "Bugün" : diff === 1 ? "Yarın" : `${diff} gün kaldı`;

  return (
    <article className="liftable relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border-2 border-ink bg-paper shadow-hard sm:flex-row">
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-between border-b-2 border-dashed border-ink px-6 py-3 sm:flex-col sm:justify-center sm:gap-1 sm:border-b-0 sm:border-r-2 sm:px-0",
          featured ? "sm:w-44" : "sm:w-32",
          upcoming ? accentBg[categoryAccent[event.category]] : "bg-paper-deep text-ink"
        )}
      >
        <span className="label-mono">{month}</span>
        <span className={cn("display-tight", featured ? "text-5xl sm:text-8xl" : "text-5xl sm:text-6xl")}>{day}</span>
        <span className="label-mono">{year}</span>
        {/* Bilet çentikleri */}
        <span className="absolute -right-[11px] -top-[11px] hidden h-5 w-5 rounded-full border-2 border-ink bg-paper sm:block" aria-hidden="true" />
        <span className="absolute -bottom-[11px] -right-[11px] hidden h-5 w-5 rounded-full border-2 border-ink bg-paper sm:block" aria-hidden="true" />
      </div>

      <div className={cn("flex flex-1 flex-col p-6", featured && "sm:p-8")}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-mono rounded-full border-2 border-ink px-2.5 py-1">{event.category}</span>
          {upcoming ? (
            <span className="label-mono rounded-full border-2 border-ink bg-ink px-2.5 py-1 text-paper">{countdown}</span>
          ) : (
            <span className="label-mono text-ink-soft">Tamamlandı</span>
          )}
        </div>
        <h3 className={cn("mt-4 font-display font-extrabold leading-[1.05] tracking-[-0.03em]", featured ? "text-3xl sm:text-4xl" : "text-2xl")}>{event.title}</h3>
        <p className={cn("mt-3 flex-1 leading-relaxed text-ink-soft", featured && "sm:text-lg")}>{event.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-semibold">
          <li className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {weekday}
            {event.time && `, ${event.time}`}
          </li>
          <li className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {event.location}
          </li>
        </ul>
        {event.link && (
          <a href={event.link} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 self-start border-b-2 border-ink font-display font-bold">
            {upcoming ? "Kayıt ol" : "Detaylar"} <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}
