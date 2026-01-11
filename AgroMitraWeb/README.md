# AgroMitraWeb - Comprehensive Multi-lingual Voice-Powered Farm Management

A Next.js web application for AI-powered farm management featuring an advanced voice assistant that serves as the primary interface for all farming operations.

## 🌟 Key Features

### 🎤 **Enhanced Voice Assistant (Main Feature)**
- **Multi-language Support**: Communicate in English, Hindi, Spanish, and more
- **Context-Aware Navigation**: Automatically redirects users to relevant sections based on queries
- **RAG (Retrieval-Augmented Generation)**: Comprehensive farming knowledge base with intelligent search
- **Function Calling**: Weather API integration, market prices, crop recommendations, disease diagnosis
- **User Context Management**: Remembers your farm details for personalized advice
- **Smart Task Management**: Voice-powered task creation and management

### 🌐 **Core Functionality**
- 🎯 **AI Farm Consultation**: Expert advice on crop management, pest control, and farming strategies
- 🌤️ **Weather Integration**: Real-time weather data with farming-specific recommendations  
- 💰 **Market Prices**: Live market prices with trend analysis and alerts
- 📝 **Task Management**: Comprehensive farming activity planning and tracking
- 👥 **Community Features**: Connect with farmers, share experiences, local insights
- 🏡 **Farm Management**: Digital farm mapping, area calculation, crop tracking
- 🌱 **Crop Recommendations**: AI-powered crop suggestions based on soil, climate, and market data
- 🐛 **Disease Diagnosis**: Symptom-based plant disease and pest identification

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router, TypeScript
- **Styling**: Tailwind CSS with comprehensive design system
- **Voice & AI**: LiveKit, Web Speech API, OpenAI API integration
- **Internationalization**: i18next with complete multi-language support
- **APIs**: OpenWeatherMap, Supabase for RAG system

## 🛠️ Getting Started

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd AgroMitraWeb
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Add your API keys (see .env.example)
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Main App: [http://localhost:3000](http://localhost:3000)
   - Voice Assistant: [http://localhost:3000/voice-ai](http://localhost:3000/voice-ai)

## 🎯 Voice Assistant Usage

The Enhanced Voice Assistant serves as your main farming interface:

### Example Commands
- *"What's the weather like for my farm?"*
- *"Show me crop recommendations for 5 acres"*
- *"Check market prices for wheat"*
- *"My tomato plants have yellow spots"*
- *"मौसम कैसा है?"* (Hindi: How's the weather?)
- *"¿Qué cultivos debo plantar?"* (Spanish: What crops should I plant?)

### Features
- **Language Selection**: English, Hindi, Spanish support
- **Smart Navigation**: Auto-redirects to relevant sections
- **Context Awareness**: Remembers your farm details
- **Function Calling**: Real-time weather, market data, recommendations

## 📁 Key Project Structure

```
src/
├── app/
│   ├── voice-ai/           # Enhanced voice assistant
│   ├── my-farm/           # Farm management
│   ├── tasks/             # Task management
│   └── market-prices/     # Market data
├── components/
│   └── EnhancedVoiceAgent.tsx    # Main voice interface
├── lib/
│   ├── enhanced-voice-agent.ts   # Voice logic
│   ├── rag-system.ts            # Knowledge base
│   ├── farming-functions.ts     # API integrations
│   └── i18n.ts                  # Multi-language config
```

## 🌍 Multi-language Support

Complete interface and voice support in:
- **English**: Full functionality
- **Hindi (हिन्दी)**: Complete localization for Indian farmers
- **Spanish (Español)**: Support for Spanish-speaking regions

## 📱 Available Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Code quality checks
```

**Built with ❤️ for farmers worldwide - Empowering agriculture through intelligent voice technology**
