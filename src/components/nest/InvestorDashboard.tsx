'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  Wallet as WalletIcon,
  Home,
  ChevronLeft,
  ChevronRight,
  Activity,
  User,
  LogOut,
  Menu,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/nest-utils';
import InvestorOverview from './InvestorOverview';
import PortfolioView from './PortfolioView';
import WalletView from './WalletView';
import ProfileView from './ProfileView';

type InvestorView = 'overview' | 'portfolio' | 'wallet' | 'profile';

interface InvestorNavItem {
  label: string;
  view: InvestorView;
  icon: React.ReactNode;
}

const investorNavItems: InvestorNavItem[] = [
  { label: 'Overview', view: 'overview', icon: <LayoutDashboard className="size-4" /> },
  { label: 'Portfolio', view: 'portfolio', icon: <Briefcase className="size-4" /> },
  { label: 'Wallet', view: 'wallet', icon: <WalletIcon className="size-4" /> },
  { label: 'Profile', view: 'profile', icon: <User className="size-4" /> },
];

interface InvestorDashboardProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    status: string;
  };
}

export default function InvestorDashboard({ user }: InvestorDashboardProps) {
  const [currentView, setCurrentView] = useState<InvestorView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleNav = (view: InvestorView) => {
    setCurrentView(view);
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const userInitials = user.firstName?.[0] || user.email[0];

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const renderSidebar = (mobile: boolean) => (
    <div className={cn('flex flex-col h-full', mobile && 'pt-4')}>
      {/* Logo */}
      <a
        href="/"
        className={cn(
          'flex items-center gap-2.5 px-5 text-left',
          mobile ? 'mb-6' : 'mb-8 pt-6'
        )}
      >
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-nest-primary/20 px-3 py-1.5 rounded-full border border-slate-200 dark:border-nest-primary/30">
          <img
            src="/nuloafrica-newlogo-complete.png"
            alt="NuloAfrica"
            className="h-6 w-auto object-contain dark:hidden"
          />
          <img
            src="/nuloafrica-newlightlogo-complete.png"
            alt="NuloAfrica"
            className="h-6 w-auto object-contain hidden dark:block"
          />
          <span className="text-lg font-bold text-foreground dark:text-nest-primary">
            <span className="text-nest-accent">|</span> NEST
          </span>
        </div>
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={toggleSidebar}
          >
            <ChevronRight className="size-4" />
          </Button>
        )}
      </a>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {investorNavItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => handleNav(item.view)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-nest-primary/10 text-nest-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {item.icon}
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-nest-primary" />
              )}
            </button>
          );
        })}
      </nav>

      <Separator className="opacity-50" />

      {/* Verification Status Card */}
      <div className="p-4">
        <div
          className={cn(
            'p-3 rounded-lg border',
            user.status === 'VERIFIED'
              ? 'bg-emerald-50 border-emerald-200'
              : user.status === 'PENDING'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-red-50 border-red-200'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                user.status === 'VERIFIED'
                  ? 'bg-emerald-500'
                  : user.status === 'PENDING'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-red-500'
              )}
            />
            <span className="text-xs font-semibold">
              {user.status === 'VERIFIED'
                ? 'Verified'
                : user.status === 'PENDING'
                  ? 'Pending Verification'
                  : 'Account Issue'}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {user.status === 'VERIFIED'
              ? 'You can invest in properties'
              : user.status === 'PENDING'
                ? 'Admin review in progress'
                : 'Contact support'}
          </p>
        </div>
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
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={toggleSidebar}
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
                onClick={toggleSidebar}
              >
                <Menu className="size-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  {investorNavItems.find((i) => i.view === currentView)?.label ||
                    'Dashboard'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {currentView === 'overview'
                    ? 'Your investment overview'
                    : currentView === 'portfolio'
                      ? 'Track your real estate investments'
                      : currentView === 'wallet'
                        ? 'Manage your wallet and transactions'
                        : 'Manage your account settings'}
                </p>
              </div>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-10 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-nest-primary text-white text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                    {userName}
                  </span>
                  <ChevronLeft className="hidden sm:inline size-4 rotate-[-90deg]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNav('overview')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Account</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* View Content */}
          {currentView === 'overview' && <InvestorOverview user={user} />}
          {currentView === 'portfolio' && <PortfolioView />}
          {currentView === 'wallet' && <WalletView />}
          {currentView === 'profile' && <ProfileView user={user} />}
        </div>
      </main>
    </div>
  );
}
