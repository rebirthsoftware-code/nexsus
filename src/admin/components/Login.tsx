"use client";

import { useState } from "react";
import { ArrowRight, ChevronRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { roleLabel, type AdminUser, type Backend } from "../types";
import { Avatar } from "./ui";

const inputCls =
  "w-full rounded-xl border-2 border-ink bg-white/70 py-3 pl-11 pr-4 text-base text-ink placeholder:text-ink/35 outline-none transition-all focus:bg-white focus:shadow-[4px_4px_0_0_var(--color-brand)] focus-visible:outline-none";

/**
 * Giriş ekranı: dik telefonda alttan yükselen kart, geniş ya da yan çevrilmiş ekranda iki sütun.
 * Demo modunda şifre yerine örnek yönetim ekibinden biri seçilir.
 */
export function Login({ backend, onSignedIn }: { backend: Backend; onSignedIn: (user: AdminUser) => void }) {
  const demo = backend.mode === "demo";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (who: string, pass: string) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      onSignedIn(await backend.signIn(who, pass));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılamadı.");
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError("E-posta ve şifrenizi yazın.");
    void run(email, password);
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-navy text-paper short:flex-row lg:flex-row">
      {/* Arka plan: nokta dokusu ve logodaki X işareti */}
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,#f5f2ea_1.2px,transparent_1.2px)] [background-size:22px_22px]" aria-hidden="true" />
      <LogoMark light className="pointer-events-none absolute -right-24 -top-16 h-[26rem] w-auto opacity-[0.13] short:-bottom-24 short:-left-28 short:right-auto short:top-auto lg:-bottom-24 lg:-left-28 lg:right-auto lg:top-auto lg:h-[40rem]" />

      <div className="relative flex flex-1 flex-col justify-between px-6 pb-8 pt-[calc(env(safe-area-inset-top)+2rem)] short:min-w-0 short:justify-start short:py-6 short:pl-[calc(env(safe-area-inset-left)+1.5rem)] lg:justify-between lg:p-14">
        <Logo variant="full" light asLink={false} priority className="animate-rise h-12 self-start short:h-9 sm:h-14" />
        <div className="animate-rise mt-10 short:mt-4 lg:mt-0" style={{ animationDelay: "80ms" }}>
          <p className="label-mono inline-flex items-center gap-2 rounded-full border-2 border-paper/50 px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-lime" /> Yönetim paneli
          </p>
          <h1 className="display-tight mt-5 text-5xl short:mt-3 short:text-4xl sm:text-6xl lg:text-7xl">
            Başvurular <span className="font-serif font-normal italic tracking-[-0.02em] text-lime">cebinde.</span>
          </h1>
          <p className="mt-4 hidden max-w-md text-lg leading-relaxed text-paper/75 lg:block">
            Yeni üyelik başvurularını gör, onayla, ara. Telefonuna uygulama olarak yükle, başvuru geldiğinde bildirim al.
          </p>
        </div>
        <p className="label-mono hidden text-paper/50 lg:block">Yalnızca kulüp yönetimi içindir</p>
      </div>

      <div className="animate-rise relative flex items-center justify-center short:w-[24rem] short:shrink-0 short:overflow-y-auto short:p-3 short:pr-[calc(env(safe-area-inset-right)+0.75rem)] lg:w-[32rem] lg:p-10" style={{ animationDelay: "160ms" }}>
        <div className="w-full rounded-t-[2rem] border-2 border-b-0 border-ink bg-paper px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-8 text-ink short:rounded-[1.5rem] short:border-b-2 short:p-5 lg:rounded-[2rem] lg:border-b-2 lg:p-9 lg:shadow-hard-lg">
          {demo ? (
            <>
              <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] short:text-2xl">Kim giriyor?</h2>
              <p className="mt-1 text-ink-soft">Panel demo modunda. Denemek için yönetim ekibinden birini seçin.</p>
              <ul className="mt-5 space-y-2.5 short:mt-3 short:space-y-2">
                {(backend.demoProfiles ?? []).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(p.id, "")}
                      className="pressable flex w-full items-center gap-3 rounded-2xl border-2 border-ink bg-paper px-3.5 py-3 text-left disabled:opacity-60 short:py-2"
                    >
                      <Avatar name={p.fullName} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-lg font-extrabold tracking-tight">{p.fullName}</span>
                        <span className={cn("label-mono mt-0.5 inline-block rounded-full border-2 border-ink px-2 py-0.5 text-[0.6rem]", p.role === "baskan" ? "bg-brand text-paper" : "bg-sun")}>{roleLabel[p.role]}</span>
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-xl border-2 border-dashed border-ink/40 p-3 text-xs leading-relaxed text-ink-soft short:mt-3">
                İsimler örnektir. Veritabanı bağlandığında bu ekranın yerini e-posta ve şifreyle giriş alır; herkes girişte kendi adıyla karşılanır.
              </p>
            </>
          ) : (
            <form onSubmit={submit} noValidate>
              <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] short:text-2xl">Giriş yap</h2>
              <p className="mt-1 text-ink-soft">Kulüp hesabınızla devam edin.</p>
              <div className="mt-6 space-y-4 short:mt-3 short:space-y-2.5">
                <label className="block">
                  <span className="mb-1.5 block font-display text-sm font-bold tracking-tight">E-posta</span>
                  <span className="relative block">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="ad@ornek.com" autoComplete="username" inputMode="email" autoCapitalize="none" />
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
              <button type="submit" disabled={busy} className="pressable mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-brand px-6 py-3.5 font-display text-base font-bold text-paper disabled:opacity-60 short:mt-4 short:py-2.5">
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {busy ? "Giriş yapılıyor..." : "Giriş yap"}
                {!busy && <ArrowRight className="h-5 w-5" />}
              </button>
              <p className="mt-5 text-center text-xs text-ink-soft short:mt-3">Şifrenizi unuttuysanız kulüp başkanına ulaşın.</p>
            </form>
          )}

          {error && (
            <p role="alert" className="mt-4 rounded-xl border-2 border-ink bg-coral px-4 py-2.5 text-sm font-semibold">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
