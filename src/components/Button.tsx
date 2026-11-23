import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "lime" | "ink" | "paper" | "cobalt";

const base =
  "pressable inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink px-6 py-3 font-display text-[0.95rem] font-bold tracking-tight disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  lime: "bg-lime text-ink",
  ink: "bg-ink text-paper",
  paper: "bg-paper text-ink",
  cobalt: "bg-cobalt text-paper",
};

type Props = {
  href?: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button({ href, variant = "lime", className, children, external, ...rest }: Props) {
  const classes = cn(base, variants[variant], className);
  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
