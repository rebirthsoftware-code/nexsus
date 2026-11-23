import Image from "next/image";
import { Calendar, Clock, MapPin, ArrowUpRight } from "lucide-react";
import { categoryStyles, type ClubEvent } from "@/content/events";
import { formatDate, cn } from "@/lib/utils";

export function EventCard({ event, featured = false }: { event: ClubEvent; featured?: boolean }) {
  const upcoming = event.status === "upcoming";
  return (
    <article className={cn("card card-hover group relative flex flex-col overflow-hidden", featured && "md:col-span-2 md:flex-row")}>
      <div className={cn("relative h-44 shrink-0 overflow-hidden bg-gradient-to-br", categoryStyles[event.category], featured && "md:h-auto md:w-2/5")}>
        {event.image ? (
          <Image src={`/events/${event.image}`} alt={event.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(min-width: 768px) 50vw, 100vw" />
        ) : (
          <div className="absolute inset-0 grid place-items-center overflow-hidden">
            <span className="px-4 font-display text-5xl font-bold text-white/10 sm:text-6xl">{event.category}</span>
          </div>
        )}
        <div className="absolute left-4 top-4 flex gap-2">
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1 backdrop-blur bg-night-900/60", categoryStyles[event.category])}>
            {event.category}
          </span>
          {upcoming && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Yaklaşan
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold text-white">{event.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{event.summary}</p>
        <ul className="mt-5 space-y-1.5 text-sm text-slate-300">
          <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-brand-300" />{formatDate(event.date)}</li>
          {event.time && <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-300" />{event.time}</li>}
          <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-300" />{event.location}</li>
        </ul>
        {event.link && (
          <a href={event.link} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-200 hover:text-white">
            {upcoming ? "Kayıt ol" : "Detaylar"} <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}
