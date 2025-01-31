import React, { useState, useRef } from 'react';

interface FileUploadProps {
    onUploadSuccess: (flashcards: any[]) => void;
    onUploadError: (error: string) => void;
}

// If VITE_API_URL is empty, use relative path
const API_BASE = import.meta.env.VITE_API_URL || '';

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!file.type.match('application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            onUploadError('Please upload a PDF or Word document');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            onUploadError(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const response = await fetch(`${API_BASE}/api/flashcards/process-document`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            if (data.success) {
                onUploadSuccess(data.flashcards);
            } else {
                onUploadError(data.error || 'Failed to process document');
            }
        } catch (error) {
            onUploadError('Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10">
            <div
                className={`p-8 border-2 border-dashed rounded-lg transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx"
                />
                {isUploading ? (
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-2 text-gray-600">Processing your document...</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="mb-4">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <p className="text-lg text-gray-700 font-medium">
                            Drag and drop your document here, or{' '}
                            <button
                                className="text-blue-500 hover:text-blue-600 font-semibold"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                browse
                            </button>
                        </p>
                        <div className="mt-4 space-y-1">
                            <p className="text-sm text-gray-500">
                                Supported formats: PDF, DOC, DOCX
                            </p>
                            <p className="text-sm text-gray-500">
                                Maximum file size: 10MB
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload; 