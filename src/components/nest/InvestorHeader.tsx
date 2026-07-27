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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
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
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nest-primary">
                <Home className="size-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-nest-primary">NEST</span>
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
                    ? 'text-nest-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.icon}
                {item.label}
                {currentView === item.view && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-nest-primary/10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Admin Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNav('admin')}
              className={cn(
                'hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                currentView === 'admin' || currentView.startsWith('admin-')
                  ? 'text-nest-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutDashboard className="size-4" />
              <span>Admin</span>
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
            >
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
            </motion.button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-nest-primary/10 text-nest-primary text-sm font-semibold">
                      AO
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Adebayo Ogunlesi</p>
                    <p className="text-xs text-muted-foreground">adebayo@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNav('portfolio')}>
                  <TrendingUp className="mr-2 size-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nest-primary">
                      <Home className="size-4 text-white" />
                    </div>
                    <span className="text-lg font-bold">
                      <span className="text-nest-primary">NEST</span>
                    </span>
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
