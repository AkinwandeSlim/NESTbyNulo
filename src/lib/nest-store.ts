import { create } from "zustand";

export type View = 
  | "browse"
  | "property-detail"
  | "invest"
  | "portfolio"
  | "wallet"
  | "transactions"
  | "academy"
  | "admin"
  | "admin-properties"
  | "admin-opportunities"
  | "admin-crm"
  | "admin-finance"
  | "admin-analytics"
  | "admin-support";

interface NestState {
  currentView: View;
  selectedPropertySlug: string | null;
  sidebarOpen: boolean;
  adminSidebarOpen: boolean;
  setView: (view: View) => void;
  selectProperty: (slug: string | null) => void;
  toggleSidebar: () => void;
  toggleAdminSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useNestStore = create<NestState>((set) => ({
  currentView: "browse",
  selectedPropertySlug: null,
  sidebarOpen: false,
  adminSidebarOpen: false,
  setView: (view) => set({ currentView: view }),
  selectProperty: (slug) => set({ selectedPropertySlug: slug }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleAdminSidebar: () => set((s) => ({ adminSidebarOpen: !s.adminSidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
