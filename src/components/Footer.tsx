import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { site, navLinks } from "@/content/site";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { Year } from "./Year";
import { InstagramIcon, LinkedinIcon, YoutubeIcon } from "./icons";

export function Footer() {
  const socials = [
    { href: site.socials.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
    { href: site.socials.youtube, label: "YouTube", Icon: YoutubeIcon },
  ].filter((s) => s.href);

  return (
    <footer className="relative mt-28 overflow-hidden rounded-t-[2rem] bg-ink text-paper sm:rounded-t-[3rem]">
      <Container className="pb-8 pt-16 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <Logo invert />
            <p className="display-tight mt-8 max-w-xl text-4xl sm:text-5xl">
              Bir sonraki etkinlikte <span className="font-serif font-normal italic tracking-[-0.02em] text-lime">görüşelim.</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-paper px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper hover:text-ink"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="label-mono text-paper/60">Sayfalar</h3>
              <ul className="mt-4 space-y-2.5 font-display text-lg font-bold tracking-tight">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition-colors hover:text-lime">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/basvuru" className="text-lime underline decoration-2 underline-offset-4">
                    Üyelik başvurusu
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="label-mono text-paper/60">İletişim</h3>
              <ul className="mt-4 space-y-3 text-sm text-paper/80">
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                  <a href={`mailto:${site.email}`} className="break-all hover:text-paper">
                    {site.email}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                  <span>{site.location}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* Dev kelime işareti */}
      <p className="display-tight pointer-events-none -mb-[0.16em] select-none text-center text-[25.5vw] leading-none text-[#2b2622]" aria-hidden="true">
        NEXUS
      </p>

      <div className="relative border-t-2 border-paper/15 bg-ink">
        <Container className="flex flex-col items-start justify-between gap-2 py-5 text-xs text-paper/60 sm:flex-row sm:items-center">
          <p>
            © {site.foundedYear}–<Year fallback={site.foundedYear + 2} /> {site.fullName} · {site.university}
          </p>
          <p className="label-mono">Öğrenciler tarafından, öğrenciler için</p>
        </Container>
      </div>
    </footer>
  );
}
