import { cn, initials } from "@/lib/utils";
import { LogoMark } from "./Logo";

/**
 * Üye kartının yatay, küçük hali. Dar ekranlarda formun üstüne yapışık durur;
 * böylece kişi yazarken (klavye açıkken de) kartının dolduğunu görür.
 */
export function MemberCardMini({
  name,
  department,
  classYear,
  interests,
  className,
}: {
  name?: string;
  department?: string;
  classYear?: string;
  interests?: readonly string[];
  className?: string;
}) {
  const hasName = !!name?.trim();
  const meta = [department?.trim(), classYear].filter(Boolean).join(" · ");
  return (
    <div className={cn("flex -rotate-[0.6deg] overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-hard", className)} aria-hidden="true">
      {/* Sol bant: logo işareti ve baş harfler */}
      <div className="relative flex w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1.5 border-r-2 border-ink bg-navy py-2.5 short:w-16">
        <span className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,#f5f2ea_1.2px,transparent_1.2px)] [background-size:12px_12px]" />
        <LogoMark light className="relative h-3.5 w-auto short:hidden" />
        <span key={hasName ? initials(name!) : "?"} className="display-tight animate-pop relative grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-lime text-lg text-ink short:h-9 short:w-9 short:text-base">
          {hasName ? initials(name!) : "?"}
        </span>
      </div>

      <div className="min-w-0 flex-1 px-3.5 py-2.5 short:py-1.5">
        <p className="label-mono flex items-center justify-between gap-2 text-[0.58rem] text-ink-soft">
          Üye kartın
          <span className="shrink-0">sen yazdıkça dolar</span>
        </p>
        <p className={cn("truncate font-display text-xl font-extrabold leading-tight tracking-[-0.03em] short:text-lg", !hasName && "text-ink/30")}>{hasName ? name : "Adın Soyadın"}</p>
        <p className={cn("label-mono truncate text-[0.62rem]", meta ? "text-ink" : "text-ink/35")}>{meta || "Bölümün · sınıfın"}</p>
        {interests && interests.length > 0 && (
          <ul className="mt-1.5 flex gap-1 overflow-hidden short:hidden">
            {interests.map((x) => (
              <li key={x} className="animate-pop shrink-0 rounded-full border-2 border-ink bg-sun px-1.5 text-[0.62rem] font-semibold leading-[1.15rem]">
                {x}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
