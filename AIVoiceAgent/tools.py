import logging
from livekit.agents import function_tool, RunContext
import requests
from langchain_community.tools import DuckDuckGoSearchRun
import os
import smtplib
from email.mime.multipart import MIMEMultipart  
from email.mime.text import MIMEText
from typing import Optional, Dict, List, Any
import json
from datetime import datetime, timedelta
import asyncio

# Backend API base URL
BACKEND_API_URL = "http://localhost:5000/api"

# Navigation URLs - Updated to correct port
NAVIGATION_URLS = {
    'home': '/',
    'homepage': '/',
    'tasks': '/tasks',
    'task': '/tasks',
    'community': '/community',
    'my farm': '/my-farm',
    'farm': '/my-farm',
    'market prices': '/market-prices',
    'market': '/market-prices',
    'prices': '/market-prices',
    'crop recommendations': '/crop-recommendations',
    'crops': '/crop-recommendations',
    'voice ai': '/voice-ai',
    'voice assistant': '/voice-ai'
}

@function_tool()
async def get_weather(
    context: RunContext,  # type: ignore
    city: str) -> str:
    """
    Get the current weather for a given city.
    """
    logging.info(f"get_weather function called with city: {city}")  # Add this
    try:
        api_key = os.getenv("OPENWEATHER_API_KEY")
        logging.info(f"API key present: {bool(api_key)}")  # Add this
        if not api_key:
            return "Weather API key not configured."
            
        response = requests.get(
            f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric")
        
        if response.status_code == 200:
            data = response.json()
            weather_info = f"Weather in {city}: {data['weather'][0]['description']}, Temperature: {data['main']['temp']}°C, Feels like: {data['main']['feels_like']}°C"
            logging.info(f"Weather for {city}: {weather_info}")
            return weather_info
        else:
            logging.error(f"Failed to get weather for {city}: {response.status_code}")
            return f"Could not retrieve weather for {city}."
    except Exception as e:
        logging.error(f"Error retrieving weather for {city}: {e}")
        return f"An error occurred while retrieving weather for {city}." 

@function_tool()
async def search_web(
    context: RunContext,  # type: ignore
    query: str) -> str:
    """
    Search the web using DuckDuckGo.
    """
    try:
        # Use the updated DuckDuckGo search with proper configuration
        from duckduckgo_search import DDGS
        
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5))
            
        if not results:
            logging.warning(f"No search results found for '{query}'")
            return f"No results found for '{query}'."
        
        # Format results in a readable way
        formatted_results = []
        for i, result in enumerate(results, 1):
            formatted_results.append(
                f"{i}. {result.get('title', 'No title')}\n"
                f"   {result.get('body', 'No description')}\n"
                f"   URL: {result.get('href', 'No URL')}"
            )
        
        search_summary = "\n\n".join(formatted_results)
        logging.info(f"Search results for '{query}': Found {len(results)} results")
        return search_summary
        
    except Exception as e:
        logging.error(f"Error searching the web for '{query}': {e}")
        return f"I encountered an issue while searching: {str(e)}. Please try rephrasing your query."

@function_tool()    
async def send_email(
    
    context: RunContext,  # type: ignore
    to_email: str,
    subject: str,
    message: str,
    cc_email: Optional[str] = None
) -> str:
    """
    Send an email through Gmail.
    
    Args:
        to_email: Recipient email address
        subject: Email subject line
        message: Email body content
        cc_email: Optional CC email address
    """
    try:
        # Gmail SMTP configuration
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        
        # Get credentials from environment variables
        gmail_user = os.getenv("GMAIL_USER")
        gmail_password = os.getenv("GMAIL_APP_PASSWORD")  # Use App Password, not regular password
        
        if not gmail_user or not gmail_password:
            logging.error("Gmail credentials not found in environment variables")
            return "Email sending failed: Gmail credentials not configured."
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = gmail_user
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add CC if provided
        recipients = [to_email]
        if cc_email:
            msg['Cc'] = cc_email
            recipients.append(cc_email)
        
        # Attach message body
        msg.attach(MIMEText(message, 'plain'))
        
        # Connect to Gmail SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Enable TLS encryption
        server.login(gmail_user, gmail_password)
        
        # Send email
        text = msg.as_string()
        server.sendmail(gmail_user, recipients, text)
        server.quit()
        
        logging.info(f"Email sent successfully to {to_email}")
        return f"Email sent successfully to {to_email}"
        
    except smtplib.SMTPAuthenticationError:
        logging.error("Gmail authentication failed")
        return "Email sending failed: Authentication error. Please check your Gmail credentials."
    except smtplib.SMTPException as e:
        logging.error(f"SMTP error occurred: {e}")
        return f"Email sending failed: SMTP error - {str(e)}"
    except Exception as e:
        logging.error(f"Error sending email: {e}")
        return f"An error occurred while sending email: {str(e)}"
    



@function_tool
async def show_recommended_crop(
    context: RunContext,  # type: ignore
    latitude: float,
    longitude: float
) -> str:
    """
    Recommend crops based on soil data and weather conditions for the given location.
    Returns a JSON formatted list of crop recommendations.
    
    Args:
        latitude: Latitude coordinate of the farm location
        longitude: Longitude coordinate of the farm location
    """
    try:
        import json
        
        # Fetch soil data from SoilGrids API
        soil_url = f"https://rest.isric.org/soilgrids/v2.0/properties/query?lon={longitude}&lat={latitude}"
        soil_response = requests.get(soil_url)
        
        soil_data = {}
        if soil_response.status_code == 200:
            soil_data = soil_response.json()
            logging.info(f"Soil data fetched for coordinates ({latitude}, {longitude})")
        else:
            logging.warning(f"Could not fetch soil data: {soil_response.status_code}")
        
        # Create crop recommendations based on soil data
        # This is a simplified logic - you can enhance it based on actual soil analysis
        crop_recommendations = [
            {
                "strategy_id": "rec-001",
                "strategy_name": "Paddy-cum-Fish Culture",
                "farming_type": "Integrated Farming",
                "crops_main": ["Paddy", "Rice"],
                "crops_secondary": ["Rohu Fish", "Catla Fish", "Mrigal Fish"],
                "investment_cost": 150000,
                "estimated_profit_net": 85000,
                "roi_percentage": 56.7,
                "key_risk_factors": ["Water management", "Fish disease", "Market price fluctuation"],
                "ideal_soil_types": ["Clay loam", "Heavy clay", "Waterlogged soil"],
                "suitability_score": 85,
                "season": "Kharif"
            },
            {
                "strategy_id": "rec-002",
                "strategy_name": "Wheat-Mustard with Mango Boundary Planting",
                "farming_type": "Boundary Planting",
                "crops_main": ["Wheat", "Mustard"],
                "crops_secondary": ["Mango"],
                "investment_cost": 85000,
                "estimated_profit_net": 62000,
                "roi_percentage": 72.9,
                "key_risk_factors": ["Weather dependency", "Pest attacks", "Soil fertility decline"],
                "ideal_soil_types": ["Loamy soil", "Sandy loam", "Well-drained soil"],
                "suitability_score": 78,
                "season": "Rabi"
            },
            {
                "strategy_id": "rec-003",
                "strategy_name": "Organic Vegetable Farming with Drip Irrigation",
                "farming_type": "High-Value",
                "crops_main": ["Tomato", "Capsicum", "Cucumber"],
                "crops_secondary": ["Basil", "Mint"],
                "investment_cost": 200000,
                "estimated_profit_net": 180000,
                "roi_percentage": 90.0,
                "key_risk_factors": ["High initial investment", "Technical expertise needed", "Market access"],
                "ideal_soil_types": ["Sandy loam", "Well-drained soil", "Rich organic matter"],
                "suitability_score": 92,
                "season": "Year-round"
            }
        ]
        
        result = {
            "location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "soil_analysis_available": bool(soil_data),
            "recommendations": crop_recommendations,
            "total_recommendations": len(crop_recommendations)
        }
        
        logging.info(f"Generated {len(crop_recommendations)} crop recommendations")
        return json.dumps(result, indent=2)
        
    except requests.RequestException as e:
        logging.error(f"Error fetching soil data: {e}")
        return json.dumps({"error": f"Failed to fetch soil data: {str(e)}"})
    except Exception as e:
        logging.error(f"Error generating crop recommendations: {e}")
        return json.dumps({"error": f"An error occurred: {str(e)}"})


@function_tool()
async def get_market_prices(
    context: RunContext,  # type: ignore
    crop_name: Optional[str] = None,
    location: Optional[str] = None
) -> str:
    """
    Get current market prices for crops. Can filter by crop name and location.
    """
    try:
        # Mock market prices - replace with actual API call to backend
        backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
        
        market_prices = [
            {"crop": "Rice", "price": 2500, "unit": "per quintal", "market": "Local Mandi", "date": datetime.now().strftime("%Y-%m-%d"), "trend": "up"},
            {"crop": "Wheat", "price": 2200, "unit": "per quintal", "market": "Local Mandi", "date": datetime.now().strftime("%Y-%m-%d"), "trend": "stable"},
            {"crop": "Maize", "price": 1800, "unit": "per quintal", "market": "Local Mandi", "date": datetime.now().strftime("%Y-%m-%d"), "trend": "down"},
            {"crop": "Tomato", "price": 3000, "unit": "per quintal", "market": "Local Market", "date": datetime.now().strftime("%Y-%m-%d"), "trend": "up"},
            {"crop": "Onion", "price": 2800, "unit": "per quintal", "market": "Local Market", "date": datetime.now().strftime("%Y-%m-%d"), "trend": "stable"},
            {"crop": "Potato", "price": 1500, "unit": "per quintal", "market": "Local Market", "date": datetime.now().strftime("%Y-%m-%d"), "trend": "up"}
        ]
        
        # Filter by crop name if provided
        if crop_name:
            market_prices = [p for p in market_prices if crop_name.lower() in p["crop"].lower()]
        
        if not market_prices:
            return f"No market price data found for {crop_name or 'requested crops'}."
        
        # Format response
        response = "📊 Current Market Prices:\n\n"
        for price in market_prices:
            trend_icon = {"up": "📈", "down": "📉", "stable": "➡️"}.get(price["trend"], "➡️")
            response += f"{trend_icon} {price['crop']}: ₹{price['price']}/{price['unit']}\n"
            response += f"   📍 {price['market']} | {price['date']}\n\n"
        
        logging.info(f"Retrieved market prices for {len(market_prices)} crops")
        return response
        
    except Exception as e:
        logging.error(f"Error getting market prices: {e}")
        return "Sorry, I couldn't retrieve market prices at the moment. Please try again later."


