import type { TeamMember } from "@/content/team";
import { accentBg } from "@/lib/accents";
import { asset, cn, initials } from "@/lib/utils";
import { InstagramIcon, LinkedinIcon } from "./icons";
import { LoopClip } from "./LoopClip";

/**
 * Ekip üyesi kartı: "konuşmacı tanıtımı" afişi tarzında.
 * Üstte kısa döngülü klip (GIF gibi), fotoğraf ya da baş harfler; altta etiket gibi yapıştırılmış isim ve görev.
 */
export function TeamCard({ member, index = 0 }: { member: TeamMember; index?: number }) {
  const upper = member.name.toLocaleUpperCase("tr-TR");
  return (
    <article className={cn("liftable relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border-2 border-ink bg-paper shadow-hard hover:rotate-0", index % 2 === 0 ? "-rotate-1" : "rotate-1")}>
      <div className={cn("relative aspect-[4/5] overflow-hidden border-b-2 border-ink", accentBg[member.accent])}>
        {/* Arka plan: nokta dokusu ve tekrar eden isim (klip ya da fotoğraf yokken görünür) */}
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle,currentColor_1.3px,transparent_1.3px)] [background-size:12px_12px]" aria-hidden="true" />
        <div className="display-tight absolute -inset-x-6 top-3 -rotate-6 select-none text-[2.4rem] uppercase leading-[0.86] opacity-25 sm:text-[2.9rem]" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className={cn("block whitespace-nowrap", i === 1 && "pl-8")}>
              {upper} {upper}
            </span>
          ))}
        </div>

        {member.clip ? (
          <LoopClip src={asset(`/team/${member.clip}`)} poster={member.photo ? asset(`/team/${member.photo}`) : undefined} label={member.name} />
        ) : member.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- statik yayında görsel optimizasyonu yok; düz <img> yeterli
          <img src={asset(`/team/${member.photo}`)} alt={member.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
        ) : (
          <span className="display-tight absolute bottom-6 left-1/2 grid h-24 w-24 -translate-x-1/2 place-items-center rounded-full border-2 border-ink bg-paper text-4xl text-ink shadow-hard-sm sm:h-28 sm:w-28">
            {initials(member.name)}
          </span>
        )}

        <span className="label-mono absolute left-2.5 top-2.5 rounded-full border-2 border-ink bg-paper px-2 py-0.5 text-[0.62rem] text-ink">NX—{String(index + 1).padStart(3, "0")}</span>
      </div>

      <div className="relative flex flex-1 flex-col px-3.5 pb-4 sm:px-5 sm:pb-5">
        {/* Etiketler: videodaki isim ve görev bantları gibi */}
        <div className="-mt-4 flex flex-col items-start gap-1.5">
          <h3 className="-rotate-2 border-2 border-ink bg-white px-2 py-0.5 font-display text-base font-extrabold uppercase leading-tight tracking-tight text-navy shadow-hard-sm sm:px-2.5 sm:text-xl">
            {member.name}
          </h3>
          <p className="rotate-1 border-2 border-ink bg-sun px-2 py-0.5 font-display text-xs font-bold leading-tight text-navy sm:text-sm">{member.role}</p>
        </div>
        {member.department && <p className="label-mono mt-3 text-[0.62rem] text-ink-soft sm:text-[0.72rem]">{member.department}</p>}
        {member.quote && <p className="mt-2 hidden font-serif text-lg italic leading-snug sm:block">“{member.quote}”</p>}
        {(member.instagram || member.linkedin) && (
          <div className="mt-auto flex gap-2 pt-3">
            {member.instagram && (
              <a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} Instagram`} className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink transition-colors hover:bg-lime">
                <InstagramIcon className="h-4 w-4" />
              </a>
            )}
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn`} className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink transition-colors hover:bg-lime">
                <LinkedinIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
