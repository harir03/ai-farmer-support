'use client';

import React from 'react';
import DetectionTabs from '@/components/DetectionTabs';

export default function DiseaseDetectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Powered by AI
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Crop Disease Detection
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload a photo or use your camera to instantly detect plant diseases and get
            expert-level treatment recommendations. Our AI analyzes crops with up to{' '}
            <span className="font-semibold text-green-700">95% accuracy</span> to help you
            protect your harvest.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-gray-900">50+</p>
                <p className="text-xs text-gray-500">Diseases Detected</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-gray-900">&lt; 5s</p>
                <p className="text-xs text-gray-500">Analysis Time</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-gray-900">Organic</p>
                <p className="text-xs text-gray-500">Remedies Included</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Detection Area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-green-100/50 p-6 md:p-8 mb-8 border border-green-100">
          <DetectionTabs />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Detection</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Get immediate analysis of plant health issues using advanced AI vision technology trained on millions of crop images.
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Expert Treatment Plans</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Receive actionable treatment plans with both chemical and organic remedies from agricultural experts.
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Prevention Strategies</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Learn how to prevent future outbreaks with personalized recommendations based on your specific conditions.
            </p>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">How to Get the Best Results</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <span className="text-2xl">📱</span>
                Photography Tips
              </h3>
              <ul className="space-y-3">
                {[
                  'Use natural daylight for best image quality',
                  'Hold camera steady and focus on affected areas',
                  'Capture clear images of leaves, stems, or fruits',
                  'Include multiple angles if possible',
                  'Avoid blurry, dark, or overexposed images'
                ].map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-600">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <span className="text-2xl">🔍</span>
                What We Can Detect
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Fungal Diseases', icon: '🍄', color: 'bg-purple-100 text-purple-700' },
                  { name: 'Bacterial Infections', icon: '🦠', color: 'bg-red-100 text-red-700' },
                  { name: 'Pest Damage', icon: '🐛', color: 'bg-orange-100 text-orange-700' },
                  { name: 'Nutrient Deficiencies', icon: '🌱', color: 'bg-green-100 text-green-700' },
                  { name: 'Viral Diseases', icon: '🔬', color: 'bg-blue-100 text-blue-700' },
                  { name: 'Environmental Stress', icon: '🌡️', color: 'bg-yellow-100 text-yellow-700' }
                ].map((item, index) => (
                  <div key={index} className={`${item.color} rounded-xl p-3 flex items-center gap-2`}>
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Configuration Notice (for developers) */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">🔧 Developer Note: API Configuration</h4>
              <p className="text-indigo-700 text-sm mb-3">
                This feature uses dummy data for demo purposes. To enable real disease detection, add your API keys to <code className="bg-indigo-100 px-1.5 py-0.5 rounded">.env.local</code>:
              </p>
              <div className="bg-white/80 rounded-lg p-3 font-mono text-xs text-gray-700 space-y-1">
                <div><span className="text-purple-600">PLANT_ID_API_KEY</span>=your_key_from_plant.id</div>
                <div><span className="text-purple-600">GEMINI_API_KEY</span>=your_google_gemini_api_key</div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">Important Notice</h4>
              <p className="text-amber-800 text-sm">
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