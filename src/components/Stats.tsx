"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

const dots = ["bg-coral", "bg-cobalt", "bg-lime", "bg-sun"];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / 1300);
          setN(Math.round(value * (1 - Math.pow(1 - p, 4))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <dl className="grid grid-cols-2 border-y-2 border-ink lg:grid-cols-4">
      {site.stats.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            "flex flex-col gap-2 border-ink px-4 py-8 sm:px-8 sm:py-10",
            i % 2 === 1 && "border-l-2",
            i < 2 && "border-b-2 lg:border-b-0",
            i === 2 && "lg:border-l-2"
          )}
        >
          <dd className="display-tight order-1 text-6xl sm:text-7xl lg:text-8xl">
            <Counter value={s.value} suffix={s.suffix} />
          </dd>
          <dt className="label-mono order-2 flex items-center gap-2 text-ink-soft">
            <span className={cn("h-2.5 w-2.5 rounded-full border-2 border-ink", dots[i % dots.length])} aria-hidden="true" />
            {s.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
