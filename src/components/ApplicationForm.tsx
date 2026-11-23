"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send, AlertCircle } from "lucide-react";
import { applicationSchema, interestOptions, classYears, type ApplicationInput } from "@/lib/schema";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-brand-400/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-brand-500/15 aria-[invalid=true]:border-rose-400/70";

function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-200">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-rose-300">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </span>
      )}
    </label>
  );
}

export function ApplicationForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { interests: [], studentNo: "", website: "" },
  });

  const motivation = watch("motivation") ?? "";

  const onSubmit = async (data: ApplicationInput) => {
    setStatus("sending");
    setServerMessage("");
    try {
      const res = await fetch("/api/basvuru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !json.ok) throw new Error(json.message || "Başvuru gönderilemedi");
      setStatus("success");
      reset();
    } catch (e) {
      setStatus("error");
      setServerMessage(e instanceof Error ? e.message : "Bir şeyler ters gitti");
    }
  };

  if (status === "success") {
    return (
      <div className="card p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-white">Başvurun bize ulaştı!</h2>
        <p className="mx-auto mt-3 max-w-md text-slate-400">
          Teşekkürler. Ekibimiz en kısa sürede e-posta veya WhatsApp üzerinden seninle iletişime geçecek. Bu arada
          Instagram hesabımızı takip etmeyi unutma.
        </p>
        <button onClick={() => setStatus("idle")} className="mt-6 text-sm font-semibold text-brand-200 hover:text-white">
          Yeni başvuru gönder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card p-6 sm:p-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ad Soyad" error={errors.fullName?.message}>
          <input {...register("fullName")} className={inputCls} placeholder="Ayşe Yılmaz" autoComplete="name" aria-invalid={!!errors.fullName} />
        </Field>
        <Field label="E-posta" error={errors.email?.message} hint="Üniversite e-postanı kullanman önerilir">
          <input {...register("email")} type="email" className={inputCls} placeholder="ad.soyad@ogrenci.karabuk.edu.tr" autoComplete="email" aria-invalid={!!errors.email} />
        </Field>
        <Field label="Telefon" error={errors.phone?.message}>
          <input {...register("phone")} type="tel" className={inputCls} placeholder="05xx xxx xx xx" autoComplete="tel" aria-invalid={!!errors.phone} />
        </Field>
        <Field label="Öğrenci Numarası (isteğe bağlı)" error={errors.studentNo?.message}>
          <input {...register("studentNo")} className={inputCls} placeholder="2024XXXXXX" inputMode="numeric" />
        </Field>
        <Field label="Fakülte / Bölüm" error={errors.department?.message}>
          <input {...register("department")} className={inputCls} placeholder="Mühendislik Fakültesi / Bilgisayar Müh." aria-invalid={!!errors.department} />
        </Field>
        <Field label="Sınıf" error={errors.classYear?.message}>
          <select {...register("classYear")} className={cn(inputCls, "appearance-none")} defaultValue="" aria-invalid={!!errors.classYear}>
            <option value="" disabled className="bg-night-900">Seçiniz</option>
            {classYears.map((c) => (
              <option key={c} value={c} className="bg-night-900">{c}</option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset className="mt-7">
        <legend className="mb-2 text-sm font-medium text-slate-200">Hangi alanlarda aktif olmak istersin?</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {interestOptions.map((opt) => (
            <label key={opt} className="group flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 transition-all has-[:checked]:border-brand-400/60 has-[:checked]:bg-brand-500/10 has-[:checked]:text-white">
              <input type="checkbox" value={opt} {...register("interests")} className="h-4 w-4 accent-brand-500" />
              {opt}
            </label>
          ))}
        </div>
        {errors.interests && (
          <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-rose-300">
            <AlertCircle className="h-3.5 w-3.5" /> {errors.interests.message}
          </p>
        )}
      </fieldset>

      <div className="mt-7">
        <Field label="Neden Nexus'a katılmak istiyorsun?" error={errors.motivation?.message}>
          <textarea {...register("motivation")} rows={5} className={cn(inputCls, "resize-y")} placeholder="Kısaca kendinden, beklentilerinden ve kulübe neler katabileceğinden bahset." aria-invalid={!!errors.motivation} />
        </Field>
        <p className="mt-1 text-right text-xs text-slate-500">{motivation.length}/1000</p>
      </div>

      {/* Bot koruması (gizli alan) */}
      <input {...register("website")} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <label className="mt-5 flex items-start gap-3 text-sm text-slate-400">
        <input type="checkbox" {...register("consent")} className="mt-0.5 h-4 w-4 accent-brand-500" />
        <span>
          Paylaştığım bilgilerin yalnızca kulüp üyelik süreci ve etkinlik duyuruları için kullanılmasını kabul ediyorum.
          {errors.consent && <span role="alert" className="block text-rose-300">{errors.consent.message}</span>}
        </span>
      </label>

      {status === "error" && (
        <div role="alert" className="mt-5 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <AlertCircle className="h-4 w-4" /> {serverMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-12px_rgba(139,92,246,0.7)] transition-all hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {status === "sending" ? "Gönderiliyor..." : "Başvuruyu Gönder"}
      </button>
    </form>
  );
}