@function_tool()
async def diagnose_crop_disease(
    context: RunContext,  # type: ignore
    symptoms: str,
    crop_type: Optional[str] = None
) -> str:
    """
    Diagnose crop diseases and pests based on symptoms description.
    """
    try:
        symptoms_lower = symptoms.lower()
        diagnosis = {
            "possible_diseases": [],
            "possible_pests": [],
            "recommendations": []
        }
        
        # Disease detection logic
        if any(word in symptoms_lower for word in ["yellow", "yellowing", "chlorosis"]):
            diagnosis["possible_diseases"].extend(["Nutrient deficiency (Nitrogen)", "Viral infection", "Root rot"])
            diagnosis["recommendations"].extend(["Apply balanced fertilizer", "Improve drainage", "Test soil pH"])
        
        if any(word in symptoms_lower for word in ["spots", "lesions", "patches"]):
            diagnosis["possible_diseases"].extend(["Leaf spot disease", "Fungal infection", "Bacterial blight"])
            diagnosis["recommendations"].extend(["Apply fungicide spray", "Remove affected leaves", "Improve air circulation"])
        
        if any(word in symptoms_lower for word in ["holes", "eaten", "chewed"]):
            diagnosis["possible_pests"].extend(["Caterpillars", "Beetles", "Grasshoppers"])
            diagnosis["recommendations"].extend(["Use neem oil spray", "Install pheromone traps", "Introduce beneficial insects"])
        
        if any(word in symptoms_lower for word in ["wilting", "drooping", "sagging"]):
            diagnosis["possible_diseases"].extend(["Wilt disease", "Root damage", "Water stress"])
            diagnosis["recommendations"].extend(["Check irrigation schedule", "Inspect root system", "Apply organic matter"])
        
        if any(word in symptoms_lower for word in ["white", "powdery", "mildew"]):
            diagnosis["possible_diseases"].extend(["Powdery mildew", "Downy mildew"])
            diagnosis["recommendations"].extend(["Apply sulfur-based fungicide", "Reduce humidity", "Improve spacing"])
        
        # Format response
        response = "🔍 Crop Diagnosis Results:\n\n"
        
        if diagnosis["possible_diseases"]:
            response += "🦠 Possible Diseases:\n"
            for disease in diagnosis["possible_diseases"][:3]:  # Limit to top 3
                response += f"• {disease}\n"
            response += "\n"
        
        if diagnosis["possible_pests"]:
            response += "🐛 Possible Pests:\n"
            for pest in diagnosis["possible_pests"][:3]:
                response += f"• {pest}\n"
            response += "\n"
        
        if diagnosis["recommendations"]:
            response += "💡 Recommended Actions:\n"
            for rec in diagnosis["recommendations"][:4]:  # Limit to top 4
                response += f"• {rec}\n"
        
        if not any([diagnosis["possible_diseases"], diagnosis["possible_pests"]]):
            response = "I need more specific symptoms to provide an accurate diagnosis. Could you describe:\n• Color changes in leaves\n• Spots or lesions\n• Plant behavior (wilting, stunted growth)\n• Any visible insects or pests"
        
        logging.info(f"Diagnosed crop issue with symptoms: {symptoms[:50]}...")
        return response
        
    except Exception as e:
        logging.error(f"Error diagnosing crop disease: {e}")
        return "Sorry, I couldn't analyze the symptoms at the moment. Please try describing the issue again."


@function_tool()
async def get_farming_tasks(
    context: RunContext,  # type: ignore
    season: Optional[str] = None,
    crop_type: Optional[str] = None
) -> str:
    """
    Get farming task recommendations based on season and crop type.
    """
    try:
        current_month = datetime.now().month
        
        # Determine season if not provided
        if not season:
            if current_month in [12, 1, 2]:
                season = "winter"
            elif current_month in [3, 4, 5]:
                season = "summer"
            elif current_month in [6, 7, 8, 9]:
                season = "monsoon"
            else:
                season = "post-monsoon"
        
        tasks = []
        
        # Season-based tasks
        if season.lower() in ["monsoon", "rainy"]:
            tasks.extend([
                {"task": "Prepare drainage channels", "priority": "high", "description": "Ensure proper drainage to prevent waterlogging", "days": 7, "category": "irrigation"},
                {"task": "Plant rice seedlings", "priority": "high", "description": "Optimal time for rice transplantation", "days": 3, "category": "planting"},
                {"task": "Apply organic fertilizer", "priority": "medium", "description": "Monsoon crops need proper nutrition", "days": 10, "category": "fertilization"}
            ])
        
        elif season.lower() == "winter":
            tasks.extend([
                {"task": "Sow wheat seeds", "priority": "high", "description": "Plant wheat for rabi season harvest", "days": 5, "category": "planting"},
                {"task": "Apply organic fertilizer", "priority": "medium", "description": "Winter crops need proper nutrition", "days": 10, "category": "fertilization"},
                {"task": "Irrigation management", "priority": "medium", "description": "Monitor soil moisture levels", "days": 2, "category": "irrigation"}
            ])
        
        elif season.lower() == "summer":
            tasks.extend([
                {"task": "Install drip irrigation", "priority": "high", "description": "Water conservation is critical in summer", "days": 2, "category": "irrigation"},
                {"task": "Harvest winter crops", "priority": "high", "description": "Complete harvesting before extreme heat", "days": 1, "category": "harvesting"},
                {"task": "Mulching application", "priority": "medium", "description": "Protect soil from heat", "days": 3, "category": "maintenance"}
            ])
        
        # Format response
        response = f"📋 Farming Tasks for {season.title()} Season:\n\n"
        
        priority_icons = {"high": "🔴", "medium": "🟡", "low": "🟢"}
        
        for i, task in enumerate(tasks[:5], 1):  # Limit to 5 tasks
            icon = priority_icons.get(task["priority"], "⚪")
            due_date = (datetime.now() + timedelta(days=task["days"])).strftime("%Y-%m-%d")
            
            response += f"{icon} {task['task']}\n"
            response += f"   📅 Due: {due_date} | 🏷️ {task['category'].title()}\n"
            response += f"   📝 {task['description']}\n\n"
        
        logging.info(f"Generated {len(tasks)} farming tasks for {season} season")
        return response
        
    except Exception as e:
        logging.error(f"Error getting farming tasks: {e}")
        return "Sorry, I couldn't retrieve farming tasks at the moment. Please try again."


@function_tool()
async def get_weather_farming_advice(
    context: RunContext,  # type: ignore
    city: str
) -> str:
    """
    Get weather information with farming-specific advice.
    """
    try:
        # Get weather data first
        weather_info = await get_weather(context, city)
        
        if "error" in weather_info.lower() or "could not" in weather_info.lower():
            return weather_info
        
        # Extract temperature for advice (simplified parsing)
        import re
        temp_match = re.search(r'Temperature: ([\d.]+)°C', weather_info)
        temp = float(temp_match.group(1)) if temp_match else 25
        
        # Generate farming advice based on weather
        advice = []
        
        if temp > 35:
            advice.extend([
                "🌡️ High temperature alert - increase irrigation frequency",
                "🌿 Apply mulch to protect crops from heat stress",
                "⏰ Schedule farming activities for early morning or evening"
            ])
        elif temp < 10:
            advice.extend([
                "❄️ Cold weather - protect sensitive crops with covers",
                "💧 Reduce irrigation frequency",
                "🔥 Consider frost protection measures"
            ])
        
        if "rain" in weather_info.lower():
            advice.extend([
                "🌧️ Rain expected - check drainage systems",
                "🚫 Avoid pesticide/fungicide application during rain",
                "📅 Postpone harvesting activities if possible"
            ])
        
        if "wind" in weather_info.lower():
            advice.extend([
                "💨 Windy conditions - secure greenhouse covers",
                "🌾 Check tall crops for support needs"
            ])
        
        # Combine weather info with farming advice
        response = weather_info + "\n\n🌾 Farming Advice:\n"
        for tip in advice[:4]:  # Limit to 4 tips
            response += f"• {tip}\n"
        
        if not advice:
            response += "• Weather conditions are generally favorable for normal farming activities\n"
        
        logging.info(f"Provided weather and farming advice for {city}")
        return response
        
    except Exception as e:
        logging.error(f"Error getting weather farming advice: {e}")
        return "Sorry, I couldn't provide weather-based farming advice at the moment."


@function_tool()
async def calculate_farm_area(
    context: RunContext,  # type: ignore
    length_meters: float,
    width_meters: float
) -> str:
    """
    Calculate farm area in different units (square meters, acres, hectares).
    """
    try:
        area_sqm = length_meters * width_meters
        area_acres = area_sqm * 0.000247105  # Convert to acres
        area_hectares = area_sqm * 0.0001  # Convert to hectares
        
        response = f"📐 Farm Area Calculation:\n\n"
        response += f"📏 Dimensions: {length_meters}m × {width_meters}m\n"
        response += f"📊 Area:\n"
        response += f"   • {area_sqm:,.0f} square meters\n"
        response += f"   • {area_acres:.2f} acres\n"
        response += f"   • {area_hectares:.2f} hectares\n\n"
        
        # Add farming capacity estimates
        response += f"🌾 Estimated Farming Capacity:\n"
        if area_acres >= 1:
            response += f"   • Rice: {area_acres * 2:.1f} tons/season\n"
            response += f"   • Wheat: {area_acres * 1.5:.1f} tons/season\n"
        else:
            response += f"   • Suitable for vegetable farming\n"
            response += f"   • Small-scale crop production\n"
        
        logging.info(f"Calculated area for {length_meters}×{width_meters}m farm")
        return response
        
    except Exception as e:
        logging.error(f"Error calculating farm area: {e}")
        return "Sorry, I couldn't calculate the farm area. Please provide valid length and width in meters."

@function_tool()
async def get_user_farm_info(context: RunContext) -> str:  # type: ignore
    """
    Get comprehensive farm information from localStorage including all farm details, coordinates, soil data, and crop information.
    This provides the complete farm profile needed for personalized recommendations without requiring user ID.
    """
    try:
        logging.info("Getting farm info from localStorage")
        
        # Send request to get farm data from localStorage through web client
        farm_request = {
            "type": "farm_data_request",
            "action": "get_all_farms"
        }
        
        try:
            # Send request through the agent context to web client
            if hasattr(context, 'room') and context.room:
                await context.room.local_participant.publish_data(
                    json.dumps(farm_request).encode(),
                    destination_sids=None
                )
                logging.info("Sent farm data request to web client")
                
                # For now, return a response that works with localStorage data
                return get_mock_farm_data_response()
            
        except Exception as data_error:
            logging.error(f"Error requesting farm data: {data_error}")
            return get_mock_farm_data_response()
            
    except Exception as e:
        logging.error(f"Error getting farm info: {e}")
        return "Sorry, I encountered an error retrieving your farm information."

def get_mock_farm_data_response() -> str:
    """
    Provide a response that works with localStorage-based farm data.
    This will be enhanced when we have direct localStorage access.
    """
    result = "🌾 **Your Farm Information:**\n\n"
    
    result += "I can help you with your farm information! Here's what I can do:\n\n"
    
    result += "**📱 To view your saved farms:**\n"
    result += "• Go to the 'My Farm' page\n"
    result += "• All your farm details are stored locally\n"
    result += "• View coordinates, area calculations, and soil data\n\n"
    
    result += "**🌱 Farm Management Features:**\n"
    result += "• Add multiple farm fields\n"
    result += "• Calculate farm areas automatically\n"
    result += "• Store soil analysis data\n"
    result += "• Track crop information\n\n"
    
    result += "**💡 How to get detailed farm info:**\n"
    result += "• Say 'show me my farm page' to see all your farms\n"
    result += "• Your farm data is safely stored in your browser\n"
    result += "• No account required - everything is local!\n\n"
    
    result += "Would you like me to:\n"
    result += "• 📍 Navigate to your farm page?\n"
    result += "• 🧮 Help calculate new field areas?\n"
    result += "• 🌾 Provide crop recommendations?\n"
    result += "• 🌧️ Give farming advice based on current weather?"
    
    return result

@function_tool()
async def get_farm_for_crop_recommendations(context: RunContext) -> str:  # type: ignore
    """
    Get specific farm information from localStorage needed for crop recommendations including coordinates, soil data, and area details.
    This function provides structured data for making informed crop suggestions without requiring user ID.
    """
    try:
        logging.info("Getting farm data for crop recommendations from localStorage")
        
        # Send request to get farm data from localStorage through web client
        farm_request = {
            "type": "farm_data_request",
            "action": "get_crop_recommendation_data"
        }
        
        try:
            # Send request through the agent context to web client
            if hasattr(context, 'room') and context.room:
                await context.room.local_participant.publish_data(
                    json.dumps(farm_request).encode(),
                    destination_sids=None
                )
                logging.info("Sent crop recommendation data request to web client")
                
                # For now, return a response that works with localStorage data
                return get_crop_recommendation_guidance()
            
        except Exception as data_error:
            logging.error(f"Error requesting farm data for crops: {data_error}")
            return get_crop_recommendation_guidance()
            
    except Exception as e:
        logging.error(f"Error getting farm data for recommendations: {e}")
        return "Error retrieving farm data for crop recommendations."

