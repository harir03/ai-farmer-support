'use client';

import React, { useRef, useState, useCallback } from 'react';

interface DetectionResult {
  success: boolean;
  diagnosis: string;
  confidence?: number;
  recommendations?: string[];
  timestamp: string;
}

interface ImageUploadProps {
  onResult?: (result: DetectionResult) => void;
}

export default function ImageUpload({ onResult }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
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
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Handle dropped file directly
        setSelectedImage(file);
        setError(null);
        setResult(null);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please drop a valid image file');
      }
    }
  }, [handleImageSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

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

      const data: DetectionResult = await response.json();
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Upload Plant Image for Analysis
        </h3>

        {!selectedImage ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={triggerFileSelect}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors duration-200"
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drop your plant image here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse files
                </p>
              </div>
              <div className="text-xs text-gray-400">
                Supports: JPG, PNG, WebP • Max size: 10MB
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative">
              <img
                src={imagePreview || ''}
                alt="Selected plant"
                className="w-full max-h-96 object-contain rounded-lg border"
              />
              <button
                onClick={resetUpload}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>📁 {selectedImage.name}</span>
                <span>📏 {(selectedImage.size / 1024 / 1024).toFixed(2)} MB</span>
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
      {selectedImage && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={analyzeImage}
            disabled={isAnalyzing}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing Image...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Analyze for Diseases</span>
              </>
            )}
          </button>

          <button
            onClick={resetUpload}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Upload Different Image
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">Error:</p>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Analysis Results
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Diagnosis:</h4>
              <div className="bg-white p-3 rounded border">
                <p className="text-gray-700 whitespace-pre-wrap">{result.diagnosis}</p>
              </div>
            </div>
            
            {result.confidence && (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Confidence Level:</h4>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{result.confidence}%</span>
                </div>
              </div>
            )}
            
            {result.recommendations && result.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Recommendations:</h4>
                <div className="bg-white rounded border">
                  <ul className="divide-y divide-gray-100">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="p-3 flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-4">
              📅 Analyzed on: {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">📸 Tips for Better Results:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use clear, well-lit photos</li>
          <li>• Focus on affected areas (leaves, stems, fruits)</li>
          <li>• Avoid blurry or dark images</li>
          <li>• Include close-up shots of symptoms</li>
          <li>• Take photos during daytime for natural lighting</li>
        </ul>
      </div>
    </div>
  );
}