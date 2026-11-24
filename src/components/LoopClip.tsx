"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * GIF gibi davranan sessiz, döngülü kısa video.
 * Gerçek GIF yerine MP4 kullanılır: aynı görüntü yaklaşık 10 kat daha küçük dosyayla gelir.
 * - Yalnızca ekranda görünürken oynar (pil ve veri tasarrufu).
 * - "Hareketi azalt" tercihi açıksa kendiliğinden oynamaz; düğmeyle başlatılır.
 * - Her zaman bir durdur/oynat düğmesi vardır.
 */
export function LoopClip({ src, poster, label, className }: { src: string; poster?: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // Kullanıcı elle durdurduysa görünürlük değişse de kendiliğinden başlatma
  const userPaused = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    userPaused.current = reduce;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => {});
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  return (
    <div className={cn("absolute inset-0", className)}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="h-full w-full object-cover object-top"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `${label}: videoyu durdur` : `${label}: videoyu oynat`}
        className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-paper text-ink opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100"
      >
        {playing ? <Pause className="h-3.5 w-3.5 fill-ink" /> : <Play className="h-3.5 w-3.5 fill-ink" />}
      </button>
    </div>
  );
}
