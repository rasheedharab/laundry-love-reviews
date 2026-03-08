import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Users, IndianRupee, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  avgRating: number;
}

interface MonthlyData {
  month: string;
  orders: number;
  revenue: number;
}

interface ComplaintData {
  name: string;
  value: number;
}

const COMPLAINT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--destructive, 0 84% 60%))",
];

const chartConfig = {
  orders: { label: "Orders", color: "hsl(var(--primary))" },
  revenue: { label: "Revenue", color: "hsl(var(--accent))" },
};

function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }));
  }
  return months;
}

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, avgRating: 0 });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [complaintData, setComplaintData] = useState<ComplaintData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const months = getLast6Months();

    Promise.all([
      supabase.from("orders").select("id, total, created_at", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("reviews").select("rating"),
      supabase.from("complaints").select("status"),
    ]).then(([ordersRes, profilesRes, reviewsRes, complaintsRes]) => {
      const orders = ordersRes.data ?? [];
      const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const ratings = reviewsRes.data ?? [];
      const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;

      setStats({
        totalOrders: ordersRes.count ?? orders.length,
        totalRevenue: revenue,
        totalUsers: profilesRes.count ?? 0,
        avgRating: Math.round(avg * 10) / 10,
      });

      // Monthly aggregation
      const monthMap: Record<string, { orders: number; revenue: number }> = {};
      months.forEach((m) => (monthMap[m] = { orders: 0, revenue: 0 }));
      orders.forEach((o) => {
        const key = getMonthKey(o.created_at);
        if (monthMap[key]) {
          monthMap[key].orders++;
          monthMap[key].revenue += Number(o.total);
        }
      });
      setMonthlyData(months.map((m) => ({ month: m, ...monthMap[m] })));

      // Complaint status aggregation
      const complaints = complaintsRes.data ?? [];
      const statusMap: Record<string, number> = {};
      complaints.forEach((c) => {
        statusMap[c.status] = (statusMap[c.status] || 0) + 1;
      });
      const cData = Object.entries(statusMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace("-", " "),
        value,
      }));
      setComplaintData(cData.length ? cData : [{ name: "No data", value: 1 }]);

      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-primary" },
    { label: "Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-accent" },
    { label: "Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Avg Rating", value: stats.avgRating || "—", icon: Star, color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-bold text-foreground">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <c.icon className={`h-4 w-4 ${c.color}`} />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{c.label}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Trends */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Order Trends (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Over Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Revenue Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <LineChart data={monthlyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `₹${v}`} />
                <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => label} formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--accent))" }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Complaint Resolution */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Complaint Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={complaintData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {complaintData.map((_, i) => (
                        <Cell key={i} fill={COMPLAINT_COLORS[i % COMPLAINT_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4">
                {complaintData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COMPLAINT_COLORS[i % COMPLAINT_COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {d.name}: <span className="font-semibold text-foreground">{d.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
