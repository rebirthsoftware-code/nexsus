import { cn } from "@/lib/utils";

/** Çok köşeli yıldız / rozet şekli. Sticker ve mühür olarak kullanılır. */
export function Burst({ points = 12, inner = 0.78, className, strokeWidth = 2 }: { points?: number; inner?: number; className?: string; strokeWidth?: number }) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? 48 : 48 * inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`);
  }
  return (
    <svg viewBox="0 0 100 100" className={cn("overflow-visible", className)} aria-hidden="true">
      <polygon points={pts.join(" ")} fill="currentColor" stroke="#14110f" strokeWidth={strokeWidth} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Dört köşeli parıltı; şerit ve başlıklarda ayraç olarak kullanılır. */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} aria-hidden="true">
      <path d="M12 0c.9 6.6 4.5 10.2 12 12-7.5 1.8-11.1 5.4-12 12-.9-6.6-4.5-10.2-12-12c7.5-1.8 11.1-5.4 12-12z" fill="currentColor" />
    </svg>
  );
}

/** Kendi etrafında dönen dairesel yazı rozeti. */
export function SpinBadge({ id, text, className, children }: { id: string; text: string; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("grid place-items-center rounded-full border-2 border-ink", className)} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="col-start-1 row-start-1 h-full w-full animate-spin-slow">
        <defs>
          <path id={id} d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text className="font-mono" fontSize="8.4" fontWeight="700" fill="currentColor">
          <textPath href={`#${id}`} textLength="230" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="col-start-1 row-start-1">{children}</span>
    </div>
  );
}

/** Başlıklarda vurgulanan kelime: serif italik + fosforlu kalem bloğu. */
export function Mark({ children, className = "bg-lime" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap px-[0.14em]">
      <span className={cn("absolute inset-x-0 bottom-[0.06em] top-[0.14em] -rotate-1 rounded-[0.18em] border-2 border-ink", className)} aria-hidden="true" />
      <span className="relative font-serif text-[1.06em] font-normal italic tracking-[-0.02em]">{children}</span>
    </span>
  );
}

/** Bölüm üstü küçük etiket: "(01) Neler yapıyoruz" */
export function SectionLabel({ index, children, className }: { index?: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("label-mono flex items-center gap-3", className)}>
      {index && <span className="rounded-full border-2 border-current px-2 py-0.5">{index}</span>}
      <span>{children}</span>
      <span className="h-0.5 w-10 bg-current" aria-hidden="true" />
    </p>
  );
}
