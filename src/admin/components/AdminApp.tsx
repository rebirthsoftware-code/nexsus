"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Inbox, LayoutDashboard, Loader2, LogOut, Settings as SettingsIcon } from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { loadBackend } from "../backend";
import { getNotificationState, registerServiceWorker, setBadge, showNotification } from "../push";
import { roleLabel, type AdminUser, type Application, type ApplicationPatch, type Backend, type TeamMember } from "../types";
import { Applications, type Filter } from "./Applications";
import { Login } from "./Login";
import { Overview } from "./Overview";
import { Settings } from "./Settings";
import { Avatar, Toasts, useToasts } from "./ui";
import { Welcome } from "./Welcome";

type Tab = "ozet" | "basvurular" | "ayarlar";

const tabs: Array<{ id: Tab; label: string; Icon: typeof Inbox }> = [
  { id: "ozet", label: "Özet", Icon: LayoutDashboard },
  { id: "basvurular", label: "Başvurular", Icon: Inbox },
  { id: "ayarlar", label: "Ayarlar", Icon: SettingsIcon },
];

/** Bildirime tıklanınca gelen adres: /admin/?b=<başvuru no> */
function initialSelection() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("b");
}

/**
 * Yönetim paneli. Tek sayfalık bir uygulamadır: oturum kontrolü, sekmeler,
 * başvuru verisi ve anlık bildirimler burada yönetilir.
 */
