/**
 * "Sizden Kalanlar" galerisini hazırlar.
 *
 * fotograflar/<albüm klasörü>/ altındaki fotoğrafları okur; her birini web için küçültür
 * (büyük sürüm + küçük önizleme) ve public/galeri/ altına yazar. Sayfanın okuduğu
 * public/galeri/manifest.json dosyasını üretir.
 *
 * - Özgün dosyalar siteye yüklenmez; yalnızca küçültülmüş kopyalar yayınlanır.
 * - Fotoğrafın içindeki konum (GPS) ve cihaz bilgileri kopyalarda yer almaz.
 * - "npm run build" ve "npm run dev" öncesinde kendiliğinden çalışır.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const SRC = "fotograflar";
const OUT = join("public", "galeri");
const IMAGE = /\.(jpe?g|png|webp|avif|heic|heif)$/i;
const LARGE = 1600; // uzun kenar, piksel
const THUMB = 640;

const titleFromSlug = (slug) =>
  slug
    .replace(/^\d{4}-\d{2}-\d{2}-?/, "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1))
    .join(" ");

const safeName = (file) =>
  basename(file, extname(file))
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "foto";

mkdirSync(OUT, { recursive: true });
const albumDirs = existsSync(SRC) ? readdirSync(SRC).filter((d) => statSync(join(SRC, d)).isDirectory()) : [];
const albums = [];
let made = 0;
let skipped = 0;

// En yeni albüm en üstte (klasör adı tarihle başlıyorsa tarihe göre)
for (const dir of albumDirs.sort().reverse()) {
  const srcDir = join(SRC, dir);
  const files = readdirSync(srcDir).filter((f) => IMAGE.test(f)).sort((a, b) => a.localeCompare(b, "tr", { numeric: true }));
  if (!files.length) continue;

  let info = {};
  const infoPath = join(srcDir, "bilgi.json");
  if (existsSync(infoPath)) {
    try {
      info = JSON.parse(readFileSync(infoPath, "utf8"));
    } catch (e) {
      console.warn(`! ${infoPath} okunamadı (${e.message}); klasör adından başlık üretilecek.`);
    }
  }

  const slug = safeName(dir);
  const outDir = join(OUT, slug);
  mkdirSync(outDir, { recursive: true });
  const photos = [];
  const used = new Set();

  for (const file of files) {
    let name = safeName(file);
    while (used.has(name)) name += "-2";
    used.add(name);
    const src = join(srcDir, file);
    const large = join(outDir, `${name}.jpg`);
    const thumb = join(outDir, `${name}-kucuk.jpg`);
    try {
      const fresh = existsSync(large) && existsSync(thumb) && statSync(large).mtimeMs >= statSync(src).mtimeMs;
      if (!fresh) {
        // rotate(): telefonun kaydettiği yön bilgisini uygular; üst veri (konum vb.) çıktıya yazılmaz
        const base = sharp(src).rotate();
        await base.clone().resize({ width: LARGE, height: LARGE, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(large);
        await base.clone().resize({ width: THUMB, height: THUMB, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 74, mozjpeg: true }).toFile(thumb);
        made++;
      }
      const meta = await sharp(thumb).metadata();
      photos.push({ src: `/galeri/${slug}/${name}.jpg`, thumb: `/galeri/${slug}/${name}-kucuk.jpg`, width: meta.width, height: meta.height, caption: info.fotolar?.[file] ?? null });
    } catch (e) {
      skipped++;
      console.warn(`! ${src} işlenemedi, atlandı (${e.message}). JPG, PNG ya da WebP olarak kaydedip tekrar deneyin.`);
    }
  }

  // Kaynağı silinmiş fotoğrafların eski kopyalarını temizle
  const keep = new Set(photos.flatMap((p) => [basename(p.src), basename(p.thumb)]));
  for (const f of readdirSync(outDir)) if (!keep.has(f)) rmSync(join(outDir, f));

  if (photos.length) {
    albums.push({
      slug,
      title: info.baslik || titleFromSlug(dir) || dir,
      date: info.tarih || dir.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || null,
      description: info.aciklama || null,
      photos,
    });
  }
}

// Kaynağı silinmiş albümlerin klasörlerini temizle
const liveSlugs = new Set(albums.map((a) => a.slug));
for (const d of readdirSync(OUT)) {
  const p = join(OUT, d);
  if (statSync(p).isDirectory() && !liveSlugs.has(d)) rmSync(p, { recursive: true });
}

writeFileSync(join(OUT, "manifest.json"), JSON.stringify(albums, null, 2));
const total = albums.reduce((n, a) => n + a.photos.length, 0);
console.log(`Galeri: ${albums.length} albüm, ${total} fotoğraf (${made} yeni işlendi${skipped ? `, ${skipped} atlandı` : ""}).`);
