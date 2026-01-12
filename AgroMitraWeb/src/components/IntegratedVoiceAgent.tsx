'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { LiveKitRoom, RoomAudioRenderer, useVoiceAssistant, BarVisualizer, VoiceAssistantControlBar, useRoomContext, useDataChannel, useParticipants, useChat } from '@livekit/components-react';
import "@livekit/components-styles";
import { useEnhancedVoiceAgent, UserContext } from '@/lib/enhanced-voice-agent';
import { componentClasses } from '@/lib/theme';
import { useRouter } from 'next/navigation';
import { uiTranslations, getUIText, speakInLanguage, speakInEnglish } from '@/lib/uiTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

interface IntegratedVoiceAgentProps {
  userContext?: UserContext;
}

// Mock user context for demonstration
const defaultUserContext: UserContext = {
  farmFields: [
    {
      id: '1',
      name: 'Main Field',
      size: 5,
      soilType: 'loamy',
      currentCrop: 'wheat',
      location: 'Punjab, India'
    }
  ],
  preferences: {
    language: 'en',
    location: 'Punjab, India',
    farmingType: 'mixed'
  },
  recentQueries: []
};

export default function IntegratedVoiceAgent({ userContext = defaultUserContext }: IntegratedVoiceAgentProps) {
  const router = useRouter();
  const [connectionDetails, setConnectionDetails] = useState<{
    token: string;
    serverUrl: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState(userContext.preferences.language);
  const [enhancedMode, setEnhancedMode] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [downloadedLanguages, setDownloadedLanguages] = useState<string[]>(['en', 'hi']);
  const [downloadingLanguage, setDownloadingLanguage] = useState<string | null>(null);
  const { language: uiLanguage, setLanguage: setGlobalLanguage } = useLanguage();

  // Available Indian languages
  const indianLanguages = [
    { code: 'en', name: 'English', nativeName: 'English', downloaded: true },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', downloaded: true },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', downloaded: false },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', downloaded: false },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', downloaded: false },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', downloaded: false },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', downloaded: false },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', downloaded: false },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', downloaded: false },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', downloaded: false },
  ];

  const { processInput, conversationHistory, updateUserContext } = useEnhancedVoiceAgent(userContext);

  // Voice welcome message on component load (uses selected language from global context)
  useEffect(() => {
    if (isVoiceEnabled && !connectionDetails) {
      const timer = setTimeout(() => {
        // Speak welcome message in selected language (using global uiLanguage)
        const welcomeMessages: Record<string, string> = {
          'en': 'Welcome to AgroMitra, your AI farming companion',
          'hi': 'एग्रोमित्र में आपका स्वागत है, आपका AI कृषि सहायक',
          'bn': 'এগ্রোমিত্রাতে আপনাকে স্বাগতম, আপনার AI কৃষি সহায়ক',
          'te': 'ఎగ్రోమిత్రకు స్వాగతం, మీ AI వ్యవసాయ సహాయకుడు',
          'ta': 'எக்ரோமித்ராவுக்கு வரவேற்கிறோம், உங்கள் AI வேளாண்மை தோழர்',
          'mr': 'एग्रोमित्रमध्ये आपले स्वागत आहे, तुमचा AI शेती सहाय्यक',
        };

        const instructionMessages: Record<string, string> = {
          'en': 'Click the green button to get started and talk with our AI agent',
          'hi': 'हरे बटन पर क्लिक करें और हमारे AI एजेंट से बात करें',
          'bn': 'সবুজ বোতামে ক্লিক করুন এবং আমাদের AI এজেন্টের সাথে কথা বলুন',
          'te': 'ప్రారంభించడానికి ఆకుపచ్చ బటన్‌ను క్లిక్ చేయండి',
          'ta': 'பசுமை பொத்தானை கிளிக் செய்து தொடங்கவும்',
          'mr': 'सुरुवात करण्यासाठी हिरव्या बटणावर क्लिक करा',
        };

        const welcomeText = welcomeMessages[uiLanguage] || welcomeMessages['en'];
        const instructionText = instructionMessages[uiLanguage] || instructionMessages['en'];

        speakInLanguage(welcomeText, uiLanguage);

        setTimeout(() => {
          speakInLanguage(instructionText, uiLanguage);
        }, 3000);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isVoiceEnabled, connectionDetails, uiLanguage]);



  // Connect to LiveKit
  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    // Voice feedback when connecting (uses selected language)
    if (isVoiceEnabled) {
      const connectMessages: Record<string, string> = {
        'en': 'Your AI agent is ready to help with all your farming needs',
        'hi': 'आपका AI एजेंट आपकी सभी कृषि जरूरतों में मदद के लिए तैयार है',
        'bn': 'আপনার AI এজেন্ট আপনার সমস্ত কৃষি প্রয়োজনে সহায়তা করতে প্রস্তুত',
        'te': 'మీ AI ఏజెంట్ మీ అన్ని వ్యవసాయ అవసరాలకు సహాయం చేయడానికి సిద్ధంగా ఉంది',
        'ta': 'உங்கள் AI முகவர் உங்கள் அனைத்து விவசாய தேவைகளுக்கும் உதவ தயாராக உள்ளது',
        'mr': 'तुमचा AI एजंट तुमच्या सर्व शेती गरजांसाठी मदत करण्यास तयार आहे',
      };
      speakInLanguage(connectMessages[uiLanguage] || connectMessages['en'], uiLanguage);
    }

    try {
      const response = await fetch(`/api/generateToken?userId=${crypto.randomUUID()}`);

      if (!response.ok) {
        throw new Error("Failed to generate token");
      }

      const data = await response.json();

      setConnectionDetails({
        token: data.token,
        serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://farmagent-0oxhnwxs.livekit.cloud",
      });
    } catch (err) {
      console.error("Connection error:", err);
      setError("Failed to connect. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnectionDetails(null);
    setError(null);
  };

  // Enhanced mode handlers
  const handleEnhancedInput = async (input: string) => {
    try {
      const result = await processInput(input);

      if (result.shouldRedirect && result.redirectTo) {
        setTimeout(() => {
          router.push(result.redirectTo!);
        }, 2000);
      }

      return result;
    } catch (error) {
      console.error('Enhanced processing error:', error);
      return {
        response: 'Sorry, I encountered an error processing your request.'
      };
    }
  };

  const getLanguageName = (code: string): string => {
    const lang = indianLanguages.find(l => l.code === code);
    return lang ? lang.nativeName : code;
  };

  // Simulate downloading a language pack
  const handleDownloadLanguage = async (langCode: string) => {
    setDownloadingLanguage(langCode);
    // Simulate download time (in real app, this would fetch translations)
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDownloadedLanguages(prev => [...prev, langCode]);
    setDownloadingLanguage(null);
  };

  // Select a language (only if downloaded)
  const handleSelectLanguage = (langCode: string) => {
    if (downloadedLanguages.includes(langCode)) {
      setLanguage(langCode);
      // Update global language for UI (supports en/hi, others use en as fallback for UI but voice uses the actual language)
      if (langCode === 'en' || langCode === 'hi') {
        setGlobalLanguage(langCode as 'en' | 'hi');
      }
      updateUserContext({
        preferences: { ...userContext.preferences, language: langCode }
      });
      setShowLanguageMenu(false);

      // Speak a confirmation in the selected language
      const confirmMessages: Record<string, string> = {
        'en': 'Language changed to English',
        'hi': 'भाषा हिंदी में बदल गई',
        'bn': 'ভাষা বাংলায় পরিবর্তিত হয়েছে',
        'te': 'భాష తెలుగులోకి మార్చబడింది',
        'ta': 'மொழி தமிழாக மாற்றப்பட்டது',
        'mr': 'भाषा मराठीत बदलली',
      };
      speakInLanguage(confirmMessages[langCode] || confirmMessages['en'], langCode);
    }
  };

  // Sync local language with global uiLanguage on mount
  useEffect(() => {
    if (uiLanguage !== language) {
      setLanguage(uiLanguage);
    }
  }, [uiLanguage]);

  // LiveKit connected view
  if (connectionDetails) {
    return (
      <LiveKitRoom
        token={connectionDetails.token}
        serverUrl={connectionDetails.serverUrl}
        connect={true}
        audio={true}
        className="min-h-screen"
      >
        <div className="container px-4 py-8 mx-auto">
          <LiveKitAgentInterface
            onDisconnect={handleDisconnect}
            language={language}
            onLanguageChange={setLanguage}
            onEnhancedInput={handleEnhancedInput}
            conversationHistory={conversationHistory}
          />
        </div>
      </LiveKitRoom>
    );
  }

  // Connection interface
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 shadow-lg bg-white/80 backdrop-blur-lg rounded-3xl">
            <svg
              className="w-12 h-12 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>

          <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-800 md:text-5xl">
            {getUIText('title', uiLanguage, 'home')}
          </h1>

          <h2 className="mb-4 text-2xl font-bold text-gray-800 md:text-3xl">
            {getUIText('subtitle', uiLanguage, 'home')}
          </h2>

          <p className="max-w-2xl mx-auto mb-8 text-lg leading-relaxed text-gray-600">
            {getUIText('description', uiLanguage, 'home')}
          </p>

          {/* Language Selector with Dropdown */}
          <div className="flex justify-center mb-8 relative">
            <div className="relative">
              {/* Current Language Button */}
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-6 py-3 border rounded-full shadow-md bg-white/90 backdrop-blur-lg border-white/50 hover:bg-white transition-all duration-300"
              >
                <span className="text-lg">{getLanguageName(language)}</span>
                <svg className={`w-4 h-4 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Language Dropdown Menu */}
              {showLanguageMenu && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-72 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 overflow-hidden z-50">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <h3 className="font-bold text-center">
                      {uiLanguage === 'hi' ? 'भाषा चुनें' : 'Select Language'}
                    </h3>
                    <p className="text-xs text-center text-green-100">
                      {uiLanguage === 'hi' ? 'भारतीय भाषाएं' : 'Indian Languages'}
                    </p>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {indianLanguages.map((lang) => {
                      const isDownloaded = downloadedLanguages.includes(lang.code);
                      const isDownloading = downloadingLanguage === lang.code;
                      const isSelected = language === lang.code;

                      return (
                        <div
                          key={lang.code}
                          className={`flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-green-50' : ''
                            }`}
                        >
                          <button
                            onClick={() => isDownloaded && handleSelectLanguage(lang.code)}
                            disabled={!isDownloaded}
                            className={`flex-1 text-left ${isDownloaded ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {isSelected && (
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              <div>
                                <span className="font-medium text-gray-800">{lang.nativeName}</span>
                                <span className="text-sm text-gray-500 ml-2">({lang.name})</span>
                              </div>
                            </div>
                          </button>

                          {!isDownloaded && (
                            <button
                              onClick={() => handleDownloadLanguage(lang.code)}
                              disabled={isDownloading}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                            >
                              {isDownloading ? (
                                <>
                                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>{uiLanguage === 'hi' ? 'डाउनलोड...' : 'Loading...'}</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  <span>{uiLanguage === 'hi' ? 'डाउनलोड' : 'Download'}</span>
                                </>
                              )}
                            </button>
                          )}

                          {isDownloaded && !isSelected && (
                            <span className="text-xs text-green-600 font-medium">
                              {uiLanguage === 'hi' ? '✓ उपलब्ध' : '✓ Ready'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-2 bg-gray-50 text-center">
                    <button
                      onClick={() => setShowLanguageMenu(false)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      {uiLanguage === 'hi' ? 'बंद करें' : 'Close'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Voice Controls */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${isVoiceEnabled
                ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600'
                : 'bg-white/80 text-gray-600 border border-white/50 hover:bg-white'
                }`}
            >
              {isVoiceEnabled
                ? (uiLanguage === 'hi' ? '🔊 आवाज़ चालू' : '🔊 Voice On')
                : (uiLanguage === 'hi' ? '🔇 आवाज़ बंद' : '🔇 Voice Off')
              }
            </button>
            {isVoiceEnabled && (
              <button
                onClick={() => {
                  const repeatMessages: Record<string, string> = {
                    'en': 'Get started now by clicking the connect button',
                    'hi': 'कनेक्ट बटन पर क्लिक करके अभी शुरू करें',
                    'bn': 'এখনই সংযোগ বোতামে ক্লিক করে শুরু করুন',
                    'te': 'ఇప్పుడు కనెక్ట్ బటన్ క్లిక్ చేసి ప్రారంభించండి',
                    'ta': 'இப்போது இணைப்பு பொத்தானை கிளிக் செய்து தொடங்கவும்',
                    'mr': 'आत्ताच कनेक्ट बटणावर क्लिक करून सुरू करा',
                  };
                  speakInLanguage(repeatMessages[uiLanguage] || repeatMessages['en'], uiLanguage);
                }}
                className="px-6 py-3 font-medium text-gray-600 transition-all duration-300 border rounded-full bg-white/80 border-white/50 hover:bg-white"
              >
                {uiLanguage === 'hi' ? '🗣️ निर्देश दोहराएं' : '🗣️ Repeat Instructions'}
              </button>
            )}
          </div>
        </div>

        {/* Connection Interface */}
        <div className="p-8 border shadow-lg bg-white/90 backdrop-blur-lg rounded-3xl md:p-12 border-white/50">
          <div className="flex flex-col items-center justify-center h-full">
            {error && (
              <div className="p-4 mb-8 text-center text-red-700 bg-red-100 border-red-300 rounded-xl">
                {error}
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-12 py-4 text-xl font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl flex items-center justify-center gap-3 min-w-[240px]"
            >
              {isConnecting ? (
                <>
                  <svg className="w-8 h-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {getUIText('connecting', uiLanguage, 'home')}
                </>
              ) : (
                <>
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                  </svg>
                  {getUIText('connect', uiLanguage, 'home')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// LiveKit Agent Interface Component
function LiveKitAgentInterface({
  onDisconnect,
  language,
  onLanguageChange,
  onEnhancedInput,
  conversationHistory
}: {
  onDisconnect: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onEnhancedInput: (input: string) => Promise<any>;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
}) {
  const router = useRouter();
  const { state, audioTrack } = useVoiceAssistant();
  const room = useRoomContext();
  const participants = useParticipants();
  const chat = useChat();
  const [lastResponse, setLastResponse] = useState<string>('');
  const [navigationAttempts, setNavigationAttempts] = useState<string[]>([]);
  const [agentTranscripts, setAgentTranscripts] = useState<string[]>([]);
  const [voiceOutput, setVoiceOutput] = useState<string>('');

  // 🚨 BULLETPROOF HARDCODED NAVIGATION - CANNOT FAIL! 🚨
  useDataChannel((message) => {
    console.log('🔥🔥🔥 BULLETPROOF NAVIGATION HANDLER ACTIVATED! 🔥🔥🔥');

    try {
      const data = JSON.parse(new TextDecoder().decode(message.payload));
      console.log('📦 Received LiveKit data:', data);

      // HARDCODED URL MAPPING - EXACT URLS YOU WANT!
      const HARDCODED_URLS = {
        'tasks': 'http://localhost:3000/tasks',
        'task': 'http://localhost:3000/tasks',
        'community': 'http://localhost:3000/community/feed',
        'feed': 'http://localhost:3000/community/feed',
        'farm': 'http://localhost:3000/my-farm',
        'my-farm': 'http://localhost:3000/my-farm',
        'my farm': 'http://localhost:3000/my-farm',
        'market': 'http://localhost:3000/market-prices',
        'market-prices': 'http://localhost:3000/market-prices',
        'prices': 'http://localhost:3000/market-prices'
      };

      // Method 1: Handle Python AI Agent Navigation (NEW!)
      if (data.type === 'navigate' && data.url) {
        const targetUrl = data.url;
        // Convert relative URLs to full URLs
        const fullUrl = targetUrl.startsWith('http') ? targetUrl : `http://localhost:3000${targetUrl}`;

        console.log(`🤖 AI AGENT NAVIGATION: ${targetUrl} -> ${fullUrl}`);
        window.location.href = fullUrl;
        return;
      }

      // Method 2: Direct navigation with HARDCODED URLS
      if (data.type === 'navigation_request' && data.action === 'navigate') {
        const targetPage = data.page?.toLowerCase() || '';
        const hardcodedUrl = HARDCODED_URLS[targetPage as keyof typeof HARDCODED_URLS];

        if (hardcodedUrl) {
          console.log(`�🚀 HARDCODED NAVIGATION: ${targetPage} -> ${hardcodedUrl}`);
          window.location.href = hardcodedUrl; // FORCE REDIRECT!
          return;
        }
      }

      // Method 2: Scan ALL content for keywords - FORCE REDIRECT
      const allContent = JSON.stringify(data).toLowerCase();
      console.log('🔍 Scanning content for keywords...');

      for (const [keyword, url] of Object.entries(HARDCODED_URLS)) {
        if (allContent.includes(keyword)) {
          console.log(`🎯🎯 KEYWORD DETECTED: "${keyword}" -> FORCING REDIRECT TO: ${url}`);
          window.location.href = url; // NUCLEAR OPTION - CANNOT FAIL!
          return;
        }
      }

      // Method 3: Store responses for backup processing
      if (data.message || data.text || data.content) {
        const responseText = data.message || data.text || data.content;
        console.log('📝 Agent response:', responseText);
        setLastResponse(responseText);
        setAgentTranscripts(prev => [...prev, responseText]);
      }

    } catch (error) {
      console.error('❌ JSON parsing failed, trying RAW analysis...');

      // Method 4: RAW TEXT - LAST RESORT HARDCODED MAPPING
      const rawText = new TextDecoder().decode(message.payload).toLowerCase();
      console.log('📄 RAW MESSAGE:', rawText);

      const HARDCODED_URLS = {
        'tasks': 'http://localhost:3000/tasks',
        'task': 'http://localhost:3000/tasks',
        'community': 'http://localhost:3000/community/feed',
        'feed': 'http://localhost:3000/community/feed',
        'farm': 'http://localhost:3000/my-farm',
        'my-farm': 'http://localhost:3000/my-farm',
        'my farm': 'http://localhost:3000/my-farm',
        'market': 'http://localhost:3000/market-prices',
        'market-prices': 'http://localhost:3000/market-prices',
        'prices': 'http://localhost:3000/market-prices'
      };

      for (const [keyword, url] of Object.entries(HARDCODED_URLS)) {
        if (rawText.includes(keyword)) {
          console.log(`🎯🎯 RAW KEYWORD MATCH: "${keyword}" -> NUCLEAR REDIRECT TO: ${url}`);
          window.location.href = url; // ABSOLUTE FORCE REDIRECT!
          return;
        }
      }
    }
  });

  // Simple approach: Focus on LiveKit data channel and voice state monitoring
  // Removed console interception to prevent infinite loops

  // Enhanced monitoring to capture actual voice agent responses
  useEffect(() => {
    console.log('🎤 Setting up enhanced voice agent response monitoring...');

    // Check if lastResponse contains navigation patterns
    if (lastResponse && lastResponse.length > 10) {
      console.log('� Processing lastResponse for navigation...', lastResponse.substring(0, 100));

      // Direct pattern check for navigation markers
      const htmlComment = lastResponse.match(/<!-- NAVIGATE:([^>]+) -->/);
      const redirectCommand = lastResponse.match(/\*\*🔄 REDIRECT_COMMAND:([^*]+)\*\*/);

      let targetUrl = null;

      if (htmlComment) {
        targetUrl = htmlComment[1].trim();
        console.log('✅ HTML comment navigation found:', targetUrl);
      } else if (redirectCommand) {
        targetUrl = redirectCommand[1].trim();
        console.log('✅ Redirect command navigation found:', targetUrl);
      }

      if (targetUrl && targetUrl !== window.location.pathname) {
        console.log(`🚀 Executing direct navigation to: ${targetUrl}`);
        setNavigationAttempts(prev => [...prev,
        `${new Date().toLocaleTimeString()}: Direct → ${targetUrl}`
        ]);

        setTimeout(() => {
          router.push(targetUrl);
        }, 1000);
      }
    }

    // Also monitor agent transcripts
    if (agentTranscripts.length > 0) {
      const latestTranscript = agentTranscripts[agentTranscripts.length - 1];
      console.log('📋 Checking latest agent transcript:', latestTranscript.substring(0, 100));

      // Check for navigation patterns in transcript
      const redirectCommand = latestTranscript.match(/\*\*🔄 REDIRECT_COMMAND:([^*]+)\*\*/);
      if (redirectCommand) {
        const targetUrl = redirectCommand[1].trim();
        if (targetUrl !== window.location.pathname) {
          console.log(`� Navigation from transcript: ${targetUrl}`);
          router.push(targetUrl);
        }
      }
    }

  }, [lastResponse, agentTranscripts, router]);

  // Critical: Monitor voice assistant state changes to capture agent responses
  useEffect(() => {
    console.log('🎤 Voice assistant state changed:', state);

    // When agent stops speaking, we need to capture what it said
    if (state === 'thinking' || state === 'listening') {
      console.log('🤖 Agent finished speaking, checking for responses...');

      // Look for any new content that appeared while agent was speaking
      setTimeout(() => {
        // Check console output, DOM changes, or any text that might contain navigation
        const recentContent = document.body.textContent || '';
        if (recentContent.includes('redirect') || recentContent.includes('navigat') || recentContent.includes('taking you')) {
          console.log('📝 Found potential agent navigation response in page content');
          setLastResponse(recentContent);
        }
      }, 1000);
    }
  }, [state, agentTranscripts.length]);

  // ULTIMATE ROOM EVENT MONITORING - CAPTURE EVERYTHING!
  useEffect(() => {
    if (room && room.state === 'connected') {
      console.log('🚨🚨 ULTIMATE ROOM MONITORING ACTIVE! 🚨🚨');

      const eventHandlers = {
        dataReceived: (payload: Uint8Array, participant?: any) => {
          console.log('🔥 DATA RECEIVED EVENT!', { payloadSize: payload.length, participant });

          try {
            const text = new TextDecoder().decode(payload);
            console.log('📝 Data decoded:', text.substring(0, 200));

            // 🚨 HARDCODED NUCLEAR NAVIGATION - CANNOT FAIL! 🚨
            const NUCLEAR_URLS = {
              'tasks': 'http://localhost:3000/tasks',
              'task': 'http://localhost:3000/tasks',
              'community': 'http://localhost:3000/community/feed',
              'feed': 'http://localhost:3000/community/feed',
              'farm': 'http://localhost:3000/my-farm',
              'my-farm': 'http://localhost:3000/my-farm',
              'my farm': 'http://localhost:3000/my-farm',
              'market': 'http://localhost:3002/market-prices',
              'market-prices': 'http://localhost:3002/market-prices',
              'prices': 'http://localhost:3002/market-prices'
            };

            const lowerText = text.toLowerCase();
            console.log('🔍 Checking for keywords in:', lowerText.substring(0, 100));

            // NUCLEAR OPTION - CHECK EVERY KEYWORD
            for (const [keyword, url] of Object.entries(NUCLEAR_URLS)) {
              if (lowerText.includes(keyword)) {
                console.log(`💥💥 NUCLEAR NAVIGATION TRIGGERED: "${keyword}" -> ${url}`);
                console.log(`💥💥 FORCING REDIRECT WITH window.location.href`);
                window.location.href = url; // ABSOLUTE NUCLEAR REDIRECT!
                return; // STOP EVERYTHING ELSE
              }
            }

          } catch (e) {
            console.log('📄 Binary/non-text data received');
          }
        }
      };

      // Attach event listener
      room.on('dataReceived', eventHandlers.dataReceived);

      return () => {
        room.off('dataReceived', eventHandlers.dataReceived);
      };
    }
  }, [room, router]);

  // Monitor participants for agent responses
  useEffect(() => {
    if (participants.length > 0) {
      console.log('👥 Participants updated:', participants.map(p => ({
        identity: p.identity,
        isLocal: p.isLocal,
        speaking: p.isSpeaking,
        hasAudio: p.audioTrackPublications.size > 0
      })));

      // Check if agent is speaking
      const agent = participants.find(p => !p.isLocal);
      if (agent?.isSpeaking) {
        console.log('🗣️ Agent is currently speaking');
      }
    }
  }, [participants]);

  // Enhanced approach: Monitor LiveKit audio events and create navigation triggers
  useEffect(() => {
    if (!room) return;

    console.log('🔍 Setting up enhanced voice response monitoring...');

    // Focus on monitoring the voice assistant state and creating direct navigation triggers
    let responseCheckInterval: NodeJS.Timeout;

    const startResponseMonitoring = () => {
      let previousState = state;
      let stateChangeCount = 0;

      responseCheckInterval = setInterval(() => {
        stateChangeCount++;

        // Detect when agent finishes speaking (state changes from speaking to listening/thinking)
        if (previousState === 'speaking' && (state === 'listening' || state === 'thinking')) {
          console.log('🤖 Agent finished speaking, checking for navigation intent...');

          // Simulate common navigation scenarios based on voice commands
          // This is a fallback mechanism when other methods fail
          const currentUrl = window.location.pathname;

          setTimeout(() => {
            // Check if user might have asked for navigation (this is a heuristic approach)
            const possibleNavigationPages = ['/tasks', '/my-farm', '/community', '/crop-recommendations', '/market-prices'];

            // For now, let's focus on the data channel approach and manual testing
            console.log('🔄 Voice state changed - ready for navigation commands');
          }, 1000);
        }

        previousState = state;

        // Stop after 5 minutes
        if (stateChangeCount > 600) {
          clearInterval(responseCheckInterval);
        }
      }, 500);
    };

    // Start monitoring when room is connected
    if (room.state === 'connected') {
      startResponseMonitoring();
    }

    return () => {
      if (responseCheckInterval) {
        clearInterval(responseCheckInterval);
      }
    };
  }, [room, state]);

  // Add comprehensive response interceptor for all agent outputs
  useEffect(() => {
    if (!room) return;

    console.log('🔧 Setting up comprehensive navigation interceptor and LiveKit monitoring...');

    // Monitor LiveKit room events for transcripts and responses
    const monitorRoomEvents = () => {
      if (room && room.engine) {
        console.log('🏠 Room available, setting up event listeners...');

        // Listen for all room events
        const handleRoomEvent = (event: any, ...args: any[]) => {
          console.log('� Room event:', event, args);
        };

        // Listen for track subscriptions (when agent starts speaking)
        const handleTrackSubscribed = (track: any, publication: any, participant: any) => {
          console.log('� Track subscribed:', {
            track: track?.kind,
            participant: participant?.identity,
            source: publication?.source
          });

          // If it's an agent audio track, monitor for transcripts
          if (participant?.identity?.includes('agent') || participant?.identity?.includes('assistant')) {
            console.log('🤖 Agent audio track detected');
          }
        };

        // Listen for data messages (this is key for agent responses)
        const handleDataReceived = (payload: Uint8Array, participant: any, kind: any) => {
          try {
            const message = new TextDecoder().decode(payload);
            console.log('� Data received from participant:', participant?.identity, message);

            // Check if it's an agent response
            if (participant?.identity?.includes('agent') || participant?.identity?.includes('assistant')) {
              console.log('🤖 Agent data message:', message);
              setLastResponse(message);
              setAgentTranscripts(prev => [...prev, message]);
            }
          } catch (error) {
            console.log('Error decoding data message:', error);
          }
        };

        // Simplified approach - just monitor participants and data messages
        console.log('✅ Room monitoring active');

        return () => {
          console.log('ℹ️ Room monitoring cleanup');
        };
      }
      return undefined;
    };

    // Create a comprehensive response interceptor that catches ALL text changes
    const interceptAllResponses = () => {
      // Precise patterns to catch navigation statements (fixed order and specificity)
      const navigationPatterns = [
        // Technical navigation markers (highest priority - most reliable)
        /<!-- NAVIGATE:([^>]+) -->/,
        /\*\*🔄 REDIRECT_COMMAND:([^*]+)\*\*/,
        /<script>window\.location\.href='([^']+)';<\/script>/,

        // Natural language navigation statements (specific patterns)
        /I.*(?:redirected|navigated|directed).*you.*to.*(?:the\s+)?([a-z][a-z-]+)(?:\s+page)?/i,
        /(?:taking|bringing).*you.*to.*(?:the\s+)?([a-z][a-z-]+)(?:\s+page)?/i,
        /(?:opening|showing).*(?:the\s+)?([a-z][a-z-]+)(?:\s+page)/i,
        /Let me (?:take|bring|direct) you to (?:the\s+)?([a-z][a-z-]+)/i,

        // Less specific patterns (lower priority)
        /(?:go to|visit|check out) (?:the\s+)?([a-z][a-z-]+)/i
      ];

      // Function to extract and execute navigation (with deduplication)
      let lastNavigationTime = 0;
      let lastNavigationUrl = '';

      const processNavigation = (textContent: string, source: string) => {
        // Skip debug content and navigation logs to prevent recursion
        if (textContent.includes('Navigation Debug Log') ||
          textContent.includes('Pattern') ||
          textContent.includes('Executing navigation') ||
          textContent.includes('🔍') ||
          textContent.includes('🎯')) {
          return false;
        }

        console.log(`🔍 Checking content from ${source}:`, textContent.substring(0, 80));

        // Process patterns in order (most reliable first)
        for (let idx = 0; idx < navigationPatterns.length; idx++) {
          const pattern = navigationPatterns[idx];
          const match = textContent.match(pattern);

          if (match) {
            let url = match[1]?.trim();

            // Clean and validate URL
            if (url) {
              // Handle common page names
              const pageMap: { [key: string]: string } = {
                'task': '/tasks',
                'tasks': '/tasks',
                'farm': '/my-farm',
                'my-farm': '/my-farm',
                'myfarm': '/my-farm',
                'community': '/community',
                'crop': '/crop-recommendations',
                'crops': '/crop-recommendations',
                'market': '/market-prices',
                'home': '/',
                'dashboard': '/'
              };

              url = pageMap[url.toLowerCase()] || url;
              if (!url.startsWith('/')) url = `/${url}`;

              // Prevent duplicate navigation within 2 seconds
              const now = Date.now();
              if (url === lastNavigationUrl && (now - lastNavigationTime) < 2000) {
                console.log(`⏭️ Skipping duplicate navigation to ${url}`);
                return false;
              }

              console.log(`🎯 Pattern ${idx + 1} matched navigation to: ${url} from ${source}`);

              setNavigationAttempts(prev => [...prev,
              `${new Date().toLocaleTimeString()}: ${source} → P${idx + 1} → ${url}`
              ]);

              if (url && url !== window.location.pathname) {
                lastNavigationTime = now;
                lastNavigationUrl = url;

                console.log(`🚀 Executing navigation to: ${url}`);
                router.push(url);
                return true; // Stop processing after successful match
              } else {
                console.log(`ℹ️ Already on target page: ${url}`);
              }
            }
          }
        }
        return false;
      };

      // Monitor DOM changes with MutationObserver
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || '';
                if (text.length > 20) {
                  processNavigation(text, 'DOM-Text');
                }
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                const text = element.textContent || '';
                if (text.length > 20) {
                  processNavigation(text, 'DOM-Element');
                }
              }
            });
          } else if (mutation.type === 'characterData') {
            const text = mutation.target.textContent || '';
            if (text.length > 20) {
              processNavigation(text, 'DOM-CharData');
            }
          }
        });
      });

      // Observe the entire document for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: false
      });

      return () => {
        observer.disconnect();
      };
    };

    const roomCleanup = monitorRoomEvents();
    const interceptorCleanup = interceptAllResponses();

    return () => {
      roomCleanup && roomCleanup();
      interceptorCleanup && interceptorCleanup();
    };
  }, [room, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-4xl p-8 border border-gray-200 shadow-lg bg-white/90 backdrop-blur-lg rounded-3xl md:p-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-800">
            AgroMitra Real-time Assistant
          </h2>
          <p className="mb-4 text-gray-600">
            {state === "listening" ? "🎤 Listening to your farming questions..." :
              state === "speaking" ? "🗣️ Providing farming guidance..." :
                "🌱 Ready to help with your farming needs"}
          </p>

          {/* Debug Info */}
          <div className="mb-4 text-xs text-gray-500">
            Current Page: {typeof window !== 'undefined' ? window.location.pathname : 'Loading...'}
            {lastResponse && (
              <div className="p-2 mt-1 bg-gray-100 rounded">
                Last Response Preview: {lastResponse.substring(0, 50)}...
              </div>
            )}
          </div>

          {/* Language Selector */}
          {/* <div className="flex justify-center">
            <div className="p-1 border bg-white/10 backdrop-blur-lg rounded-xl border-white/20">
              {['en', 'hi', 'es'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`px-3 py-1 text-sm rounded-lg transition-all duration-300 ${
                    language === lang
                      ? 'bg-green-500 text-white'
                      : 'text-green-100 hover:bg-white/10'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हि' : 'ES'}
                </button>
              ))}
            </div>
          </div> */}
        </div>

        {/* Visualizer */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center justify-center w-full h-32 max-w-lg p-4 border border-gray-200 bg-gray-50 rounded-2xl">
            {audioTrack ? (
              <BarVisualizer
                state={state}
                barCount={20}
                trackRef={audioTrack}
                className="w-full h-full"
                options={{
                  minHeight: 4,
                  maxHeight: 80,
                }}
              />
            ) : (
              <div className="text-center text-gray-600">
                <svg className="w-16 h-16 mx-auto mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p className="text-sm">Voice interface ready</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <VoiceAssistantControlBar />

          {/* Enhanced Test Navigation Section */}
          <div className="space-y-2">
            {/* Test Voice Agent Response (Clean) */}
            {/* <button
              onClick={() => {
                console.log('🎤 TESTING CLEAN VOICE AGENT RESPONSE...');
                
                // Simulate the EXACT response the voice agent sends
                const cleanAgentResponse = `Perfect! I've redirected you to the community page.

<!-- NAVIGATE:/community -->

**🔄 REDIRECT_COMMAND:/community**

I'm redirecting you to the community page.`;

                console.log('📝 Simulating clean agent response:', cleanAgentResponse);
                
                // Update lastResponse (this should trigger our navigation interceptor)
                setLastResponse(cleanAgentResponse);
                setAgentTranscripts(prev => [...prev, cleanAgentResponse]);
                
                // Also simulate data channel message
                const agentNavigationData = {
                  type: "navigation_request", 
                  action: "navigate", 
                  page: "community",
                  url: "/community",
                  message: "Navigating to community page"
                };
                
                // Simulate data channel reception
                setTimeout(() => {
                  console.log('� Simulating data channel message:', agentNavigationData);
                  
                  if (agentNavigationData.url !== window.location.pathname) {
                    setNavigationAttempts(prev => [...prev, 
                      `${new Date().toLocaleTimeString()}: Data Channel → ${agentNavigationData.url}`
                    ]);
                    router.push(agentNavigationData.url);
                  }
                }, 500);
              }}
              className="w-full px-4 py-3 text-sm font-semibold text-white transition-all duration-300 border bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-purple-500/50 rounded-xl"
            >
              🎤 Start Voice Chat
            </button> */}


            {/* Navigation Debug Info */}
            {/* {navigationAttempts.length > 0 && (
              <div className="p-3 border rounded-lg bg-black/20 border-gray-500/30">
                <div className="mb-2 text-xs text-gray-300">Navigation Debug Log:</div>
                <div className="space-y-1 overflow-y-auto max-h-20">
                  {navigationAttempts.slice(-3).map((attempt, idx) => (
                    <div key={idx} className="font-mono text-xs text-green-300">
                      {attempt}
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {/* Agent Transcripts Debug */}
            {/* {agentTranscripts.length > 0 && (
              <div className="p-3 border rounded-lg bg-purple-900/20 border-purple-500/30">
                <div className="mb-2 text-xs text-purple-300">Agent Responses Captured ({agentTranscripts.length}):</div>
                <div className="space-y-1 overflow-y-auto max-h-20">
                  {agentTranscripts.slice(-2).map((transcript, idx) => (
                    <div key={idx} className="font-mono text-xs text-purple-200">
                      {transcript.substring(0, 60)}...
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {/* Voice State Debug */}
            {/* <div className="p-2 border rounded-lg bg-indigo-900/20 border-indigo-500/30">
              <div className="mb-1 text-xs text-indigo-300">Voice Debug:</div>
              <div className="space-x-2 text-xs text-indigo-200">
                <span>State: {state}</span>
                <span>Participants: {participants.length}</span>
                <span>Audio: {audioTrack ? '✅' : '❌'}</span>
              </div>
            </div> */}
          </div>

          <button
            onClick={onDisconnect}
            className="w-full px-6 py-3 font-semibold text-white transition-all duration-300 bg-red-500 shadow-lg hover:bg-red-600 rounded-2xl hover:scale-105"
          >
            End Voice Session
          </button>
        </div>



        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="p-4 mt-6 border border-gray-200 bg-gray-50 rounded-xl">
            <h4 className="mb-3 font-semibold text-gray-800">Recent Conversation</h4>
            <div className="space-y-2 overflow-y-auto max-h-32">
              {conversationHistory.slice(-2).map((msg, idx) => (
                <div key={idx} className="text-sm text-gray-700">
                  <strong>{msg.role === 'user' ? 'You' : 'AgroMitra'}:</strong> {msg.content.substring(0, 100)}
                  {msg.content.length > 100 ? '...' : ''}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🚨 NUCLEAR TEST PANEL - HARDCODED URLS! 🚨 */}
        {/* <div className="p-4 mt-6 border-2 border-red-500 bg-red-500/20 rounded-xl">
          <h4 className="mb-3 font-bold text-center text-red-200">🚨 NUCLEAR NAVIGATION TESTS 🚨</h4>
          <p className="mb-4 text-xs text-center text-red-100">These buttons use window.location.href to FORCE redirect to exact URLs</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                console.log('💥 NUCLEAR TEST: HARDCODED window.location to tasks');
                window.location.href = 'http://localhost:3002/tasks';
              }}
              className="px-4 py-3 text-sm font-bold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 hover:scale-105"
            >
              💥 NUCLEAR TASKS
            </button>
            <button
              onClick={() => {
                console.log('💥 NUCLEAR TEST: HARDCODED window.location to community');
                window.location.href = 'http://localhost:3002/community/feed';
              }}
              className="px-4 py-3 text-sm font-bold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 hover:scale-105"
            >
              💥 NUCLEAR COMMUNITY
            </button>
            <button
              onClick={() => {
                console.log('💥 NUCLEAR TEST: HARDCODED window.location to farm');
                window.location.href = 'http://localhost:3002/my-farm';
              }}
              className="px-4 py-3 text-sm font-bold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 hover:scale-105"
            >
              💥 NUCLEAR FARM
            </button>
            <button
              onClick={() => {
                console.log('💥 NUCLEAR TEST: HARDCODED window.location to market');
                window.location.href = 'http://localhost:3002/market-prices';
              }}
              className="px-4 py-3 text-sm font-bold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 hover:scale-105"
            >
              💥 NUCLEAR MARKET
            </button>
          </div>
          
          <div className="pt-4 mt-4 border-t border-red-400">
            <h5 className="mb-2 font-semibold text-center text-red-100">🎤 Voice Command Simulators</h5>
            <p className="mb-3 text-xs text-center text-red-100">Test what happens when AI says these keywords</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  console.log('🎤 SIMULATING: Agent said "tasks"');
                  window.location.href = 'http://localhost:3002/tasks';
                }}
                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                🎤 "tasks"
              </button>
              <button
                onClick={() => {
                  console.log('🎤 SIMULATING: Agent said "community"');
                  window.location.href = 'http://localhost:3002/community/feed';
                }}
                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                🎤 "community"
              </button>
              <button
                onClick={() => {
                  console.log('🎤 SIMULATING: Agent said "farm"');
                  window.location.href = 'http://localhost:3002/my-farm';
                }}
                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                🎤 "farm"
              </button>
              <button
                onClick={() => {
                  console.log('🎤 SIMULATING: Agent said "market"');
                  window.location.href = 'http://localhost:3002/market-prices';
                }}
                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                🎤 "market"
              </button>
            </div>
          </div>
        </div> */}
      </div>

      <RoomAudioRenderer />
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 transition-all duration-300 border border-gray-200 bg-white/90 backdrop-blur-lg rounded-xl hover:bg-white hover:shadow-lg">
      <div className="flex justify-center mb-4 text-green-600">{icon}</div>
      <h3 className="mb-2 text-lg font-bold text-center text-gray-800">{title}</h3>
      <p className="text-sm text-center text-gray-600">{description}</p>
    </div>
  );
}

// Icons
const RealtimeIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const FarmingIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const MultilingualIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
  </svg>
);

const SmartIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);