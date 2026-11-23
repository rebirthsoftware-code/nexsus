"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { faq } from "@/content/faq";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.02]">
      {faq.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-${i}`}
            >
              <span className="font-medium text-white">{item.q}</span>
              <Plus className={cn("h-5 w-5 shrink-0 text-brand-300 transition-transform duration-300", isOpen && "rotate-45")} />
            </button>
            <div
              id={`faq-${i}`}
              className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
