import { useState } from 'react';
import { useFlashcardStore } from '../store/flashcardStore';
import FileUpload from './FileUpload';

export default function CreateFlashcards() {
    const [error, setError] = useState<string | null>(null);
    const addFlashcard = useFlashcardStore((state) => state.addFlashcard);

    const handleUploadSuccess = (flashcards: any[]) => {
        flashcards.forEach(flashcard => {
            addFlashcard({
                question: flashcard.question,
                answer: flashcard.answer,
                difficulty: flashcard.difficulty === 'easy' ? 1 : flashcard.difficulty === 'medium' ? 2 : 3,
            });
        });
    };

    const handleUploadError = (error: string) => {
        setError(error);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Create Flashcards</h1>
                <p className="mt-3 text-lg text-gray-500">
                    Upload your documents and let AI create flashcards for you
                </p>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            <div className="mt-10">
                <FileUpload
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                    showProgress={true}
                />
            </div>
        </div>
    );
} 