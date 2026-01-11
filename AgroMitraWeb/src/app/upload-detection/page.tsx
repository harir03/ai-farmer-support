'use client';

import React, { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

interface DetectionResult {
  success: boolean;
  diagnosis: string;
  confidence?: number;
  recommendations?: string[];
  timestamp: string;
}

export default function ImageUploadPage() {
  const [detectionHistory, setDetectionHistory] = useState<DetectionResult[]>([]);

  const handleNewResult = (result: DetectionResult) => {
    setDetectionHistory(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
  };

  const clearHistory = () => {
    setDetectionHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Upload & Analyze Plant Images
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your plant photos for instant AI-powered disease detection and 
            expert treatment recommendations.
          </p>
        </div>

        {/* Main Upload Component */}
        <ImageUpload onResult={handleNewResult} />

        {/* Detection History */}
        {detectionHistory.length > 0 && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Recent Analysis History</h2>
              <button
                onClick={clearHistory}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear History
              </button>
            </div>
            
            <div className="grid gap-6">
              {detectionHistory.map((result, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-800">
                      Analysis #{detectionHistory.length - index}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Diagnosis:</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {result.diagnosis.substring(0, 200)}
                        {result.diagnosis.length > 200 && '...'}
                      </p>
                    </div>
                    
                    {result.confidence && (
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700">Confidence:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${result.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{result.confidence}%</span>
                      </div>
                    )}
                    
                    {result.recommendations && result.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Key Recommendations:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {result.recommendations.slice(0, 2).map((rec, recIndex) => (
                            <li key={recIndex} className="flex items-start">
                              <span className="text-green-600 mr-1">•</span>
                              <span>{rec.substring(0, 100)}{rec.length > 100 && '...'}</span>
                            </li>
                          ))}
                          {result.recommendations.length > 2 && (
                            <li className="text-green-600 text-xs">
                              +{result.recommendations.length - 2} more recommendations
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Easy Upload</h3>
            <p className="text-gray-600 text-sm">
              Drag & drop or click to upload. Supports multiple image formats with automatic validation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Fast Analysis</h3>
            <p className="text-gray-600 text-sm">
              Advanced AI processes your images in seconds, providing detailed disease analysis.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Detailed Reports</h3>
            <p className="text-gray-600 text-sm">
              Get comprehensive diagnosis with treatment plans and prevention strategies.
            </p>
          </div>
        </div>

        {/* Upload Guidelines */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Guidelines</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-green-700 mb-3">✅ Best Practices:</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Use high-resolution images (at least 800x600 pixels)
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Ensure good lighting - natural daylight preferred
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Focus on affected plant parts (leaves, stems, fruits)
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Include close-up shots of symptoms
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Capture multiple angles if possible
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-red-700 mb-3">❌ Avoid These:</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Blurry or out-of-focus images
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Very dark or shadowy photos
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Images with excessive background clutter
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Photos taken through glass or plastic
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Images larger than 10MB
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}