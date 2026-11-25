import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { AnnouncementsBoard } from "@/components/AnnouncementsBoard";
import { CTA } from "@/components/CTA";
import { Burst, Mark } from "@/components/Shapes";
import { getToday } from "@/lib/today";

export const metadata: Metadata = {
  title: "Duyurular",
  description: "Nexus duyuru panosu: geziler, stantlar, ekip alımları ve kulüpten haberler.",
};

export default async function AnnouncementsPage() {
  const today = await getToday();
  return (
    <>
      <PageHeader
        eyebrow="Duyurular"
        title={
          <>
            Panoda <Mark className="bg-sun">ne</Mark> var?
          </>
        }
        description="Geziler, stantlar, ekip alımları ve kulüpten haberler. Etkinlik takvimine sığmayan her şey burada."
        aside={
          <span className="relative hidden h-36 w-36 -rotate-12 place-items-center text-coral lg:grid">
            <Burst points={12} className="absolute inset-0 h-full w-full" />
            <span className="relative text-center font-display text-lg font-extrabold leading-none tracking-tight text-ink">
              kaçırma
              <br />
              sakın
            </span>
          </span>
        }
      />
      <Container>
        <AnnouncementsBoard today={today} />
      </Container>
      <Container className="mt-24">
        <CTA />
      </Container>
    </>
  );
}
