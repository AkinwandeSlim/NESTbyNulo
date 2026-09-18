'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useNestStore } from '@/lib/nest-store';
import InvestorHeader from '@/components/nest/InvestorHeader';
import BrowseView from '@/components/nest/BrowseView';
import PropertyDetailView from '@/components/nest/PropertyDetailView';
import InvestmentCheckout from '@/components/nest/InvestmentCheckout';
import PortfolioView from '@/components/nest/PortfolioView';
import WalletView from '@/components/nest/WalletView';
import AcademyView from '@/components/nest/AcademyView';
import AdminDashboard from '@/components/nest/AdminDashboard';

export default function Home() {
  const { currentView } = useNestStore();

  const isAdminView = currentView === 'admin' || currentView.startsWith('admin-');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header - hidden in admin views (admin has its own nav) */}
      {!isAdminView && <InvestorHeader />}

      {/* View Router */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentView === 'browse' && <BrowseView />}
          {currentView === 'property-detail' && <PropertyDetailView />}
          {currentView === 'invest' && <InvestmentCheckout />}
          {currentView === 'portfolio' && <PortfolioView />}
          {currentView === 'wallet' && <WalletView />}
          {currentView === 'transactions' && <WalletView />}
          {currentView === 'academy' && <AcademyView />}
          {(currentView === 'admin' || currentView.startsWith('admin-')) && <AdminDashboard />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
