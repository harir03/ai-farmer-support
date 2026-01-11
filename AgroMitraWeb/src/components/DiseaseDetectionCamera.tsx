'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface DetectionResult {
  success: boolean;
  diagnosis: string;
  confidence?: number;
  recommendations?: string[];
  timestamp: string;
}

export default function DiseaseDetectionCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Get available cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        
        // Prefer back camera if available
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        
        if (backCamera) {
          setSelectedDeviceId(backCamera.deviceId);
        } else if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error getting devices:', err);
      }
    };

    getDevices();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: selectedDeviceId ? undefined : 'environment'
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Camera access denied or not available. Please check permissions.');
    }
  }, [selectedDeviceId]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsDetecting(true);
    setError(null);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current frame to canvas
      context.drawImage(video, 0, 0);

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to capture image');
          setIsDetecting(false);
          return;
        }

        const formData = new FormData();
        formData.append('image', blob, 'crop_image.jpg');

        try {
          const response = await fetch('/api/detect-disease', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: DetectionResult = await response.json();
          setResult(data);
        } catch (error) {
          console.error('Error detecting disease:', error);
          setError('Failed to analyze image. Please try again.');
        } finally {
          setIsDetecting(false);
        }
      }, 'image/jpeg', 0.8);
    }
  }, []);

  const resetDetection = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Disease Detection</h2>
        <p className="text-gray-600">Point your camera at the plant to detect diseases</p>
      </div>

      {/* Camera Selection */}
      {devices.length > 1 && (
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Camera:
          </label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isStreaming}
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.substring(0, 5)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video Display */}
      <div className="relative w-full max-w-md">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full rounded-lg border-2 ${isStreaming ? 'border-green-500' : 'border-gray-300'}`}
          style={{ display: isStreaming ? 'block' : 'none' }}
        />
        
        {!isStreaming && (
          <div className="w-full h-64 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p>Camera preview will appear here</p>
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        {!isStreaming ? (
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Start Camera</span>
          </button>
        ) : (
          <>
            <button
              onClick={captureAndAnalyze}
              disabled={isDetecting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            >
              {isDetecting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Detect Disease</span>
                </>
              )}
            </button>
            
            <button
              onClick={stopCamera}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Stop Camera</span>
            </button>
          </>
        )}
        
        {result && (
          <button
            onClick={resetDetection}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            New Detection
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
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
        <div className="w-full p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Detection Results
          </h3>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-800">Diagnosis:</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{result.diagnosis}</p>
            </div>
            
            {result.confidence && (
              <div>
                <h4 className="font-medium text-gray-800">Confidence:</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{result.confidence}%</span>
                </div>
              </div>
            )}
            
            {result.recommendations && result.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800">Recommendations:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Analyzed at: {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}