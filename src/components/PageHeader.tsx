import { Container } from "./Container";

export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <section className="relative overflow-hidden pt-36 pb-14">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <Container className="relative">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-300">{eyebrow}</span>
        <h1 className="animate-fade-up mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">{title}</h1>
        {description && <p className="animate-fade-up mt-5 max-w-2xl text-lg leading-relaxed text-slate-400" style={{ animationDelay: "100ms" }}>{description}</p>}
      </Container>
    </section>
  );
}
