import Link from "next/link";
import { site } from "@/content/site";

/** Logo: public/logo.png eklerseniz onu kullanacak şekilde güncelleyebilirsiniz. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label={`${site.name} ana sayfa`}>
      <span className="relative grid h-9 w-9 place-items-center">
        <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
          <defs>
            <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <g stroke="url(#logo-g)" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M8 32 L20 8 L32 32" />
            <path d="M8 32 L32 8" opacity="0.5" />
          </g>
          <g fill="url(#logo-g)">
            <circle cx="8" cy="32" r="3.5" />
            <circle cx="20" cy="8" r="3.5" />
            <circle cx="32" cy="32" r="3.5" />
            <circle cx="32" cy="8" r="2.5" opacity="0.7" />
          </g>
        </svg>
        <span className="absolute inset-0 -z-10 rounded-xl bg-brand-500/20 blur-lg transition-opacity opacity-0 group-hover:opacity-100" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-white">
        {site.name}
        <span className="ml-1.5 hidden text-xs font-medium uppercase tracking-[0.2em] text-slate-400 sm:inline">KBÜ</span>
      </span>
    </Link>
  );
}