def get_crop_recommendation_guidance() -> str:
    """
    Provide guidance for crop recommendations when farm data is stored in localStorage.
    """
    result = "🌾 **Farm Data for Crop Recommendations:**\n\n"
    
    result += "I can help you get personalized crop recommendations! Here's what I need:\n\n"
    
    result += "**📱 To get your farm data:**\n"
    result += "• Your farm information is stored locally in your browser\n"
    result += "• Go to 'My Farm' page to view all your saved farms\n"
    result += "• Each farm includes location, area, soil type, and current crops\n\n"
    
    result += "**🌱 For personalized crop recommendations, I can analyze:**\n"
    result += "• Your farm's geographic location (for climate data)\n"
    result += "• Soil type and analysis data\n"
    result += "• Current crop rotation history\n"
    result += "• Farm area and irrigation setup\n\n"
    
    result += "**💡 How to get recommendations:**\n"
    result += "• Tell me your location (city/state) for climate-based suggestions\n"
    result += "• Share your soil type (sandy/clay/loamy)\n"
    result += "• Mention what crops you've grown recently\n"
    result += "• Specify your farm area and season\n\n"
    
    result += "**Example requests:**\n"
    result += "• 'Recommend crops for my 5-acre farm in Punjab'\n"
    result += "• 'What should I plant after wheat harvest?'\n"
    result += "• 'Best crops for clay soil in winter season'\n"
    result += "• 'Show me my farm page' - to see your saved farm details\n\n"
    
    result += "Would you like me to:\n"
    result += "• 🌾 Give general crop recommendations for your region?\n"
    result += "• 📍 Navigate to your farm page to see saved details?\n"
    result += "• 🗓️ Provide seasonal planting calendar?\n"
    result += "• ☀️ Check current weather for farming decisions?"
    
    return result

# ================== NAVIGATION TOOLS ==================

