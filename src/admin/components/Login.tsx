"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";
import { cn } from "@/lib/utils";
import type { Backend } from "../types";

const inputCls =
  "w-full rounded-xl border-2 border-ink bg-white/70 py-3 pl-11 pr-4 text-base text-ink placeholder:text-ink/35 outline-none transition-all focus:bg-white focus:shadow-[4px_4px_0_0_var(--color-brand)] focus-visible:outline-none";

/** Giriş ekranı: telefonda alttan yükselen kart, geniş ekranda iki sütun. */
export function Login({ backend, onSignedIn }: { backend: Backend; onSignedIn: (email: string) => void }) {
  const demo = backend.mode === "demo";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const signIn = async (e?: React.FormEvent, asDemo = false) => {
    e?.preventDefault();
    if (busy) return;
    if (!asDemo && (!email.trim() || !password)) {
      setError("E-posta ve şifreni yaz.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const user = await backend.signIn(asDemo ? "demo@nexus" : email, password);
      onSignedIn(user.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılamadı.");
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-navy text-paper lg:flex-row">
      {/* Arka plan: nokta dokusu ve logodaki X işareti */}
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,#f5f2ea_1.2px,transparent_1.2px)] [background-size:22px_22px]" aria-hidden="true" />
      <LogoMark light className="pointer-events-none absolute -right-24 -top-16 h-[26rem] w-auto opacity-[0.13] lg:-left-28 lg:right-auto lg:top-auto lg:-bottom-24 lg:h-[40rem]" />

      <div className="relative flex flex-1 flex-col justify-between px-6 pb-8 pt-[calc(env(safe-area-inset-top)+2rem)] lg:p-14">
        <Logo variant="full" light asLink={false} priority className="animate-rise h-12 self-start sm:h-14" />
        <div className="animate-rise mt-10 lg:mt-0" style={{ animationDelay: "80ms" }}>
          <p className="label-mono inline-flex items-center gap-2 rounded-full border-2 border-paper/50 px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-lime" /> Yönetim paneli
          </p>
          <h1 className="display-tight mt-5 text-5xl sm:text-6xl lg:text-7xl">
            Başvurular <span className="font-serif font-normal italic tracking-[-0.02em] text-lime">cebinde.</span>
          </h1>
          <p className="mt-4 hidden max-w-md text-lg leading-relaxed text-paper/75 lg:block">
            Yeni üyelik başvurularını gör, onayla, ara. Telefonuna uygulama olarak yükle, başvuru geldiğinde bildirim al.
          </p>
        </div>
        <p className="label-mono hidden text-paper/50 lg:block">Yalnızca kulüp yönetimi içindir</p>
      </div>

      <div className="animate-rise relative flex items-center justify-center lg:w-[32rem] lg:p-10" style={{ animationDelay: "160ms" }}>
        <form
          onSubmit={signIn}
          noValidate
          className="w-full rounded-t-[2rem] border-2 border-b-0 border-ink bg-paper px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-8 text-ink lg:rounded-[2rem] lg:border-b-2 lg:p-9 lg:shadow-hard-lg"
        >
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em]">Giriş yap</h2>
          <p className="mt-1 text-ink-soft">{demo ? "Panel şu an demo modunda." : "Kulüp hesabınla devam et."}</p>

          {demo && (
            <div className="mt-5 rounded-2xl border-2 border-ink bg-sun p-4 text-sm leading-relaxed">
              <strong className="font-display font-extrabold">Demo modu.</strong> Veritabanı henüz bağlanmadı; panel örnek başvurularla çalışıyor ve veriler yalnızca bu cihazda duruyor.
              <button
                type="button"
                onClick={() => signIn(undefined, true)}
                disabled={busy}
                className="pressable mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-ink px-5 py-3 font-display font-bold text-paper"
              >
                Demo panelini aç <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block font-display text-sm font-bold tracking-tight">E-posta</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="yonetim@nexus.org" autoComplete="username" inputMode="email" />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block font-display text-sm font-bold tracking-tight">Şifre</span>
              <span className="relative block">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
                <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={cn(inputCls, "pr-12")} placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-soft hover:bg-paper-deep">
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </span>
            </label>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-xl border-2 border-ink bg-coral px-4 py-2.5 text-sm font-semibold">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="pressable mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-brand px-6 py-3.5 font-display text-base font-bold text-paper disabled:opacity-60">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {busy ? "Giriş yapılıyor..." : "Giriş yap"}
            {!busy && <ArrowRight className="h-5 w-5" />}
          </button>
          <p className="mt-5 text-center text-xs text-ink-soft">{demo ? "Demo modunda her e-posta ve şifre kabul edilir." : "Şifreni unuttuysan kulüp yöneticisine ulaş."}</p>
        </form>
      </div>
    </div>
  );
}
