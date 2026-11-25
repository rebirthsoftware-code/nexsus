"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { navLinks, socialAccounts } from "@/content/site";
import { socialIcons } from "./icons";
import { Logo } from "./Logo";
import { Container } from "./Container";
import { cn } from "@/lib/utils";

const menuLinks = [{ href: "/", label: "Ana Sayfa" }, ...navLinks];

/**
 * Üst menü.
 * - Geniş ekranda (1024px ve üstü) bağlantılar çubuğun içinde durur.
 * - Daha dar ekranlarda hamburger düğmesi tam ekran bir menü açar. Menü her ekran
 *   boyutunda çalışacak şekilde kurulmuştur: dik telefonda tek sütun, yan çevrilmiş
 *   telefonda iki sütun; içerik ekrana sığmazsa menünün kendisi kaydırılır.
 */
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const close = () => setOpen(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    // Klavye ve ekran okuyucu kullananlar için odağı menüye taşı
    const focusTimer = setTimeout(() => firstLinkRef.current?.focus({ preventScroll: true }), 350);
    const toggle = toggleRef.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // Ekran genişleyip yatay menü görünür olursa (ör. tablet döndürülünce) açık menüyü kapat
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      toggle?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      {/* Yüksekliği sıfır, yapışkan sarmalayıcı: çubuk sayfanın üstünde kalır ama akışta yer kaplamaz */}
      <div className="sticky top-0 z-50 h-0">
        <header className="pt-3 sm:pt-4">
          <Container>
            <nav className="flex items-center justify-between gap-2 rounded-full border-2 border-ink bg-paper py-1.5 pl-4 pr-1.5 shadow-hard-sm max-[359px]:pl-3" aria-label="Ana menü">
              <span onClick={close} className="flex min-w-0 items-center [&>a]:-my-2 [&>a]:py-2">
                <Logo priority className="h-6 max-[359px]:h-5 sm:h-7" />
              </span>

              <ul className="hidden items-center gap-0.5 lg:flex">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      className={cn(
                        "whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors xl:px-4",
                        isActive(l.href) ? "bg-ink text-paper" : "text-ink hover:bg-paper-deep"
                      )}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/basvuru"
                  onClick={close}
                  className="group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-ink bg-brand px-4 py-2 font-display text-sm font-bold tracking-tight text-paper transition-colors hover:bg-navy max-[359px]:px-3"
                >
                  Üye ol
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </Link>
                <button
                  ref={toggleRef}
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-paper lg:hidden"
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
      </div>

      {/* Tam ekran menü. Kendisi kaydırılabilir; böylece hiçbir ekran boyutunda bağlantı gizli kalmaz. */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menüsü"
        inert={!open}
        className={cn(
          "fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-navy text-paper transition-[clip-path,visibility] duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] lg:hidden",
          open ? "visible [clip-path:circle(150%_at_calc(100%-2.75rem)_2.5rem)]" : "invisible [clip-path:circle(0%_at_calc(100%-2.75rem)_2.5rem)]"
        )}
      >
        <div className="mx-auto flex min-h-full w-full max-w-[76rem] flex-col px-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-32 sm:px-8 short:pb-4 short:pt-[6.75rem]">
          <ul className="my-auto grid gap-x-10 gap-y-1.5 landscape:grid-cols-2 short:gap-y-0">
            {menuLinks.map((l, i) => (
              <li
                key={l.href}
                className={cn("transition-all duration-500", open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")}
                style={{ transitionDelay: open ? `${120 + i * 50}ms` : "0ms" }}
              >
                <Link
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={l.href}
                  onClick={close}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={cn(
                    "display-tight flex items-baseline gap-3 whitespace-nowrap py-1.5 text-[clamp(1.75rem,8.5vw,3rem)] landscape:text-[clamp(1.5rem,4.4vw,2.5rem)] short:py-1 short:text-[1.6rem]",
                    isActive(l.href) && "text-lime"
                  )}
                >
                  <span className="label-mono w-6 shrink-0 text-lime">0{i + 1}</span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between gap-4 border-t-2 border-paper/30 pt-5 short:mt-3 short:pt-3">
            <div className="flex gap-2">
              {socialAccounts.map((a) => {
                const Icon = socialIcons[a.key];
                return (
                  <a key={a.key} href={a.href} target="_blank" rel="noopener noreferrer" aria-label={a.name} className="grid h-11 w-11 place-items-center rounded-full border-2 border-paper/60 transition-colors hover:bg-paper hover:text-navy">
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
            <Link href="/basvuru" onClick={close} className="whitespace-nowrap rounded-full border-2 border-paper bg-brand px-5 py-2.5 font-display font-bold text-paper">
              Üye ol
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
