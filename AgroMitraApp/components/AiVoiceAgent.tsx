import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Alert,
  Animated,
  ActivityIndicator, 
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5,
  Feather 
} from '@expo/vector-icons';
import Svg, { Circle, Path, G } from 'react-native-svg';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Voice Wave Animation Component
const VoiceWaveIcon = ({ isActive }: { isActive: boolean }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isActive, animatedValue]);

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Svg width="80" height="80" viewBox="0 0 100 100" fill="none">
        <Circle cx="50" cy="50" r="45" stroke="#E74C3C" strokeWidth="3" fill="none" opacity={isActive ? 0.3 : 0.1} />
        <Circle cx="50" cy="50" r="30" stroke="#E74C3C" strokeWidth="2" fill="none" opacity={isActive ? 0.5 : 0.2} />
        <Circle cx="50" cy="50" r="15" fill="#E74C3C" opacity={isActive ? 1 : 0.6} />
        {/* Sound waves */}
        <G opacity={isActive ? 1 : 0.3}>
          <Path d="M 65 45 Q 70 50 65 55" stroke="#E74C3C" strokeWidth="2" fill="none" />
          <Path d="M 70 40 Q 80 50 70 60" stroke="#E74C3C" strokeWidth="2" fill="none" />
          <Path d="M 35 45 Q 30 50 35 55" stroke="#E74C3C" strokeWidth="2" fill="none" />
          <Path d="M 30 40 Q 20 50 30 60" stroke="#E74C3C" strokeWidth="2" fill="none" />
        </G>
      </Svg>
    </Animated.View>
  );
};

// AI Agent Avatar
const AgentAvatar = () => (
  <Svg width="60" height="60" viewBox="0 0 100 100" fill="none">
    <Circle cx="50" cy="50" r="45" fill="#4CAF50" />
    <Circle cx="35" cy="40" r="6" fill="white" />
    <Circle cx="65" cy="40" r="6" fill="white" />
    <Circle cx="35" cy="40" r="3" fill="#2E7D32" />
    <Circle cx="65" cy="40" r="3" fill="#2E7D32" />
    <Path d="M 35 65 Q 50 75 65 65" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* AI Circuit pattern */}
    <Path d="M 30 25 L 40 25 L 40 20 M 60 25 L 70 25 L 70 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <Circle cx="25" cy="25" r="2" fill="white" />
    <Circle cx="75" cy="25" r="2" fill="white" />
  </Svg>
);

// Background Pattern Component
const CircularPattern = ({ 
  top, 
  right, 
  bottom, 
  left, 
  size, 
  color 
}: {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  size: number;
  color: string;
}) => (
  <View 
    style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size/2,
      backgroundColor: color,
      opacity: 0.6,
      top,
      right,
      bottom, 
      left,
      zIndex: -1
    }}
  />
);

interface VoiceAgentState {
  isListening: boolean;
  isProcessing: boolean;
  currentResponse: string;
  conversationHistory: Array<{
    type: 'user' | 'agent';
    message: string;
    timestamp: Date;
  }>;
  language: 'en' | 'hi' | 'es';
  isSpeaking: boolean;
}

