'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { DiseaseDetectionResult } from '@/lib/diseaseDetectionAPI';
import { generateVoiceAlert, speakAlert } from '@/lib/diseaseUtils';
import DetectionResultsPanel from './DetectionResultsPanel';

interface DetectionHistory {
    id: string;
    result: DiseaseDetectionResult;
    thumbnail: string;
    timestamp: Date;
}

export default function RealTimeDetection() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isAutoDetecting, setIsAutoDetecting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentResult, setCurrentResult] = useState<DiseaseDetectionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [detectionInterval, setDetectionInterval] = useState<number>(2000); // 2 seconds default
    const [autoDetectThreshold, setAutoDetectThreshold] = useState<number>(70);
    const [liveConfidence, setLiveConfidence] = useState<number>(0);
    const [detectionHistory, setDetectionHistory] = useState<DetectionHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [scanLinePosition, setScanLinePosition] = useState(0);
    const [showDetailedPanel, setShowDetailedPanel] = useState(false);
    const [enableVoiceAlerts, setEnableVoiceAlerts] = useState(false);
    const [currentThumbnail, setCurrentThumbnail] = useState<string>('');
    const autoDetectRef = useRef<NodeJS.Timeout | null>(null);
    const animationRef = useRef<number | null>(null);

    // Get available cameras
    useEffect(() => {
        const getDevices = async () => {
            try {
                const deviceList = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
                setDevices(videoDevices);

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

    // Scanning animation
    useEffect(() => {
        if (isAutoDetecting) {
            const animateScan = () => {
                setScanLinePosition(prev => (prev + 2) % 100);
                animationRef.current = requestAnimationFrame(animateScan);
            };
            animationRef.current = requestAnimationFrame(animateScan);
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isAutoDetecting]);

    // Draw overlay on video
    const drawOverlay = useCallback((result: DiseaseDetectionResult | null) => {
        if (!overlayCanvasRef.current || !videoRef.current) return;

        const canvas = overlayCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (result && result.severity !== 'healthy') {
            // Draw detection overlay
            const padding = 20;
            const boxWidth = canvas.width - (padding * 2);
            const boxHeight = canvas.height - (padding * 2);

            // Determine color based on severity
            let color = '#22c55e'; // green for healthy
            if (result.severity === 'severe') color = '#ef4444';
            else if (result.severity === 'moderate') color = '#f97316';
            else if (result.severity === 'mild') color = '#eab308';

            // Draw bounding box with glow effect
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.strokeRect(padding, padding, boxWidth, boxHeight);
            ctx.setLineDash([]);

            // Draw corner brackets
            const cornerSize = 30;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 10;

            // Top-left
            ctx.beginPath();
            ctx.moveTo(padding, padding + cornerSize);
            ctx.lineTo(padding, padding);
            ctx.lineTo(padding + cornerSize, padding);
            ctx.stroke();

            // Top-right
            ctx.beginPath();
            ctx.moveTo(canvas.width - padding - cornerSize, padding);
            ctx.lineTo(canvas.width - padding, padding);
            ctx.lineTo(canvas.width - padding, padding + cornerSize);
            ctx.stroke();

            // Bottom-left
            ctx.beginPath();
            ctx.moveTo(padding, canvas.height - padding - cornerSize);
            ctx.lineTo(padding, canvas.height - padding);
            ctx.lineTo(padding + cornerSize, canvas.height - padding);
            ctx.stroke();

            // Bottom-right
            ctx.beginPath();
            ctx.moveTo(canvas.width - padding - cornerSize, canvas.height - padding);
            ctx.lineTo(canvas.width - padding, canvas.height - padding);
            ctx.lineTo(canvas.width - padding, canvas.height - padding - cornerSize);
            ctx.stroke();

            // Draw label background
            ctx.shadowBlur = 0;
            ctx.fillStyle = color;
            const labelText = `${result.diseaseName} - ${result.confidence}%`;
            ctx.font = 'bold 16px Inter, system-ui, sans-serif';
            const textMetrics = ctx.measureText(labelText);
            const labelWidth = textMetrics.width + 20;
            const labelHeight = 30;

            ctx.fillRect(padding, padding - labelHeight - 5, labelWidth, labelHeight);

            // Draw label text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(labelText, padding + 10, padding - 12);
        }

        // Draw scanning line if auto-detecting
        if (isAutoDetecting) {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0)');
            gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.8)');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

            ctx.fillStyle = gradient;
            const scanY = (scanLinePosition / 100) * canvas.height;
            ctx.fillRect(0, scanY, canvas.width, 3);
        }
    }, [isAutoDetecting, scanLinePosition]);

    // Update overlay when result changes
    useEffect(() => {
        drawOverlay(currentResult);
    }, [currentResult, drawOverlay, scanLinePosition]);

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
        stopAutoDetection();

        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreaming(false);
        }
    }, []);

    const captureFrame = useCallback(async (): Promise<Blob | null> => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);

            return new Promise((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
            });
        }
        return null;
    }, []);

    const analyzeFrame = useCallback(async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        setError(null);

        try {
            const blob = await captureFrame();
            if (!blob) {
                throw new Error('Failed to capture frame');
            }

            const formData = new FormData();
            formData.append('image', blob, 'crop_image.jpg');

            const response = await fetch('/api/detect-disease', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: DiseaseDetectionResult = await response.json();
            setCurrentResult(result);
            setLiveConfidence(result.confidence);

            // Save current thumbnail
            const thumbnailUrl = canvasRef.current?.toDataURL('image/jpeg', 0.5) || '';
            setCurrentThumbnail(thumbnailUrl);

            // Add to history if disease detected
            if (result.severity !== 'healthy' && result.confidence >= autoDetectThreshold) {
                setDetectionHistory(prev => [{
                    id: Date.now().toString(),
                    result,
                    thumbnail: thumbnailUrl,
                    timestamp: new Date()
                }, ...prev].slice(0, 10)); // Keep last 10

                // Voice alert for disease detection
                if (enableVoiceAlerts && result.severity !== 'healthy') {
                    const message = generateVoiceAlert(result);
                    speakAlert(message);
                }
            }

            return result;
        } catch (error) {
            console.error('Error analyzing frame:', error);
            setError('Failed to analyze image. Please try again.');
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [captureFrame, isProcessing, autoDetectThreshold, enableVoiceAlerts]);

    const startAutoDetection = useCallback(() => {
        setIsAutoDetecting(true);

        // Initial detection
        analyzeFrame();

        // Set up interval for continuous detection
        autoDetectRef.current = setInterval(() => {
            analyzeFrame();
        }, detectionInterval);
    }, [analyzeFrame, detectionInterval]);

    const stopAutoDetection = useCallback(() => {
        setIsAutoDetecting(false);
        if (autoDetectRef.current) {
            clearInterval(autoDetectRef.current);
            autoDetectRef.current = null;
        }
    }, []);

    const toggleAutoDetection = useCallback(() => {
        if (isAutoDetecting) {
            stopAutoDetection();
        } else {
            startAutoDetection();
        }
    }, [isAutoDetecting, startAutoDetection, stopAutoDetection]);

    const clearHistory = () => {
        setDetectionHistory([]);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'severe': return 'text-red-500';
            case 'moderate': return 'text-orange-500';
            case 'mild': return 'text-yellow-500';
            default: return 'text-green-500';
        }
    };

    const getSeverityBg = (severity: string) => {
        switch (severity) {
            case 'severe': return 'bg-red-500';
            case 'moderate': return 'bg-orange-500';
            case 'mild': return 'bg-yellow-500';
            default: return 'bg-green-500';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return '#22c55e';
        if (confidence >= 60) return '#eab308';
        if (confidence >= 40) return '#f97316';
        return '#ef4444';
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl">
            {/* Main Detection Area */}
            <div className="flex-1 flex flex-col items-center space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                        <span className="relative flex h-4 w-4">
                            {isAutoDetecting && (
                                <>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                                </>
                            )}
                            {!isAutoDetecting && <span className="relative inline-flex rounded-full h-4 w-4 bg-gray-500"></span>}
                        </span>
                        Real-Time Disease Detection
                    </h2>
                    <p className="text-slate-400">Continuous AI-powered plant health monitoring</p>
                </div>

                {/* Camera Selection */}
                {devices.length > 1 && (
                    <div className="w-full max-w-md">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Select Camera:
                        </label>
                        <select
                            value={selectedDeviceId}
                            onChange={(e) => setSelectedDeviceId(e.target.value)}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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

                {/* Video Display with Overlay */}
                <div className="relative w-full max-w-2xl">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full ${isStreaming ? 'block' : 'hidden'}`}
                        />

                        {/* Overlay Canvas */}
                        <canvas
                            ref={overlayCanvasRef}
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        />

                        {/* Processing Indicator */}
                        {isProcessing && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-white text-sm font-medium">Analyzing...</span>
                            </div>
                        )}

                        {/* Auto-Detection Badge */}
                        {isAutoDetecting && (
                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500/80 backdrop-blur-sm px-4 py-2 rounded-full">
                                <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-white text-sm font-bold">LIVE</span>
                            </div>
                        )}

                        {/* Camera Placeholder */}
                        {!isStreaming && (
                            <div className="w-full h-80 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                                <div className="text-center text-slate-400">
                                    <svg className="mx-auto h-20 w-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-lg font-medium">Camera Preview</p>
                                    <p className="text-sm mt-1">Click "Start Camera" to begin</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Live Confidence Meter */}
                {isStreaming && (
                    <div className="w-full max-w-2xl">
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-300 font-medium">Live Confidence</span>
                                <span className="text-2xl font-bold" style={{ color: getConfidenceColor(liveConfidence) }}>
                                    {liveConfidence}%
                                </span>
                            </div>

                            {/* Circular Progress */}
                            <div className="flex items-center gap-6">
                                <div className="relative w-24 h-24">
                                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="42"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-slate-700"
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="42"
                                            stroke={getConfidenceColor(liveConfidence)}
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={`${(liveConfidence / 100) * 264} 264`}
                                            strokeLinecap="round"
                                            className="transition-all duration-500"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xl font-bold text-white">{liveConfidence}%</span>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${liveConfidence}%`,
                                                backgroundColor: getConfidenceColor(liveConfidence)
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                                        <span>Low</span>
                                        <span>Medium</span>
                                        <span>High</span>
                                        <span>Very High</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Control Panel */}
                <div className="flex flex-wrap gap-4 justify-center">
                    {!isStreaming ? (
                        <button
                            onClick={startCamera}
                            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-3 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="font-semibold">Start Camera</span>
                        </button>
                    ) : (
                        <>
                            {/* Single Detection */}
                            <button
                                onClick={analyzeFrame}
                                disabled={isProcessing}
                                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-blue-500/30"
                            >
                                {isProcessing ? (
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
                                        <span>Detect Now</span>
                                    </>
                                )}
                            </button>

                            {/* Auto Detection Toggle */}
                            <button
                                onClick={toggleAutoDetection}
                                className={`px-6 py-4 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg ${isAutoDetecting
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/30'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-purple-500/30'
                                    } text-white`}
                            >
                                {isAutoDetecting ? (
                                    <>
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                        </svg>
                                        <span>Stop Auto</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Auto Detect</span>
                                    </>
                                )}
                            </button>

                            {/* Stop Camera */}
                            <button
                                onClick={stopCamera}
                                className="px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-red-500/30"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Stop Camera</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Settings Panel */}
                {isStreaming && (
                    <div className="w-full max-w-2xl bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Detection Settings
                        </h4>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">
                                    Detection Interval: {detectionInterval / 1000}s
                                </label>
                                <input
                                    type="range"
                                    min="1000"
                                    max="5000"
                                    step="500"
                                    value={detectionInterval}
                                    onChange={(e) => setDetectionInterval(Number(e.target.value))}
                                    className="w-full accent-green-500"
                                    disabled={isAutoDetecting}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">
                                    Alert Threshold: {autoDetectThreshold}%
                                </label>
                                <input
                                    type="range"
                                    min="50"
                                    max="95"
                                    step="5"
                                    value={autoDetectThreshold}
                                    onChange={(e) => setAutoDetectThreshold(Number(e.target.value))}
                                    className="w-full accent-green-500"
                                />
                            </div>
                        </div>

                        {/* Voice Alert Toggle */}
                        <div className="mt-4 pt-4 border-t border-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🔊</span>
                                    <div>
                                        <p className="text-sm font-medium text-white">Voice Alerts</p>
                                        <p className="text-xs text-slate-400">Speak results when disease detected</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEnableVoiceAlerts(!enableVoiceAlerts)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${enableVoiceAlerts ? 'bg-green-500' : 'bg-slate-600'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enableVoiceAlerts ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="w-full max-w-2xl p-4 bg-red-500/20 border border-red-500/50 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <svg className="h-6 w-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-300">{error}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Results & History Panel */}
            <div className="lg:w-96 flex flex-col gap-6">
                {/* Current Detection Result */}
                {currentResult && (
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Detection Result</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityBg(currentResult.severity)} text-white`}>
                                {currentResult.severity.toUpperCase()}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {/* Disease Name & Scientific Name */}
                            <div>
                                <h4 className="text-2xl font-bold text-white mb-1">{currentResult.diseaseName}</h4>
                                {currentResult.scientificName && (
                                    <p className="text-slate-400 italic text-sm">{currentResult.scientificName}</p>
                                )}
                            </div>

                            {/* Confidence Score */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-400 text-sm">Confidence Score</span>
                                    <span className={`text-lg font-bold ${getSeverityColor(currentResult.severity)}`}>
                                        {currentResult.confidence}%
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${getSeverityBg(currentResult.severity)}`}
                                        style={{ width: `${currentResult.confidence}%` }}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h5 className="text-sm font-semibold text-slate-300 mb-2">Description</h5>
                                <p className="text-slate-400 text-sm leading-relaxed">{currentResult.description}</p>
                            </div>

                            {/* Symptoms */}
                            {currentResult.symptoms && currentResult.symptoms.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-semibold text-slate-300 mb-2">Symptoms</h5>
                                    <ul className="space-y-1">
                                        {currentResult.symptoms.slice(0, 4).map((symptom, idx) => (
                                            <li key={idx} className="text-slate-400 text-sm flex items-start gap-2">
                                                <span className="text-red-400 mt-1">•</span>
                                                {symptom}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Treatment */}
                            {currentResult.treatment && currentResult.treatment.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-semibold text-slate-300 mb-2">Recommended Treatment</h5>
                                    <ul className="space-y-1">
                                        {currentResult.treatment.slice(0, 3).map((treatment, idx) => (
                                            <li key={idx} className="text-slate-400 text-sm flex items-start gap-2">
                                                <span className="text-green-400 mt-1">✓</span>
                                                {treatment}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Health Score */}
                            {currentResult.imageAnalysis && (
                                <div className="bg-slate-700/50 rounded-xl p-4 mt-4">
                                    <h5 className="text-sm font-semibold text-slate-300 mb-3">Plant Health Analysis</h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-white">{currentResult.imageAnalysis.healthScore}</div>
                                            <div className="text-xs text-slate-400">Health Score</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-white">{currentResult.imageAnalysis.affectedArea}</div>
                                            <div className="text-xs text-slate-400">Affected Area</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Timestamp */}
                            <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                                Analyzed: {new Date(currentResult.timestamp).toLocaleString()}
                            </div>

                            {/* View Full Report Button */}
                            <button
                                onClick={() => setShowDetailedPanel(true)}
                                className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                View Full Report
                            </button>
                        </div>
                    </div>
                )}

                {/* Detection History */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-2 text-white font-semibold"
                        >
                            <svg className={`w-5 h-5 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Detection History ({detectionHistory.length})
                        </button>

                        {detectionHistory.length > 0 && (
                            <button
                                onClick={clearHistory}
                                className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {showHistory && (
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {detectionHistory.length === 0 ? (
                                <p className="text-slate-500 text-center text-sm py-4">No detections yet</p>
                            ) : (
                                detectionHistory.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
                                        onClick={() => setCurrentResult(item.result)}
                                    >
                                        {item.thumbnail && (
                                            <img
                                                src={item.thumbnail}
                                                alt="Detection"
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm truncate">{item.result.diseaseName}</p>
                                            <p className="text-slate-400 text-xs">
                                                {item.result.confidence}% • {new Date(item.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <span className={`w-2 h-2 rounded-full ${getSeverityBg(item.result.severity)}`}></span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>


            {/* Detailed Report Modal */}
            {
                showDetailedPanel && currentResult && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DetectionResultsPanel
                                result={currentResult}
                                thumbnail={currentThumbnail}
                                onClose={() => setShowDetailedPanel(false)}
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
}
