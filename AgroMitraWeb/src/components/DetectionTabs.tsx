'use client';

import React, { useState } from 'react';
import DiseaseDetectionCamera from '@/components/DiseaseDetectionCamera';
import ImageUpload from '@/components/ImageUpload';

export default function DetectionTabs() {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-6 py-2 rounded-md transition-all duration-200 ${
              activeTab === 'camera'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Live Camera</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-2 rounded-md transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload Image</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'camera' && (
          <div className="animate-fade-in">
            <DiseaseDetectionCamera />
          </div>
        )}
        
        {activeTab === 'upload' && (
          <div className="animate-fade-in">
            <ImageUpload />
          </div>
        )}
      </div>

      {/* Tab-specific Information */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        {activeTab === 'camera' ? (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">📹 Live Camera Detection</h4>
            <p className="text-sm text-gray-600">
              Use your device's camera to capture plant images in real-time. Perfect for immediate 
              analysis of plants in your garden or field. Requires camera permissions.
            </p>
          </div>
        ) : (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">📁 Image Upload Detection</h4>
            <p className="text-sm text-gray-600">
              Upload existing photos from your device for analysis. Great for analyzing multiple 
              images or photos taken with high-quality cameras. Supports drag & drop.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}