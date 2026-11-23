import type { Metadata } from "next";
import { ArrowUpRight, MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { Mark } from "@/components/Shapes";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Nexus ile iletişime geçin: Instagram, e-posta ve kampüs adresi.",
};

export default function ContactPage() {
  const channels = [
    { title: "Instagram", value: site.instagramHandle, href: site.socials.instagram, note: "Duyurular ve en hızlı cevap", hover: "hover:bg-coral" },
    { title: "E-posta", value: site.email, href: `mailto:${site.email}`, note: "İş birliği, sponsorluk, resmi yazışma", hover: "hover:bg-lime" },
    site.socials.linkedin && { title: "LinkedIn", value: "Nexus KBÜ", href: site.socials.linkedin, note: "Mezun ağı ve kurumsal iletişim", hover: "hover:bg-lilac" },
    site.socials.whatsapp && { title: "WhatsApp", value: "Topluluğa katıl", href: site.socials.whatsapp, note: "Üyelerin anlık duyuru kanalı", hover: "hover:bg-sun" },
  ].filter(Boolean) as Array<{ title: string; value: string; href: string; note: string; hover: string }>;

  return (
    <>
      <PageHeader
        eyebrow="İletişim"
        title={
          <>
            Bir mesaj <Mark className="bg-sun">uzağız.</Mark>
          </>
        }
        description="Soru, öneri ya da iş birliği fikrin mi var? Hangisi kolayına gelirse oradan yaz."
      />
      <Container>
        <ul className="border-t-2 border-ink">
          {channels.map((c, i) => (
            <Reveal as="li" key={c.title} delay={i * 80} className="border-b-2 border-ink">
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={cn("group flex flex-col gap-2 px-2 py-8 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-10", c.hover)}
              >
                <div>
                  <p className="label-mono text-ink-soft group-hover:text-ink">
                    0{i + 1} · {c.note}
                  </p>
                  <p className="display-tight mt-2 text-4xl sm:text-6xl">{c.title}</p>
                </div>
                <p className="flex items-center gap-3 break-all font-display text-lg font-bold tracking-tight sm:text-2xl">
                  {c.value}
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="h-6 w-6" />
                  </span>
                </p>
              </a>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-12 flex items-start gap-4 rounded-[1.75rem] border-2 border-ink bg-paper-deep p-6 shadow-hard sm:p-8">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun" aria-hidden="true">
            <MapPin className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em]">Bizi kampüste bul</h2>
            <p className="mt-1 text-lg text-ink-soft">{site.location}</p>
            <p className="mt-1 text-sm text-ink-soft">Salon ve saat bilgisi her etkinlik duyurusunda ayrıca paylaşılır.</p>
          </div>
        </Reveal>
      </Container>
    </>
  );
}
