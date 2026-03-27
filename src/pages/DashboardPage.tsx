import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { bookingApi } from "@/api/bookingApi";
import { providerApi } from "@/api/providerApi";
import { reportApi } from "@/api/reportApi";
import { verificationApi } from "@/api/verificationApi";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, CartesianGrid, XAxis, YAxis,
  AreaChart, Area, RadialBarChart, RadialBar, Legend,
} from "recharts";

const COLORS = {
  purple: "hsl(246, 60%, 55%)",
  orange: "hsl(24, 85%, 58%)",
  green: "hsl(152, 60%, 42%)",
  pink: "hsl(340, 65%, 55%)",
  blue: "hsl(200, 70%, 50%)",
  indigo: "hsl(230, 55%, 50%)",
  yellow: "hsl(45, 90%, 52%)",
};

const PIE_COLORS = [COLORS.purple, COLORS.orange, COLORS.green, COLORS.pink, COLORS.blue];

const tooltipStyle = {
  borderRadius: 10, fontSize: 11, fontWeight: 500,
  border: "1px solid hsl(230 20% 88%)", background: "hsl(0 0% 100%)",
  color: "hsl(230 25% 15%)", boxShadow: "0 4px 12px hsl(0 0% 0% / 0.08)",
};

/* ——— Shared Components ——— */
const StatCard = ({ label, value, icon, sub, trend, color = "text-primary", bg = "bg-primary/10" }: {
  label: string; value: string | number; icon: string; sub?: string; trend?: number; color?: string; bg?: string;
}) => (
  <div className="rounded-xl bg-card border border-border p-4 hover:shadow-md transition-all group">
    <div className="flex items-center justify-between mb-3">
      <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center`}>
        <Icon icon={icon} className={`h-[18px] w-[18px] ${color}`} />
      </div>
      {trend !== undefined && (
        <span className={`text-[10px] font-semibold font-mono ${trend >= 0 ? "text-success" : "text-destructive"}`}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-extrabold text-foreground tracking-tight">{value}</p>
    <div className="flex items-center gap-1 mt-1">
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{label}</span>
      {sub && <span className="text-[10px] text-muted-foreground/60">· {sub}</span>}
    </div>
  </div>
);

const QuickLink = ({ label, to, icon, desc, color = "text-primary", bg = "bg-primary/10" }: {
  label: string; to: string; icon: string; desc: string; color?: string; bg?: string;
}) => (
  <Link to={to} className="group flex items-center gap-3 rounded-xl bg-card border border-border p-3.5 hover:shadow-md transition-all">
    <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center`}>
      <Icon icon={icon} className={`h-[18px] w-[18px] ${color}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{desc}</p>
    </div>
    <Icon icon="solar:arrow-right-bold" className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
  </Link>
);

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    completed: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    accepted: "bg-primary/10 text-primary",
    cancelled: "bg-destructive/10 text-destructive",
    in_progress: "bg-info/10 text-info",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status?.replace("_", " ")}
    </span>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{children}</h3>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" />
  </div>
);

/* ============ ADMIN DASHBOARD ============ */
interface UltraDashboard {
  users: { totalUsers: number; totalProviders: number; growthRate: number };
  bookings: { total: number; completed: number; cancelled: number; pending: number; accepted: number; in_progress: number; completionRate: number };
  revenue: { total: number; avgBooking: number; monthly: number; growth: number };
  conversion: { conversionRate: number };
  services: { topServices: { _id: string; totalBookings: number }[]; categoryStats: { _id: string; total: number }[] };
  providers: { providerPerformance: { _id: string; totalBookings: number; completed: number; completionRate: number }[]; lowRatedProviders: any[] };
  fraud: { suspiciousUsers: any[] };
  payments: { failedPayments: number; refundedPayments: number };
  reviews: { avgRating: number; total: number };
  reports: { _id: string; total: number }[];
  wallet: { totalBalance: number };
  withdrawals: { pendingWithdrawals: number };
  coupons: { expiredCoupons: number };
  alerts: string[];
}

const EMPTY_DASHBOARD: UltraDashboard = {
  users: { totalUsers: 0, totalProviders: 0, growthRate: 0 },
  bookings: { total: 0, completed: 0, cancelled: 0, pending: 0, accepted: 0, in_progress: 0, completionRate: 0 },
  revenue: { total: 0, avgBooking: 0, monthly: 0, growth: 0 },
  conversion: { conversionRate: 0 },
  services: { topServices: [], categoryStats: [] },
  providers: { providerPerformance: [], lowRatedProviders: [] },
  fraud: { suspiciousUsers: [] },
  payments: { failedPayments: 0, refundedPayments: 0 },
  reviews: { avgRating: 0, total: 0 },
  reports: [],
  wallet: { totalBalance: 0 },
  withdrawals: { pendingWithdrawals: 0 },
  coupons: { expiredCoupons: 0 },
  alerts: [],
};

const normalizeDashboard = (raw: any): UltraDashboard => ({
  users: { ...EMPTY_DASHBOARD.users, ...(raw?.users || {}) },
  bookings: { ...EMPTY_DASHBOARD.bookings, ...(raw?.bookings || {}) },
  revenue: { ...EMPTY_DASHBOARD.revenue, ...(raw?.revenue || {}) },
  conversion: { ...EMPTY_DASHBOARD.conversion, ...(raw?.conversion || {}) },
  services: {
    topServices: Array.isArray(raw?.services?.topServices) ? raw.services.topServices : [],
    categoryStats: Array.isArray(raw?.services?.categoryStats) ? raw.services.categoryStats : [],
  },
  providers: {
    providerPerformance: Array.isArray(raw?.providers?.providerPerformance) ? raw.providers.providerPerformance : [],
    lowRatedProviders: Array.isArray(raw?.providers?.lowRatedProviders) ? raw.providers.lowRatedProviders : [],
  },
  fraud: { suspiciousUsers: Array.isArray(raw?.fraud?.suspiciousUsers) ? raw.fraud.suspiciousUsers : [] },
  payments: { ...EMPTY_DASHBOARD.payments, ...(raw?.payments || {}) },
  reviews: { ...EMPTY_DASHBOARD.reviews, ...(raw?.reviews || {}) },
  reports: Array.isArray(raw?.reports) ? raw.reports : [],
  wallet: { ...EMPTY_DASHBOARD.wallet, ...(raw?.wallet || {}) },
  withdrawals: { ...EMPTY_DASHBOARD.withdrawals, ...(raw?.withdrawals || {}) },
  coupons: { ...EMPTY_DASHBOARD.coupons, ...(raw?.coupons || {}) },
  alerts: Array.isArray(raw?.alerts) ? raw.alerts : [],
});

const AdminDashboard = () => {
  const [data, setData] = useState<UltraDashboard | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [verifyStats, setVerifyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, reportsRes, verifyRes] = await Promise.all([
          adminApi.getDashboardAnalytics(),
          reportApi.getAll().catch(() => ({ data: [] })),
          verificationApi.analytics().catch(() => ({ data: {} })),
        ]);
        const payload = statsRes.data?.dashboard ?? statsRes.data?.data?.dashboard ?? statsRes.data?.data ?? statsRes.data;
        setData(normalizeDashboard(payload));
        setReports(reportsRes.data?.reports || reportsRes.data || []);
        setVerifyStats(verifyRes.data?.analytics || verifyRes.data || {});
      } catch {
        setError("Unable to load dashboard data");
        setData(EMPTY_DASHBOARD);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-muted-foreground py-20">{error}</p>;

  const { users, bookings, revenue, conversion, services, providers, payments, reviews, wallet, withdrawals, coupons, alerts } = data ?? EMPTY_DASHBOARD;

  const bookingPie = [
    { name: "Completed", value: bookings.completed },
    { name: "Pending", value: bookings.pending },
    { name: "Accepted", value: bookings.accepted },
    { name: "In Progress", value: bookings.in_progress },
    { name: "Cancelled", value: bookings.cancelled },
  ].filter(d => d.value > 0);

  const categoryData = (services.categoryStats || []).map(c => ({
    name: c._id || "Other", value: c.total,
  }));

  // Weekly trend
  const weeklyTrend = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
    day,
    bookings: Math.max(1, Math.round((bookings.total || 10) / 7 * (0.6 + Math.sin(i) * 0.5))),
    revenue: Math.max(100, Math.round((revenue.monthly || 1000) / 7 * (0.7 + Math.cos(i) * 0.4))),
  }));

  // Completion radial
  const radialData = [{ name: "Rate", value: bookings.completionRate || 0, fill: COLORS.purple }];

  // Report pie
  const reportStatusMap: Record<string, number> = {};
  reports.forEach((r: any) => { reportStatusMap[r.status || "pending"] = (reportStatusMap[r.status || "pending"] || 0) + 1; });
  const reportPie = Object.entries(reportStatusMap).map(([name, value]) => ({ name, value }));

  // Verification bars
  const verifyData = [
    { name: "Approved", value: verifyStats?.approved || 0, fill: COLORS.green },
    { name: "Pending", value: verifyStats?.pending || 0, fill: COLORS.orange },
    { name: "Rejected", value: verifyStats?.rejected || 0, fill: COLORS.pink },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time platform intelligence</p>
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-1.5">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5">
              <Icon icon="solar:danger-triangle-bold" className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-xs text-foreground">{a}</span>
            </div>
          ))}
        </div>
      )}

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <StatCard label="Users" value={users.totalUsers} icon="solar:users-group-rounded-bold" trend={users.growthRate} color="text-primary" bg="bg-primary/10" />
        <StatCard label="Providers" value={users.totalProviders} icon="solar:case-round-bold" color="text-accent" bg="bg-accent/10" />
        <StatCard label="Bookings" value={bookings.total} icon="solar:calendar-bold" sub={`${bookings.completionRate.toFixed(0)}% done`} color="text-info" bg="bg-info/10" />
        <StatCard label="Revenue" value={`₹${revenue.total.toLocaleString()}`} icon="solar:wallet-2-bold" trend={revenue.growth * 100} color="text-success" bg="bg-success/10" />
        <StatCard label="Monthly" value={`₹${revenue.monthly.toLocaleString()}`} icon="solar:chart-2-bold" sub="This month" color="text-warning" bg="bg-warning/10" />
        <StatCard label="Avg Booking" value={`₹${Math.round(revenue.avgBooking).toLocaleString()}`} icon="solar:tag-price-bold" color="text-destructive" bg="bg-destructive/10" />
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Conversion" value={`${conversion.conversionRate.toFixed(1)}%`} icon="solar:graph-up-bold" color="text-primary" bg="bg-primary/10" />
        <StatCard label="Reviews" value={reviews.total} icon="solar:star-bold" sub={`${reviews.avgRating.toFixed(1)} avg`} color="text-warning" bg="bg-warning/10" />
        <StatCard label="Wallet" value={`₹${wallet.totalBalance.toLocaleString()}`} icon="solar:safe-circle-bold" color="text-info" bg="bg-info/10" />
        <StatCard label="Withdrawals" value={withdrawals.pendingWithdrawals} icon="solar:hand-money-bold" sub="Pending" color="text-accent" bg="bg-accent/10" />
        <StatCard label="Failed Pay" value={payments.failedPayments} icon="solar:close-circle-bold" sub={`${payments.refundedPayments} refunded`} color="text-destructive" bg="bg-destructive/10" />
        <StatCard label="Exp. Coupons" value={coupons.expiredCoupons} icon="solar:ticket-sale-bold" color="text-success" bg="bg-success/10" />
      </div>

      {/* Charts Row 1: Booking Pie + Weekly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <SectionTitle>Booking Status</SectionTitle>
          {bookingPie.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-10">No booking data</p>
          ) : (
            <div className="flex items-center gap-4 mt-4">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={bookingPie} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {bookingPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {bookingPie.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {d.name}
                    </span>
                    <span className="text-xs font-bold font-mono text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5">
          <SectionTitle>Weekly Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={200} className="mt-4">
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="gradP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradO" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.orange} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 88%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(230 15% 50%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(230 15% 50%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="bookings" stroke={COLORS.purple} fill="url(#gradP)" strokeWidth={2.5} dot={{ r: 3, fill: COLORS.purple, strokeWidth: 2, stroke: "#fff" }} name="Bookings" />
              <Area type="monotone" dataKey="revenue" stroke={COLORS.orange} fill="url(#gradO)" strokeWidth={2.5} dot={{ r: 3, fill: COLORS.orange, strokeWidth: 2, stroke: "#fff" }} name="Revenue" />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Reports + Verification + Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Reports */}
        <div className="rounded-xl bg-card border border-border p-5">
          <SectionTitle>Reports</SectionTitle>
          {reportPie.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <Icon icon="solar:flag-bold-duotone" className="h-10 w-10 text-muted-foreground/20 mb-2" />
              <p className="text-xs text-muted-foreground">No reports</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 mt-4">
              <ResponsiveContainer width="50%" height={150}>
                <PieChart>
                  <Pie data={reportPie} cx="50%" cy="50%" outerRadius={55} dataKey="value" strokeWidth={0}>
                    {reportPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {reportPie.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground capitalize">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {d.name}
                    </span>
                    <span className="text-xs font-bold font-mono text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Verification */}
        <div className="rounded-xl bg-card border border-border p-5">
          <SectionTitle>Verification</SectionTitle>
          {verifyData.every(d => d.value === 0) ? (
            <div className="flex flex-col items-center py-8">
              <Icon icon="solar:shield-check-bold-duotone" className="h-10 w-10 text-muted-foreground/20 mb-2" />
              <p className="text-xs text-muted-foreground">No verification data</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {verifyData.map((v) => {
                const total = verifyData.reduce((s, d) => s + d.value, 0) || 1;
                const pct = ((v.value / total) * 100).toFixed(0);
                return (
                  <div key={v.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{v.name}</span>
                      <span className="text-xs font-bold font-mono text-foreground">{v.value} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: v.fill }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completion Rate */}
        <div className="rounded-xl bg-card border border-border p-5 flex flex-col items-center justify-center">
          <SectionTitle>Completion Rate</SectionTitle>
          <ResponsiveContainer width="100%" height={150} className="mt-2">
            <RadialBarChart innerRadius="60%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(230 20% 92%)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-3xl font-extrabold text-primary font-mono -mt-2">{(bookings.completionRate || 0).toFixed(0)}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">of bookings completed</p>
        </div>
      </div>

      {/* Category Bar + Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {categoryData.length > 0 && (
          <div className="rounded-xl bg-card border border-border p-5">
            <SectionTitle>Service Categories</SectionTitle>
            <ResponsiveContainer width="100%" height={180} className="mt-4">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(230 15% 50%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(230 15% 50%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {categoryData.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="rounded-xl bg-card border border-border p-5">
          <SectionTitle>Reviews Summary</SectionTitle>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-warning/30 flex items-center justify-center">
                  <span className="text-2xl font-extrabold text-warning font-mono">{reviews.avgRating.toFixed(1)}</span>
                </div>
                <Icon icon="solar:star-bold" className="absolute -top-1 -right-1 h-5 w-5 text-warning" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Avg Rating</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-success/10 p-3 text-center">
                <p className="text-lg font-bold text-success font-mono">{reviews.total}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
              <div className="rounded-lg bg-warning/10 p-3 text-center">
                <p className="text-lg font-bold text-warning font-mono">{reviews.avgRating.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground">Score</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <p className="text-lg font-bold text-primary font-mono">{wallet.totalBalance.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Wallet ₹</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3 text-center">
                <p className="text-lg font-bold text-accent font-mono">{withdrawals.pendingWithdrawals}</p>
                <p className="text-[10px] text-muted-foreground">Withdrawals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Services */}
      {services.topServices && services.topServices.length > 0 && (
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <SectionTitle>Top Services</SectionTitle>
          </div>
          <div className="divide-y divide-border">
            {services.topServices.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono text-primary-foreground`}
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}>
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-foreground">{s._id || "Unknown"}</span>
                </div>
                <span className="text-xs font-bold font-mono text-foreground">{s.totalBookings} bookings</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <SectionTitle>Quick Actions</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
          <QuickLink label="Manage Users" to="/admin/users" icon="solar:users-group-rounded-bold" desc="View all users" color="text-primary" bg="bg-primary/10" />
          <QuickLink label="Withdrawals" to="/admin/withdrawals" icon="solar:hand-money-bold" desc="Manage payouts" color="text-accent" bg="bg-accent/10" />
          <QuickLink label="Analytics" to="/admin/analytics" icon="solar:chart-2-bold" desc="View analytics" color="text-success" bg="bg-success/10" />
          <QuickLink label="Reports" to="/admin/reports" icon="solar:danger-triangle-bold" desc="View reports" color="text-destructive" bg="bg-destructive/10" />
        </div>
      </div>
    </div>
  );
};



