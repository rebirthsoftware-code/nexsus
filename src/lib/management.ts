import { management, type TeamMember } from "@/content/team";
import type { Accent } from "@/lib/accents";

/** Veritabanındaki public_team() fonksiyonunun döndürdüğü satır: yalnızca ad soyad ve görev */
export type ManagementRow = { full_name: string; role: "baskan" | "baskan_yardimcisi" };

const roleTitle: Record<ManagementRow["role"], string> = { baskan: "Kulüp Başkanı", baskan_yardimcisi: "Başkan Yardımcısı" };
const accents: Accent[] = ["brand", "coral", "lime"];

const key = (name: string) => name.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr-TR");

/** Gelen veri beklenen biçimde mi? (Dosyadan ya da ağdan geldiği için denetlenir.) */
export function isManagementRows(value: unknown): value is ManagementRow[] {
  return Array.isArray(value) && value.every((r) => r && typeof r.full_name === "string" && (r.role === "baskan" || r.role === "baskan_yardimcisi"));
}

/**
 * Paneldeki yönetim kurulunu ekip kartlarına çevirir: başkan önce gelir, görev adı yazılır ve
 * src/content/team.ts içindeki `management.details` ile bölüm, fotoğraf gibi ek bilgiler eşlenir.
 */
export function toTeamMembers(rows: ManagementRow[]): TeamMember[] {
  const details = new Map(Object.entries(management.details).map(([name, extra]) => [key(name), extra]));
  return [...rows]
    .sort((a, b) => Number(b.role === "baskan") - Number(a.role === "baskan"))
    .map((row, i) => ({ name: row.full_name.trim(), role: roleTitle[row.role], accent: accents[i % accents.length], ...details.get(key(row.full_name)) }));
}
