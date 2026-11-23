import { cacheLife } from "next/cache";

/**
 * Bugünün tarihi (Türkiye saatiyle, ISO). Sonuç birkaç saatliğine önbelleklenir;
 * böylece sayfalar statik kalır ama tarihi geçen etkinlikler kendiliğinden "geçmiş"e düşer.
 */
export async function getToday(): Promise<string> {
  "use cache";
  cacheLife("hours");
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
}
