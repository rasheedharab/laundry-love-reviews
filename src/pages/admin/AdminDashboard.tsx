import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Users, IndianRupee, Star, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subMonths, startOfDay, endOfDay, eachMonthOfInterval, startOfMonth, isWithinInterval } from "date-fns";

interface OrderRow { id: string; total: number; created_at: string }
interface ComplaintRow { status: string; created_at: string }
interface ReviewRow { rating: number; created_at: string }

interface MonthlyData { month: string; orders: number; revenue: number }
interface ComplaintData { name: string; value: number }

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

const presets = [
  { label: "Last 30 days", from: subMonths(new Date(), 1), to: new Date() },
  { label: "Last 3 months", from: subMonths(new Date(), 3), to: new Date() },
  { label: "Last 6 months", from: subMonths(new Date(), 6), to: new Date() },
  { label: "Last 12 months", from: subMonths(new Date(), 12), to: new Date() },
];

export default function AdminDashboard() {
  const [allOrders, setAllOrders] = useState<OrderRow[]>([]);
  const [allComplaints, setAllComplaints] = useState<ComplaintRow[]>([]);
  const [allReviews, setAllReviews] = useState<ReviewRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState<Date>(subMonths(new Date(), 6));
  const [dateTo, setDateTo] = useState<Date>(new Date());

  useEffect(() => {
    Promise.all([
      supabase.from("orders").select("id, total, created_at"),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("reviews").select("rating, created_at"),
      supabase.from("complaints").select("status, created_at"),
    ]).then(([ordersRes, profilesRes, reviewsRes, complaintsRes]) => {
      setAllOrders((ordersRes.data ?? []) as OrderRow[]);
      setTotalUsers(profilesRes.count ?? 0);
      setAllReviews((reviewsRes.data ?? []) as ReviewRow[]);
      setAllComplaints((complaintsRes.data ?? []) as ComplaintRow[]);
      setLoading(false);
    });
  }, []);

  const interval = useMemo(() => ({ start: startOfDay(dateFrom), end: endOfDay(dateTo) }), [dateFrom, dateTo]);

  const filteredOrders = useMemo(() =>
    allOrders.filter((o) => isWithinInterval(new Date(o.created_at), interval)),
    [allOrders, interval]
  );

  const filteredComplaints = useMemo(() =>
    allComplaints.filter((c) => isWithinInterval(new Date(c.created_at), interval)),
    [allComplaints, interval]
  );

  const filteredReviews = useMemo(() =>
    allReviews.filter((r) => isWithinInterval(new Date(r.created_at), interval)),
    [allReviews, interval]
  );

  const stats = useMemo(() => {
    const revenue = filteredOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const avg = filteredReviews.length
      ? filteredReviews.reduce((s, r) => s + r.rating, 0) / filteredReviews.length
      : 0;
    return {
      totalOrders: filteredOrders.length,
      totalRevenue: revenue,
      totalUsers,
      avgRating: Math.round(avg * 10) / 10,
    };
  }, [filteredOrders, filteredReviews, totalUsers]);

  const monthlyData = useMemo<MonthlyData[]>(() => {
    const months = eachMonthOfInterval({ start: startOfMonth(dateFrom), end: dateTo });
    const monthMap: Record<string, { orders: number; revenue: number }> = {};
    months.forEach((m) => {
      const key = format(m, "MMM yy");
      monthMap[key] = { orders: 0, revenue: 0 };
    });
    filteredOrders.forEach((o) => {
      const key = format(new Date(o.created_at), "MMM yy");
      if (monthMap[key]) {
        monthMap[key].orders++;
        monthMap[key].revenue += Number(o.total);
      }
    });
    return months.map((m) => ({ month: format(m, "MMM yy"), ...monthMap[format(m, "MMM yy")] }));
  }, [filteredOrders, dateFrom, dateTo]);

  const complaintData = useMemo<ComplaintData[]>(() => {
    const statusMap: Record<string, number> = {};
    filteredComplaints.forEach((c) => {
      statusMap[c.status] = (statusMap[c.status] || 0) + 1;
    });
    const cData = Object.entries(statusMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace("-", " "),
      value,
    }));
    return cData.length ? cData : [{ name: "No data", value: 1 }];
  }, [filteredComplaints]);

  const statCards = [
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-primary" },
    { label: "Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-accent" },
    { label: "Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Avg Rating", value: stats.avgRating || "—", icon: Star, color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-display font-bold text-foreground">Dashboard</h1>

        {/* Date Range Picker */}
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <Button
              key={p.label}
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs h-8",
                format(dateFrom, "yyyy-MM-dd") === format(p.from, "yyyy-MM-dd") &&
                format(dateTo, "yyyy-MM-dd") === format(p.to, "yyyy-MM-dd")
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground"
              )}
              onClick={() => { setDateFrom(p.from); setDateTo(p.to); }}
            >
              {p.label}
            </Button>
          ))}

          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {format(dateFrom, "MMM d, yy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(d) => d && setDateFrom(d)}
                  disabled={(d) => d > dateTo || d > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground">–</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {format(dateTo, "MMM d, yy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(d) => d && setDateTo(d)}
                  disabled={(d) => d < dateFrom || d > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Order Trends</CardTitle>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Revenue Over Time</CardTitle>
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

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Complaint Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={complaintData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
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
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COMPLAINT_COLORS[i % COMPLAINT_COLORS.length] }} />
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