const AiVoiceAgent = () => {
  const [state, setState] = useState<VoiceAgentState>({
    isListening: false,
    isProcessing: false,
    currentResponse: '',
    conversationHistory: [],
    language: 'en',
    isSpeaking: false
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const hasWelcomed = useRef(false);

  // Mock responses for different languages
  const getWelcomeMessage = (lang: string): string => {
    const messages: Record<string, string> = {
      en: "Hello! I'm AgroMitra, your intelligent farming assistant. I can help you with crop recommendations, weather updates, disease detection, and farming advice. How can I assist you today?",
      hi: "नमस्कार! मैं एग्रोमित्र हूँ, आपका बुद्धिमान कृषि सहायक। मैं फसल की सिफारिशें, मौसम अपडेट, रोग की पहचान और कृषि सलाह में आपकी मदद कर सकता हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?",
      es: "¡Hola! Soy AgroMitra, tu asistente agrícola inteligente. Puedo ayudarte con recomendaciones de cultivos, actualizaciones del clima, detección de enfermedades y consejos agrícolas. ¿Cómo puedo ayudarte hoy?"
    };
    return messages[lang] || messages.en;
  };

  const getMockResponse = (lang: string): string => {
    const responses: Record<string, string[]> = {
      en: [
        "Based on your location and soil type, I recommend planting wheat this season for optimal yield.",
        "The weather forecast shows light rain tomorrow. It's a good time for irrigation planning.",
        "I detected potential nutrient deficiency in your crops. Consider using organic fertilizers.",
        "Your farm's soil pH is ideal for tomato cultivation. Would you like specific planting guidelines?",
        "Market prices for wheat are trending upward. This could be a profitable harvest season."
      ],
      hi: [
        "आपके स्थान और मिट्टी के प्रकार के आधार पर, मैं इस सीजन में गेहूं की बुवाई की सिफारिश करता हूँ।",
        "मौसम पूर्वानुमान कल हल्की बारिश दिखाता है। सिंचाई की योजना बनाने का अच्छा समय है।",
        "मैंने आपकी फसलों में संभावित पोषक तत्वों की कमी का पता लगाया है। जैविक उर्वरकों का उपयोग करनेपर विचार करें।",
        "आपके खेत की मिट्टी का pH टमाटर की खेती के लिए आदर्श है। क्या आपको विशिष्ट रोपण दिशानिर्देश चाहिए?",
        "गेहूं के बाजार मूल्य ऊपर की ओर रुझान कर रहे हैं। यह एक लाभदायक फसल का मौसम हो सकता है।"
      ],
      es: [
        "Basándome en tu ubicación y tipo de suelo, recomiendo plantar trigo esta temporada para un rendimiento óptimo.",
        "El pronóstico del tiempo muestra lluvia ligera mañana. Es un buen momento para planificar el riego.",
        "Detecté una posible deficiencia de nutrientes en tus cultivos. Considera usar fertilizantes orgánicos.",
        "El pH del suelo de tu granja es ideal para el cultivo de tomate. ¿Te gustaría pautas específicas de plantación?",
        "Los precios del mercado del trigo están en tendencia ascendente. Esta podría ser una temporada de cosecha rentable."
      ]
    };
    const responseArray = responses[lang] || responses.en;
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  // Text-to-Speech Functions
  const speakText = useCallback(async (text: string, language: string) => {
    try {
      // Stop any current speech
      await Speech.stop();
      
      setState(prev => ({ ...prev, isSpeaking: true }));
      
      // Configure speech options based on language
      const speechOptions: Speech.SpeechOptions = {
        language: language === 'hi' ? 'hi-IN' : language === 'es' ? 'es-ES' : 'en-US',
        pitch: 1.0,
        rate: 0.8,
        onDone: () => {
          setState(prev => ({ ...prev, isSpeaking: false }));
        },
        onError: (error) => {
          console.log('Speech error:', error);
          setState(prev => ({ ...prev, isSpeaking: false }));
        }
      };
      
      await Speech.speak(text, speechOptions);
    } catch (error) {
      console.log('Speech error:', error);
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  const stopSpeaking = useCallback(async () => {
    try {
      await Speech.stop();
      setState(prev => ({ ...prev, isSpeaking: false }));
    } catch (error) {
      console.log('Error stopping speech:', error);
    }
  }, []);

  // Welcome user on component mount
  useEffect(() => {
    if (!hasWelcomed.current) {
      hasWelcomed.current = true;
      const welcomeMessage = getWelcomeMessage(state.language);
      
      // Delay welcome message slightly to ensure component is ready
      setTimeout(() => {
        speakText(welcomeMessage, state.language);
      }, 1000);
    }
  }, [state.language, speakText]);

  // Pulse animation for listening state
  useEffect(() => {
    if (state.isListening) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [state.isListening, pulseAnim]);

  const startListening = useCallback(async () => {
    setState(prev => ({ ...prev, isListening: true }));
    
    // Simulate listening for 3 seconds
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        isListening: false, 
        isProcessing: true 
      }));
      
      // Simulate processing
      setTimeout(() => {
        const mockUserInput = "What crops should I plant this season?";
        const agentResponse = getMockResponse(state.language);
        
        setState(prev => ({
          ...prev,
          isProcessing: false,
          currentResponse: agentResponse,
          conversationHistory: [
            ...prev.conversationHistory,
            { type: 'user', message: mockUserInput, timestamp: new Date() },
            { type: 'agent', message: agentResponse, timestamp: new Date() }
          ]
        }));
        
        // Speak the response
        speakText(agentResponse, state.language);
        
        // Auto-scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 2000);
    }, 3000);
  }, [state.language]);

  const clearConversation = () => {
    stopSpeaking();
    setState(prev => ({
      ...prev,
      conversationHistory: [],
      currentResponse: ''
    }));
    
    // Speak confirmation message
    const clearMessage = state.language === 'en' ? 
      "Conversation cleared. How can I help you today?" :
      state.language === 'hi' ?
      "बातचीत साफ़ कर दी गई। आज मैं आपकी कैसे सहायता कर सकता हूँ?" :
      "Conversación borrada. ¿Cómo puedo ayudarte hoy?";
    
    setTimeout(() => {
      speakText(clearMessage, state.language);
    }, 500);
  };

  const changeLanguage = (lang: 'en' | 'hi' | 'es') => {
    setState(prev => ({ ...prev, language: lang }));
    
    // Stop current speech and speak welcome message in new language
    stopSpeaking().then(() => {
      const welcomeMessage = getWelcomeMessage(lang);
      setTimeout(() => {
        speakText(welcomeMessage, lang);
      }, 500);
    });
  };

  return (
    <SafeAreaView 
      className="flex-1" 
      style={{ backgroundColor: '#6B7280' }}
    >
      <View className="flex-1 relative" style={{ backgroundColor: '#6B7280' }}>
        {/* Background Patterns */}
        <CircularPattern 
          top={-100} 
          right={-100} 
          size={250} 
          color="#DC5859" 
        />
        <CircularPattern 
          bottom={-50} 
          left={-80} 
          size={200} 
          color="#DC5859" 
        />
        <CircularPattern 
          top={height * 0.2} 
          left={-60} 
          size={180} 
          color="#DC5859" 
        />

        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <Pressable 
            onPress={() => {router.push('/(tabs)')}}
            className="flex-row items-center bg-black/20 px-4 py-2 rounded-full"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text className="text-white ml-2 font-medium">Close</Text>
          </Pressable>
          
          <Text className="text-white text-lg font-semibold">Farming Assistant</Text>
        </View>

        {/* Main Content - Centered Layout */}
        <View className="flex-1 justify-center items-center px-8">
          {/* Ready to Help Text */}
          <Text className="text-white text-2xl font-bold text-center mb-12">
            Ready To Help !
          </Text>

          {/* Microphone Icon Container */}
          <View className="bg-white rounded-3xl p-8 mb-8 w-full max-w-sm" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <View className="items-center">
              <Animated.View 
                style={{ 
                  transform: [{ scale: pulseAnim }],
                  marginBottom: 20
                }}
              >
                <View className="bg-gray-100 rounded-full p-8">
                  <MaterialCommunityIcons 
                    name="microphone" 
                    size={80} 
                    color={state.isListening ? "#4CAF50" : "#666"} 
                  />
                </View>
              </Animated.View>

              {/* Start Button */}
              <TouchableOpacity 
                onPress={startListening}
                disabled={state.isListening || state.isProcessing}
                className="bg-green-500 rounded-full px-12 py-4"
                style={{ 
                  shadowColor: '#4CAF50',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.84,
                  elevation: 8,
                }}
              >
                <Text className="text-white text-xl font-semibold">
                  {state.isListening ? 'Listening...' : 
                   state.isProcessing ? 'Processing...' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tips Section */}
          <View className="bg-black/20 rounded-2xl p-6 w-full max-w-sm">
            <View className="flex-row items-start">
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color="white" />
              <View className="flex-1 ml-3">
                <Text className="text-white font-semibold mb-2">Tips :</Text>
                <Text className="text-white/80 text-sm leading-5">
                  Ask about crop management, pest control, Weather Forecasts or any farming advice you need!
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Conversation History Overlay */}
        {state.conversationHistory.length > 0 && (
          <View className="absolute inset-0 bg-black/50">
            <SafeAreaView className="flex-1">
              <View className="flex-1 bg-white m-4 rounded-2xl">
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                  <Text className="text-lg font-bold">Conversation</Text>
                  <Pressable 
                    onPress={clearConversation}
                    className="p-2"
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </Pressable>
                </View>

                {/* Messages */}
                <ScrollView 
                  ref={scrollViewRef}
                  className="flex-1 p-4"
                  showsVerticalScrollIndicator={false}
                >
                  {state.conversationHistory.map((item, index) => (
                    <View key={index} className={`mb-4 ${item.type === 'user' ? 'items-end' : 'items-start'}`}>
                      <View className={`max-w-[85%] rounded-2xl p-4 ${
                        item.type === 'user' 
                          ? 'bg-green-500' 
                          : 'bg-gray-100'
                      }`}>
                        <Text className={`${
                          item.type === 'user' ? 'text-white' : 'text-gray-800'
                        } leading-5`}>
                          {item.message}
                        </Text>
                        <Text className={`text-xs mt-2 ${
                          item.type === 'user' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {item.timestamp.toLocaleTimeString()}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {/* Processing Indicator */}
                  {state.isProcessing && (
                    <View className="mb-4">
                      <View className="bg-gray-100 rounded-2xl p-4 max-w-[85%]">
                        <View className="flex-row items-center">
                          <ActivityIndicator size="small" color="#4CAF50" />
                          <Text className="text-gray-600 ml-3">Processing your request...</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </ScrollView>

                {/* Voice Controls */}
                <View className="p-4 border-t border-gray-200">
                  <View className="flex-row justify-center">
                    {state.isListening ? (
                      <TouchableOpacity 
                        onPress={() => setState(prev => ({ ...prev, isListening: false }))}
                        className="bg-red-500 rounded-full px-8 py-3 flex-row items-center"
                      >
                        <MaterialCommunityIcons name="stop" size={20} color="white" />
                        <Text className="text-white ml-2 font-semibold">Stop</Text>
                      </TouchableOpacity>
                    ) : state.isSpeaking ? (
                      <TouchableOpacity 
                        onPress={stopSpeaking}
                        className="bg-orange-500 rounded-full px-8 py-3 flex-row items-center"
                      >
                        <MaterialCommunityIcons name="volume-off" size={20} color="white" />
                        <Text className="text-white ml-2 font-semibold">Stop Speaking</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        onPress={startListening}
                        disabled={state.isProcessing}
                        className="bg-green-500 rounded-full px-8 py-3 flex-row items-center"
                      >
                        <MaterialCommunityIcons name="microphone" size={20} color="white" />
                        <Text className="text-white ml-2 font-semibold">Ask Again</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AiVoiceAgent;
