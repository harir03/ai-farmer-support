'use client';

import React, { useState, useEffect } from 'react';
import { DiseaseDetectionResult } from '@/lib/diseaseDetectionAPI';
import {
    getTreatmentCosts,
    calculateTotalCost,
    getWeatherRisk,
    generateVoiceAlert,
    speakAlert,
    shareDetectionResult,
    downloadReportAsJSON,
    downloadReportAsText,
    getNearbyExperts,
    getEmergencyContacts
} from '@/lib/diseaseUtils';

interface DetectionResultsPanelProps {
    result: DiseaseDetectionResult;
    thumbnail?: string;
    onClose?: () => void;
}

export default function DetectionResultsPanel({
    result,
    thumbnail,
    onClose
}: DetectionResultsPanelProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'treatment' | 'cost' | 'weather' | 'experts'>('overview');
    const [isExpanded, setIsExpanded] = useState(true);
    const [weatherData, setWeatherData] = useState<{ temp: number; humidity: number } | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [farmArea, setFarmArea] = useState<number>(1);

    // Fetch weather data
    useEffect(() => {
        // Mock weather data - in production, use a weather API
        setWeatherData({
            temp: 24 + Math.random() * 8,
            humidity: 60 + Math.random() * 25
        });
    }, []);

    const treatmentCosts = getTreatmentCosts(result.diseaseName);
    const totalCost = calculateTotalCost(result.diseaseName, farmArea);
    const weatherRisk = weatherData
        ? getWeatherRisk(result.diseaseName, weatherData.temp, weatherData.humidity)
        : null;
    const experts = getNearbyExperts();
    const emergencyContacts = getEmergencyContacts(result.severity);

    const handleVoiceAlert = () => {
        const message = generateVoiceAlert(result);
        setIsSpeaking(true);
        speakAlert(message);

        // Reset after approximate speech duration
        setTimeout(() => setIsSpeaking(false), 5000);
    };

    const handleShare = async () => {
        const success = await shareDetectionResult(result);
        setShareStatus(success ? 'success' : 'error');
        setTimeout(() => setShareStatus('idle'), 3000);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'severe': return 'from-red-500 to-red-600';
            case 'moderate': return 'from-orange-500 to-orange-600';
            case 'mild': return 'from-yellow-500 to-yellow-600';
            default: return 'from-green-500 to-green-600';
        }
    };

    const getSeverityBgLight = (severity: string) => {
        switch (severity) {
            case 'severe': return 'bg-red-50 border-red-200';
            case 'moderate': return 'bg-orange-50 border-orange-200';
            case 'mild': return 'bg-yellow-50 border-yellow-200';
            default: return 'bg-green-50 border-green-200';
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'very_high': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-green-600 bg-green-100';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className={`bg-gradient-to-r ${getSeverityColor(result.severity)} p-6 text-white`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {thumbnail && (
                            <img
                                src={thumbnail}
                                alt="Detection"
                                className="w-20 h-20 rounded-xl object-cover border-2 border-white/30"
                            />
                        )}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium uppercase">
                                    {result.severity}
                                </span>
                                <span className="text-white/80 text-sm">{result.confidence}% confidence</span>
                            </div>
                            <h2 className="text-2xl font-bold">{result.diseaseName}</h2>
                            {result.scientificName && (
                                <p className="text-white/70 italic text-sm mt-1">{result.scientificName}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Voice Alert Button */}
                        <button
                            onClick={handleVoiceAlert}
                            className={`p-2.5 rounded-xl transition-all ${isSpeaking
                                    ? 'bg-white text-green-600 animate-pulse'
                                    : 'bg-white/20 hover:bg-white/30 text-white'
                                }`}
                            title="Voice Alert"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        </button>

                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            className={`p-2.5 rounded-xl transition-all ${shareStatus === 'success'
                                    ? 'bg-green-500 text-white'
                                    : shareStatus === 'error'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-white/20 hover:bg-white/30 text-white'
                                }`}
                            title="Share Report"
                        >
                            {shareStatus === 'success' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            )}
                        </button>

                        {/* Download Menu */}
                        <div className="relative group">
                            <button className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <button
                                    onClick={() => downloadReportAsJSON(result)}
                                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-t-xl flex items-center gap-2"
                                >
                                    <span className="text-blue-500">📄</span> Download JSON
                                </button>
                                <button
                                    onClick={() => downloadReportAsText(result)}
                                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-b-xl flex items-center gap-2"
                                >
                                    <span className="text-green-500">📝</span> Download Text
                                </button>
                            </div>
                        </div>

                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
                {[
                    { id: 'overview', label: 'Overview', icon: '📋' },
                    { id: 'treatment', label: 'Treatment', icon: '💊' },
                    { id: 'cost', label: 'Cost Estimate', icon: '💰' },
                    { id: 'weather', label: 'Weather Risk', icon: '🌤️' },
                    { id: 'experts', label: 'Get Help', icon: '👨‍🌾' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id
                                ? 'text-green-600 border-green-500 bg-green-50'
                                : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-[500px] overflow-y-auto">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">About This Condition</h3>
                            <p className="text-gray-600 leading-relaxed">{result.description}</p>
                        </div>

                        {/* Health Score */}
                        {result.imageAnalysis && (
                            <div className={`p-4 rounded-xl border ${getSeverityBgLight(result.severity)}`}>
                                <h4 className="font-semibold text-gray-800 mb-3">Plant Health Analysis</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">{result.imageAnalysis.healthScore}</div>
                                        <div className="text-xs text-gray-500 mt-1">Health Score</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">{result.imageAnalysis.affectedArea}</div>
                                        <div className="text-xs text-gray-500 mt-1">Affected Area</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">
                                            {result.imageAnalysis.plantParts?.join(', ') || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Affected Parts</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Symptoms */}
                        {result.symptoms && result.symptoms.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Symptoms to Watch</h3>
                                <ul className="space-y-2">
                                    {result.symptoms.map((symptom, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-gray-600">
                                            <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                                                {idx + 1}
                                            </span>
                                            {symptom}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Yield Impact */}
                        {result.estimatedYieldImpact && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">⚠️</span>
                                    <div>
                                        <h4 className="font-semibold text-amber-800">Estimated Yield Impact</h4>
                                        <p className="text-amber-700">{result.estimatedYieldImpact}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Treatment Tab */}
                {activeTab === 'treatment' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Chemical Treatments */}
                        {result.treatment && result.treatment.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">💊</span>
                                    Recommended Treatment
                                </h3>
                                <ul className="space-y-3">
                                    {result.treatment.map((treatment, idx) => (
                                        <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            <span className="text-gray-700">{treatment}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Organic Remedies */}
                        {result.organicRemedies && result.organicRemedies.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">🌿</span>
                                    Organic Remedies
                                </h3>
                                <ul className="space-y-3">
                                    {result.organicRemedies.map((remedy, idx) => (
                                        <li key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                            <span className="text-green-500 mt-0.5">🌱</span>
                                            <span className="text-gray-700">{remedy}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Prevention */}
                        {result.prevention && result.prevention.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">🛡️</span>
                                    Prevention Measures
                                </h3>
                                <ul className="space-y-3">
                                    {result.prevention.map((prevention, idx) => (
                                        <li key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                            <span className="text-purple-500 mt-0.5">→</span>
                                            <span className="text-gray-700">{prevention}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Cost Estimate Tab */}
                {activeTab === 'cost' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Area Input */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Farm Area (in acres)
                            </label>
                            <input
                                type="number"
                                value={farmArea}
                                onChange={(e) => setFarmArea(Math.max(0.1, Number(e.target.value)))}
                                min="0.1"
                                step="0.5"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {/* Total Cost Summary */}
                        <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                            <h3 className="text-lg font-medium mb-3">Estimated Total Treatment Cost</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold">₹{totalCost.minimum.toLocaleString()}</span>
                                <span className="text-white/70">to</span>
                                <span className="text-4xl font-bold">₹{totalCost.maximum.toLocaleString()}</span>
                            </div>
                            <p className="text-white/70 text-sm mt-2">For {farmArea} acre(s) of affected crop</p>
                        </div>

                        {/* Treatment Breakdown */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Treatment Cost Breakdown</h3>
                            <div className="space-y-3">
                                {treatmentCosts.map((cost, idx) => (
                                    <div key={idx} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-800">{cost.treatmentName}</h4>
                                                <p className="text-sm text-gray-500 mt-1">{cost.applicationMethod}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-gray-900">
                                                    ₹{cost.estimatedCost.min} - ₹{cost.estimatedCost.max}
                                                </div>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${cost.availability === 'common'
                                                        ? 'bg-green-100 text-green-700'
                                                        : cost.availability === 'moderate'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {cost.availability === 'common' ? 'Easily Available' : cost.availability === 'moderate' ? 'Moderately Available' : 'Hard to Find'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Weather Risk Tab */}
                {activeTab === 'weather' && (
                    <div className="space-y-6 animate-fade-in">
                        {weatherData && weatherRisk ? (
                            <>
                                {/* Current Weather */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                                        <div className="text-3xl mb-2">🌡️</div>
                                        <div className="text-2xl font-bold text-gray-900">{weatherData.temp.toFixed(1)}°C</div>
                                        <div className="text-sm text-gray-500">Temperature</div>
                                    </div>
                                    <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200 text-center">
                                        <div className="text-3xl mb-2">💧</div>
                                        <div className="text-2xl font-bold text-gray-900">{weatherData.humidity.toFixed(0)}%</div>
                                        <div className="text-sm text-gray-500">Humidity</div>
                                    </div>
                                </div>

                                {/* Risk Assessment */}
                                <div className={`p-6 rounded-xl border-2 ${weatherRisk.riskLevel === 'very_high' ? 'bg-red-50 border-red-300' :
                                        weatherRisk.riskLevel === 'high' ? 'bg-orange-50 border-orange-300' :
                                            weatherRisk.riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-300' :
                                                'bg-green-50 border-green-300'
                                    }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Disease Risk Level</h3>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${getRiskColor(weatherRisk.riskLevel)}`}>
                                            {weatherRisk.riskLevel.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Risk Meter */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                                            <span>Risk Level</span>
                                            <span>{weatherRisk.riskPercentage}%</span>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${weatherRisk.riskLevel === 'very_high' ? 'bg-red-500' :
                                                        weatherRisk.riskLevel === 'high' ? 'bg-orange-500' :
                                                            weatherRisk.riskLevel === 'medium' ? 'bg-yellow-500' :
                                                                'bg-green-500'
                                                    }`}
                                                style={{ width: `${weatherRisk.riskPercentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-gray-700">{weatherRisk.recommendation}</p>
                                </div>

                                {/* Weather Tips */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <h4 className="font-semibold text-gray-800 mb-2">Weather-Based Tips</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-center gap-2">
                                            <span className="text-blue-500">💡</span>
                                            Monitor plants more frequently during humid conditions
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-blue-500">💡</span>
                                            Avoid overhead watering to reduce leaf wetness
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-blue-500">💡</span>
                                            Ensure proper spacing for air circulation
                                        </li>
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-4xl mb-2">🌤️</div>
                                <p>Loading weather data...</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Experts Tab */}
                {activeTab === 'experts' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Emergency Contacts */}
                        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                            <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                                📞 Emergency Helplines
                            </h3>
                            <div className="space-y-2">
                                {emergencyContacts.map((contact, idx) => (
                                    <a
                                        key={idx}
                                        href={`tel:${contact.number}`}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100 hover:bg-red-50 transition-colors"
                                    >
                                        <span className="font-medium text-gray-800">{contact.name}</span>
                                        <span className="text-red-600 font-bold">{contact.number}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Nearby Experts */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Agricultural Experts</h3>
                            <div className="space-y-3">
                                {experts.map((expert) => (
                                    <div key={expert.id} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-800">{expert.name}</h4>
                                                <p className="text-sm text-gray-500">{expert.specialization.join(', ')}</p>
                                                <p className="text-sm text-gray-400 mt-1">{expert.address}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-500">★</span>
                                                <span className="text-sm font-medium">{expert.rating}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <a
                                                href={`tel:${expert.phone}`}
                                                className="flex-1 py-2 bg-green-500 text-white text-center rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                                            >
                                                📞 Call Now
                                            </a>
                                            {expert.email && (
                                                <a
                                                    href={`mailto:${expert.email}`}
                                                    className="flex-1 py-2 bg-blue-500 text-white text-center rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                                >
                                                    ✉️ Email
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Detected: {new Date(result.timestamp).toLocaleString()}</span>
                    <span>Source: {result.apiSource || 'AI Analysis'}</span>
                </div>
            </div>
        </div>
    );
}
