import type { Metadata } from "next";
import { ShieldCheck, Clock3, Users2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { ApplicationForm } from "@/components/ApplicationForm";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Üyelik Başvurusu",
  description: "Nexus'a üye olmak için başvuru formu. Tüm bölümlerden öğrencilere açık, ücretsiz.",
};

const perks = [
  { Icon: Clock3, title: "2 dakika sürer", text: "Kısa bir form, uzun bir dostluk." },
  { Icon: Users2, title: "Herkese açık", text: "Bölüm veya sınıf şartı yok." },
  { Icon: ShieldCheck, title: "Verilerin güvende", text: "Bilgiler yalnızca kulüp içi iletişim için kullanılır." },
];

export default function ApplyPage() {
  return (
    <>
      <PageHeader eyebrow="Üyelik" title="Aramıza katıl" description="Formu doldur, ekibimiz seninle iletişime geçsin. Üyelik ücretsizdir ve tüm bölümlerden öğrencilere açıktır." />
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <Reveal className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            {perks.map((p) => (
              <div key={p.title} className="card flex items-start gap-4 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-brand-200 ring-1 ring-white/10">
                  <p.Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <p className="text-sm text-slate-400">{p.text}</p>
                </div>
              </div>
            ))}
          </Reveal>
          <Reveal delay={100}>
            <ApplicationForm />
          </Reveal>
        </div>
      </Container>
    </>
  );
}
