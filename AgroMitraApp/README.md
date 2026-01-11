# 🌾 AgroMitraApp - AI-Powered Mobile Farming Companion

**React Native mobile application for intelligent farm management with voice assistance**

A comprehensive mobile farming app built with React Native and Expo, featuring AI voice assistance, task management, community features, and real-time agricultural data.

---

## 🚀 Features

### 🎤 **AI Voice Assistant**
- **Real-time Voice Interaction**: Integrated with LiveKit for seamless voice communication
- **Multi-language Support**: English and Hindi voice commands
- **Smart Farm Guidance**: Weather updates, crop advice, and task management
- **Offline Voice Processing**: Basic voice commands work without internet

### 🌱 **Farm Management**
- **Digital Farm Tracking**: GPS-based field mapping and area calculation
- **Task Management**: Create, schedule, and track farming tasks
- **Crop Lifecycle Monitoring**: From planting to harvest tracking
- **Weather Integration**: Real-time weather updates and farming advice

### 📊 **Market Intelligence**
- **Live Market Prices**: Real-time commodity pricing with trend analysis
- **Price Alerts**: Custom notifications for target prices
- **Market Trends**: Visual charts and forecasting data
- **Local Market Data**: Location-based market information

### 👥 **Community Features**
- **Farmer Network**: Connect with fellow farmers and agricultural experts
- **Knowledge Sharing**: Share experiences, tips, and best practices
- **Q&A Forums**: Get answers to farming questions from the community
- **Local Groups**: Join location-based farming groups

---

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router with tab-based navigation
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Voice**: LiveKit Real-time Communication
- **Backend**: Express.js API ([Backend](../Backend))
- **Icons**: Expo Vector Icons (Ionicons, FontAwesome6)
- **State Management**: React Hooks and Context

---

## 📁 Project Structure

```
AgroMitraApp/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── Task.tsx       # Task management
│   │   ├── Community.tsx  # Community features
│   │   ├── Farm.tsx       # Farm management
│   │   └── More.tsx       # Settings and more
│   ├── _layout.tsx        # Root layout
│   └── Aichat.tsx         # AI Voice chat interface
├── components/             # Reusable components
│   ├── Home.tsx           # Home screen components
│   ├── Task.tsx           # Task management components
│   ├── MarketPrice.tsx    # Market data display
│   └── AiVoiceAgent.tsx   # Voice assistant interface
├── assets/                # App assets
│   └── pages/
│       └── voiceai.tsx    # Voice AI implementation
├── utils/                 # Utilities
│   └── constant.js        # API constants and config
└── Configuration Files
    ├── package.json       # Dependencies
    ├── app.json          # Expo configuration
    ├── tailwind.config.js # Styling configuration
    └── babel.config.js   # Babel configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator or Android Emulator
- Physical device with Expo Go app (optional)

### 1. Installation
```bash
cd AgroMitraApp
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# Backend API
API_BASE_URL=http://localhost:5000/
# For production: API_BASE_URL=https://ai-farmcare-devtree.onrender.com/

