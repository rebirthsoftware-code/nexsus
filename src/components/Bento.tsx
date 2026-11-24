import { Award, Briefcase, Handshake, Lightbulb, PartyPopper, Plus } from "lucide-react";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

function Tile({
  index,
  tag,
  title,
  text,
  className,
  delay = 0,
  children,
}: {
  index: string;
  tag: string;
  title: string;
  text: string;
  className?: string;
  delay?: number;
  children?: React.ReactNode;
}) {
  return (
    <Reveal as="article" delay={delay} className={cn("liftable relative flex min-h-[17rem] flex-col overflow-hidden rounded-[1.75rem] border-2 border-ink p-6 shadow-hard sm:p-7", className)}>
      <p className="label-mono flex items-center gap-2">
        <span className="rounded-full border-2 border-current px-2 py-0.5">{index}</span>
        {tag}
      </p>
      <div className="mt-auto pt-10">
        <h3 className="font-display text-[1.7rem] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-3xl">{title}</h3>
        <p className="mt-3 max-w-md leading-relaxed opacity-85">{text}</p>
      </div>
      {children}
    </Reveal>
  );
}

function IconDisc({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("absolute right-5 top-5 grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-paper text-ink shadow-hard-sm", className)} aria-hidden="true">
      {children}
    </span>
  );
}

const people = [
  { code: "MK", cls: "bg-sun text-ink" },
  { code: "TP", cls: "bg-coral text-ink" },
  { code: "HK", cls: "bg-lilac text-ink" },
  { code: "PS", cls: "bg-lime text-ink" },
  { code: "MM", cls: "bg-paper text-ink" },
];

export function Bento() {
  return (
    <div className="grid gap-5 md:grid-cols-6">
      <Tile
        index="01"
        tag="Ağ"
        title="Bölümünün dışına çık."
        text="Mühendislikten tıbba, işletmeden psikolojiye: kampüsün her köşesinden insanla tanış, başka türlü düşünenlerle aynı masada otur."
        className="bg-brand text-paper md:col-span-4 md:min-h-[22rem]"
      >
        <ul className="absolute right-5 top-5 flex -space-x-3 sm:right-7 sm:top-7" aria-hidden="true">
          {people.map((p) => (
            <li key={p.code} className={cn("grid h-12 w-12 place-items-center rounded-full border-2 border-ink font-mono text-xs font-bold sm:h-14 sm:w-14", p.cls)}>
              {p.code}
            </li>
          ))}
          <li className="grid h-12 w-12 place-items-center rounded-full border-2 border-dashed border-paper text-paper sm:h-14 sm:w-14">
            <Plus className="h-5 w-5" />
          </li>
        </ul>
      </Tile>

      <Tile index="02" tag="Sertifika" title="CV'ne erken başla." text="İŞKUR onaylı iş kulübü eğitimleri ve kariyer atölyeleri." className="bg-lime md:col-span-2 md:min-h-[22rem]" delay={80}>
        <IconDisc>
          <Award className="h-6 w-6" />
        </IconDisc>
      </Tile>

      <Tile index="03" tag="Sosyal" title="Kampüs dersten ibaret değil." text="Tanışma geceleri, geziler, turnuvalar, kahve buluşmaları." className="bg-coral md:col-span-2">
        <IconDisc>
          <PartyPopper className="h-6 w-6" />
        </IconDisc>
      </Tile>

      <Tile index="04" tag="Kariyer" title="Mezunlar anlatıyor, sen soruyorsun." text="Sektörden insanlarla söyleşiler, staj ve iş fırsatları." className="bg-navy text-paper md:col-span-2" delay={80}>
        <IconDisc className="bg-sun">
          <Briefcase className="h-6 w-6" />
        </IconDisc>
      </Tile>

      <Tile index="05" tag="Atölye" title="Yaparak öğren." text="Kişisel markadan dijital becerilere, uygulamalı atölyeler." className="bg-lilac md:col-span-2" delay={160}>
        <IconDisc>
          <Lightbulb className="h-6 w-6" />
        </IconDisc>
      </Tile>

      <Reveal as="article" className="liftable flex flex-col gap-5 rounded-[1.75rem] border-2 border-ink bg-sun p-6 shadow-hard sm:p-7 md:col-span-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper shadow-hard-sm" aria-hidden="true">
            <Handshake className="h-6 w-6" />
          </span>
          <div>
            <p className="label-mono">06 · İş birliği</p>
            <h3 className="font-display text-2xl font-extrabold tracking-[-0.03em]">Tek başına değil, birlikte.</h3>
          </div>
        </div>
        <ul className="flex flex-wrap gap-2 text-sm font-semibold">
          {["Diğer kulüpler", "İŞKUR", "Kariyer Merkezi", "Yerel şirketler", "Mezunlar"].map((x) => (
            <li key={x} className="rounded-full border-2 border-ink bg-paper px-3 py-1.5">
              {x}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
