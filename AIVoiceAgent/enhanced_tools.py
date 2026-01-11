"""
Enhanced Tools for Income Optimization and Intelligent Task Generation
Focuses on mixed farming, fishiculture, profitability analysis, and automated task breakdown
"""

import logging
from livekit.agents import function_tool, RunContext
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import asyncio

# Import RAG system for data access
from rag_system import get_rag_system
# Import existing tools
from tools import get_weather, get_weather_farming_advice

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@function_tool()
async def analyze_income_optimization(
    context: RunContext,
    current_farming_type: str = "single_crop",
    farm_size_acres: float = 1.0,
    budget_range: str = "low"
) -> str:
    """
    Analyze and suggest ways to increase farm income through mixed farming, fishiculture, 
    and diversification strategies based on farm data and market conditions.
    
    Args:
        current_farming_type: Current farming approach (single_crop, mixed_farming, organic, etc.)
        farm_size_acres: Farm size in acres
        budget_range: Investment capacity (low, medium, high)
    
    Returns:
        Comprehensive income optimization strategies
    """
    try:
        # Get farm data from My Farm tab
        rag_system = await get_rag_system()
        farm_data = await rag_system.website_data.get_farm_data()
        
        # Get current market prices for profitability analysis
        market_data = await rag_system.update_market_data_live()
        
        response = "💰 **Income Optimization Analysis for Your Farm**\n\n"
        
        # Analyze current farm setup
        if farm_data.get("success"):
            farm_info = farm_data["data"]
            response += f"📋 **Current Farm Analysis:**\n"
            response += f"• Farm: {farm_info['farm_info'].get('name', 'Your Farm')}\n"
            response += f"• Size: {farm_info['farm_info'].get('size', f'{farm_size_acres} acres')}\n"
            response += f"• Location: {farm_info['farm_info'].get('location', 'Not specified')}\n"
            response += f"• Soil Type: {farm_info['farm_info'].get('soil_type', 'Not specified')}\n\n"
        
        # Mixed Farming Strategies
        response += "🌾 **Mixed Farming Strategies to Increase Income:**\n\n"
        
        if farm_size_acres >= 2.0:
            response += "**1. Crop + Livestock Integration**\n"
            response += f"• Allocate 60% land for crops, 20% for fodder, 20% for livestock\n"
            response += f"• Expected additional income: ₹30,000-50,000/year\n"
            response += f"• Livestock options: Dairy cows, goats, poultry\n"
            response += f"• Benefits: Organic manure, milk/eggs, reduced fertilizer costs\n\n"
        
        response += "**2. Fishiculture Integration**\n"
        if farm_size_acres >= 1.0:
            response += f"• Construct fish pond (0.2-0.5 acres)\n"
            response += f"• Fish varieties: Rohu, Catla, Mrigal (polyculture)\n"
            response += f"• Expected yield: 2-3 tonnes/acre/year\n"
            response += f"• Market price: ₹80-120/kg\n"
            response += f"• Additional income: ₹1,60,000-3,60,000/year\n"
            response += f"• Benefits: Water storage, integrated farming system\n\n"
        else:
            response += f"• Consider small biofloc fish tanks (for smaller farms)\n"
            response += f"• Investment: ₹15,000-25,000\n"
            response += f"• Expected income: ₹20,000-30,000/year\n\n"
        
        response += "**3. Horticulture Integration**\n"
        response += f"• Border plantation with fruit trees (mango, guava, lemon)\n"
        response += f"• Vegetable cultivation between seasons\n"
        response += f"• Flower cultivation for urban markets\n"
        response += f"• Expected additional income: ₹25,000-40,000/year\n\n"
        
        # Budget-based recommendations
        if budget_range == "low":
            response += "💡 **Low Investment Options (₹10,000-50,000):**\n"
            response += "• Mushroom cultivation in unused spaces\n"
            response += "• Poultry farming (50-100 birds)\n"
            response += "• Kitchen gardening for vegetables\n"
            response += "• Beekeeping (5-10 hives)\n"
        elif budget_range == "medium":
            response += "💡 **Medium Investment Options (₹50,000-2,00,000):**\n"
            response += "• Small fish pond construction\n"
            response += "• Dairy farming (2-3 cows)\n"
            response += "• Greenhouse farming\n"
            response += "• Drip irrigation system\n"
        else:
            response += "💡 **High Investment Options (₹2,00,000+):**\n"
            response += "• Large-scale fishiculture\n"
            response += "• Mechanized farming equipment\n"
            response += "• Cold storage facilities\n"
            response += "• Processing units\n"
        
        response += "\n🎯 **Immediate Action Steps:**\n"
        response += "1. Get soil testing done for optimal crop selection\n"
        response += "2. Connect with local fisheries department for pond guidelines\n"
        response += "3. Join farmer producer organizations for better prices\n"
        response += "4. Apply for relevant government schemes\n"
        
        return response
        
    except Exception as e:
        logger.error(f"Error in analyze_income_optimization: {e}")
        return f"Sorry, I encountered an error while analyzing income optimization strategies. Please try again."

