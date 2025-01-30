export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    lastReviewed?: Date;
    nextReview?: Date;
    correctCount: number;
    incorrectCount: number;
    tags: string[];
    sourceDocument: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface FlashcardDeck {
    id: string;
    name: string;
    description: string;
    flashcards: string[]; // Array of Flashcard IDs
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AIProcessingResult {
    success: boolean;
    flashcards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[];
    error?: string;
} 