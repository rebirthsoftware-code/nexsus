/**
 * Bugünün tarihi (Türkiye saatiyle, ISO).
 * Site statik olarak üretildiği için bu değer derleme anında hesaplanır. Yayın otomasyonu
 * siteyi her gece yeniden derler; böylece "X gün kaldı" sayaçları güncel kalır ve
 * tarihi geçen etkinlikler kendiliğinden "geçmiş"e düşer.
 */
export async function getToday(): Promise<string> {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
}
