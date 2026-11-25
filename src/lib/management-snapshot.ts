import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { management, type TeamMember } from "@/content/team";
import { isManagementRows, toTeamMembers } from "./management";

/**
 * Yönetim kurulunun derleme anındaki hali. scripts/setup-db.mjs, site veritabanına bağlı olarak
 * derlenirken paneldeki yönetimi .nexus/yonetim.json dosyasına yazar. Dosya yoksa ya da ekip boşsa
 * örnek kartlar döner. Yalnızca sunucu tarafında (derlemede) çağrılır.
 */
export function getManagement(): { members: TeamMember[]; real: boolean } {
  const file = join(process.cwd(), ".nexus", "yonetim.json");
  if (existsSync(file)) {
    try {
      const rows: unknown = JSON.parse(readFileSync(file, "utf8"));
      if (isManagementRows(rows) && rows.length) return { members: toTeamMembers(rows), real: true };
    } catch {
      /* bozuk dosya: örnek kartlarla devam */
    }
  }
  return { members: management.fallback, real: false };
}
