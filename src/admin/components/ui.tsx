"use client";

import { useCallback, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { avatarTone } from "../format";
import { statusMeta, type Status } from "../types";

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  const meta = statusMeta[status];
  return <span className={cn("label-mono inline-flex shrink-0 items-center rounded-full border-2 border-ink px-2 py-0.5 text-[0.62rem]", meta.pill, className)}>{meta.label}</span>;
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-sm font-extrabold", avatarTone(name), className)} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-3xl border-2 border-ink bg-paper p-5 shadow-hard-sm sm:p-6", className)}>{children}</section>;
}

export function CardTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-display text-lg font-extrabold tracking-[-0.03em]">{children}</h2>
      {aside}
    </div>
  );
}

/* --- Kısa ömürlü bildirim baloncukları --- */

export type Toast = { id: number; title: string; body?: string; tone?: "info" | "error"; onClick?: () => void };

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { ...t, id }]);
      setTimeout(() => dismiss(id), 6000);
    },
    [dismiss]
  );
  return { toasts, toast, dismiss };
}

export function Toasts({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border-2 border-ink px-4 py-3 shadow-hard",
            t.tone === "error" ? "bg-coral text-ink" : "bg-lime text-ink"
          )}
        >
          <button type="button" className="flex-1 text-left" onClick={() => (t.onClick?.(), dismiss(t.id))}>
            <span className="block font-display font-extrabold tracking-tight">{t.title}</span>
            {t.body && <span className="block text-sm">{t.body}</span>}
          </button>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Kapat" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
