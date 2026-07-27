'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Building,
  Wallet,
  Banknote,
  Shield,
  PartyPopper,
  Trophy,
  BadgeCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatNaira, formatNairaFull, formatPercent } from '@/lib/nest-utils';
import { useNestStore } from '@/lib/nest-store';
import { type PropertyCardData } from './PropertyCard';

interface InvestmentCheckoutProps {
  propertySlug?: string | null;
}

const presetAmounts = [500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000];

const paymentMethods = [
  {
    id: 'wallet',
    label: 'NEST Wallet',
    desc: 'Pay from your wallet balance',
    icon: <Wallet className="size-5" />,
    balance: '₦3,250,000',
  },
  {
    id: 'card',
    label: 'Debit Card',
    desc: 'Pay via Flutterwave (Visa, Mastercard)',
    icon: <CreditCard className="size-5" />,
    balance: null,
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    desc: 'Direct bank transfer to NEST account',
    icon: <Building className="size-5" />,
    balance: null,
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function InvestmentCheckout({ propertySlug }: InvestmentCheckoutProps) {
  const { selectedPropertySlug, setView, selectProperty } = useNestStore();
  const [property, setProperty] = useState<PropertyCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [amount, setAmount] = useState(1_000_000);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const slug = propertySlug || selectedPropertySlug;

  useEffect(() => {
    if (!slug) return;
    async function fetchProperty() {
      try {
        setLoading(true);
        const res = await fetch(`/api/properties/${slug}`);
        const data = await res.json();
        setProperty(data.property || null);
        if (data.property?.minInvestment) {
          setAmount(data.property.minInvestment);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [slug]);

  const goToStep = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleConfirm = () => {
    setConfirmed(true);
  };

  const handleBack = () => {
    selectProperty(slug);
    setView('property-detail');
  };

  const steps = [
    { number: 1, label: 'Amount' },
    { number: 2, label: 'Payment' },
    { number: 3, label: 'Confirm' },
  ];

  if (!slug) return null;

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-60 rounded-xl mb-6" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  // Success State
  if (confirmed) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          {/* Confetti animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-nest-primary/10"
          >
            <PartyPopper className="size-12 text-nest-primary" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Investment Successful!</h1>
            <p className="text-muted-foreground mb-8">
              Your investment has been confirmed. A certificate of ownership will be generated shortly.
            </p>
          </motion.div>

          {/* Certificate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 text-left border-nest-accent/30 bg-gradient-to-br from-nest-accent/5 to-transparent mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="size-5 text-nest-accent" />
                  <span className="text-sm font-semibold text-nest-accent">Digital Certificate</span>
                </div>
                <BadgeCheck className="size-5 text-nest-primary" />
              </div>
              <Separator className="mb-4" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Certificate No.</span>
                  <span className="font-mono font-medium">NEST-2024-{Math.floor(Math.random() * 9000 + 1000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Property</span>
                  <span className="font-medium">{property?.title || 'Property'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-nest-primary">{formatNairaFull(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Units</span>
                  <span className="font-medium">{(amount / (property?.minInvestment || 500_000)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected Yield</span>
                  <span className="font-medium">{property?.rentalYield != null ? formatPercent(property.rentalYield) : '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-3"
          >
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setConfirmed(false); setStep(1); setAmount(1_000_000); setTermsAccepted(false); }}
            >
              Invest Again
            </Button>
            <Button
              className="flex-1 bg-nest-primary hover:bg-nest-primary/90 text-white"
              onClick={() => setView('portfolio')}
            >
              View Portfolio
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5">
          <ArrowLeft className="size-4" />
          Back to Property
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1">Investment Checkout</h1>
        <p className="text-sm text-muted-foreground">Complete your investment in 3 simple steps</p>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2">
            <div className={cn(
              'flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold transition-all',
              step > s.number ? 'bg-nest-primary text-white' :
              step === s.number ? 'bg-nest-primary/10 text-nest-primary border-2 border-nest-primary' :
              'bg-muted text-muted-foreground'
            )}>
              {step > s.number ? <Check className="size-4" /> : s.number}
            </div>
            <span className={cn(
              'text-sm font-medium hidden sm:inline',
              step >= s.number ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={cn('w-8 sm:w-16 h-0.5 rounded-full', step > s.number ? 'bg-nest-primary' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      {/* Property Summary Card */}
      {property && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-4 gap-0 mb-6">
            <div className="flex items-center gap-3">
              <img
                src={property.coverImage || `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=70&fit=crop`}
                alt={property.title}
                className="h-14 w-20 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{property.title}</p>
                <p className="text-xs text-muted-foreground">{property.city}, {property.state}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs font-medium text-nest-primary">
                    {property.rentalYield != null ? formatPercent(property.rentalYield) : ''} yield
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Min: {formatNaira(property.minInvestment)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 1 && (
            <div className="space-y-6">
              <Card className="p-5 gap-4">
                <h2 className="text-lg font-semibold">Choose Investment Amount</h2>
                <p className="text-sm text-muted-foreground">
                  Min: {formatNairaFull(property?.minInvestment || 500_000)} · 
                  {property?.maxInvestment && ` Max: ${formatNairaFull(property.maxInvestment)}`}
                </p>

                {/* Preset Amounts */}
                <div className="grid grid-cols-3 gap-2">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className={cn(
                        'py-2.5 px-3 rounded-lg text-sm font-medium border-2 transition-all',
                        amount === preset
                          ? 'border-nest-primary bg-nest-primary/10 text-nest-primary'
                          : 'border-border hover:border-nest-primary/50 text-foreground'
                      )}
                    >
                      {formatNaira(preset)}
                    </button>
                  ))}
                </div>

                <Separator />

                {/* Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Custom Amount</label>
                    <span className="text-lg font-bold text-nest-primary">{formatNairaFull(amount)}</span>
                  </div>
                  <Slider
                    value={[amount]}
                    onValueChange={(v) => setAmount(v[0])}
                    min={property?.minInvestment || 500_000}
                    max={property?.maxInvestment || 10_000_000}
                    step={50_000}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="text-center font-semibold"
                  />
                </div>
              </Card>

              <Button
                onClick={() => goToStep(2)}
                className="w-full bg-nest-primary hover:bg-nest-primary/90 text-white h-12"
              >
                Continue to Payment
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Card className="p-5 gap-4">
                <h2 className="text-lg font-semibold">Payment Method</h2>
                <p className="text-sm text-muted-foreground">Choose how you'd like to pay</p>

                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                        paymentMethod === method.id
                          ? 'border-nest-primary bg-nest-primary/5'
                          : 'border-border hover:border-nest-primary/30'
                      )}
                    >
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        paymentMethod === method.id
                          ? 'bg-nest-primary/10 text-nest-primary'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.desc}</p>
                      </div>
                      {method.balance && (
                        <span className="text-xs font-medium text-nest-primary">{method.balance}</span>
                      )}
                      <div className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all',
                        paymentMethod === method.id ? 'border-nest-primary' : 'border-border'
                      )}>
                        {paymentMethod === method.id && (
                          <div className="h-2.5 w-2.5 rounded-full bg-nest-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => goToStep(1)}>
                  <ArrowLeft className="size-4 mr-1" />
                  Back
                </Button>
                <Button
                  onClick={() => goToStep(3)}
                  className="flex-1 bg-nest-primary hover:bg-nest-primary/90 text-white"
                >
                  Review
                  <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <Card className="p-5 gap-4">
                <h2 className="text-lg font-semibold">Review & Confirm</h2>

                {/* Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Property</span>
                    <span className="font-medium">{property?.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Investment Amount</span>
                    <span className="font-bold text-nest-primary">{formatNairaFull(amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium">{paymentMethods.find(m => m.id === paymentMethod)?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expected Yield</span>
                    <span className="font-medium">{property?.rentalYield != null ? formatPercent(property.rentalYield) : '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expected IRR</span>
                    <span className="font-medium">{property?.expectedIRR != null ? formatPercent(property.expectedIRR) : '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Level</span>
                    <span className="font-medium">{property?.riskRating}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">{formatNairaFull(amount)}</span>
                  </div>
                </div>

                <Separator />

                {/* Terms */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 rounded border-border"
                    />
                    <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                      I have read and agree to the Investment Terms & Conditions, Risk Disclosure Statement, 
                      and understand that my investment is subject to the risks outlined in the Investment Memorandum. 
                      I confirm that all information provided is accurate.
                    </label>
                  </div>
                </div>
              </Card>

              {/* Warning */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Investment in real estate carries inherent risks including but not limited to market fluctuations, 
                  vacancy, and capital loss. Past performance does not guarantee future results.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => goToStep(2)}>
                  <ArrowLeft className="size-4 mr-1" />
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!termsAccepted}
                  className="flex-1 bg-nest-primary hover:bg-nest-primary/90 text-white disabled:opacity-50"
                >
                  <Shield className="size-4 mr-1" />
                  Confirm Investment
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
