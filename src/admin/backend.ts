import type { Backend } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Veritabanı bağlantısı tanımlı mı? Tanımlı değilse panel demo modunda çalışır. */
export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Arka ucu ihtiyaç anında yükler; böylece veritabanı kütüphanesi herkese açık sayfalara girmez. */
export async function loadBackend(): Promise<Backend> {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const { createSupabaseBackend } = await import("./backend-supabase");
    return createSupabaseBackend(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  const { createDemoBackend } = await import("./backend-demo");
  return createDemoBackend();
}
