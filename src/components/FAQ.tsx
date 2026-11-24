"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { faq } from "@/content/faq";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {faq.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className={cn("rounded-3xl border-2 border-ink transition-all duration-300", isOpen ? "bg-paper-deep shadow-hard" : "bg-paper")}>
            <h3>
              <button className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6 sm:py-5" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} aria-controls={`faq-${i}`}>
                <span className="label-mono text-ink-soft">0{i + 1}</span>
                <span className="flex-1 font-display text-lg font-bold tracking-tight sm:text-xl">{item.q}</span>
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink transition-all duration-300", isOpen ? "rotate-45 bg-brand text-paper" : "bg-paper")} aria-hidden="true">
                  <Plus className="h-5 w-5" />
                </span>
              </button>
            </h3>
            <div id={`faq-${i}`} inert={!isOpen} className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
              <div className="overflow-hidden">
                <p className="px-5 pb-6 leading-relaxed text-ink-soft sm:pl-[4.1rem] sm:pr-16">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
