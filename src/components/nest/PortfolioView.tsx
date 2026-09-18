'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Wallet,
  DollarSign,
  ArrowUpRight,
  Building2,
  Briefcase,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { formatNaira, formatNairaFull, cn } from '@/lib/nest-utils';
import { useNestStore } from '@/lib/nest-store';
import PropertyCard, { type PropertyCardData } from './PropertyCard';

const PIE_COLORS = ['#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#f97316'];

interface PortfolioData {
  totalValue: number;
  totalInvested: number;
  currentValue: number;
  capitalAppreciation: number;
  capitalAppreciationPercent: number;
  rentalIncomeEarned: number;
  totalReturns: number;
  overallReturnPercent: number;
  propertiesOwned: number;
  pendingReturns: number;
  propertyAllocation: {
    name: string;
    value: number;
    percent: number;
    type: string;
  }[];
  monthlyReturns: {
    month: string;
    rentalIncome: number;
    dividends: number;
    total: number;
  }[];
  recentTransactions: {
    id: string;
    type: string;
    amount: number;
    status: string;
    description: string;
    date: string;
  }[];
  portfolioGrowth: {
    month: string;
    value: number;
  }[];
}

export default function PortfolioView() {
  const { setView, selectProperty } = useNestStore();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  // True when /api/portfolio answered 401: the visitor is not signed in, so we
  // show a friendly empty state instead of the (formerly crashing) dashboard.
  const [signedOut, setSignedOut] = useState(false);

  // ── dev_gstack merge fix: never accept an error body as portfolio data ──
  // /api/portfolio 401s for anonymous visitors (it is per-user, ledger-derived
  // data). Previously `setData(json)` stored the error object verbatim, and
  // `data.propertyAllocation.map` crashed the whole SPA view.
  useEffect(() => {
    async function fetchPortfolio() {
      try {
        setLoading(true);
        const res = await fetch('/api/portfolio');
        const json = await res.json();
        // A valid portfolio payload always carries totalInvested.
        if (res.ok && typeof json?.totalInvested === 'number') {
          setData(json);
          setSignedOut(false);
        } else {
          setData(null);
          setSignedOut(res.status === 401);
        }
      } catch {
        setData(null);
        setSignedOut(false);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  const pieData = (data?.propertyAllocation ?? []).map((p) => ({
    name: p.name,
    value: p.value,
  }));

  const handleViewProperty = (name: string) => {
    // Navigate to a property (mock - just go to browse)
    setView('browse');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl mb-8" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-8"
        >
          <Briefcase className="mx-auto mb-4 size-10 text-muted-foreground" />
          <h1 className="text-xl font-bold mb-2">
            {signedOut ? 'Sign in to view your portfolio' : 'Portfolio unavailable'}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {signedOut
              ? 'Your portfolio is derived from your own investments and wallet ledger, so it needs a session.'
              : 'Your portfolio data could not be loaded. Try again shortly.'}
          </p>
          <div className="flex gap-3 justify-center">
            {signedOut && (
              <a
                href="/sign-in"
                className="inline-flex h-10 items-center rounded-lg bg-nest-primary px-4 text-sm font-semibold text-white hover:bg-nest-primary/90"
              >
                Sign in
              </a>
            )}
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Button variant="outline" onClick={() => setView('browse')}>
              Browse properties
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">My Portfolio</h1>
        <p className="text-sm text-muted-foreground">Track your real estate investments and returns</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
      >
        {[
          {
            label: 'Portfolio Value',
            value: formatNairaFull(data?.currentValue || 0),
            change: `+${(data?.capitalAppreciationPercent || 0).toFixed(1)}%`,
            icon: <TrendingUp className="size-4" />,
            color: 'text-nest-primary',
            bg: 'from-nest-primary/5 to-transparent',
          },
          {
            label: 'Total Invested',
            value: formatNairaFull(data?.totalInvested || 0),
            change: `${data?.propertiesOwned || 0} properties`,
            icon: <Wallet className="size-4" />,
            color: 'text-nest-primary',
            bg: 'from-nest-primary/5 to-transparent',
          },
          {
            label: 'Rental Income',
            value: formatNairaFull(data?.rentalIncomeEarned || 0),
            change: `₦${data?.pendingReturns?.toLocaleString() || 0} pending`,
            icon: <DollarSign className="size-4" />,
            color: 'text-nest-accent',
            bg: 'from-nest-accent/5 to-transparent',
          },
          {
            label: 'Total Returns',
            value: formatNairaFull(data?.totalReturns || 0),
            change: `+${(data?.overallReturnPercent || 0).toFixed(1)}% all-time`,
            icon: <ArrowUpRight className="size-4" />,
            color: 'text-nest-primary',
            bg: 'from-nest-primary/5 to-transparent',
          },
        ].map((stat) => (
          <Card key={stat.label} className={cn('p-4 gap-0 bg-gradient-to-br', stat.bg)}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <div className={cn('flex items-center justify-center h-7 w-7 rounded-lg bg-background/80', stat.color)}>
                {stat.icon}
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold">{stat.value}</p>
            <p className={cn('text-xs mt-1', stat.color)}>{stat.change}</p>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Portfolio Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-5 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Portfolio Growth</h3>
                <p className="text-xs text-muted-foreground">Value over time</p>
              </div>
              <Badge variant="secondary" className="text-xs bg-nest-primary/10 text-nest-primary">
                <TrendingUp className="size-3 mr-1" />
                +{((data?.currentValue || 0) / (data?.totalInvested || 1) * 100 - 100).toFixed(1)}%
              </Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.portfolioGrowth || []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0 0 / 0.3)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 40)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 40)' }}
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
                    formatter={(value: number) => [formatNairaFull(value), 'Portfolio Value']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#portfolioGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Allocation Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-5 gap-4 h-full">
            <div>
              <h3 className="text-sm font-semibold">Property Allocation</h3>
              <p className="text-xs text-muted-foreground">Portfolio distribution</p>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
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
            {/* Allocation List */}
            <div className="space-y-2">
              {data?.propertyAllocation.map((prop, i) => (
                <div key={prop.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="truncate max-w-[120px]">{prop.name}</span>
                  </div>
                  <span className="font-medium">{prop.percent}%</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Income Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-8"
      >
        <Card className="p-5 gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Monthly Income</h3>
              <p className="text-xs text-muted-foreground">Rental distributions received</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyReturns || []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
                  formatter={(value: number) => [formatNairaFull(value), 'Income']}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#incomeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-5 gap-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Recent Transactions</h3>
              <p className="text-xs text-muted-foreground">Your latest investment activity</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-nest-primary" onClick={() => setView('wallet')}>
              View All <ArrowRight className="size-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-0">
            {(data?.recentTransactions || []).map((txn, i) => (
              <div key={txn.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg',
                      txn.type === 'dividend' ? 'bg-nest-accent/10 text-nest-accent' : 'bg-nest-primary/10 text-nest-primary'
                    )}>
                      {txn.type === 'dividend' ? <DollarSign className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{txn.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(txn.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'text-sm font-bold',
                      txn.type === 'dividend' ? 'text-nest-accent' : 'text-nest-primary'
                    )}>
                      {txn.type === 'dividend' ? '+' : ''}{formatNairaFull(txn.amount)}
                    </p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[10px]',
                        txn.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      )}
                    >
                      {txn.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
