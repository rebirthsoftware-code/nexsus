"use client";

import { useEffect } from "react";
import { LogoMark } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { addressName, roleLabel, type AdminUser } from "../types";

/** Girişten hemen sonra kısa bir süre görünen kişiye özel karşılama. Dokununca ya da kendiliğinden kapanır. */
export function Welcome({ user, onDone }: { user: AdminUser; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <button
      type="button"
      onClick={onDone}
      className="fixed inset-0 z-[70] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-navy px-6 text-center text-paper"
      aria-label={`Hoş geldiniz, ${addressName(user)}. Panele geçmek için dokunun.`}
    >
      <span className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,#f5f2ea_1.2px,transparent_1.2px)] [background-size:22px_22px]" aria-hidden="true" />
      <LogoMark light className="animate-pop relative h-14 w-auto short:h-9" />
      <span className="label-mono animate-rise relative mt-8 text-paper/70 short:mt-4" style={{ animationDelay: "150ms" }}>
        Hoş geldiniz
      </span>
      <span className="display-tight animate-rise relative mt-3 text-[clamp(2.75rem,min(13vw,20vh),6rem)]" style={{ animationDelay: "250ms" }}>
        {addressName(user).replace(` ${user.honorific}`, "")} <span className="font-serif font-normal italic tracking-[-0.02em] text-lime">{user.honorific}</span>
      </span>
      <span
        className={cn("label-mono animate-rise relative mt-6 rounded-full border-2 border-ink px-3 py-1.5 short:mt-3", user.role === "baskan" ? "bg-brand text-paper" : "bg-sun text-ink")}
        style={{ animationDelay: "400ms" }}
      >
        {roleLabel[user.role]}
      </span>
    </button>
  );
}
