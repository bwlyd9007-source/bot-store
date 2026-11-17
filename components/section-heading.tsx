export function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex rounded-full border border-accent/25 bg-accent/10 px-4 py-1 text-xs font-bold text-accent">
        {kicker}
      </span>
      <h2 className="mt-4 text-3xl font-extrabold leading-snug sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-8 text-white/50">
          {description}
        </p>
      )}
    </div>
  );
}
