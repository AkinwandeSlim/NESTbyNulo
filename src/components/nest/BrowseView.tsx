'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  TrendingUp,
  Users,
  Banknote,
  Building2,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUpRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PropertyCard, { type PropertyCardData } from './PropertyCard';
import { cn } from '@/lib/nest-utils';

type CategoryFilter = 'all' | 'completed_rental' | 'off_plan' | 'commercial' | 'student_housing' | 'mixed_use' | 'affordable_housing';

const categories: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'completed_rental', label: 'Residential' },
  { value: 'off_plan', label: 'Off-Plan' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'student_housing', label: 'Student Housing' },
  { value: 'mixed_use', label: 'Mixed-Use' },
  { value: 'affordable_housing', label: 'Affordable' },
];

const stagger = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function BrowseView() {
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [featured, setFeatured] = useState<PropertyCardData[]>([]);
  const [trending, setTrending] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const featuredScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [allRes, featuredRes, trendingRes] = await Promise.all([
          fetch('/api/properties?limit=20&sort=createdAt&order=desc'),
          fetch('/api/properties?featured=true&limit=5'),
          fetch('/api/properties?trending=true&limit=5'),
        ]);
        const allData = await allRes.json();
        const featData = await featuredRes.json();
        const trendData = await trendingRes.json();

        setProperties(allData.properties || []);
        setFeatured(featData.properties || []);
        setTrending(trendData.properties || []);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProperties = useMemo(() => {
    let filtered = [...properties];

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter((p) => p.propertyType === activeCategory);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortBy) {
        case 'rentalYield': aVal = a.rentalYield ?? 0; bVal = b.rentalYield ?? 0; break;
        case 'fundingProgress': aVal = a.fundingProgress ?? 0; bVal = b.fundingProgress ?? 0; break;
        case 'totalValue': aVal = a.totalValue; bVal = b.totalValue; break;
        default: aVal = 0; bVal = 0;
      }
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }, [properties, activeCategory, search, sortBy, sortOrder]);

  const scrollFeatured = (dir: 'left' | 'right') => {
    if (featuredScrollRef.current) {
      const amount = dir === 'left' ? -340 : 340;
      featuredScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a00] via-[#2d1200] to-[#0c0a09]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,102,0,0.25),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(245,158,11,0.15),_transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-16 sm:pt-36 sm:pb-20">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="flex flex-col items-center text-center gap-6"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="bg-white/10 text-white/90 border-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium">
                <span className="mr-1">🇳🇬</span> Trusted by 2,500+ investors across Africa
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl"
            >
              Become a{' '}
              <span className="bg-gradient-to-r from-nest-accent to-orange-300 bg-clip-text text-transparent">Landlord</span>
              {' '}Today
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-white/70 max-w-xl"
            >
              Invest from ₦500,000 in professionally managed real estate across Africa. Earn rental income and build generational wealth.
            </motion.p>

            {/* Search Bar */}
            <motion.div variants={fadeInUp} className="w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search properties, cities, or developers..."
                  className="pl-10 h-12 bg-white/10 backdrop-blur-md border-white/15 text-white placeholder:text-white/40 focus-visible:ring-nest-accent/50 focus-visible:border-nest-accent/50 rounded-xl"
                />
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-4"
            >
              {[
                { icon: <Users className="size-4" />, value: '2,500+', label: 'Investors' },
                { icon: <Banknote className="size-4" />, value: '₦1.52B', label: 'Raised' },
                { icon: <TrendingUp className="size-4" />, value: '8.5%', label: 'Avg Yield' },
                { icon: <Building2 className="size-4" />, value: '12', label: 'Properties' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-white/50 text-xs mb-1">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 pb-20">
        {/* ─── CATEGORY FILTERS ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                  activeCategory === cat.value
                    ? 'bg-nest-primary text-white shadow-md shadow-nest-primary/25'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── FEATURED OPPORTUNITIES ─── */}
        {featured.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Featured Opportunities</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Hand-picked high-yield properties</p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => scrollFeatured('left')}>
                  <ChevronRight className="size-4 rotate-180" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => scrollFeatured('right')}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
            <div
              ref={featuredScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar"
            >
              {featured.map((prop, i) => (
                <PropertyCard key={prop.id} property={prop} variant="featured" index={i} className="snap-start" />
              ))}
            </div>
          </motion.section>
        )}

        {/* ─── TRENDING NOW ─── */}
        {trending.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  Trending Now
                  <TrendingUp className="size-5 text-nest-primary" />
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">Most popular investments this week</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.map((prop, i) => (
                <PropertyCard key={prop.id} property={prop} index={i} />
              ))}
            </div>
          </motion.section>
        )}

        {/* ─── ALL PROPERTIES ─── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Explore All Opportunities</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} available
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <SlidersHorizontal className="size-3 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest</SelectItem>
                  <SelectItem value="rentalYield">Highest Yield</SelectItem>
                  <SelectItem value="fundingProgress">Most Funded</SelectItem>
                  <SelectItem value="totalValue">Highest Value</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              >
                <ArrowUpDown className="size-3 mr-1.5" />
                {sortOrder === 'desc' ? 'Desc' : 'Asc'}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border p-0 overflow-hidden">
                  <Skeleton className="aspect-[16/11] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="grid grid-cols-3 gap-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="size-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">No properties found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredProperties.map((prop, i) => (
                  <PropertyCard key={prop.id} property={prop} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.section>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}


