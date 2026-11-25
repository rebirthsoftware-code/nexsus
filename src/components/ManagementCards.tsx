"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/admin/config";
import type { TeamMember } from "@/content/team";
import { isManagementRows, toTeamMembers } from "@/lib/management";
import { Button } from "./Button";
import { Reveal } from "./Reveal";
import { TeamCard } from "./TeamCard";

/**
 * Yönetim kurulu kartları. İlk çizim derleme anındaki listeyle yapılır; sayfa açılınca güncel
 * liste veritabanından istenir. Böylece panelde yapılan değişiklik, site yeniden yayınlanmadan görünür.
 * Veritabanı bağlı değilse ya da istek başarısız olursa ilk liste olduğu gibi kalır.
 */
export function ManagementCards({ initial, joinCard = false }: { initial: TeamMember[]; /** Dört karttan az kişi varsa boş yere "sıradaki kart senin" çağrısı konur */ joinCard?: boolean }) {
  const [members, setMembers] = useState(initial);

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
    const controller = new AbortController();
    fetch(`${SUPABASE_URL}/rest/v1/rpc/public_team`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" },
      body: "{}",
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((rows: unknown) => {
        if (!isManagementRows(rows) || !rows.length) return;
        const next = toTeamMembers(rows);
        setMembers((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
      })
      .catch(() => {
        /* bağlantı yok: derleme anındaki liste kalır */
      });
    return () => controller.abort();
  }, []);

  const shown = members.slice(0, 4);
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
      {shown.map((m, i) => (
        <Reveal key={i} delay={i * 90}>
          <TeamCard member={m} index={i} />
        </Reveal>
      ))}
      {joinCard && shown.length < 4 && (
        <Reveal delay={shown.length * 90} className="h-full">
          <div className="flex h-full min-h-56 rotate-1 flex-col justify-between gap-4 rounded-[1.5rem] border-2 border-dashed border-ink p-4 sm:p-6">
            <p className="label-mono text-ink-soft">NX—???</p>
            <div>
              <p className="display-tight text-2xl sm:text-3xl">
                Sıradaki kart <span className="font-serif font-normal italic tracking-[-0.02em] text-brand">senin</span> olabilir.
              </p>
              <p className="mt-2 hidden text-sm leading-relaxed text-ink-soft sm:block">İlk adım kulübe üye olmak.</p>
            </div>
            <Button href="/basvuru" className="self-start px-4 py-2 text-sm">
              Üye ol <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Reveal>
      )}
    </div>
  );
}