@function_tool()
async def navigate_to_page(
    context: RunContext,  # type: ignore
    page: str) -> str:
    """
    Navigate user to a specific page in the application. Use this when user asks to go to, show, open, or navigate to a page.
    Available pages: home, tasks, community, my farm, market prices, crop recommendations, voice ai
    """
    try:
        page_lower = page.lower().strip()
        
        # 🚨 HARDCODED KEYWORD MAPPING - BULLETPROOF! 🚨
        HARDCODED_KEYWORDS = {
            'tasks': 'tasks',
            'task': 'tasks', 
            'community': 'community',
            'feed': 'community',
            'farm': 'farm',
            'my farm': 'farm',
            'my-farm': 'farm',
            'market': 'market',
            'market prices': 'market',
            'market-prices': 'market',
            'prices': 'market'
        }
        
        # Find the exact keyword to send
        keyword_to_send = HARDCODED_KEYWORDS.get(page_lower, page_lower)
        
        if page_lower in NAVIGATION_URLS:
            url = NAVIGATION_URLS[page_lower]
            logging.info(f"Navigating to {page} page: {url}")
            
            # Create response with multiple navigation triggers and natural language patterns
            natural_phrases = [
                f"Perfect! I've redirected you to the {page} page",
                f"I'm taking you to the {page} page right now",
                f"Let me bring you to the {page} page",
                f"Opening the {page} page for you",
                f"I've navigated you to the {page} page"
            ]
            
            chosen_phrase = natural_phrases[hash(page_lower) % len(natural_phrases)]
            
            response = f"🌐 **Navigation to {page.title()} Page**\n\n" \
                      f"{chosen_phrase}.\n\n" \
                      f"What you'll find on the {page} page:\n" + \
                      get_page_description(page_lower)
            
            # Method 1: Try LiveKit data channel with enhanced payload
            livekit_success = False
            try:
                if hasattr(context, 'room') and context.room:
                    navigation_data = json.dumps({
                        "type": "navigation_request", 
                        "action": "navigate",
                        "page": page_lower,
                        "keyword": keyword_to_send,  # 🚨 HARDCODED KEYWORD! 🚨
                        "url": url,
                        "message": f"Navigating to {page_lower} page",
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    # 🚨 NUCLEAR OPTION: SEND MULTIPLE MESSAGES! 🚨
                    
                    # 1. Primary navigation data
                    await context.room.local_participant.publish_data(
                        navigation_data.encode('utf-8')
                    )
                    
                    # 2. Just the keyword (nuclear option)
                    await context.room.local_participant.publish_data(
                        keyword_to_send.encode('utf-8')
                    )
                    
                    # 3. Backup text message
                    text_message = json.dumps({
                        "type": "agent_response",
                        "text": response,
                        "contains_navigation": True,
                        "navigation_url": url,
                        "keyword": keyword_to_send  # 🚨 KEYWORD AGAIN! 🚨
                    })
                    
                    await context.room.local_participant.publish_data(
                        text_message.encode('utf-8')
                    )
                    
                    # 4. Raw keyword (absolute nuclear)
                    await context.room.local_participant.publish_data(
                        f"NUCLEAR_KEYWORD:{keyword_to_send}".encode('utf-8')
                    )
                    
                    livekit_success = True
                    logging.info(f"✅ LiveKit navigation sent: {page_lower} -> {url}")
                    logging.info(f"✅ Navigation response text sent via data channel")
                
            except Exception as nav_error:
                logging.error(f"❌ LiveKit navigation failed: {nav_error}")
            
            # Method 2: HTML comment navigation (for text parsing)
            response += f"\n\n<!-- NAVIGATE:{url} -->"
            
            # Method 3: Special navigation marker (primary method)
            response += f"\n\n**🔄 REDIRECT_COMMAND:{url}**"
            
            # Method 4: Clean natural language trigger
            response += f"\n\nI'm redirecting you to the {page_lower} page."
            
            # Add status info
            if livekit_success:
                response += f"\n\n✅ Navigation sent via LiveKit channel"
            else:
                response += f"\n\n⚠️ Using backup navigation method - you should be redirected shortly"
            
            return response
        else:
            available_pages = ", ".join(NAVIGATION_URLS.keys())
            return f"❌ Sorry, I don't recognize the page '{page}'. Available pages are: {available_pages}"
            
    except Exception as e:
        logging.error(f"Error navigating to page {page}: {e}")
        return f"Sorry, I encountered an error while trying to navigate to the {page} page."

def get_page_description(page: str) -> str:
    """Get description of what user can do on each page"""
    descriptions = {
        'home': '• Use the main voice assistant\n• Access all farm features\n• Get quick farm insights',
        'homepage': '• Use the main voice assistant\n• Access all farm features\n• Get quick farm insights',
        'tasks': '• View and manage farming tasks\n• Add new tasks and reminders\n• Track task completion\n• Set priorities and deadlines',
        'task': '• View and manage farming tasks\n• Add new tasks and reminders\n• Track task completion\n• Set priorities and deadlines',
        'community': '• Connect with other farmers\n• Join farming groups\n• Share experiences and tips\n• Get community support',
        'my farm': '• Add and manage your farm fields\n• Calculate field areas\n• View soil analysis\n• Manage crop information',
        'farm': '• Add and manage your farm fields\n• Calculate field areas\n• View soil analysis\n• Manage crop information',
        'market prices': '• Check current crop prices\n• View market trends\n• Compare prices across markets\n• Make informed selling decisions',
        'market': '• Check current crop prices\n• View market trends\n• Compare prices across markets\n• Make informed selling decisions',
        'prices': '• Check current crop prices\n• View market trends\n• Compare prices across markets\n• Make informed selling decisions',
        'crop recommendations': '• Get personalized crop suggestions\n• View seasonal recommendations\n• Learn about suitable crops for your soil\n• Plan your next planting season',
        'crops': '• Get personalized crop suggestions\n• View seasonal recommendations\n• Learn about suitable crops for your soil\n• Plan your next planting season',
        'voice ai': '• Enhanced voice interactions\n• Advanced farming conversations\n• Multi-language support\n• Detailed agricultural guidance'
    }
    return descriptions.get(page, '• Explore farming features and tools')

# ================== COMPREHENSIVE FARMING TOOLS ==================

@function_tool()
async def get_soil_health_analysis(
    context: RunContext,  # type: ignore
    soil_ph: float = 7.0,
    organic_matter: float = 3.0,
    nitrogen: float = 2.5,
    phosphorus: float = 30.0,
    potassium: float = 150.0) -> str:
    """
    Analyze soil health parameters and provide comprehensive recommendations.
    Parameters: soil_ph (6.0-8.0), organic_matter (%), nitrogen (%), phosphorus (ppm), potassium (ppm)
    """
    try:
        analysis = []
        recommendations = []
        
        # pH Analysis
        if soil_ph < 6.0:
            analysis.append(f"🔴 Soil is acidic (pH {soil_ph})")
            recommendations.append("Add lime to increase pH")
        elif soil_ph > 8.0:
            analysis.append(f"🔴 Soil is alkaline (pH {soil_ph})")
            recommendations.append("Add sulfur or organic matter to lower pH")
        else:
            analysis.append(f"🟢 Soil pH is good ({soil_ph})")
        
        # Organic Matter Analysis
        if organic_matter < 2.0:
            analysis.append(f"🔴 Low organic matter ({organic_matter}%)")
            recommendations.append("Add compost, manure, or cover crops")
        elif organic_matter > 5.0:
            analysis.append(f"🟢 Excellent organic matter ({organic_matter}%)")
        else:
            analysis.append(f"🟡 Moderate organic matter ({organic_matter}%)")
        
        # NPK Analysis
        if nitrogen < 2.0:
            analysis.append(f"🔴 Low nitrogen ({nitrogen}%)")
            recommendations.append("Apply nitrogen-rich fertilizer or plant legumes")
        
        if phosphorus < 25:
            analysis.append(f"🔴 Low phosphorus ({phosphorus} ppm)")
            recommendations.append("Apply phosphate fertilizer")
        
        if potassium < 100:
            analysis.append(f"🔴 Low potassium ({potassium} ppm)")
            recommendations.append("Apply potash or wood ash")
        
        result = "🌱 **Soil Health Analysis Report**\n\n"
        result += "**Current Status:**\n" + "\n".join(f"• {item}" for item in analysis)
        
        if recommendations:
            result += "\n\n**Recommendations:**\n" + "\n".join(f"• {item}" for item in recommendations)
        else:
            result += "\n\n🎉 **Your soil health looks excellent! Keep up the good work.**"
        
        result += "\n\n**Next Steps:**\n"
        result += "• Test soil every 6 months\n"
        result += "• Monitor crop performance\n"
        result += "• Adjust fertilization based on crop needs"
        
        return result
        
    except Exception as e:
        logging.error(f"Error in soil health analysis: {e}")
        return "Sorry, I couldn't complete the soil analysis. Please check your input values."

@function_tool()
async def get_irrigation_schedule(
    context: RunContext,  # type: ignore
    crop_type: str,
    season: str = "current",
    soil_type: str = "loamy",
    area_acres: float = 1.0) -> str:
    """
    Provide detailed irrigation scheduling for specific crops based on season and soil type.
    """
    try:
        current_month = datetime.now().month
        
        # Seasonal water requirements (liters per day per acre)
        crop_water_needs = {
            "wheat": {"winter": 800, "summer": 1200, "monsoon": 400},
            "rice": {"winter": 1500, "summer": 2000, "monsoon": 800},
            "tomato": {"winter": 600, "summer": 1000, "monsoon": 300},
            "potato": {"winter": 500, "summer": 800, "monsoon": 200},
            "onion": {"winter": 400, "summer": 700, "monsoon": 150},
            "corn": {"winter": 700, "summer": 1100, "monsoon": 500},
            "sugarcane": {"winter": 1200, "summer": 1800, "monsoon": 600}
        }
        
        # Soil adjustment factors
        soil_factors = {
            "sandy": 1.3,  # Needs more water
            "clay": 0.8,   # Retains water better
            "loamy": 1.0   # Standard
        }
        
        crop_lower = crop_type.lower()
        if season == "current":
            if current_month in [12, 1, 2]:
                season = "winter"
            elif current_month in [6, 7, 8, 9]:
                season = "monsoon"
            else:
                season = "summer"
        
        base_water = crop_water_needs.get(crop_lower, {"winter": 600, "summer": 900, "monsoon": 300})[season]
        soil_factor = soil_factors.get(soil_type.lower(), 1.0)
        
        daily_water = base_water * soil_factor * area_acres
        weekly_water = daily_water * 7
        
        result = f"💧 **Irrigation Schedule for {crop_type.title()}**\n\n"
        result += f"**Farm Details:**\n"
        result += f"• Crop: {crop_type.title()}\n"
        result += f"• Season: {season.title()}\n"
        result += f"• Soil Type: {soil_type.title()}\n"
        result += f"• Area: {area_acres} acres\n\n"
        
        result += f"**Water Requirements:**\n"
        result += f"• Daily: {daily_water:,.0f} liters ({daily_water/1000:.1f} cubic meters)\n"
        result += f"• Weekly: {weekly_water:,.0f} liters ({weekly_water/1000:.1f} cubic meters)\n\n"
        
        result += f"**Irrigation Schedule:**\n"
        if season == "monsoon":
            result += f"• Check soil moisture before watering\n"
            result += f"• Water only on non-rainy days\n"
            result += f"• Focus on drainage to prevent waterlogging\n"
        else:
            result += f"• Morning watering: 6:00 AM - 8:00 AM\n"
            result += f"• Evening watering: 5:00 PM - 7:00 PM\n"
            result += f"• Frequency: Every 2-3 days for {soil_type} soil\n"
        
        result += f"\n**Tips:**\n"
        result += f"• Use mulching to reduce water evaporation\n"
        result += f"• Install drip irrigation for efficiency\n"
        result += f"• Monitor soil moisture at 6-inch depth\n"
        
        return result
        
    except Exception as e:
        logging.error(f"Error getting irrigation schedule: {e}")
        return "Sorry, I couldn't generate the irrigation schedule. Please try again."

@function_tool()
async def get_pest_control_guide(
    context: RunContext,  # type: ignore
    crop: str,
    pest_type: str = "general",
    severity: str = "moderate") -> str:
    """
    Provide comprehensive pest control guidance for specific crops and pest types.
    Severity levels: mild, moderate, severe
    """
    try:
        # Common pests by crop
        crop_pests = {
            "tomato": ["aphids", "whiteflies", "hornworms", "cutworms", "blight"],
            "wheat": ["aphids", "army worms", "rust", "smut"],
            "rice": ["brown planthopper", "stem borer", "blast disease"],
            "potato": ["colorado beetle", "late blight", "wireworms"],
            "corn": ["corn borer", "armyworm", "rootworm", "rust"],
            "cotton": ["bollworm", "aphids", "jassids", "thrips"]
        }
        
        # Pest control methods
        control_methods = {
            "organic": [
                "Neem oil spray (5ml per liter water)",
                "Beneficial insects (ladybugs, lacewings)",
                "Companion planting (marigolds, basil)",
                "Diatomaceous earth for crawling insects",
                "Garlic-chili spray for soft-bodied insects"
            ],
            "biological": [
                "Release predatory insects",
                "Use pheromone traps",
                "Apply Bacillus thuringiensis (Bt)",
                "Encourage birds and bats",
                "Use parasitic wasps"
            ],
            "chemical": [
                "Targeted insecticides (as last resort)",
                "Systemic pesticides for severe infestations",
                "Fungicides for disease control",
                "Follow IPM principles",
                "Rotate chemical classes"
            ]
        }
        
        result = f"🐛 **Pest Control Guide for {crop.title()}**\n\n"
        
        # Common pests for this crop
        if crop.lower() in crop_pests:
            result += f"**Common Pests in {crop.title()}:**\n"
            for pest in crop_pests[crop.lower()]:
                result += f"• {pest.title()}\n"
            result += "\n"
        
        result += f"**Current Issue:** {pest_type.title()} - {severity.title()} Severity\n\n"
        
        # Treatment based on severity
        if severity.lower() == "mild":
            result += f"**Recommended Approach: Organic Methods**\n"
            for method in control_methods["organic"]:
                result += f"• {method}\n"
        elif severity.lower() == "moderate":
            result += f"**Recommended Approach: Organic + Biological**\n"
            for method in control_methods["organic"][:3]:
                result += f"• {method}\n"
            for method in control_methods["biological"][:2]:
                result += f"• {method}\n"
        else:  # severe
            result += f"**Recommended Approach: Integrated Pest Management**\n"
            result += f"*Immediate Action Needed*\n\n"
            for method in control_methods["chemical"][:3]:
                result += f"• {method}\n"
            result += f"\n**Follow-up with:**\n"
            for method in control_methods["organic"][:2]:
                result += f"• {method}\n"
        
        result += f"\n**Prevention Tips:**\n"
        result += f"• Regular field monitoring (weekly)\n"
        result += f"• Maintain proper plant spacing\n"
        result += f"• Remove crop residue after harvest\n"
        result += f"• Use certified disease-free seeds\n"
        result += f"• Implement crop rotation\n"
        
        result += f"\n**When to Apply Treatment:**\n"
        result += f"• Early morning (6-8 AM) or late evening (5-7 PM)\n"
        result += f"• Avoid windy conditions\n"
        result += f"• Don't spray before rain\n"
        
        return result
        
    except Exception as e:
        logging.error(f"Error getting pest control guide: {e}")
        return "Sorry, I couldn't generate the pest control guide. Please try again."

@function_tool()
async def get_fertilizer_recommendations(
    context: RunContext,  # type: ignore
    crop: str,
    growth_stage: str = "vegetative",
    soil_type: str = "loamy",
    area_acres: float = 1.0) -> str:
    """
    Provide detailed fertilizer recommendations based on crop, growth stage, and soil type.
    Growth stages: seedling, vegetative, flowering, fruiting, maturity
    """
    try:
        # NPK requirements by crop and stage (kg per acre)
        fertilizer_needs = {
            "wheat": {
                "seedling": {"N": 20, "P": 15, "K": 10},
                "vegetative": {"N": 40, "P": 20, "K": 15},
                "flowering": {"N": 30, "P": 25, "K": 20},
                "maturity": {"N": 10, "P": 10, "K": 15}
            },
            "rice": {
                "seedling": {"N": 15, "P": 20, "K": 15},
                "vegetative": {"N": 50, "P": 25, "K": 20},
                "flowering": {"N": 35, "P": 15, "K": 25},
                "maturity": {"N": 15, "P": 5, "K": 20}
            },
            "tomato": {
                "seedling": {"N": 10, "P": 12, "K": 8},
                "vegetative": {"N": 25, "P": 15, "K": 20},
                "flowering": {"N": 20, "P": 25, "K": 30},
                "fruiting": {"N": 30, "P": 20, "K": 35}
            },
            "potato": {
                "seedling": {"N": 15, "P": 20, "K": 25},
                "vegetative": {"N": 35, "P": 25, "K": 40},
                "flowering": {"N": 25, "P": 15, "K": 45},
                "maturity": {"N": 10, "P": 5, "K": 30}
            }
        }
        
        # Soil adjustment factors
        soil_adjustments = {
            "sandy": {"N": 1.2, "P": 1.1, "K": 1.3},
            "clay": {"N": 0.9, "P": 0.8, "K": 0.8},
            "loamy": {"N": 1.0, "P": 1.0, "K": 1.0}
        }
        
        crop_lower = crop.lower()
        default_npk = {"N": 25, "P": 20, "K": 20}
        
        if crop_lower in fertilizer_needs and growth_stage in fertilizer_needs[crop_lower]:
            base_npk = fertilizer_needs[crop_lower][growth_stage]
        else:
            base_npk = default_npk
        
        soil_factor = soil_adjustments.get(soil_type.lower(), {"N": 1.0, "P": 1.0, "K": 1.0})
        
        # Calculate adjusted requirements
        adjusted_npk = {
            "N": base_npk["N"] * soil_factor["N"] * area_acres,
            "P": base_npk["P"] * soil_factor["P"] * area_acres,
            "K": base_npk["K"] * soil_factor["K"] * area_acres
        }
        
        result = f"🌿 **Fertilizer Recommendations for {crop.title()}**\n\n"
        result += f"**Farm Details:**\n"
        result += f"• Crop: {crop.title()}\n"
        result += f"• Growth Stage: {growth_stage.title()}\n"
        result += f"• Soil Type: {soil_type.title()}\n"
        result += f"• Area: {area_acres} acres\n\n"
        
        result += f"**Nutrient Requirements:**\n"
        result += f"• Nitrogen (N): {adjusted_npk['N']:.1f} kg\n"
        result += f"• Phosphorus (P₂O₅): {adjusted_npk['P']:.1f} kg\n"
        result += f"• Potassium (K₂O): {adjusted_npk['K']:.1f} kg\n\n"
        
        result += f"**Fertilizer Options:**\n"
        result += f"**Option 1: Organic**\n"
        result += f"• Compost: {(adjusted_npk['N'] * 50):.0f} kg (provides slow-release nutrients)\n"
        result += f"• Bone meal: {(adjusted_npk['P'] * 10):.0f} kg (for phosphorus)\n"
        result += f"• Wood ash: {(adjusted_npk['K'] * 8):.0f} kg (for potassium)\n\n"
        
        result += f"**Option 2: Chemical**\n"
        urea_needed = adjusted_npk['N'] * 2.17  # Urea is 46% N
        dap_needed = adjusted_npk['P'] * 2.17   # DAP is 46% P₂O₅
        mop_needed = adjusted_npk['K'] * 1.67   # MOP is 60% K₂O
        
        result += f"• Urea (46% N): {urea_needed:.1f} kg\n"
        result += f"• DAP (46% P₂O₅): {dap_needed:.1f} kg\n"
        result += f"• MOP (60% K₂O): {mop_needed:.1f} kg\n\n"
        
        result += f"**Application Method:**\n"
        if growth_stage in ["seedling", "vegetative"]:
            result += f"• Apply as basal dose before planting\n"
            result += f"• Mix thoroughly in soil\n"
        elif growth_stage == "flowering":
            result += f"• Apply as side dressing\n"
            result += f"• Water immediately after application\n"
        else:
            result += f"• Apply as foliar spray (diluted)\n"
            result += f"• Early morning application preferred\n"
        
        result += f"\n**Important Notes:**\n"
        result += f"• Test soil before applying fertilizers\n"
        result += f"• Don't over-fertilize - it can harm plants\n"
        result += f"• Apply in split doses for better uptake\n"
        result += f"• Ensure adequate moisture after application\n"
        
        return result
        
    except Exception as e:
        logging.error(f"Error getting fertilizer recommendations: {e}")
        return "Sorry, I couldn't generate fertilizer recommendations. Please try again."

@function_tool()
async def get_crop_rotation_plan(
    context: RunContext,  # type: ignore
    current_crop: str,
    soil_type: str = "loamy",
    climate: str = "temperate",
    years: int = 3) -> str:
    """
    Provide a comprehensive crop rotation plan to maintain soil health and maximize yields.
    """
    try:
        # Crop families and their characteristics
        crop_families = {
            "legumes": ["beans", "peas", "lentils", "chickpeas", "soybeans"],
            "cereals": ["wheat", "rice", "corn", "barley", "oats"],
            "brassicas": ["cabbage", "broccoli", "cauliflower", "mustard", "radish"],
            "solanaceae": ["tomato", "potato", "eggplant", "peppers"],
            "cucurbits": ["cucumber", "squash", "pumpkin", "melon"],
            "root_crops": ["carrot", "beet", "turnip", "onion"]
        }
        
        # Benefits of crop families
        family_benefits = {
            "legumes": "Fix nitrogen in soil, improve soil structure",
            "cereals": "High biomass, good for soil organic matter",
            "brassicas": "Break pest cycles, natural biofumigation",
            "solanaceae": "Deep rooting, nutrient uptake",
            "cucurbits": "Ground cover, weed suppression",
            "root_crops": "Break soil compaction, utilize deep nutrients"
        }
        
        # Find current crop family
        current_family = None
        for family, crops in crop_families.items():
            if current_crop.lower() in crops:
                current_family = family
                break
        
        result = f"🔄 **Crop Rotation Plan for {current_crop.title()}**\n\n"
        result += f"**Current Situation:**\n"
        result += f"• Current Crop: {current_crop.title()}\n"
        result += f"• Soil Type: {soil_type.title()}\n"
        result += f"• Climate: {climate.title()}\n"
        result += f"• Planning Period: {years} years\n\n"
        
        if current_family:
            result += f"• Crop Family: {current_family.title()}\n"
            result += f"• Family Benefit: {family_benefits[current_family]}\n\n"
        
        result += f"**Recommended {years}-Year Rotation:**\n\n"
        
        # Generate rotation plan
        if current_family == "legumes":
            rotation = ["Cereals (wheat/rice)", "Root crops (potato/onion)", "Brassicas (mustard/cabbage)"]
        elif current_family == "cereals":
            rotation = ["Legumes (beans/peas)", "Brassicas (mustard)", "Root crops (potato)"]
        elif current_family == "brassicas":
            rotation = ["Legumes (soybeans)", "Cereals (corn)", "Solanaceae (tomato)"]
        elif current_family == "solanaceae":
            rotation = ["Legumes (beans)", "Cereals (wheat)", "Brassicas (cabbage)"]
        else:
            rotation = ["Legumes (beans/peas)", "Cereals (wheat/rice)", "Brassicas (mustard)"]
        
        for i in range(years):
            year_crop = rotation[i % len(rotation)] if i < len(rotation) else rotation[i % len(rotation)]
            result += f"**Year {i + 2}:** {year_crop}\n"
            
            # Add benefits
            if "legumes" in year_crop.lower():
                result += f"  └ Benefits: Nitrogen fixation, soil improvement\n"
            elif "cereals" in year_crop.lower():
                result += f"  └ Benefits: High biomass, carbon addition\n"
            elif "brassicas" in year_crop.lower():
                result += f"  └ Benefits: Pest control, soil biofumigation\n"
            elif "root" in year_crop.lower():
                result += f"  └ Benefits: Soil decompaction, deep nutrient utilization\n"
            result += "\n"
        
        result += f"**Rotation Benefits:**\n"
        result += f"• 🌱 Improved soil fertility\n"
        result += f"• 🐛 Natural pest and disease control\n"
        result += f"• 🌾 Better weed management\n"
        result += f"• 💰 Reduced input costs\n"
        result += f"• 🌍 Enhanced biodiversity\n\n"
        
        result += f"**Implementation Tips:**\n"
        result += f"• Keep detailed records of each crop's performance\n"
        result += f"• Monitor soil health indicators regularly\n"
        result += f"• Adjust rotation based on market conditions\n"
        result += f"• Consider cover crops between main seasons\n"
        result += f"• Leave some land fallow if needed for soil recovery\n\n"
        
        result += f"**Cover Crop Suggestions:**\n"
        result += f"• Between seasons: Mustard, sunflower\n"
        result += f"• Winter cover: Rye grass, winter wheat\n"
        result += f"• Summer cover: Cowpeas, sun hemp\n"
        
        return result
        
    except Exception as e:
        logging.error(f"Error generating crop rotation plan: {e}")
        return "Sorry, I couldn't generate the crop rotation plan. Please try again."

@function_tool()
async def get_seasonal_calendar(
    context: RunContext,  # type: ignore
    location: str = "India",
    crop_focus: str = "mixed") -> str:
    """
    Provide comprehensive seasonal farming calendar with planting, care, and harvest schedules.
    """
    try:
        # Seasonal activities by month (for India - can be adapted)
        seasonal_activities = {
            "January": {
                "plant": ["wheat", "barley", "mustard", "peas"],
                "care": ["irrigation for rabi crops", "pest monitoring", "fertilizer application"],
                "harvest": ["sugarcane", "potato (early varieties)"],
                "general": ["soil preparation for summer crops", "equipment maintenance"]
            },
            "February": {
                "plant": ["summer vegetables", "fodder crops"],
                "care": ["continued irrigation", "weed control", "disease prevention"],
                "harvest": ["mustard", "gram", "wheat (late varieties)"],
                "general": ["market planning", "seed procurement for kharif"]
            },
            "March": {
                "plant": ["summer corn", "sunflower", "watermelon"],
                "care": ["increased irrigation", "mulching", "pest control"],
                "harvest": ["wheat", "barley", "chickpea"],
                "general": ["field preparation", "irrigation system check"]
            },
            "April": {
                "plant": ["cotton", "sugarcane", "summer rice"],
                "care": ["heat stress management", "regular watering", "shade provision"],
                "harvest": ["mustard oil seeds", "late wheat"],
                "general": ["equipment repair", "monsoon preparation"]
            },
            "May": {
                "plant": ["early kharif preparatory work"],
                "care": ["summer crop maintenance", "water conservation"],
                "harvest": ["summer vegetables", "fodder crops"],
                "general": ["soil testing", "seed treatment for kharif"]
            },
            "June": {
                "plant": ["rice", "cotton", "sugarcane", "corn"],
                "care": ["monsoon damage control", "drainage management"],
                "harvest": ["summer crops completion"],
                "general": ["monsoon preparedness", "field drainage"]
            },
            "July": {
                "plant": ["late kharif crops", "pulses", "oilseeds"],
                "care": ["weed control", "pest monitoring", "disease management"],
                "harvest": ["early summer crops"],
                "general": ["continuous monitoring", "intercropping"]
            },
            "August": {
                "plant": ["late season vegetables"],
                "care": ["nutrient management", "water logging prevention"],
                "harvest": ["early kharif vegetables"],
                "general": ["crop insurance", "yield estimation"]
            },
            "September": {
                "plant": ["post-monsoon vegetables", "winter preparatory crops"],
                "care": ["post-monsoon care", "disease control"],
                "harvest": ["kharif fruits", "vegetables"],
                "general": ["rabi preparation", "soil improvement"]
            },
            "October": {
                "plant": ["rabi crops", "winter vegetables", "wheat"],
                "care": ["reduced irrigation", "harvest preparation"],
                "harvest": ["rice", "cotton", "sugarcane"],
                "general": ["storage preparation", "market analysis"]
            },
            "November": {
                "plant": ["late rabi crops", "winter flowers"],
                "care": ["cold protection", "reduced watering"],
                "harvest": ["major kharif crops", "cotton picking"],
                "general": ["post-harvest management", "storage"]
            },
            "December": {
                "plant": ["winter vegetables", "late wheat"],
                "care": ["frost protection", "winter care"],
                "harvest": ["late kharif", "winter vegetables"],
                "general": ["year-end planning", "equipment winterization"]
            }
        }
        
        current_month = datetime.now().strftime("%B")
        next_month = (datetime.now().month % 12) + 1
        next_month_name = datetime(2024, next_month, 1).strftime("%B")
        
        result = f"📅 **Seasonal Farming Calendar for {location}**\n\n"
        result += f"**Current Focus: {current_month}**\n\n"
        
        if current_month in seasonal_activities:
            current = seasonal_activities[current_month]
            
            result += f"**🌱 This Month's Planting ({current_month}):**\n"
            for crop in current.get("plant", []):
                result += f"• {crop.title()}\n"
            
            result += f"\n**🔧 Care Activities:**\n"
            for activity in current.get("care", []):
                result += f"• {activity.title()}\n"
            
            result += f"\n**🌾 Harvest Ready:**\n"
            for crop in current.get("harvest", []):
                result += f"• {crop.title()}\n"
            
            result += f"\n**📋 General Tasks:**\n"
            for task in current.get("general", []):
                result += f"• {task.title()}\n"
        
        # Next month preview
        result += f"\n\n**🔮 Next Month Preview ({next_month_name}):**\n\n"
        if next_month_name in seasonal_activities:
            next_activities = seasonal_activities[next_month_name]
            
            result += f"**Prepare for Planting:**\n"
            for crop in next_activities.get("plant", [])[:3]:
                result += f"• {crop.title()}\n"
            
            result += f"\n**Key Activities to Plan:**\n"
            for activity in next_activities.get("general", [])[:3]:
                result += f"• {activity.title()}\n"
        
        # Seasonal tips
        result += f"\n\n**🌦️ Seasonal Tips:**\n"
        season_month = datetime.now().month
        if season_month in [12, 1, 2]:  # Winter
            result += f"• Protect crops from frost\n"
            result += f"• Reduce watering frequency\n"
            result += f"• Focus on rabi crop care\n"
        elif season_month in [3, 4, 5]:  # Summer
            result += f"• Increase irrigation frequency\n"
            result += f"• Provide shade for sensitive crops\n"
            result += f"• Prepare for monsoon season\n"
        elif season_month in [6, 7, 8, 9]:  # Monsoon
            result += f"• Ensure proper drainage\n"
            result += f"• Monitor for fungal diseases\n"
            result += f"• Control weeds actively\n"
        else:  # Post-monsoon
            result += f"• Prepare soil for rabi crops\n"
            result += f"• Complete kharif harvest\n"
            result += f"• Plan winter cropping\n"
        
        result += f"\n**📊 Planning Recommendations:**\n"
        result += f"• Keep detailed records of planting dates\n"
        result += f"• Monitor local weather forecasts\n"
        result += f"• Adjust timing based on local conditions\n"
        result += f"• Coordinate with local agricultural department\n"
        
        return result
        
    except Exception as e:
        logging.error(f"Error generating seasonal calendar: {e}")
        return "Sorry, I couldn't generate the seasonal calendar. Please try again."

@function_tool()
async def get_government_schemes(
    context: RunContext,  # type: ignore
    farmer_type: str = "small",
    location: str = "India",
    crop_category: str = "general") -> str:
    """
    Provide information about government schemes and subsidies available for farmers.
    Farmer types: small, marginal, medium, large
    """
    try:
        # Major government schemes (India-focused, can be adapted)
        schemes = {
            "pradhan_mantri_kisan": {
                "name": "PM-KISAN Samman Nidhi",
                "benefit": "₹6,000 per year in 3 installments",
                "eligibility": "All land-holding farmers",
                "how_to_apply": "Online at pmkisan.gov.in or through CSC centers"
            },
            "crop_insurance": {
                "name": "Pradhan Mantri Fasal Bima Yojana",
                "benefit": "Crop insurance against natural calamities",
                "eligibility": "All farmers (loanee and non-loanee)",
                "how_to_apply": "Through banks, CSCs, or insurance companies"
            },
            "kisan_credit_card": {
                "name": "Kisan Credit Card (KCC)",
                "benefit": "Easy credit access up to ₹3 lakh at 4% interest",
                "eligibility": "All farmers with land records",
                "how_to_apply": "Any bank branch with land documents"
            },
            "soil_health_card": {
                "name": "Soil Health Card Scheme",
                "benefit": "Free soil testing and nutrient recommendations",
                "eligibility": "All farmers",
                "how_to_apply": "District agriculture office"
            },
            "organic_farming": {
                "name": "Paramparagat Krishi Vikas Yojana",
                "benefit": "₹50,000 per hectare for organic farming",
                "eligibility": "Farmers willing to do organic farming",
                "how_to_apply": "Through farmer producer organizations"
            },
            "irrigation": {
                "name": "Per Drop More Crop",
                "benefit": "Subsidy on drip irrigation systems",
                "eligibility": "All categories of farmers",
                "how_to_apply": "District horticulture department"
            }
        }
        
        result = f"🏛️ **Government Schemes for {farmer_type.title()} Farmers**\n\n"
        result += f"**Location:** {location}\n"
        result += f"**Category:** {crop_category.title()} farming\n\n"
        
        result += f"**💰 Direct Benefit Schemes:**\n\n"
        
        # PM-KISAN
        scheme = schemes["pradhan_mantri_kisan"]
        result += f"**1. {scheme['name']}**\n"
        result += f"   • Benefit: {scheme['benefit']}\n"
        result += f"   • Eligibility: {scheme['eligibility']}\n"
        result += f"   • Apply: {scheme['how_to_apply']}\n\n"
        
        # Crop Insurance
        scheme = schemes["crop_insurance"]
        result += f"**2. {scheme['name']}**\n"
        result += f"   • Benefit: {scheme['benefit']}\n"
        result += f"   • Premium: 2% for kharif, 1.5% for rabi crops\n"
        result += f"   • Apply: {scheme['how_to_apply']}\n\n"
        
        result += f"**💳 Credit & Financial Support:**\n\n"
        
        # KCC
        scheme = schemes["kisan_credit_card"]
        result += f"**3. {scheme['name']}**\n"
        result += f"   • Benefit: {scheme['benefit']}\n"
        result += f"   • Eligibility: {scheme['eligibility']}\n"
        result += f"   • Apply: {scheme['how_to_apply']}\n\n"
        
        result += f"**🌱 Input & Technology Support:**\n\n"
        
        # Soil Health
        scheme = schemes["soil_health_card"]
        result += f"**4. {scheme['name']}**\n"
        result += f"   • Benefit: {scheme['benefit']}\n"
        result += f"   • Frequency: Every 3 years\n"
        result += f"   • Apply: {scheme['how_to_apply']}\n\n"
        
        # Organic Farming
        scheme = schemes["organic_farming"]
        result += f"**5. {scheme['name']}**\n"
        result += f"   • Benefit: {scheme['benefit']}\n"
        result += f"   • Duration: 3 years support\n"
        result += f"   • Apply: {scheme['how_to_apply']}\n\n"
        
        # Irrigation
        scheme = schemes["irrigation"]
        result += f"**6. {scheme['name']}**\n"
        result += f"   • Benefit: {scheme['benefit']}\n"
        result += f"   • Subsidy: Up to 55% for small farmers\n"
        result += f"   • Apply: {scheme['how_to_apply']}\n\n"
        
        # Additional schemes based on farmer type
        if farmer_type.lower() in ["small", "marginal"]:
            result += f"**🎯 Special Schemes for {farmer_type.title()} Farmers:**\n"
            result += f"• Formation of Farmer Producer Organizations (FPOs)\n"
            result += f"• Custom Hiring Centers for farm machinery\n"
            result += f"• Cluster-based development programs\n"
            result += f"• Higher subsidy rates on inputs\n\n"
        
        result += f"**📞 How to Get More Information:**\n"
        result += f"• Visit nearest Krishi Vigyan Kendra (KVK)\n"
        result += f"• Call Kisan Call Center: 1800-180-1551\n"
        result += f"• Visit District Collector office\n"
        result += f"• Check state agriculture department website\n"
        result += f"• Contact local agriculture extension officer\n\n"
        
        result += f"**📋 Documents Usually Required:**\n"
        result += f"• Aadhaar Card\n"
        result += f"• Bank Account details\n"
        result += f"• Land ownership documents\n"
        result += f"• Recent passport-size photographs\n"
        result += f"• Caste certificate (if applicable)\n"
        
        return result
        
    except Exception as e:
        logging.error(f"Error getting government schemes: {e}")
        return "Sorry, I couldn't retrieve government schemes information. Please try again."

@function_tool()
async def get_harvest_planning(
    context: RunContext,  # type: ignore
    crop: str,
    planted_date: str,
    area_acres: float = 1.0) -> str:
    """
    Provide comprehensive harvest planning including timing, methods, and post-harvest handling.
    planted_date format: YYYY-MM-DD
    """
    try:
        from datetime import datetime, timedelta
        
        # Crop maturity periods (days)
        maturity_periods = {
            "wheat": 120,
            "rice": 140,
            "corn": 90,
            "tomato": 75,
            "potato": 90,
            "onion": 120,
            "cotton": 180,
            "sugarcane": 365,
            "soybean": 100,
            "mustard": 90
        }
        
        try:
            plant_date = datetime.strptime(planted_date, "%Y-%m-%d")
        except ValueError:
            plant_date = datetime.now() - timedelta(days=30)  # Default assumption
        
        maturity_days = maturity_periods.get(crop.lower(), 100)
        harvest_date = plant_date + timedelta(days=maturity_days)
        days_remaining = (harvest_date - datetime.now()).days
        
        result = f"🌾 **Harvest Planning for {crop.title()}**\n\n"
        result += f"**Crop Details:**\n"
        result += f"• Crop: {crop.title()}\n"
        result += f"• Planted: {plant_date.strftime('%d %B %Y')}\n"
        result += f"• Area: {area_acres} acres\n"
        result += f"• Maturity Period: {maturity_days} days\n\n"
        
        result += f"**Harvest Timeline:**\n"
        result += f"• Expected Harvest: {harvest_date.strftime('%d %B %Y')}\n"
        if days_remaining > 0:
            result += f"• Days Remaining: {days_remaining} days\n"
            result += f"• Status: 🟡 Growing phase\n\n"
        elif days_remaining < -7:
            result += f"• Status: 🔴 Overdue by {abs(days_remaining)} days\n\n"
        else:
            result += f"• Status: 🟢 Ready for harvest!\n\n"
        
        # Pre-harvest activities
        if days_remaining > 7:
            result += f"**🔄 Pre-Harvest Activities (Next 7-14 days):**\n"
            result += f"• Monitor crop maturity indicators\n"
            result += f"• Stop irrigation 7-10 days before harvest\n"
            result += f"• Arrange harvesting labor/equipment\n"
            result += f"• Prepare storage facilities\n"
            result += f"• Check market prices and book buyers\n\n"
        
        # Harvest indicators
        result += f"**🔍 Harvest Readiness Indicators:**\n"
        if crop.lower() == "wheat":
            result += f"• Golden yellow color of grains\n"
            result += f"• Hard grain texture when pressed\n"
            result += f"• Moisture content: 12-14%\n"
        elif crop.lower() == "rice":
            result += f"• 80% of grains turned golden\n"
            result += f"• Grains feel hard when bitten\n"
            result += f"• Moisture content: 20-22%\n"
        elif crop.lower() == "tomato":
            result += f"• Fruits show full color development\n"
            result += f"• Firm but slightly soft texture\n"
            result += f"• Easy separation from vine\n"
        else:
            result += f"• Crop-specific maturity signs\n"
            result += f"• Proper color and texture development\n"
            result += f"• Moisture content within optimal range\n"
        
        result += f"\n**⚡ Harvest Methods:**\n"
        if crop.lower() in ["wheat", "rice"]:
            result += f"• Manual harvesting with sickle/scythe\n"
            result += f"• Mechanical harvesting with combine harvester\n"
            result += f"• Cut during early morning (6-10 AM)\n"
        elif crop.lower() in ["tomato", "potato"]:
            result += f"• Hand picking for quality preservation\n"
            result += f"• Use proper containers to avoid damage\n"
            result += f"• Harvest during cool hours\n"
        else:
            result += f"• Follow crop-specific best practices\n"
            result += f"• Use appropriate tools and methods\n"
            result += f"• Ensure minimal crop damage\n"
        
        # Expected yield and economics
        yield_per_acre = {
            "wheat": 2000, "rice": 2500, "corn": 3000, "tomato": 15000,
            "potato": 8000, "onion": 12000, "cotton": 400, "sugarcane": 35000
        }
        
        expected_yield = yield_per_acre.get(crop.lower(), 2000) * area_acres
        
        result += f"\n**📊 Expected Production:**\n"
        result += f"• Estimated Yield: {expected_yield:,.0f} kg\n"
        result += f"• Per Acre Yield: {yield_per_acre.get(crop.lower(), 2000):,.0f} kg/acre\n\n"
        
        result += f"**📦 Post-Harvest Handling:**\n"
        result += f"• Clean and sort produce immediately\n"
        result += f"• Dry to appropriate moisture level\n"
        result += f"• Store in clean, pest-free facilities\n"
        result += f"• Maintain proper temperature and humidity\n"
        result += f"• Regular monitoring for spoilage\n\n"
        
        result += f"**💰 Marketing Strategy:**\n"
        result += f"• Research current market prices\n"
        result += f"• Consider multiple selling options\n"
        result += f"• Time the market for better prices\n"
        result += f"• Maintain quality standards\n"
        result += f"• Keep proper documentation\n\n"
        
        result += f"**⚠️ Important Reminders:**\n"
        result += f"• Weather forecast check before harvest\n"
        result += f"• Ensure labor availability\n"
        result += f"• Transportation arrangements\n"
        result += f"• Storage facility preparation\n"
        
        return result
        
    except Exception as e:
        logging.error(f"Error in harvest planning: {e}")
        return "Sorry, I couldn't generate the harvest plan. Please check your input dates."

@function_tool()
async def get_equipment_recommendations(
    context: RunContext,  # type: ignore
    farm_size_acres: float,
    farming_type: str = "mixed",
    budget_range: str = "medium") -> str:
    """
    Recommend farming equipment based on farm size, type, and budget.
    Budget ranges: low, medium, high
    Farming types: cereals, vegetables, mixed, organic, commercial
    """
    try:
        # Equipment categories by farm size
        equipment_by_size = {
            "small": {  # 1-5 acres
                "essential": ["hand tools", "sprayer", "weeder", "small tiller"],
                "recommended": ["power weeder", "mini tractor", "pump set"],
                "advanced": ["small combine", "seed drill", "rotavator"]
            },
            "medium": {  # 5-20 acres
                "essential": ["tractor 25-35 HP", "cultivator", "harrow", "sprayer"],
                "recommended": ["seed drill", "thresher", "pump set", "trailer"],
                "advanced": ["combine harvester", "rotavator", "disc harrow"]
            },
            "large": {  # 20+ acres
                "essential": ["tractor 45+ HP", "combine harvester", "multiple implements"],
                "recommended": ["laser land leveler", "boom sprayer", "multiple tractors"],
                "advanced": ["GPS-guided equipment", "drone sprayer", "automated systems"]
            }
        }
        
        # Determine farm size category
        if farm_size_acres <= 5:
            size_category = "small"
        elif farm_size_acres <= 20:
            size_category = "medium"
        else:
            size_category = "large"
        
        # Budget-wise equipment costs (in INR lakhs)
        equipment_costs = {
            "hand tools": 0.05,
            "sprayer": 0.15,
            "weeder": 0.08,
            "small tiller": 0.8,
            "power weeder": 0.6,
            "mini tractor": 4.5,
            "pump set": 0.3,
            "tractor 25-35 HP": 6.5,
            "tractor 45+ HP": 12.0,
            "cultivator": 0.8,
            "harrow": 1.2,
            "seed drill": 1.5,
            "thresher": 2.5,
            "combine harvester": 25.0,
            "rotavator": 1.8,
            "trailer": 1.0
        }
        
        result = f"🚜 **Equipment Recommendations for Your Farm**\n\n"
        result += f"**Farm Profile:**\n"
        result += f"• Size: {farm_size_acres} acres ({size_category} farm)\n"
        result += f"• Type: {farming_type.title()} farming\n"
        result += f"• Budget Range: {budget_range.title()}\n\n"
        
        equipment_list = equipment_by_size[size_category]
        
        if budget_range.lower() == "low":
            focus_equipment = equipment_list["essential"]
            result += f"**💰 Essential Equipment (Budget-Friendly)**\n"
        elif budget_range.lower() == "medium":
            focus_equipment = equipment_list["essential"] + equipment_list["recommended"][:2]
            result += f"**⚡ Recommended Equipment Setup**\n"
        else:  # high budget
            focus_equipment = equipment_list["essential"] + equipment_list["recommended"] + equipment_list["advanced"][:2]
            result += f"**🏆 Complete Equipment Setup**\n"
        
        total_cost = 0
        for i, equipment in enumerate(focus_equipment, 1):
            cost = equipment_costs.get(equipment, 1.0)
            total_cost += cost
            
            result += f"\n**{i}. {equipment.title()}**\n"
            result += f"   • Cost: ₹{cost:.1f} lakh\n"
            
            # Add equipment benefits
            if "tractor" in equipment:
                result += f"   • Benefits: Primary power source, multiple attachments\n"
            elif "sprayer" in equipment:
                result += f"   • Benefits: Pest control, fertilizer application\n"
            elif "harvester" in equipment:
                result += f"   • Benefits: Fast harvesting, labor cost reduction\n"
            elif "drill" in equipment:
                result += f"   • Benefits: Precise seeding, seed cost savings\n"
            else:
                result += f"   • Benefits: Improved efficiency, time savings\n"
        
        result += f"\n**💰 Total Investment: ₹{total_cost:.1f} lakhs**\n\n"
        
        # Financing options
        result += f"**💳 Financing Options:**\n"
        result += f"• Bank loans with 85% financing available\n"
        result += f"• Government subsidies up to 50% for small farmers\n"
        result += f"• Custom Hiring Centers for expensive equipment\n"
        result += f"• Cooperative society equipment sharing\n"
        result += f"• Lease/rental options for seasonal use\n\n"
        
        # Maintenance tips
        result += f"**🔧 Maintenance Guidelines:**\n"
        result += f"• Regular servicing as per manufacturer guidelines\n"
        result += f"• Proper storage in covered areas\n"
        result += f"• Genuine spare parts usage\n"
        result += f"• Operator training for efficient use\n"
        result += f"• Daily cleaning after use\n\n"
        
        # Custom hiring recommendations
        result += f"**🤝 Custom Hiring Suggestions:**\n"
        result += f"Instead of buying, consider hiring these for occasional use:\n"
        
        expensive_equipment = [item for item in equipment_list["advanced"] if equipment_costs.get(item, 0) > 5]
        for equipment in expensive_equipment[:3]:
            cost = equipment_costs.get(equipment, 0)
            result += f"• {equipment.title()} (₹{cost:.1f} lakh) - Hire at ₹{cost*1000/10:.0f}/day\n"
        
        result += f"\n**📱 Modern Technology Options:**\n"
        if size_category in ["medium", "large"]:
            result += f"• GPS-guided tractors for precision farming\n"
            result += f"• Drone technology for spraying and monitoring\n"
            result += f"• IoT sensors for equipment monitoring\n"
            result += f"• Mobile apps for equipment booking\n"
        else:
            result += f"• Small drones for crop monitoring\n"
            result += f"• Mobile apps for equipment rental\n"
            result += f"• Digital tools for maintenance tracking\n"
        
        return result
        
    except Exception as e:
        logging.error(f"Error getting equipment recommendations: {e}")
        return "Sorry, I couldn't generate equipment recommendations. Please try again."

@function_tool()
async def get_organic_farming_guide(
    context: RunContext,  # type: ignore
    crop_type: str,
    conversion_stage: str = "beginning",
    farm_size_acres: float = 1.0) -> str:
    """
    Provide comprehensive organic farming guidance including conversion process and practices.
    Conversion stages: beginning, transition, certified
    """
    try:
        result = f"🌱 **Organic Farming Guide for {crop_type.title()}**\n\n"
        result += f"**Farm Profile:**\n"
        result += f"• Crop: {crop_type.title()}\n"
        result += f"• Conversion Stage: {conversion_stage.title()}\n"
        result += f"• Farm Size: {farm_size_acres} acres\n\n"
        
        # Conversion timeline
        result += f"**🗓️ Organic Conversion Timeline:**\n"
        if conversion_stage.lower() == "beginning":
            result += f"• **Current Stage: Beginning (Year 0-1)**\n"
            result += f"  └ Stop all synthetic chemicals\n"
            result += f"  └ Start soil building activities\n"
            result += f"  └ Begin documentation\n"
            result += f"• **Next: Transition (Year 1-3)**\n"
            result += f"  └ Continue organic practices\n"
            result += f"  └ Soil improvement focus\n"
            result += f"• **Final: Certified Organic (Year 3+)**\n"
            result += f"  └ Full organic certification\n"
            result += f"  └ Premium market access\n\n"
        elif conversion_stage.lower() == "transition":
            result += f"• **Current Stage: Transition (Year 1-3)**\n"
            result += f"  └ You're on the right path!\n"
            result += f"  └ Continue building soil health\n"
            result += f"  └ Maintain detailed records\n"
            result += f"• **Progress to: Certified (Year 3)**\n"
            result += f"  └ Apply for organic certification\n"
            result += f"  └ Access premium markets\n\n"
        else:  # certified
            result += f"• **Current Stage: Certified Organic**\n"
            result += f"  🎉 Congratulations! You're fully organic\n"
            result += f"  └ Maintain certification standards\n"
            result += f"  └ Focus on premium market access\n\n"
        
        # Soil management
        result += f"**🌍 Organic Soil Management:**\n"
        result += f"• **Composting Program:**\n"
        result += f"  └ Prepare compost with farm waste\n"
        result += f"  └ Add 2-3 tons per acre annually\n"
        result += f"  └ Maintain C:N ratio of 30:1\n"
        result += f"• **Green Manuring:**\n"
        result += f"  └ Grow legume cover crops\n"
        result += f"  └ Incorporate before flowering\n"
        result += f"  └ Add 15-20 kg nitrogen equivalent\n"
        result += f"• **Bio-fertilizers:**\n"
        result += f"  └ Rhizobium for legumes\n"
        result += f"  └ Azotobacter for cereals\n"
        result += f"  └ Mycorrhizae for root health\n\n"
        
        # Pest management
        result += f"**🐛 Organic Pest Management:**\n"
        result += f"• **Preventive Measures:**\n"
        result += f"  └ Crop rotation every season\n"
        result += f"  └ Maintain biodiversity\n"
        result += f"  └ Healthy soil = healthy plants\n"
        result += f"• **Natural Controls:**\n"
        result += f"  └ Neem-based products\n"
        result += f"  └ Beneficial insects release\n"
        result += f"  └ Pheromone traps\n"
        result += f"• **Bio-pesticides:**\n"
        result += f"  └ Bacillus thuringiensis (Bt)\n"
        result += f"  └ Trichoderma for soil health\n"
        result += f"  └ Beauveria bassiana for insects\n\n"
        
        # Organic inputs
        result += f"**🧪 Organic Inputs & Recipes:**\n"
        result += f"• **Liquid Fertilizer (Jeevamrit):**\n"
        result += f"  └ 10 kg cow dung + 10 L cow urine\n"
        result += f"  └ 2 kg jaggery + 2 kg gram flour\n"
        result += f"  └ Handful soil, ferment 7 days\n"
        result += f"• **Pest Deterrent Spray:**\n"
        result += f"  └ 1 kg neem leaves + 10 L water\n"
        result += f"  └ Boil, strain, add soap solution\n"
        result += f"  └ Spray early morning/evening\n"
        result += f"• **Fungal Control (Buttermilk Spray):**\n"
        result += f"  └ 1 L buttermilk + 10 L water\n"
        result += f"  └ Add turmeric and asafoetida\n"
        result += f"  └ Spray on affected areas\n\n"
        
        # Economics
        cost_reduction = farm_size_acres * 8000  # Estimated savings per acre
        premium_income = farm_size_acres * 12000  # Premium pricing benefit
        
        result += f"**💰 Economic Benefits:**\n"
        result += f"• **Cost Savings:**\n"
        result += f"  └ Reduced input costs: ₹{cost_reduction:,.0f}/year\n"
        result += f"  └ No synthetic fertilizers/pesticides\n"
        result += f"  └ Lower long-term production costs\n"
        result += f"• **Premium Income:**\n"
        result += f"  └ 20-30% higher selling price\n"
        result += f"  └ Potential additional income: ₹{premium_income:,.0f}/year\n"
        result += f"  └ Access to export markets\n\n"
        
        # Certification process
        if conversion_stage.lower() != "certified":
            result += f"**📋 Certification Process:**\n"
            result += f"• **Documentation Required:**\n"
            result += f"  └ Detailed input usage records\n"
            result += f"  └ Crop rotation plans\n"
            result += f"  └ Pest management logs\n"
            result += f"• **Inspection Process:**\n"
            result += f"  └ Annual third-party inspection\n"
            result += f"  └ Soil and produce testing\n"
            result += f"  └ Certification fees: ₹15,000-25,000\n"
            result += f"• **Certifying Agencies:**\n"
            result += f"  └ IndoCert, LACON, SGS India\n"
            result += f"  └ Choose NPOP/NOP certified agency\n\n"
        
        # Marketing
        result += f"**🎯 Marketing Organic Produce:**\n"
        result += f"• **Direct Marketing:**\n"
        result += f"  └ Farmers markets and fairs\n"
        result += f"  └ Direct to consumer sales\n"
        result += f"  └ Community Supported Agriculture (CSA)\n"
        result += f"• **Retail Channels:**\n"
        result += f"  └ Organic stores and supermarkets\n"
        result += f"  └ Online platforms (BigBasket, Amazon)\n"
        result += f"  └ Restaurant and hotel supply\n"
        result += f"• **Export Opportunities:**\n"
        result += f"  └ EU and US organic markets\n"
        result += f"  └ Higher export prices\n"
        result += f"  └ Government export incentives\n\n"
        
        result += f"**📚 Resources & Support:**\n"
        result += f"• National Centre for Organic Farming (NCOF)\n"
        result += f"• State organic farming missions\n"
        result += f"• Organic farmers associations\n"
        result += f"• KVK organic farming programs\n"
        result += f"• Online courses and certifications\n"
        
        return result
        
    except Exception as e:
        logging.error(f"Error generating organic farming guide: {e}")
        return "Sorry, I couldn't generate the organic farming guide. Please try again."


@function_tool()
async def navigate_to_page(
    context: RunContext,
    page: str) -> str:
    """
    Navigate to a specific page or tab in the application. 
    Use this when the user wants to go to tasks, community, my farm, market prices, crop recommendations, or voice AI.
    
    Args:
        page: The page to navigate to. Options: "tasks", "community", "my farm", "market prices", "crop recommendations", "voice ai", "home"
    """
    try:
        # Normalize the page name
        page_normalized = page.lower().strip()
        
        # Map common variations to standard URLs
        navigation_map = {
            'tasks': '/tasks',
            'task': '/tasks', 
            'todo': '/tasks',
            'community': '/community/feed',
            'communities': '/community/feed',
            'feed': '/community/feed',
            'social': '/community/feed',
            'my farm': '/my-farm',
            'farm': '/my-farm',
            'my-farm': '/my-farm',
            'myfarm': '/my-farm',
            'market prices': '/market-prices',
            'market': '/market-prices', 
            'prices': '/market-prices',
            'market-prices': '/market-prices',
            'crop recommendations': '/crop-recommendations',
            'crops': '/crop-recommendations',
            'recommendations': '/crop-recommendations',
            'voice ai': '/voice-ai',
            'voice': '/voice-ai',
            'ai': '/voice-ai',
            'home': '/',
            'homepage': '/',
            'main': '/'
        }
        
        # Get the URL for the requested page
        target_url = navigation_map.get(page_normalized)
        
        if not target_url:
            return f"Sorry, I don't know how to navigate to '{page}'. Available pages are: tasks, community, my farm, market prices, crop recommendations, voice ai, and home."
        
        # Send navigation command via data channel
        if hasattr(context, 'room') and context.room:
            try:
                # Send navigation data to all participants
                await context.room.local_participant.publish_data(
                    json.dumps({
                        'type': 'navigate',
                        'url': target_url,
                        'timestamp': datetime.now().isoformat()
                    }).encode(),
                    reliable=True
                )
                
                logging.info(f"Navigation command sent: {target_url}")
                
                # Map URLs back to friendly names for response
                page_names = {
                    '/tasks': 'Tasks',
                    '/community/feed': 'Community Feed', 
                    '/my-farm': 'My Farm',
                    '/market-prices': 'Market Prices',
                    '/crop-recommendations': 'Crop Recommendations',
                    '/voice-ai': 'Voice AI',
                    '/': 'Home'
                }
                
                page_name = page_names.get(target_url, target_url)
                return f"Navigating to {page_name} now!"
                
            except Exception as e:
                logging.error(f"Error sending navigation data: {e}")
                return f"Sorry, there was an error navigating to {page}. Please try again."
        else:
            logging.warning("No room context available for navigation")
            return f"Sorry, I can't navigate right now. Please try again."
            
    except Exception as e:
        logging.error(f"Error in navigate_to_page: {e}")
        return f"Sorry, there was an error processing your navigation request. Please try again."


# RAG System Integration Tools

@function_tool()
async def query_comprehensive_knowledge(
    context: RunContext,
    query: str,
    include_web_search: bool = True
) -> str:
    """
    Search the comprehensive knowledge base including all website data, farming knowledge, 
    and optionally perform web search for agricultural information.
    
    Args:
        query: The question or topic to search for
        include_web_search: Whether to include web search if knowledge base results are insufficient
    
    Returns:
        Comprehensive answer combining knowledge base results and recommendations
    """
    try:
        from rag_system import get_rag_system
        
        rag_system = await get_rag_system()
        result = await rag_system.query_comprehensive(query, include_web_search)
        
        if "error" in result:
            return f"Sorry, I encountered an error searching for information: {result['error']}"
        
        # Format the response
        response = f"Based on my knowledge about '{query}':\n\n"
        
        # Add knowledge base results
        if result.get("knowledge_base_results"):
            response += "📚 From my farming knowledge:\n"
            for i, kb_result in enumerate(result["knowledge_base_results"][:3], 1):
                response += f"{i}. {kb_result['metadata'].get('summary', 'Agricultural information')}\n"
                response += f"   Source: {kb_result['source']} | Category: {kb_result['category']}\n\n"
        
        # Add web search results if available
        if result.get("web_search_results"):
            response += "🌐 Additional information from web search:\n"
            for i, web_result in enumerate(result["web_search_results"][:2], 1):
                response += f"{i}. {web_result['title']}\n"
                response += f"   {web_result['description'][:200]}...\n\n"
        
        # Add market data if relevant
        if result.get("market_data"):
            response += "💰 Current market information:\n"
            for item in result["market_data"][:3]:
                response += f"- {item.get('commodity', 'Unknown')}: ₹{item.get('currentPrice', 0)} per {item.get('unit', 'unit')}\n"
            response += "\n"
        
        # Add recommendations
        if result.get("recommendations"):
            response += "💡 My recommendations:\n"
            for i, rec in enumerate(result["recommendations"], 1):
                response += f"{i}. {rec}\n"
        
        return response
        
    except Exception as e:
        logging.error(f"Error in query_comprehensive_knowledge: {e}")
        return f"Sorry, I encountered an error while searching for information about '{query}'. Please try again."

@function_tool()
async def get_live_market_data_rag(
    context: RunContext,
    commodity: Optional[str] = None
) -> str:
    """
    Get live market data using the RAG system's web scraper and update the knowledge base.
    
    Args:
        commodity: Specific commodity to look for (optional)
    
    Returns:
        Fresh market data with sources and scraping information
    """
    try:
        from rag_system import get_rag_system
        
        rag_system = await get_rag_system()
        result = await rag_system.update_market_data_live()
        
        if result.get("success"):
            response = f"🔄 Successfully scraped fresh market data!\n\n"
            response += f"📊 Total records: {result.get('total_records', 0)}\n"
            response += f"🌐 Sources: {', '.join(result.get('sources', []))}\n"
            response += f"⏱️ Scraping time: {result.get('scraping_time', 0):.2f} seconds\n\n"
            
            # If specific commodity requested, search for it
            if commodity:
                search_result = await rag_system.query_comprehensive(f"market price {commodity}")
                if search_result.get("market_data"):
                    response += f"📈 {commodity.title()} prices:\n"
                    for item in search_result["market_data"]:
                        if commodity.lower() in item.get("commodity", "").lower():
                            response += f"- {item.get('market', 'Unknown Market')}: ₹{item.get('currentPrice', 0)} per {item.get('unit', 'unit')}\n"
            else:
                response += "Use the market prices page or ask me about specific commodities for detailed pricing!"
            
            return response
        else:
            return f"Sorry, I couldn't scrape fresh market data right now. Error: {result.get('error', 'Unknown error')}"
            
    except Exception as e:
        logging.error(f"Error in get_live_market_data_rag: {e}")
        return "Sorry, I encountered an error while fetching live market data. Please try again."

@function_tool()
async def search_agricultural_web(
    context: RunContext,
    query: str,
    max_results: int = 5
) -> str:
    """
    Search the web specifically for agricultural and farming information.
    
    Args:
        query: What to search for
        max_results: Maximum number of results to return (default 5)
    
    Returns:
        Relevant web search results focused on agriculture
    """
    try:
        from rag_system import get_rag_system
        
        rag_system = await get_rag_system()
        result = await rag_system.web_scraper.search_agricultural_web(query, max_results)
        
        if result.get("success"):
            response = f"🔍 Web search results for '{query}':\n\n"
            
            for i, item in enumerate(result["results"][:max_results], 1):
                response += f"{i}. **{item['title']}**\n"
                response += f"   {item['description'][:200]}...\n"
                response += f"   Relevance: {item['relevance_score']:.1%}\n"
                response += f"   URL: {item['url']}\n\n"
                
            return response
        else:
            return f"Sorry, I couldn't find web results for '{query}'. Error: {result.get('error', 'Unknown error')}"
            
    except Exception as e:
        logging.error(f"Error in search_agricultural_web: {e}")
        return f"Sorry, I encountered an error while searching the web for '{query}'. Please try again."

@function_tool()
async def get_website_data_access(
    context: RunContext,
    section: str
) -> str:
    """
    Get data from specific sections of the farming website.
    
    Args:
        section: Which section to access (market_prices, tasks, crops, community, farm, schemes)
    
    Returns:
        Data from the requested website section
    """
    try:
        from rag_system import get_rag_system
        
        rag_system = await get_rag_system()
        
        # Map section names to methods
        section_methods = {
            "market_prices": rag_system.website_data.get_market_prices_data,
            "tasks": rag_system.website_data.get_tasks_data,
            "crops": rag_system.website_data.get_crop_recommendations_data,
            "community": rag_system.website_data.get_community_data,
            "farm": rag_system.website_data.get_farm_data,
            "schemes": rag_system.website_data.get_government_schemes_data
        }
        
        if section.lower() not in section_methods:
            return f"Sorry, '{section}' is not a valid section. Available sections: {', '.join(section_methods.keys())}"
        
        result = await section_methods[section.lower()]()
        
        if result.get("success"):
            data = result["data"]
            response = f"📋 Data from {section.title()} section:\n\n"
            
            # Format based on section type
            if section.lower() == "market_prices":
                if "data" in data and data["data"]:
                    for item in data["data"][:5]:
                        response += f"• {item.get('commodity', 'Unknown')}: ₹{item.get('currentPrice', 0)} per {item.get('unit', 'unit')}\n"
                        response += f"  Market: {item.get('market', 'Unknown')} | State: {item.get('state', 'Unknown')}\n\n"
            
            elif section.lower() == "tasks":
                if "active_tasks" in data:
                    response += "Active Tasks:\n"
                    for task in data["active_tasks"]:
                        response += f"• {task.get('title', 'Unknown Task')} - {task.get('priority', 'normal')} priority\n"
                        response += f"  Due: {task.get('due', 'No deadline')}\n\n"
            
            elif section.lower() == "crops":
                if "recommended_crops" in data:
                    response += "Recommended Crops:\n"
                    for crop in data["recommended_crops"]:
                        response += f"• {crop.get('name', 'Unknown')}: {crop.get('suitability', 0)}% suitable\n"
                        response += f"  Expected yield: {crop.get('expected_yield', 'Unknown')}\n\n"
            
            elif section.lower() == "community":
                if "recent_posts" in data:
                    response += "Recent Community Posts:\n"
                    for post in data["recent_posts"][:3]:
                        response += f"• {post.get('user', 'Unknown')}: {post.get('content', '')[:100]}...\n"
                        response += f"  {post.get('likes', 0)} likes, {post.get('comments', 0)} comments\n\n"
            
            elif section.lower() == "schemes":
                if "available_schemes" in data:
                    response += "Available Government Schemes:\n"
                    for scheme in data["available_schemes"][:3]:
                        response += f"• {scheme.get('name', 'Unknown')}: {scheme.get('benefit', 'Unknown benefit')}\n"
                        response += f"  {scheme.get('description', 'No description')}\n\n"
            
            else:
                response += str(data)[:500] + ("..." if len(str(data)) > 500 else "")
            
            return response
        else:
            return f"Sorry, I couldn't access the {section} section right now. Error: {result.get('error', 'Unknown error')}"
            
    except Exception as e:
        logging.error(f"Error in get_website_data_access: {e}")
        return f"Sorry, I encountered an error while accessing the {section} section. Please try again."

@function_tool()
async def add_farming_knowledge(
    context: RunContext,
    content: str,
    category: str,
    source: str = "user_input"
) -> str:
    """
    Add new farming knowledge to the knowledge base.
    
    Args:
        content: The farming knowledge content to add
        category: Category of knowledge (techniques, market_data, crop_info, etc.)
        source: Source of the knowledge (default: user_input)
    
    Returns:
        Confirmation of knowledge addition
    """
    try:
        from rag_system import get_rag_system, RAGDocument
        from datetime import datetime
        import hashlib
        
        rag_system = await get_rag_system()
        
        # Create document ID from content hash
        doc_id = hashlib.md5(content.encode()).hexdigest()[:10]
        
        doc = RAGDocument(
            id=f"user_{doc_id}",
            content=content,
            metadata={"added_by": "user", "type": "custom_knowledge"},
            timestamp=datetime.now(),
            source=source,
            category=category
        )
        
        success = await rag_system.knowledge_base.add_document(doc)
        
        if success:
            return f"✅ Successfully added farming knowledge to the {category} category! I can now use this information to help answer questions."
        else:
            return "❌ Sorry, I couldn't add that knowledge to my database right now. Please try again."
            
    except Exception as e:
        logging.error(f"Error in add_farming_knowledge: {e}")
        return "Sorry, I encountered an error while adding that knowledge. Please try again."


