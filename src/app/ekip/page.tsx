import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { TeamCard } from "@/components/TeamCard";
import { Reveal } from "@/components/Reveal";
import { CTA } from "@/components/CTA";
import { team } from "@/content/team";

export const metadata: Metadata = {
  title: "Ekip",
  description: "Nexus yönetim kurulu ve koordinatörleri. Farklı bölümlerden gelen gönüllü ekibimizle tanışın.",
};

export default function TeamPage() {
  return (
    <>
      <PageHeader eyebrow="Ekip" title="Bizi tanıyın" description="Her biri farklı bir bölümden gelen, kulübü gönüllü olarak yürüten ekibimiz." />
      <Container className="space-y-20">
        {team.map((group) => (
          <section key={group.title}>
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-white">{group.title}</h2>
              <div className="mt-2 h-px w-16 bg-gradient-to-r from-brand-400 to-accent-400" />
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {group.members.map((m, i) => (
                <Reveal key={`${group.title}-${i}`} delay={(i % 4) * 80}>
                  <TeamCard member={m} />
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </Container>
      <Container className="mt-24 pb-8">
        <CTA />
      </Container>
    </>
  );
}
