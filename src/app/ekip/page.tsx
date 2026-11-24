import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { TeamCard } from "@/components/TeamCard";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { Mark } from "@/components/Shapes";
import { team } from "@/content/team";

export const metadata: Metadata = {
  title: "Ekip",
  description: "Nexus yönetim kurulu ve koordinatörleri. Farklı bölümlerden gelen gönüllü ekibimizle tanışın.",
};

export default function TeamPage() {
  let counter = 0;
  return (
    <>
      <PageHeader
        eyebrow="Ekip"
        title={
          <>
            Yaka kartlarımız <Mark className="bg-lilac">hazır.</Mark>
          </>
        }
        description="Her biri başka bir bölümden gelen, kulübü gönüllü olarak yürüten ekip."
      />
      <Container className="space-y-24">
        {team.map((group) => (
          <section key={group.title}>
            <Reveal className="flex flex-col gap-2 border-b-2 border-ink pb-5 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="display-tight text-4xl sm:text-5xl">{group.title}</h2>
              <p className="label-mono text-ink-soft">{group.note}</p>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {group.members.map((m, i) => {
                const index = counter++;
                return (
                  <Reveal key={`${group.title}-${i}`} delay={(i % 4) * 90}>
                    <TeamCard member={m} index={index} />
                  </Reveal>
                );
              })}
            </div>
          </section>
        ))}

        {/* Boş kart: yeni ekip üyesi çağrısı */}
        <Reveal>
          <div className="flex flex-col items-start gap-6 rounded-[2rem] border-2 border-dashed border-ink p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
            <div>
              <p className="label-mono text-ink-soft">NX—???</p>
              <h2 className="display-tight mt-3 text-4xl sm:text-5xl">
                Bir sonraki kart <span className="font-serif font-normal italic tracking-[-0.02em] text-brand">senin</span> olabilir.
              </h2>
              <p className="mt-3 max-w-lg text-lg leading-relaxed text-ink-soft">Her dönem koordinatörlük ekiplerine yeni arkadaşlar arıyoruz.</p>
            </div>
            <Button href="/basvuru" className="shrink-0 px-7 py-3.5 text-base">
              Ekibe katıl <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Reveal>
      </Container>
    </>
  );
}
