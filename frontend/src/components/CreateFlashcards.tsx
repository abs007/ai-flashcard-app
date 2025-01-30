import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { useFlashcardStore } from '../store/flashcardStore';

export default function CreateFlashcards() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const addFlashcard = useFlashcardStore((state) => state.addFlashcard);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsProcessing(true);
        setUploadProgress(0);

        try {
            // Simulate file upload progress
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 95) {
                        clearInterval(interval);
                        return prev;
                    }
                    return prev + 5;
                });
            }, 100);

            // TODO: Implement actual file upload and processing
            // This is where we'll add the API call to process the document

            // For now, let's simulate some flashcards being created
            setTimeout(() => {
                addFlashcard({
                    question: "What is the capital of France?",
                    answer: "Paris",
                    difficulty: 1,
                });
                addFlashcard({
                    question: "What is the largest planet in our solar system?",
                    answer: "Jupiter",
                    difficulty: 1,
                });

                setUploadProgress(100);
                setIsProcessing(false);
                clearInterval(interval);
            }, 2000);
        } catch (error) {
            console.error('Error processing file:', error);
            setIsProcessing(false);
        }
    }, [addFlashcard]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Create Flashcards</h1>
                <p className="mt-3 text-lg text-gray-500">
                    Upload your documents and let AI create flashcards for you
                </p>
            </div>

            <div className="mt-10">
                <div
                    {...getRootProps()}
                    className={`max-w-lg mx-auto flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                        }`}
                >
                    <div className="space-y-1 text-center">
                        <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                            <input {...getInputProps()} />
                            <p className="pl-1">
                                Drag and drop your files here, or{' '}
                                <button className="text-primary-600 hover:text-primary-500">
                                    browse
                                </button>
                            </p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                    </div>
                </div>

                {isProcessing && (
                    <div className="mt-5">
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                                        Processing
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-primary-600">
                                        {uploadProgress}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                                <div
                                    style={{ width: `${uploadProgress}%` }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 