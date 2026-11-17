export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-xl text-sm leading-7 text-white/45">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
