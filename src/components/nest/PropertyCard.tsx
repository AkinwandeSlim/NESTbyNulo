'use client';

import { motion } from 'framer-motion';
import { MapPin, Building2, TrendingUp, Clock, BadgeCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  formatNaira,
  formatPercent,
  getRiskBg,
  getPropertyTypeLabel,
  getStatusColor,
  cn,
} from '@/lib/nest-utils';
import { useNestStore } from '@/lib/nest-store';

export interface PropertyCardData {
  id: string;
  slug: string;
  title: string;
  propertyType: string;
  status: string;
  city: string;
  state: string;
  shortDescription?: string;
  totalValue: number;
  minInvestment: number;
  rentalYield: number | null;
  expectedIRR: number | null;
  riskRating: string;
  coverImage?: string;
  fundingRaised: number;
  fundingTarget: number;
  fundingProgress?: number;
  fundingRemaining?: number;
  developer?: {
    id: string;
    companyName: string;
    logo?: string;
    isVerified?: boolean;
  } | null;
  opportunity?: {
    id: string;
    minInvestment: number;
    maxInvestment?: number;
    currentInvestors: number;
    maxInvestors?: number;
  } | null;
  featured?: boolean;
  trending?: boolean;
}

interface PropertyCardProps {
  property: PropertyCardData;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
  index?: number;
}

export default function PropertyCard({
  property,
  variant = 'default',
  className,
  index = 0,
}: PropertyCardProps) {
  const { setView, selectProperty } = useNestStore();
  const progress = property.fundingProgress ?? Math.round((property.fundingRaised / property.fundingTarget) * 100);

  const handleCardClick = () => {
    selectProperty(property.slug);
    setView('property-detail');
  };

  const handleInvestClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    selectProperty(property.slug);
    setView('invest');
  };

  const imageUrl = property.coverImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=280&fit=crop';

  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        whileHover={{ y: -8 }}
        className={cn('min-w-[300px] max-w-[340px] flex-shrink-0', className)}
      >
        <div
          onClick={handleCardClick}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
          role="button"
          tabIndex={0}
          className="group w-full text-left cursor-pointer"
        >
          <div className="relative overflow-hidden rounded-xl bg-card border border-border shadow-sm">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={imageUrl}
                alt={property.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              {/* Top Badges */}
              <div className="absolute top-3 left-3 flex gap-1.5">
                <Badge className={getStatusColor(property.status)} variant="secondary">
                  {property.status === 'funding' ? 'Funding' : property.status}
                </Badge>
                {property.featured && (
                  <Badge className="bg-nest-gold/90 text-white border-0">
                    <BadgeCheck className="size-3 mr-0.5" />
                    Featured
                  </Badge>
                )}
              </div>
              {/* Yield Badge */}
              {property.rentalYield != null && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1 rounded-full bg-nest-emerald px-2.5 py-1 text-xs font-semibold text-white">
                    <TrendingUp className="size-3" />
                    {formatPercent(property.rentalYield)}
                  </div>
                </div>
              )}
              {/* Bottom Content */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-base font-bold text-white mb-0.5 line-clamp-1">{property.title}</h3>
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <MapPin className="size-3" />
                  <span>{property.city}, {property.state}</span>
                </div>
              </div>
            </div>
            {/* Content */}
            <div className="p-4">
              {/* Developer */}
              {property.developer && (
                <div className="flex items-center gap-1.5 mb-3">
                  <Building2 className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {property.developer.companyName}
                  </span>
                  {property.developer.isVerified && (
                    <BadgeCheck className="size-3 text-nest-emerald" />
                  )}
                </div>
              )}
              {/* Metrics */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Min. Investment</p>
                  <p className="text-sm font-bold text-foreground">{formatNaira(property.minInvestment)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">IRR</p>
                  <p className="text-sm font-bold text-foreground">
                    {property.expectedIRR != null ? formatPercent(property.expectedIRR) : '—'}
                  </p>
                </div>
              </div>
              {/* Progress */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{progress}% funded</span>
                  <span className="text-muted-foreground">{formatNaira(property.fundingRemaining ?? property.fundingTarget - property.fundingRaised)} left</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
              {/* Invest Button */}
              <Button
                onClick={handleInvestClick}
                className="w-full bg-nest-emerald hover:bg-nest-emerald/90 text-white"
                size="sm"
              >
                Invest Now
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={cn('w-full', className)}
    >
      <div
        onClick={handleCardClick}
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        role="button"
        tabIndex={0}
        className="group w-full text-left cursor-pointer"
      >
        <Card className="overflow-hidden p-0 gap-0 nest-card-hover border-border/50 hover:border-nest-emerald/20">
          {/* Image */}
          <div className="relative aspect-[16/11] overflow-hidden">
            <img
              src={imageUrl}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex gap-1.5">
              <Badge className={cn('text-[10px]', getPropertyTypeLabel(property.propertyType) !== property.propertyType ? 'bg-nest-emerald/90 text-white border-0' : '')}>
                {getPropertyTypeLabel(property.propertyType)}
              </Badge>
              <Badge className={cn('text-[10px]', getStatusColor(property.status))}>
                {property.status === 'funding' ? 'Funding' : property.status}
              </Badge>
            </div>
            {/* Yield Badge */}
            {property.rentalYield != null && (
              <div className="absolute top-2.5 right-2.5">
                <div className="flex items-center gap-1 rounded-full bg-nest-emerald px-2 py-0.5 text-[11px] font-semibold text-white">
                  <TrendingUp className="size-3" />
                  {formatPercent(property.rentalYield)}
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Title & Location */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-0.5 line-clamp-1">{property.title}</h3>
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <MapPin className="size-3" />
                <span>{property.city}, {property.state}</span>
              </div>
            </div>

            {/* Developer */}
            {property.developer && (
              <div className="flex items-center gap-1.5">
                <Building2 className="size-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">
                  {property.developer.companyName}
                </span>
                {property.developer.isVerified && (
                  <BadgeCheck className="size-3 text-nest-emerald flex-shrink-0" />
                )}
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Min Invest</p>
                <p className="text-xs font-bold">{formatNaira(property.minInvestment)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Yield</p>
                <p className="text-xs font-bold text-nest-emerald">
                  {property.rentalYield != null ? formatPercent(property.rentalYield) : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">IRR</p>
                <p className="text-xs font-bold">
                  {property.expectedIRR != null ? formatPercent(property.expectedIRR) : '—'}
                </p>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-medium">{progress}% funded</span>
                <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded', getRiskBg(property.riskRating))}>
                  {property.riskRating.charAt(0).toUpperCase() + property.riskRating.slice(1)} Risk
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            {/* Action */}
            <Button
              onClick={handleInvestClick}
              className="w-full bg-nest-emerald hover:bg-nest-emerald/90 text-white text-xs"
              size="sm"
            >
              Invest Now
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
