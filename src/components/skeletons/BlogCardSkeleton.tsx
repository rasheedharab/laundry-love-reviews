import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  count?: number;
}

export default function BlogCardSkeleton({ count = 3 }: Props) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden bg-card/60 backdrop-blur-sm border border-border/40"
        >
          <Skeleton className="aspect-[2/1] w-full" />
          <div className="p-5 space-y-2.5">
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <Skeleton className="h-3.5 w-full rounded-lg" />
            <Skeleton className="h-3.5 w-4/5 rounded-lg" />
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="h-3 w-16 rounded-lg" />
              <Skeleton className="h-3 w-12 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
