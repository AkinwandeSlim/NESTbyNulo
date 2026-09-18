'use client';

import { useEffect } from 'react';
import { useNestStore, type View } from '@/lib/nest-store';
import AdminDashboard from '@/components/nest/AdminDashboard';

/**
 * Bridges the real /admin/* routes to the existing Zustand-driven
 * AdminDashboard. The route decides WHICH panel is shown (so /admin/crm is
 * deep-linkable and server-gated); the dashboard keeps its own tab state.
 */
export default function AdminRouteShell({ view }: { view: View }) {
  const currentView = useNestStore((s) => s.currentView);
  const setView = useNestStore((s) => s.setView);

  useEffect(() => {
    if (currentView !== view) setView(view);
  }, [currentView, view, setView]);

  return <AdminDashboard />;
}