# LiveKit Configuration (for Voice AI)
LIVEKIT_URL=your_livekit_websocket_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
```

### 3. Start Development Server
```bash
npx expo start
```

### 4. Run on Device
- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan QR code with Expo Go app

---

## 📱 App Navigation

### Tab Structure
1. **🏠 Home** - Dashboard with weather, news, and quick actions
2. **📋 Tasks** - Task management and farming reminders
3. **👥 Community** - Farmer network and knowledge sharing
4. **🚜 Farm** - Farm management and field tracking
5. **⚙️ More** - Settings, profile, and additional features

### Key Screens
- **Voice AI Chat**: Full-screen voice assistant interface
- **Market Prices**: Live commodity pricing with voice announcements
- **Weather Dashboard**: Detailed weather information for farming
- **Task Management**: Create, edit, and track farming tasks

---

## 🎯 Core Functionality

### Voice Commands Examples
```
🗣️ "What's today's weather?"
🗣️ "Show me market prices for wheat"
🗣️ "Create a new farming task"
🗣️ "Navigate to community"
🗣️ "मौसम कैसा है?" (Hindi: How's the weather?)
```

### API Integration
- **Weather Data**: Real-time weather updates and forecasts
- **Market Prices**: Live commodity pricing from government sources
- **Task Management**: CRUD operations for farming tasks
- **Community Posts**: Social features for farmer interaction

---

## 🔧 Configuration

### Expo Configuration (`app.json`)
```json
{
  "expo": {
    "name": "AgroMitra",
    "slug": "agromitra-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android", "web"],
    "userInterfaceStyle": "automatic"
  }
}
```

### Tailwind Configuration
Uses NativeWind for consistent styling with the web application:
```javascript
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#059669',
        secondary: '#f5e9dd'
      }
    }
  }
}
```

---

## 🧪 Testing & Development

### Run in Different Modes
```bash
# Development build
npx expo start --dev-client

# Production simulation
npx expo start --no-dev --minify

# Web version
npx expo start --web
```

### Debugging
- **Expo DevTools**: Access via browser when development server is running
- **React Native Debugger**: For advanced debugging
- **Flipper**: For network and state inspection

---

## 📦 Build & Deployment

### Create Development Build
```bash
npx expo install expo-dev-client
npx expo run:ios
npx expo run:android
```

### Production Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### App Store Deployment
```bash
# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

---

## 🌍 Multi-language Support

- **English**: Complete interface and voice support
- **Hindi (हिन्दी)**: Localized for Indian farmers
- **Voice Commands**: Supports both English and Hindi voice inputs

---

## 🔗 Integration with Ecosystem

### Connected Services
- **[AgroMitraWeb](../AgroMitraWeb)**: Shared user accounts and data sync
- **[Backend API](../Backend)**: Central data management
- **[AI Voice Agent](../AIVoiceAgent)**: Advanced voice processing

### Shared Features
- User authentication and profiles
- Task synchronization across devices
- Community posts and interactions
- Market data and weather information

---

## 🚀 Available Scripts

```bash
npm start                # Start Expo development server
npm run android         # Run on Android emulator
npm run ios            # Run on iOS simulator
npm run web            # Run web version
npm run reset-project  # Reset to clean state
```

---

## 🐛 Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
npx expo start --clear
```

**iOS simulator not opening:**
```bash
npx expo run:ios --device
```

**Android build issues:**
```bash
cd android && ./gradlew clean
cd .. && npx expo run:android
```

**Voice AI connection issues:**
- Ensure backend server is running
- Check LiveKit configuration
- Verify network connectivity

---

## 📚 Learning Resources

- **[Expo Documentation](https://docs.expo.dev/)**: Complete Expo development guide
- **[React Native Guide](https://reactnative.dev/)**: React Native fundamentals
- **[NativeWind Docs](https://www.nativewind.dev/)**: Tailwind CSS for React Native
- **[LiveKit React Native](https://docs.livekit.io/realtime/client-sdks/react-native/)**: Voice integration guide

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 Hacktron @ Infostav

**Built with ❤️ for farmers worldwide**

Part of the AI-FarmCare DevTree ecosystem - Empowering agriculture through intelligent mobile technology and voice-powered farm management.

### Features Highlights
- 🎤 **Voice-First Interface**: Talk to your farming assistant anywhere
- 📱 **Offline Capability**: Essential features work without internet
- 🌍 **Multi-language**: Supports local languages for better adoption
- 🚜 **Farm-Specific**: Built specifically for agricultural workflows

---

## 📞 Support & Contact

- 📧 **Email**: [Your contact email]
- 🐛 **Issues**: [GitHub Issues Link]
- 📚 **Documentation**: See component-specific READMEs
- 🌐 **Web Version**: [AgroMitraWeb](../AgroMitraWeb)

**Transforming Agriculture, One Voice Command at a Time** 🌾📱
