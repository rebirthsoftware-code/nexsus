"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Clock3, Loader2, Send, ShieldCheck, Users2 } from "lucide-react";
import { applicationSchema, attractions, classYears, studentNoFromEmail, STUDENT_EMAIL_DOMAIN, type ApplicationInput } from "@/lib/schema";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import { MemberCard } from "./MemberCard";
import { Button } from "./Button";

const inputCls =
  "w-full rounded-xl border-2 border-ink bg-white/60 px-4 py-3 text-base text-ink placeholder:text-ink/35 outline-none transition-all focus:bg-white focus:shadow-[4px_4px_0_0_var(--color-brand)] focus-visible:outline-none aria-[invalid=true]:border-coral aria-[invalid=true]:shadow-[4px_4px_0_0_var(--color-coral)]";

const chipCls =
  "block cursor-pointer rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 peer-checked:bg-brand peer-checked:text-paper peer-checked:shadow-hard-sm peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand";

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

/**
 * Yedek seçenek: başvuruların gönderileceği özel bir adres (ör. Google Sheets'e yazan Apps Script).
 * Ne veritabanı ne de bu adres tanımlıysa form, başvuru metnini hazırlayıp Instagram mesajına yönlendirir.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_APPLICATION_ENDPOINT;

/**
 * Yönetim panelinin veritabanı (Supabase). Tanımlıysa başvurular doğrudan oraya yazılır ve
 * panelde görünür. Buradaki anahtar herkese açıktır; ziyaretçiler yalnızca başvuru ekleyebilir,
 * hiçbir kaydı okuyamaz (kurallar veritabanında tanımlıdır, bkz. supabase/schema.sql).
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CAN_SUBMIT = Boolean((SUPABASE_URL && SUPABASE_ANON_KEY) || ENDPOINT);

const SAVE_ERROR = "Başvuru şu an kaydedilemedi, lütfen biraz sonra tekrar dene.";

async function saveApplication(a: Omit<ApplicationInput, "website" | "consent">) {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        full_name: a.fullName,
        email: a.email,
        phone: a.phone,
        department: a.department,
        class_year: a.classYear,
        // Öğrenci numarası e-postanın başındaki kısımdır; ayrıca sorulmaz
        student_no: studentNoFromEmail(a.email),
        attractions: a.attractions,
        note: a.note || null,
      }),
    });
    if (!res.ok) throw new Error(SAVE_ERROR);
    return;
  }
  if (ENDPOINT) {
    // "text/plain" gövde, Google Apps Script gibi basit uç noktaların ön kontrol (preflight) istemeden kabul etmesini sağlar
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...a, studentNo: studentNoFromEmail(a.email), submittedAt: new Date().toISOString(), source: "nexus-web" }),
    });
    if (!res.ok) throw new Error(SAVE_ERROR);
  }
}

type Submitted = Pick<ApplicationInput, "fullName" | "department" | "classYear"> & {
  chips: string[];
  /** sent: uç noktaya kaydedildi · manual: metin hazırlandı, kullanıcı Instagram'dan gönderecek */
  mode: "sent" | "manual";
  summary: string;
};

/** Seçilen seçenekleri üye kartındaki kısa etiketlere çevirir */
function toChips(values: readonly string[] | undefined) {
  return attractions.filter((a) => values?.includes(a.value)).map((a) => a.chip);
}

