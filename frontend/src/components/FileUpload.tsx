import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
    onUploadSuccess: (flashcards: any[]) => void;
    onUploadError: (error: string) => void;
    showProgress?: boolean;
}

// If VITE_API_URL is empty, use relative path
const API_BASE = import.meta.env.VITE_API_URL || '';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const FileUpload: React.FC<FileUploadProps> = ({
    onUploadSuccess,
    onUploadError,
    showProgress = true
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileUpload = async (file: File) => {
        const requestId = Math.random().toString(36).substring(7);
        // DEBUG-CHECKPOINT-A: File upload started
        console.log('DEBUG-CHECKPOINT-A: Starting file upload process', {
            requestId,
            fileName: file.name
        });

        if (file.size > MAX_FILE_SIZE) {
            const error = `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
            // DEBUG-CHECKPOINT-B: File size validation failed
            console.log('DEBUG-CHECKPOINT-B: File size validation failed', {
                requestId,
                fileSize: file.size,
                maxSize: MAX_FILE_SIZE
            });
            onUploadError(error);
            return;
        }

        // DEBUG-CHECKPOINT-C: Creating FormData
        console.log('DEBUG-CHECKPOINT-C: Creating FormData', { requestId });
        const formData = new FormData();
        formData.append('file', file, file.name);

        // Log form data contents
        console.log('DEBUG-CHECKPOINT-D: FormData created', {
            requestId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            formDataKeys: Array.from(formData.keys())
        });

        setIsUploading(true);
        setUploadProgress(0);

        const interval = showProgress ? setInterval(() => {
            setUploadProgress(prev => Math.min(prev + 5, 95));
        }, 100) : null;

        try {
            const url = `${API_BASE}/api/flashcards/process-document`;
            // DEBUG-CHECKPOINT-E: Initiating fetch request
            console.log('DEBUG-CHECKPOINT-E: Initiating fetch request', {
                requestId,
                url,
                method: 'POST'
            });

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Request-ID': requestId
                },
            });

            // DEBUG-CHECKPOINT-F: Received response
            console.log('DEBUG-CHECKPOINT-F: Received response', {
                requestId,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            const contentType = response.headers.get('content-type');
            // DEBUG-CHECKPOINT-G: Checking response content type
            console.log('DEBUG-CHECKPOINT-G: Content type check', {
                requestId,
                contentType
            });

            let responseData;
            try {
                const text = await response.text();
                // DEBUG-CHECKPOINT-H: Raw response received
                console.log('DEBUG-CHECKPOINT-H: Raw response', {
                    requestId,
                    text
                });
                responseData = text ? JSON.parse(text) : null;
            } catch (parseError) {
                // DEBUG-CHECKPOINT-I: Response parsing failed
                console.error('DEBUG-CHECKPOINT-I: Parse error', {
                    requestId,
                    error: parseError
                });
                throw new Error('Invalid response format');
            }

            if (!response.ok) {
                // DEBUG-CHECKPOINT-J: Request failed
                console.error('DEBUG-CHECKPOINT-J: Request failed', {
                    requestId,
                    status: response.status,
                    data: responseData
                });
                throw new Error(responseData?.error || `HTTP error! status: ${response.status}`);
            }

            if (!contentType?.includes('application/json')) {
                // DEBUG-CHECKPOINT-K: Invalid content type
                console.error('DEBUG-CHECKPOINT-K: Invalid content type', {
                    requestId,
                    contentType
                });
                throw new Error('Expected JSON response but got ' + contentType);
            }

            if (responseData.success) {
                // DEBUG-CHECKPOINT-L: Upload successful
                console.log('DEBUG-CHECKPOINT-L: Success', {
                    requestId,
                    flashcardsCount: responseData.flashcards.length
                });
                setUploadProgress(100);
                onUploadSuccess(responseData.flashcards);
            } else {
                // DEBUG-CHECKPOINT-M: Upload failed with error
                console.error('DEBUG-CHECKPOINT-M: Upload failed', {
                    requestId,
                    error: responseData.error
                });
                onUploadError(responseData.error || 'Failed to process document');
            }
        } catch (error) {
            // DEBUG-CHECKPOINT-N: Exception caught
            console.error('DEBUG-CHECKPOINT-N: Exception', {
                requestId,
                error,
                stack: error instanceof Error ? error.stack : undefined
            });
            onUploadError(error instanceof Error ? error.message : 'Failed to upload file');
        } finally {
            if (interval) clearInterval(interval);
            setIsUploading(false);
            // DEBUG-CHECKPOINT-O: Process completed
            console.log('DEBUG-CHECKPOINT-O: Upload process completed', { requestId });
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            handleFileUpload(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxSize: MAX_FILE_SIZE,
        multiple: false
    });

    return (
        <div className="max-w-xl mx-auto mt-10">
            <div
                {...getRootProps()}
                className={`p-8 border-2 border-dashed rounded-lg transition-colors duration-200 
                    ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
                <input {...getInputProps()} />
                {isUploading ? (
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                        <p className="mt-2 text-gray-600">Processing your document...</p>
                        {showProgress && (
                            <div className="mt-4">
                                <div className="relative pt-1">
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                                        <div
                                            style={{ width: `${uploadProgress}%` }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
                                        />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold inline-block text-primary-600">
                                            {uploadProgress}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center">
                        <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-lg text-gray-700 font-medium mt-4">
                            Drag and drop your document here, or{' '}
                            <button className="text-primary-500 hover:text-primary-600 font-semibold">
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