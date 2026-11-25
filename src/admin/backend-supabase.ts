import { createClient } from "@supabase/supabase-js";
import type { AdminUser, Application, ApplicationPatch, Backend, Honorific, Role, Status, TeamMember } from "./types";

/** Veritabanındaki satır (bkz. supabase/schema.sql) */
type Row = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  class_year: string;
  student_no: string | null;
  attractions: string[] | null;
  note: string | null;
  status: Status;
  admin_note: string | null;
  seen: boolean;
  handled_by: string | null;
  handled_at: string | null;
};

type AdminRow = { user_id: string; full_name: string; role: Role; honorific: Honorific };

const toMember = (r: AdminRow): TeamMember => ({ id: r.user_id, fullName: r.full_name, role: r.role, honorific: r.honorific });

function toApplication(r: Row): Application {
  return {
    id: r.id,
    createdAt: r.created_at,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    department: r.department,
    classYear: r.class_year,
    studentNo: r.student_no,
    attractions: r.attractions ?? [],
    note: r.note,
    status: r.status,
    adminNote: r.admin_note,
    seen: r.seen,
    handledBy: r.handled_by,
    handledAt: r.handled_at,
  };
}

function toRowPatch(patch: ApplicationPatch) {
  const row: Partial<Pick<Row, "status" | "admin_note" | "seen">> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.adminNote !== undefined) row.admin_note = patch.adminNote;
  if (patch.seen !== undefined) row.seen = patch.seen;
  return row;
}

const NOT_ADMIN = "Bu hesabın yönetim paneli yetkisi yok.";

/**
 * Supabase arka ucu: e-posta ve şifreyle giriş, satır düzeyinde güvenlik (RLS) ile korunan
 * başvuru tablosu ve anlık güncelleme. Erişim kuralları veritabanında tanımlıdır;
 * buradaki "anon" anahtarı herkese açık olacak şekilde tasarlanmıştır.
 */
export function createSupabaseBackend(url: string, anonKey: string): Backend {
  const sb = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "nexus-panel-oturum" },
  });

  /**
   * Giriş yapan hesap yönetim ekibinde mi? Ekipteyse adını, görevini ve hitabını getirir.
   * (RLS: ekipte olmayan bir hesap bu tablodan hiçbir satır göremez.)
   */
  async function requireAdmin(userId: string, email: string): Promise<AdminUser> {
    const { data, error } = await sb.from("admins").select("user_id,full_name,role,honorific").eq("user_id", userId).limit(1);
    if (error) throw new Error("Yetki kontrol edilemedi. Bağlantını kontrol edip tekrar dene.");
    const row = (data as AdminRow[] | null)?.[0];
    if (!row) {
      await sb.auth.signOut();
      throw new Error(NOT_ADMIN);
    }
    return { ...toMember(row), email };
  }

  return {
    mode: "supabase",
    async getUser() {
      const { data } = await sb.auth.getSession();
      const user = data.session?.user;
      if (!user) return null;
      return requireAdmin(user.id, user.email ?? "");
    },
    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user) {
        throw new Error(error?.message === "Invalid login credentials" ? "E-posta ya da şifre hatalı." : "Giriş yapılamadı. Biraz sonra tekrar dene.");
      }
      return requireAdmin(data.user.id, data.user.email ?? email);
    },
    async listTeam() {
      const { data, error } = await sb.from("admins").select("user_id,full_name,role,honorific");
      if (error) return [];
      // Başkan en üstte, sonra ada göre
      return (data as AdminRow[]).map(toMember).sort((a, b) => Number(b.role === "baskan") - Number(a.role === "baskan") || a.fullName.localeCompare(b.fullName, "tr"));
    },
    async signOut() {
      await sb.auth.signOut();
    },
    async list() {
      const { data, error } = await sb.from("applications").select("*").order("created_at", { ascending: false }).limit(2000);
      if (error) throw new Error("Başvurular yüklenemedi.");
      return (data as Row[]).map(toApplication);
    },
    async update(id, patch) {
      const { error } = await sb.from("applications").update(toRowPatch(patch)).eq("id", id);
      if (error) throw new Error("Değişiklik kaydedilemedi.");
    },
    async remove(id) {
      const { error } = await sb.from("applications").delete().eq("id", id);
      if (error) throw new Error("Başvuru silinemedi.");
    },
    subscribe(onEvent) {
      const channel = sb
        .channel("basvurular")
        .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, (payload) => {
          if (payload.eventType === "INSERT") onEvent({ type: "insert", application: toApplication(payload.new as Row) });
          else onEvent({ type: "refresh" });
        })
        .subscribe();
      return () => {
        void sb.removeChannel(channel);
      };
    },
    async savePushSubscription(subscription) {
      const { endpoint, keys } = subscription;
      if (!endpoint || !keys?.p256dh || !keys.auth) throw new Error("Bildirim aboneliği alınamadı.");
      const { error } = await sb
        .from("push_subscriptions")
        .upsert({ endpoint, p256dh: keys.p256dh, auth: keys.auth, user_agent: navigator.userAgent.slice(0, 200) }, { onConflict: "endpoint" });
      if (error) throw new Error("Bildirim aboneliği kaydedilemedi.");
    },
    async removePushSubscription(endpoint) {
      await sb.from("push_subscriptions").delete().eq("endpoint", endpoint);
    },
  };
}
