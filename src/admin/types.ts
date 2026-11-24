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
};

export type ApplicationPatch = Partial<Pick<Application, "status" | "adminNote" | "seen">>;

export type AdminUser = { email: string };

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
