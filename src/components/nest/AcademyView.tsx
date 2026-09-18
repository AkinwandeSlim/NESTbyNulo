'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  PlayCircle,
  Video,
  FileBarChart,
  Clock,
  Eye,
  ArrowRight,
  Sparkles,
  BookMarked,
  TrendingUp,
  Trophy,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/nest-utils';

type ContentCategory = 'articles' | 'videos' | 'webinars' | 'reports';
// 'all levels' is a display value for content that suits every skill level
// (e.g. live Q&A webinars); the badge renders it verbatim.
type ContentLevel = 'beginner' | 'intermediate' | 'advanced' | 'all levels';

interface AcademyContent {
  id: string;
  title: string;
  description: string;
  category: ContentCategory;
  image: string;
  readTime: string;
  level: ContentLevel;
  author: string;
  tags: string[];
}

const contentData: AcademyContent[] = [
  {
    id: '1',
    title: 'A Beginner\'s Guide to Fractional Real Estate Investment in Nigeria',
    description: 'Learn the fundamentals of co-investing in premium properties with as little as ₦500,000.',
    category: 'articles',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=240&fit=crop',
    readTime: '8 min read',
    level: 'beginner',
    author: 'NEST Team',
    tags: ['basics', 'getting-started'],
  },
  {
    id: '2',
    title: 'Understanding Rental Yields: How to Evaluate Property Returns',
    description: 'A deep dive into calculating and comparing rental yields across different property types.',
    category: 'articles',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=240&fit=crop',
    readTime: '12 min read',
    level: 'intermediate',
    author: 'Chidi Okonkwo',
    tags: ['yields', 'analysis'],
  },
  {
    id: '3',
    title: 'Lagos vs. Abuja: Where Should You Invest in 2025?',
    description: 'Comparative market analysis of Nigeria\'s top real estate markets.',
    category: 'reports',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=240&fit=crop',
    readTime: '15 min read',
    level: 'intermediate',
    author: 'Research Team',
    tags: ['market-analysis', 'lagos', 'abuja'],
  },
  {
    id: '4',
    title: 'How SPVs Protect Your Real Estate Investment',
    description: 'Understanding the legal structure that safeguards fractional property investors.',
    category: 'videos',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=240&fit=crop',
    readTime: '6 min watch',
    level: 'beginner',
    author: 'Adebayo Ogunlesi',
    tags: ['legal', 'spv'],
  },
  {
    id: '5',
    title: 'Live Q&A: Off-Plan vs. Completed Properties',
    description: 'Expert panel discussion on the pros and cons of investing in off-plan developments.',
    category: 'webinars',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=240&fit=crop',
    readTime: '45 min watch',
    level: 'all levels',
    author: 'Expert Panel',
    tags: ['webinar', 'off-plan'],
  },
  {
    id: '6',
    title: 'Tax Implications of Real Estate Investment in Nigeria',
    description: 'What every investor needs to know about taxes on rental income and capital gains.',
    category: 'articles',
    image: 'https://images.unsplash.com/photo-1554255407-1a6e5b8e4403?w=400&h=240&fit=crop',
    readTime: '10 min read',
    level: 'advanced',
    author: 'Kemi Adebayo',
    tags: ['tax', 'legal'],
  },
  {
    id: '7',
    title: 'Building a Diversified Real Estate Portfolio',
    description: 'Strategies for spreading risk across property types and locations.',
    category: 'videos',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=240&fit=crop',
    readTime: '8 min watch',
    level: 'intermediate',
    author: 'NEST Team',
    tags: ['strategy', 'diversification'],
  },
  {
    id: '8',
    title: 'Q4 2024 African Real Estate Market Report',
    description: 'Comprehensive quarterly analysis of real estate trends across West Africa.',
    category: 'reports',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=240&fit=crop',
    readTime: '20 min read',
    level: 'advanced',
    author: 'Research Team',
    tags: ['market-report', 'q4-2024'],
  },
  {
    id: '9',
    title: 'Exit Strategies for Real Estate Investors',
    description: 'Planning your exit: sale, refinancing, and secondary market options.',
    category: 'articles',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=240&fit=crop',
    readTime: '7 min read',
    level: 'intermediate',
    author: 'Tunde Bakare',
    tags: ['exit-strategy'],
  },
  {
    id: '10',
    title: 'Webinar: Student Housing — The Next Big Opportunity',
    description: 'Explore the growing demand for student accommodation near Nigerian universities.',
    category: 'webinars',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=240&fit=crop',
    readTime: '30 min watch',
    level: 'beginner',
    author: 'Industry Expert',
    tags: ['webinar', 'student-housing'],
  },
  {
    id: '11',
    title: 'Risk Management in Fractional Real Estate',
    description: 'How to assess and mitigate risks when investing through platforms like NEST.',
    category: 'articles',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=240&fit=crop',
    readTime: '9 min read',
    level: 'intermediate',
    author: 'NEST Team',
    tags: ['risk', 'management'],
  },
  {
    id: '12',
    title: 'Understanding Property Valuation Methods',
    description: 'Learn how properties are valued and how to interpret valuation reports.',
    category: 'videos',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=240&fit=crop',
    readTime: '12 min watch',
    level: 'advanced',
    author: 'Expert Valuer',
    tags: ['valuation', 'analysis'],
  },
];