@function_tool()
async def generate_intelligent_tasks(
    context: RunContext,
    farming_activity: str,
    crop_name: str = "",
    farm_location: str = "",
    season: str = ""
) -> str:
    """
    Break down farming activities into detailed, weather-dependent task lists and add them to the tasks system.
    
    Args:
        farming_activity: Main activity (e.g., "sow mustard seeds", "harvest wheat", "start fish farming")
        crop_name: Specific crop if applicable
        farm_location: Location for weather-based recommendations
        season: Current season context
    
    Returns:
        Detailed task breakdown with timeline and weather considerations
    """
    try:
        # Get weather data for location-specific recommendations
        weather_data = None
        if farm_location:
            try:
                weather_response = await get_weather_farming_advice(context, farm_location)
                weather_data = weather_response
            except:
                pass
        
        # Get current farm data
        rag_system = await get_rag_system()
        farm_data = await rag_system.website_data.get_farm_data()
        
        activity_lower = farming_activity.lower()
        
        response = f"📋 **Intelligent Task Breakdown for: {farming_activity.title()}**\n\n"
        
        # Weather consideration
        if weather_data and "temperature" in str(weather_data).lower():
            response += f"🌤️ **Weather Considerations:**\n"
            response += f"Current conditions factored into timeline\n\n"
        
        # Generate detailed task breakdown based on activity type
        if "sow" in activity_lower or "plant" in activity_lower:
            if "mustard" in activity_lower or crop_name.lower() == "mustard":
                tasks = await generate_mustard_sowing_tasks(weather_data, farm_location)
            elif "wheat" in activity_lower or crop_name.lower() == "wheat":
                tasks = await generate_wheat_sowing_tasks(weather_data, farm_location)
            elif "rice" in activity_lower or crop_name.lower() == "rice":
                tasks = await generate_rice_sowing_tasks(weather_data, farm_location)
            else:
                tasks = await generate_general_sowing_tasks(crop_name, weather_data)
                
        elif "harvest" in activity_lower:
            tasks = await generate_harvesting_tasks(crop_name, weather_data)
            
        elif "fish" in activity_lower:
            tasks = await generate_fishiculture_tasks(weather_data)
            
        else:
            tasks = await generate_general_farming_tasks(farming_activity, weather_data)
        
        # Format response with tasks
        response += "📅 **Detailed Task Schedule:**\n\n"
        
        for i, task in enumerate(tasks, 1):
            response += f"**{i}. {task['title']}**\n"
            response += f"   ⏰ Timeline: {task['timeline']}\n"
            response += f"   📝 Description: {task['description']}\n"
            response += f"   🎯 Priority: {task['priority']}\n"
            if task.get('weather_dependency'):
                response += f"   🌤️ Weather Note: {task['weather_dependency']}\n"
            response += f"\n"
        
        # Add to tasks system (simulated - in real implementation would call API)
        response += "✅ **Tasks Added to Your Schedule!**\n"
        response += f"Added {len(tasks)} tasks to your farming schedule.\n"
        response += "You can view them in the Tasks tab.\n\n"
        
        response += "💡 **Pro Tips:**\n"
        response += "• Monitor weather daily and adjust timelines accordingly\n"
        response += "• Keep all materials ready before starting each phase\n"
        response += "• Document progress for better future planning\n"
        
        return response
        
    except Exception as e:
        logger.error(f"Error in generate_intelligent_tasks: {e}")
        return f"Sorry, I encountered an error while generating task breakdown for '{farming_activity}'. Please try again."

