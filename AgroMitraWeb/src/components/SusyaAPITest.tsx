'use client';

import React, { useState } from 'react';

export default function SusyaAPITest() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSusyaAPI = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      // Create a small test image (1x1 pixel PNG in base64)
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      const response = await fetch('/api/detect-disease', {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          // Convert base64 to blob
          const byteCharacters = atob(testImageBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          formData.append('image', blob, 'test.png');
          return formData;
        })(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Susya API Integration Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={testSusyaAPI}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Testing API...' : 'Test Susya API'}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800">Error:</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {testResult && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">API Response:</h3>
            <pre className="text-sm text-green-700 whitespace-pre-wrap overflow-x-auto">
              {testResult}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800">Integration Details:</h3>
          <ul className="text-blue-700 text-sm mt-2 space-y-1">
            <li>• Primary API: Susya (https://susya.onrender.com)</li>
            <li>• Fallback: Google Gemini (if API key provided)</li>
            <li>• Request format: JSON with base64 image</li>
            <li>• Response: Parsed diagnosis with confidence and recommendations</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800">Expected Susya API Response Format:</h3>
          <div className="text-yellow-700 text-sm mt-2">
            <p>The API should return either:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><strong>JSON format:</strong> {`{"diagnosis": "...", "confidence": 90, "recommendations": [...]}`}</li>
              <li><strong>Plain text:</strong> Disease diagnosis and treatment information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}