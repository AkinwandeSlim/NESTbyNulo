'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Building2,
  TrendingUp,
  Clock,
  Shield,
  BadgeCheck,
  Users,
  Download,
  ChevronRight,
  CheckCircle2,
  FileText,
  BarChart3,
  Info,
  CalendarDays,
  Target,
  Percent,
  Timer,
  Star,
  Phone,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useNestStore } from '@/lib/nest-store';
import {
  formatNaira,
  formatNairaFull,
  formatPercent,
  getRiskColor,
  getRiskBg,
  getPropertyTypeLabel,
  getStatusColor,
  cn,
} from '@/lib/nest-utils';
import PropertyCard, { type PropertyCardData } from './PropertyCard';

interface PropertyDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  propertyType: string;
  status: string;
  address: string;
  city: string;
  state: string;
  country: string;
  totalUnits?: number;
  totalValue: number;
  minInvestment: number;
  maxInvestment?: number;
  fundingTarget: number;
  fundingRaised: number;
  rentalYield?: number;
  expectedIRR?: number;
  riskRating: string;
  investmentTimeline?: string;
  completionDate?: string;
  images: string[];
  coverImage?: string;
  featured: boolean;
  trending: boolean;
  fundingProgress: number;
  fundingRemaining: number;
  developer: {
    id: string;
    companyName: string;
    registrationNo?: string;
    website?: string;
    description?: string;
    logo?: string;
    hqAddress?: string;
    foundedYear?: number;
    totalProjects: number;
    totalFunding: number;
    isVerified: boolean;
    rating: number;
  } | null;
  propertyManager: {
    id: string;
    companyName: string;
    licenseNo?: string;
    description?: string;
    logo?: string;
    phone?: string;
    email?: string;
    managedCount: number;
    rating: number;
    isVerified: boolean;
  } | null;
  opportunity: {
    id: string;
    investmentMemo?: string;
    financialSummary: {
      projectedAnnualReturn?: number;
      breakEvenPeriod?: string;
      exitStrategy?: string;
    } | null;
    fundingStartDate: string;
    fundingEndDate?: string;
    minInvestment: number;
    maxInvestment?: number;
    maxInvestors?: number;
    currentInvestors: number;
    spvName?: string;
    faq: { question: string; answer: string }[] | null;
  } | null;
  documents: {
    id: string;
    title: string;
    type: string;
    fileUrl: string;
    fileSize?: number;
  }[];
  similarProperties: PropertyCardData[];
}

