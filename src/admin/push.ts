import { asset } from "@/lib/utils";
import { VAPID_PUBLIC_KEY } from "./config";
import type { Backend } from "./types";

// Bildirim sunucusunun açık anahtarı tanımlı değilse yalnızca uygulama açıkken bildirim gösterilir.
export { VAPID_PUBLIC_KEY };

export type NotificationState = "unsupported" | "needs-install" | "default" | "denied" | "granted";

export function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function getNotificationState(): NotificationState {
  // iPhone ve iPad'de bildirimler yalnızca ana ekrana eklenmiş uygulamada çalışır
  if (isIos() && !isStandalone()) return "needs-install";
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

const SCOPE = () => asset("/admin/");

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(asset("/admin-sw.js"), { scope: SCOPE() });
  } catch {
    return null;
  }
}

async function activeRegistration() {
  if (!("serviceWorker" in navigator)) return null;
  const reg = (await navigator.serviceWorker.getRegistration(SCOPE())) ?? (await registerServiceWorker());
  if (!reg) return null;
  if (reg.active) return reg;
  // İlk kurulumda etkinleşmesini bekle
  await new Promise<void>((resolve) => {
    const worker = reg.installing ?? reg.waiting;
    if (!worker) return resolve();
    worker.addEventListener("statechange", () => worker.state === "activated" && resolve());
    setTimeout(resolve, 4000);
  });
  return reg;
}

function decodeKey(base64url: string) {
  const padded = base64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(base64url.length / 4) * 4, "=");
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/**
 * Bildirim izni ister. Bildirim sunucusu tanımlıysa bu cihazı aboneliğe kaydeder;
 * böylece uygulama kapalıyken de bildirim gelir.
 */
export async function enableNotifications(backend: Backend): Promise<{ state: NotificationState; pushReady: boolean }> {
  const state = getNotificationState();
  if (state === "unsupported" || state === "needs-install") return { state, pushReady: false };
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { state: permission, pushReady: false };

  if (backend.mode !== "supabase" || !VAPID_PUBLIC_KEY) return { state: "granted", pushReady: false };
  const reg = await activeRegistration();
  if (!reg || !("pushManager" in reg)) return { state: "granted", pushReady: false };
  const subscription = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeKey(VAPID_PUBLIC_KEY) }));
  await backend.savePushSubscription(subscription.toJSON());
  return { state: "granted", pushReady: true };
}

export async function disableNotifications(backend: Backend) {
  const reg = await activeRegistration();
  const subscription = await reg?.pushManager?.getSubscription();
  if (subscription) {
    await backend.removePushSubscription(subscription.endpoint);
    await subscription.unsubscribe();
  }
}

export async function hasPushSubscription() {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await navigator.serviceWorker.getRegistration(SCOPE());
  return Boolean(await reg?.pushManager?.getSubscription());
}

/** Uygulama açıkken (ya da denemek için) bu cihazda bildirim gösterir. */
export async function showNotification(title: string, body: string, applicationId?: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return false;
  const reg = await activeRegistration();
  if (!reg) return false;
  await reg.showNotification(title, {
    body,
    icon: asset("/icons/admin-192.png"),
    badge: asset("/icons/badge-96.png"),
    // Sunucudan gelen bildirimle aynı etiket: aynı başvuru için iki bildirim üst üste binmez
    tag: applicationId ? `basvuru-${applicationId}` : "nexus-panel",
    data: { url: applicationId ? `${SCOPE()}?b=${encodeURIComponent(applicationId)}` : SCOPE(), id: applicationId },
  });
  return true;
}

/** Uygulama simgesindeki sayı rozeti (destekleyen cihazlarda) */
export function setBadge(count: number) {
  const nav = navigator as Navigator & { setAppBadge?: (n: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
  if (count > 0) nav.setAppBadge?.(count).catch(() => {});
  else nav.clearAppBadge?.().catch(() => {});
}
