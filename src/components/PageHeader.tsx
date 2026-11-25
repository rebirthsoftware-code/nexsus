import { Container } from "./Container";

export function PageHeader({ eyebrow, title, description, aside }: { eyebrow: string; title: React.ReactNode; description?: string; aside?: React.ReactNode }) {
  return (
    <section className="relative overflow-x-clip pb-14 pt-32 sm:pb-20 sm:pt-40 short:pb-10 short:pt-24">
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-[30rem] [mask-image:linear-gradient(black,transparent)]" aria-hidden="true" />
      <Container className="relative">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="label-mono animate-rise inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-coral" aria-hidden="true" />
              {eyebrow}
            </p>
            <h1 className="display-tight animate-rise mt-6 text-[clamp(3rem,min(9.5vw,19vh),6.5rem)]" style={{ animationDelay: "80ms" }}>
              {title}
            </h1>
            {description && (
              <p className="animate-rise mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl" style={{ animationDelay: "160ms" }}>
                {description}
              </p>
            )}
          </div>
          {aside && (
            <div className="animate-rise shrink-0" style={{ animationDelay: "240ms" }}>
              {aside}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
