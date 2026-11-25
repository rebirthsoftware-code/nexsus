import type { Metadata } from "next";
import { Camera, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { GalleryWall } from "@/components/GalleryWall";
import { PolaroidPlaceholder } from "@/components/Polaroid";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { Mark } from "@/components/Shapes";
import { site } from "@/content/site";
import { getAlbums } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Sizden Kalanlar",
  description: "Nexus stantlarından, etkinliklerinden ve gezilerinden geriye kalan kareler.",
};

const upcoming = ["Stant günü", "Atölye", "Gezi", "Söyleşi", "Kahve buluşması", "Tanışma gecesi", "Sertifika töreni", "Turnuva"];

export default function GalleryPage() {
  const albums = getAlbums();
  const dm = `https://ig.me/m/${site.instagramHandle.replace("@", "")}`;

  return (
    <>
      <PageHeader
        eyebrow="Sizden Kalanlar"
        title={
          <>
            Geriye <Mark className="bg-lime">kareler</Mark> kaldı.
          </>
        }
        description="Stantlardan, etkinliklerden ve gezilerden bizde kalanlar. Bir karede sen de varsan kendini bul, çektiğin fotoğrafı bize gönder."
        aside={
          <span className="hidden h-28 w-28 rotate-6 place-items-center rounded-[1.75rem] border-2 border-ink bg-sun shadow-hard lg:grid" aria-hidden="true">
            <Camera className="h-12 w-12" strokeWidth={1.75} />
          </span>
        }
      />

      <Container>
        {albums.length > 0 ? (
          <GalleryWall albums={albums} />
        ) : (
          <>
            <Reveal className="mb-10 rounded-[1.5rem] border-2 border-dashed border-ink p-6 sm:p-8">
              <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">İlk kareler yolda.</h2>
              <p className="mt-2 max-w-2xl text-lg leading-relaxed text-ink-soft">İlk stant ve etkinlik fotoğrafları çok yakında burada olacak. Bu duvar sizinle dolacak.</p>
            </Reveal>
            <ul className="grid grid-cols-2 items-start gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {upcoming.map((caption, i) => (
                <li key={caption} className="pt-3">
                  <PolaroidPlaceholder index={i} caption={caption} tall={i % 3 === 1} />
                </li>
              ))}
            </ul>
          </>
        )}

        <Reveal className="mt-20 flex flex-col items-start gap-6 rounded-[2rem] border-2 border-ink bg-navy p-8 text-paper shadow-hard-lg sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <div>
            <p className="label-mono text-lime">Senin karen de olsun</p>
            <h2 className="display-tight mt-3 text-4xl sm:text-5xl">Çektiysen gönder.</h2>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-paper/80">
              Etkinlikte ya da stantta çektiğin fotoğrafı Instagram&apos;dan bize yolla, duvara ekleyelim. Bir fotoğrafın kaldırılmasını istersen de aynı yerden yazman yeterli.
            </p>
          </div>
          <Button href={dm} variant="lime" external className="shrink-0 px-7 py-3.5 text-base">
            Fotoğraf gönder <Send className="h-5 w-5" />
          </Button>
        </Reveal>
      </Container>
    </>
  );
}
