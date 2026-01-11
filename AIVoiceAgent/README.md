# 🌾 AgroMitra - Your AI Farming Companion

This is a Python-based agricultural AI assistant designed to help farmers make informed decisions, capable of:

- 🌱 **Crop Recommendations** - Based on soil data and weather conditions
- 🌤️ **Weather Analysis** - Real-time weather data for farming decisions
- 🔬 **Soil Analysis** - Fetch and analyze soil properties using coordinates
- 🔍 **Web Search** - Research farming techniques and market information
- 📨 **Communication** - Send emails with farming reports and recommendations
- 🌾 **Multi-language Support** - Communicate in farmer's preferred language
- 🗣️ **Voice Interaction** - Natural conversation in multiple languages

This agent uses LiveKit for real-time voice communication and is 100% free!

---

## 🌟 Key Features

### Agricultural Intelligence
- **Smart Crop Selection**: Analyzes soil pH, nutrients, texture, and organic content
- **Weather-based Planning**: Integrates local weather patterns for seasonal recommendations
- **Soil Health Assessment**: Fetches data from SoilGrids API using GPS coordinates
- **Risk Assessment**: Identifies key risk factors for different farming strategies
- **ROI Analysis**: Provides investment cost and profit estimates

### Farming Support
- **Disease Detection**: Visual analysis of plant health (coming soon)
- **Treatment Suggestions**: Practical advice for crop diseases and pests
- **Crop Rotation Planning**: Long-term farming strategy recommendations
- **Market Information**: Web search for current market prices and trends

---

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Create virtual environment
python -m venv venv

# Activate environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file with your API keys:
```bash
# LiveKit Configuration (Required)
LIVEKIT_URL=your_livekit_websocket_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Weather API (Required for weather-based recommendations)
OPENWEATHER_API_KEY=your_openweather_api_key

# Google API (Required for AI responses)
GOOGLE_API_KEY=your_google_api_key

# Email Configuration (Optional - for sending farming reports)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

### 3. Run the Agent
```bash
python agent.py
```

---

## 🌍 How to Use AgroMitra

### Getting Crop Recommendations
1. **Provide Location**: Share your farm's latitude and longitude coordinates
2. **Soil Analysis**: AgroMitra fetches soil data from international databases
3. **Weather Check**: Current and seasonal weather patterns are analyzed
4. **Recommendations**: Receive tailored crop suggestions with:
   - Investment costs and expected profits
   - Risk factors and mitigation strategies
   - Suitable soil types and seasons
   - ROI percentages

### Example Conversation
```
🗣️ User: "What should I plant this season?"
🤖 AgroMitra: "Let me check your soil and weather conditions first, friend. Please share your location coordinates - latitude and longitude."

🗣️ User: "My farm is at 28.7041°N, 77.1025°E"
🤖 AgroMitra: "Perfect! Let me analyze your soil data and weather... Based on your location's clay loam soil and current season, I recommend Paddy-cum-Fish culture with an expected ROI of 56.7%. Here's why..."
```

---

## 🛠️ API Integration

### Soil Data Source
- **SoilGrids API**: `https://rest.isric.org/soilgrids/v2.0/properties/query`
- Provides: pH levels, organic carbon, soil texture, nutrient content
- Coverage: Global soil data with 250m resolution

### Weather Integration
- **OpenWeatherMap API**: Real-time and forecast data
- Parameters: Temperature, humidity, precipitation, wind patterns
- Used for: Seasonal planning and daily farming decisions

---

## 🔧 Technical Architecture

```
AiVoiceAgent
├── Agent Core (agent.py)
├── Farming Tools (tools.py)
│   ├── Crop Recommendation Engine
│   ├── Soil Data Fetcher
│   ├── Weather Analysis
│   └── Web Search & Email
├── AI Instructions (prompts.py)
│   ├── Agricultural Knowledge Base
│   ├── Multi-language Support
│   └── Farmer-friendly Communication
└── API Server (api.py)
    └── LiveKit Token Management
```

---

## 📖 Supported Farming Types

- **Integrated Farming**: Multi-crop systems like Paddy-cum-Fish culture
- **Boundary Planting**: Perimeter crops with main field cultivation
- **High-Value Crops**: Organic vegetables, saffron, specialty produce
- **Traditional Farming**: Wheat, rice, cotton, sugarcane rotations

---

## 🌐 Multi-language Support

AgroMitra automatically detects and responds in:
- Hindi (हिंदी)
- English
- And many other regional languages

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For technical support or farming questions:
- Check the [LiveKit Documentation](https://docs.livekit.io/)
- Review the SoilGrids API documentation
- Contact the development team

---

**🌾 Happy Farming with AgroMitra! 🌾**

