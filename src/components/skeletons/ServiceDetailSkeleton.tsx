import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceDetailSkeleton() {
  return (
    <div className="pb-24">
      <div className="relative min-h-[380px]">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="px-5 -mt-8 space-y-4 relative z-10">
        <div className="rounded-2xl p-5 space-y-3 bg-card/80 backdrop-blur-md border border-border/50">
          <Skeleton className="h-6 w-2/3 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-4/5 rounded-lg" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
        <div className="rounded-2xl p-5 space-y-3 bg-card/80 backdrop-blur-md border border-border/50">
          <Skeleton className="h-5 w-1/3 rounded-lg" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full shrink-0" />
              <Skeleton className="h-3.5 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
