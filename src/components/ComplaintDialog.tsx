import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MessageSquareWarning } from "lucide-react";

export default function ComplaintDialog({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = async () => {
    if (!user) return;
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (subject.length > 200 || description.length > 2000) {
      toast.error("Input too long");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("complaints").insert({
      user_id: user.id,
      subject: subject.trim(),
      description: description.trim(),
      priority,
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to submit complaint");
      return;
    }

    toast.success("Complaint submitted successfully");
    setSubject("");
    setDescription("");
    setPriority("medium");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareWarning className="h-5 w-5 text-primary" />
            Submit a Complaint
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief summary of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              className="min-h-[120px]"
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full rounded-2xl">
            {loading ? "Submitting…" : "Submit Complaint"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
