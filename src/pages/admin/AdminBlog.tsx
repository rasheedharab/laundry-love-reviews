import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Eye } from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_id: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  title: "", slug: "", content: "", excerpt: "", cover_image_url: "", status: "draft",
};

export default function AdminBlog() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    const { data } = await (supabase as any).from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data ?? []);
  };

  useEffect(() => { fetchPosts(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setOpen(true); };
  const openEdit = (p: BlogPost) => {
    setForm({
      title: p.title, slug: p.slug, content: p.content,
      excerpt: p.excerpt ?? "", cover_image_url: p.cover_image_url ?? "", status: p.status,
    });
    setEditId(p.id); setOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `blog/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("service-images").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("service-images").getPublicUrl(path);
    setForm((f) => ({ ...f, cover_image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleSave = async () => {
    const payload: any = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      content: form.content,
      excerpt: form.excerpt || null,
      cover_image_url: form.cover_image_url || null,
      status: form.status,
    };
    if (form.status === "published" && !editId) payload.published_at = new Date().toISOString();
    if (editId) {
      const { error } = await (supabase as any).from("blog_posts").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Post updated");
    } else {
      payload.author_id = user?.id;
      const { error } = await (supabase as any).from("blog_posts").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Post created");
    }
    setOpen(false); fetchPosts();
  };
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await (supabase as any).from("blog_posts").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted"); setDeleteId(null); fetchPosts();
  };

  const statusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-green-500/10 text-green-700",
    archived: "bg-yellow-500/10 text-yellow-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold text-foreground">Blog Posts</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> New Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "Edit Post" : "New Post"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" /></div>
              </div>
              <div className="space-y-1.5"><Label>Excerpt</Label><Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary…" /></div>
              <div className="space-y-1.5">
                <Label>Content (Markdown)</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} className="font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label>Cover Image</Label>
                <div className="flex items-center gap-3">
                  <Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} placeholder="URL or upload" className="flex-1" />
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  <Button type="button" variant="outline" size="icon" onClick={() => fileRef.current?.click()} disabled={uploading}><Upload className="h-4 w-4" /></Button>
                </div>
                {form.cover_image_url && <img src={form.cover_image_url} alt="Cover" className="mt-2 h-32 w-full object-cover rounded-xl" />}
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                  <td className="px-4 py-3"><Badge variant="secondary" className={statusColor[p.status] ?? ""}>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No posts</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
