"use client";

import { useSyncExternalStore } from "react";

const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" });
const subscribe = () => () => {};

/**
 * Bugünün tarihi (Türkiye saatiyle, "2026-11-25").
 * Sayfa derlenirken hesaplanan tarih ilk çizimde kullanılır; tarayıcıda açılınca gerçek
 * güne geçilir. Böylece site ne zaman derlenmiş olursa olsun "X gün kaldı" sayaçları doğru
 * kalır ve tarihi geçen etkinlik ya da duyuru kendiliğinden "geçmiş"e düşer.
 */
export function useToday(buildDate: string) {
  return useSyncExternalStore(
    subscribe,
    () => formatter.format(new Date()),
    () => buildDate
  );
}
