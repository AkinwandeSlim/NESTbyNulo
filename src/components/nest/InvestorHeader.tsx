'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Home,
  Search,
  Briefcase,
  GraduationCap,
  Moon,
  Sun,
  Menu,
  User,
  Settings,
  LogOut,
  Wallet,
  TrendingUp,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useNestStore, type View } from '@/lib/nest-store';
import { cn } from '@/lib/nest-utils';

interface NavItem {
  label: string;
  view: View;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Browse', view: 'browse', icon: <Search className="size-4" /> },
  { label: 'Portfolio', view: 'portfolio', icon: <Briefcase className="size-4" /> },
  { label: 'Wallet', view: 'wallet', icon: <Wallet className="size-4" /> },
  { label: 'Academy', view: 'academy', icon: <GraduationCap className="size-4" /> },
];

export default function InvestorHeader() {
  const { currentView, setView } = useNestStore();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── dev_gstack merge (Feature #1): real session state ──
  // The header was purely decorative (hard-coded "Adebayo Ogunlesi"). It now
  // reads the signed-in investor from GET /api/auth/me, which also reports the
  // auth `mode` so the TEST MODE label can state which path is running.
  const [session, setSession] = useState<{
    firstName: string;
    lastName: string | null;
    email: string;
    status: string;
    role: string;
    wallet: { balanceKobo: number };
  } | null>(null);
  const [authMode, setAuthMode] = useState<string>('DEV_FALLBACK');

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then(async (res) => {
        const data = await res.json();
        if (!active) return;
        if (data?.mode) setAuthMode(data.mode);
        setSession(res.ok ? data.user : null);
      })
      .catch(() => {
        if (active) setSession(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
    window.location.reload();
  };

  const initials =
    (session?.firstName?.[0] ?? '') + (session?.lastName?.[0] ?? '');
  const displayName = session
    ? [session.firstName, session.lastName].filter(Boolean).join(' ')
    : '';

  const handleNav = (view: View) => {
    setView(view);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNav('browse')}
            className="flex items-center gap-2 group"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-slate-100 dark:bg-nest-primary/20 px-3 py-1.5 rounded-full border border-slate-200 dark:border-nest-primary/30"
            >
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
              <span className={cn(
                'text-lg font-bold tracking-tight',
                scrolled ? 'text-nest-primary' : 'text-foreground dark:text-white'
              )}>
                <span className="text-nest-accent">|</span> NEST
              </span>
            </motion.div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.view}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNav(item.view)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  currentView === item.view
                    ? scrolled ? 'text-nest-primary' : 'text-white'
                    : scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'
                )}
              >
                {item.icon}
                {item.label}
                {currentView === item.view && (
                  <motion.div
                    layoutId="nav-indicator"
                    className={cn(
                      'absolute inset-0 rounded-lg',
                      scrolled ? 'bg-nest-primary/10' : 'bg-white/15'
                    )}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* TEST MODE label — this build uses demo funds and has no live payments */}
            <span
              className={cn(
                'hidden lg:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
                scrolled
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-white/30 bg-white/10 text-white'
              )}
              title={`Auth mode: ${authMode} · demo funds only`}
            >
              Test Mode
            </span>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
                scrolled
                  ? 'border-border bg-background text-muted-foreground hover:text-foreground'
                  : 'border-white/20 bg-white/10 text-white/80 hover:text-white hover:bg-white/20'
              )}
            >
              {mounted && (
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="size-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="size-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              {!mounted && <Sun className="size-4" />}
            </motion.button>

            {/* Signed-out: real Feature #1 auth entry points */}
            {!session && (
              <div className="flex items-center gap-1">
                <Link
                  href="/sign-in"
                  className={cn(
                    'hidden sm:inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors',
                    scrolled
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  )}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-9 items-center rounded-lg bg-nest-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-nest-primary/90"
                >
                  Create account
                </Link>
              </div>
            )}

            {/* Admin Toggle - Only show for admin users */}
            {session?.role === 'ADMIN' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNav('admin')}
                className={cn(
                  'hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  currentView === 'admin' || currentView.startsWith('admin-')
                    ? scrolled ? 'text-nest-primary' : 'text-white'
                    : scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'
                )}
              >
                <LayoutDashboard className="size-4" />
                <span>Admin</span>
              </motion.button>
            )}

            {/* User Dropdown - Only show when signed in */}
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="bg-nest-primary/10 text-nest-primary text-sm font-semibold">
                        {initials || <User className="size-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{session.email}</p>
                      <span
                        className={cn(
                          'mt-1 w-fit rounded-full border px-2 py-0.5 text-[10px] font-bold',
                          session.status === 'VERIFIED'
                            ? 'border-green-300 bg-green-50 text-green-800'
                            : session.status === 'REJECTED'
                              ? 'border-red-300 bg-red-50 text-red-800'
                              : 'border-amber-300 bg-amber-50 text-amber-800'
                        )}
                      >
                        {session.status}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      <TrendingUp className="mr-2 size-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNav('portfolio')}>
                    <Briefcase className="mr-2 size-4" />
                    Portfolio
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNav('wallet')}>
                    <Wallet className="mr-2 size-4" />
                    Wallet
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={signOut}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetHeader className="p-6 pb-4">
                  <SheetTitle className="flex items-center gap-2">
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
                  </SheetTitle>
                </SheetHeader>
                <Separator />
                <div className="p-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="bg-nest-primary/10 text-nest-primary text-sm font-semibold">
                        AO
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Adebayo Ogunlesi</p>
                      <p className="text-xs text-muted-foreground">Investor</p>
                    </div>
                  </div>
                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <SheetClose key={item.view} asChild>
                        <button
                          onClick={() => handleNav(item.view)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                            currentView === item.view
                              ? 'bg-nest-primary/10 text-nest-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )}
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      </SheetClose>
                    ))}
                    {/* Admin link - Only show for admin users */}
                    {session?.role === 'ADMIN' && (
                      <>
                        <Separator className="my-2" />
                        <SheetClose asChild>
                          <button
                            onClick={() => handleNav('admin')}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                              currentView === 'admin' || currentView.startsWith('admin-')
                                ? 'bg-nest-primary/10 text-nest-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            )}
                          >
                            <LayoutDashboard className="size-4" />
                            Admin
                          </button>
                        </SheetClose>
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
