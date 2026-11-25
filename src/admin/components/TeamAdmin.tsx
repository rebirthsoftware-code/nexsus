"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Check, Copy, KeyRound, Loader2, Pencil, RefreshCw, Terminal, Trash2, TriangleAlert, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "../format";
import { addressName, MIN_PASSWORD, roleLabel, rolePill, type AdminUser, type Backend, type Honorific, type ManagedMember, type ManagerRole } from "../types";
import { Avatar, Card, CardTitle } from "./ui";

const btn = "pressable inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink px-4 py-2 font-display text-sm font-bold disabled:opacity-60";
const inputCls =
  "w-full rounded-xl border-2 border-ink bg-white/70 px-3.5 py-2.5 text-base text-ink placeholder:text-ink/35 outline-none transition-all focus:bg-white focus:shadow-[4px_4px_0_0_var(--color-brand)] focus-visible:outline-none";

/** Yönetim ekibinin üç koltuğu */
const slots: Array<{ role: ManagerRole; index: number }> = [
  { role: "baskan", index: 0 },
  { role: "baskan_yardimcisi", index: 0 },
  { role: "baskan_yardimcisi", index: 1 },
];

type Panel = { kind: "add"; slot: number } | { kind: "edit" | "password" | "remove"; id: string };

/** Kişiye iletilecek giriş bilgileri: yalnızca oluşturulduğu anda bir kez gösterilir */
type Handover = { fullName: string; email: string; password: string };

/** Okunması ve yazması kolay rastgele şifre (karışan harfler yok): "k7mx-4pqd-w9hn" */
function generatePassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const values = crypto.getRandomValues(new Uint32Array(12));
  const chars = Array.from(values, (v) => alphabet[v % alphabet.length]);
  return [chars.slice(0, 4), chars.slice(4, 8), chars.slice(8, 12)].map((g) => g.join("")).join("-");
}

function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T | null; options: Array<{ value: T; label: string }>; onChange: (value: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 font-display text-sm font-bold tracking-tight">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn("rounded-full border-2 border-ink px-4 py-2 font-display text-sm font-bold transition-colors", value === o.value ? "bg-ink text-paper" : "bg-paper hover:bg-paper-deep")}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function PasswordField({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-display text-sm font-bold tracking-tight">
        Şifre
      </label>
      <div className="flex gap-2">
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "min-w-0 flex-1 font-mono")} placeholder={`En az ${MIN_PASSWORD} karakter`} autoComplete="off" autoCapitalize="none" spellCheck={false} />
        <button type="button" onClick={() => onChange(generatePassword())} className={cn(btn, "shrink-0 bg-paper")}>
          <RefreshCw className="h-4 w-4" /> Üret
        </button>
      </div>
    </div>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-xl border-2 border-ink bg-coral px-3.5 py-2 text-sm font-semibold">
      {children}
    </p>
  );
}

/**
 * Ekip yönetimi: YALNIZCA yazılımcıya görünen bölüm. Başkan ve başkan yardımcıları buradan
 * eklenir, düzenlenir, şifreleri yenilenir ve kaldırılır. Yetki veritabanında da denetlenir;
 * bu ekranı bir şekilde açan başka biri hiçbir değişiklik yapamaz.
 */
