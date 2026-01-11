# 🌾 AI-FarmCare DevTree



**An AI-powered comprehensive farming ecosystem built for Hacktron at Infostav**

A complete agricultural management platform featuring voice-enabled AI assistance, mobile applications, and robust backend services to empower farmers with intelligent decision-making tools.

---

##Design
<img width="1728" height="990" alt="Screenshot 2025-10-12 at 4 27 04 AM" src="https://github.com/user-attachments/assets/4e7ddb3e-3103-450a-985a-00981360455f" />  
---
![WhatsApp Image 2025-10-12 at 03 19 22](https://github.com/user-attachments/assets/3fa84f1d-4535-4922-92b2-307033830e8d) || ![WhatsApp Image 2025-10-12 at 03 19 22](https://github.com/user-attachments/assets/ac845492-33f8-415a-b784-864cd6b73fd4)



## 🚀 Project Overview

AI-FarmCare DevTree is a multi-platform agricultural solution consisting of:

1. **🌐 AgroMitraWeb** - Next.js web application with voice-powered farm management
2. **📱 AgroMitraApp** - React Native mobile application for on-the-go farming
3. **🤖 AI Voice Agent** - Intelligent farming companion with real-time voice interaction
4. **⚡ Backend API** - Express.js backend with comprehensive farming data management

---

## 🌟 Key Features

### 🎤 **AI Voice Assistant**
- **Multi-language Support**: English, Hindi, Spanish
- **Real-time Voice Interaction**: Powered by LiveKit and Google AI
- **Smart Navigation**: Voice commands for seamless app navigation
- **Farming Intelligence**: Weather updates, crop recommendations, market prices

### 🌱 **Farm Management**
- **Digital Farm Mapping**: GPS-based area calculation and field management
- **Crop Lifecycle Tracking**: From planting to harvest monitoring
- **Task Management**: Automated scheduling and reminders
- **Soil Analysis**: Real-time soil health monitoring and recommendations

### 📊 **Data & Analytics**
- **Weather Integration**: Real-time weather data with farming-specific advice
- **Market Prices**: Live commodity prices with trend analysis
- **Disease Detection**: AI-powered plant disease diagnosis using Susya API
- **Government Schemes**: Access to agricultural subsidies and programs

### 👥 **Community Features**
- **Farmer Network**: Connect with local farming communities
- **Knowledge Sharing**: Post questions, share experiences, and learn
- **Expert Consultation**: Access to agricultural experts and advisors

---

## 🏗️ Project Structure

```
AI-FarmCare_DevTree/
├── 🌐 AgroMitraWeb/          # Next.js Web Application
│   ├── src/app/              # App Router pages
│   ├── src/components/       # Reusable UI components
│   ├── src/lib/             # Business logic & utilities
│   └── public/              # Static assets
├── 📱 AgroMitraApp/          # React Native Mobile App
│   ├── app/                 # Expo Router navigation
│   ├── components/          # Mobile UI components
│   └── assets/              # Mobile assets
├── 🤖 AIVoiceAgent/          # Python AI Voice Assistant
│   ├── agent.py             # Main agent logic
│   ├── tools.py             # Farming tools & functions
│   └── rag_system.py        # Knowledge retrieval system
└── ⚡ Backend/               # Express.js API Server
    ├── src/controllers/     # API controllers
    ├── src/models/          # Database models
    └── src/routes/          # API routes
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for AI Voice Agent)
- MongoDB (local or cloud)
- Expo CLI (for mobile app)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/AI-FarmCare_DevTree.git
cd AI-FarmCare_DevTree
```

### 2. Setup Backend API
```bash
cd Backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```
**Backend URL**: https://ai-farmcare-devtree.onrender.com/

### 3. Setup Web Application
```bash
cd AgroMitraWeb
npm install
cp .env.example .env.local
# Add your API keys
npm run dev
```
**Web App**: http://localhost:3000

### 4. Setup Mobile Application
```bash
cd AgroMitraApp
npm install
npx expo start
```

### 5. Setup AI Voice Agent
```bash
cd AIVoiceAgent
pip install -r requirements.txt
cp .env.example .env
# Configure LiveKit and API keys
python agent.py
```

---

## 🛠️ Technology Stack

### **Frontend & Mobile**
- **Web**: Next.js 14, TypeScript, Tailwind CSS
- **Mobile**: React Native, Expo, NativeWind
- **Voice**: Web Speech API, LiveKit Real-time Communication

### **Backend & AI**
- **API**: Express.js, MongoDB, JWT Authentication
- **AI**: Google Gemini, OpenAI, RAG System
- **Voice Agent**: Python, LiveKit, SentenceTransformers

### **External APIs**
- **Weather**: OpenWeatherMap API
- **Soil Data**: SoilGrids API
- **Disease Detection**: Susya API
- **Maps**: Google Maps API

---

## 🎯 Core Functionality

### **Voice Commands Examples**
```
🗣️ "What's the weather like for my farm?"
🗣️ "Show me crop recommendations for 5 acres"
🗣️ "Check market prices for wheat"
🗣️ "My tomato plants have yellow spots"
🗣️ "Navigate to my tasks"
🗣️ "मौसम कैसा है?" (Hindi: How's the weather?)
```

### **API Endpoints**
- **Authentication**: `/api/auth/register`, `/api/auth/login`
- **Tasks**: `/api/tasks` (CRUD operations)
- **Farm Management**: `/api/fields` (Farm field management)
- **Community**: `/api/posts`, `/api/community` (Social features)
- **Market Data**: `/api/market-prices` (Real-time pricing)

---

## 🌍 Multi-language Support

- **🇺🇸 English**: Complete functionality
- **🇮🇳 Hindi (हिन्दी)**: Full localization for Indian farmers
- **🇪🇸 Spanish (Español)**: Support for Spanish-speaking regions

---

## 📱 Mobile Features

- **Voice-First Interface**: Talk to your farming assistant
- **Offline Task Management**: Work without internet connectivity
- **Camera Integration**: Plant disease detection via camera
- **GPS Integration**: Location-based farming recommendations
- **Push Notifications**: Task reminders and weather alerts

---

## 🤖 AI Capabilities

### **Farming Intelligence**
- Crop recommendation based on soil and climate
- Disease diagnosis from symptoms or images
- Weather-based farming advice
- Market price predictions and trends

### **Knowledge Base**
- 200+ farming topics in RAG system
- Government schemes and subsidies
- Best practices and techniques
- Community-driven knowledge sharing

---

## 🧪 Testing & Development

### **Backend Testing**
```bash
cd Backend
npm test
# API endpoints testing
node test-api.js
```

### **Frontend Testing**
```bash
cd AgroMitraWeb
npm run test
npm run lint
```

### **AI Voice Agent Testing**
```bash
cd AIVoiceAgent
python -m pytest tests/
```

---

## 🚀 Deployment

### **Production URLs**
- **Backend API**: https://ai-farmcare-devtree.onrender.com/
- **Web Application**: [Deploy on Vercel/Netlify]
- **Mobile App**: [Deploy via Expo Application Services]

### **Environment Configuration**
Each component includes `.env.example` files with required configuration variables.

---

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the individual component LICENSE files for details.

---

## 🏆 Hacktron @ Infostav

**Built with ❤️ for farmers worldwide**

Empowering agriculture through intelligent voice technology and comprehensive farm management solutions.

### **Team**
- **Project**: AI-FarmCare DevTree
- **Event**: Hacktron at Infostav
- **Focus**: Agricultural Technology & AI Innovation

---

## 📞 Support

For questions, issues, or contributions:
- 📧 **Email**: [Your contact email]
- 🐛 **Issues**: [GitHub Issues Link]
- 📚 **Documentation**: See individual component READMEs
- 🌐 **Demo**: [Live demo link if available]

**Transforming Agriculture, One Voice Command at a Time** 🌾🤖


