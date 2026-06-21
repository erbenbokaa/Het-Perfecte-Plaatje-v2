// Gradient-medaille voor plaats 1/2/3 (goud/zilver/brons), in de nieuwe stijl.

const GRADIENTS: Record<number, string> = {
  1: "from-yellow-300 to-amber-500",
  2: "from-slate-200 to-slate-400",
  3: "from-orange-300 to-amber-700",
};

export default function RankBadge({
  rank,
  className,
}: {
  rank: number;
  className?: string;
}) {
  const grad = GRADIENTS[rank] ?? "from-stone-200 to-stone-400";
  return (
    <span
      className={
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm " +
        grad +
        " " +
        (className ?? "h-7 w-7 text-sm")
      }
    >
      {rank}
    </span>
  );
}
