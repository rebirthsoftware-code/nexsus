import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { InstagramIcon, LinkedinIcon, YoutubeIcon } from "./icons";
import { site, navLinks } from "@/content/site";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { Year } from "./Year";

export function Footer() {
  const socials = [
    { href: site.socials.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
    { href: site.socials.youtube, label: "YouTube", Icon: YoutubeIcon },
    { href: site.socials.whatsapp, label: "WhatsApp", Icon: MessageCircle },
  ].filter((s) => s.href);

  return (
    <footer className="relative mt-24 border-t border-white/5">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent" />
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">{site.description}</p>
            <div className="mt-5 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-slate-300 transition-all hover:border-brand-400/60 hover:text-white hover:shadow-[0_0_24px_-6px_rgba(167,139,250,0.8)]"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Sayfalar</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-slate-400 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/basvuru" className="text-brand-300 transition-colors hover:text-white">
                  Üyelik Başvurusu
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">İletişim</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <a href={`mailto:${site.email}`} className="hover:text-white">
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <span>{site.location}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>
            © {site.foundedYear}–<Year fallback={site.foundedYear + 1} /> {site.fullName}. {site.university} öğrenci kulübüdür.
          </p>
          <p>Öğrenciler tarafından, öğrenciler için tasarlandı.</p>
        </div>
      </Container>
    </footer>
  );
}
