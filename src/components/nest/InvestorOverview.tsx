'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Wallet,
  Building2,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatNairaFull, cn } from '@/lib/nest-utils';

interface OverviewData {
  balance: number;
  totalInvested: number;
  portfolioValue: number;
  totalReturns: number;
  propertiesOwned: number;
  pendingReturns: number;
}

interface InvestorOverviewProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    status: string;
  };
}

export default function InvestorOverview({ user }: InvestorOverviewProps) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        setLoading(true);
        // Fetch balance from wallet API
        const walletRes = await fetch('/api/wallet');
        const walletData = await walletRes.json();

        // Fetch portfolio from portfolio API
        const portfolioRes = await fetch('/api/portfolio');
        const portfolioData = await portfolioRes.json();

        if (walletRes.ok && portfolioRes.ok) {
          setData({
            balance: walletData.balanceKobo / 100,
            totalInvested: portfolioData.totalInvested || 0,
            portfolioValue: portfolioData.currentValue || 0,
            totalReturns: portfolioData.totalReturns || 0,
            propertiesOwned: portfolioData.propertiesOwned || 0,
            pendingReturns: portfolioData.pendingReturns || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch overview:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  const userName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const isVerified = user.status === 'VERIFIED';
  const isPending = user.status === 'PENDING';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Banner */}
      {!isVerified && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            className={cn(
              'p-4 border-2',
              isPending
                ? 'bg-amber-50 border-amber-300'
                : 'bg-red-50 border-red-300'
            )}
          >
            <div className="flex items-start gap-3">
              {isPending ? (
                <Clock className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">
                  {isPending ? 'Account Under Verification' : 'Account Issue'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isPending
                    ? 'Your account is being reviewed by our admin team. You will be able to invest once verification is complete. This is a regulatory safety requirement.'
                    : 'Your account was not verified. Please contact NEST support for assistance.'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            label: 'Wallet Balance',
            value: formatNairaFull(data?.balance || 0),
            subtext: 'Available funds',
            icon: <Wallet className="size-4" />,
            color: 'text-nest-primary',
            bg: 'from-nest-primary/5 to-transparent',
          },
          {
            label: 'Portfolio Value',
            value: formatNairaFull(data?.portfolioValue || 0),
            subtext: 'Current value',
            icon: <TrendingUp className="size-4" />,
            color: 'text-nest-primary',
            bg: 'from-nest-primary/5 to-transparent',
          },
          {
            label: 'Total Invested',
            value: formatNairaFull(data?.totalInvested || 0),
            subtext: `${data?.propertiesOwned || 0} properties`,
            icon: <Building2 className="size-4" />,
            color: 'text-nest-accent',
            bg: 'from-nest-accent/5 to-transparent',
          },
          {
            label: 'Total Returns',
            value: formatNairaFull(data?.totalReturns || 0),
            subtext: `₦${(data?.pendingReturns || 0).toLocaleString()} pending`,
            icon: <DollarSign className="size-4" />,
            color: 'text-nest-primary',
            bg: 'from-nest-primary/5 to-transparent',
          },
        ].map((stat) => (
          <Card key={stat.label} className={cn('p-4 gap-0 bg-gradient-to-br', stat.bg)}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg bg-background/80',
                  stat.color
                )}
              >
                {stat.icon}
              </div>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className={cn('text-xs mt-1', stat.color)}>{stat.subtext}</p>
          </Card>
        ))}
      </motion.div>

      {/* Account Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Account Details</h2>
            <Badge
              variant="secondary"
              className={cn(
                'text-xs',
                isVerified
                  ? 'bg-emerald-100 text-emerald-700'
                  : isPending
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
              )}
            >
              {isVerified ? (
                <>
                  <CheckCircle2 className="size-3 mr-1" />
                  Verified
                </>
              ) : isPending ? (
                <>
                  <Clock className="size-3 mr-1" />
                  Pending
                </>
              ) : (
                <>
                  <AlertCircle className="size-3 mr-1" />
                  Rejected
                </>
              )}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nest-primary/10">
                  <User className="size-4 text-nest-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Full Name</p>
                  <p className="text-sm font-medium truncate">{userName || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nest-primary/10">
                  <Mail className="size-4 text-nest-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Email Address</p>
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nest-primary/10">
                  <Shield className="size-4 text-nest-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Verification Status</p>
                  <p className="text-sm font-medium">{user.status}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nest-primary/10">
                  <Calendar className="size-4 text-nest-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Member Since</p>
                  <p className="text-sm font-medium">
                    {new Date().toLocaleDateString('en-NG', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Test Mode Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                TEST MODE — Demo Funds Only
              </h3>
              <p className="text-xs text-red-700">
                This system operates with demo funds only. No real money is moved, and no
                live payments are processed. All balances and transactions shown are for
                demonstration purposes.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="/"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nest-primary/10">
                <Building2 className="size-5 text-nest-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Browse Properties</p>
                <p className="text-xs text-muted-foreground">Find investments</p>
              </div>
            </a>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nest-primary/10">
                <Wallet className="size-5 text-nest-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">View Wallet</p>
                <p className="text-xs text-muted-foreground">Check transactions</p>
              </div>
            </button>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nest-primary/10">
                <TrendingUp className="size-5 text-nest-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">View Portfolio</p>
                <p className="text-xs text-muted-foreground">Track performance</p>
              </div>
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
