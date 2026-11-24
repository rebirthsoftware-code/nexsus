// Bildirim sunucusu için VAPID anahtar çifti üretir.  Kullanım:  npm run vapid
// AÇIK anahtar siteye (GitHub değişkeni) ve Supabase'e, GİZLİ anahtar yalnızca Supabase'e yazılır.
import { generateKeyPairSync } from "node:crypto";

const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const jwk = privateKey.export({ format: "jwk" });
const raw = Buffer.concat([Buffer.from([4]), Buffer.from(jwk.x, "base64url"), Buffer.from(jwk.y, "base64url")]);
void publicKey;

console.log("\nVAPID anahtarları üretildi.\n");
console.log("VAPID_PUBLIC_KEY  (açık, paylaşılabilir):");
console.log(raw.toString("base64url"));
console.log("\nVAPID_PRIVATE_KEY (GİZLİ, kimseyle paylaşmayın, depoya eklemeyin):");
console.log(jwk.d);
console.log("\nİkisini de Supabase > Edge Functions > Secrets bölümüne, açık anahtarı ayrıca");
console.log("GitHub > Settings > Variables altına VAPID_PUBLIC_KEY adıyla ekleyin.\n");
