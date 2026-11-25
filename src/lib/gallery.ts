import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type GalleryPhoto = { src: string; thumb: string; width: number; height: number; caption: string | null };
export type GalleryAlbum = { slug: string; title: string; date: string | null; description: string | null; photos: GalleryPhoto[] };

/**
 * "Sizden Kalanlar" albümleri. Liste derleme öncesinde scripts/build-gallery.mjs tarafından
 * fotograflar/ klasöründen üretilir (public/galeri/manifest.json). Yalnızca sunucu tarafında çağrılır.
 */
export function getAlbums(): GalleryAlbum[] {
  const file = join(process.cwd(), "public", "galeri", "manifest.json");
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, "utf8")) as GalleryAlbum[];
  } catch {
    return [];
  }
}
