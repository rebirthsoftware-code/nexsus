import type { Backend } from "./types";

import { SUPABASE_ANON_KEY, SUPABASE_URL, isConfigured } from "./config";

export { isConfigured };

/** Arka ucu ihtiyaç anında yükler; böylece veritabanı kütüphanesi herkese açık sayfalara girmez. */
export async function loadBackend(): Promise<Backend> {
  if (isConfigured) {
    const { createSupabaseBackend } = await import("./backend-supabase");
    return createSupabaseBackend(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  const { createDemoBackend } = await import("./backend-demo");
  return createDemoBackend();
}
