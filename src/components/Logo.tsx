import Link from "next/link";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Logo işareti: birbirine bağlı dört düğümden oluşan bir "N".
 * Kulübün kendi logosu varsa public/logo.svg ekleyip burada <Image> ile değiştirin.
 */
export function LogoMark({ invert = false, className }: { invert?: boolean; className?: string }) {
  const bg = invert ? "#f3eee3" : "#14110f";
  const line = invert ? "#14110f" : "#f3eee3";
  const dot = invert ? "#2d3fe7" : "#c8f03c";
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill={bg} />
      <polyline points="13,28 13,12 27,28 27,12" fill="none" stroke={line} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {[
        [13, 28],
        [13, 12],
        [27, 28],
        [27, 12],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3.1" fill={dot} stroke={bg} strokeWidth="1.2" />
      ))}
    </svg>
  );
}

export function Logo({ invert = false, className, asLink = true }: { invert?: boolean; className?: string; asLink?: boolean }) {
  const inner = (
    <>
      <LogoMark invert={invert} />
      <span className={cn("font-display text-xl font-extrabold tracking-[-0.04em]", invert ? "text-paper" : "text-ink")}>{site.name}</span>
    </>
  );
  const classes = cn("inline-flex items-center gap-2.5", className);
  if (!asLink) return <span className={classes}>{inner}</span>;
  return (
    <Link href="/" className={classes} aria-label={`${site.name} ana sayfa`}>
      {inner}
    </Link>
  );
}
