import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  count?: number;
  height?: string;
  showAvatar?: boolean;
}

export default function ListSkeleton({ count = 3, height = "h-20", showAvatar = false }: Props) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} rounded-2xl flex items-center gap-3.5 px-4 bg-card/60 backdrop-blur-sm border border-border/40`}
        >
          {showAvatar && <Skeleton className="h-10 w-10 rounded-xl shrink-0" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/5 rounded-lg" />
            <Skeleton className="h-3 w-2/5 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-4 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}
