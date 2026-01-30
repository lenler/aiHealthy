import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DietState {
  aiAdvice: string[]
  targetCalories: number
  lastFetchDate: string
  setAiData: (advice: string[], targetCalories: number) => void
  updateLastFetchDate: (date: string) => void
}

const useDietStore = create<DietState>()(
  persist(
    (set) => ({
      aiAdvice: [],
      targetCalories: 2000,
      lastFetchDate: '',
      setAiData: (advice, targetCalories) => set({ aiAdvice: advice, targetCalories }),
      updateLastFetchDate: (date) => set({ lastFetchDate: date }),
    }),
    {
      name: 'diet-storage', // name of the item in the storage (must be unique)
    }
  )
)

export default useDietStore