function summarize(d: Omit<ApplicationInput, "website" | "consent">) {
  return [
    "Nexus üyelik başvurusu",
    `Ad soyad: ${d.fullName}`,
    `Bölüm: ${d.department} (${d.classYear})`,
    `E-posta: ${d.email}`,
    studentNoFromEmail(d.email) ? `Öğrenci no: ${studentNoFromEmail(d.email)}` : null,
    `Telefon: ${d.phone}`,
    `En çok ilgisini çeken: ${d.attractions.join(", ")}`,
    d.note ? `Not: ${d.note}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

const perks = [
  { Icon: Clock3, text: "İki dakika sürer" },
  { Icon: Users2, text: "Bölüm ya da sınıf şartı yok" },
  { Icon: ShieldCheck, text: "Bilgilerin yalnızca kulüp içinde kalır" },
];

export function ApplicationForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { attractions: [], note: "", website: "" },
  });

  const [fullName, department, classYear, selected, note] = useWatch({
    control,
    name: ["fullName", "department", "classYear", "attractions", "note"],
  });
  const chips = toChips(selected);

  // Başvuru alındığında onay kartını görünür alana getir
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === "success") successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [status]);

  const copySummary = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false); // pano izni yoksa metin ekranda gösterilir, elle kopyalanabilir
    }
  };

  const onSubmit = async (data: ApplicationInput) => {
    setStatus("sending");
    setServerMessage("");
    const { website, consent, ...application } = data;
    void consent;
    const card = { fullName: data.fullName, department: data.department, classYear: data.classYear, chips: toChips(data.attractions) };

    // Bot koruması: gizli alan doluysa hiçbir şey göndermeden "başarılı" görün
    if (website) {
      setSubmitted({ ...card, mode: "sent", summary: "" });
      setStatus("success");
      return;
    }

    // Kayıt adresi tanımlı değilse başvuru metni hazırlanır ve Instagram mesajı olarak gönderilir
    if (!CAN_SUBMIT) {
      const summary = summarize(application);
      await copySummary(summary);
      setSubmitted({ ...card, mode: "manual", summary });
      setStatus("success");
      return;
    }

    try {
      await saveApplication(application);
      setSubmitted({ ...card, mode: "sent", summary: "" });
      setStatus("success");
      reset();
    } catch (e) {
      setStatus("error");
      // Ağ hatalarında tarayıcının İngilizce iletisi yerine anlaşılır bir açıklama göster
      setServerMessage(e instanceof Error && e.message === SAVE_ERROR ? SAVE_ERROR : "Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.");
    }
  };

  if (status === "success" && submitted) {
    const firstName = submitted.fullName.trim().split(/\s+/)[0];
    const manual = submitted.mode === "manual";
    return (
      <div ref={successRef} className="grid items-center gap-12 rounded-[2rem] border-2 border-ink bg-brand p-8 text-paper shadow-hard-lg sm:p-14 lg:grid-cols-[19rem_1fr] lg:gap-16">
        <MemberCard name={submitted.fullName} department={submitted.department} classYear={submitted.classYear} interests={submitted.chips} stamped={!manual} />
        <div role="status">
          <p className="label-mono">{manual ? "Son bir adım" : "Başvuru alındı"}</p>
          <h2 className="display-tight mt-4 text-5xl sm:text-6xl">{manual ? `Başvurun hazır, ${firstName}!` : `Hoş geldin, ${firstName}!`}</h2>
          {manual ? (
            <>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-paper/90">
                {copied ? "Başvuru metnin panoya kopyalandı." : "Aşağıdaki başvuru metnini kopyala."} Instagram&apos;da bize mesaj olarak yapıştırıp gönder; ekipten biri sana dönecek.
              </p>
              <textarea readOnly value={submitted.summary} rows={6} className="mt-5 w-full max-w-lg resize-none rounded-xl border-2 border-ink bg-paper p-4 font-mono text-xs leading-relaxed text-ink" aria-label="Başvuru metni" onFocus={(e) => e.currentTarget.select()} />
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={`https://ig.me/m/${site.instagramHandle.replace("@", "")}`} variant="lime" external>
                  Instagram&apos;da mesaj at <Send className="h-4 w-4" />
                </Button>
                <Button type="button" variant="paper" onClick={() => copySummary(submitted.summary)}>
                  {copied ? "Kopyalandı ✓" : "Metni kopyala"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-paper/90">
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
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[21rem_1fr] lg:gap-16">
      {/* Canlı üye kartı: form dolduruldukça güncellenir */}
      <aside className="hidden lg:block">
        <div className="sticky top-28">
          <MemberCard name={fullName} department={department} classYear={classYear} interests={chips} />
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
            <Field label="Öğrenci e-postası" hint={`Yalnızca @${STUDENT_EMAIL_DOMAIN} uzantılı adres kabul edilir`} error={errors.email?.message}>
              <input
                {...register("email")}
                type="email"
                className={inputCls}
                placeholder={`öğrenci.numarası@${STUDENT_EMAIL_DOMAIN}`}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={!!errors.email}
              />
            </Field>
            <Field label="Telefon" error={errors.phone?.message}>
              <input {...register("phone")} type="tel" className={inputCls} placeholder="05xx xxx xx xx" autoComplete="tel" aria-invalid={!!errors.phone} />
            </Field>
            <Field label="Bölüm" error={errors.department?.message}>
              <input {...register("department")} className={inputCls} placeholder="Bilgisayar Mühendisliği" aria-invalid={!!errors.department} />
            </Field>
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
          <Legend n="2">Kulüpte en çok ne ilgini çekiyor?</Legend>
          <p className="-mt-2 mb-4 text-sm text-ink-soft">Birden fazla seçebilirsin. Etkinlikleri buna göre planlıyoruz.</p>
          <div className="flex flex-wrap gap-2">
            {attractions.map((opt) => (
              <label key={opt.value}>
                <input type="checkbox" value={opt.value} {...register("attractions")} className="peer sr-only" />
                <span className={chipCls}>{opt.value}</span>
              </label>
            ))}
          </div>
          <ErrorText>{errors.attractions?.message}</ErrorText>
        </fieldset>

        <fieldset>
          <Legend n="3">Son olarak</Legend>
          <Field label="Eklemek istediğin bir şey var mı?" hint="İsteğe bağlı" error={errors.note?.message}>
            <textarea
              {...register("note")}
              rows={3}
              maxLength={500}
              className={cn(inputCls, "resize-y")}
              placeholder="Görmek istediğin bir eğitim, merak ettiğin bir konu, aklındaki bir soru..."
              aria-invalid={!!errors.note}
            />
          </Field>
          <p className="label-mono mt-2 text-right text-ink-soft">{(note ?? "").length}/500</p>

          {/* Bot koruması (gizli alan) */}
          <input {...register("website")} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-soft">
            <input type="checkbox" {...register("consent")} className="mt-0.5 h-5 w-5 shrink-0 accent-[#0b0b0c]" />
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
          {status === "sending" ? "Gönderiliyor..." : CAN_SUBMIT ? "Başvuruyu gönder" : "Başvurumu hazırla"}
        </Button>
        {!CAN_SUBMIT && <p className="text-sm text-ink-soft">Başvurun bir metin olarak hazırlanır; son adımda Instagram mesajıyla bize gönderirsin.</p>}
      </form>
    </div>
  );
}