const categoryConfig: Record<ContentCategory, { icon: React.ReactNode; label: string }> = {
  articles: { icon: <BookOpen className="size-3.5" />, label: 'Articles' },
  videos: { icon: <Video className="size-3.5" />, label: 'Videos' },
  webinars: { icon: <PlayCircle className="size-3.5" />, label: 'Webinars' },
  reports: { icon: <FileBarChart className="size-3.5" />, label: 'Reports' },
};

const levelColors: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  intermediate: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  advanced: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  'all levels': 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
};

// Variants typed for the same framer-motion reason as BrowseView.
const stagger: Variants = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AcademyView() {
  const [activeCategory, setActiveCategory] = useState<ContentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContent = contentData.filter((item) => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.section
          variants={stagger}
          initial="initial"
          animate="animate"
          className="mb-10"
        >
          <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-nest-charcoal to-nest-primary/80 p-8 sm:p-12 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_oklch(0.75_0.15_85/0.15),_transparent_60%)]" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="size-6 text-nest-accent" />
                <Badge className="bg-nest-accent/20 text-nest-accent border-nest-accent/30 px-3 py-1 text-xs font-medium">
                  <Sparkles className="size-3 mr-1" />
                  Free Learning Resources
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">Investor Academy</h1>
              <p className="text-base sm:text-lg text-white/70 max-w-2xl mb-6">
                Master real estate investing with expert guides, market analysis, and video tutorials designed for African markets.
              </p>
              <div className="flex flex-wrap gap-6 text-sm text-white/60">
                <div className="flex items-center gap-1.5">
                  <BookMarked className="size-4" />
                  <span>{contentData.filter(c => c.category === 'articles').length} Articles</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Video className="size-4" />
                  <span>{contentData.filter(c => c.category === 'videos').length} Videos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PlayCircle className="size-4" />
                  <span>{contentData.filter(c => c.category === 'webinars').length} Webinars</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="size-4" />
                  <span>{contentData.filter(c => c.category === 'reports').length} Reports</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8"
        >
          <div className="flex-1 w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Search articles, topics, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-nest-primary/30 focus:border-nest-primary/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(['all', 'articles', 'videos', 'webinars', 'reports'] as const).map((cat) => {
              const config = cat === 'all' ? { icon: <BookOpen className="size-3.5" />, label: 'All' } : categoryConfig[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                    activeCategory === cat
                      ? 'bg-nest-primary text-white shadow-sm shadow-nest-primary/25'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {config.icon}
                  {config.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <button className="group w-full text-left">
                <Card className="overflow-hidden p-0 gap-0 nest-card-hover border-border/50 hover:border-nest-primary/20 h-full">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Type badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <Badge className="bg-nest-primary/90 text-white border-0 text-[10px] gap-1">
                        {categoryConfig[item.category].icon}
                        {categoryConfig[item.category].label}
                      </Badge>
                    </div>
                    {/* Play icon for videos/webinars */}
                    {['videos', 'webinars'].includes(item.category) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                          <PlayCircle className="size-6 text-white" />
                        </div>
                      </div>
                    )}
                    {/* Bottom info */}
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-black/50 text-white border-0 text-[10px] backdrop-blur-sm gap-1">
                        <Clock className="size-3" />
                        {item.readTime}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold leading-tight mb-1 line-clamp-2 group-hover:text-nest-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{item.author}</span>
                        <Badge variant="secondary" className={cn('text-[10px]', levelColors[item.level])}>
                          {item.level}
                        </Badge>
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          ))}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="size-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No content found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
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
