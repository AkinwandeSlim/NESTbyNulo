'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet as WalletIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Banknote,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn, formatNairaFull } from '@/lib/nest-utils';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'credit' | 'debit' | 'dividend' | 'withdrawal' | 'transfer' | 'investment';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method?: string;
}

const mockTransactions: Transaction[] = [
  { id: 'TXN-001', date: '2024-12-15', description: 'Q4 2024 Rental Distribution — The Lekki Residence', type: 'dividend', amount: 187_500, status: 'completed' },
  { id: 'TXN-002', date: '2024-12-15', description: 'Q4 2024 Rental Distribution — Azure Heights', type: 'dividend', amount: 112_500, status: 'completed' },
  { id: 'TXN-003', date: '2024-12-10', description: 'Bank Deposit — GTBank', type: 'credit', amount: 1_000_000, status: 'completed' },
  { id: 'TXN-004', date: '2024-11-28', description: 'Investment in Campus Quarters', type: 'investment', amount: 5_250_000, status: 'completed' },
  { id: 'TXN-005', date: '2024-11-20', description: 'Withdrawal to Access Bank', type: 'withdrawal', amount: 500_000, status: 'completed' },
  { id: 'TXN-006', date: '2024-11-15', description: 'Bank Deposit — GTBank', type: 'credit', amount: 2_000_000, status: 'completed' },
  { id: 'TXN-007', date: '2024-10-28', description: 'Investment in The Yaba Hub', type: 'investment', amount: 2_500_000, status: 'completed' },
  { id: 'TXN-008', date: '2024-10-15', description: 'Q3 2024 Rental Distribution', type: 'dividend', amount: 137_500, status: 'completed' },
  { id: 'TXN-009', date: '2024-10-05', description: 'Transfer to Investor ID: NLO-0089', type: 'transfer', amount: 250_000, status: 'pending' },
  { id: 'TXN-010', date: '2024-09-20', description: 'Investment in Azure Heights', type: 'investment', amount: 3_000_000, status: 'completed' },
  { id: 'TXN-011', date: '2024-09-10', description: 'Referral Bonus — Ade T.', type: 'credit', amount: 25_000, status: 'completed' },
  { id: 'TXN-012', date: '2024-08-28', description: 'Failed Withdrawal Attempt', type: 'withdrawal', amount: 100_000, status: 'failed' },
];

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  completed: { color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', icon: <CheckCircle2 className="size-3" /> },
  pending: { color: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300', icon: <Clock className="size-3" /> },
  failed: { color: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300', icon: <XCircle className="size-3" /> },
};

const typeIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  credit: { icon: <ArrowDownToLine className="size-4" />, color: 'bg-nest-emerald/10 text-nest-emerald' },
  debit: { icon: <ArrowUpFromLine className="size-4" />, color: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' },
  dividend: { icon: <DollarSign className="size-4" />, color: 'bg-nest-gold/10 text-nest-gold' },
  withdrawal: { icon: <ArrowUpRight className="size-4" />, color: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' },
  transfer: { icon: <Send className="size-4" />, color: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400' },
  investment: { icon: <Repeat className="size-4" />, color: 'bg-nest-emerald/10 text-nest-emerald' },
};

export default function WalletView() {
  const [balance] = useState(3_250_000);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');

  const quickAmounts = [100_000, 250_000, 500_000, 1_000_000, 2_000_000];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Wallet</h1>
        <p className="text-sm text-muted-foreground">Manage your funds and transactions</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="p-6 gap-0 nest-gradient text-white border-0">
          <div className="flex items-center gap-2 mb-1">
            <WalletIcon className="size-4 text-white/70" />
            <p className="text-sm text-white/70">Available Balance</p>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl font-bold mb-6"
          >
            {formatNairaFull(balance)}
          </motion.p>
          <div className="flex flex-wrap gap-3">
            {/* Deposit */}
            <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-nest-emerald hover:bg-white/90 font-semibold gap-1.5">
                  <Plus className="size-4" />
                  Deposit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deposit Funds</DialogTitle>
                  <DialogDescription>Add money to your NEST wallet via bank transfer or card.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Quick Amounts</label>
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setDepositAmount(String(amt))}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                            Number(depositAmount) === amt
                              ? 'border-nest-emerald bg-nest-emerald/10 text-nest-emerald'
                              : 'border-border hover:border-nest-emerald/50'
                          )}
                        >
                          {formatNairaFull(amt)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    type="number"
                    placeholder="Enter amount (₦)"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="h-11"
                  />
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Payment Method</p>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-nest-emerald/30">
                      <CreditCard className="size-4 text-muted-foreground" />
                      <span className="text-sm">Pay with Card (Flutterwave)</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-nest-emerald/30">
                      <Banknote className="size-4 text-muted-foreground" />
                      <span className="text-sm">Bank Transfer</span>
                    </button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>Cancel</Button>
                  <Button className="bg-nest-emerald hover:bg-nest-emerald/90 text-white" disabled={!depositAmount || Number(depositAmount) <= 0}>
                    Deposit {depositAmount ? formatNairaFull(Number(depositAmount)) : ''}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Withdraw */}
            <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30 gap-1.5">
                  <ArrowUpFromLine className="size-4" />
                  Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>Transfer money from your NEST wallet to your bank account.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted text-sm">
                    <span className="text-muted-foreground">Available: </span>
                    <span className="font-bold">{formatNairaFull(balance)}</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="Enter amount (₦)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={balance}
                    className="h-11"
                  />
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.slice(0, 3).map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setWithdrawAmount(String(amt))}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                          Number(withdrawAmount) === amt
                            ? 'border-nest-emerald bg-nest-emerald/10 text-nest-emerald'
                            : 'border-border hover:border-nest-emerald/50'
                        )}
                      >
                        {formatNairaFull(amt)}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg border border-border text-xs text-muted-foreground">
                    Withdrawals are processed within 24 hours to your registered bank account (GTBank ****1234).
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>Cancel</Button>
                  <Button className="bg-nest-emerald hover:bg-nest-emerald/90 text-white" disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > balance}>
                    Withdraw
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Transfer */}
            <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30 gap-1.5">
                  <Send className="size-4" />
                  Transfer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Transfer Funds</DialogTitle>
                  <DialogDescription>Send money to another NEST investor.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Recipient ID or Email</label>
                    <Input
                      placeholder="e.g. NLO-0089 or investor@email.com"
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Amount</label>
                    <Input
                      type="number"
                      placeholder="Enter amount (₦)"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      max={balance}
                      className="h-11"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
                  <Button className="bg-nest-emerald hover:bg-nest-emerald/90 text-white" disabled={!transferAmount || Number(transferAmount) <= 0 || !transferRecipient}>
                    Transfer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <Card className="p-3 gap-0 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Deposits</p>
          <p className="text-sm font-bold mt-0.5">{formatNairaFull(18_750_000)}</p>
        </Card>
        <Card className="p-3 gap-0 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Spent</p>
          <p className="text-sm font-bold mt-0.5">{formatNairaFull(15_750_000)}</p>
        </Card>
        <Card className="p-3 gap-0 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Transactions</p>
          <p className="text-sm font-bold mt-0.5">47</p>
        </Card>
      </motion.div>

      {/* Transaction Ledger */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-5 gap-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Transaction History</h3>
              <p className="text-xs text-muted-foreground">All wallet activity</p>
            </div>
          </div>
          <div className="space-y-0">
            {mockTransactions.map((txn, i) => {
              const typeInfo = typeIcons[txn.type] || typeIcons.credit;
              const statusInfo = statusConfig[txn.status] || statusConfig.completed;

              return (
                <div key={txn.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0', typeInfo.color)}>
                        {typeInfo.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{txn.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(txn.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {txn.method && (
                            <>
                              <span>·</span>
                              <span>{txn.method}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className={cn(
                        'text-sm font-bold',
                        ['credit', 'dividend'].includes(txn.type) ? 'text-nest-emerald' : 'text-foreground'
                      )}>
                        {['credit', 'dividend'].includes(txn.type) ? '+' : '-'}{formatNairaFull(txn.amount)}
                      </p>
                      <Badge variant="secondary" className={cn('text-[10px]', statusInfo.color)}>
                        <span className="flex items-center gap-0.5">
                          {statusInfo.icon}
                          {txn.status}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