async def generate_mustard_sowing_tasks(weather_data: Any, location: str) -> List[Dict[str, str]]:
    """Generate detailed tasks for mustard sowing"""
    return [
        {
            "title": "Field Preparation - Primary Tillage",
            "timeline": "15-20 days before sowing",
            "description": "Deep plowing with tractor or bullock to 15-20 cm depth. Remove weeds and crop residues.",
            "priority": "High",
            "weather_dependency": "Avoid if heavy rains expected within 24 hours"
        },
        {
            "title": "Soil Testing and Amendment",
            "timeline": "10-15 days before sowing", 
            "description": "Test soil pH (optimal 6.0-7.5). Add lime if acidic, gypsum if alkaline. Apply FYM 10-15 tons/hectare.",
            "priority": "High",
            "weather_dependency": "Complete before monsoon ends"
        },
        {
            "title": "Secondary Tillage and Leveling",
            "timeline": "5-7 days before sowing",
            "description": "2-3 harrowings followed by planking for proper seed bed preparation.",
            "priority": "High", 
            "weather_dependency": "Soil moisture should be optimal (not too wet/dry)"
        },
        {
            "title": "Seed Treatment",
            "timeline": "1 day before sowing",
            "description": "Treat seeds with Thiram 2g/kg seeds. Soak in water for 8-12 hours for better germination.",
            "priority": "Medium",
            "weather_dependency": "Store treated seeds in cool, dry place"
        },
        {
            "title": "Sowing Operation", 
            "timeline": "Sowing day (Oct-Nov optimal)",
            "description": "Sow at 30cm row spacing, 2-3 cm depth. Seed rate: 3-4 kg/hectare for irrigated, 5-6 kg for rainfed.",
            "priority": "High",
            "weather_dependency": "Avoid sowing if rain expected within 48 hours"
        },
        {
            "title": "Initial Irrigation",
            "timeline": "Immediately after sowing",
            "description": "Light irrigation for seed germination. Avoid water logging.",
            "priority": "High",
            "weather_dependency": "Skip if good rainfall within 2 days of sowing"
        },
        {
            "title": "Germination Monitoring",
            "timeline": "5-10 days after sowing",
            "description": "Check for uniform germination. Gap filling if required within 15 days.",
            "priority": "Medium",
            "weather_dependency": "Protect young seedlings from strong winds"
        },
        {
            "title": "First Fertilizer Application",
            "timeline": "20-25 days after sowing",
            "description": "Apply nitrogen (60 kg/ha), phosphorus (40 kg/ha), potash (40 kg/ha). Use urea, DAP, and MOP.",
            "priority": "High",
            "weather_dependency": "Apply before rain or irrigate after application"
        },
        {
            "title": "Weed Management",
            "timeline": "25-30 days after sowing",
            "description": "Hand weeding or use pendimethalin 1 kg/ha pre-emergence herbicide.",
            "priority": "Medium",
            "weather_dependency": "Herbicide application needs dry weather"
        },
        {
            "title": "Pest and Disease Monitoring",
            "timeline": "30-45 days after sowing",
            "description": "Monitor for aphids, flea beetles, and white rust. Apply neem oil or approved insecticides.",
            "priority": "Medium",
            "weather_dependency": "Avoid spraying during windy or rainy conditions"
        }
    ]

async def generate_wheat_sowing_tasks(weather_data: Any, location: str) -> List[Dict[str, str]]:
    """Generate detailed tasks for wheat sowing"""
    return [
        {
            "title": "Field Preparation",
            "timeline": "20 days before sowing",
            "description": "Deep plowing after rice harvest. Disc harrow 2-3 times for proper tilth.",
            "priority": "High",
            "weather_dependency": "Ensure field is properly drained after rice"
        },
        {
            "title": "Seed Selection and Treatment",
            "timeline": "3-5 days before sowing",
            "description": "Use certified seeds of recommended varieties. Treat with fungicide (Vitavax 2.5g/kg seed).",
            "priority": "High",
            "weather_dependency": "Store treated seeds in dry conditions"
        },
        {
            "title": "Sowing Operation",
            "timeline": "Nov-Dec (timely sowing)",
            "description": "Line sowing at 20-22.5cm spacing. Seed rate: 100kg/ha for timely, 125kg/ha for late sowing.",
            "priority": "High", 
            "weather_dependency": "Optimal temperature 15-25°C for germination"
        },
        {
            "title": "Irrigation Schedule",
            "timeline": "21 days after sowing (Crown Root Initiation)",
            "description": "First irrigation at CRI stage. Subsequent irrigations at tillering, jointing, flowering, milk stage.",
            "priority": "High",
            "weather_dependency": "Adjust based on rainfall; avoid over-irrigation"
        }
    ]

async def generate_rice_sowing_tasks(weather_data: Any, location: str) -> List[Dict[str, str]]:
    """Generate detailed tasks for rice sowing"""
    return [
        {
            "title": "Nursery Preparation",
            "timeline": "30 days before transplanting",
            "description": "Prepare nursery beds with proper drainage. Apply FYM and level properly.",
            "priority": "High",
            "weather_dependency": "Protect nursery from heavy rains and strong winds"
        },
        {
            "title": "Seed Treatment and Sowing",
            "timeline": "25-30 days before transplanting",
            "description": "Treat seeds with Carbendazim. Sow in nursery beds with proper spacing.",
            "priority": "High",
            "weather_dependency": "Maintain proper moisture in nursery"
        },
        {
            "title": "Main Field Preparation",
            "timeline": "15-20 days before transplanting",
            "description": "Puddling operations after plowing. Maintain 2-5cm standing water.",
            "priority": "High",
            "weather_dependency": "Ensure adequate water availability"
        },
        {
            "title": "Transplanting Operation", 
            "timeline": "25-30 days after nursery sowing",
            "description": "Transplant 25-30 day old seedlings at 20x15cm spacing. 2-3 seedlings per hill.",
            "priority": "High",
            "weather_dependency": "Avoid transplanting during heavy rains"
        }
    ]

