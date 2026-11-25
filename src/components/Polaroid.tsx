import { cn } from "@/lib/utils";

const tilts = ["-rotate-2", "rotate-[1.5deg]", "-rotate-1", "rotate-2", "rotate-[0.5deg]", "-rotate-[1.5deg]"];
const tapes = ["bg-sun", "bg-lilac", "bg-lime", "bg-coral"];

/** Şipşak fotoğraf çerçevesi: beyaz kenarlık, üstte bant, altta el yazısı havasında not. */
export function Polaroid({ index = 0, caption, className, children }: { index?: number; caption?: string | null; className?: string; children: React.ReactNode }) {
  return (
    <figure className={cn("relative border-2 border-ink bg-white p-2.5 pb-3 shadow-hard transition-transform duration-300 sm:p-3", tilts[index % tilts.length], className)}>
      <span className={cn("absolute -top-3 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-2 border-2 border-ink opacity-90", tapes[index % tapes.length])} aria-hidden="true" />
      {children}
      <figcaption className="mt-2.5 min-h-[1.5rem] px-1 font-serif text-lg italic leading-tight text-ink">{caption}</figcaption>
    </figure>
  );
}

const placeholderTones = ["bg-brand text-paper", "bg-lime text-ink", "bg-coral text-ink", "bg-lilac text-ink", "bg-sun text-ink", "bg-navy text-paper"];

/** Henüz fotoğraf yokken gösterilen boş kare */
export function PolaroidPlaceholder({ index = 0, caption, tall = false }: { index?: number; caption: string; tall?: boolean }) {
  return (
    <Polaroid index={index} caption={caption}>
      <div className={cn("relative grid place-items-center overflow-hidden border-2 border-ink", tall ? "aspect-[3/4]" : "aspect-[4/3]", placeholderTones[index % placeholderTones.length])} aria-hidden="true">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle,currentColor_1.3px,transparent_1.3px)] [background-size:12px_12px]" />
        <span className="label-mono relative rounded-full border-2 border-ink bg-paper px-2.5 py-1 text-ink">Yakında</span>
      </div>
    </Polaroid>
  );
}
