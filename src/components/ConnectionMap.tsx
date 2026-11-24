"use client";

import { useEffect, useRef, useState } from "react";
import { departments } from "@/content/site";
import { MARK } from "./Logo";
import { cn } from "@/lib/utils";

const INK = "#0b0b0c";
const PAPER = "#f5f2ea";
const LIME = "#c8f03c";
const CORAL = "#ff5b38";
const BRAND = "#015efb";
const NAVY = "#011e45";

const toPoints = (s: string) => s.split(" ").map((p) => p.split(",").map(Number) as [number, number]);
const MARK_BLUE = toPoints(MARK.blue);
const MARK_NAVY = toPoints(MARK.navy);
const DOTS = ["#ffc83d", "#ff5b38", "#b9a2ff", "#c8f03c", "#f5f2ea"];

type Node = {
  label: string;
  color: string;
  /** Düğümün "ev" konumu; etrafında hafifçe salınır */
  hx: number;
  hy: number;
  x: number;
  y: number;
  /** İmlece doğru çekilme ofseti */
  ox: number;
  oy: number;
  w: number;
  phase: number;
  speed: number;
  /** 0..1 arası: imleçle bağlantı gücü (yumuşatılmış) */
  link: number;
};

/** Tekrarlanabilir rastgelelik: her yüklemede aynı yerleşim */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
}

/**
 * Hero'daki etkileşimli "bağlantı haritası".
 * Her etiket bir bölümü temsil eder; ortadaki NEXUS düğümü hepsini birbirine bağlar.
 * İmleç (ya da parmak) "Sen" düğümüdür: yaklaştığı bölümlerle bağ kurar.
 * Canvas ile çizilir; görünür değilken durur, hareket azaltma tercihine saygı duyar.
 */
