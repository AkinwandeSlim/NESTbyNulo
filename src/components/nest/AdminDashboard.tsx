'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  HeadphonesIcon,
  Home,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Wallet,
  Banknote,
  Activity,
  MapPin,
  Star,
  Globe,
  Sparkles,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { useNestStore, type View } from '@/lib/nest-store';
import { formatNaira, formatNairaFull, formatPercent, cn, getPropertyTypeLabel } from '@/lib/nest-utils';

interface AdminNavItem {
  label: string;
  view: View;
  icon: React.ReactNode;
}

const adminNavItems: AdminNavItem[] = [
  { label: 'Overview', view: 'admin', icon: <LayoutDashboard className="size-4" /> },
  { label: 'Properties', view: 'admin-properties', icon: <Building2 className="size-4" /> },
  { label: 'Opportunities', view: 'admin-opportunities', icon: <Target className="size-4" /> },
  { label: 'Investors CRM', view: 'admin-crm', icon: <Users className="size-4" /> },
  { label: 'Finance', view: 'admin-finance', icon: <Banknote className="size-4" /> },
  { label: 'Analytics', view: 'admin-analytics', icon: <BarChart3 className="size-4" /> },
  { label: 'Support', view: 'admin-support', icon: <HeadphonesIcon className="size-4" /> },
];

interface DashboardData {
  assetsUnderManagement: number;
  capitalRaised: number;
  fundingProgress: number;
  revenue: number;
  platformGrowth: number;
  investorCount: number;
  newInvestors: number;
  activeInvestments: number;
  avgInvestmentSize: number;
  totalProperties: number;
  publishedProperties: number;
  fundingProperties: number;
  occupancy: number;
  vacancy: number;
  avgYield: number;
  avgIRR: number;
  cashPosition: number;
  pendingDisbursements: number;
  monthlyOperatingCosts: number;
  netIncome: number;
  monthlyGrowth: {
    month: string;
    investments: number;
    investors: number;
    properties: number;
    revenue: number;
  }[];
  topProperties: {
    id: string;
    title: string;
    slug: string;
    propertyType: string;
    city: string;
    state: string;
    totalValue: number;
    fundingTarget: number;
    fundingRaised: number;
    fundingProgress: number;
    rentalYield: number;
    expectedIRR: number;
    riskRating: string;
    status: string;
    developer: string | null;
    coverImage: string | null;
  }[];
  propertyTypeBreakdown: {
    type: string;
    count: number;
    value: number;
  }[];
  geographicBreakdown: {
    state: string;
    count: number;
    value: number;
  }[];
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#f97316'];

export default function AdminDashboard() {
  const { currentView, setView, adminSidebarOpen, toggleAdminSidebar } = useNestStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        setData(json);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const handleNav = (view: View) => {
    setView(view);
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      toggleAdminSidebar();
    }
  };

  const pieData = data?.propertyTypeBreakdown
    .filter(p => p.count > 0)
    .map(p => ({
      name: getPropertyTypeLabel(p.type),
      value: p.value,
    })) || [];

  const barData = data?.propertyTypeBreakdown
    .filter(p => p.count > 0)
    .map(p => ({
      name: getPropertyTypeLabel(p.type),
      value: p.value,
      count: p.count,
    })) || [];