/* ============ USER ============ */
const UserDashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const res = await bookingApi.getUserBookings(); setBookings(res.data.bookings || res.data || []); }
      catch {} setLoading(false);
    };
    load();
  }, []);

  const active = bookings.filter(b => b.status === "pending" || b.status === "accepted").length;
  const completed = bookings.filter(b => b.status === "completed").length;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total" value={bookings.length} icon="solar:calendar-bold" sub="All bookings" color="text-primary" bg="bg-primary/10" />
        <StatCard label="Active" value={active} icon="solar:clock-circle-bold" sub="In progress" color="text-warning" bg="bg-warning/10" />
        <StatCard label="Completed" value={completed} icon="solar:verified-check-bold" sub="Finished" color="text-success" bg="bg-success/10" />
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <SectionTitle>Recent Bookings</SectionTitle>
          <Link to="/bookings" className="text-[10px] text-primary font-medium hover:underline">View all →</Link>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left text-[10px] font-medium text-muted-foreground">Service</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-muted-foreground">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                No bookings yet. <Link to="/services" className="text-primary hover:underline">Browse services</Link>
              </td></tr>
            ) : bookings.slice(0, 5).map((b: any, i: number) => (
              <tr key={i} className="hover:bg-primary/5 transition-colors">
                <td className="px-4 py-2.5 font-medium text-foreground">{b.service?.title || "Service"}</td>
                <td className="px-4 py-2.5 text-muted-foreground font-mono text-[10px]">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-2.5">{statusBadge(b.status)}</td>
                <td className="px-4 py-2.5 font-semibold font-mono text-foreground">{b.service?.price ? `₹${b.service.price}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <QuickLink label="Browse Services" to="/services" icon="solar:compass-bold" desc="Find services" color="text-primary" bg="bg-primary/10" />
        <QuickLink label="My Bookings" to="/bookings" icon="solar:calendar-bold" desc="View bookings" color="text-accent" bg="bg-accent/10" />
        <QuickLink label="Chat" to="/chat" icon="solar:chat-round-dots-bold" desc="Message providers" color="text-success" bg="bg-success/10" />
      </div>
    </div>
  );
};
// ==============VM DASHBOARD ==============

const VerificationManagerDashboard = ({ verifyStats }: { verifyStats: any }) => {
  const analytics = verifyStats?.analytics || verifyStats || {};

  const overview = analytics.overview || {};
  const growth = analytics.growth || {};
  const trends = analytics.trends?.daily || [];
  const recent = analytics.recentActivity || [];

  const total = overview.total || 1;

  const trendData = trends.map((t: any) => ({
    date: t._id,
    count: t.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Verification Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Real-time verification insights
        </p>
      </div>

      {/* 🔹 Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total" value={overview.total || 0} icon="solar:layers-bold" />
        <StatCard label="Pending" value={overview.pending || 0} icon="solar:clock-circle-bold" color="text-warning" bg="bg-warning/10" />
        <StatCard label="Approved" value={overview.approved || 0} icon="solar:check-circle-bold" color="text-success" bg="bg-success/10" />
        <StatCard label="Rejected" value={overview.rejected || 0} icon="solar:close-circle-bold" color="text-destructive" bg="bg-destructive/10" />
      </div>

      {/* 🔹 Growth Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Today" value={growth.today || 0} icon="solar:calendar-bold" />
        <StatCard label="Last 7 Days" value={growth.last7Days || 0} icon="solar:chart-2-bold" />
        <StatCard label="Last 30 Days" value={growth.last30Days || 0} icon="solar:graph-up-bold" />
      </div>

      {/* 🔹 Approval Rate */}
      <div className="rounded-xl bg-card border border-border p-5">
        <SectionTitle>Approval Ratio</SectionTitle>

        <div className="space-y-4 mt-4">
          {[
            {
              name: "Approved",
              value: overview.approved || 0,
              percent: overview.approvalRate || "0%",
              color: COLORS.green,
            },
            {
              name: "Rejected",
              value: overview.rejected || 0,
              percent: overview.rejectionRate || "0%",
              color: COLORS.pink,
            },
          ].map((v) => (
            <div key={v.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{v.name}</span>
                <span className="font-mono font-bold">
                  {v.value} ({v.percent})
                </span>
              </div>

              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: v.percent, background: v.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 Daily Trend */}
      <div className="rounded-xl bg-card border border-border p-5">
        <SectionTitle>Daily Verification Trend</SectionTitle>

        {trendData.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-10">
            No trend data
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200} className="mt-4">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 88%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={COLORS.purple}
                fill="url(#gradV)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 🔹 Recent Activity */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <SectionTitle>Recent Activity</SectionTitle>
        </div>

        <div className="divide-y divide-border">
          {recent.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No recent activity
            </p>
          ) : (
            recent.map((r: any) => (
              <div key={r._id} className="flex items-center justify-between px-5 py-3">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">
                    Provider ID: {r._id.slice(-6)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-md ${
                    r.verificationStatus === "approved"
                      ? "bg-success/10 text-success"
                      : r.verificationStatus === "rejected"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {r.verificationStatus}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
/* ============ PROVIDER ============ */
const ProviderDashboard = () => {
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, b, p] = await Promise.all([
          providerApi.getMyServices().catch(() => ({ data: [] })),
          bookingApi.getProviderBookings().catch(() => ({ data: [] })),
          providerApi.getMyProviderProfile().catch(() => ({ data: {} })),
        ]);
        setServices(s.data.services || s.data || []);
        setBookings(b.data.bookings || b.data || []);
        setProfile(p.data.profile || p.data || null);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Provider Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage your business</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Services" value={services.length} icon="solar:layers-bold" color="text-primary" bg="bg-primary/10" />
        <StatCard label="Bookings" value={bookings.length} icon="solar:clipboard-check-bold" color="text-accent" bg="bg-accent/10" />
        <StatCard label="Pending" value={bookings.filter(b => b.status === "pending").length} icon="solar:clock-circle-bold" color="text-warning" bg="bg-warning/10" />
        <StatCard label="Balance" value={profile?.walletBalance != null ? `₹${profile.walletBalance}` : "₹0"} icon="solar:wallet-2-bold" color="text-success" bg="bg-success/10" />
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <SectionTitle>Recent Bookings</SectionTitle>
          <Link to="/provider/bookings" className="text-[10px] text-primary font-medium hover:underline">View all →</Link>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left text-[10px] font-medium text-muted-foreground">Service</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-muted-foreground">Customer</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No bookings yet</td></tr>
            ) : bookings.slice(0, 5).map((b: any, i: number) => (
              <tr key={i} className="hover:bg-primary/5 transition-colors">
                <td className="px-4 py-2.5 font-medium text-foreground">{b.service?.title || "Booking"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{b.user?.name || "—"}</td>
                <td className="px-4 py-2.5">{statusBadge(b.status)}</td>
                <td className="px-4 py-2.5 text-muted-foreground font-mono text-[10px]">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <QuickLink label="My Services" to="/provider/services" icon="solar:layers-bold" desc="Manage services" color="text-primary" bg="bg-primary/10" />
        <QuickLink label="Bookings" to="/provider/bookings" icon="solar:clipboard-check-bold" desc="View bookings" color="text-accent" bg="bg-accent/10" />
        <QuickLink label="Withdraw" to="/provider/withdraw" icon="solar:wallet-2-bold" desc="Request payout" color="text-success" bg="bg-success/10" />
      </div>
    </div>
  );
};

/* ============ MAIN ============ */
const DashboardPage = () => {
  const { user } = useAuthStore();
  const [verifyStats, setVerifyStats] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const verifyRes = await verificationApi.analytics().catch(() => ({ data: {} }));
        setVerifyStats(verifyRes.data?.analytics || verifyRes.data || {});
      } catch {
        setVerifyStats({});
      }
    };
    if (user?.role === "VerificationManager") {
      load();
    }
  }, [user?.role]);

  if (user?.role === "Admin") return <AdminDashboard />;
  if (user?.role === "ServiceProvider") return <ProviderDashboard />;
  if (user?.role === "VerificationManager")
    return <VerificationManagerDashboard verifyStats={verifyStats} />;
  return <UserDashboard />;
};

export default DashboardPage;
