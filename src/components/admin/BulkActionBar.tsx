import { Button } from "@/components/ui/button";
import { CheckSquare, EyeOff, Eye, X } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onClear: () => void;
  loading?: boolean;
}

export default function BulkActionBar({
  selectedCount,
  onActivate,
  onDeactivate,
  onClear,
  loading = false,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 mb-3 rounded-xl bg-primary/5 border border-primary/20 text-sm">
      <CheckSquare className="h-4 w-4 text-primary shrink-0" />
      <span className="font-medium text-foreground">
        {selectedCount} selected
      </span>
      <div className="flex items-center gap-2 ml-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 text-xs"
          disabled={loading}
          onClick={onActivate}
        >
          <Eye className="h-3 w-3" />
          Activate
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 text-xs"
          disabled={loading}
          onClick={onDeactivate}
        >
          <EyeOff className="h-3 w-3" />
          Deactivate
        </Button>
      </div>
      <button
        onClick={onClear}
        className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