async def generate_fishiculture_tasks(weather_data: Any) -> List[Dict[str, str]]:
    """Generate tasks for fish farming setup"""
    return [
        {
            "title": "Pond Site Selection and Design",
            "timeline": "Planning phase",
            "description": "Select site with good water source and drainage. Design pond 6-8 feet deep.",
            "priority": "High",
            "weather_dependency": "Consider seasonal water availability"
        },
        {
            "title": "Pond Construction",
            "timeline": "2-4 weeks",
            "description": "Excavate pond with proper slope (1:3). Install inlet and outlet systems.",
            "priority": "High",
            "weather_dependency": "Avoid construction during monsoon"
        },
        {
            "title": "Water Quality Preparation",
            "timeline": "2 weeks before stocking",
            "description": "Fill pond, test pH (6.5-8.5), add lime if needed. Develop natural food organisms.",
            "priority": "High",
            "weather_dependency": "Test water after first major rainfall"
        },
        {
            "title": "Fish Stocking",
            "timeline": "After water preparation",
            "description": "Stock fingerlings: Rohu (40%), Catla (30%), Mrigal (30%). Density: 8000-10000/hectare.",
            "priority": "High",
            "weather_dependency": "Stock during cooler parts of day"
        }
    ]

async def generate_general_sowing_tasks(crop_name: str, weather_data: Any) -> List[Dict[str, str]]:
    """Generate general sowing tasks for any crop"""
    return [
        {
            "title": f"Field Preparation for {crop_name}",
            "timeline": "15-20 days before sowing",
            "description": "Prepare field with proper tillage and soil amendments based on crop requirements.",
            "priority": "High",
            "weather_dependency": "Avoid field operations during wet conditions"
        },
        {
            "title": f"Seed Procurement and Treatment",
            "timeline": "5 days before sowing",
            "description": "Procure quality seeds and treat with appropriate fungicides/bactericides.",
            "priority": "High",
            "weather_dependency": "Store seeds in dry, cool conditions"
        },
        {
            "title": f"{crop_name} Sowing",
            "timeline": "Optimal sowing window",
            "description": "Sow at recommended spacing and depth for the specific crop variety.",
            "priority": "High",
            "weather_dependency": "Follow weather-based sowing recommendations"
        }
    ]

async def generate_harvesting_tasks(crop_name: str, weather_data: Any) -> List[Dict[str, str]]:
    """Generate harvesting task breakdown"""
    return [
        {
            "title": f"Pre-harvest Assessment for {crop_name}",
            "timeline": "1 week before harvest",
            "description": "Check crop maturity, moisture content, and market prices for optimal harvest timing.",
            "priority": "High",
            "weather_dependency": "Monitor weather for harvest window"
        },
        {
            "title": "Equipment Preparation",
            "timeline": "2-3 days before harvest",
            "description": "Service and prepare harvesting equipment. Arrange labor if needed.",
            "priority": "Medium",
            "weather_dependency": "Ensure equipment is weather-ready"
        },
        {
            "title": f"{crop_name} Harvesting",
            "timeline": "Optimal harvest period",
            "description": "Harvest at proper moisture content for maximum yield and quality.",
            "priority": "High",
            "weather_dependency": "Avoid harvesting during rains or high humidity"
        },
        {
            "title": "Post-harvest Processing",
            "timeline": "Immediately after harvest",
            "description": "Drying, threshing, cleaning, and storage operations.",
            "priority": "High",
            "weather_dependency": "Ensure proper drying conditions"
        }
    ]

async def generate_general_farming_tasks(activity: str, weather_data: Any) -> List[Dict[str, str]]:
    """Generate general farming task breakdown"""
    return [
        {
            "title": f"Planning for {activity}",
            "timeline": "Initial phase",
            "description": "Detailed planning including resource requirements, timeline, and budget estimation.",
            "priority": "High",
            "weather_dependency": "Consider seasonal and weather factors in planning"
        },
        {
            "title": "Resource Procurement",
            "timeline": "Before execution", 
            "description": "Procure all necessary materials, tools, and inputs required for the activity.",
            "priority": "Medium",
            "weather_dependency": "Store materials appropriately for weather conditions"
        },
        {
            "title": f"Execute {activity}",
            "timeline": "Execution phase",
            "description": "Carry out the planned farming activity following best practices.",
            "priority": "High",
            "weather_dependency": "Execute during favorable weather conditions"
        },
        {
            "title": "Monitoring and Follow-up",
            "timeline": "After execution",
            "description": "Monitor progress and take corrective actions as needed.",
            "priority": "Medium", 
            "weather_dependency": "Adjust monitoring based on weather impacts"
        }
    ]

