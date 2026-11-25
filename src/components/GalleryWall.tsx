"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryAlbum } from "@/lib/gallery";
import { asset, cn, dateParts } from "@/lib/utils";
import { Polaroid } from "./Polaroid";

type Open = { album: number; photo: number };

/** Fotoğraf duvarı: albümler şipşak fotoğraflar halinde dizilir, dokununca büyük hali açılır. */
export function GalleryWall({ albums }: { albums: GalleryAlbum[] }) {
  const [open, setOpen] = useState<Open | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  const step = useCallback(
    (dir: 1 | -1) =>
      setOpen((o) => {
        if (!o) return o;
        const n = albums[o.album].photos.length;
        return { ...o, photo: (o.photo + dir + n) % n };
      }),
    [albums]
  );

  // Büyük görünüm açıkken: klavye kısayolları, sayfa kaydırmasını kilitle, odağı kapat düğmesine al
  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, step]);

  const current = open ? albums[open.album].photos[open.photo] : null;
  const currentAlbum = open ? albums[open.album] : null;

  return (
    <div className="space-y-20">
      {albums.map((album, ai) => {
        const d = album.date ? dateParts(album.date) : null;
        return (
          <section key={album.slug} id={album.slug} className="scroll-mt-28">
            <header className="flex flex-col gap-2 border-b-2 border-ink pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="display-tight text-3xl sm:text-5xl">{album.title}</h2>
                {album.description && <p className="mt-2 max-w-2xl text-ink-soft">{album.description}</p>}
              </div>
              <p className="label-mono shrink-0 text-ink-soft">
                {d && `${d.day} ${d.month} ${d.year} · `}
                {album.photos.length} kare
              </p>
            </header>
            <ul className="mt-9 grid grid-cols-2 items-start gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {album.photos.map((photo, pi) => (
                <li key={photo.src} className="pt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      opener.current = e.currentTarget;
                      setOpen({ album: ai, photo: pi });
                    }}
                    className="group block w-full text-left"
                    aria-label={`${photo.caption || album.title}, ${pi + 1}. fotoğrafı büyüt`}
                  >
                    <Polaroid index={ai + pi} caption={photo.caption} className="group-hover:rotate-0 group-hover:scale-[1.03] group-focus-visible:rotate-0">
                      {/* eslint-disable-next-line @next/next/no-img-element -- statik yayında görsel optimizasyonu yok; küçültme derleme öncesinde yapılır */}
                      <img src={asset(photo.thumb)} alt={photo.caption || `${album.title} etkinliğinden bir kare`} width={photo.width} height={photo.height} loading="lazy" decoding="async" className="block h-auto w-full border-2 border-ink bg-paper-deep" />
                    </Polaroid>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {open && current && currentAlbum && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${currentAlbum.title} fotoğrafı`}
          className="fixed inset-0 z-[80] flex flex-col bg-ink/95 text-paper"
          onClick={(e) => e.target === e.currentTarget && close()}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          }}
        >
          <div className="flex items-center justify-between gap-4 px-4 pb-2 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:px-6">
            <p className="label-mono min-w-0 truncate">
              {currentAlbum.title} · {open.photo + 1}/{currentAlbum.photos.length}
            </p>
            <button ref={closeBtn} type="button" onClick={close} aria-label="Kapat" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-paper bg-ink hover:bg-paper hover:text-ink">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-16" onClick={(e) => e.target === e.currentTarget && close()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- bkz. yukarıdaki not */}
            <img key={current.src} src={asset(current.src)} alt={current.caption || `${currentAlbum.title} etkinliğinden bir kare`} className="animate-pop max-h-full max-w-full border-[6px] border-white object-contain shadow-2xl sm:border-[10px]" />
            {currentAlbum.photos.length > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Önceki fotoğraf" className={cn(navBtn, "left-2 sm:left-4")}>
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Sonraki fotoğraf" className={cn(navBtn, "right-2 sm:right-4")}>
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          <p className="min-h-[3.5rem] px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 text-center font-serif text-2xl italic">{current.caption}</p>
        </div>
      )}
    </div>
  );
}

const navBtn = "absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border-2 border-ink bg-paper text-ink shadow-hard-sm transition-transform hover:scale-110";
