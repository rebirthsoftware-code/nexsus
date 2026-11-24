"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { navLinks, site } from "@/content/site";
import { Logo } from "./Logo";
import { Container } from "./Container";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
        <Container>
          <nav className="flex items-center justify-between rounded-full border-2 border-ink bg-paper py-1.5 pl-4 pr-1.5 shadow-hard-sm" aria-label="Ana menü">
            <span onClick={close}>
              <Logo priority className="h-6 sm:h-7" />
            </span>

            <ul className="hidden items-center gap-1 md:flex">
              {navLinks.map((l) => {
                const active = pathname.startsWith(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                        active ? "bg-ink text-paper" : "text-ink hover:bg-paper-deep"
                      )}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <Link
                href="/basvuru"
                onClick={close}
                className="group inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-brand px-4 py-2 font-display text-sm font-bold tracking-tight text-paper transition-colors hover:bg-navy"
              >
                Üye ol
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
              </Link>
              <button
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-paper md:hidden"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              >
                <span className="relative block h-3 w-4" aria-hidden="true">
                  <span className={cn("absolute left-0 h-0.5 w-4 bg-ink transition-all duration-300", open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0")} />
                  <span className={cn("absolute left-0 h-0.5 w-4 bg-ink transition-all duration-300", open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0")} />
                </span>
              </button>
            </div>
          </nav>
        </Container>
      </header>

      {/* Mobil menü: sağ üstten açılan tam ekran panel */}
      <div
        id="mobile-menu"
        inert={!open}
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-navy px-6 pb-8 pt-28 text-paper transition-[clip-path] duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] md:hidden",
          open ? "[clip-path:circle(150%_at_calc(100%-2.75rem)_2.5rem)]" : "[clip-path:circle(0%_at_calc(100%-2.75rem)_2.5rem)]"
        )}
      >
        <ul className="flex flex-1 flex-col justify-center gap-2">
          {[{ href: "/", label: "Ana Sayfa" }, ...navLinks].map((l, i) => (
            <li
              key={l.href}
              className={cn("transition-all duration-500", open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")}
              style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
            >
              <Link href={l.href} onClick={close} className="display-tight flex items-baseline gap-3 py-1.5 text-5xl">
                <span className="label-mono text-lime">0{i + 1}</span>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t-2 border-paper/30 pt-5">
          <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className="label-mono normal-case">
            {site.instagramHandle}
          </a>
          <Link href="/basvuru" onClick={close} className="rounded-full border-2 border-paper bg-brand px-5 py-2.5 font-display font-bold text-paper">
            Üye ol
          </Link>
        </div>
      </div>
    </>
  );
}
