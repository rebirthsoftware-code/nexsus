import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

const steps = [
  { n: "1", title: "Formu doldur", text: "İki dakikalık başvuru formunda kendini ve ilgi alanlarını anlat.", cls: "bg-lime" },
  { n: "2", title: "Tanışmaya gel", text: "Ekipten biri sana yazar; ilk buluşmada yüz yüze tanışırız.", cls: "bg-sun" },
  { n: "3", title: "Ekibini seç", text: "Etkinlik, tasarım, kariyer… Sana uyan ekipte hemen işe koyul.", cls: "bg-coral" },
];

/** Üyelik adımları: birbirine çizgiyle bağlı üç düğüm */
export function Steps() {
  return (
    <ol className="relative grid gap-10 md:grid-cols-3 md:gap-6">
      <span className="absolute left-[1.9rem] top-0 h-[calc(100%-5rem)] border-l-2 border-dashed border-ink md:left-0 md:top-[1.9rem] md:h-0 md:w-[calc(66.67%+2rem)] md:border-l-0 md:border-t-2" aria-hidden="true" />
      {steps.map((s, i) => (
        <Reveal as="li" key={s.n} delay={i * 120} className="relative flex gap-5 md:block">
          <span className={cn("display-tight relative grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-ink text-3xl shadow-hard-sm", s.cls)}>{s.n}</span>
          <div className="md:mt-6 md:pr-6">
            <h3 className="font-display text-2xl font-extrabold tracking-[-0.03em]">{s.title}</h3>
            <p className="mt-2 leading-relaxed text-ink-soft">{s.text}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
