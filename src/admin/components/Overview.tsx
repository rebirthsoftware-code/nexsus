"use client";

import { BellRing, ChevronRight, Inbox } from "lucide-react";
import { attractions as attractionOptions } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { dayKey, timeAgo } from "../format";
import { addressName, roleLabel, type AdminUser, type Application } from "../types";
import { Avatar, Card, CardTitle, StatusPill } from "./ui";

const DAYS = 14;

/** Özet sekmesi: sayılar, son iki haftanın grafiği ve başvuranların ilgi alanları. */
export function Overview({
  apps,
  user,
  showNotifyHint,
  onOpen,
  onSeeAll,
  onOpenSettings,
}: {
  apps: Application[];
  user: AdminUser;
  showNotifyHint: boolean;
  onOpen: (id: string) => void;
  onSeeAll: (status?: "new") => void;
  onOpenSettings: () => void;
}) {
  const now = new Date();
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const counts = {
    total: apps.length,
    fresh: apps.filter((a) => a.status === "new").length,
    approved: apps.filter((a) => a.status === "approved").length,
    week: apps.filter((a) => new Date(a.createdAt).getTime() > weekAgo).length,
  };

  // Son 14 günün günlük başvuru sayıları
  const perDay = new Map<string, number>();
  for (const a of apps) perDay.set(dayKey(new Date(a.createdAt)), (perDay.get(dayKey(new Date(a.createdAt))) ?? 0) + 1);
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (DAYS - 1 - i));
    return { date: d, count: perDay.get(dayKey(d)) ?? 0 };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  const interest = attractionOptions
    .map((o) => ({ label: o.value, count: apps.filter((a) => a.attractions.includes(o.value)).length }))
    .sort((a, b) => b.count - a.count);
  const maxInterest = Math.max(1, ...interest.map((i) => i.count));

  const departments = [...apps.reduce((m, a) => m.set(a.department, (m.get(a.department) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const hour = now.getHours();
  const greeting = hour < 6 ? "İyi geceler" : hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";
  const stats = [
    { label: "Yeni başvuru", value: counts.fresh, cls: "bg-brand text-paper", onClick: () => onSeeAll("new") },
    { label: "Toplam", value: counts.total, cls: "bg-paper", onClick: () => onSeeAll() },
    { label: "Onaylanan", value: counts.approved, cls: "bg-lime", onClick: undefined },
    { label: "Son 7 gün", value: counts.week, cls: "bg-sun", onClick: undefined },
  ];

  return (
    <div className="space-y-5">
      <header>
        <p className="label-mono inline-flex items-center gap-2 text-ink-soft">
          <span className={cn("rounded-full border-2 border-ink px-2 py-0.5 text-[0.62rem]", user.role === "baskan" ? "bg-brand text-paper" : "bg-sun text-ink")}>{roleLabel[user.role]}</span>
          Nexus yönetim paneli
        </p>
        <h1 className="display-tight mt-2 text-4xl sm:text-5xl">
          {greeting}, {addressName(user).replace(` ${user.honorific}`, "")} <span className="font-serif font-normal italic tracking-[-0.02em] text-brand">{user.honorific}</span>.
        </h1>
        <p className="mt-2 text-ink-soft">
          {counts.fresh > 0 ? (
            <>
              İncelenmeyi bekleyen <strong className="text-ink">{counts.fresh} yeni başvuru</strong> var.
            </>
          ) : (
            "Bekleyen yeni başvuru yok, her şey güncel."
          )}
        </p>
      </header>

      {showNotifyHint && (
        <button type="button" onClick={onOpenSettings} className="pressable flex w-full items-center gap-3 rounded-2xl border-2 border-ink bg-navy px-4 py-3 text-left text-paper">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-paper bg-brand">
            <BellRing className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block font-display font-extrabold tracking-tight">Bildirimleri aç</span>
            <span className="block text-sm text-paper/75">Yeni başvuru geldiğinde telefonuna haber gelsin.</span>
          </span>
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const inner = (
            <>
              <dt className="label-mono opacity-80">{s.label}</dt>
              <dd className="display-tight mt-2 text-5xl tabular-nums">{s.value}</dd>
            </>
          );
          const cls = cn("rounded-3xl border-2 border-ink p-4 text-left shadow-hard-sm sm:p-5", s.cls);
          return s.onClick ? (
            <button key={s.label} type="button" onClick={s.onClick} className={cn(cls, "pressable")}>
              {inner}
            </button>
          ) : (
            <div key={s.label} className={cls}>
              {inner}
            </div>
          );
        })}
      </dl>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardTitle aside={<span className="label-mono text-ink-soft">Son {DAYS} gün</span>}>Günlük başvurular</CardTitle>
          <div className="flex min-h-36 flex-1 items-end gap-1.5" role="img" aria-label={`Son ${DAYS} günde toplam ${days.reduce((s, d) => s + d.count, 0)} başvuru`}>
            {days.map((d, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[0.6rem] font-bold tabular-nums text-ink-soft">{d.count || ""}</span>
                <span
                  className={cn("w-full rounded-t-md border-2 border-b-0 border-ink", i === DAYS - 1 ? "bg-brand" : d.count ? "bg-lilac" : "border-dashed border-ink/25 bg-transparent")}
                  style={{ height: `${Math.max(6, (d.count / maxDay) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between border-t-2 border-ink pt-1.5 font-mono text-[0.62rem] text-ink-soft">
            <span>{new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(days[0].date)}</span>
            <span>Bugün</span>
          </div>
        </Card>

        <Card>
          <CardTitle>En çok ne ilgi çekiyor?</CardTitle>
          <ul className="space-y-2.5">
            {interest.map((i) => (
              <li key={i.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold">{i.label}</span>
                  <span className="font-mono text-xs tabular-nums text-ink-soft">{i.count}</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full border-2 border-ink bg-paper-deep">
                  <div className="h-full bg-brand" style={{ width: `${(i.count / maxInterest) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardTitle
            aside={
              <button type="button" onClick={() => onSeeAll()} className="label-mono flex items-center gap-1 text-brand">
                Tümü <ChevronRight className="h-3.5 w-3.5" />
              </button>
            }
          >
            Son başvurular
          </CardTitle>
          {apps.length === 0 ? (
            <p className="flex flex-col items-center gap-2 py-8 text-center text-ink-soft">
              <Inbox className="h-8 w-8" /> Henüz başvuru yok.
            </p>
          ) : (
            <ul className="-mx-2 divide-y-2 divide-ink/10">
              {apps.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <button type="button" onClick={() => onOpen(a.id)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-paper-deep">
                    <Avatar name={a.fullName} />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate font-display tracking-tight", a.seen ? "font-bold" : "font-extrabold")}>{a.fullName}</span>
                      <span className="block truncate text-sm text-ink-soft">
                        {a.department} · {timeAgo(a.createdAt)}
                      </span>
                    </span>
                    <StatusPill status={a.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle>Bölümler</CardTitle>
          {departments.length === 0 ? (
            <p className="py-6 text-center text-ink-soft">Veri yok.</p>
          ) : (
            <ol className="space-y-2">
              {departments.map(([name, count], i) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun font-mono text-xs font-bold">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{name}</span>
                  <span className="font-mono text-sm tabular-nums text-ink-soft">{count}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}
