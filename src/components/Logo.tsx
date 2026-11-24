import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Logodaki "X": mavi ok ile lacivert kol. Ölçüler özgün logodan alınmıştır.
 * Favicon, mühür ve bağlantı haritasının merkezinde kullanılır.
 */
export const MARK = {
  width: 482,
  height: 450,
  blue: "0,0 132,0 286,225 134,450 1,450 153,225",
  navy: "354,0 482,0 331,225 479,450 339,450 255,323 316,225 259,144",
} as const;

export function LogoMark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox={`0 0 ${MARK.width} ${MARK.height}`} className={cn("h-8 w-auto", className)} aria-hidden="true">
      <polygon points={MARK.blue} fill="#015efb" />
      <polygon points={MARK.navy} fill={light ? "#f5f2ea" : "#011e45"} />
    </svg>
  );
}

const files = {
  wordmark: { dark: "/brand/nexus-wordmark.png", light: "/brand/nexus-wordmark-light.png", ratio: 1000 / 242 },
  full: { dark: "/brand/nexus-logo.png", light: "/brand/nexus-logo-light.png", ratio: 1200 / 365 },
} as const;

/**
 * Kulüp logosu.
 * - variant "wordmark": yalnızca NEXUS yazısı (menü gibi küçük alanlar için)
 * - variant "full": altında "Karabük Üniversitesi" yazan tam logo
 * - light: koyu zeminler için açık renkli sürüm
 * Boyutu className ile yükseklik vererek ayarlayın (ör. "h-7").
 */
export function Logo({
  variant = "wordmark",
  light = false,
  className,
  asLink = true,
  priority = false,
}: {
  variant?: keyof typeof files;
  light?: boolean;
  className?: string;
  asLink?: boolean;
  priority?: boolean;
}) {
  const file = files[variant];
  const img = (
    <Image
      src={light ? file.light : file.dark}
      alt={asLink ? `${site.name} ana sayfa` : `${site.fullName} logosu`}
      width={Math.round(120 * file.ratio)}
      height={120}
      priority={priority}
      sizes="(min-width: 640px) 320px, 200px"
      className={cn("h-7 w-auto", className)}
    />
  );
  if (!asLink) return img;
  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      {img}
    </Link>
  );
}
