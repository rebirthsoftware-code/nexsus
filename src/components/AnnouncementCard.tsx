import { ArrowUpRight, Bus, CalendarClock, MapPin, Megaphone, Pin, Store, UserPlus } from "lucide-react";
import { categoryAccent, type Announcement, type AnnouncementCategory } from "@/content/announcements";
import { accentBg } from "@/lib/accents";
import { cn, dateParts, daysBetween } from "@/lib/utils";

const icons: Record<AnnouncementCategory, typeof Bus> = { Gezi: Bus, Stant: Store, "Ekip Alımı": UserPlus, Genel: Megaphone };

/** Mantar panoya iliştirilmiş not görünümünde duyuru kartı. */
export function AnnouncementCard({ item, today, featured = false, index = 0 }: { item: Announcement; today: string; featured?: boolean; index?: number }) {
  const Icon = icons[item.category];
  const published = dateParts(item.date);
  const left = item.deadline ? daysBetween(today, item.deadline) : null;
  const expired = left !== null && left < 0;
  const countdown = left === null || expired ? null : left === 0 ? "Son gün" : left === 1 ? "Yarın bitiyor" : `${left} gün kaldı`;

  return (
    <article
      id={item.slug}
      className={cn(
        "relative flex h-full scroll-mt-28 flex-col rounded-[1.5rem] border-2 border-ink bg-paper p-6 pt-8 shadow-hard sm:p-7 sm:pt-9",
        featured ? "sm:p-9 sm:pt-11" : index % 2 === 0 ? "sm:-rotate-[0.6deg]" : "sm:rotate-[0.6deg]",
        expired && "bg-paper-deep shadow-hard-sm"
      )}
    >
      {/* Notu panoya tutturan bant */}
      <span className={cn("absolute -top-3 left-8 h-6 w-20 -rotate-3 border-2 border-ink", expired ? "bg-paper" : accentBg[categoryAccent[item.category]])} aria-hidden="true" />

      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("label-mono inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-1", expired ? "bg-paper" : accentBg[categoryAccent[item.category]])}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {item.category}
        </span>
        {item.pinned && !expired && (
          <span className="label-mono inline-flex items-center gap-1 rounded-full border-2 border-ink bg-coral px-2.5 py-1">
            <Pin className="h-3.5 w-3.5" aria-hidden="true" /> Sabit
          </span>
        )}
        {countdown && <span className="label-mono rounded-full border-2 border-ink bg-ink px-2.5 py-1 text-paper">{countdown}</span>}
        {expired && <span className="label-mono text-ink-soft">Sona erdi</span>}
        <time dateTime={item.date} className="label-mono ml-auto text-ink-soft">
          {published.day} {published.month} {published.year}
        </time>
      </div>

      <h3 className={cn("mt-4 font-display font-extrabold leading-[1.05] tracking-[-0.03em]", featured ? "text-3xl sm:text-5xl" : "text-2xl sm:text-3xl")}>{item.title}</h3>

      <div className={cn("mt-3 flex-1 space-y-3 leading-relaxed text-ink-soft", featured && "max-w-3xl sm:text-lg")}>
        {item.body.split(/\n\s*\n/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {(item.when || item.where) && (
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-semibold">
          {item.when && (
            <li className="flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" aria-hidden="true" /> {item.when}
            </li>
          )}
          {item.where && (
            <li className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden="true" /> {item.where}
            </li>
          )}
        </ul>
      )}

      {item.link && !expired && (
        <a href={item.link.href} target="_blank" rel="noopener noreferrer" className="pressable mt-6 inline-flex items-center gap-2 self-start rounded-full border-2 border-ink bg-brand px-5 py-2.5 font-display text-sm font-bold text-paper">
          {item.link.label} <ArrowUpRight className="h-4 w-4" />
        </a>
      )}
    </article>
  );
}
