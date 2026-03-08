import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  count?: number;
  columns?: 1 | 2;
  height?: string;
}

export default function CardGridSkeleton({ count = 4, columns = 2, height = "h-44" }: Props) {
  return (
    <div className={columns === 2 ? "grid grid-cols-2 gap-3" : "space-y-3"}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} rounded-2xl overflow-hidden relative`}>
          <Skeleton className="absolute inset-0 rounded-2xl" />
          <div className="absolute bottom-0 left-0 right-0 p-3.5 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4 rounded-lg" />
            <Skeleton className="h-2.5 w-1/2 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
