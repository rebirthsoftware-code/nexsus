import type { Metadata } from "next";
import { Target, Eye, Heart, Network } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { CTA } from "@/components/CTA";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: `${site.fullName} kimdir, neyi amaçlar? Kulübün hikayesi, misyonu ve değerleri.`,
};

const values = [
  { Icon: Network, title: "Bağlantı", text: "Bölüm, sınıf ve ilgi alanı fark etmeksizin insanları birbirine bağlarız." },
  { Icon: Heart, title: "Kapsayıcılık", text: "Herkesin kendini ait hissettiği, önyargısız bir topluluk oluştururuz." },
  { Icon: Target, title: "Gelişim", text: "Sertifikalı eğitimler ve atölyelerle üyelerimizin kariyerine somut katkı sağlarız." },
  { Icon: Eye, title: "Şeffaflık", text: "Kararlarımızı üyelerimizle birlikte alır, açık iletişimi esas alırız." },
];

const timeline = [
  { year: String(site.foundedYear), title: "Kuruluş", text: "Bir avuç öğrenci, bölümler arası iletişim eksikliğini fark edip Nexus'u kurdu." },
  { year: "İlk dönem", title: "İlk tanışma buluşması", text: "Farklı fakültelerden onlarca öğrenci aynı salonda bir araya geldi." },
  { year: "Sonraki adım", title: "İŞKUR iş birliği", text: "İş kulübü eğitimleriyle üyelerimiz ilk sertifikalarını aldı." },
  { year: "Bugün", title: "Büyüyen topluluk", text: "Her geçen dönem daha fazla bölümden, daha fazla üyeyle büyümeye devam ediyoruz." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hakkımızda"
        title="Bağ kurmak için kurulduk."
        description={`${site.fullName}, ${site.university}'nde farklı bölümlerden öğrencileri bir araya getirmek amacıyla öğrenciler tarafından kurulan bağımsız bir öğrenci topluluğudur.`}
      />

      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <Reveal className="space-y-5 text-lg leading-relaxed text-slate-300">
            <p>
              Üniversitede çoğu kulüp tek bir bölümün etrafında şekillenir. Biz bunun tersini yapmak istedik: mühendislik
              öğrencisinin psikoloji öğrencisiyle, hukuk öğrencisinin tasarım öğrencisiyle tanışabileceği bir alan açmak.
            </p>
            <p>
              Nexus&apos;ta sosyalleşme bir araç; asıl amaç birbirinden öğrenmek. Etkinliklerimizin bir kısmı tamamen eğlence
              odaklı; bir kısmı ise İŞKUR gibi kurumlarla yürüttüğümüz, mezun olmadan CV&apos;ne sertifika eklemeni sağlayan
              kariyer programları.
            </p>
            <p>
              Yönetim kurulumuzdan koordinatörlerimize kadar herkes gönüllü ve her biri farklı bir bölümden. Çünkü çeşitlilik
              bizim için bir slogan değil, çalışma biçimimiz.
            </p>
          </Reveal>

          <Reveal delay={100} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {values.map((v) => (
              <div key={v.title} className="card p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500/15 text-brand-200 ring-1 ring-white/10">
                    <v.Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-white">{v.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{v.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </Container>

      <section className="py-24">
        <Container>
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Yolculuğumuz</h2>
          </Reveal>
          <ol className="relative mt-12 space-y-10 border-l border-white/10 pl-8">
            {timeline.map((t, i) => (
              <Reveal key={t.title} as="li" delay={i * 90} className="relative">
                <span className="absolute -left-[2.4rem] top-1 grid h-5 w-5 place-items-center rounded-full bg-night-900 ring-2 ring-brand-400">
                  <span className="h-2 w-2 rounded-full bg-accent-400" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">{t.year}</span>
                <h3 className="mt-1 font-display text-xl font-semibold text-white">{t.title}</h3>
                <p className="mt-2 max-w-xl text-slate-400">{t.text}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <Container className="pb-8">
        <CTA />
      </Container>
    </>
  );
}
