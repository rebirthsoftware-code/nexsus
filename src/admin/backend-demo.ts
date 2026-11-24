import { randomApplication, seedApplications } from "./demo-data";
import type { AdminUser, Application, Backend, BackendEvent } from "./types";

const DATA_KEY = "nexus-panel-demo-veri-v1";
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
 * Paneli kurulum yapmadan denemek içindir; her e-posta ve şifreyle giriş yapılabilir.
 */
export function createDemoBackend(): Backend {
  const listeners = new Set<(event: BackendEvent) => void>();
  let simulated = 0;

  return {
    mode: "demo",
    async getUser() {
      try {
        const email = localStorage.getItem(USER_KEY);
        return email ? { email } : null;
      } catch {
        return null;
      }
    },
    async signIn(email): Promise<AdminUser> {
      const user = { email: email.trim() || "demo@nexus" };
      try {
        localStorage.setItem(USER_KEY, user.email);
      } catch {
        /* yoksay */
      }
      return user;
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
      write(read().map((a) => (a.id === id ? { ...a, ...patch } : a)));
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
