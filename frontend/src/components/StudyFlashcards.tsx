import { useState } from 'react';
import { useFlashcardStore } from '../store/flashcardStore';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Flashcard from './Flashcard';

export default function StudyFlashcards() {
    const flashcards = useFlashcardStore((state) => state.currentDeck);
    const updateFlashcard = useFlashcardStore((state) => state.updateFlashcard);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [studyComplete, setStudyComplete] = useState(false);

    const currentCard = flashcards[currentIndex];

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleCorrect = () => {
        const isLastCard = currentIndex === flashcards.length - 1;
        updateFlashcard(currentCard.id, {
            correctCount: (currentCard.correctCount || 0) + 1,
            lastReviewed: new Date(),
        });
        if (isLastCard) {
            setStudyComplete(true);
        } else {
            handleNext();
        }
    };

    const handleIncorrect = () => {
        const isLastCard = currentIndex === flashcards.length - 1;
        updateFlashcard(currentCard.id, {
            incorrectCount: (currentCard.incorrectCount || 0) + 1,
            lastReviewed: new Date(),
        });
        if (isLastCard) {
            setStudyComplete(true);
        } else {
            handleNext();
        }
    };

    if (flashcards.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900">No flashcards to study</h2>
                <p className="mt-2 text-gray-600">Create some flashcards first!</p>
            </div>
        );
    }

    if (studyComplete) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900">🎉 Great job!</h2>
                <p className="mt-2 text-gray-600">You've completed studying all the flashcards.</p>
                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => {
                            setCurrentIndex(0);
                            setStudyComplete(false);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
                    >
                        Study Again
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Upload New Document
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                        <span>Card {currentIndex + 1} of {flashcards.length}</span>
                    </div>

                    <Flashcard
                        question={currentCard.question}
                        answer={currentCard.answer}
                        difficulty={currentCard.difficulty === 1 ? 'easy' : currentCard.difficulty === 2 ? 'medium' : 'hard'}
                        onCorrect={handleCorrect}
                        onIncorrect={handleIncorrect}
                    />

                    <div className="mt-8 flex justify-between items-center">
                        <button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className={`flex items-center ${currentIndex === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-1" />
                            Previous
                        </button>

                        {currentIndex < flashcards.length - 1 && (
                            <button
                                onClick={handleNext}
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                Next
                                <ArrowRightIcon className="h-5 w-5 ml-1" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 