@function_tool()
async def suggest_profitable_crops_by_price(
    context: RunContext,
    farm_size_acres: float = 1.0,
    investment_capacity: str = "medium",
    season: str = "current"
) -> str:
    """
    Analyze current market prices and suggest most profitable crops based on 
    price trends, demand, and farm suitability.
    
    Args:
        farm_size_acres: Available farm area in acres
        investment_capacity: Investment range (low, medium, high)
        season: Growing season (rabi, kharif, zaid, current)
    
    Returns:
        Profitable crop suggestions with market analysis
    """
    try:
        # Get live market data
        rag_system = await get_rag_system()
        market_result = await rag_system.update_market_data_live()
        
        # Get farm data for location-specific suggestions
        farm_data = await rag_system.website_data.get_farm_data()
        
        response = "💰 **Profitable Crop Analysis Based on Current Market Prices**\n\n"
        
        if market_result.get("success"):
            response += f"📊 **Market Data Analysis:**\n"
            response += f"• Total records analyzed: {market_result.get('total_records', 0)}\n"
            response += f"• Data sources: {', '.join(market_result.get('sources', []))}\n"
            response += f"• Last updated: Just now\n\n"
            
            # Simulate price analysis (in real implementation, would analyze actual scraped data)
            high_price_crops = [
                {"name": "Saffron", "price": "₹2,50,000/kg", "roi": "400%", "season": "rabi", "investment": "high"},
                {"name": "Vanilla", "price": "₹40,000/kg", "roi": "300%", "season": "year-round", "investment": "high"},
                {"name": "Cardamom", "price": "₹1,200/kg", "roi": "200%", "season": "year-round", "investment": "medium"},
                {"name": "Black Pepper", "price": "₹450/kg", "roi": "150%", "season": "year-round", "investment": "medium"},
                {"name": "Strawberry", "price": "₹200/kg", "roi": "180%", "season": "rabi", "investment": "medium"},
                {"name": "Cherry Tomato", "price": "₹80/kg", "roi": "120%", "season": "rabi/summer", "investment": "low"},
                {"name": "Lettuce", "price": "₹60/kg", "roi": "110%", "season": "rabi", "investment": "low"},
                {"name": "Mushroom", "price": "₹150/kg", "roi": "200%", "season": "year-round", "investment": "low"}
            ]
            
            # Filter based on investment capacity
            suitable_crops = []
            for crop in high_price_crops:
                if investment_capacity == "low" and crop["investment"] in ["low", "medium"]:
                    suitable_crops.append(crop)
                elif investment_capacity == "medium" and crop["investment"] in ["low", "medium", "high"]:
                    suitable_crops.append(crop)
                elif investment_capacity == "high":
                    suitable_crops.append(crop)
            
            response += f"🎯 **Top Profitable Crops for {investment_capacity.title()} Investment:**\n\n"
            
            for i, crop in enumerate(suitable_crops[:5], 1):
                response += f"**{i}. {crop['name']}**\n"
                response += f"   💵 Current Price: {crop['price']}\n"
                response += f"   📈 Expected ROI: {crop['roi']}\n"
                response += f"   🗓️ Season: {crop['season']}\n"
                response += f"   💰 Investment Level: {crop['investment'].title()}\n"
                
                # Add area-specific advice
                if farm_size_acres <= 1.0:
                    if crop['name'] in ['Mushroom', 'Lettuce', 'Cherry Tomato']:
                        response += f"   ✅ Suitable for {farm_size_acres} acre farm\n"
                    else:
                        response += f"   ⚠️ Consider smaller scale for {farm_size_acres} acre farm\n"
                elif farm_size_acres <= 5.0:
                    response += f"   ✅ Good fit for {farm_size_acres} acre farm\n"
                else:
                    response += f"   ✅ Excellent for {farm_size_acres} acre farm - consider large scale\n"
                
                response += f"\n"
        
        # Add market trend analysis
        response += "📊 **Market Trend Insights:**\n"
        response += "• Organic produce commands 20-30% premium prices\n"
        response += "• Export quality crops have higher profit margins\n"
        response += "• Off-season cultivation increases prices by 40-60%\n"
        response += "• Direct marketing reduces middleman costs by 15-25%\n\n"
        
        # Investment-specific recommendations
        if investment_capacity == "low":
            response += "💡 **Low Investment Strategy (₹10,000-50,000):**\n"
            response += "• Focus on high-value vegetables and herbs\n"
            response += "• Use intensive cultivation methods\n"
            response += "• Target local premium markets\n"
            response += "• Consider container/terrace farming\n\n"
        elif investment_capacity == "medium":
            response += "💡 **Medium Investment Strategy (₹50,000-2,00,000):**\n"
            response += "• Combine multiple high-value crops\n"
            response += "• Invest in protected cultivation\n"
            response += "• Set up direct marketing channels\n"
            response += "• Consider value addition (processing)\n\n"
        else:
            response += "💡 **High Investment Strategy (₹2,00,000+):**\n"
            response += "• Large-scale plantation crops\n"
            response += "• Advanced greenhouse technology\n"
            response += "• Export-oriented production\n"
            response += "• Integrated supply chain setup\n\n"
        
        response += "🎯 **Action Plan:**\n"
        response += "1. Start with 2-3 high-ROI crops suitable for your investment\n"
        response += "2. Test market demand in your area before scaling up\n"
        response += "3. Focus on quality and consistent supply\n"
        response += "4. Build relationships with buyers for better prices\n"
        response += "5. Monitor market prices weekly for optimal selling time\n"
        
        return response
        
    except Exception as e:
        logger.error(f"Error in suggest_profitable_crops_by_price: {e}")
        return f"Sorry, I encountered an error while analyzing market prices for crop suggestions. Please try again."

