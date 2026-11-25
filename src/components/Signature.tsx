import { ArrowUpRight } from "lucide-react";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Yazılım imzası: siteyi tasarlayıp geliştiren ekibin adı.
 * Ad ve bağlantı src/content/site.ts → developer alanından gelir.
 */
export function Signature({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const { name, url } = site.developer;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border-2 py-1 pl-1 pr-3 transition-colors",
        tone === "light" ? "border-paper/30 text-paper/80 hover:border-paper hover:text-paper" : "border-ink/25 text-ink-soft hover:border-ink hover:text-ink",
        className
      )}
      aria-label={`Tasarım ve yazılım: ${name}`}
    >
      {/* Küçük mühür: kod ayraçları */}
      <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[0.62rem] font-bold", tone === "light" ? "bg-lime text-ink" : "bg-ink text-lime")} aria-hidden="true">
        {"</>"}
      </span>
      <span className="label-mono text-[0.62rem] normal-case tracking-[0.04em]">
        <span className="opacity-70">Tasarım ve yazılım</span> <strong className="font-bold">{name}</strong>
      </span>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:rotate-45" aria-hidden="true" />
    </a>
  );
}
