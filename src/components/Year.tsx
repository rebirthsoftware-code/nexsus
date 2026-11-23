"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Yıl istemci tarafında hesaplanır; sunucu tarafında sabit değer kullanılır, böylece sayfa statik kalır. */
export function Year({ fallback }: { fallback: number }) {
  const year = useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => fallback);
  return <>{year}</>;
}
