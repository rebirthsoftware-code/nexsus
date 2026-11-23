import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-950 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 text-white shadow-[0_10px_40px_-12px_rgba(139,92,246,0.7)] hover:shadow-[0_16px_50px_-12px_rgba(34,211,238,0.6)] hover:-translate-y-0.5",
  secondary:
    "glass text-white hover:border-brand-400/50 hover:-translate-y-0.5",
  ghost: "text-brand-200 hover:text-white hover:bg-white/5",
};

type Props = {
  href?: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button({ href, variant = "primary", className, children, external, ...rest }: Props) {
  const classes = cn(base, variants[variant], className);
  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
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