  const renderSidebar = (mobile: boolean) => (
    <div className={cn(
      'flex flex-col h-full',
      mobile && 'pt-4'
    )}>
      {/* Logo */}
      <button onClick={() => setView('browse')} className={cn('flex items-center gap-2.5 px-5 text-left', mobile ? 'mb-6' : 'mb-8 pt-6')}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nest-emerald">
          <Home className="size-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-foreground">
            <span className="text-nest-emerald">NEST</span>
          </span>
          <p className="text-[10px] text-muted-foreground -mt-0.5">Admin Panel</p>
        </div>
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={toggleAdminSidebar}
          >
            <ChevronRight className="size-4" />
          </Button>
        )}
      </button>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {adminNavItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => handleNav(item.view)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-nest-emerald/10 text-nest-emerald'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {item.icon}
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-nest-emerald" />
              )}
            </button>
          );
        })}
      </nav>

      <Separator className="opacity-50" />

      {/* Bottom */}
      <div className="p-4">
        <Card className="p-3 gap-0 bg-nest-emerald/5 border-nest-emerald/20">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="size-3.5 text-nest-emerald" />
            <span className="text-xs font-semibold text-nest-emerald">Platform Status</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">All systems operational</span>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[260px] lg:flex-col bg-card border-r border-border z-40">
        {renderSidebar(false)}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {adminSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={toggleAdminSidebar}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] bg-card border-r border-border lg:hidden"
            >
              {renderSidebar(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:pl-[260px]">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Top Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={toggleAdminSidebar}
              >
                <ChevronLeft className="size-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  {adminNavItems.find(i => i.view === currentView)?.label || 'Dashboard'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {currentView === 'admin' ? 'Platform overview and key metrics' : 'Manage your platform'}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 bg-nest-emerald/10 text-nest-emerald">
              <Activity className="size-3" />
              Live
            </Badge>
          </motion.div>

          {currentView === 'admin' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
                >
                  {[
                    {
                      label: 'Assets Under Management',
                      value: formatNairaFull(data?.assetsUnderManagement || 0),
                      change: `+${data?.platformGrowth || 0}%`,
                      icon: <Wallet className="size-4" />,
                      color: 'text-nest-emerald',
                      bg: 'from-nest-emerald/5 to-transparent',
                    },
                    {
                      label: 'Capital Raised',
                      value: formatNairaFull(data?.capitalRaised || 0),
                      change: `${data?.fundingProgress || 0}% funded`,
                      icon: <DollarSign className="size-4" />,
                      color: 'text-nest-emerald',
                      bg: 'from-nest-emerald/5 to-transparent',
                    },
                    {
                      label: 'Revenue',
                      value: formatNairaFull(data?.revenue || 0),
                      change: `Net: ${formatNairaFull(data?.netIncome || 0)}`,
                      icon: <TrendingUp className="size-4" />,
                      color: 'text-nest-gold',
                      bg: 'from-nest-gold/5 to-transparent',
                    },
                    {
                      label: 'Active Investors',
                      value: (data?.investorCount || 0).toLocaleString(),
                      change: `+${data?.newInvestors || 0} this month`,
                      icon: <Users className="size-4" />,
                      color: 'text-nest-emerald',
                      bg: 'from-nest-emerald/5 to-transparent',
                    },
                  ].map((kpi) => (
                    <Card key={kpi.label} className={cn('p-4 gap-0 bg-gradient-to-br', kpi.bg)}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{kpi.label}</span>
                        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg bg-background/80', kpi.color)}>
                          {kpi.icon}
                        </div>
                      </div>
                      <p className="text-xl font-bold">{kpi.value}</p>
                      <p className={cn('text-xs mt-1', kpi.color)}>{kpi.change}</p>
                    </Card>
                  ))}
                </motion.div>
              )}

              {/* Secondary KPIs */}
              {!loading && data && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
                >
                  {[
                    { label: 'Properties', value: String(data.totalProperties) },
                    { label: 'Active Deals', value: String(data.fundingProperties) },
                    { label: 'Avg Yield', value: formatPercent(data.avgYield) },
                    { label: 'Avg IRR', value: formatPercent(data.avgIRR) },
                    { label: 'Occupancy', value: `${data.occupancy}%` },
                    { label: 'Cash Position', value: formatNaira(data.cashPosition) },
                  ].map((stat) => (
                    <Card key={stat.label} className="p-3 gap-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <p className="text-base font-bold mt-0.5">{stat.value}</p>
                    </Card>
                  ))}
                </motion.div>
              )}

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Platform Growth */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-5 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold">Platform Growth</h3>
                        <p className="text-xs text-muted-foreground">Investments & revenue over time</p>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-nest-emerald/10 text-nest-emerald">
                        <TrendingUp className="size-3 mr-1" />
                        +{data?.platformGrowth || 0}%
                      </Badge>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.monthlyGrowth || []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0 0 / 0.3)" />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 10, fill: 'oklch(0.5 0.02 40)' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: 'oklch(0.5 0.02 40)' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => formatNaira(v)}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'oklch(1 0 0)',
                              border: '1px solid oklch(0.91 0.005 90)',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                            formatter={(value: number, name: string) => [
                              name === 'investments' ? formatNairaFull(value) : value,
                              name === 'investments' ? 'Investments' : 'Revenue',
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="investments"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#adminGrad)"
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fill="none"
                            strokeDasharray="4 4"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>

                {/* Funding by Property Type */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card className="p-5 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold">Funding by Property Type</h3>
                      <p className="text-xs text-muted-foreground">Distribution of total value</p>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0 0 / 0.3)" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10, fill: 'oklch(0.5 0.02 40)' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: 'oklch(0.5 0.02 40)' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => formatNaira(v)}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'oklch(1 0 0)',
                              border: '1px solid oklch(0.91 0.005 90)',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                            formatter={(value: number) => [formatNairaFull(value), 'Total Value']}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {barData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* Geographic + Table */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Map Placeholder */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-5 gap-4 h-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold">Geographic Distribution</h3>
                        <p className="text-xs text-muted-foreground">Investments by state</p>
                      </div>
                      <Globe className="size-4 text-muted-foreground" />
                    </div>
                    <div className="relative w-full h-48 rounded-xl bg-muted overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop"
                        alt="Geographic distribution"
                        className="h-full w-full object-cover opacity-30"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="size-6 text-nest-emerald mx-auto mb-2" />
                          {(data?.geographicBreakdown || []).map((geo) => (
                            <div key={geo.state} className="flex items-center justify-center gap-2 text-xs mb-1">
                              <div className="h-2 w-2 rounded-full bg-nest-emerald" />
                              <span className="font-medium">{geo.state}</span>
                              <span className="text-muted-foreground">({geo.count} properties)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Allocation Pie */}
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data?.geographicBreakdown.map(g => ({ name: g.state, value: g.value })) || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={60}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {(data?.geographicBreakdown || []).map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'oklch(1 0 0)',
                              border: '1px solid oklch(0.91 0.005 90)',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                            formatter={(value: number) => [formatNairaFull(value), '']}
                          />
                          <Legend
                            verticalAlign="bottom"
                            iconType="circle"
                            iconSize={8}
                            formatter={(value: string) => (
                              <span className="text-xs text-muted-foreground">{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>

                {/* Top Properties Table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="lg:col-span-2"
                >
                  <Card className="p-5 gap-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold">Top Performing Properties</h3>
                        <p className="text-xs text-muted-foreground">By funding raised</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2.5 text-xs text-muted-foreground font-medium">Property</th>
                            <th className="text-right py-2.5 text-xs text-muted-foreground font-medium">Funding</th>
                            <th className="text-right py-2.5 text-xs text-muted-foreground font-medium">Yield</th>
                            <th className="text-right py-2.5 text-xs text-muted-foreground font-medium">IRR</th>
                            <th className="text-right py-2.5 text-xs text-muted-foreground font-medium">Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data?.topProperties || []).slice(0, 5).map((prop) => (
                            <tr key={prop.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                              <td className="py-2.5">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={prop.coverImage || `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=40&h=28&fit=crop`}
                                    alt={prop.title}
                                    className="h-8 w-11 rounded-md object-cover flex-shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-medium text-xs truncate max-w-[150px]">{prop.title}</p>
                                    <p className="text-[10px] text-muted-foreground">{prop.city}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="text-right py-2.5 text-xs font-medium">{formatNairaFull(prop.fundingRaised)}</td>
                              <td className="text-right py-2.5 text-xs font-medium text-nest-emerald">
                                {formatPercent(prop.rentalYield)}
                              </td>
                              <td className="text-right py-2.5 text-xs font-medium">{formatPercent(prop.expectedIRR)}</td>
                              <td className="text-right py-2.5">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-nest-emerald"
                                      style={{ width: `${prop.fundingProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-muted-foreground w-8 text-right">{prop.fundingProgress}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          )}

          {/* Placeholder for non-overview admin views */}
          {currentView !== 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-nest-emerald/10 mx-auto mb-4">
                  {adminNavItems.find(i => i.view === currentView)?.icon && (
                    <span className="text-nest-emerald">
                      {adminNavItems.find(i => i.view === currentView)?.icon}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold mb-1">
                  {adminNavItems.find(i => i.view === currentView)?.label}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  This section is coming soon. Stay tuned for updates.
                </p>
                <Button variant="outline" onClick={() => setView('admin')}>
                  Back to Overview
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
