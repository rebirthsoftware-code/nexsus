import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAlbums } from "@/lib/gallery";
import { asset, cn } from "@/lib/utils";
import { Polaroid, PolaroidPlaceholder } from "./Polaroid";
import { Reveal } from "./Reveal";

const teasers = ["Stant günü", "Atölye", "Gezi", "Söyleşi"];
// Kareler hafifçe üst üste biner ve farklı yüksekliklerde durur
const offsets = ["sm:mt-6", "sm:-mt-2", "sm:mt-10", "sm:mt-1"];

/** Ana sayfadaki "Sizden Kalanlar" önizlemesi: en yeni dört kare ya da henüz fotoğraf yoksa boş çerçeveler. */
export function HomeGallery() {
  const latest = getAlbums()
    .flatMap((album) => album.photos.map((photo) => ({ photo, album })))
    .slice(0, 4);

  return (
    <div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 pt-3 sm:grid-cols-4 sm:gap-x-6">
        {latest.length > 0
          ? latest.map(({ photo, album }, i) => (
              <Reveal as="li" key={photo.src} delay={i * 90} className={offsets[i]}>
                <Link href={`/sizden-kalanlar#${album.slug}`} className="group block" aria-label={`${album.title} albümünü aç`}>
                  <Polaroid index={i} caption={photo.caption || album.title} className="group-hover:rotate-0 group-hover:scale-[1.03]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- statik yayında görsel optimizasyonu yok; küçültme derleme öncesinde yapılır */}
                    <img src={asset(photo.thumb)} alt={photo.caption || `${album.title} etkinliğinden bir kare`} loading="lazy" decoding="async" className="aspect-[4/5] w-full border-2 border-ink bg-paper-deep object-cover" />
                  </Polaroid>
                </Link>
              </Reveal>
            ))
          : teasers.map((caption, i) => (
              <Reveal as="li" key={caption} delay={i * 90} className={offsets[i]}>
                <PolaroidPlaceholder index={i} caption={caption} tall />
              </Reveal>
            ))}
      </ul>
      <Reveal className={cn("mt-12")}>
        <Link href="/sizden-kalanlar" className="group inline-flex items-center gap-2 border-b-2 border-ink pb-0.5 font-display text-lg font-bold tracking-tight">
          {latest.length > 0 ? "Tüm kareleri gör" : "Fotoğraf duvarına git"}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </div>
  );
}