export default function PropertyDetailView() {
  const { selectedPropertySlug, setView, selectProperty } = useNestStore();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!selectedPropertySlug) return;
    async function fetchProperty() {
      try {
        setLoading(true);
        setSelectedImage(0);
        const res = await fetch(`/api/properties/${selectedPropertySlug}`);
        const data = await res.json();
        setProperty(data.property || null);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [selectedPropertySlug]);

  const handleBack = () => {
    selectProperty(null);
    setView('browse');
  };

  const handleInvest = () => {
    setView('invest');
  };

  const handlePropertyClick = (slug: string) => {
    selectProperty(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!selectedPropertySlug) return null;

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Property not found</h2>
          <Button variant="outline" onClick={handleBack}>Back to Browse</Button>
        </div>
      </div>
    );
  }

  const images = property.images.length > 0
    ? property.images
    : [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&h=500&fit=crop',
      ];

  const financialData = property.opportunity?.financialSummary;
  const faqItems = property.opportunity?.faq || [];

  const timelineSteps = [
    { label: 'Project Announced', date: property.opportunity?.fundingStartDate ? new Date(property.opportunity.fundingStartDate).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }) : 'Q1 2024', icon: <FileText className="size-4" />, done: true },
    { label: 'Funding Open', date: property.opportunity?.fundingStartDate ? new Date(property.opportunity.fundingStartDate).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }) : 'Q2 2024', icon: <BarChart3 className="size-4" />, done: property.status === 'funding' },
    { label: 'Funding Goal', date: 'Q3 2024', icon: <Target className="size-4" />, done: property.fundingProgress >= 100 },
    { label: 'Construction / Acquisition', date: property.investmentTimeline || 'Q4 2024', icon: <Building2 className="size-4" />, done: false },
    { label: 'Returns Start', date: 'Q1 2025', icon: <TrendingUp className="size-4" />, done: false },
  ];

  return (
    <div className="min-h-screen pt-20 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="pt-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5">
            <ArrowLeft className="size-4" />
            Back to Properties
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ─── MAIN CONTENT ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl aspect-[16/10]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={images[selectedImage]}
                    alt={`${property.title} - Image ${selectedImage + 1}`}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {images.slice(0, 6).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        'flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all',
                        selectedImage === i ? 'border-nest-primary shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      )}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getStatusColor(property.status)} variant="secondary">
                  {property.status === 'funding' ? 'Funding' : property.status}
                </Badge>
                <Badge variant="secondary" className="bg-nest-primary/10 text-nest-primary border-nest-primary/20">
                  {getPropertyTypeLabel(property.propertyType)}
                </Badge>
                <Badge variant="secondary" className={getRiskBg(property.riskRating)}>
                  {property.riskRating.charAt(0).toUpperCase() + property.riskRating.slice(1)} Risk
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <span className="text-sm">{property.address}, {property.city}, {property.state}, {property.country}</span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview" className="gap-1.5">
                  <Info className="size-3.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="financials" className="gap-1.5">
                  <BarChart3 className="size-3.5" />
                  Financials
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-1.5">
                  <FileText className="size-3.5" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="faq" className="gap-1.5">
                  <Info className="size-3.5" />
                  FAQ
                </TabsTrigger>
              </TabsList>

              {/* ── Overview Tab ── */}
              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">About This Property</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: <Building2 className="size-4 text-nest-primary" />, label: 'Total Value', value: formatNairaFull(property.totalValue) },
                    { icon: <Target className="size-4 text-nest-primary" />, label: 'Min Investment', value: formatNairaFull(property.minInvestment) },
                    { icon: <Percent className="size-4 text-nest-primary" />, label: 'Rental Yield', value: property.rentalYield != null ? formatPercent(property.rentalYield) : '—' },
                    { icon: <TrendingUp className="size-4 text-nest-primary" />, label: 'Expected IRR', value: property.expectedIRR != null ? formatPercent(property.expectedIRR) : '—' },
                    { icon: <Shield className="size-4" />, label: 'Risk Rating', value: property.riskRating.charAt(0).toUpperCase() + property.riskRating.slice(1), valueClass: getRiskColor(property.riskRating) },
                    { icon: <Timer className="size-4 text-nest-primary" />, label: 'Timeline', value: property.investmentTimeline || '18 months' },
                  ].map((metric) => (
                    <Card key={metric.label} className="p-4 gap-0">
                      <div className="flex items-center gap-2 mb-2">
                        {metric.icon}
                        <span className="text-xs text-muted-foreground">{metric.label}</span>
                      </div>
                      <p className={cn('text-base font-bold', metric.valueClass)}>{metric.value}</p>
                    </Card>
                  ))}
                </div>

                {/* Developer */}
                {property.developer && (
                  <Card className="p-4 gap-0">
                    <h3 className="text-sm font-semibold mb-3">Developer</h3>
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nest-primary/10 text-nest-primary font-bold text-lg">
                        {property.developer.companyName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm">{property.developer.companyName}</p>
                          {property.developer.isVerified && <BadgeCheck className="size-4 text-nest-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {property.developer.totalProjects} projects · ₦{((property.developer.totalFunding || 0) / 1e6).toFixed(0)}M raised
                        </p>
                        {property.developer.rating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="size-3 fill-nest-accent text-nest-accent" />
                            <span className="text-xs font-medium">{property.developer.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Property Manager */}
                {property.propertyManager && (
                  <Card className="p-4 gap-0">
                    <h3 className="text-sm font-semibold mb-3">Property Manager</h3>
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nest-accent/10 text-nest-accent font-bold text-lg">
                        {property.propertyManager.companyName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm">{property.propertyManager.companyName}</p>
                          {property.propertyManager.isVerified && <BadgeCheck className="size-4 text-nest-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {property.propertyManager.managedCount} properties managed
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {property.propertyManager.email && (
                            <span className="flex items-center gap-1"><Mail className="size-3" />{property.propertyManager.email}</span>
                          )}
                          {property.propertyManager.phone && (
                            <span className="flex items-center gap-1"><Phone className="size-3" />{property.propertyManager.phone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Location Placeholder Map */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Location</h3>
                  <div className="relative w-full h-48 rounded-xl bg-muted overflow-hidden">
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <MapPin className="size-8 mb-2" />
                      <p className="text-sm font-medium">{property.city}, {property.state}</p>
                      <p className="text-xs">{property.address}</p>
                    </div>
                    <div className="absolute inset-0 opacity-20">
                      <div className="w-full h-full" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop)', backgroundSize: 'cover' }} />
                    </div>
                  </div>
                </div>

                {/* Investment Timeline */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Investment Timeline</h3>
                  <div className="space-y-0">
                    {timelineSteps.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs',
                            step.done
                              ? 'bg-nest-primary border-nest-primary text-white'
                              : 'bg-background border-border text-muted-foreground'
                          )}>
                            {step.icon}
                          </div>
                          {i < timelineSteps.length - 1 && (
                            <div className={cn('w-0.5 h-8', step.done ? 'bg-nest-primary' : 'bg-border')} />
                          )}
                        </div>
                        <div className="pt-1 pb-4">
                          <p className="text-sm font-medium">{step.label}</p>
                          <p className="text-xs text-muted-foreground">{step.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ── Financials Tab ── */}
              <TabsContent value="financials" className="space-y-6">
                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card className="p-4 gap-0 bg-gradient-to-br from-nest-primary/5 to-transparent border-nest-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Projected Annual Return</p>
                    <p className="text-lg font-bold text-nest-primary">
                      {financialData?.projectedAnnualReturn ? `+${formatPercent(financialData.projectedAnnualReturn)}` : '+12.5%'}
                    </p>
                  </Card>
                  <Card className="p-4 gap-0">
                    <p className="text-xs text-muted-foreground mb-1">Break-even Period</p>
                    <p className="text-lg font-bold">{financialData?.breakEvenPeriod || '5-7 years'}</p>
                  </Card>
                  <Card className="p-4 gap-0">
                    <p className="text-xs text-muted-foreground mb-1">Exit Strategy</p>
                    <p className="text-sm font-medium">{financialData?.exitStrategy || 'Sale after 7 years or refinancing'}</p>
                  </Card>
                </div>

                {/* Projection Table */}
                <Card className="p-4 gap-0">
                  <h3 className="text-sm font-semibold mb-3">Projected Returns (5 Years)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-xs text-muted-foreground font-medium">Year</th>
                          <th className="text-right py-2 text-xs text-muted-foreground font-medium">Property Value</th>
                          <th className="text-right py-2 text-xs text-muted-foreground font-medium">Rental Income</th>
                          <th className="text-right py-2 text-xs text-muted-foreground font-medium">Total Return</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { year: 1, value: property.totalValue, income: property.totalValue * (property.rentalYield || 0.08), total: 0 },
                          { year: 2, value: property.totalValue * 1.06, income: property.totalValue * 1.06 * (property.rentalYield || 0.08), total: 0 },
                          { year: 3, value: property.totalValue * 1.12, income: property.totalValue * 1.12 * (property.rentalYield || 0.08), total: 0 },
                          { year: 4, value: property.totalValue * 1.19, income: property.totalValue * 1.19 * (property.rentalYield || 0.08), total: 0 },
                          { year: 5, value: property.totalValue * 1.27, income: property.totalValue * 1.27 * (property.rentalYield || 0.08), total: 0 },
                        ].map((row, i) => {
                          const appreciation = row.value - property.totalValue;
                          const totalReturn = appreciation + (row.income * row.year);
                          return (
                            <tr key={i} className="border-b border-border/50 last:border-0">
                              <td className="py-2.5 font-medium">Year {row.year}</td>
                              <td className="py-2.5 text-right">{formatNairaFull(Math.round(row.value))}</td>
                              <td className="py-2.5 text-right text-nest-primary">{formatNairaFull(Math.round(row.income))}</td>
                              <td className="py-2.5 text-right font-medium">{formatNairaFull(Math.round(totalReturn))}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              {/* ── Documents Tab ── */}
              <TabsContent value="documents" className="space-y-4">
                <div className="space-y-2">
                  {(property.documents.length > 0 ? property.documents : [
                    { id: '1', title: 'Investment Memorandum', type: 'memo', fileUrl: '#', fileSize: 2500000 },
                    { id: '2', title: 'Property Valuation Report', type: 'valuation', fileUrl: '#', fileSize: 1800000 },
                    { id: '3', title: 'Building Plan & Approvals', type: 'plan', fileUrl: '#', fileSize: 3200000 },
                    { id: '4', title: 'SPV Formation Documents', type: 'spv', fileUrl: '#', fileSize: 1500000 },
                    { id: '5', title: 'Risk Disclosure Statement', type: 'disclosure', fileUrl: '#', fileSize: 800000 },
                    { id: '6', title: 'Developer Track Record', type: 'developer', fileUrl: '#', fileSize: 1200000 },
                  ]).map((doc) => (
                    <Card key={doc.id} className="p-3 gap-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <FileText className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {(doc.fileSize! / 1024 / 1024).toFixed(1)} MB · PDF
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="size-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* ── FAQ Tab ── */}
              <TabsContent value="faq" className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {(faqItems.length > 0 ? faqItems : [
                    { question: 'What is the minimum investment amount?', answer: 'The minimum investment for this property is ' + formatNairaFull(property.minInvestment) + '. You can invest in fractional units, making it accessible to a wide range of investors.' },
                    { question: 'How are returns distributed?', answer: 'Returns are distributed quarterly via bank transfer to your registered account. Rental income is calculated based on your proportionate ownership and distributed after operational expenses.' },
                    { question: 'What happens if I want to exit early?', answer: 'While we recommend holding investments for the full term, you can list your shares on our secondary marketplace. We facilitate peer-to-peer transfers with a small processing fee.' },
                    { question: 'Is my investment secured?', answer: 'Yes. Your investment is held in a Special Purpose Vehicle (SPV) specifically created for this property. The SPV holds legal title to the property, and investors hold shares in the SPV proportionate to their investment.' },
                    { question: 'Who manages the property?', answer: 'A certified property manager oversees day-to-day operations including tenant management, maintenance, and rent collection. You receive regular reports on property performance.' },
                    { question: 'What are the risks involved?', answer: 'Key risks include market fluctuations, tenant vacancy, and construction delays (for off-plan). All risks are disclosed in the Investment Memorandum. We conduct thorough due diligence on every property.' },
                  ]).map((item, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-sm">{item.question}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* ─── SIDEBAR ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Investment Card */}
            <Card className="p-5 gap-4 sticky top-24">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Funding Progress</p>
                  <Badge className={getRiskBg(property.riskRating)} variant="secondary">
                    {property.fundingProgress}%
                  </Badge>
                </div>
                <Progress value={property.fundingProgress} className="h-2.5" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Raised</p>
                    <p className="font-bold text-nest-primary">{formatNairaFull(property.fundingRaised)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Goal</p>
                    <p className="font-bold">{formatNairaFull(property.fundingTarget)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Min. Investment</p>
                    <p className="font-bold">{formatNairaFull(property.minInvestment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Investors</p>
                    <p className="font-bold">
                      {property.opportunity?.currentInvestors || 0}
                      {property.opportunity?.maxInvestors ? ` / ${property.opportunity.maxInvestors}` : ''}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Percent className="size-4 text-nest-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Rental Yield</p>
                      <p className="text-sm font-bold">{property.rentalYield != null ? formatPercent(property.rentalYield) : '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-nest-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Expected IRR</p>
                      <p className="text-sm font-bold">{property.expectedIRR != null ? formatPercent(property.expectedIRR) : '—'}</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  {property.opportunity?.fundingEndDate && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      Closes {new Date(property.opportunity.fundingEndDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={handleInvest}
                className="w-full bg-nest-primary hover:bg-nest-primary/90 text-white h-12 text-base font-semibold"
              >
                Invest in This Property
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </Card>

            {/* SPV Info */}
            {property.opportunity?.spvName && (
              <Card className="p-4 gap-0">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="size-4 text-nest-primary" />
                  <p className="text-sm font-semibold">SPV Protection</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your investment is held in {property.opportunity.spvName}, a Special Purpose Vehicle that provides legal protection and transparent ownership.
                </p>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Similar Properties */}
        {property.similarProperties && property.similarProperties.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-5">Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {property.similarProperties.map((prop, i) => (
                <PropertyCard key={prop.id} property={prop} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
