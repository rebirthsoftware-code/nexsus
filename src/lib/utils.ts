export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const MONTHS_SHORT = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];
const WEEKDAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

/** "2026-12-09" → { day: "09", month: "ARA", year: "2026", weekday: "Çarşamba" } (saat dilimi etkisi olmadan) */
export function dateParts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return { day: String(d).padStart(2, "0"), month: MONTHS_SHORT[m - 1], year: String(y), weekday };
}

/** İki ISO tarih arasındaki gün farkı (b - a) */
export function daysBetween(a: string, b: string) {
  const toUtc = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

/**
 * public/ klasöründeki bir dosyanın adresi. Site bir alt yolda yayınlandığında
 * (GitHub Pages: /depo-adı) düz <img>/<video> yollarına bu alt yol elle eklenmelidir.
 */
export function asset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path.startsWith("/") ? path : `/${path}`}`;
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toLocaleUpperCase("tr-TR"))
    .join("");
}
