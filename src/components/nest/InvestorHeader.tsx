'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Search,
  Briefcase,
  GraduationCap,
  Moon,
  Sun,
  Menu,
  User,
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
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import NestBrand from './NestBrand';
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

const subscribeToHydration = () => () => {};

export default function InvestorHeader() {
  const { currentView, setView } = useNestStore();
  const { resolvedTheme: theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
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
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 text-foreground backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <button onClick={() => handleNav('browse')} aria-label="NEST by Nulo Africa home" className="inline-flex min-h-11 shrink-0 items-center rounded-lg">
            <NestBrand />
          </button>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.view}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNav(item.view)}
                aria-current={currentView === item.view ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-11 items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  currentView === item.view
                    ? 'text-nest-primary-dark dark:text-nest-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.icon}
                {item.label}
                {currentView === item.view && (
                  <motion.div
                    layoutId="nav-indicator"
                    className={cn(
                      'absolute inset-0 rounded-lg',
                      'bg-nest-primary/10'
                    )}
                    transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* TEST MODE label — this build uses demo funds and has no live payments */}
            <span
              className={cn(
                'hidden xl:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
                'border-amber-300/50 bg-amber-500/10 text-amber-800 dark:text-amber-200'
              )}
              title={`Auth mode: ${authMode} · demo funds only`}
            >
              Test Mode
            </span>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={
                mounted
                  ? theme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                  : 'Toggle theme'
              }
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                'h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                session ? 'hidden sm:flex' : 'flex'
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
                    'hidden sm:inline-flex h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors',
                    'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="hidden sm:inline-flex h-11 items-center rounded-lg bg-nest-primary-dark px-3 text-sm font-semibold text-white transition-colors hover:bg-nest-primary/90"
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
                    ? 'text-nest-primary-dark dark:text-nest-primary'
                    : 'text-muted-foreground hover:text-foreground'
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
                  <Button aria-label="Open account menu" variant="ghost" className="relative h-11 w-11 rounded-full p-0">
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
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden h-11 w-11">
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(22rem,100%)] gap-0 overflow-y-auto p-0 pb-[env(safe-area-inset-bottom)] data-[state=open]:duration-200 data-[state=closed]:duration-150 [&>button]:size-11 [&>button]:grid [&>button]:place-items-center [&>button]:top-2 [&>button]:right-2">
                <SheetHeader className="p-6 pb-4">
                  <SheetTitle className="pr-8"><NestBrand /></SheetTitle>
                  <SheetDescription className="pt-3">Your next step in property ownership.</SheetDescription>
                </SheetHeader>
                <Separator />
                <div className="p-4">
                  {session ? (
                    <div className="mb-4 flex items-center gap-3 rounded-xl bg-muted p-3">
                      <Avatar className="shrink-0"><AvatarFallback>{initials || <User className="size-4" />}</AvatarFallback></Avatar>
                      <div className="min-w-0"><p className="truncate text-sm font-semibold">{displayName}</p><p className="truncate text-xs text-muted-foreground">{session.email}</p></div>
                    </div>
                  ) : (
                    <div className="mb-5 grid grid-cols-2 gap-2">
                      <SheetClose asChild><Link href="/sign-in" className="flex min-h-11 items-center justify-center rounded-lg border border-border text-sm font-semibold">Sign in</Link></SheetClose>
                      <SheetClose asChild><Link href="/sign-up" className="flex min-h-11 items-center justify-center rounded-lg bg-nest-primary-dark px-2 text-sm font-semibold text-white">Create account</Link></SheetClose>
                    </div>
                  )}
                  <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <SheetClose key={item.view} asChild>
                        <button
                          onClick={() => handleNav(item.view)}
                aria-current={currentView === item.view ? 'page' : undefined}
                          className={cn(
                            'flex min-h-12 items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
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
                              'flex min-h-12 items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
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
                  <div className="mt-6 border-t border-border pt-4">
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted">
                      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                      {theme === 'dark' ? 'Light appearance' : 'Dark appearance'}
                    </button>
                    <p className="px-3 pt-3 text-xs text-muted-foreground">Test mode · Demo funds only</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
