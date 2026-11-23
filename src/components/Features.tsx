import { Users, Award, Briefcase, PartyPopper, Lightbulb, Handshake } from "lucide-react";
import { Reveal } from "./Reveal";

const features = [
  {
    Icon: Users,
    title: "Bölümler Arası Ağ",
    text: "Mühendislikten tıbba, işletmeden psikolojiye; farklı bölümlerden insanlarla tanış, ufkunu genişlet.",
  },
  {
    Icon: Award,
    title: "İŞKUR Onaylı Sertifikalar",
    text: "İş kulübü eğitimleri, özgeçmiş ve mülakat atölyeleriyle CV'ne daha mezun olmadan sertifika ekle.",
  },
  {
    Icon: Briefcase,
    title: "Kariyer Buluşmaları",
    text: "Mezunlar ve sektör profesyonelleriyle söyleşiler, staj ve iş fırsatlarına ilk elden erişim.",
  },
  {
    Icon: PartyPopper,
    title: "Sosyal Etkinlikler",
    text: "Tanışma geceleri, geziler, turnuvalar ve kampüs buluşmalarıyla üniversite hayatının tadını çıkar.",
  },
  {
    Icon: Lightbulb,
    title: "Atölyeler & Seminerler",
    text: "Kişisel gelişimden dijital becerilere, üyelerin istediği konularda düzenli atölyeler.",
  },
  {
    Icon: Handshake,
    title: "Proje & İş Birlikleri",
    text: "Diğer kulüpler, kurumlar ve şirketlerle ortak projelerde aktif rol al, deneyim kazan.",
  },
];

export function Features() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f, i) => (
        <Reveal key={f.title} delay={i * 70} as="article" className="card card-hover group p-7">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500/30 to-accent-500/20 text-brand-200 ring-1 ring-white/10 transition-transform group-hover:scale-110">
            <f.Icon className="h-5.5 w-5.5" />
          </div>
          <h3 className="mt-5 font-display text-lg font-semibold text-white">{f.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.text}</p>
        </Reveal>
      ))}
    </div>
  );
}
