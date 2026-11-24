import { cn } from "@/lib/utils";
import { Chevron } from "./Shapes";

/** Sonsuz kayan şerit. İçerik iki kez basılır ve %50 kaydırılarak kesintisiz döner. */
export function Marquee({
  items,
  className,
  reverse = false,
  chevronClassName = "text-brand",
}: {
  items: readonly string[];
  className?: string;
  reverse?: boolean;
  chevronClassName?: string;
}) {
  const repeated = [...items, ...items];
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {repeated.map((item, i) => (
        <li key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6">{item}</span>
          <Chevron className={cn("h-[0.72em]", chevronClassName)} />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={cn("overflow-hidden border-y-2 border-ink py-3.5", className)}>
      <div className={cn("flex w-max animate-marquee", reverse && "[animation-direction:reverse]")}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
