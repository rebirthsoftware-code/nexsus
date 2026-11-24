import { ArrowUpRight } from "lucide-react";
import { socialAccounts } from "@/content/site";
import { cn } from "@/lib/utils";
import { socialIcons } from "./icons";
import { Reveal } from "./Reveal";

const tones = {
  instagram: "bg-coral text-ink",
  tiktok: "bg-ink text-paper",
  youtube: "bg-sun text-ink",
} as const;

/** Kulübün sosyal medya hesapları: her hesap büyük, tıklanabilir bir kutu. */
export function SocialTiles() {
  return (
    <ul className="grid gap-5 md:grid-cols-3">
      {socialAccounts.map((a, i) => {
        const Icon = socialIcons[a.key];
        return (
          <Reveal as="li" key={a.key} delay={i * 90}>
            <a
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("liftable group flex h-full min-h-[13rem] flex-col justify-between rounded-[1.75rem] border-2 border-ink p-6 shadow-hard", tones[a.key])}
            >
              <span className="flex items-start justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-paper text-ink shadow-hard-sm">
                  <Icon className="h-6 w-6" />
                </span>
                <ArrowUpRight className="h-7 w-7 transition-transform duration-300 group-hover:rotate-45" aria-hidden="true" />
              </span>
              <span>
                <span className="label-mono block opacity-80">{a.note}</span>
                <span className="mt-1 block font-display text-3xl font-extrabold tracking-[-0.03em]">{a.name}</span>
                <span className="mt-0.5 block break-all font-mono text-sm">{a.handle}</span>
              </span>
            </a>
          </Reveal>
        );
      })}
    </ul>
  );
}
