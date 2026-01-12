'use client';

import React, { useState } from 'react';
import DiseaseDetectionCamera from '@/components/DiseaseDetectionCamera';
import ImageUpload from '@/components/EnhancedImageUpload';
import RealTimeDetection from '@/components/RealTimeDetection';

export default function DetectionTabs() {
  const [activeTab, setActiveTab] = useState<'realtime' | 'camera' | 'upload'>('realtime');

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1.5 rounded-xl flex flex-wrap justify-center gap-1">
          <button
            onClick={() => setActiveTab('realtime')}
            className={`px-5 py-2.5 rounded-lg transition-all duration-300 ${activeTab === 'realtime'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
          >
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                {activeTab === 'realtime' && (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </>
                )}
                {activeTab !== 'realtime' && (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-400"></span>
                )}
              </span>
              <span className="font-medium">Real-Time AI</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`px-5 py-2.5 rounded-lg transition-all duration-300 ${activeTab === 'camera'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Camera</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-5 py-2.5 rounded-lg transition-all duration-300 ${activeTab === 'upload'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="font-medium">Upload</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'realtime' && (
          <div className="animate-fade-in">
            <RealTimeDetection />
          </div>
        )}

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
      <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
        {activeTab === 'realtime' ? (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">⚡ Real-Time AI Detection</h4>
              <p className="text-sm text-gray-600">
                Continuous AI-powered monitoring with live confidence scores, visual overlays,
                and automatic disease alerts. Perfect for thorough field inspections with instant feedback.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Live Monitoring</span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">Confidence Score</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Detection History</span>
              </div>
            </div>
          </div>
        ) : activeTab === 'camera' ? (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">📹 Live Camera Detection</h4>
              <p className="text-sm text-gray-600">
                Use your device's camera to capture plant images manually. Click to analyze when
                you've framed the perfect shot. Ideal for detailed single-plant examination.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Manual Capture</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">Camera Selection</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">📁 Image Upload Detection</h4>
              <p className="text-sm text-gray-600">
                Upload existing photos from your device for analysis. Great for analyzing images
                from high-quality cameras or photos shared by others. Supports drag & drop.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Drag & Drop</span>
                <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full">Multiple Formats</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}