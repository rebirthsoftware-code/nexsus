"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Clock3, Loader2, Send, ShieldCheck, Users2 } from "lucide-react";
import { applicationSchema, interestOptions, classYears, type ApplicationInput } from "@/lib/schema";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import { MemberCard } from "./MemberCard";
import { Button } from "./Button";

const inputCls =
  "w-full rounded-xl border-2 border-ink bg-white/60 px-4 py-3 text-base text-ink placeholder:text-ink/35 outline-none transition-all focus:bg-white focus:shadow-[4px_4px_0_0_var(--color-cobalt)] focus-visible:outline-none aria-[invalid=true]:border-coral aria-[invalid=true]:shadow-[4px_4px_0_0_var(--color-coral)]";

const chipCls =
  "block cursor-pointer rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 peer-checked:bg-lime peer-checked:shadow-hard-sm peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cobalt";

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <span role="alert" className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[#c2330f]">
      <AlertCircle className="h-4 w-4 shrink-0" /> {children}
    </span>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-display text-sm font-bold tracking-tight">{label}</span>
      {children}
      {hint && !error && <span className="mt-2 block text-xs text-ink-soft">{hint}</span>}
      <ErrorText>{error}</ErrorText>
    </label>
  );
}

function Legend({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <legend className="mb-5 flex w-full items-center gap-3 border-b-2 border-ink pb-3">
      <span className="display-tight grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-sun text-lg">{n}</span>
      <span className="font-display text-xl font-extrabold tracking-[-0.03em]">{children}</span>
    </legend>
  );
}

const perks = [
  { Icon: Clock3, text: "İki dakika sürer" },
  { Icon: Users2, text: "Bölüm ya da sınıf şartı yok" },
  { Icon: ShieldCheck, text: "Bilgilerin yalnızca kulüp içinde kalır" },
];

