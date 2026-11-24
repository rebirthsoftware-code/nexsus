import { Logo } from "./Logo";
import { cn, initials } from "@/lib/utils";

const bars = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 2, 1, 4, 1, 3];

/**
 * Üye kartı önizlemesi. Başvuru formu doldurulurken canlı olarak güncellenir;
 * başvuru gönderilince üzerine "Başvuru alındı" damgası basılır.
 */
export function MemberCard({
  name,
  department,
  classYear,
  interests,
  stamped = false,
  className,
}: {
  name?: string;
  department?: string;
  classYear?: string;
  interests?: readonly string[];
  stamped?: boolean;
  className?: string;
}) {
  const hasName = !!name?.trim();
  return (
    <div className={cn("relative mx-auto w-full max-w-[19rem]", className)} aria-hidden="true">
      {/* Boyun askısı */}
      <div className="mx-auto h-14 w-7 border-x-2 border-ink bg-coral" />
      <div className="relative z-10 mx-auto -mb-3 h-6 w-12 rounded-md border-2 border-ink bg-paper-deep" />

      <div className="relative -rotate-2 overflow-hidden rounded-[1.75rem] border-2 border-ink bg-paper text-ink shadow-hard-lg">
        <div className="relative border-b-2 border-ink bg-navy px-5 pb-14 pt-8 text-paper">
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,#f5f2ea_1.2px,transparent_1.2px)] [background-size:14px_14px]" />
          <div className="relative flex items-center justify-between">
            <Logo light asLink={false} className="h-5" />
            <span className="label-mono">Üye kartı</span>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="display-tight relative -mt-10 grid h-20 w-20 place-items-center rounded-full border-2 border-ink bg-lime text-3xl shadow-hard-sm">
            {hasName ? initials(name!) : "?"}
          </div>
          <p className={cn("mt-4 break-words font-display text-[1.7rem] font-extrabold leading-[1.05] tracking-[-0.03em]", !hasName && "text-ink/30")}>
            {hasName ? name : "Adın Soyadın"}
          </p>
          <p className={cn("label-mono mt-2", department?.trim() ? "text-ink" : "text-ink/35")}>{department?.trim() || "Bölümün"}</p>
          {classYear && <p className="label-mono mt-1 text-ink-soft">{classYear}</p>}

          <ul className="mt-4 flex min-h-[1.9rem] flex-wrap gap-1.5">
            {(interests ?? []).map((x) => (
              <li key={x} className="animate-pop rounded-full border-2 border-ink bg-sun px-2 py-0.5 text-[0.7rem] font-semibold">
                {x.split(" ")[0]}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-end justify-between border-t-2 border-dashed border-ink pt-4">
            <div className="flex h-8 items-stretch gap-[2px]">
              {bars.map((b, i) => (
                <span key={i} className="bg-ink" style={{ width: b }} />
              ))}
            </div>
            <span className="label-mono text-ink-soft">NX · Üye</span>
          </div>
        </div>

        {stamped && (
          <span className="animate-stamp absolute right-3 top-[7.3rem] -rotate-12 rounded-lg border-[3px] border-coral bg-paper/90 px-2.5 py-0.5 font-display text-base font-extrabold uppercase tracking-tight text-coral">
            Başvuru alındı
          </span>
        )}
      </div>
    </div>
  );
}