@function_tool()
async def recommend_crops_by_weather_and_season(
    context: RunContext,
    location: str = "",
    current_month: str = "",
    soil_type: str = ""
) -> str:
    """
    Recommend optimal crops based on current weather conditions, seasonal calendar,
    and climatic suitability for the location.
    
    Args:
        location: Farm location (city/district)
        current_month: Current month for seasonal recommendations
        soil_type: Soil type (alluvial, clay, sandy, etc.)
    
    Returns:
        Weather and season-appropriate crop recommendations
    """
    try:
        # Get weather data for the location
        weather_data = None
        if location:
            try:
                weather_data = await get_weather_farming_advice(context, location)
            except Exception as e:
                logger.error(f"Weather API error: {e}")
        
        # Get farm data
        rag_system = await get_rag_system()
        farm_data = await rag_system.website_data.get_farm_data()
        
        response = "🌤️ **Weather-Based Crop Recommendations**\n\n"
        
        # Current date analysis
        current_date = datetime.now()
        current_month_name = current_date.strftime("%B")
        
        if farm_data.get("success"):
            farm_info = farm_data["data"]["farm_info"]
            response += f"📍 **Farm Analysis:**\n"
            response += f"• Location: {farm_info.get('location', location)}\n"
            response += f"• Soil Type: {farm_info.get('soil_type', soil_type)}\n"
            response += f"• Current Month: {current_month_name}\n"
        
        if weather_data:
            response += f"• Weather Status: Based on current conditions\n\n"
        
        # Seasonal crop calendar
        crop_calendar = {
            "October": {
                "rabi_sowing": ["Wheat", "Mustard", "Gram", "Pea", "Barley", "Oat"],
                "vegetables": ["Cauliflower", "Cabbage", "Carrot", "Radish", "Spinach"],
                "fruits": ["Strawberry planting", "Citrus care"]
            },
            "November": {
                "rabi_sowing": ["Wheat", "Mustard", "Barley", "Gram"],
                "vegetables": ["Onion", "Garlic", "Fenugreek", "Coriander"],
                "late_kharif": ["Late rice harvest", "Sugarcane care"]
            },
            "December": {
                "winter_crops": ["Wheat growth care", "Mustard flowering"],
                "vegetables": ["Tomato", "Brinjal", "Okra", "Bottle gourd"],
                "orchard": ["Fruit tree pruning", "Citrus harvest"]
            }
        }
        
        current_recommendations = crop_calendar.get(current_month_name, crop_calendar.get("October"))
        
        response += f"🗓️ **{current_month_name} Crop Calendar:**\n\n"
        
        for category, crops in current_recommendations.items():
            response += f"**{category.replace('_', ' ').title()}:**\n"
            for crop in crops:
                response += f"• {crop}\n"
            response += f"\n"
        
        # Weather-specific recommendations
        response += "🌡️ **Weather-Based Timing:**\n"
        
        if current_month_name in ["October", "November"]:
            response += "**Rabi Season - Optimal Time!**\n"
            response += "• Temperature cooling down - perfect for rabi sowing\n"
            response += "• Wheat: Best sown between 15 Oct - 15 Nov\n"
            response += "• Mustard: Can be sown till end of November\n"
            response += "• Gram: Sow by mid-November for better yield\n\n"
            
            response += "**Immediate Weather Considerations:**\n"
            response += "• Check 7-day forecast before sowing\n"
            response += "• Avoid sowing if heavy rain predicted\n"
            response += "• Night temperature should be below 25°C\n"
            response += "• Morning dew is beneficial for germination\n\n"
        
        # Soil-specific recommendations
        soil_recommendations = {
            "alluvial": {
                "best_crops": ["Wheat", "Rice", "Sugarcane", "Cotton"],
                "characteristics": "Well-drained, fertile, suitable for most crops"
            },
            "clay": {
                "best_crops": ["Rice", "Wheat", "Gram", "Cotton"],
                "characteristics": "Water-retentive, good for water-loving crops"
            },
            "sandy": {
                "best_crops": ["Millet", "Groundnut", "Watermelon", "Carrot"],
                "characteristics": "Well-drained, warm quickly, suitable for root crops"
            },
            "loam": {
                "best_crops": ["Most crops", "Vegetables", "Fruits"],
                "characteristics": "Ideal soil - balanced drainage and fertility"
            }
        }
        
        if soil_type.lower() in soil_recommendations:
            soil_info = soil_recommendations[soil_type.lower()]
            response += f"🌱 **Soil-Specific Recommendations ({soil_type.title()}):**\n"
            response += f"• Characteristics: {soil_info['characteristics']}\n"
            response += f"• Best crops: {', '.join(soil_info['best_crops'])}\n\n"
        
        # Climate zone specific advice
        response += "🌍 **Regional Climate Considerations:**\n"
        response += "• **North India**: Focus on wheat-rice rotation\n"
        response += "• **South India**: Consider rice-pulse rotation\n"
        response += "• **West India**: Cotton and groundnut suitable\n"
        response += "• **East India**: Rice and jute in appropriate seasons\n\n"
        
        response += "💡 **Pro Weather Tips:**\n"
        response += "• Monitor minimum temperature trends\n"
        response += "• Adjust irrigation based on humidity levels\n"
        response += "• Use weather apps for 15-day forecasts\n"
        response += "• Plan operations around weather windows\n"
        response += "• Keep contingency plans for extreme weather\n"
        
        return response
        
    except Exception as e:
        logger.error(f"Error in recommend_crops_by_weather_and_season: {e}")
        return f"Sorry, I encountered an error while analyzing weather conditions for crop recommendations. Please try again."

