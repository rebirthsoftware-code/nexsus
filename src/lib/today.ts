/**
 * Bugünün tarihi (Türkiye saatiyle, ISO).
 * Site statik olarak üretildiği için bu değer DERLEME anındaki tarihtir ve yalnızca
 * sayfanın ilk çiziminde kullanılır. Tarayıcıda açılınca useToday() gerçek güne geçer;
 * böylece sayaçlar, site en son ne zaman derlenmiş olursa olsun doğru kalır.
 */
export async function getToday(): Promise<string> {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
}
