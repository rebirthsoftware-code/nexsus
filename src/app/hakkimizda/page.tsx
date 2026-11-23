import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { CTA } from "@/components/CTA";
import { Marquee } from "@/components/Marquee";
import { Mark, SectionLabel } from "@/components/Shapes";
import { departments, site } from "@/content/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: `${site.fullName} kimdir, neyi amaçlar? Kulübün hikayesi, değerleri ve yolculuğu.`,
};

const values = [
  { title: "Bağlantı", text: "Bölüm, sınıf ve ilgi alanı fark etmeksizin insanları birbirine bağlarız.", cls: "bg-cobalt text-paper" },
  { title: "Kapsayıcılık", text: "Herkesin kendini ait hissettiği, önyargısız bir topluluk kurarız.", cls: "bg-coral" },
  { title: "Gelişim", text: "Sertifikalı eğitimler ve atölyelerle üyelerin kariyerine somut katkı sağlarız.", cls: "bg-lime" },
  { title: "Şeffaflık", text: "Kararları üyelerle birlikte alır, açık iletişimi esas alırız.", cls: "bg-lilac" },
];

// TODO: kulübün gerçek hikayesiyle güncelleyin
const timeline = [
  { when: String(site.foundedYear), title: "Kuruluş", text: "Bir avuç öğrenci, bölümler arasındaki kopukluğu fark edip Nexus'u kurdu.", cls: "bg-lime" },
  { when: "İlk dönem", title: "İlk tanışma buluşması", text: "Farklı fakültelerden onlarca öğrenci ilk kez aynı salonda buluştu.", cls: "bg-sun" },
  { when: "Ardından", title: "İŞKUR iş birliği", text: "İş kulübü eğitimleriyle üyelerimiz ilk sertifikalarını aldı.", cls: "bg-coral" },
  { when: "Bugün", title: "Büyüyen ağ", text: "Her dönem daha fazla bölümden, daha fazla üyeyle büyümeye devam ediyoruz.", cls: "bg-lilac" },
];

function Dictionary() {
  return (
    <div className="w-full max-w-sm rotate-2 rounded-3xl border-2 border-ink bg-sun p-6 shadow-hard">
      <p className="font-serif text-5xl italic leading-none">nexus</p>
      <p className="label-mono mt-2 text-ink-soft">/ˈnek.sus/ · isim · Latince</p>
      <ol className="mt-4 list-inside list-decimal space-y-1.5 font-medium leading-snug">
        <li>Bağ, bağlantı.</li>
        <li>Bir ağın düğüm noktası.</li>
        <li>KBÜ&apos;de farklı bölümleri buluşturan kulüp.</li>
      </ol>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hakkımızda"
        title={
          <>
            Bağ kurmak için <Mark>kurulduk.</Mark>
          </>
        }
        description={`${site.fullName}, ${site.university}'nde farklı bölümlerden öğrencileri bir araya getirmek için öğrenciler tarafından kuruldu.`}
        aside={<Dictionary />}
      />

      {/* Manifesto */}
      <Container>
        <Reveal className="max-w-5xl">
          <SectionLabel>Neden varız</SectionLabel>
          <p className="mt-8 font-display text-3xl font-bold leading-[1.15] tracking-[-0.03em] sm:text-4xl lg:text-5xl">
            Üniversitede çoğu kulüp tek bir bölümün etrafında döner. Biz tersini istedik: mühendislik öğrencisinin{" "}
            <span className="font-serif font-normal italic text-cobalt">psikoloji</span> öğrencisiyle, hukukçunun{" "}
            <span className="font-serif font-normal italic text-coral">tasarımcıyla</span> tanışabildiği bir yer.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-8 text-lg leading-relaxed text-ink-soft md:grid-cols-2">
          <Reveal>
            <p>
              Nexus&apos;ta sosyalleşmek bir araç, asıl amaç birbirinden öğrenmek. Etkinliklerimizin bir kısmı tamamen eğlence için; bir kısmı ise İŞKUR gibi kurumlarla
              yürüttüğümüz, mezun olmadan özgeçmişine sertifika eklemeni sağlayan kariyer programları.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <p>
              Yönetim kurulundan koordinatörlere kadar herkes gönüllü ve her biri başka bir bölümden. Çünkü çeşitlilik bizim için bir slogan değil, çalışma biçimi.
            </p>
          </Reveal>
        </div>
      </Container>

      <div className="mt-24 overflow-x-clip">
        <Marquee items={departments} className="rotate-1 scale-[1.03] bg-cobalt font-display text-2xl font-extrabold uppercase tracking-tight text-paper sm:text-3xl" />
      </div>

      {/* Değerler */}
      <section className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionLabel>Değerlerimiz</SectionLabel>
            <h2 className="display-tight mt-6 text-5xl sm:text-6xl">
              Dört kelimeyle <Mark className="bg-sun">biz.</Mark>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 80} className={cn("liftable flex min-h-[15rem] flex-col rounded-[1.75rem] border-2 border-ink p-6 shadow-hard", v.cls)}>
                <span className="label-mono">0{i + 1}</span>
                <h3 className="mt-auto font-display text-3xl font-extrabold tracking-[-0.03em]">{v.title}</h3>
                <p className="mt-2 leading-relaxed opacity-90">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Yolculuk */}
      <section className="border-y-2 border-ink bg-paper-deep py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionLabel>Yolculuğumuz</SectionLabel>
            <h2 className="display-tight mt-6 text-5xl sm:text-6xl">
              Düğüm <Mark className="bg-lilac">düğüm</Mark> büyüdük.
            </h2>
          </Reveal>
          <ol className="relative mt-14 space-y-10 pl-16 sm:pl-20">
            <span className="absolute bottom-4 left-[1.4rem] top-4 border-l-2 border-dashed border-ink sm:left-[1.9rem]" aria-hidden="true" />
            {timeline.map((t, i) => (
              <Reveal key={t.title} as="li" delay={i * 90} className="relative">
                <span className={cn("absolute -left-16 top-0 grid h-12 w-12 place-items-center rounded-full border-2 border-ink font-mono text-sm font-bold shadow-hard-sm sm:-left-20 sm:h-16 sm:w-16", t.cls)} aria-hidden="true">
                  0{i + 1}
                </span>
                <p className="label-mono text-ink-soft">{t.when}</p>
                <h3 className="mt-1 font-display text-3xl font-extrabold tracking-[-0.03em]">{t.title}</h3>
                <p className="mt-2 max-w-xl text-lg leading-relaxed text-ink-soft">{t.text}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <Container className="mt-24">
        <CTA />
      </Container>
    </>
  );
}
