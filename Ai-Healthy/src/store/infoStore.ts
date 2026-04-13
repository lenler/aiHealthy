import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Key } from "react";

interface AIDraftItem {
  key: Key;
  foodName: string;
  calories: number;
}

interface infoState {
  aiAdvice: string[];
  targetCalories: number;
  lastFetchDate: string;
  draftData: AIDraftItem[];
  setAiData: (advice: string[], targetCalories: number) => void;
  updateLastFetchDate: (date: string) => void;
  deleteDraftData: () => void;
  setDraft: (draft: AIDraftItem[]) => void;
}

const useInfoStore = create<infoState>()(
  persist(
    (set) => ({
      aiAdvice: [],
      targetCalories: 2000,
      draftData: [],
      lastFetchDate: "",
      setAiData: (advice, targetCalories) =>
        set({ aiAdvice: advice, targetCalories }),
      setDraft: (draft: AIDraftItem[]) => set({ draftData: draft }),
      updateLastFetchDate: (date) => set({ lastFetchDate: date }),
      deleteDraftData: () => set({ draftData: [] }),
    }),
    {
      name: "diet-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useInfoStore;
