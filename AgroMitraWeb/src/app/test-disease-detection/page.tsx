'use client';

import React from 'react';
import Link from 'next/link';
import SusyaAPITest from '@/components/SusyaAPITest';

export default function TestPage() {
  const testPhrases = [
    "detect disease in my plants",
    "scan my crop for problems",
    "use camera to check plant health",
    "disease detection with camera",
    "my plants have yellow spots",
    "check if my crops are healthy"
  ];

  const testVoiceCommand = (phrase: string) => {
    // This would trigger the voice agent with the test phrase
    console.log(`Testing voice command: "${phrase}"`);
    // In a real implementation, you would call your voice agent here
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Disease Detection Testing
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Voice Command Tests */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Test Voice Commands</h2>
              <p className="text-gray-600 mb-4">
                Click these phrases to test the voice agent's disease detection functionality:
              </p>
              <div className="space-y-2">
                {testPhrases.map((phrase, index) => (
                  <button
                    key={index}
                    onClick={() => testVoiceCommand(phrase)}
                    className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                  >
                    "{phrase}"
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Navigation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Direct Access</h2>
              <p className="text-gray-600 mb-4">
                Or navigate directly to the disease detection camera:
              </p>
              <Link
                href="/disease-detection"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Open Disease Detection Camera
              </Link>
            </div>
          </div>

          {/* API Integration Test */}
          <div className="mt-8">
            <SusyaAPITest />
          </div>

          {/* Setup Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>The Susya API is now integrated as the primary detection service</li>
              <li>Optional: Add Google Gemini API key in <code>.env.local</code> as fallback</li>
              <li>Test the API integration using the test button above</li>
              <li>Try the camera functionality in the disease detection page</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}