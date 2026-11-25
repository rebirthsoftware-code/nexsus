/** Yönetim panelinin veri modeli ve arka uç (backend) sözleşmesi. */

export type Status = "new" | "pending" | "approved" | "rejected";

export const statusOrder: Status[] = ["new", "pending", "approved", "rejected"];

export const statusMeta: Record<Status, { label: string; pill: string; dot: string }> = {
  new: { label: "Yeni", pill: "bg-brand text-paper", dot: "bg-brand" },
  pending: { label: "Beklemede", pill: "bg-sun text-ink", dot: "bg-sun" },
  approved: { label: "Onaylandı", pill: "bg-lime text-ink", dot: "bg-lime" },
  rejected: { label: "Reddedildi", pill: "bg-paper-deep text-ink-soft", dot: "bg-ink-soft" },
};

export type Application = {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  classYear: string;
  studentNo: string | null;
  attractions: string[];
  note: string | null;
  status: Status;
  adminNote: string | null;
  /** Panelde açılıp görüldü mü */
  seen: boolean;
  /** Durumu en son değiştiren yöneticinin kimliği ve zamanı */
  handledBy: string | null;
  handledAt: string | null;
};

export type ApplicationPatch = Partial<Pick<Application, "status" | "adminNote" | "seen">>;

/**
 * Paneldeki görevler. Yönetim ekibi bir başkan ve iki başkan yardımcısıdır.
 * "yazilimci" siteyi geliştiren kişidir: yönetim ekibini panelden ekler, değiştirir, kaldırır.
 */
export type Role = "baskan" | "baskan_yardimcisi" | "yazilimci";
/** Yönetim ekibindeki görevler (yazılımcı hariç) */
export type ManagerRole = Exclude<Role, "yazilimci">;
export type Honorific = "Bey" | "Hanım";

export const roleLabel: Record<Role, string> = { baskan: "Başkan", baskan_yardimcisi: "Başkan Yardımcısı", yazilimci: "Yazılımcı" };

/** Görev etiketinin renkleri */
export const rolePill: Record<Role, string> = { baskan: "bg-brand text-paper", baskan_yardimcisi: "bg-sun text-ink", yazilimci: "bg-ink text-lime" };

/** Paneldeki bir kişi */
export type TeamMember = {
  id: string;
  fullName: string;
  role: Role;
  /** Yalnızca karşılamada kullanılan hitap: "Hoş geldiniz, Ahmet Bey". Yazılımcıda boş olabilir. */
  honorific: Honorific | null;
};

/** Giriş yapmış kişi */
export type AdminUser = TeamMember & { email: string };

/** Yazılımcının "Ekip yönetimi" bölümünde gördüğü kayıt: giriş e-postası ve son giriş zamanıyla */
export type ManagedMember = TeamMember & { email: string; lastSignInAt: string | null };

export type NewMember = { email: string; password: string; fullName: string; role: ManagerRole; honorific: Honorific };
export type MemberPatch = { fullName: string; role: Role; honorific: Honorific | null };

/**
 * Yetkiler. Başkan yardımcıları başvuruları görür, durumunu ve notunu değiştirir;
 * kalıcı silme yalnızca başkandadır (ve yazılımcıda). Yönetim ekibini yalnızca yazılımcı
 * düzenler. Aynı kurallar veritabanında da uygulanır.
 */
export const canDelete = (person: Pick<TeamMember, "role">) => person.role === "baskan" || person.role === "yazilimci";
export const canManageTeam = (person: Pick<TeamMember, "role">) => person.role === "yazilimci";

export const DELETE_DENIED = "Başvuruyu yalnızca başkan silebilir.";

export const MIN_PASSWORD = 8;

/**
 * Karşılama hitabının parçaları: "Ahmet Yılmaz" + "Bey" → { name: "Ahmet", honorific: "Bey" }
 * (iki adı olanlarda: "Ali Kemal" + "Bey"). Hitabı olmayan kişi (yazılımcı) tam adıyla karşılanır.
 * YALNIZCA karşılamada kullanılır (giriş sonrası ekran ve özet sayfasındaki selam).
 * Panelin diğer yerlerinde kişi düz adı soyadıyla (fullName) görünür.
 */
export function greetingParts(person: Pick<TeamMember, "fullName" | "honorific">): { name: string; honorific: Honorific | null } {
  const full = person.fullName.trim();
  if (!person.honorific) return { name: full, honorific: null };
  const parts = full.split(/\s+/).filter(Boolean);
  return { name: parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0] || "", honorific: person.honorific };
}

/** Karşılama hitabı tek satırda: "Ahmet Bey" */
export function addressName(person: Pick<TeamMember, "fullName" | "honorific">) {
  const { name, honorific } = greetingParts(person);
  return honorific ? `${name} ${honorific}` : name;
}

/**
 * Ekip yönetimi: yöneticileri ekler, düzenler, şifrelerini yeniler, kaldırır.
 * Yalnızca yazılımcı çağırabilir; kural veritabanında da uygulanır.
 */
export interface TeamAdmin {
  /** Yazılımcı girişini kaydeder; şifre hâlâ kurulumun ürettiği geçici şifreyse true döner */
  checkin(): Promise<boolean>;
  /** Yazılımcı dahil paneldeki herkes */
  list(): Promise<ManagedMember[]>;
  create(member: NewMember): Promise<void>;
  update(id: string, patch: MemberPatch): Promise<void>;
  setPassword(id: string, password: string): Promise<void>;
  remove(id: string): Promise<void>;
}

export type BackendEvent = { type: "insert"; application: Application } | { type: "refresh" };

/**
 * Panelin konuştuğu arka uç. İki uygulaması var:
 * - demo: tarayıcıda saklanan örnek veriler (kurulum gerektirmez)
 * - supabase: gerçek veritabanı, hesaplı giriş ve anlık güncelleme
 */
export interface Backend {
  mode: "demo" | "supabase";
  getUser(): Promise<AdminUser | null>;
  signIn(email: string, password: string): Promise<AdminUser>;
  signOut(): Promise<void>;
  /** Yönetim ekibi (başkan önce). Yazılımcı bu listede yer almaz. */
  listTeam(): Promise<TeamMember[]>;
  /** Giriş yapan kişinin kendi şifresini değiştirir. Demo modunda yoktur. */
  changePassword?(password: string): Promise<void>;
  /** Yalnızca yazılımcının kullanabildiği ekip yönetimi */
  manage: TeamAdmin;
  /** Yalnızca demo: giriş ekranında seçilebilen örnek yöneticiler */
  demoProfiles?: AdminUser[];
  list(): Promise<Application[]>;
  update(id: string, patch: ApplicationPatch): Promise<void>;
  remove(id: string): Promise<void>;
  /** Yeni başvuru ve değişiklikleri dinler; dinlemeyi bırakan fonksiyonu döndürür */
  subscribe(onEvent: (event: BackendEvent) => void): () => void;
  /** Bu cihazın bildirim aboneliğini kaydeder (yalnızca gerçek arka uçta anlamlıdır) */
  savePushSubscription(subscription: PushSubscriptionJSON): Promise<void>;
  removePushSubscription(endpoint: string): Promise<void>;
  /** Yalnızca demo: örnek bir başvuru üretir */
  simulateNew?(): Promise<Application>;
  /** Yalnızca demo: verileri ilk haline döndürür */
  reset?(): Promise<void>;
}