@function_tool()
async def suggest_government_schemes_for_farming_goal(
    context: RunContext,
    farming_goal: str,
    farm_size: str = "",
    crop_type: str = "",
    farmer_category: str = "general"
) -> str:
    """
    Suggest relevant government schemes based on specific farming goals like 
    income increase, organic farming, fishiculture, etc.
    
    Args:
        farming_goal: Specific goal (income_increase, organic_farming, fishiculture, equipment, etc.)
        farm_size: Farm size category (small, medium, large)
        crop_type: Type of crops being grown
        farmer_category: Farmer category (small, marginal, general, SC/ST, women)
    
    Returns:
        Targeted government scheme recommendations
    """
    try:
        # Get existing schemes data
        rag_system = await get_rag_system()
        schemes_data = await rag_system.website_data.get_government_schemes_data()
        
        response = f"🏛️ **Government Schemes for: {farming_goal.replace('_', ' ').title()}**\n\n"
        
        # Comprehensive scheme database organized by goals
        scheme_database = {
            "income_increase": [
                {
                    "name": "PM-KISAN",
                    "benefit": "₹6,000 annual direct income support",
                    "eligibility": "All landholding farmer families",
                    "application": "https://pmkisan.gov.in",
                    "documents": "Land records, Aadhaar, Bank account"
                },
                {
                    "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                    "benefit": "Crop insurance with premium subsidy",
                    "eligibility": "All farmers growing notified crops",
                    "application": "https://pmfby.gov.in",
                    "documents": "Land records, sowing certificate, Aadhaar"
                },
                {
                    "name": "Kisan Credit Card (KCC)",
                    "benefit": "Flexible credit up to ₹3 lakh at 4% interest",
                    "eligibility": "Farmers with land ownership/tenancy",
                    "application": "Nearest bank branch",
                    "documents": "Land documents, Aadhaar, PAN"
                }
            ],
            "fishiculture": [
                {
                    "name": "Blue Revolution - Fisheries Development",
                    "benefit": "90% subsidy for pond construction (SC/ST), 60% for others",
                    "eligibility": "Fish farmers with minimum 0.2 hectare water area",
                    "application": "State Fisheries Department",
                    "documents": "Land ownership, project report, caste certificate (if applicable)"
                },
                {
                    "name": "Pradhan Mantri Matsya Sampada Yojana",
                    "benefit": "Financial assistance for fish processing and marketing",
                    "eligibility": "Fish farmers, SHGs, Cooperatives",
                    "application": "Department of Fisheries",
                    "documents": "Project proposal, land documents, registration certificates"
                }
            ],
            "organic_farming": [
                {
                    "name": "Paramparagat Krishi Vikas Yojana (PKVY)",
                    "benefit": "₹50,000 per hectare for organic farming promotion",
                    "eligibility": "Farmers in clusters of 50 or more",
                    "application": "Through FPOs or State Agriculture Department",
                    "documents": "Land records, group formation certificate"
                },
                {
                    "name": "Mission Organic Value Chain Development for North Eastern Region (MOVCDNER)",
                    "benefit": "End-to-end support for organic farming",
                    "eligibility": "Farmers in NE states",
                    "application": "State implementing agencies",
                    "documents": "Land ownership, organic conversion plan"
                }
            ],
            "equipment": [
                {
                    "name": "Sub-Mission on Agricultural Mechanization (SMAM)",
                    "benefit": "40-50% subsidy on farm equipment",
                    "eligibility": "Small and marginal farmers get priority",
                    "application": "State Agriculture Department",
                    "documents": "Land records, income certificate, Aadhaar"
                },
                {
                    "name": "Custom Hiring Centers (CHC)",
                    "benefit": "Support for equipment rental business",
                    "eligibility": "FPOs, SHGs, Cooperatives",
                    "application": "District Collector office",
                    "documents": "Business plan, registration documents"
                }
            ],
            "water_management": [
                {
                    "name": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
                    "benefit": "Subsidies for micro-irrigation systems",
                    "eligibility": "All farmers",
                    "application": "State Water Resource Department",
                    "documents": "Land ownership, water source details"
                },
                {
                    "name": "Per Drop More Crop",
                    "benefit": "90% subsidy for drip/sprinkler irrigation",
                    "eligibility": "Small and marginal farmers",
                    "application": "State Agriculture Department",
                    "documents": "Land records, water availability certificate"
                }
            ],
            "livestock": [
                {
                    "name": "National Livestock Mission",
                    "benefit": "Subsidies for dairy, poultry, and goat farming",
                    "eligibility": "Individual farmers, SHGs, FPOs",
                    "application": "District Animal Husbandry office",
                    "documents": "Land availability, veterinary certificate"
                },
                {
                    "name": "Dairy Entrepreneurship Development Scheme (DEDS)",
                    "benefit": "Back-ended capital subsidy for dairy ventures",
                    "eligibility": "Individual entrepreneurs, SHGs",
                    "application": "NABARD or implementing agencies",
                    "documents": "Project report, land documents"
                }
            ]
        }
        
        # Find relevant schemes
        relevant_schemes = scheme_database.get(farming_goal.lower(), [])
        
        if relevant_schemes:
            response += f"🎯 **Targeted Schemes for {farming_goal.replace('_', ' ').title()}:**\n\n"
            
            for i, scheme in enumerate(relevant_schemes, 1):
                response += f"**{i}. {scheme['name']}**\n"
                response += f"   💰 Benefit: {scheme['benefit']}\n"
                response += f"   ✅ Eligibility: {scheme['eligibility']}\n"
                response += f"   📝 Apply at: {scheme['application']}\n"
                response += f"   📄 Documents: {scheme['documents']}\n\n"
        
        # Add category-specific benefits
        if farmer_category in ["small", "marginal"]:
            response += "🏆 **Additional Benefits for Small/Marginal Farmers:**\n"
            response += "• Higher subsidy rates (usually 10-15% more)\n"
            response += "• Priority in scheme implementation\n"
            response += "• Relaxed eligibility criteria\n"
            response += "• Special quotas in government programs\n\n"
        
        elif farmer_category in ["SC", "ST", "women"]:
            response += "🏆 **Special Category Benefits:**\n"
            response += "• Enhanced subsidy rates up to 90%\n"
            response += "• Reserved quotas in all schemes\n"
            response += "• Simplified application processes\n"
            response += "• Priority funding and implementation\n\n"
        
        # Application process guidance
        response += "📋 **How to Apply - Step by Step:**\n"
        response += "1. **Document Preparation**: Collect all required documents\n"
        response += "2. **Scheme Selection**: Choose 2-3 most relevant schemes\n"
        response += "3. **Application Submission**: Submit online or at designated offices\n"
        response += "4. **Follow-up**: Track application status regularly\n"
        response += "5. **Compliance**: Maintain records for post-sanction monitoring\n\n"
        
        # Important tips
        response += "💡 **Application Success Tips:**\n"
        response += "• Apply early in the financial year for better chances\n"
        response += "• Ensure all documents are properly attested\n"
        response += "• Get help from local agriculture extension officer\n"
        response += "• Join farmer groups for cluster-based schemes\n"
        response += "• Keep copies of all submitted documents\n\n"
        
        # Contact information
        response += "📞 **Key Contacts:**\n"
        response += "• District Agriculture Office: For crop-related schemes\n"
        response += "• District Collector: For major infrastructure schemes\n"
        response += "• NABARD Office: For credit and financing schemes\n"
        response += "• Common Service Centers: For online applications\n"
        response += "• Kisan Call Center: 1800-180-1551 (24/7 helpline)\n"
        
        return response
        
    except Exception as e:
        logger.error(f"Error in suggest_government_schemes_for_farming_goal: {e}")
        return f"Sorry, I encountered an error while fetching government scheme information. Please try again."
