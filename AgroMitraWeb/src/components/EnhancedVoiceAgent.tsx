'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEnhancedVoiceAgent, UserContext } from '@/lib/enhanced-voice-agent';
import { componentClasses } from '@/lib/theme';
import { ragSystem } from '@/lib/rag-system';

interface VoiceAgentComponentProps {
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

export default function EnhancedVoiceAgent({ userContext = defaultUserContext }: VoiceAgentComponentProps) {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState(userContext.preferences.language);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  const { processInput, conversationHistory, updateUserContext } = useEnhancedVoiceAgent(userContext);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      // Initialize RAG system
      ragSystem.initializeKnowledgeBase();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Audio level visualization
  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);
    }
    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isListening]);

  // Start listening
  const startListening = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio analysis for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      updateAudioLevel();
      
      // Provide greeting in selected language
      const greeting = getGreeting(language);
      speakText(greeting);
      
    } catch (err) {
      console.error('Error starting voice recognition:', err);
      setError('Could not access microphone. Please check permissions and try again.');
    }
  }, [language]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isListening]);

  // Process audio using Web Speech API (simplified version)
  const processAudio = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // For demonstration, we'll use a simulated transcription
      // In production, you would send the audio to a speech-to-text service
      const mockTranscription = await simulateTranscription(audioBlob);
      
      if (mockTranscription) {
        const result = await processInput(mockTranscription);
        setCurrentResponse(result.response);
        
        // Speak the response
        speakText(result.response);
        
        // Handle redirects
        if (result.shouldRedirect && result.redirectTo) {
          setTimeout(() => {
            router.push(result.redirectTo!);
          }, 2000); // Give time for speech to complete
        }
      }
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Sorry, I had trouble processing your request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [processInput, router]);

  // Simulate transcription for demo
  const simulateTranscription = async (audioBlob: Blob): Promise<string> => {
    // This would be replaced with actual speech-to-text API
    const demoQueries = [
      "What's the weather like today?",
      "Show me crop recommendations",
      "What tasks do I need to do?",
      "Check market prices for wheat",
      "My plants have yellow spots on leaves",
      "Take me to my farm section",
      "What crops should I plant this season?",
      "How do I control pests in tomatoes?",
      "मौसम कैसा है?", // Hindi: How's the weather?
      "¿Qué cultivos debo plantar?" // Spanish: What crops should I plant?
    ];
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
    return demoQueries[Math.floor(Math.random() * demoQueries.length)];
  };

  // Text-to-speech
  const speakText = useCallback((text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel(); // Stop any current speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getVoiceLang(language);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      synthRef.current.speak(utterance);
    }
  }, [language]);

  // Helper functions
  const getGreeting = (lang: string): string => {
    const greetings: Record<string, string> = {
      en: "Hello! I'm AgroMitra, your farming assistant. How can I help you today?",
      hi: "नमस्कार! मैं एग्रोमित्र हूँ, आपका कृषि सहायक। आज मैं आपकी कैसे सहायता कर सकता हूँ?",
      es: "¡Hola! Soy AgroMitra, tu asistente agrícola. ¿Cómo puedo ayudarte hoy?"
    };
    return greetings[lang] || greetings.en;
  };

  const getVoiceLang = (lang: string): string => {
    const langMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      es: 'es-ES'
    };
    return langMap[lang] || 'en-US';
  };

  const getLanguageName = (code: string): string => {
    const names: Record<string, string> = {
      en: 'English',
      hi: 'हिन्दी',
      es: 'Español'
    };
    return names[code] || code;
  };

  return (
    <div className="bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 min-h-screen flex items-center justify-center py-8">
      <div className={`${componentClasses.container} max-w-4xl`}>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-6 bg-white/10 backdrop-blur-lg rounded-3xl mb-6 shadow-2xl">
            <svg
              className="w-16 h-16 text-green-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            AgroMitra
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 mt-2">
              Voice Assistant
            </span>
          </h1>
          
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your AI-powered farming companion with multi-language support
          </p>

          {/* Language Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
              {['en', 'hi', 'es'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    updateUserContext({ 
                      preferences: { ...userContext.preferences, language: lang }
                    });
                  }}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                    language === lang
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'text-green-100 hover:bg-white/10'
                  }`}
                >
                  {getLanguageName(lang)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Voice Interface */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
          {/* Audio Visualizer */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div 
                className={`w-32 h-32 rounded-full border-4 transition-all duration-300 ${
                  isListening 
                    ? 'border-green-400 bg-green-400/20 shadow-lg' 
                    : isProcessing
                    ? 'border-blue-400 bg-blue-400/20 shadow-lg animate-pulse'
                    : 'border-purple-400 bg-purple-400/20'
                }`}
              >
                {/* Audio level visualization */}
                {isListening && (
                  <div 
                    className="absolute inset-2 bg-green-400 rounded-full transition-all duration-150"
                    style={{ 
                      opacity: Math.min(audioLevel / 128, 1),
                      transform: `scale(${0.5 + (audioLevel / 256)})`
                    }}
                  />
                )}
                
                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isProcessing ? (
                    <svg className="w-12 h-12 text-blue-300 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg 
                      className={`w-12 h-12 transition-colors duration-300 ${
                        isListening ? 'text-green-300' : 'text-purple-300'
                      }`} 
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
                  )}
                </div>
              </div>
            </div>

            {/* Status Text */}
            <div className="mt-4">
              <p className="text-2xl font-semibold text-white mb-2">
                {isListening 
                  ? 'Listening...' 
                  : isProcessing 
                  ? 'Processing...' 
                  : 'Ready to Help'
                }
              </p>
              <p className="text-green-200">
                {isListening 
                  ? 'Speak your farming question' 
                  : isProcessing 
                  ? 'Analyzing your request' 
                  : 'Click to start voice conversation'
                }
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="text-center mb-8">
            {!isListening && !isProcessing && (
              <button
                onClick={startListening}
                className={`${componentClasses.button.primary} px-12 py-4 text-xl font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl`}
              >
                <span className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Start Voice Chat
                </span>
              </button>
            )}

            {isListening && (
              <button
                onClick={stopListening}
                className="px-12 py-4 text-xl font-semibold bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Stop Listening
                </span>
              </button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className={`${componentClasses.alert.error} mb-6 bg-red-500/20 border-red-500/50 text-red-200`}>
              {error}
            </div>
          )}

          {/* Current Response */}
          {currentResponse && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-blue-200 font-semibold mb-2">AgroMitra says:</h4>
                  <p className="text-blue-100 whitespace-pre-wrap leading-relaxed">{currentResponse}</p>
                </div>
              </div>
            </div>
          )}

          {/* Conversation History */}
          {conversationHistory.length > 0 && (
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-4">Recent Conversation</h4>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {conversationHistory.slice(-3).map((msg, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-green-500/20 border-green-500/30' 
                      : 'bg-purple-500/20 border-purple-500/30'
                  } border`}>
                    <p className="text-sm text-white/90">
                      <strong>{msg.role === 'user' ? 'You' : 'AgroMitra'}:</strong> {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <h4 className="text-white font-semibold mb-4 text-center">Quick Actions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickActionButton 
                icon={<CloudIcon />} 
                label="Weather" 
                onClick={() => router.push('/')} 
              />
              <QuickActionButton 
                icon={<TaskIcon />} 
                label="Tasks" 
                onClick={() => router.push('/tasks')} 
              />
              <QuickActionButton 
                icon={<FarmIcon />} 
                label="My Farm" 
                onClick={() => router.push('/my-farm')} 
              />
              <QuickActionButton 
                icon={<MarketIcon />} 
                label="Market" 
                onClick={() => router.push('/market-prices')} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({ 
  icon, 
  label, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300 hover:scale-105 text-center"
    >
      <div className="text-green-300 mb-2 flex justify-center">{icon}</div>
      <p className="text-white text-sm font-medium">{label}</p>
    </button>
  );
}

// Icons
const CloudIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const TaskIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const FarmIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const MarketIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);