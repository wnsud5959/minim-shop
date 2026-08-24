import { create } from 'zustand';

export interface ToastAction {
  label: string;
  to: string;
}

interface UiState {
  toast: { message: string; action?: ToastAction; key: number } | null;
  drawerOpen: boolean;
  showToast: (message: string, action?: ToastAction) => void;
  hideToast: () => void;
  setDrawer: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  drawerOpen: false,
  showToast: (message, action) => set({ toast: { message, action, key: Date.now() } }),
  hideToast: () => set({ toast: null }),
  setDrawer: (drawerOpen) => set({ drawerOpen }),
}));
