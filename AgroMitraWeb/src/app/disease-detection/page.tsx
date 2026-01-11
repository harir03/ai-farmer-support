'use client';

import React from 'react';
import DetectionTabs from '@/components/DetectionTabs';

export default function DiseaseDetectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            AI Plant Disease Detection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Use your camera to instantly detect plant diseases and get expert recommendations 
            for treatment and prevention. Our AI analyzes your plants in real-time to help 
            maintain healthy crops.
          </p>
        </div>

        {/* Features */}
        {/* <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Instant Detection</h3>
            <p className="text-gray-600 text-sm">
              Get immediate analysis of plant health issues using advanced AI vision technology
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Expert Recommendations</h3>
            <p className="text-gray-600 text-sm">
              Receive actionable treatment plans and prevention strategies from agricultural experts
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-time Analysis</h3>
            <p className="text-gray-600 text-sm">
              Live camera feed with immediate feedback and confidence scoring for accurate diagnosis
            </p>
          </div>
        </div> */}

        {/* Detection Options */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Choose Detection Method</h2>
            <p className="text-gray-600">Select how you want to analyze your plants</p>
          </div>
          
          <DetectionTabs />
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">How to Use</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">📱 For Best Results:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Use good lighting - natural daylight works best
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Hold camera steady and focus on affected areas
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Capture clear images of leaves, stems, or fruits
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Avoid blurry or dark images
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">🔍 What We Can Detect:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Fungal diseases (rust, blight, mildew)
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Bacterial infections and spots
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Pest damage and infestations
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Nutrient deficiencies and disorders
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
              <p className="text-sm text-yellow-700 mt-1">
                This AI tool provides preliminary assessments and should be used as a guide. 
                For critical decisions or severe plant health issues, please consult with local 
                agricultural experts or extension services for professional diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}