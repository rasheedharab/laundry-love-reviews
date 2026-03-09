import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Star, Trash2, Search } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import BulkActionBar from "@/components/admin/BulkActionBar";

interface ReviewWithDetails {
  id: string;
  user_id: string;
  service_id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  services: { name: string } | null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-accent text-accent" : "text-border"}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [profileMap, setProfileMap] = useState<Map<string, string | null>>(new Map());
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const fetchData = async () => {
    const { data: reviewsData, error } = await supabase
      .from("reviews")
      .select("*, services(name)")
      .order("created_at", { ascending: false });

    if (error) { toast.error(error.message); return; }
    const allReviews = (reviewsData as ReviewWithDetails[]) || [];

    const userIds = [...new Set(allReviews.map((r) => r.user_id))];
    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      setProfileMap(new Map((profileData || []).map((p) => [p.user_id, p.full_name])));
    }

    setReviews(allReviews);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = reviews.filter((r) => {
    if (ratingFilter !== "all" && r.rating !== Number(ratingFilter)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (r.services?.name ?? "").toLowerCase().includes(q) ||
      (r.comment ?? "").toLowerCase().includes(q) ||
      (profileMap.get(r.user_id) ?? "").toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((r) => r.id)));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("reviews").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Review deleted");
    setDeleteId(null);
    fetchData();
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    const { error } = await supabase.from("reviews").delete().in("id", Array.from(selected));
    setBulkLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${selected.size} review${selected.size > 1 ? "s" : ""} deleted`);
    setSelected(new Set());
    setConfirmBulkDelete(false);
    fetchData();
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  const ratingCounts = [1, 2, 3, 4, 5].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
          <p className="text-sm text-muted-foreground">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} · Avg rating: {avgRating} ★
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {ratingCounts.map(({ n, count }) => (
            <span key={n} className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-muted">
              {n}<Star className="h-3 w-3 fill-accent text-accent" /> {count}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by service, reviewer, or comment…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelected(new Set()); }}
          />
        </div>
        <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v); setSelected(new Set()); }}>
          <SelectTrigger className="w-36 shrink-0">
            <SelectValue placeholder="All ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            <SelectItem value="5">5 ★ only</SelectItem>
            <SelectItem value="4">4 ★ only</SelectItem>
            <SelectItem value="3">3 ★ only</SelectItem>
            <SelectItem value="2">2 ★ only</SelectItem>
            <SelectItem value="1">1 ★ only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BulkActionBar
        selectedCount={selected.size}
        onDelete={() => setConfirmBulkDelete(true)}
        onClear={() => setSelected(new Set())}
        loading={bulkLoading}
      />

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reviewer</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Service</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rating</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Comment</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr
                  key={review.id}
                  className={`border-t border-border hover:bg-muted/30 transition-colors ${selected.has(review.id) ? "bg-primary/5" : ""}`}
                >
                  <td className="px-4 py-3">
                    <Checkbox checked={selected.has(review.id)} onCheckedChange={() => toggleSelect(review.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground text-xs">
                      {profileMap.get(review.user_id) || "Anonymous"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">{review.user_id.slice(0, 8)}…</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{review.services?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-muted-foreground">{review.rating}/5</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground max-w-xs">
                    <p className="line-clamp-2 text-xs">
                      {review.comment || <em className="text-muted-foreground/60">No comment</em>}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(review.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(review.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    {search || ratingFilter !== "all" ? "No reviews match your filters" : "No reviews yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete review?"
        description="This will permanently remove this customer review."
      />
      <ConfirmDeleteDialog
        open={confirmBulkDelete}
        onOpenChange={(open) => !open && setConfirmBulkDelete(false)}
        onConfirm={bulkDelete}
        loading={bulkLoading}
        title={`Delete ${selected.size} review${selected.size > 1 ? "s" : ""}?`}
        description="This will permanently delete the selected reviews. This cannot be undone."
      />
    </div>
  );
}
