export const DetailedScoreLoading = ({ title }: { title: string }) => {
  return (
    <div className="card mb-6 flex animate-pulse flex-col gap-6 p-6 md:flex-row md:items-start md:p-8">
      <div className="flex shrink-0 flex-col items-start gap-3 md:basis-1/4">
        <h3 className="font-display text-fg-faint text-lg font-semibold">
          {title}
        </h3>
        <div className="bg-bg-muted h-16 w-24 rounded-md" />
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div className="bg-bg-muted h-4 w-1/3 rounded" />
        <div className="bg-bg-muted h-4 w-5/6 rounded" />
        <div className="bg-bg-muted h-4 w-3/4 rounded" />
        <div className="bg-bg-muted h-4 w-2/3 rounded" />
      </div>
    </div>
  );
};
