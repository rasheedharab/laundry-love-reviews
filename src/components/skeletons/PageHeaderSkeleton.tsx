import { Skeleton } from "@/components/ui/skeleton";

export default function PageHeaderSkeleton() {
  return (
    <div className="px-5 pt-6 pb-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-3 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
