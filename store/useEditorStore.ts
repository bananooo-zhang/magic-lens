import { create } from 'zustand';

export interface HistoryItem {
  id: string;
  image: string; // Base64
  prompt: string; // User's prompt that generated this image
  timestamp: number;
}

interface EditorState {
  // Data
  originalImage: string | null;
  history: HistoryItem[];
  currentIndex: number; // -1 for original, 0...N for history
  isProcessing: boolean;
  
  // Actions
  setOriginalImage: (image: string) => void;
  addHistoryItem: (image: string, prompt: string) => void;
  setCurrentIndex: (index: number) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  reset: () => void;
  
  // Helpers
  getCurrentImage: () => string | null;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  originalImage: null,
  history: [],
  currentIndex: -1,
  isProcessing: false,

  setOriginalImage: (image) => set({ 
    originalImage: image, 
    history: [], 
    currentIndex: -1 
  }),

  addHistoryItem: (image, prompt) => set((state) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      image,
      prompt,
      timestamp: Date.now(),
    };
    // Append new item
    const newHistory = [...state.history, newItem];
    return {
      history: newHistory,
      currentIndex: newHistory.length - 1 // Auto switch to new image
    };
  }),

  setCurrentIndex: (index) => set({ currentIndex: index }),
  
  setIsProcessing: (isProcessing) => set({ isProcessing }),

  reset: () => set({
    originalImage: null,
    history: [],
    currentIndex: -1,
    isProcessing: false
  }),

  getCurrentImage: () => {
    const state = get();
    if (state.currentIndex === -1) return state.originalImage;
    if (state.history[state.currentIndex]) return state.history[state.currentIndex].image;
    return state.originalImage;
  }
}));
