import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, ArrowUpRight } from "lucide-react";
import { InstagramIcon, LinkedinIcon } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Nexus ile iletişime geçin: Instagram, e-posta ve kampüs adresi.",
};

export default function ContactPage() {
  const channels = [
    { Icon: InstagramIcon, title: "Instagram", value: "@nexuskarabukuni", href: site.socials.instagram, text: "Duyurular ve etkinlik paylaşımları için en hızlı kanal." },
    { Icon: Mail, title: "E-posta", value: site.email, href: `mailto:${site.email}`, text: "İş birliği, sponsorluk ve resmi yazışmalar." },
    site.socials.linkedin && { Icon: LinkedinIcon, title: "LinkedIn", value: "Nexus KBÜ", href: site.socials.linkedin, text: "Kurumsal iletişim ve mezun ağı." },
    site.socials.whatsapp && { Icon: MessageCircle, title: "WhatsApp Topluluğu", value: "Katıl", href: site.socials.whatsapp, text: "Üyelerimizin anlık duyuru kanalı." },
  ].filter(Boolean) as Array<{ Icon: typeof Mail; title: string; value: string; href: string; text: string }>;

  return (
    <>
      <PageHeader eyebrow="İletişim" title="Bize ulaşın" description="Soru, öneri veya iş birliği teklifin mi var? Aşağıdaki kanallardan herhangi biriyle yazabilirsin." />
      <Container>
        <div className="grid gap-5 md:grid-cols-2">
          {channels.map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="card card-hover group flex items-start gap-4 p-6">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-200 ring-1 ring-white/10">
                  <c.Icon className="h-5.5 w-5.5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold text-white">{c.title}</h2>
                    <ArrowUpRight className="h-4 w-4 text-slate-500 transition-all group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="text-sm font-medium text-brand-200">{c.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{c.text}</p>
                </div>
              </a>
            </Reveal>
          ))}
          <Reveal delay={channels.length * 80} className="card flex items-start gap-4 p-6 md:col-span-2">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-200 ring-1 ring-white/10">
              <MapPin className="h-5.5 w-5.5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-white">Adres</h2>
              <p className="mt-1 text-sm text-slate-400">{site.location}</p>
              <p className="mt-1 text-xs text-slate-500">Kulüp odası ve etkinlik salonu bilgileri her etkinlik duyurusunda ayrıca paylaşılır.</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </>
  );
}
