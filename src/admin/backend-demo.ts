import { demoDeveloper, demoTeam, randomApplication, seedApplications } from "./demo-data";
import { canDelete, canManageTeam, DELETE_DENIED, MIN_PASSWORD, type AdminUser, type Application, type Backend, type BackendEvent, type ManagedMember } from "./types";

const DATA_KEY = "nexus-panel-demo-veri-v2";
const USER_KEY = "nexus-panel-demo-oturum";
const TEAM_KEY = "nexus-panel-demo-ekip-v1";

/** Demo ekibi: yazılımcı bölümünde yapılan değişiklikler bu tarayıcıda saklanır */
function readTeam(): AdminUser[] {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    if (raw) return JSON.parse(raw) as AdminUser[];
  } catch {
    /* yoksay: örnek ekiple devam */
  }
  return demoTeam;
}

function writeTeam(team: AdminUser[]) {
  try {
    localStorage.setItem(TEAM_KEY, JSON.stringify(team));
  } catch {
    /* yoksay */
  }
}

/** Giriş ekranında seçilebilenler: yönetim ekibi ve yazılımcı */
const profiles = (): AdminUser[] => [...sortTeam(readTeam()), demoDeveloper];

const rank = { baskan: 0, baskan_yardimcisi: 1, yazilimci: 2 } as const;
const sortTeam = <T extends AdminUser>(team: T[]) => [...team].sort((a, b) => rank[a.role] - rank[b.role]);

/** Gerçek kurulumda veritabanının uyguladığı ekip sınırı */
function checkLimits(team: AdminUser[]) {
  if (team.filter((m) => m.role === "baskan").length > 1) throw new Error("Yalnızca bir başkan olabilir.");
  if (team.filter((m) => m.role === "baskan_yardimcisi").length > 2) throw new Error("En fazla iki başkan yardımcısı olabilir.");
}

function requireDeveloper() {
  const user = currentUser();
  if (!user || !canManageTeam(user)) throw new Error("Bu işlem yalnızca yazılımcıya açıktır.");
}

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
    return profiles().find((m) => m.id === id) ?? null;
  } catch {
    return null;
  }
}

export function createDemoBackend(): Backend {
  const listeners = new Set<(event: BackendEvent) => void>();
  let simulated = 0;

  return {
    mode: "demo",
    get demoProfiles() {
      return profiles();
    },
    async getUser() {
      return currentUser();
    },
    /** Demo: "e-posta" yerine seçilen örnek yöneticinin kimliği gelir */
    async signIn(profileId): Promise<AdminUser> {
      const user = profiles().find((m) => m.id === profileId) ?? profiles()[0];
      try {
        localStorage.setItem(USER_KEY, user.id);
      } catch {
        /* yoksay */
      }
      return user;
    },
    async listTeam() {
      return sortTeam(readTeam());
    },
    manage: {
      async checkin() {
        return false;
      },
      async list(): Promise<ManagedMember[]> {
        requireDeveloper();
        return profiles().map((m) => ({ ...m, lastSignInAt: null }));
      },
      async create(member) {
        requireDeveloper();
        const email = member.email.trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Geçerli bir e-posta adresi yazın.");
        if (member.password.length < MIN_PASSWORD) throw new Error(`Şifre en az ${MIN_PASSWORD} karakter olmalı.`);
        const team = readTeam();
        if (team.some((m) => m.email.toLowerCase() === email)) throw new Error("Bu e-posta zaten ekipte.");
        const next = [...team, { id: `demo-${Date.now().toString(36)}`, fullName: member.fullName.trim(), role: member.role, honorific: member.honorific, email }];
        checkLimits(next);
        writeTeam(next);
      },
      async update(id, patch) {
        requireDeveloper();
        if (id === demoDeveloper.id) return; // demo yazılımcısı sabittir
        if (patch.role === "yazilimci" || !patch.honorific) throw new Error("Görev ve hitap seçin.");
        const team = readTeam();
        const promoted = patch.role === "baskan" && team.find((m) => m.id === id)?.role !== "baskan";
        const next = team.map((m) =>
          m.id === id ? { ...m, fullName: patch.fullName.trim(), role: patch.role, honorific: patch.honorific } : promoted && m.role === "baskan" ? { ...m, role: "baskan_yardimcisi" as const } : m
        );
        checkLimits(next);
        writeTeam(next);
      },
      async setPassword(_id, password) {
        requireDeveloper();
        if (password.length < MIN_PASSWORD) throw new Error(`Şifre en az ${MIN_PASSWORD} karakter olmalı.`);
      },
      async remove(id) {
        requireDeveloper();
        if (id === demoDeveloper.id) throw new Error("Kendi hesabını kaldıramazsın.");
        writeTeam(readTeam().filter((m) => m.id !== id));
      },
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
      const user = currentUser();
      if (!user || !canDelete(user)) throw new Error(DELETE_DENIED);
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
      try {
        localStorage.removeItem(TEAM_KEY);
      } catch {
        /* yoksay */
      }
      listeners.forEach((l) => l({ type: "refresh" }));
    },
  };
}
