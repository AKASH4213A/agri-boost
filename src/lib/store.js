// Zustand Store (Digital Tray): Files ko ek page se doosre page tak le jaane ke liye.

import { create } from 'zustand';

export const useUploadStore = create((set) => ({
  soilReportFile: null,
  cropImageFile: null,
  setSoilReportFile: (file) => set({ soilReportFile: file }),
  setCropImageFile: (file) => set({ cropImageFile: file }),
}));