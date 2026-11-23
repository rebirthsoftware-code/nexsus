import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { ApplicationForm } from "@/components/ApplicationForm";
import { Mark } from "@/components/Shapes";

export const metadata: Metadata = {
  title: "Üyelik Başvurusu",
  description: "Nexus'a üye olmak için başvuru formu. Tüm bölümlerden öğrencilere açık ve ücretsiz.",
};

export default function ApplyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Üyelik başvurusu"
        title={
          <>
            Kartını <Mark>bastıralım.</Mark>
          </>
        }
        description="Formu doldur, ekipten biri sana yazsın. Üyelik ücretsiz ve tüm bölümlere açık."
      />
      <Container>
        <ApplicationForm />
      </Container>
    </>
  );
}
