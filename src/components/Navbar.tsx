"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { navLinks } from "@/content/site";
import { Logo } from "./Logo";
import { Container } from "./Container";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled || open ? "py-2" : "py-4")}>
      <Container>
        <nav
          className={cn(
            "flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300",
            scrolled || open ? "glass shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]" : "bg-transparent"
          )}
          aria-label="Ana menü"
        >
          <Logo />

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                      active ? "text-white" : "text-slate-300 hover:text-white"
                    )}
                  >
                    {l.label}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-brand-400 to-accent-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden md:block">
            <Link
              href="/basvuru"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-night-900 transition-all hover:bg-brand-200 hover:shadow-[0_0_30px_-8px_rgba(167,139,250,0.9)]"
            >
              Üye Ol <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-full text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        <div
          id="mobile-menu"
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            open ? "mt-2 max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="rounded-2xl border border-white/10 bg-night-900/95 p-3 shadow-2xl backdrop-blur-xl">
            <ul className="flex flex-col">
              {navLinks.map((l, i) => {
                const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                return (
                  <li key={l.href} style={{ transitionDelay: `${i * 30}ms` }}>
                    <Link
                      href={l.href}
                      onClick={close}
                      className={cn(
                        "block rounded-xl px-4 py-3 text-base font-medium",
                        active ? "bg-white/5 text-white" : "text-slate-300"
                      )}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
              <li className="mt-2">
                <Link
                  href="/basvuru"
                  onClick={close}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-3 text-base font-semibold text-white"
                >
                  Üye Ol <ArrowUpRight className="h-4 w-4" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </header>
  );
}
