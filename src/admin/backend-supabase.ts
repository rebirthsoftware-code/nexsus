import { createClient } from "@supabase/supabase-js";
import { DELETE_DENIED, type AdminUser, type Application, type ApplicationPatch, type Backend, type Honorific, type ManagedMember, type Role, type Status, type TeamMember } from "./types";

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

type AdminRow = { user_id: string; full_name: string; role: Role; honorific: Honorific | null };
type ManagedRow = AdminRow & { email: string; last_sign_in_at: string | null };

const roleRank: Record<Role, number> = { baskan: 0, baskan_yardimcisi: 1, yazilimci: 2 };

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
 * Veritabanı fonksiyonlarının hata iletileri kullanıcıya gösterilecek biçimde (Türkçe) yazılmıştır;
 * bağlantı sorunu gibi başka hatalarda genel bir ileti gösterilir.
 */
function rpcError(error: { message?: string; code?: string }, fallback: string) {
  // P0001: fonksiyonun kendi "raise exception" iletisi · 42501: yetki yok
  if ((error.code === "P0001" || error.code === "42501") && error.message) return new Error(error.message);
  return new Error(fallback);
}

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
      const { data, error } = await sb.from("admins").select("user_id,full_name,role,honorific").neq("role", "yazilimci");
      if (error) return [];
      // Başkan en üstte, sonra ada göre
      return (data as AdminRow[]).map(toMember).sort((a, b) => roleRank[a.role] - roleRank[b.role] || a.fullName.localeCompare(b.fullName, "tr"));
    },
    async changePassword(password) {
      const { error } = await sb.rpc("account_set_password", { p_password: password });
      if (error) throw rpcError(error, "Şifre değiştirilemedi. Bağlantını kontrol edip tekrar dene.");
    },
    manage: {
      async checkin() {
        const { data, error } = await sb.rpc("developer_checkin");
        return !error && data === true;
      },
      async list() {
        const { data, error } = await sb.rpc("team_list");
        if (error) throw rpcError(error, "Ekip yüklenemedi. Bağlantını kontrol edip tekrar dene.");
        return ((data ?? []) as ManagedRow[])
          .map((r): ManagedMember => ({ ...toMember(r), email: r.email, lastSignInAt: r.last_sign_in_at }))
          .sort((a, b) => roleRank[a.role] - roleRank[b.role]);
      },
      async create(member) {
        const { error } = await sb.rpc("team_create", {
          p_email: member.email.trim(),
          p_password: member.password,
          p_full_name: member.fullName.trim(),
          p_role: member.role,
          p_honorific: member.honorific,
        });
        if (error) throw rpcError(error, "Kişi eklenemedi. Bağlantını kontrol edip tekrar dene.");
      },
      async update(id, patch) {
        const { error } = await sb.rpc("team_update", { p_user_id: id, p_full_name: patch.fullName.trim(), p_role: patch.role, p_honorific: patch.honorific });
        if (error) throw rpcError(error, "Değişiklik kaydedilemedi. Bağlantını kontrol edip tekrar dene.");
      },
      async setPassword(id, password) {
        const { error } = await sb.rpc("team_set_password", { p_user_id: id, p_password: password });
        if (error) throw rpcError(error, "Şifre yenilenemedi. Bağlantını kontrol edip tekrar dene.");
      },
      async remove(id) {
        const { error } = await sb.rpc("team_remove", { p_user_id: id });
        if (error) throw rpcError(error, "Kişi kaldırılamadı. Bağlantını kontrol edip tekrar dene.");
      },
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
      // Veritabanı kuralı gereği yalnızca başkan (ve yazılımcı) silebilir; yetkisiz istekte hiçbir satır silinmez
      const { data, error } = await sb.from("applications").delete().eq("id", id).select("id");
      if (error) throw new Error("Başvuru silinemedi.");
      if (!data?.length) throw new Error(DELETE_DENIED);
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
