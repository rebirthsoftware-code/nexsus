import Image from "next/image";
import type { TeamMember } from "@/content/team";
import { accentBg } from "@/lib/accents";
import { cn, initials } from "@/lib/utils";
import { InstagramIcon, LinkedinIcon } from "./icons";

/** Yaka kartı görünümlü ekip üyesi kartı. */
export function TeamCard({ member, index = 0 }: { member: TeamMember; index?: number }) {
  return (
    <article className={cn("liftable relative h-full overflow-hidden rounded-[1.75rem] border-2 border-ink bg-paper shadow-hard hover:rotate-0", index % 2 === 0 ? "-rotate-1" : "rotate-1")}>
      <div className={cn("relative h-24 border-b-2 border-ink", accentBg[member.accent])}>
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle,currentColor_1.2px,transparent_1.2px)] [background-size:14px_14px]" aria-hidden="true" />
        <span className="absolute left-1/2 top-3 h-2.5 w-12 -translate-x-1/2 rounded-full border-2 border-ink bg-paper" aria-hidden="true" />
        <span className="label-mono absolute bottom-2 right-4">NX—{String(index + 1).padStart(3, "0")}</span>
      </div>
      <div className="px-6 pb-6">
        <div className="relative -mt-11 grid h-[5.5rem] w-[5.5rem] place-items-center overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-hard-sm">
          {member.photo ? (
            <Image src={`/team/${member.photo}`} alt={member.name} fill className="object-cover" sizes="88px" />
          ) : (
            <span className="display-tight text-3xl">{initials(member.name)}</span>
          )}
        </div>
        <h3 className="mt-4 font-display text-2xl font-extrabold tracking-[-0.03em]">{member.name}</h3>
        <p className="mt-1.5 inline-block rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">{member.role}</p>
        <p className="label-mono mt-3 text-ink-soft">{member.department}</p>
        {member.quote && <p className="mt-3 font-serif text-xl italic leading-snug">“{member.quote}”</p>}
        {(member.instagram || member.linkedin) && (
          <div className="mt-4 flex gap-2">
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
