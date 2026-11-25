"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowLeft, Check, Download, Inbox, Mail, MessageCircle, Phone, Search, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadFile, fullDate, timeAgo, toCsv, whatsappLink } from "../format";
import { addressName, statusMeta, statusOrder, type AdminUser, type Application, type ApplicationPatch, type Status, type TeamMember } from "../types";
import { Avatar, StatusPill } from "./ui";

export type Filter = "all" | Status;

/** Geniş ekran mı? Ayrıntı görünümü tek bir yerde çizilsin diye medya sorgusunu dinler. */
function useIsWide() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(min-width: 1024px)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false
  );
}

const filterLabels: Record<Filter, string> = { all: "Tümü", new: "Yeni", pending: "Beklemede", approved: "Onaylandı", rejected: "Reddedildi" };

/** Başvurular sekmesi: arama, durum filtresi, liste ve seçilen başvurunun ayrıntısı. */
export function Applications({
  apps,
  team,
  me,
  loading,
  filter,
  onFilter,
  selectedId,
  onSelect,
  onUpdate,
  onRemove,
}: {
  apps: Application[];
  team: TeamMember[];
  me: AdminUser;
  loading: boolean;
  filter: Filter;
  onFilter: (f: Filter) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, patch: ApplicationPatch) => void;
  onRemove: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const wide = useIsWide();

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: apps.length, new: 0, pending: 0, approved: 0, rejected: 0 };
    for (const a of apps) c[a.status]++;
    return c;
  }, [apps]);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return apps.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (!q) return true;
      return [a.fullName, a.department, a.email, a.phone, a.studentNo ?? ""].some((v) => v.toLocaleLowerCase("tr-TR").includes(q));
    });
  }, [apps, filter, query]);

  const selected = apps.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-6">
      <div>
        <header className="flex items-end justify-between gap-3">
          <div>
            <p className="label-mono text-ink-soft">{visible.length} kayıt</p>
            <h1 className="display-tight mt-1 text-4xl sm:text-5xl">Başvurular</h1>
          </div>
          <button
            type="button"
            onClick={() => downloadFile(`nexus-basvurular-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(visible))}
            disabled={!visible.length}
            className="pressable flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 font-display text-sm font-bold disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Excel
          </button>
        </header>

        <label className="relative mt-5 block">
          <span className="sr-only">Başvurularda ara</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İsim, bölüm, telefon ara"
            className="w-full rounded-full border-2 border-ink bg-white/70 py-3 pl-12 pr-4 text-base outline-none placeholder:text-ink/40 focus:bg-white focus:shadow-[4px_4px_0_0_var(--color-brand)] focus-visible:outline-none"
          />
        </label>

        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Duruma göre filtrele">
          {(["all", ...statusOrder] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-1.5 font-display text-sm font-bold transition-colors",
                filter === f ? "bg-ink text-paper" : "bg-paper hover:bg-paper-deep"
              )}
            >
              {filterLabels[f]}
              <span className={cn("rounded-full px-1.5 font-mono text-[0.68rem] tabular-nums", filter === f ? "bg-paper text-ink" : "bg-paper-deep")}>{counts[f]}</span>
            </button>
          ))}
        </div>

        <ul className="mt-4 space-y-2.5">
          {loading && apps.length === 0
            ? Array.from({ length: 4 }, (_, i) => <li key={i} className="h-[4.6rem] animate-pulse rounded-2xl border-2 border-ink/15 bg-paper-deep" />)
            : visible.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(a.id)}
                    aria-current={selectedId === a.id ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border-2 border-ink px-3.5 py-3 text-left transition-all",
                      selectedId === a.id ? "bg-paper-deep shadow-hard-sm lg:translate-x-1" : "bg-paper hover:bg-paper-deep"
                    )}
                  >
                    <span className="relative">
                      <Avatar name={a.fullName} />
                      {!a.seen && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink bg-coral" aria-label="Okunmadı" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate font-display tracking-tight", a.seen ? "font-bold" : "font-extrabold")}>{a.fullName}</span>
                      <span className="block truncate text-sm text-ink-soft">
                        {a.department} · {a.classYear}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <StatusPill status={a.status} />
                      <span className="font-mono text-[0.65rem] text-ink-soft">{timeAgo(a.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
        </ul>

        {!loading && visible.length === 0 && (
          <p className="mt-6 flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-ink/40 px-6 py-12 text-center text-ink-soft">
            <Inbox className="h-9 w-9" />
            {apps.length === 0 ? "Henüz başvuru gelmedi." : "Bu aramaya uyan başvuru yok."}
          </p>
        )}
      </div>

      {/* Ayrıntı: geniş ekranda sağ sütun, telefonda tam ekran sayfa */}
      {wide && (
        <div className="sticky top-6 max-h-[calc(100dvh-3rem)] self-start overflow-y-auto rounded-3xl pb-2 pr-2">
          {selected ? (
            <Detail key={selected.id} app={selected} team={team} me={me} onClose={() => onSelect(null)} onUpdate={onUpdate} onRemove={onRemove} />
          ) : (
            <p className="flex min-h-[24rem] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-ink/40 p-10 text-center text-ink-soft">
              <Inbox className="h-10 w-10" />
              Ayrıntıları görmek için soldan bir başvuru seç.
            </p>
          )}
        </div>
      )}
      {!wide && selected && (
        <div className="animate-[slide-in_0.28s_cubic-bezier(0.2,0.8,0.2,1)_both] fixed inset-0 z-50 overflow-y-auto bg-paper">
          <Detail key={selected.id} app={selected} team={team} me={me} mobile onClose={() => onSelect(null)} onUpdate={onUpdate} onRemove={onRemove} />
        </div>
      )}
      <style>{`@keyframes slide-in { from { transform: translateX(100%); } to { transform: none; } }`}</style>
    </div>
  );
}

function Detail({
  app,
  team,
  me,
  mobile = false,
  onClose,
  onUpdate,
  onRemove,
}: {
  app: Application;
  team: TeamMember[];
  me: AdminUser;
  mobile?: boolean;
  onClose: () => void;
  onUpdate: (id: string, patch: ApplicationPatch) => void;
  onRemove: (id: string) => void;
}) {
  const [note, setNote] = useState(app.adminNote ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const noteChanged = note.trim() !== (app.adminNote ?? "");
  const firstName = app.fullName.split(" ")[0];
  // Durumu en son kim değiştirdi?
  const handler = app.handledBy ? (app.handledBy === me.id ? me : team.find((m) => m.id === app.handledBy)) : null;

  const info: Array<[string, string]> = [
    ["Bölüm", app.department],
    ["Sınıf", app.classYear],
    ["Öğrenci no", app.studentNo || "Belirtilmedi"],
    ["E-posta", app.email],
    ["Telefon", app.phone],
    ["Başvuru", fullDate(app.createdAt)],
  ];

  return (
    <article className={cn(mobile ? "min-h-dvh pb-[calc(env(safe-area-inset-bottom)+2rem)]" : "rounded-3xl border-2 border-ink bg-paper shadow-hard")}>
      <header className={cn("relative border-b-2 border-ink bg-navy px-5 pb-6 text-paper", mobile ? "pt-[calc(env(safe-area-inset-top)+0.75rem)]" : "rounded-t-[1.35rem] pt-5")}>
        <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle,#f5f2ea_1.2px,transparent_1.2px)] [background-size:16px_16px]" aria-hidden="true" />
        <div className="relative flex items-center justify-between">
          <button type="button" onClick={onClose} className="flex items-center gap-1.5 rounded-full border-2 border-paper/50 py-1.5 pl-2 pr-3.5 text-sm font-semibold hover:bg-paper hover:text-navy">
            {mobile ? <ArrowLeft className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {mobile ? "Başvurular" : "Kapat"}
          </button>
          <StatusPill status={app.status} />
        </div>
        <div className="relative mt-5 flex items-center gap-4">
          <Avatar name={app.fullName} className="h-16 w-16 border-paper text-xl" />
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-extrabold leading-tight tracking-[-0.03em]">{app.fullName}</h2>
            <p className="truncate text-sm text-paper/75">
              {app.department} · {timeAgo(app.createdAt)}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-6 p-5">
        {/* Hızlı iletişim */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { href: `tel:${app.phone.replace(/\s/g, "")}`, label: "Ara", Icon: Phone, cls: "bg-lime" },
            { href: whatsappLink(app.phone), label: "WhatsApp", Icon: MessageCircle, cls: "bg-paper", external: true },
            { href: `mailto:${app.email}`, label: "E-posta", Icon: Mail, cls: "bg-paper" },
          ].map(({ href, label, Icon, cls, external }) => (
            <a key={label} href={href} target={external ? "_blank" : undefined} rel="noopener noreferrer" className={cn("pressable flex flex-col items-center gap-1.5 rounded-2xl border-2 border-ink py-3 font-display text-sm font-bold", cls)}>
              <Icon className="h-5 w-5" />
              {label}
            </a>
          ))}
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          {info.map(([k, v]) => (
            <div key={k} className={cn(k === "E-posta" || k === "Başvuru" ? "col-span-2" : "")}>
              <dt className="label-mono text-ink-soft">{k}</dt>
              <dd className="mt-0.5 break-words font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        <div>
          <h3 className="label-mono text-ink-soft">En çok ilgisini çekenler</h3>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {app.attractions.length ? (
              app.attractions.map((x) => (
                <li key={x} className="rounded-full border-2 border-ink bg-sun px-3 py-1 text-sm font-semibold">
                  {x}
                </li>
              ))
            ) : (
              <li className="text-ink-soft">Belirtilmedi</li>
            )}
          </ul>
        </div>

        {app.note && (
          <div>
            <h3 className="label-mono text-ink-soft">{firstName} şunu ekledi</h3>
            <p className="mt-2 rounded-2xl border-2 border-ink bg-paper-deep p-4 font-serif text-xl italic leading-snug">“{app.note}”</p>
          </div>
        )}

        <div>
          <h3 className="label-mono text-ink-soft">Durum</h3>
          <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Başvuru durumu">
            {statusOrder.map((s) => {
              const active = app.status === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => !active && onUpdate(app.id, { status: s })}
                  className={cn("flex items-center justify-center gap-1.5 rounded-xl border-2 border-ink px-3 py-2.5 font-display text-sm font-bold transition-all", active ? cn(statusMeta[s].pill, "shadow-hard-sm") : "bg-paper hover:bg-paper-deep")}
                >
                  {active && <Check className="h-4 w-4" strokeWidth={3} />}
                  {statusMeta[s].label}
                </button>
              );
            })}
          </div>
          {app.handledAt && app.status !== "new" && (
            <p className="mt-2.5 text-sm text-ink-soft">
              {handler ? (
                <>
                  Durumu <strong className="text-ink">{handler.id === me.id ? "siz" : addressName(handler)}</strong> güncelledi{handler.id === me.id ? "niz" : ""}
                </>
              ) : (
                "Durum güncellendi"
              )}{" "}
              · {timeAgo(app.handledAt)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`not-${app.id}`} className="label-mono text-ink-soft">
            Yönetici notu
          </label>
          <textarea
            id={`not-${app.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Yalnızca yönetim ekibinin göreceği not"
            className="mt-2 w-full resize-y rounded-xl border-2 border-ink bg-white/70 px-4 py-3 outline-none placeholder:text-ink/35 focus:bg-white focus:shadow-[4px_4px_0_0_var(--color-brand)] focus-visible:outline-none"
          />
          {noteChanged && (
            <button type="button" onClick={() => onUpdate(app.id, { adminNote: note.trim() || null })} className="pressable mt-2 rounded-full border-2 border-ink bg-brand px-5 py-2 font-display text-sm font-bold text-paper">
              Notu kaydet
            </button>
          )}
        </div>

        <div className="border-t-2 border-dashed border-ink/30 pt-5">
          {confirmDelete ? (
            <div className="rounded-2xl border-2 border-ink bg-coral p-4">
              <p className="font-display font-extrabold tracking-tight">Bu başvuru kalıcı olarak silinsin mi?</p>
              <p className="text-sm">Bu işlem geri alınamaz.</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => onRemove(app.id)} className="rounded-full border-2 border-ink bg-ink px-4 py-2 font-display text-sm font-bold text-paper">
                  Evet, sil
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full border-2 border-ink bg-paper px-4 py-2 font-display text-sm font-bold">
                  Vazgeç
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-sm font-semibold text-[#b3300f] hover:underline">
              <Trash2 className="h-4 w-4" /> Başvuruyu sil
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