export function ConnectionMap({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = getComputedStyle(document.documentElement);
    const bodyFace = root.getPropertyValue("--font-body").trim() || "sans-serif";
    const displayFace = root.getPropertyValue("--font-display-face").trim() || "sans-serif";
    const pillFont = `600 13px ${bodyFace}`;
    const PILL_H = 30;

    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let raf = 0;
    let visible = false;
    let lastCount = -1;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, inside: false };

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rand = seeded(11);
      const list = departments.slice(0, w < 420 ? 8 : departments.length);
      ctx.font = pillFont;
      nodes = list.map((label, i) => {
        const pw = ctx.measureText(label).width + 40;
        const angle = (i / list.length) * Math.PI * 2 - Math.PI / 2 + (rand() - 0.5) * 0.3;
        const ring = i % 2 === 0 ? 0.94 : 0.56;
        const rx = Math.max(40, w / 2 - pw / 2 - 16) * ring;
        const ry = Math.max(40, h / 2 - 62) * ring;
        const hx = w / 2 + Math.cos(angle) * rx;
        const hy = h / 2 + Math.sin(angle) * ry;
        return { label, color: DOTS[i % DOTS.length], hx, hy, x: hx, y: hy, ox: 0, oy: 0, w: pw, phase: rand() * Math.PI * 2, speed: 0.45 + rand() * 0.5, link: 0 };
      });
      if (!pointer.inside) {
        pointer.x = pointer.tx = w * 0.72;
        pointer.y = pointer.ty = h * 0.3;
      }
    };

    const line = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const draw = (t: number) => {
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      // Merkezden bölümlere giden kesikli bağlar
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = "rgba(245,242,234,0.42)";
      ctx.setLineDash([3, 7]);
      ctx.lineDashOffset = -t * 14;
      for (const n of nodes) line(cx, cy, n.x, n.y);
      ctx.setLineDash([]);

      // Birbirine yakın bölümler arasındaki bağlar
      const near = Math.min(w, h) * 0.34;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < near) {
            ctx.strokeStyle = `rgba(245,242,234,${(1 - d / near) * 0.55})`;
            line(a.x, a.y, b.x, b.y);
          }
        }
      }

      // "Sen" düğümünden kurulan bağlar
      ctx.strokeStyle = LIME;
      ctx.lineCap = "round";
      for (const n of nodes) {
        if (n.link < 0.02) continue;
        ctx.globalAlpha = n.link;
        ctx.lineWidth = 1 + n.link * 2.4;
        line(pointer.x, pointer.y, n.x, n.y);
      }
      ctx.globalAlpha = 1;

      // Merkez düğüm
      const hubR = Math.min(52, Math.min(w, h) * 0.11) + Math.sin(t * 1.8) * 1.5;
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = "rgba(245,242,234,0.5)";
      ctx.beginPath();
      ctx.arc(cx, cy, hubR + 12 + Math.sin(t * 1.8 + 1) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(cx + 3, cy + 3, hubR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PAPER;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Logodaki X işareti
      const scale = (hubR * 1.02) / MARK.width;
      const mx = cx - (MARK.width * scale) / 2;
      const my = cy - (MARK.height * scale) / 2;
      for (const [points, color] of [
        [MARK_BLUE, BRAND],
        [MARK_NAVY, NAVY],
      ] as const) {
        ctx.fillStyle = color;
        ctx.beginPath();
        points.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(mx + px * scale, my + py * scale) : ctx.lineTo(mx + px * scale, my + py * scale)));
        ctx.closePath();
        ctx.fill();
      }
      ctx.textBaseline = "middle";

      // Bölüm etiketleri
      ctx.font = pillFont;
      ctx.textAlign = "left";
      for (const n of nodes) {
        const x = Math.min(Math.max(n.x - n.w / 2, 6), w - n.w - 9);
        const y = n.y - PILL_H / 2;
        ctx.fillStyle = INK;
        pill(ctx, x + 3, y + 3, n.w, PILL_H);
        ctx.fill();
        ctx.fillStyle = n.link > 0.5 ? LIME : PAPER;
        ctx.lineWidth = 2;
        ctx.strokeStyle = INK;
        pill(ctx, x, y, n.w, PILL_H);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = n.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x + 15, n.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = INK;
        ctx.fillText(n.label, x + 27, n.y + 1);
      }

      // "Sen"
      const sw = 54;
      ctx.fillStyle = INK;
      pill(ctx, pointer.x - sw / 2 + 3, pointer.y - 14 + 3, sw, 28);
      ctx.fill();
      ctx.fillStyle = CORAL;
      ctx.lineWidth = 2;
      ctx.strokeStyle = INK;
      pill(ctx, pointer.x - sw / 2, pointer.y - 14, sw, 28);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.font = `800 13px ${displayFace}`;
      ctx.textAlign = "center";
      ctx.fillText("Sen", pointer.x, pointer.y + 1);
    };

    const step = (t: number, ease: number) => {
      // İmleç içeride değilken "Sen" kendi kendine dolaşır; sahne hiç boş kalmaz
      if (!pointer.inside) {
        pointer.tx = w / 2 + Math.cos(t * 0.33) * w * 0.3;
        pointer.ty = h / 2 + Math.sin(t * 0.47) * h * 0.3;
      }
      const follow = pointer.inside ? 0.28 : 0.05;
      pointer.x += (pointer.tx - pointer.x) * Math.max(follow, ease);
      pointer.y += (pointer.ty - pointer.y) * Math.max(follow, ease);

      const reach = Math.min(w, h) * 0.37;
      let linked = 0;
      for (const n of nodes) {
        const bx = n.hx + Math.sin(t * n.speed + n.phase) * 9;
        const by = n.hy + Math.cos(t * n.speed * 0.8 + n.phase) * 7;
        const dx = pointer.x - bx;
        const dy = pointer.y - by;
        const isNear = Math.hypot(dx, dy) < reach;
        n.ox += ((isNear ? dx * 0.16 : 0) - n.ox) * Math.max(0.08, ease);
        n.oy += ((isNear ? dy * 0.16 : 0) - n.oy) * Math.max(0.08, ease);
        n.x = bx + n.ox;
        n.y = by + n.oy;
        n.link += ((isNear ? 1 : 0) - n.link) * Math.max(0.14, ease);
        if (isNear) linked++;
      }
      if (linked !== lastCount) {
        lastCount = linked;
        setCount(linked);
      }
    };

    const frame = (now: number) => {
      const t = now / 1000;
      step(t, 0);
      draw(t);
      if (visible) raf = requestAnimationFrame(frame);
    };

    const renderStatic = () => {
      step(0, 1);
      draw(0);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduce) renderStatic();
      else if (visible) raf = requestAnimationFrame(frame);
    };

    const toLocal = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
      pointer.inside = true;
      if (reduce) renderStatic();
    };
    const leave = () => {
      pointer.inside = false;
    };

    const ro = new ResizeObserver(() => {
      layout();
      if (reduce) renderStatic();
    });
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });

    layout();
    ro.observe(wrap);
    io.observe(wrap);
    wrap.addEventListener("pointermove", toLocal);
    wrap.addEventListener("pointerdown", toLocal);
    wrap.addEventListener("pointerleave", leave);
    wrap.addEventListener("pointercancel", leave);
    // Yazı tipleri yüklenince etiket genişliklerini yeniden ölç
    document.fonts?.ready.then(() => {
      layout();
      if (reduce) renderStatic();
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("pointermove", toLocal);
      wrap.removeEventListener("pointerdown", toLocal);
      wrap.removeEventListener("pointerleave", leave);
      wrap.removeEventListener("pointercancel", leave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn("relative touch-pan-y select-none overflow-hidden rounded-[2rem] border-2 border-ink bg-brand shadow-hard-lg", className)}
    >
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle,#f5f2ea_1.2px,transparent_1.2px)] [background-size:22px_22px]" aria-hidden="true" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <p className="sr-only">
        Farklı bölümlerin Nexus etrafında birbirine bağlandığını gösteren etkileşimli çizim.
      </p>
      <div className="label-mono pointer-events-none absolute left-0 top-0 flex items-center gap-2.5 px-5 py-4 text-paper" aria-hidden="true">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-80" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
        </span>
        Bağlantı haritası · canlı
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-5 py-4 text-paper" aria-hidden="true">
        <p className="font-display text-base font-bold leading-tight tracking-tight">
          Şu an <span className="inline-block min-w-[1.6em] rounded-full border-2 border-ink bg-lime px-1.5 text-center text-ink tabular-nums">{count}</span> bölümle
          bağlısın
        </p>
        <p className="label-mono hidden text-paper/75 sm:block">imleci gezdir</p>
      </div>
    </div>
  );
}