export function ApplicationForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [submitted, setSubmitted] = useState<Pick<ApplicationInput, "fullName" | "department" | "classYear" | "interests"> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { interests: [], studentNo: "", website: "" },
  });

  const [fullName, department, classYear, interests, motivation] = useWatch({
    control,
    name: ["fullName", "department", "classYear", "interests", "motivation"],
  });

  // Başvuru alındığında onay kartını görünür alana getir
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === "success") successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [status]);

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
      setSubmitted({ fullName: data.fullName, department: data.department, classYear: data.classYear, interests: data.interests });
      setStatus("success");
      reset();
    } catch (e) {
      setStatus("error");
      setServerMessage(e instanceof Error ? e.message : "Bir şeyler ters gitti");
    }
  };

  if (status === "success" && submitted) {
    return (
      <div ref={successRef} className="grid items-center gap-12 rounded-[2rem] border-2 border-ink bg-lime p-8 shadow-hard-lg sm:p-14 lg:grid-cols-[19rem_1fr] lg:gap-16">
        <MemberCard name={submitted.fullName} department={submitted.department} classYear={submitted.classYear} interests={submitted.interests} stamped />
        <div role="status">
          <p className="label-mono">Başvuru alındı</p>
          <h2 className="display-tight mt-4 text-5xl sm:text-6xl">Hoş geldin, {submitted.fullName.trim().split(/\s+/)[0]}!</h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed">
            Başvurun bize ulaştı. Ekipten biri en kısa sürede sana yazacak. O zamana kadar duyuruları kaçırmamak için Instagram&apos;da buluşalım.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={site.socials.instagram} variant="ink" external>
              {site.instagramHandle}
            </Button>
            <Button href="/etkinlikler" variant="paper">
              Etkinliklere göz at
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[21rem_1fr] lg:gap-16">
      {/* Canlı üye kartı: form dolduruldukça güncellenir */}
      <aside className="hidden lg:block">
        <div className="sticky top-28">
          <MemberCard name={fullName} department={department} classYear={classYear} interests={interests} />
          <p className="label-mono mt-8 text-center text-ink-soft">↑ sen yazdıkça kartın dolar</p>
          <ul className="mt-6 space-y-2.5">
            {perks.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm font-semibold">
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-paper" aria-hidden="true">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-12 rounded-[2rem] border-2 border-ink bg-paper p-6 shadow-hard-lg sm:p-10">
        <fieldset>
          <Legend n="1">Seni tanıyalım</Legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ad soyad" error={errors.fullName?.message}>
              <input {...register("fullName")} className={inputCls} placeholder="Ayşe Yılmaz" autoComplete="name" aria-invalid={!!errors.fullName} />
            </Field>
            <Field label="E-posta" error={errors.email?.message}>
              <input {...register("email")} type="email" className={inputCls} placeholder="ad.soyad@ogrenci.karabuk.edu.tr" autoComplete="email" aria-invalid={!!errors.email} />
            </Field>
            <Field label="Telefon" error={errors.phone?.message}>
              <input {...register("phone")} type="tel" className={inputCls} placeholder="05xx xxx xx xx" autoComplete="tel" aria-invalid={!!errors.phone} />
            </Field>
            <Field label="Öğrenci numarası" hint="İsteğe bağlı" error={errors.studentNo?.message}>
              <input {...register("studentNo")} className={inputCls} placeholder="2024XXXXXX" inputMode="numeric" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Bölüm" error={errors.department?.message}>
                <input {...register("department")} className={inputCls} placeholder="Bilgisayar Mühendisliği" aria-invalid={!!errors.department} />
              </Field>
            </div>
          </div>

          <div className="mt-6" role="radiogroup" aria-label="Sınıf">
            <span className="mb-2 block font-display text-sm font-bold tracking-tight">Sınıf</span>
            <div className="flex flex-wrap gap-2">
              {classYears.map((c) => (
                <label key={c}>
                  <input type="radio" value={c} {...register("classYear")} className="peer sr-only" />
                  <span className={chipCls}>{c}</span>
                </label>
              ))}
            </div>
            <ErrorText>{errors.classYear?.message}</ErrorText>
          </div>
        </fieldset>

        <fieldset>
          <Legend n="2">Nerede aktif olmak istersin?</Legend>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((opt) => (
              <label key={opt}>
                <input type="checkbox" value={opt} {...register("interests")} className="peer sr-only" />
                <span className={chipCls}>{opt}</span>
              </label>
            ))}
          </div>
          <ErrorText>{errors.interests?.message}</ErrorText>
        </fieldset>

        <fieldset>
          <Legend n="3">Son olarak</Legend>
          <Field label="Neden Nexus?" error={errors.motivation?.message}>
            <textarea
              {...register("motivation")}
              rows={5}
              maxLength={1000}
              className={cn(inputCls, "resize-y")}
              placeholder="Kısaca kendinden, beklentilerinden ve kulübe neler katmak istediğinden bahset."
              aria-invalid={!!errors.motivation}
            />
          </Field>
          <p className="label-mono mt-2 text-right text-ink-soft">{(motivation ?? "").length}/1000</p>

          {/* Bot koruması (gizli alan) */}
          <input {...register("website")} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-soft">
            <input type="checkbox" {...register("consent")} className="mt-0.5 h-5 w-5 shrink-0 accent-[#14110f]" />
            <span>
              Paylaştığım bilgilerin yalnızca kulüp üyelik süreci ve etkinlik duyuruları için kullanılmasını kabul ediyorum.
              <ErrorText>{errors.consent?.message}</ErrorText>
            </span>
          </label>
        </fieldset>

        {status === "error" && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border-2 border-ink bg-coral px-4 py-3 text-sm font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" /> {serverMessage}
          </div>
        )}

        <Button type="submit" disabled={status === "sending"} className="w-full px-8 py-4 text-base sm:w-auto">
          {status === "sending" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          {status === "sending" ? "Gönderiliyor..." : "Başvuruyu gönder"}
        </Button>
      </form>
    </div>
  );
}
