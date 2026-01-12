'use client';

import React, { useRef, useState, useCallback } from 'react';
import { DiseaseDetectionResult } from '@/lib/diseaseDetectionAPI';
import DetectionResultsPanel from './DetectionResultsPanel';

interface EnhancedImageUploadProps {
    onResult?: (result: DiseaseDetectionResult) => void;
}

export default function EnhancedImageUpload({ onResult }: EnhancedImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<DiseaseDetectionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);

    const processFile = useCallback((file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file (JPG, PNG, WebP)');
            return false;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image size must be less than 10MB');
            return false;
        }

        setSelectedImage(file);
        setError(null);
        setResult(null);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        return true;
    }, []);

    const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
    }, [processFile]);

    const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragCounter(prev => prev + 1);
        if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
            setIsDragActive(true);
        }
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragCounter(prev => {
            const newCounter = prev - 1;
            if (newCounter === 0) {
                setIsDragActive(false);
            }
            return newCounter;
        });
    }, []);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(false);
        setDragCounter(0);

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                processFile(file);
            } else {
                setError('Please drop a valid image file (JPG, PNG, WebP)');
            }
        }
    }, [processFile]);

    const analyzeImage = useCallback(async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedImage);

            const response = await fetch('/api/detect-disease', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: DiseaseDetectionResult = await response.json();
            setResult(data);

            // Call parent callback if provided
            if (onResult) {
                onResult(data);
            }
        } catch (error) {
            console.error('Error analyzing image:', error);
            setError('Failed to analyze image. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [selectedImage, onResult]);

    const resetUpload = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setResult(null);
        setError(null);
        setIsDragActive(false);
        setDragCounter(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Upload Area */}
            <div className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${result ? 'hidden md:block' : ''}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Upload Plant Image</h3>
                        <p className="text-sm text-gray-500">Drag & drop or browse to analyze your crop for diseases</p>
                    </div>
                </div>

                {!selectedImage ? (
                    <div
                        ref={dropZoneRef}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={triggerFileSelect}
                        className={`
              relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
              transition-all duration-300 ease-out
              ${isDragActive
                                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 scale-[1.02] shadow-lg shadow-green-100'
                                : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-gradient-to-br hover:from-green-50/50 hover:to-emerald-50/50'}
            `}
                    >
                        {/* Animated background elements */}
                        <div className={`absolute inset-0 rounded-2xl overflow-hidden pointer-events-none ${isDragActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                            <div className="absolute top-0 left-0 w-20 h-20 bg-green-200/30 rounded-full blur-2xl animate-pulse"></div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl animate-pulse delay-75"></div>
                        </div>

                        <div className="relative space-y-4">
                            {/* Icon */}
                            <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragActive
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-110'
                                : 'bg-gradient-to-br from-gray-200 to-gray-300'
                                }`}>
                                {isDragActive ? (
                                    <svg className="w-10 h-10 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                ) : (
                                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                )}
                            </div>

                            {/* Text */}
                            <div>
                                <p className={`text-xl font-semibold transition-colors duration-300 ${isDragActive ? 'text-green-700' : 'text-gray-700'
                                    }`}>
                                    {isDragActive ? 'Drop your image here!' : 'Drag & drop your plant image here'}
                                </p>
                                <p className="text-gray-500 mt-2">
                                    or <span className="text-green-600 font-medium hover:text-green-700">click to browse</span> from your device
                                </p>
                            </div>

                            {/* File info */}
                            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    JPG, PNG, WebP
                                </span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                    </svg>
                                    Max 10MB
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Image Preview */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-50"></div>
                            <div className="relative bg-gray-100 rounded-2xl p-2 border border-gray-200">
                                <img
                                    src={imagePreview || ''}
                                    alt="Selected plant"
                                    className="w-full max-h-80 object-contain rounded-xl"
                                />
                                <button
                                    onClick={resetUpload}
                                    className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white rounded-full p-2 hover:bg-red-600 transition-all duration-200 shadow-lg hover:scale-110"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Image Info */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{selectedImage.name}</p>
                                        <p className="text-sm text-gray-500">{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                        Ready to analyze
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                />
            </div>

            {/* Action Buttons */}
            {selectedImage && !result && (
                <div className="flex justify-center gap-4">
                    <button
                        onClick={analyzeImage}
                        disabled={isAnalyzing}
                        className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:-translate-y-0.5"
                    >
                        {isAnalyzing ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="font-semibold">Analyzing Image...</span>
                            </>
                        ) : (
                            <>
                                <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="font-semibold">Detect Diseases</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={resetUpload}
                        className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 font-medium"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Upload New
                    </button>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-red-800 font-semibold">Error Occurred</p>
                            <p className="text-red-600 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Display with new Panel */}
            {result && (
                <div className="animate-fade-in space-y-6">
                    <DetectionResultsPanel
                        result={result}
                        thumbnail={imagePreview || undefined}
                    />

                    <div className="flex justify-center">
                        <button
                            onClick={resetUpload}
                            className="px-8 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Analyze Another Image
                        </button>
                    </div>
                </div>
            )}

            {/* Tips Section - Hide when result is shown */}
            {!result && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                    <h4 className="flex items-center gap-2 font-semibold text-blue-800 mb-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Tips for Best Results
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            Use clear, well-lit photos
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            Focus on affected areas
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            Avoid blurry or dark images
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            Include close-up shots
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
