import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { FarmService } from '@/lib/farmService';

export interface UserContext {
  farmFields: Array<{
    id: string;
    name: string;
    size: number;
    soilType: string;
    currentCrop: string;
    location: string;
  }>;
  preferences: {
    language: string;
    location: string;
    farmingType: string;
  };
  recentQueries: string[];
}

export interface ConversationContext {
  intent: 'general' | 'weather' | 'crops' | 'tasks' | 'market' | 'disease' | 'navigation' | 'farm_info';
  entities: Record<string, any>;
  confidence: number;
  requiresRedirect: boolean;
  redirectTo?: string;
  followUpRequired: boolean;
}

export class EnhancedVoiceAgent {
  private userContext: UserContext;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }> = [];
  private router: any;
  private currentLanguage: string = 'en';
  
  constructor(userContext: UserContext, router: any) {
    this.userContext = userContext;
    this.router = router;
    this.currentLanguage = userContext.preferences.language || 'en';
  }

  // Intent Classification using keyword matching (can be enhanced with ML models)
  classifyIntent(userInput: string): ConversationContext {
    const input = userInput.toLowerCase();
    
    // Weather-related intents
    if (input.includes('weather') || input.includes('rain') || input.includes('temperature') || 
        input.includes('forecast') || input.includes('मौसम') || input.includes('बारिश') ||
        input.includes('clima') || input.includes('lluvia')) {
      return {
        intent: 'weather',
        entities: { location: this.extractLocation(input) },
        confidence: 0.9,
        requiresRedirect: false,
        followUpRequired: false
      };
    }

    // Task-related intents
    if (input.includes('task') || input.includes('todo') || input.includes('work') || 
        input.includes('schedule') || input.includes('कार्य') || input.includes('काम') ||
        input.includes('tarea') || input.includes('trabajo')) {
      return {
        intent: 'tasks',
        entities: { category: this.extractTaskCategory(input) },
        confidence: 0.85,
        requiresRedirect: true,
        redirectTo: '/tasks',
        followUpRequired: true
      };
    }

    // Crop-related intents
    if (input.includes('crop') || input.includes('plant') || input.includes('grow') || 
        input.includes('harvest') || input.includes('फसल') || input.includes('उगाना') ||
        input.includes('cultivo') || input.includes('plantar')) {
      return {
        intent: 'crops',
        entities: { cropType: this.extractCropType(input) },
        confidence: 0.8,
        requiresRedirect: false,
        followUpRequired: this.userContext.farmFields.length === 0
      };
    }

    // Market price intents
    if (input.includes('price') || input.includes('market') || input.includes('sell') || 
        input.includes('buy') || input.includes('भाव') || input.includes('बाज़ार') ||
        input.includes('precio') || input.includes('mercado')) {
      return {
        intent: 'market',
        entities: { crop: this.extractCropType(input) },
        confidence: 0.8,
        requiresRedirect: true,
        redirectTo: '/market-prices',
        followUpRequired: false
      };
    }

    // Disease/problem diagnosis with camera detection
    if (input.includes('disease') || input.includes('problem') || input.includes('pest') || 
        input.includes('yellow') || input.includes('spots') || input.includes('dying') ||
        input.includes('detect') || input.includes('camera') || input.includes('scan') ||
        input.includes('plant health') || input.includes('leaf problem') || input.includes('crop issue') ||
        input.includes('बीमारी') || input.includes('समस्या') || input.includes('कीट') ||
        input.includes('enfermedad') || input.includes('problema') || input.includes('plaga') ||
        input.includes('जांच') || input.includes('कैमरा') || input.includes('स्कैन')) {
      
      // Check if user mentions camera or detection
      const needsCamera = input.includes('detect') || input.includes('camera') || 
                         input.includes('scan') || input.includes('जांच') || 
                         input.includes('कैमरा') || input.includes('स्कैन');
      
      return {
        intent: 'disease',
        entities: { 
          symptoms: input, 
          crop: this.extractCropType(input),
          needsCamera: needsCamera
        },
        confidence: 0.85,
        requiresRedirect: needsCamera,
        redirectTo: needsCamera ? '/disease-detection' : undefined,
        followUpRequired: false
      };
    }

    // Farm information intents
    if (input.includes('my farm') || input.includes('farm info') || input.includes('farm details') || 
        input.includes('land details') || input.includes('field info') || input.includes('मेरी खेती') || 
        input.includes('खेत की जानकारी') || input.includes('ज़मीन की जानकारी') ||
        input.includes('mi granja') || input.includes('información de granja') || input.includes('detalles del campo') ||
        input.includes('coordinates') || input.includes('latitude') || input.includes('longitude') || input.includes('soil data')) {
      return {
        intent: 'farm_info',
        entities: {},
        confidence: 0.9,
        requiresRedirect: false,
        followUpRequired: false
      };
    }

    // Navigation intents
    if (input.includes('go to') || input.includes('show me') || input.includes('navigate') || 
        input.includes('open') || input.includes('जाना') || input.includes('दिखाओ') ||
        input.includes('ir a') || input.includes('mostrar')) {
      return {
        intent: 'navigation',
        entities: { destination: this.extractDestination(input) },
        confidence: 0.9,
        requiresRedirect: true,
        redirectTo: this.getRedirectPath(input),
        followUpRequired: false
      };
    }

    // Default to general intent
    return {
      intent: 'general',
      entities: {},
      confidence: 0.5,
      requiresRedirect: false,
      followUpRequired: false
    };
  }

  // Extract entities from user input
  extractLocation(input: string): string {
    // Simple location extraction - can be enhanced with NER models
    const locations = ['delhi', 'mumbai', 'bangalore', 'pune', 'chennai', 'hyderabad', 
                      'दिल्ली', 'मुंबई', 'बैंगलोर', 'पुणे', 'चेन्नई'];
    for (const location of locations) {
      if (input.includes(location)) {
        return location;
      }
    }
    return this.userContext.preferences.location || 'unknown';
  }

  extractCropType(input: string): string {
    const crops = ['rice', 'wheat', 'maize', 'corn', 'tomato', 'potato', 'onion', 'cotton',
                   'धान', 'गेहूं', 'मक्का', 'टमाटर', 'आलू', 'प्याज', 'कपास',
                   'arroz', 'trigo', 'maíz', 'tomate', 'papa', 'cebolla', 'algodón'];
    for (const crop of crops) {
      if (input.includes(crop)) {
        return crop;
      }
    }
    return 'general';
  }

  extractTaskCategory(input: string): string {
    if (input.includes('plant') || input.includes('sow') || input.includes('बुआई')) return 'planting';
    if (input.includes('water') || input.includes('irrigat') || input.includes('सिंचाई')) return 'irrigation';
    if (input.includes('fertiliz') || input.includes('खाद')) return 'fertilization';
    if (input.includes('pest') || input.includes('spray') || input.includes('कीट')) return 'pest-control';
    if (input.includes('harvest') || input.includes('कटाई')) return 'harvesting';
    return 'general';
  }

  extractDestination(input: string): string {
    if (input.includes('task') || input.includes('कार्य') || input.includes('tarea')) return 'tasks';
    if (input.includes('farm') || input.includes('field') || input.includes('खेत') || input.includes('granja')) return 'farm';
    if (input.includes('market') || input.includes('price') || input.includes('बाज़ार') || input.includes('mercado')) return 'market';
    if (input.includes('community') || input.includes('समुदाय') || input.includes('comunidad')) return 'community';
    return 'home';
  }

  getRedirectPath(input: string): string {
    const destination = this.extractDestination(input);
    const paths: Record<string, string> = {
      'tasks': '/tasks',
      'farm': '/my-farm',
      'market': '/market-prices',
      'community': '/community',
      'home': '/'
    };
    return paths[destination] || '/';
  }

  // Process user input and generate response
  async processUserInput(userInput: string): Promise<{
    response: string;
    audioResponse?: string;
    actions?: Array<{ type: string; data: any }>;
    shouldRedirect?: boolean;
    redirectTo?: string;
  }> {
    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });

    // Classify intent
    const context = this.classifyIntent(userInput);
    
    try {
      let response = '';
      const actions: Array<{ type: string; data: any }> = [];

      switch (context.intent) {
        case 'weather':
          const weatherData = await this.getWeatherFromBackend(
            context.entities.location || this.userContext.preferences.location
          );
          response = this.generateWeatherResponse(weatherData);
          actions.push({ type: 'weather', data: weatherData });
          break;

        case 'crops':
          if (this.userContext.farmFields.length === 0) {
            response = this.getTranslation('voiceAgent.needLandInfo');
            return {
              response,
              shouldRedirect: true,
              redirectTo: '/my-farm'
            };
          }
          
          const cropRecommendations = await this.getCropRecommendationsFromBackend();
          response = this.generateCropRecommendationResponse(cropRecommendations);
          actions.push({ type: 'crops', data: cropRecommendations });
          break;

        case 'tasks':
          const taskRecommendations = await this.getFarmingTasksFromBackend(
            this.getCurrentSeason(),
            this.userContext.farmFields.map(f => f.currentCrop)[0]
          );
          response = `${this.getTranslation('voiceAgent.taskNavigation')}\n\n${this.generateTaskResponse(taskRecommendations)}`;
          actions.push({ type: 'tasks', data: taskRecommendations });
          
          return {
            response,
            actions,
            shouldRedirect: true,
            redirectTo: '/tasks'
          };

        case 'market':
          const marketPrices = await this.getMarketPricesFromBackend(
            context.entities.crop
          );
          response = `${this.getTranslation('voiceAgent.marketNavigation')}\n\n${this.generateMarketResponse(marketPrices)}`;
          actions.push({ type: 'market', data: marketPrices });
          
          return {
            response,
            actions,
            shouldRedirect: true,
            redirectTo: '/market-prices'
          };

        case 'disease':
          if (context.entities.needsCamera) {
            response = this.getTranslation('voiceAgent.cameraDetection') || 
              "I'll help you detect plant diseases using your camera! Let me open the disease detection page where you can scan your plants for health issues.";
            actions.push({ type: 'camera_detection', data: { redirect: '/disease-detection' } });
            
            return {
              response,
              actions,
              shouldRedirect: true,
              redirectTo: '/disease-detection'
            };
          } else {
            const diagnosis = await this.diagnoseDiseaseFromBackend(
              context.entities.symptoms,
              context.entities.crop
            );
            response = this.generateDiseaseResponse(diagnosis);
            actions.push({ type: 'disease', data: diagnosis });
          }
          break;

        case 'farm_info':
          const farmInfo = await this.getUserFarmInfoFromLocalStorage();
          response = this.generateFarmInfoResponse(farmInfo);
          actions.push({ type: 'farm_info', data: farmInfo });
          break;

        case 'navigation':
          response = this.generateNavigationResponse(context.entities.destination);
          return {
            response,
            shouldRedirect: true,
            redirectTo: context.redirectTo
          };

        case 'general':
          // Use backend knowledge search for general farming questions
          const knowledgeResponse = await this.searchKnowledgeFromBackend(userInput);
          response = knowledgeResponse;
          break;

        default:
          response = this.getTranslation('voiceAgent.processingError');
      }

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });

      return {
        response,
        actions,
        shouldRedirect: context.requiresRedirect,
        redirectTo: context.redirectTo
      };

    } catch (error) {
      console.error('Error processing user input:', error);
      return {
        response: this.getTranslation('voiceAgent.processingError')
      };
    }
  }

  // Response generators
  generateWeatherResponse(weather: any): string {
    return `${this.getTranslation('voiceAgent.weatherResponse')}\n\n` +
           `📍 ${weather.location}\n` +
           `🌡️ ${this.getTranslation('weather.temperature')}: ${weather.temperature}°C\n` +
           `💧 ${this.getTranslation('weather.humidity')}: ${weather.humidity}%\n` +
           `🌤️ ${weather.description}\n` +
           `💨 ${this.getTranslation('weather.windSpeed')}: ${weather.windSpeed} m/s\n\n` +
           `${this.getTranslation('weather.forecast')}:\n` +
           weather.forecast.slice(0, 3).map((day: any) => 
             `${day.date}: ${day.temp}°C, ${day.description}`
           ).join('\n');
  }

  generateCropRecommendationResponse(crops: any[]): string {
    return `${this.getTranslation('voiceAgent.cropRecommendationResponse')}\n\n` +
           crops.slice(0, 3).map(crop => 
             `🌾 ${crop.crop} (${crop.suitability}% suitable)\n` +
             `📅 ${this.getTranslation('task.planting')}: ${crop.plantingTime}\n` +
             `💰 ${this.getTranslation('market.price')}: ₹${crop.marketPrice}/quintal\n` +
             `📈 ${this.getTranslation('farm.fieldSize')}: ${crop.expectedYield}`
           ).join('\n\n');
  }

  generateTaskResponse(tasks: any[]): string {
    return `${this.getTranslation('voiceAgent.taskResponse')}\n\n` +
           tasks.slice(0, 3).map(task => 
             `${this.getPriorityIcon(task.priority)} ${task.task}\n` +
             `📅 ${this.getTranslation('task.dueDate')}: ${task.dueDate}\n` +
             `📝 ${task.description}`
           ).join('\n\n');
  }

  generateMarketResponse(prices: any[]): string {
    return `${this.getTranslation('voiceAgent.marketPriceResponse')}\n\n` +
           prices.slice(0, 4).map(price => 
             `${this.getTrendIcon(price.trend)} ${price.crop}: ₹${price.price}/${price.unit}\n` +
             `📍 ${price.market} | ${price.date}`
           ).join('\n\n');
  }

  generateDiseaseResponse(diagnosis: any): string {
    return `${this.getTranslation('voiceAgent.diseaseResponse')}\n\n` +
           `🦠 Possible diseases: ${diagnosis.possibleDiseases.join(', ')}\n` +
           `🐛 Possible pests: ${diagnosis.possiblePests.join(', ')}\n\n` +
           `💡 Recommendations:\n${diagnosis.recommendations.map((rec: string) => `• ${rec}`).join('\n')}`;
  }

  generateFarmInfoResponse(farmData: any): string {
    if (!farmData.farmInfo || farmData.farmInfo.length === 0) {
      return "I don't have any farm information for you yet. Please add your farm details in the My Farm section first, so I can provide personalized recommendations based on your land coordinates, soil data, and crop information.";
    }

    const { farmInfo, summary } = farmData;
    let response = "🌾 **Here's your complete farm information:**\n\n";
    
    // Summary
    response += `📊 **Farm Portfolio Summary:**\n`;
    response += `• Total Farms: ${summary.totalFarms}\n`;
    response += `• Total Area: ${summary.totalArea?.toFixed(2)} acres\n`;
    response += `• Average Farm Size: ${summary.avgFarmSize?.toFixed(2)} acres\n`;
    
    if (summary.cropTypes?.length > 0) {
      response += `• Crop Types: ${summary.cropTypes.join(', ')}\n`;
    }
    if (summary.soilTypes?.length > 0) {
      response += `• Soil Types: ${summary.soilTypes.join(', ')}\n`;
    }
    response += "\n";
    
    // Individual farms
    farmInfo.slice(0, 3).forEach((farm: any, index: number) => {
      response += `**Farm ${index + 1}: ${farm.name}**\n`;
      response += `📍 Location: ${farm.latitude?.toFixed(6)}, ${farm.longitude?.toFixed(6)}\n`;
      response += `📐 Area: ${farm.totalArea?.toFixed(2)} acres\n`;
      
      if (farm.cropType) {
        response += `🌱 Current Crop: ${farm.cropType}\n`;
      }
      if (farm.soilType) {
        response += `🌍 Soil Type: ${farm.soilType}\n`;
      }
      if (farm.soilData?.ph) {
        response += `⚗️ Soil pH: ${farm.soilData.ph}\n`;
      }
      if (farm.soilData?.textureClass) {
        response += `🧱 Soil Texture: ${farm.soilData.textureClass}\n`;
      }
      response += "\n";
    });
    
    if (farmInfo.length > 3) {
      response += `... and ${farmInfo.length - 3} more farms.\n\n`;
    }
    
    response += "I can use this information to provide personalized crop recommendations, weather-based advice, and farming guidance based on your specific location coordinates and soil conditions!";
    
    return response;
  }

  generateNavigationResponse(destination: string): string {
    const messages: Record<string, string> = {
      'tasks': this.getTranslation('voiceAgent.taskNavigation'),
      'farm': this.getTranslation('voiceAgent.farmNavigation'),
      'market': this.getTranslation('voiceAgent.marketNavigation'),
      'community': this.getTranslation('voiceAgent.communityNavigation')
    };
    return messages[destination] || 'Navigating to the requested section...';
  }

  // Helper methods
  getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if ([12, 1, 2].includes(month)) return 'winter';
    if ([3, 4, 5].includes(month)) return 'summer';
    if ([6, 7, 8, 9].includes(month)) return 'monsoon';
    return 'post-monsoon';
  }

  getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = {
      'high': '🔴',
      'medium': '🟡',
      'low': '🟢'
    };
    return icons[priority] || '⚪';
  }

  getTrendIcon(trend: string): string {
    const icons: Record<string, string> = {
      'up': '📈',
      'down': '📉',
      'stable': '➡️'
    };
    return icons[trend] || '➡️';
  }

  getTranslation(key: string): string {
    // This would integrate with the i18n system
    // For now, returning English defaults
    const translations: Record<string, string> = {
      'voiceAgent.weatherResponse': 'Here\'s the weather information for your area:',
      'voiceAgent.cropRecommendationResponse': 'Based on your farm conditions, here are my crop recommendations:',
      'voiceAgent.taskResponse': 'I\'ve found some important tasks for you:',
      'voiceAgent.marketPriceResponse': 'Here are the current market prices:',
      'voiceAgent.diseaseResponse': 'Based on the symptoms you described, here\'s what I found:',
      'voiceAgent.taskNavigation': 'I can help you manage your farming tasks. Let me redirect you to the Tasks section.',
      'voiceAgent.farmNavigation': 'To provide accurate recommendations, I need information about your farm. Let me take you to the My Farm section.',
      'voiceAgent.marketNavigation': 'Let me show you the latest market prices in the Market Prices section.',
      'voiceAgent.communityNavigation': 'Connect with fellow farmers in our Community section.',
      'voiceAgent.needLandInfo': 'To give you accurate recommendations, I need to know about your land area. Please go to My Farm section first.',
      'voiceAgent.processingError': 'Sorry, I had trouble processing your request. Please try again.',
      'weather.temperature': 'Temperature',
      'weather.humidity': 'Humidity',
      'weather.windSpeed': 'Wind Speed',
      'weather.forecast': 'Weather Forecast',
      'task.planting': 'Planting Time',
      'task.dueDate': 'Due Date',
      'market.price': 'Market Price',
      'farm.fieldSize': 'Expected Yield'
    };
    
    return translations[key] || key;
  }

  // Update user context
  updateUserContext(newContext: Partial<UserContext>): void {
    this.userContext = { ...this.userContext, ...newContext };
  }

  // Get conversation history
  getConversationHistory(): Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }> {
    return this.conversationHistory;
  }

  // Clear conversation history
  clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  // Backend integration methods
  private async getWeatherFromBackend(city: string): Promise<any> {
    try {
      const response = await axios.get(`${this.getBackendUrl()}/api/farming/weather/${encodeURIComponent(city)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather from backend:', error);
      return {
        location: city,
        current: { temperature: 25, humidity: 65, description: 'partly cloudy' },
        farmingAdvice: ['Weather data temporarily unavailable']
      };
    }
  }

  private async getCropRecommendationsFromBackend(): Promise<any[]> {
    try {
      const totalArea = this.userContext.farmFields.reduce((total, field) => total + field.size, 0);
      const response = await axios.post(`${this.getBackendUrl()}/api/farming/crop-recommendations`, {
        latitude: 28.6139, // Default to Delhi, should be from user context
        longitude: 77.2090,
        soilType: 'loamy',
        landSize: totalArea
      });
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error fetching crop recommendations from backend:', error);
      return [];
    }
  }

  private async getFarmingTasksFromBackend(season: string, cropType?: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.getBackendUrl()}/api/farming/tasks`, {
        params: { season, cropType }
      });
      return response.data.tasks || [];
    } catch (error) {
      console.error('Error fetching farming tasks from backend:', error);
      return [];
    }
  }

  private async getMarketPricesFromBackend(crop?: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.getBackendUrl()}/api/farming/market-prices`, {
        params: { crop }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching market prices from backend:', error);
      return [];
    }
  }

  private async diagnoseDiseaseFromBackend(symptoms: string, crop?: string): Promise<any> {
    try {
      const response = await axios.post(`${this.getBackendUrl()}/api/farming/diagnose-disease`, {
        symptoms,
        cropType: crop
      });
      return response.data.diagnosis || { possibleDiseases: [], possiblePests: [], recommendations: [] };
    } catch (error) {
      console.error('Error diagnosing disease from backend:', error);
      return { possibleDiseases: [], possiblePests: [], recommendations: [] };
    }
  }

  private async searchKnowledgeFromBackend(query: string): Promise<string> {
    try {
      const response = await axios.get(`${this.getBackendUrl()}/api/farming/knowledge/search`, {
        params: { query, limit: 3 }
      });
      
      const results = response.data.results || [];
      if (results.length === 0) {
        return "I don't have specific information about that topic in my knowledge base.";
      }

      const context = results
        .map((item: any) => item.content)
        .join('\n\n');

      return `Based on my farming knowledge:\n\n${context}`;
    } catch (error) {
      console.error('Error searching knowledge from backend:', error);
      return "I'm having trouble accessing my knowledge base right now. Please try again later.";
    }
  }

  private async getUserFarmInfoFromBackend(): Promise<any> {
    try {
      const farmData = await FarmService.getFarmInfoForAssistant();
      return farmData;
    } catch (error) {
      console.error('Error fetching user farm info from backend:', error);
      return {
        farmInfo: [],
        summary: {
          totalFarms: 0,
          totalArea: 0,
          avgFarmSize: 0,
          cropTypes: [],
          soilTypes: [],
          irrigationTypes: []
        }
      };
    }
  }

  private async getUserFarmInfoFromLocalStorage(): Promise<any> {
    try {
      // FarmService already uses localStorage, so we can use the same method
      const farmData = await FarmService.getFarmInfoForAssistant();
      return farmData;
    } catch (error) {
      console.error('Error fetching user farm info from localStorage:', error);
      return {
        farmInfo: [],
        summary: {
          totalFarms: 0,
          totalArea: 0,
          avgFarmSize: 0,
          cropTypes: [],
          soilTypes: [],
          irrigationTypes: []
        }
      };
    }
  }

  private getBackendUrl(): string {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  }
}

// Hook for using the enhanced voice agent
export const useEnhancedVoiceAgent = (userContext: UserContext) => {
  const router = useRouter();
  const [agent] = useState(() => new EnhancedVoiceAgent(userContext, router));
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);

  const processInput = useCallback(async (input: string) => {
    setIsProcessing(true);
    try {
      const result = await agent.processUserInput(input);
      setConversationHistory(agent.getConversationHistory());
      
      if (result.shouldRedirect && result.redirectTo) {
        // Add delay for user to hear response before redirect
        setTimeout(() => {
          router.push(result.redirectTo!);
        }, 3000);
      }
      
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [agent, router]);

  return {
    processInput,
    isProcessing,
    conversationHistory,
    updateUserContext: agent.updateUserContext.bind(agent),
    clearHistory: () => {
      agent.clearConversationHistory();
      setConversationHistory([]);
    }
  };
};