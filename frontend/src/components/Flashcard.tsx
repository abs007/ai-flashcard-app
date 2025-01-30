import React, { useState } from 'react';

interface FlashcardProps {
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    onCorrect: () => void;
    onIncorrect: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({
    question,
    answer,
    difficulty,
    onCorrect,
    onIncorrect,
}) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const getDifficultyColor = () => {
        switch (difficulty) {
            case 'easy':
                return 'bg-green-100';
            case 'medium':
                return 'bg-yellow-100';
            case 'hard':
                return 'bg-red-100';
            default:
                return 'bg-gray-100';
        }
    };

    return (
        <div className="max-w-md mx-auto my-4">
            <div
                className="cursor-pointer"
                onClick={handleFlip}
            >
                <div className={`p-6 rounded-lg shadow-lg ${getDifficultyColor()}`}>
                    <div className="text-sm text-gray-600 mb-2 capitalize">
                        Difficulty: {difficulty}
                    </div>
                    <div className="text-xl font-semibold">
                        {isFlipped ? answer : question}
                    </div>
                    <div className="text-sm text-gray-500 mt-4">
                        Click to {isFlipped ? 'see question' : 'reveal answer'}
                    </div>
                </div>
            </div>
            {isFlipped && (
                <div className="flex justify-center mt-4 space-x-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onIncorrect();
                            setIsFlipped(false);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Incorrect
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCorrect();
                            setIsFlipped(false);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Correct
                    </button>
                </div>
            )}
        </div>
    );
};

export default Flashcard; 