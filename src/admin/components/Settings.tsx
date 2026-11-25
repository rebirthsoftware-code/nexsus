"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Check, Database, Download, LogOut, PlusCircle, RotateCcw, Share, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { VAPID_PUBLIC_KEY, disableNotifications, enableNotifications, getNotificationState, hasPushSubscription, isIos, isStandalone, showNotification, type NotificationState } from "../push";
import { addressName, roleLabel, type AdminUser, type Backend, type TeamMember } from "../types";
import { Avatar, Card, CardTitle } from "./ui";

/** Chrome ve Edge'in "uygulamayı yükle" penceresini açan olay */
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

function Row({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper-deep">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-display font-extrabold tracking-tight">{title}</p>
        <div className="text-sm leading-relaxed text-ink-soft">{text}</div>
        {children && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
}

const btn = "pressable inline-flex items-center gap-2 rounded-full border-2 border-ink px-4 py-2 font-display text-sm font-bold disabled:opacity-60";

/** Ayarlar sekmesi: bildirimler, uygulamayı yükleme, hesap ve bağlantı durumu. */
export function Settings({
  backend,
  user,
  team,
  onSignOut,
  onNotice,
  onNotificationsChange,
}: {
  backend: Backend;
  user: AdminUser;
  team: TeamMember[];
  onSignOut: () => void;
  onNotice: (title: string, body?: string, tone?: "info" | "error") => void;
  onNotificationsChange: () => void;
}) {
  const [notif, setNotif] = useState<NotificationState | null>(null);
  const [pushReady, setPushReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [device, setDevice] = useState<{ ios: boolean; standalone: boolean } | null>(null);

  useEffect(() => {
    // Cihaz bilgisi yalnızca tarayıcıda okunabilir; ilk çizimden sonra doldurulur
    queueMicrotask(() => {
      setNotif(getNotificationState());
      setDevice({ ios: isIos(), standalone: isStandalone() });
    });
    hasPushSubscription().then(setPushReady);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setDevice((d) => (d ? { ...d, standalone: true } : d));
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const serverPush = backend.mode === "supabase" && Boolean(VAPID_PUBLIC_KEY);

  const turnOn = async () => {
    setBusy(true);
    try {
      const result = await enableNotifications(backend);
      setNotif(result.state);
      setPushReady(result.pushReady);
      onNotificationsChange();
      if (result.state === "granted") {
        await showNotification("Bildirimler açık", "Yeni başvuru geldiğinde burada göreceksin.");
        onNotice("Bildirimler açıldı");
      } else if (result.state === "denied") {
        onNotice("Bildirim izni verilmedi", "Tarayıcı ayarlarından bu site için bildirimlere izin verebilirsin.", "error");
      }
    } catch (e) {
      onNotice("Bildirimler açılamadı", e instanceof Error ? e.message : undefined, "error");
    }
    setBusy(false);
  };

  const turnOff = async () => {
    setBusy(true);
    await disableNotifications(backend).catch(() => {});
    setPushReady(false);
    setBusy(false);
    onNotice("Bu cihazın bildirim aboneliği kaldırıldı");
  };

  const test = async () => {
    const ok = await showNotification("Yeni üyelik başvurusu", "Zeynep Kaya · Psikoloji");
    if (!ok) onNotice("Bildirim gösterilemedi", "Önce bildirimleri açmalısın.", "error");
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstallEvent(null);
  };

  const notifText: Record<NotificationState, React.ReactNode> = {
    unsupported: "Bu tarayıcı bildirimleri desteklemiyor. Chrome, Edge ya da Safari'nin güncel sürümünü dene.",
    "needs-install": "iPhone ve iPad'de bildirimler yalnızca uygulama ana ekrana eklendikten sonra çalışır. Aşağıdaki adımlarla yükle, sonra buraya dön.",
    default: "Yeni başvuru geldiğinde bu cihaza bildirim gelsin.",
    denied: "Bildirim izni reddedilmiş. Tarayıcının site ayarlarından bildirimlere izin verip sayfayı yenile.",
    granted: serverPush
      ? pushReady
        ? "Açık. Uygulama kapalıyken de yeni başvurularda bildirim alacaksın."
        : "İzin verildi ama bu cihaz henüz aboneliğe kaydedilmedi. Aşağıdan tamamla."
      : backend.mode === "demo"
        ? "Açık. Demo modunda bildirimler yalnızca panel açıkken gösterilir; gerçek başvurularda uygulama kapalıyken de gelmesi için veritabanı bağlanmalı."
        : "Açık, ancak bildirim sunucusu henüz kurulmadı; şimdilik yalnızca panel açıkken bildirim gelir.",
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="label-mono text-ink-soft">Cihaz ve hesap</p>
        <h1 className="display-tight mt-1 text-4xl sm:text-5xl">Ayarlar</h1>
      </header>

      <Card>
        <CardTitle>Bildirimler</CardTitle>
        <Row icon={notif === "granted" ? <BellRing className="h-5 w-5" /> : notif === "denied" ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />} title={notif === "granted" ? "Bildirimler açık" : "Yeni başvuru bildirimi"} text={notif ? notifText[notif] : "Kontrol ediliyor..."}>
          {notif === "default" && (
            <button type="button" onClick={turnOn} disabled={busy} className={cn(btn, "bg-brand text-paper")}>
              <Bell className="h-4 w-4" /> Bildirimleri aç
            </button>
          )}
          {notif === "granted" && serverPush && !pushReady && (
            <button type="button" onClick={turnOn} disabled={busy} className={cn(btn, "bg-brand text-paper")}>
              <Bell className="h-4 w-4" /> Bu cihazı kaydet
            </button>
          )}
          {notif === "granted" && (
            <button type="button" onClick={test} className={cn(btn, "bg-paper")}>
              Deneme bildirimi gönder
            </button>
          )}
          {notif === "granted" && pushReady && (
            <button type="button" onClick={turnOff} disabled={busy} className={cn(btn, "bg-paper")}>
              <BellOff className="h-4 w-4" /> Bu cihazda kapat
            </button>
          )}
        </Row>
      </Card>

      <Card>
        <CardTitle>Uygulama olarak yükle</CardTitle>
        {device?.standalone ? (
          <Row icon={<Check className="h-5 w-5" strokeWidth={3} />} title="Uygulama yüklü" text="Paneli ana ekranındaki Nexus simgesinden açıyorsun." />
        ) : installEvent ? (
          <Row icon={<Smartphone className="h-5 w-5" />} title="Bu cihaza yükle" text="Panel ana ekranına bir uygulama gibi eklenir, tam ekran açılır.">
            <button type="button" onClick={install} className={cn(btn, "bg-brand text-paper")}>
              <Download className="h-4 w-4" /> Uygulamayı yükle
            </button>
          </Row>
        ) : device?.ios ? (
          <Row
            icon={<Smartphone className="h-5 w-5" />}
            title="iPhone ya da iPad'e yükle"
            text={
              <ol className="mt-1 list-inside list-decimal space-y-1">
                <li>Bu sayfayı Safari&apos;de aç.</li>
                <li>
                  Alttaki paylaş düğmesine <Share className="inline h-4 w-4 align-text-bottom" aria-label="Paylaş" /> dokun.
                </li>
                <li>&quot;Ana Ekrana Ekle&quot; seçeneğini seç.</li>
                <li>Ana ekrandaki Nexus simgesinden aç, sonra bildirimleri etkinleştir.</li>
              </ol>
            }
          />
        ) : (
          <Row
            icon={<Smartphone className="h-5 w-5" />}
            title="Telefona ya da bilgisayara yükle"
            text={
              <>
                Android&apos;de Chrome menüsünden <strong className="text-ink">Uygulamayı yükle</strong> ya da <strong className="text-ink">Ana ekrana ekle</strong> seçeneğini kullan. Bilgisayarda adres çubuğunun sağındaki yükleme simgesine tıkla.
              </>
            }
          />
        )}
      </Card>

      <Card>
        <CardTitle>Bağlantı</CardTitle>
        {backend.mode === "demo" ? (
          <Row
            icon={<Database className="h-5 w-5" />}
            title="Demo modu"
            text="Veritabanı henüz bağlanmadı. Gördüğün başvurular kurgusaldır ve yalnızca bu cihazda saklanır. Siteden gelen gerçek başvurular buraya düşmez."
          >
            <button
              type="button"
              onClick={async () => {
                await backend.simulateNew?.();
              }}
              className={cn(btn, "bg-lime")}
            >
              <PlusCircle className="h-4 w-4" /> Örnek başvuru gönder
            </button>
            <button
              type="button"
              onClick={async () => {
                await backend.reset?.();
                onNotice("Demo verileri sıfırlandı");
              }}
              className={cn(btn, "bg-paper")}
            >
              <RotateCcw className="h-4 w-4" /> Verileri sıfırla
            </button>
          </Row>
        ) : (
          <Row icon={<Database className="h-5 w-5" />} title="Veritabanına bağlı" text="Başvurular güvenli veritabanında saklanıyor ve yeni kayıtlar anında panele düşüyor." />
        )}
      </Card>

      <Card>
        <CardTitle>Hesabım</CardTitle>
        <div className="flex items-center gap-4">
          <Avatar name={user.fullName} className="h-16 w-16 text-xl" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl font-extrabold leading-tight tracking-[-0.03em]">{addressName(user)}</p>
            <p className="mt-1 flex flex-wrap items-center gap-2">
              <span className={cn("label-mono rounded-full border-2 border-ink px-2 py-0.5 text-[0.62rem]", user.role === "baskan" ? "bg-brand text-paper" : "bg-sun")}>{roleLabel[user.role]}</span>
              <span className="truncate text-sm text-ink-soft">{user.fullName}</span>
            </p>
            {user.email && <p className="mt-1 truncate text-sm text-ink-soft">{user.email}</p>}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onSignOut} className={cn(btn, "bg-paper")}>
            <LogOut className="h-4 w-4" /> Çıkış yap
          </button>
        </div>
      </Card>

      <Card>
        <CardTitle aside={<span className="label-mono text-ink-soft">{team.length} kişi</span>}>Yönetim ekibi</CardTitle>
        <ul className="divide-y-2 divide-ink/10">
          {team.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-2.5">
              <Avatar name={m.fullName} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display font-extrabold tracking-tight">
                  {addressName(m)}
                  {m.id === user.id && <span className="ml-2 font-sans text-xs font-semibold text-ink-soft">(siz)</span>}
                </span>
                <span className="block truncate text-sm text-ink-soft">{m.fullName}</span>
              </span>
              <span className={cn("label-mono shrink-0 rounded-full border-2 border-ink px-2 py-0.5 text-[0.6rem]", m.role === "baskan" ? "bg-brand text-paper" : "bg-sun")}>{roleLabel[m.role]}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">Panele yalnızca bu ekip girebilir: bir başkan ve iki başkan yardımcısı. Herkes başvuruları görür ve durumunu değiştirir; kalıcı silme yetkisi yalnızca başkandadır.</p>
      </Card>
    </div>
  );
}
