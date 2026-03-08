import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  count?: number;
}

export default function OrderCardSkeleton({ count = 3 }: Props) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 space-y-3 bg-card/60 backdrop-blur-sm border border-border/40"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-3 w-20 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
