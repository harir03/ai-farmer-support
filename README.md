# 🌾 AgroMitra - AI-Powered Farming Companion

<div align="center">

![AgroMitra Logo](./AgroMitraWeb/public/logo.png)

**Your Intelligent Agricultural Partner with Regional Voice AI**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Vercel-000?style=for-the-badge&logo=vercel)](https://ai-farmer-support.vercel.app)
[![Backend API](https://img.shields.io/badge/⚡_API-Render-46E3B7?style=for-the-badge&logo=render)](https://ai-farmer-support.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/harir03/ai-farmer-support)

</div>

---

## 🎯 Project Overview

**AgroMitra** (अग्रोमित्र - "Farming Friend") is a comprehensive AI-powered agricultural platform designed specifically for Indian farmers. It features **real-time voice interaction in 9+ regional Indian languages**, making advanced farming technology accessible to everyone regardless of literacy or tech-savviness.

### 🏆 Built for IGNITE Hackathon

---

## ✨ Key Features

### 🗣️ **Regional Voice AI Assistant**
- **9+ Indian Languages**: Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Punjabi
- **Real-time Voice Interaction**: Powered by LiveKit for seamless communication
- **Smart Navigation**: Voice commands for app navigation
- **Contextual Farming Advice**: Weather, crops, market prices in your language

### 🩺 **AI Crop Disease Detection** (NEW!)
- **Camera-Based Diagnosis**: Take a photo of your crop to detect diseases
- **Real-Time Analysis**: AI-powered detection in under 5 seconds
- **50+ Diseases**: Fungal, bacterial, viral, pest damage, nutrient deficiencies
- **Treatment Recommendations**: Both chemical and organic remedies
- **Hindi Voice Announcements**: Results spoken in your language

### 🌾 **Digital Farm Management**
- **GPS Farm Mapping**: Draw and calculate field boundaries using Google Maps
- **Soil Analysis**: Real-time soil health data via SoilGrids API
- **Crop Lifecycle Tracking**: From planting to harvest monitoring
- **Task Management**: Smart scheduling with voice reminders

### 📊 **Market Intelligence**
- **Live Commodity Prices**: Real-time pricing from Indian mandis
- **Price Alerts**: Get notified when prices hit your targets
- **Trend Analysis**: Historical data and forecasts
- **Voice Updates**: Market conditions announced in regional language

### 👥 **Farmer Community**
- **Knowledge Sharing**: Post questions and share experiences
- **Local Groups**: Connect with farmers in your region
- **Expert Access**: Get advice from agricultural experts
- **Government Schemes**: Information about subsidies and programs

---

## 🖼️ Screenshots

### Web Application
<img width="100%" alt="AgroMitra Home" src="https://github.com/user-attachments/assets/4e7ddb3e-3103-450a-985a-00981360455f" />

### Mobile Application
<p float="left">
<img width="45%" alt="Mobile Screenshot 1" src="https://github.com/user-attachments/assets/3fa84f1d-4535-4922-92b2-307033830e8d" />
<img width="45%" alt="Mobile Screenshot 2" src="https://github.com/user-attachments/assets/ac845492-33f8-415a-b784-864cd6b73fd4" />
</p>

---

## 🏗️ Architecture

```
AgroMitra/
├── 🌐 AgroMitraWeb/          # Next.js 15 Web Application
│   ├── src/app/              # App Router pages
│   │   ├── page.tsx          # Home with Voice AI
│   │   ├── tasks/            # Task management
│   │   ├── community/        # Farmer community
│   │   ├── my-farm/          # Farm mapping & management
│   │   ├── market-prices/    # Live market data
│   │   └── disease-detection/# AI crop doctor 🆕
│   ├── src/components/       # Reusable UI components
│   ├── src/lib/              # Business logic & utilities
│   └── src/contexts/         # Language & state management
│
├── 📱 AgroMitraApp/          # React Native Mobile App
│   ├── app/                  # Expo Router navigation
│   ├── components/           # Mobile UI components
│   └── assets/               # Mobile assets
│
├── 🤖 AIVoiceAgent/          # Python AI Voice Backend
│   ├── agent.py              # Main Livekit agent
│   ├── tools.py              # Farming tools & functions
│   └── prompts.py            # System prompts & language support
│
└── ⚡ Backend/               # Express.js API Server
    ├── src/routes/           # API endpoints
    ├── src/models/           # MongoDB models
    └── src/controllers/      # Business logic
```

---

## 🚀 Live Deployment

| Service | URL | Status |
|---------|-----|--------|
| 🌐 **Frontend** | [ai-farmer-support.vercel.app](https://ai-farmer-support.vercel.app) | ✅ Live |
| ⚡ **Backend API** | [ai-farmer-support.onrender.com](https://ai-farmer-support.onrender.com) | ✅ Live |

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| LiveKit React | Voice AI integration |
| Google Maps API | Farm mapping |
| Web Speech API | Text-to-Speech |

### **Backend**
| Technology | Purpose |
|------------|---------|
| Express.js | REST API |
| MongoDB | Database |
| JWT | Authentication |
| LiveKit | Real-time voice |

### **AI/ML**
| Technology | Purpose |
|------------|---------|
| Google Gemini | Disease detection & analysis |
| Plant.id API | Plant disease identification |
| SoilGrids API | Soil data |
| OpenWeatherMap | Weather data |

---

## 🌍 Language Support

AgroMitra speaks your language! Full support for:

| Language | Code | Voice TTS | UI Translation |
|----------|------|-----------|----------------|
| 🇺🇸 English | `en` | ✅ | ✅ |
| 🇮🇳 Hindi (हिन्दी) | `hi` | ✅ | ✅ |
| 🇮🇳 Bengali (বাংলা) | `bn` | ✅ | 🔄 |
| 🇮🇳 Telugu (తెలుగు) | `te` | ✅ | 🔄 |
| 🇮🇳 Tamil (தமிழ்) | `ta` | ✅ | 🔄 |
| 🇮🇳 Marathi (मराठी) | `mr` | ✅ | 🔄 |
| 🇮🇳 Gujarati (ગુજરાતી) | `gu` | ✅ | 🔄 |
| 🇮🇳 Kannada (ಕನ್ನಡ) | `kn` | ✅ | 🔄 |
| 🇮🇳 Malayalam (മലയാളം) | `ml` | ✅ | 🔄 |
| 🇮🇳 Punjabi (ਪੰਜਾਬੀ) | `pa` | ✅ | 🔄 |

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- Python 3.8+ (for AI Voice Agent)
- MongoDB (local or Atlas)
- Git

### 1️⃣ Clone Repository
```bash
git clone https://github.com/harir03/ai-farmer-support.git
cd ai-farmer-support
```

### 2️⃣ Setup Backend
```bash
cd Backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 3️⃣ Setup Frontend
```bash
cd AgroMitraWeb
npm install
cp .env.example .env.local
# Edit .env.local with your API keys
npm run dev
```

### 4️⃣ Setup Mobile App (Optional)
```bash
cd AgroMitraApp
npm install
npx expo start
```

### 5️⃣ Setup AI Voice Agent (Optional)
```bash
cd AIVoiceAgent
pip install -r requirements.txt
cp .env.example .env
python agent.py
```

---

## ⚙️ Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=https://ai-farmer-support.onrender.com
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key
GEMINI_API_KEY=your-gemini-key
```

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://ai-farmer-support.vercel.app
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

---

## 🎤 Voice Commands

Talk to AgroMitra in your language! Example commands:

| English | Hindi |
|---------|-------|
| "What's the weather?" | "मौसम कैसा है?" |
| "Show market prices" | "बाज़ार की कीमतें दिखाओ" |
| "My tomato plants have spots" | "मेरे टमाटर की पत्तियों पर धब्बे हैं" |
| "Navigate to my farm" | "मेरे खेत पर जाओ" |
| "Create a new task" | "नया कार्य बनाओ" |

---

## 📱 Pages & Features

| Page | Features |
|------|----------|
| **🏠 Home** | Voice AI agent, language selection, quick actions |
| **📋 Tasks** | Create, manage, voice-announce farming tasks |
| **👥 Community** | Social feed, farming groups, knowledge sharing |
| **🌾 My Farm** | GPS mapping, soil data, crop management |
| **📊 Market Prices** | Live prices, trends, alerts |
| **🩺 Crop Doctor** | AI disease detection, treatment plans |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Team

**Built with ❤️ for Indian Farmers**

- **Project**: AgroMitra - AI-Powered Farming Companion
- **Hackathon**: IGNITE Hackathon
- **Focus**: Agricultural Technology & AI Innovation

---

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/harir03/ai-farmer-support/issues)
- 📧 **Contact**: Create an issue for support
- 🌐 **Demo**: [ai-farmer-support.vercel.app](https://ai-farmer-support.vercel.app)

---

<div align="center">

**🌾 Transforming Agriculture, One Voice Command at a Time 🤖**

*"किसान की आवाज़, AgroMitra की जवाब"*

</div>
