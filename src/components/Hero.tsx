import { ArrowRight, Sparkles } from "lucide-react";
import { InstagramIcon } from "./icons";
import { site } from "@/content/site";
import { Container } from "./Container";
import { Button } from "./Button";
import { NetworkBackground } from "./NetworkBackground";

const departments = ["Mühendislik", "İşletme", "Tıp", "Hukuk", "Psikoloji", "Mimarlık", "Edebiyat", "Eğitim", "İktisat", "Sağlık Bilimleri", "Güzel Sanatlar", "İlahiyat"];

export function Hero() {
  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden pt-28 pb-20">
      <NetworkBackground />
      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent-300" />
            {site.university} · Öğrenci Kulübü
          </div>

          <h1 className="animate-fade-up mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl" style={{ animationDelay: "80ms" }}>
            Bölümler arası <span className="text-gradient">bağ</span> kuran topluluk.
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300" style={{ animationDelay: "160ms" }}>
            Nexus, kampüsteki her bölümden öğrenciyi aynı masada buluşturur. Sosyalleş, yeni insanlarla tanış,
            İŞKUR onaylı sertifikalarla kariyerine erken başla.
          </p>

          <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "240ms" }}>
            <Button href="/basvuru">
              Üyelik Başvurusu <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={site.socials.instagram} variant="secondary" external>
              <InstagramIcon className="h-4 w-4" /> Instagram&apos;da Takip Et
            </Button>
          </div>
        </div>

        {/* Bölüm şeridi */}
        <div className="animate-fade-up relative mt-20 overflow-hidden" style={{ animationDelay: "360ms" }}>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-night-950 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-night-950 to-transparent z-10" />
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Her bölümden öğrenciye açık</p>
          <div className="flex gap-3 [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
            <ul className="flex shrink-0 animate-[marquee_28s_linear_infinite] gap-3 motion-reduce:animate-none">
              {[...departments, ...departments].map((d, i) => (
                <li key={i} className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </section>
  );
}
