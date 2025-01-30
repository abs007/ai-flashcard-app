import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Flashcard from './components/Flashcard';

interface FlashcardType {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const App: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = (newFlashcards: FlashcardType[]) => {
    setFlashcards(newFlashcards);
    setCurrentIndex(0);
    setError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setFlashcards([]);
  };

  const handleCorrect = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleIncorrect = () => {
    if (currentIndex < flashcards.length - 1) {
      // Move the current card to the end of the deck
      const updatedFlashcards = [...flashcards];
      const currentCard = updatedFlashcards.splice(currentIndex, 1)[0];
      updatedFlashcards.push(currentCard);
      setFlashcards(updatedFlashcards);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Flashcard Generator
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {flashcards.length === 0 ? (
          <>
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
            {error && (
              <div className="max-w-xl mx-auto mt-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <div className="mb-4 text-center text-gray-600">
              Card {currentIndex + 1} of {flashcards.length}
            </div>
            <Flashcard
              {...flashcards[currentIndex]}
              onCorrect={handleCorrect}
              onIncorrect={handleIncorrect}
            />
            {currentIndex === flashcards.length - 1 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setFlashcards([]);
                    setCurrentIndex(0);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Upload New Document
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