export function TeamAdmin({
  backend,
  user,
  temporaryPassword,
  onChanged,
  onNotice,
  onOpenSettings,
}: {
  backend: Backend;
  user: AdminUser;
  temporaryPassword: boolean;
  /** Ekip değişti: panelin geri kalanı (ad, görev, ekip listesi) tazelensin */
  onChanged: () => void;
  onNotice: (title: string, body?: string, tone?: "info" | "error") => void;
  onOpenSettings: () => void;
}) {
  const [members, setMembers] = useState<ManagedMember[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [panel, setPanel] = useState<Panel | null>(null);
  const [handover, setHandover] = useState<Handover | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(
    () =>
      backend.manage.list().then(
        (list) => {
          setMembers(list);
          setLoadError("");
        },
        (e) => setLoadError(e instanceof Error ? e.message : "Ekip yüklenemedi.")
      ),
    [backend]
  );

  useEffect(() => {
    load();
  }, [load]);

  const done = async (title: string, credentials?: Handover) => {
    setPanel(null);
    setCopied(false);
    if (credentials) setHandover(credentials);
    await load();
    onChanged();
    onNotice(title);
  };

  const copy = async () => {
    if (!handover) return;
    try {
      await navigator.clipboard.writeText(`Nexus yönetim paneli\nE-posta: ${handover.email}\nŞifre: ${handover.password}`);
      setCopied(true);
    } catch {
      onNotice("Kopyalanamadı", "Bilgileri elle seçip kopyalayabilirsin.", "error");
    }
  };

  const managers = (members ?? []).filter((m) => m.role !== "yazilimci");
  const developers = (members ?? []).filter((m) => m.role === "yazilimci");
  const byRole = (role: ManagerRole) => managers.filter((m) => m.role === role);

  return (
    <div className="space-y-5">
      <header>
        <p className="label-mono inline-flex items-center gap-2 text-ink-soft">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2 py-0.5 text-[0.62rem]", rolePill.yazilimci)}>
            <Terminal className="h-3 w-3" /> Yalnızca yazılımcı görür
          </span>
        </p>
        <h1 className="display-tight mt-2 text-4xl sm:text-5xl">Ekip yönetimi</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">Başkanı ve başkan yardımcılarını buradan ekle, değiştir, kaldır. Değişiklikler anında geçerli olur; yöneticiler bu bölümü göremez.</p>
      </header>

      {temporaryPassword && (
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border-2 border-ink bg-sun p-4 shadow-hard-sm sm:p-5">
          <TriangleAlert className="h-6 w-6 shrink-0" />
          <p className="min-w-0 flex-1 basis-56 text-sm font-semibold leading-relaxed">Kurulumun ürettiği geçici şifreyle giriş yaptın. Kendi şifreni belirle; geçici şifre bundan sonra çalışmaz.</p>
          <button type="button" onClick={onOpenSettings} className={cn(btn, "bg-ink text-paper")}>
            <KeyRound className="h-4 w-4" /> Şifremi değiştir
          </button>
        </div>
      )}

      {handover && (
        <div className="rounded-3xl border-2 border-ink bg-lime p-4 shadow-hard-sm sm:p-5" role="status">
          <div className="flex items-start justify-between gap-3">
            <p className="font-display text-lg font-extrabold tracking-tight">{handover.fullName} için giriş bilgileri</p>
            <button type="button" onClick={() => setHandover(null)} aria-label="Giriş bilgilerini kapat" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper">
              <X className="h-4 w-4" />
            </button>
          </div>
          <dl className="mt-3 grid gap-x-4 gap-y-1 rounded-2xl border-2 border-ink bg-paper p-3.5 font-mono text-sm sm:grid-cols-[auto_1fr]">
            <dt className="text-ink-soft">E-posta</dt>
            <dd className="select-all break-all font-bold">{handover.email}</dd>
            <dt className="text-ink-soft">Şifre</dt>
            <dd className="select-all break-all font-bold">{handover.password}</dd>
          </dl>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={copy} className={cn(btn, "bg-ink text-paper")}>
              {copied ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />} {copied ? "Kopyalandı" : "Bilgileri kopyala"}
            </button>
            <p className="min-w-0 flex-1 basis-56 text-xs font-semibold leading-relaxed">Şifre bir daha gösterilmez. Kişiye güvenli bir yoldan ilet; kendisi Ayarlar bölümünden değiştirebilir.</p>
          </div>
        </div>
      )}

      {loadError && <ErrorNote>{loadError}</ErrorNote>}

      <Card>
        <CardTitle aside={<span className="label-mono text-ink-soft">{members ? `${managers.length}/3 kişi` : ""}</span>}>Yönetim ekibi</CardTitle>
        {!members && !loadError ? (
          <p className="flex items-center gap-2 py-6 text-ink-soft">
            <Loader2 className="h-5 w-5 animate-spin" /> Ekip yükleniyor...
          </p>
        ) : (
          <ul className="space-y-3">
            {slots.map((slot, i) => {
              const member = byRole(slot.role)[slot.index];
              const open = panel && (panel.kind === "add" ? panel.slot === i : member && panel.id === member.id) ? panel : null;
              return (
                <li key={i} className={cn("rounded-2xl border-2 p-3.5 sm:p-4", member ? "border-ink bg-paper" : "border-dashed border-ink/40")}>
                  {member ? (
                    <MemberRow member={member} onAction={(kind) => setPanel(open?.kind === kind ? null : { kind, id: member.id })} active={open?.kind} />
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-dashed border-ink/40 text-ink-soft">
                        <UserPlus className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display font-extrabold tracking-tight">{roleLabel[slot.role]}</span>
                        <span className="block text-sm text-ink-soft">Bu koltuk boş.</span>
                      </span>
                      {!open && (
                        <button type="button" onClick={() => setPanel({ kind: "add", slot: i })} className={cn(btn, "bg-brand text-paper")}>
                          <UserPlus className="h-4 w-4" /> {roleLabel[slot.role]} ekle
                        </button>
                      )}
                    </div>
                  )}

                  {open?.kind === "add" && <AddForm backend={backend} role={slot.role} onCancel={() => setPanel(null)} onDone={(c) => done(`${c.fullName} ekibe eklendi`, c)} />}
                  {open?.kind === "edit" && member && (
                    <EditForm backend={backend} member={member} hasPresident={byRole("baskan").length > 0} onCancel={() => setPanel(null)} onDone={() => done("Değişiklik kaydedildi")} />
                  )}
                  {open?.kind === "password" && member && (
                    <ResetForm backend={backend} member={member} onCancel={() => setPanel(null)} onDone={(password) => done("Şifre yenilendi", { fullName: member.fullName, email: member.email, password })} />
                  )}
                  {open?.kind === "remove" && member && (
                    <RemoveForm
                      backend={backend}
                      member={member}
                      onCancel={() => setPanel(null)}
                      onDone={() => {
                        // Kaldırılan kişinin giriş bilgileri ekranda kalmasın
                        setHandover((h) => (h?.email === member.email ? null : h));
                        return done(`${member.fullName} ekipten çıkarıldı`);
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-xs leading-relaxed text-ink-soft">Ekip üç kişidir: bir başkan ve iki başkan yardımcısı. Herkes başvuruları görür ve durumunu değiştirir; kalıcı silme yetkisi yalnızca başkandadır.</p>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">Buradaki ad soyad ve görev, sitenin ana sayfasındaki ve Ekip sayfasındaki yönetim kurulu kartlarında da görünür. E-posta ve hitap sitede yayınlanmaz.</p>
      </Card>

      {developers.length > 0 && (
        <Card>
          <CardTitle>Yazılımcı hesabı</CardTitle>
          <ul className="space-y-3">
            {developers.map((dev) => {
              const open = panel && panel.kind !== "add" && panel.id === dev.id ? panel : null;
              return (
                <li key={dev.id}>
                  <MemberRow member={dev} self={dev.id === user.id} onAction={(kind) => setPanel(open?.kind === kind ? null : { kind, id: dev.id })} active={open?.kind} developer />
                  {open?.kind === "edit" && <EditForm backend={backend} member={dev} hasPresident onCancel={() => setPanel(null)} onDone={() => done("Değişiklik kaydedildi")} />}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-ink-soft">Bu hesap yöneticilere görünmez. Şifreni Ayarlar bölümünden değiştirebilirsin.</p>
        </Card>
      )}
    </div>
  );
}

function MemberRow({ member, self, developer, active, onAction }: { member: ManagedMember; self?: boolean; developer?: boolean; active?: Panel["kind"]; onAction: (kind: "edit" | "password" | "remove") => void }) {
  const action = (kind: "edit" | "password" | "remove", label: string, icon: React.ReactNode, tone = "bg-paper") => (
    <button type="button" onClick={() => onAction(kind)} aria-expanded={active === kind} className={cn(btn, "px-3 py-1.5 text-xs", active === kind ? "bg-ink text-paper" : tone)}>
      {icon} {label}
    </button>
  );
  return (
    <div className="flex flex-wrap items-start gap-3">
      <Avatar name={member.fullName} />
      <div className="min-w-0 flex-1 basis-48">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate font-display text-lg font-extrabold leading-tight tracking-tight">{member.fullName}</span>
          <span className={cn("label-mono shrink-0 rounded-full border-2 border-ink px-2 py-0.5 text-[0.6rem]", rolePill[member.role])}>{roleLabel[member.role]}</span>
          {self && <span className="text-xs font-semibold text-ink-soft">(sen)</span>}
        </p>
        <p className="mt-0.5 truncate text-sm text-ink-soft">{member.email}</p>
        <p className="mt-0.5 text-xs text-ink-soft">
          {!developer && <>Girişte: “Hoş geldiniz, {addressName(member)}” · </>}
          {member.lastSignInAt ? `Son giriş ${timeAgo(member.lastSignInAt)}` : developer ? "" : "Henüz giriş yapmadı"}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {action("edit", developer ? "Adı değiştir" : "Düzenle", <Pencil className="h-3.5 w-3.5" />)}
        {!developer && action("password", "Şifre yenile", <KeyRound className="h-3.5 w-3.5" />)}
        {!developer && action("remove", "Kaldır", <Trash2 className="h-3.5 w-3.5" />)}
      </div>
    </div>
  );
}

const honorifics: Array<{ value: Honorific; label: string }> = [
  { value: "Bey", label: "Bey" },
  { value: "Hanım", label: "Hanım" },
];

function FormShell({ title, error, busy, submitLabel, submitTone = "bg-brand text-paper", onSubmit, onCancel, children }: { title: string; error: string; busy: boolean; submitLabel: string; submitTone?: string; onSubmit: () => void; onCancel: () => void; children: React.ReactNode }) {
  return (
    <form
      className="mt-4 space-y-4 border-t-2 border-ink/15 pt-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <p className="font-display font-extrabold tracking-tight">{title}</p>
      {children}
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={cn(btn, submitTone)}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} {submitLabel}
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className={cn(btn, "bg-paper")}>
          Vazgeç
        </button>
      </div>
    </form>
  );
}

function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = async (check: () => string | null, action: () => Promise<void>) => {
    const problem = check();
    if (problem) return setError(problem);
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem tamamlanamadı.");
      setBusy(false);
    }
  };
  return { busy, error, run };
}

function Preview({ fullName, honorific }: { fullName: string; honorific: Honorific | null }) {
  if (!fullName.trim() || !honorific) return null;
  return (
    <p className="rounded-xl border-2 border-dashed border-ink/40 px-3.5 py-2 text-sm text-ink-soft">
      Girişte böyle karşılanır: <strong className="text-ink">Hoş geldiniz, {addressName({ fullName, honorific })}</strong>
    </p>
  );
}

function AddForm({ backend, role, onCancel, onDone }: { backend: Backend; role: ManagerRole; onCancel: () => void; onDone: (credentials: Handover) => void }) {
  const ids = useId();
  const [fullName, setFullName] = useState("");
  const [honorific, setHonorific] = useState<Honorific | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generatePassword);
  const { busy, error, run } = useSubmit();

  const submit = () =>
    run(
      () =>
        fullName.trim().length < 2
          ? "Ad soyad yazın."
          : !honorific
            ? "Hitabı seçin: Bey ya da Hanım."
            : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
              ? "Geçerli bir e-posta adresi yazın."
              : password.length < MIN_PASSWORD
                ? `Şifre en az ${MIN_PASSWORD} karakter olmalı.`
                : null,
      async () => {
        await backend.manage.create({ fullName, honorific: honorific!, email, password, role });
        onDone({ fullName: fullName.trim(), email: email.trim().toLowerCase(), password });
      }
    );

  return (
    <FormShell title={`${roleLabel[role]} ekle`} error={error} busy={busy} submitLabel="Ekibe ekle" onSubmit={submit} onCancel={onCancel}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${ids}-ad`} className="mb-1.5 block font-display text-sm font-bold tracking-tight">
            Ad soyad
          </label>
          <input id={`${ids}-ad`} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Elif Demir" autoComplete="off" />
        </div>
        <Choice label="Hitap" value={honorific} options={honorifics} onChange={setHonorific} />
        <div>
          <label htmlFor={`${ids}-eposta`} className="mb-1.5 block font-display text-sm font-bold tracking-tight">
            Giriş e-postası
          </label>
          <input id={`${ids}-eposta`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="ad@ornek.com" autoComplete="off" inputMode="email" autoCapitalize="none" />
        </div>
        <PasswordField id={`${ids}-sifre`} value={password} onChange={setPassword} />
      </div>
      <Preview fullName={fullName} honorific={honorific} />
    </FormShell>
  );
}

function EditForm({ backend, member, hasPresident, onCancel, onDone }: { backend: Backend; member: ManagedMember; hasPresident: boolean; onCancel: () => void; onDone: () => void }) {
  const ids = useId();
  const developer = member.role === "yazilimci";
  const [fullName, setFullName] = useState(member.fullName);
  const [honorific, setHonorific] = useState<Honorific | null>(member.honorific);
  const [role, setRole] = useState(member.role);
  const { busy, error, run } = useSubmit();

  const submit = () =>
    run(
      () => (fullName.trim().length < 2 ? "Ad soyad yazın." : !developer && !honorific ? "Hitabı seçin: Bey ya da Hanım." : null),
      async () => {
        await backend.manage.update(member.id, { fullName, role, honorific: developer ? member.honorific : honorific });
        onDone();
      }
    );

  return (
    <FormShell title={developer ? "Adı değiştir" : `${member.fullName} kaydını düzenle`} error={error} busy={busy} submitLabel="Kaydet" onSubmit={submit} onCancel={onCancel}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${ids}-ad`} className="mb-1.5 block font-display text-sm font-bold tracking-tight">
            Ad soyad
          </label>
          <input id={`${ids}-ad`} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} autoComplete="off" />
        </div>
        {!developer && <Choice label="Hitap" value={honorific} options={honorifics} onChange={setHonorific} />}
        {!developer && (
          <Choice
            label="Görev"
            value={role}
            options={[
              { value: "baskan", label: roleLabel.baskan },
              { value: "baskan_yardimcisi", label: roleLabel.baskan_yardimcisi },
            ]}
            onChange={setRole}
          />
        )}
      </div>
      {!developer && role === "baskan" && member.role !== "baskan" && hasPresident && (
        <p className="rounded-xl border-2 border-ink bg-sun px-3.5 py-2 text-sm font-semibold">Şu anki başkan kendiliğinden başkan yardımcısı olur.</p>
      )}
      {!developer && <Preview fullName={fullName} honorific={honorific} />}
    </FormShell>
  );
}

function ResetForm({ backend, member, onCancel, onDone }: { backend: Backend; member: ManagedMember; onCancel: () => void; onDone: (password: string) => void }) {
  const ids = useId();
  const [password, setPassword] = useState(generatePassword);
  const { busy, error, run } = useSubmit();
  const submit = () =>
    run(
      () => (password.length < MIN_PASSWORD ? `Şifre en az ${MIN_PASSWORD} karakter olmalı.` : null),
      async () => {
        await backend.manage.setPassword(member.id, password);
        onDone(password);
      }
    );
  return (
    <FormShell title={`${member.fullName} için yeni şifre`} error={error} busy={busy} submitLabel="Şifreyi yenile" onSubmit={submit} onCancel={onCancel}>
      <PasswordField id={`${ids}-sifre`} value={password} onChange={setPassword} />
      <p className="text-sm text-ink-soft">Eski şifre hemen geçersiz olur. Yeni şifreyi kişiye sen iletirsin.</p>
    </FormShell>
  );
}

function RemoveForm({ backend, member, onCancel, onDone }: { backend: Backend; member: ManagedMember; onCancel: () => void; onDone: () => void }) {
  const { busy, error, run } = useSubmit();
  const submit = () =>
    run(
      () => null,
      async () => {
        await backend.manage.remove(member.id);
        onDone();
      }
    );
  return (
    <FormShell title={`${member.fullName} ekipten çıkarılsın mı?`} error={error} busy={busy} submitLabel="Evet, kaldır" submitTone="bg-coral text-ink" onSubmit={submit} onCancel={onCancel}>
      <p className="text-sm leading-relaxed text-ink-soft">Giriş hesabı silinir ve bu kişi panele giremez. Başvurular silinmez. Koltuk boşalır, yerine yeni birini ekleyebilirsin.</p>
    </FormShell>
  );
}
