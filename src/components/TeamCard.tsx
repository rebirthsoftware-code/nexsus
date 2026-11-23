import Image from "next/image";
import { InstagramIcon, LinkedinIcon } from "./icons";
import type { TeamMember } from "@/content/team";
import { initials } from "@/lib/utils";

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="card card-hover group p-6 text-center">
      <div className="relative mx-auto h-28 w-28">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-brand-500 to-accent-400 opacity-60 blur-sm transition-opacity group-hover:opacity-100" />
        <div className="relative grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-night-800 ring-2 ring-night-950">
          {member.photo ? (
            <Image src={`/team/${member.photo}`} alt={member.name} fill className="object-cover" sizes="112px" />
          ) : (
            <span className="font-display text-3xl font-bold text-gradient">{initials(member.name)}</span>
          )}
        </div>
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold text-white">{member.name}</h3>
      <p className="mt-0.5 text-sm font-medium text-brand-200">{member.role}</p>
      <p className="text-xs text-slate-500">{member.department}</p>
      {member.bio && <p className="mt-3 text-sm leading-relaxed text-slate-400">{member.bio}</p>}
      {(member.instagram || member.linkedin) && (
        <div className="mt-4 flex justify-center gap-2">
          {member.instagram && (
            <a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} Instagram`} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-300 hover:border-brand-400/60 hover:text-white">
              <InstagramIcon className="h-4 w-4" />
            </a>
          )}
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn`} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-300 hover:border-brand-400/60 hover:text-white">
              <LinkedinIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}
