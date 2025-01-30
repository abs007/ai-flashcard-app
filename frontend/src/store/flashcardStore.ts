import { create } from 'zustand';

export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    lastReviewed?: Date;
    nextReview?: Date;
    difficulty: number; // 1-5, where 1 is easiest and 5 is hardest
    correctCount: number;
    incorrectCount: number;
}

interface FlashcardStore {
    flashcards: Flashcard[];
    currentDeck: Flashcard[];
    addFlashcard: (flashcard: Omit<Flashcard, 'id' | 'correctCount' | 'incorrectCount'>) => void;
    updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
    removeFlashcard: (id: string) => void;
    setCurrentDeck: (flashcards: Flashcard[]) => void;
}

export const useFlashcardStore = create<FlashcardStore>((set) => ({
    flashcards: [],
    currentDeck: [],
    addFlashcard: (flashcard) =>
        set((state) => ({
            flashcards: [
                ...state.flashcards,
                {
                    ...flashcard,
                    id: Math.random().toString(36).substring(7),
                    correctCount: 0,
                    incorrectCount: 0
                },
            ],
        })),
    updateFlashcard: (id, updates) =>
        set((state) => {
            const updatedFlashcards = state.flashcards.map((f) =>
                f.id === id ? { ...f, ...updates } : f
            );
            const updatedCurrentDeck = state.currentDeck.map((f) =>
                f.id === id ? { ...f, ...updates } : f
            );
            return {
                flashcards: updatedFlashcards,
                currentDeck: updatedCurrentDeck,
            };
        }),
    removeFlashcard: (id) =>
        set((state) => ({
            flashcards: state.flashcards.filter((f) => f.id !== id),
        })),
    setCurrentDeck: (flashcards) =>
        set(() => ({
            currentDeck: flashcards,
        })),
})); 