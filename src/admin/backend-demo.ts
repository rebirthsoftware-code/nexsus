import { demoTeam, randomApplication, seedApplications } from "./demo-data";
import type { AdminUser, Application, Backend, BackendEvent } from "./types";

const DATA_KEY = "nexus-panel-demo-veri-v2";
const USER_KEY = "nexus-panel-demo-oturum";

function read(): Application[] {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) return JSON.parse(raw) as Application[];
  } catch {
    /* bozuk ya da erişilemeyen depolama: örnek verilerle devam */
  }
  const seeded = seedApplications();
  write(seeded);
  return seeded;
}

function write(list: Application[]) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(list));
  } catch {
    /* gizli sekme vb.: veriler yalnızca bu oturumda kalır */
  }
}

/**
 * Demo arka ucu: veriler bu tarayıcıda saklanır, hiçbir sunucuya gitmez.
 * Paneli kurulum yapmadan denemek içindir; giriş ekranında örnek yöneticilerden biri seçilir.
 */
function currentUser(): AdminUser | null {
  try {
    const id = localStorage.getItem(USER_KEY);
    return demoTeam.find((m) => m.id === id) ?? null;
  } catch {
    return null;
  }
}

export function createDemoBackend(): Backend {
  const listeners = new Set<(event: BackendEvent) => void>();
  let simulated = 0;

  return {
    mode: "demo",
    demoProfiles: demoTeam,
    async getUser() {
      return currentUser();
    },
    /** Demo: "e-posta" yerine seçilen örnek yöneticinin kimliği gelir */
    async signIn(profileId): Promise<AdminUser> {
      const user = demoTeam.find((m) => m.id === profileId) ?? demoTeam[0];
      try {
        localStorage.setItem(USER_KEY, user.id);
      } catch {
        /* yoksay */
      }
      return user;
    },
    async listTeam() {
      return demoTeam;
    },
    async signOut() {
      try {
        localStorage.removeItem(USER_KEY);
      } catch {
        /* yoksay */
      }
    },
    async list() {
      return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async update(id, patch) {
      // Durum değişirse kimin, ne zaman değiştirdiği kaydedilir (gerçek kurulumda bunu veritabanı yapar)
      const stamp = patch.status ? { handledBy: currentUser()?.id ?? null, handledAt: new Date().toISOString() } : {};
      write(read().map((a) => (a.id === id ? { ...a, ...patch, ...stamp } : a)));
    },
    async remove(id) {
      write(read().filter((a) => a.id !== id));
    },
    subscribe(onEvent) {
      listeners.add(onEvent);
      return () => listeners.delete(onEvent);
    },
    async savePushSubscription() {},
    async removePushSubscription() {},
    async simulateNew() {
      const application = randomApplication(simulated++);
      write([application, ...read()]);
      listeners.forEach((l) => l({ type: "insert", application }));
      return application;
    },
    async reset() {
      write(seedApplications());
      listeners.forEach((l) => l({ type: "refresh" }));
    },
  };
}
