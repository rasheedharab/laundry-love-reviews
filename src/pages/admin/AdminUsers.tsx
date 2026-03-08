import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, Plus, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type UserRole = Tables<"user_roles">;

const allRoles = ["admin", "moderator", "user"] as const;

interface UserWithRoles extends Profile {
  roles: UserRole[];
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);

  const fetchUsers = async () => {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    if (!profiles) return;
    const roleMap = new Map<string, UserRole[]>();
    (roles ?? []).forEach((r) => {
      const existing = roleMap.get(r.user_id) ?? [];
      existing.push(r);
      roleMap.set(r.user_id, existing);
    });
    setUsers(profiles.map((p) => ({ ...p, roles: roleMap.get(p.user_id) ?? [] })));
  };

  useEffect(() => { fetchUsers(); }, []);

  const addRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
    if (error) { toast.error(error.message); return; }
    toast.success(`Role "${role}" added`);
    fetchUsers();
  };

  const removeRole = async (roleId: string, userId: string, role: string) => {
    if (userId === currentUser?.id && role === "admin") {
      toast.error("Cannot remove your own admin role");
      return;
    }
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) { toast.error(error.message); return; }
    toast.success(`Role "${role}" removed`);
    fetchUsers();
  };

  const roleColor: Record<string, string> = {
    admin: "bg-destructive/10 text-destructive",
    moderator: "bg-blue-500/10 text-blue-700",
    user: "bg-muted text-muted-foreground",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5" /> Users & Roles
        </h1>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roles</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const existingRoles = u.roles.map((r) => r.role);
                const availableRoles = allRoles.filter((r) => !existingRoles.includes(r));
                return (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{u.full_name || "Unnamed"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.phone || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.map((r) => (
                          <div key={r.id} className="flex items-center gap-1">
                            <Badge variant="secondary" className={roleColor[r.role] ?? ""}>{r.role}</Badge>
                            <button onClick={() => removeRole(r.id, u.user_id, r.role)} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {u.roles.length === 0 && <span className="text-xs text-muted-foreground">No roles</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {availableRoles.length > 0 ? (
                        <Select onValueChange={(v) => addRole(u.user_id, v)}>
                          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Add…" /></SelectTrigger>
                          <SelectContent>
                            {availableRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground">All assigned</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No users</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