export function AdminApp() {
  const [backend, setBackend] = useState<Backend | null>(null);
  // undefined: oturum kontrol ediliyor · null: giriş yapılmamış
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const [team, setTeam] = useState<TeamMember[]>([]);
  // Yalnızca yeni giriş yapıldığında gösterilen karşılama ekranı
  const [welcome, setWelcome] = useState(false);
  const closeWelcome = useCallback(() => setWelcome(false), []);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelection);
  const [tab, setTab] = useState<Tab>(() => (initialSelection() ? "basvurular" : "ozet"));
  const [filter, setFilter] = useState<Filter>("all");
  const [notifyHint, setNotifyHint] = useState(false);
  const { toasts, toast, dismiss } = useToasts();
  const backendRef = useRef<Backend | null>(null);
  const userId = user?.id;

  const openApplication = useCallback((id: string) => {
    setTab("basvurular");
    setFilter("all");
    setSelectedId(id);
  }, []);

  // Açılış: arka ucu yükle, oturumu kontrol et, uygulama dosyalarını (service worker) kaydet
  useEffect(() => {
    let alive = true;
    loadBackend().then(async (b) => {
      if (!alive) return;
      backendRef.current = b;
      setBackend(b);
      try {
        const current = await b.getUser();
        if (alive) setUser(current);
      } catch (e) {
        if (!alive) return;
        setUser(null);
        toast({ title: "Oturum açılamadı", body: e instanceof Error ? e.message : undefined, tone: "error" });
      }
    });
    registerServiceWorker();

    // Bildirime tıklanınca service worker açık pencereye hangi başvurunun açılacağını söyler
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "basvuru-ac" && typeof event.data.id === "string") openApplication(event.data.id);
    };
    navigator.serviceWorker?.addEventListener("message", onMessage);
    return () => {
      alive = false;
      navigator.serviceWorker?.removeEventListener("message", onMessage);
    };
  }, [toast, openApplication]);

  const refresh = useCallback(async () => {
    const b = backendRef.current;
    if (!b) return;
    try {
      setApps(await b.list());
    } catch (e) {
      toast({ title: "Başvurular yüklenemedi", body: e instanceof Error ? e.message : undefined, tone: "error" });
    }
    setLoading(false);
  }, [toast]);

  // Giriş yapılınca: başvuruları getir ve yeni kayıtları dinle
  useEffect(() => {
    if (!backend || !userId) return;
    backend.listTeam().then(setTeam, () => setTeam([]));
    queueMicrotask(() => {
      setLoading(true);
      setNotifyHint(getNotificationState() === "default" || getNotificationState() === "needs-install");
    });
    refresh();
    const stop = backend.subscribe((event) => {
      if (event.type === "refresh") return void refresh();
      const a = event.application;
      setApps((prev) => (prev.some((x) => x.id === a.id) ? prev : [a, ...prev]));
      toast({ title: "Yeni başvuru", body: `${a.fullName} · ${a.department}`, onClick: () => openApplication(a.id) });
      // Sunucu bildirimi kurulu değilse (ya da demo modunda) bildirimi bu cihaz kendisi gösterir
      void showNotification("Yeni üyelik başvurusu", `${a.fullName} · ${a.department}`, a.id);
    });
    // Uygulamaya geri dönüldüğünde listeyi tazele
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [backend, userId, refresh, toast, openApplication]);

  // Sekme değişince sayfanın başına dön (önceki sekmenin kaydırma konumu taşınmasın)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  const newCount = apps.filter((a) => a.status === "new").length;
  useEffect(() => {
    if (userId) setBadge(newCount);
  }, [newCount, userId]);

  const update = useCallback(
    (id: string, patch: ApplicationPatch) => {
      // Durum değişikliğinde "kim, ne zaman" bilgisini ekranda hemen göster (kalıcı kayıt arka uçta tutulur)
      const stamp = patch.status ? { handledBy: userId ?? null, handledAt: new Date().toISOString() } : {};
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch, ...stamp } : a)));
      backendRef.current?.update(id, patch).catch((e) => {
        toast({ title: "Kaydedilemedi", body: e instanceof Error ? e.message : undefined, tone: "error" });
        refresh();
      });
      if (patch.status) toast({ title: "Durum güncellendi" });
      if (patch.adminNote !== undefined) toast({ title: "Not kaydedildi" });
    },
    [toast, refresh, userId]
  );

  const remove = useCallback(
    (id: string) => {
      setApps((prev) => prev.filter((a) => a.id !== id));
      setSelectedId(null);
      backendRef.current?.remove(id).then(
        () => toast({ title: "Başvuru silindi" }),
        (e) => {
          toast({ title: "Silinemedi", body: e instanceof Error ? e.message : undefined, tone: "error" });
          refresh();
        }
      );
    },
    [toast, refresh]
  );

  const select = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      // Adres çubuğundaki ?b= parametresini temizle
      if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
      if (!id) return;
      const app = apps.find((a) => a.id === id);
      if (app && !app.seen) {
        setApps((prev) => prev.map((a) => (a.id === id ? { ...a, seen: true } : a)));
        backendRef.current?.update(id, { seen: true }).catch(() => {});
      }
    },
    [apps]
  );

  const signOut = async () => {
    await backend?.signOut();
    setBadge(0);
    setApps([]);
    setSelectedId(null);
    setTab("ozet");
    setTeam([]);
    setUser(null);
  };

  if (!backend || user === undefined) {
    return (
      <div className="grid min-h-dvh place-items-center bg-navy text-paper">
        <div className="flex flex-col items-center gap-5">
          <LogoMark light className="h-16 w-auto animate-pulse" />
          <Loader2 className="h-6 w-6 animate-spin text-paper/60" aria-label="Yükleniyor" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toasts toasts={toasts} dismiss={dismiss} />
        <Login
          backend={backend}
          onSignedIn={(u) => {
            setWelcome(true);
            setUser(u);
          }}
        />
      </>
    );
  }

  const title = tabs.find((t) => t.id === tab)?.label;

  return (
    <div className="min-h-dvh bg-paper max-lg:short:pl-[calc(env(safe-area-inset-left)+4.25rem)] lg:pl-64">
      <Toasts toasts={toasts} dismiss={dismiss} />
      {welcome && <Welcome user={user} onDone={closeWelcome} />}

      {/* Geniş ekran: sol menü */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r-2 border-ink bg-navy p-5 text-paper lg:flex">
        <Logo variant="full" light asLink={false} className="h-11 self-start" />
        <p className="label-mono mt-2 text-paper/50">Yönetim paneli</p>
        <nav className="mt-8 flex flex-1 flex-col gap-1.5" aria-label="Panel menüsü">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={cn("flex items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left font-display font-bold transition-colors", tab === id ? "border-ink bg-brand shadow-hard-sm" : "border-transparent text-paper/80 hover:bg-paper/10")}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{label}</span>
              {id === "basvurular" && newCount > 0 && <span className="rounded-full border-2 border-ink bg-lime px-2 font-mono text-xs tabular-nums text-ink">{newCount}</span>}
            </button>
          ))}
        </nav>
        {backend.mode === "demo" && <p className="label-mono mb-3 rounded-lg border-2 border-ink bg-sun px-2.5 py-1.5 text-center text-ink">Demo modu</p>}
        <div className="flex items-center gap-2.5 border-t-2 border-paper/20 pt-4">
          <Avatar name={user.fullName} className="h-10 w-10 border-paper text-xs" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display font-extrabold tracking-tight">{user.fullName}</span>
            <span className="label-mono block truncate text-[0.6rem] text-paper/60">{roleLabel[user.role]}</span>
          </span>
          <button type="button" onClick={signOut} aria-label="Çıkış yap" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-paper/40 hover:bg-paper hover:text-navy">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Telefon: üst çubuk */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b-2 border-ink bg-navy px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] text-paper short:hidden lg:hidden">
        <span className="flex min-w-0 items-center gap-2.5">
          <LogoMark light className="h-7 w-auto shrink-0" />
          <span className="truncate font-display text-lg font-extrabold tracking-tight">{title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {backend.mode === "demo" && <span className="label-mono rounded-full border-2 border-ink bg-sun px-2.5 py-1 text-[0.62rem] text-ink">Demo</span>}
          <button type="button" onClick={() => setTab("ayarlar")} aria-label={`${user.fullName}, ${roleLabel[user.role]}. Ayarları aç`}>
            <Avatar name={user.fullName} className="h-9 w-9 border-paper text-xs" />
          </button>
        </span>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-5 sm:px-6 max-lg:short:pb-6 max-lg:short:pr-[calc(env(safe-area-inset-right)+1rem)] lg:px-8 lg:pb-12 lg:pt-8">
        {tab === "ozet" && (
          <Overview
            apps={apps}
            user={user}
            showNotifyHint={notifyHint}
            onOpen={openApplication}
            onSeeAll={(status) => {
              setFilter(status ?? "all");
              setTab("basvurular");
            }}
            onOpenSettings={() => setTab("ayarlar")}
          />
        )}
        {tab === "basvurular" && <Applications apps={apps} team={team} me={user} loading={loading} filter={filter} onFilter={setFilter} selectedId={selectedId} onSelect={select} onUpdate={update} onRemove={remove} />}
        {tab === "ayarlar" && (
          <Settings
            backend={backend}
            user={user}
            team={team}
            onSignOut={signOut}
            onNotice={(t, body, tone) => toast({ title: t, body, tone })}
            onNotificationsChange={() => setNotifyHint(getNotificationState() === "default" || getNotificationState() === "needs-install")}
          />
        )}
      </main>

      {/* Telefon: alt sekme çubuğu */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-paper px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 short:inset-y-0 short:right-auto short:flex short:w-[calc(env(safe-area-inset-left)+4.25rem)] short:flex-col short:justify-center short:border-r-2 short:border-t-0 short:px-1.5 short:pb-2 short:pl-[calc(env(safe-area-inset-left)+0.375rem)] lg:hidden"
        aria-label="Panel menüsü"
      >
        <ul className="mx-auto grid max-w-md grid-cols-3 gap-1 short:mx-0 short:w-full short:grid-cols-1 short:gap-2">
          {tabs.map(({ id, label, Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => setTab(id)}
                aria-current={tab === id ? "page" : undefined}
                className={cn("relative flex w-full flex-col items-center gap-0.5 rounded-2xl border-2 py-1.5 text-[0.7rem] font-bold transition-all", tab === id ? "border-ink bg-brand text-paper shadow-hard-sm" : "border-transparent text-ink-soft")}
              >
                <Icon className="h-5 w-5" />
                {label}
                {id === "basvurular" && newCount > 0 && (
                  <span className="absolute right-[18%] top-0.5 min-w-5 rounded-full border-2 border-ink bg-coral px-1 text-center font-mono text-[0.62rem] tabular-nums text-ink">{newCount}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
