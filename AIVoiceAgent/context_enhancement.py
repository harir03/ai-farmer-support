"""
Intelligent Context Enhancement Tools
Automatically fills knowledge gaps through web scraping and provides location-specific recommendations
"""

import logging
from livekit.agents import function_tool, RunContext
import requests
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
import asyncio

# Import RAG system and existing tools
from rag_system import get_rag_system
from tools import get_user_farm_info, get_weather_farming_advice

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@function_tool()
async def enhance_context_with_web_search(
    context: RunContext,
    original_query: str,
    missing_context_type: str = "general",
    location: str = ""
) -> str:
    """
    Automatically enhance incomplete answers by scraping relevant web information
    and providing location-specific recommendations.
    
    Args:
        original_query: The user's original question
        missing_context_type: Type of missing context (technical, location, market, seasonal, etc.)
        location: User location if available
    
    Returns:
        Enhanced answer with web-scraped information and location context
    """
    try:
        # Get user's farm location if available
        farm_info = await get_user_location_context(context)
        user_location = farm_info.get("location", location or "India")
        
        # Get RAG system for comprehensive search
        rag_system = await get_rag_system()
        
        response = f"🔍 **Enhanced Answer for: {original_query}**\n\n"
        
        # First, search existing knowledge base
        kb_result = await rag_system.query_comprehensive(original_query, include_web_search=False)
        
        if kb_result.get("knowledge_base_results"):
            response += "📚 **From Our Knowledge Base:**\n"
            for result in kb_result["knowledge_base_results"][:2]:
                response += f"• {result['metadata'].get('summary', 'Agricultural guidance')}\n"
            response += "\n"
        
        # Enhanced web search with multiple farming-specific queries
        web_queries = generate_enhanced_search_queries(original_query, user_location, missing_context_type)
        
        response += f"🌐 **Latest Information from Web Search** (Location: {user_location}):\n\n"
        
        comprehensive_info = []
        
        for query in web_queries[:3]:  # Limit to 3 searches for performance
            try:
                web_result = await rag_system.web_scraper.search_agricultural_web(query, max_results=3)
                if web_result.get("success") and web_result.get("results"):
                    comprehensive_info.extend(web_result["results"][:2])  # Top 2 results per query
            except Exception as e:
                logger.error(f"Web search error for query '{query}': {e}")
        
        # Process and format web search results
        if comprehensive_info:
            for i, result in enumerate(comprehensive_info[:5], 1):  # Top 5 overall results
                response += f"**{i}. {result['title']}**\n"
                response += f"   📝 {result['description'][:150]}...\n"
                response += f"   🔗 Source: {result['url'][:50]}...\n"
                response += f"   📊 Relevance: {result['relevance_score']:.1%}\n\n"
        else:
            response += "⚠️ Web search results not available at the moment.\n\n"
        
        # Add location-specific context
        response += await get_location_specific_guidance(user_location, original_query, context)
        
        # Add current seasonal context
        response += get_current_seasonal_context(user_location)
        
        # Provide actionable recommendations
        response += "\n💡 **Immediate Action Steps:**\n"
        response += generate_actionable_recommendations(original_query, user_location)
        
        # Add trust-building information
        response += "\n🎯 **Why Trust This Information:**\n"
        response += f"• Combined knowledge from {len(kb_result.get('knowledge_base_results', []))} agricultural sources\n"
        response += f"• Latest web information from {len(comprehensive_info)} verified farming sources\n"
        response += f"• Location-specific guidance for {user_location}\n"
        response += f"• Current seasonal recommendations for {datetime.now().strftime('%B %Y')}\n"
        
        return response
        
    except Exception as e:
        logger.error(f"Error in enhance_context_with_web_search: {e}")
        return f"I apologize, but I encountered an error while gathering comprehensive information. Let me try to help with the information I have available."

@function_tool()
async def get_user_location_context(context: RunContext) -> Dict[str, Any]:
    """
    Get user's location and farm context from My Farm tab or use India as default.
    
    Returns:
        User location context including coordinates, state, and farm details
    """
    try:
        # Get user farm information
        farm_info_result = await get_user_farm_info(context)
        
        # Extract location from farm info if available
        if "Sorry" not in farm_info_result and "error" not in farm_info_result.lower():
            # Parse farm information to extract location details
            location_context = {
                "has_farm_profile": True,
                "location": "India",  # Default
                "state": "Not specified",
                "coordinates": None,
                "soil_type": "Not specified",
                "farm_size": "Not specified"
            }
            
            # Try to extract location from farm info response
            if "Location:" in farm_info_result:
                try:
                    location_line = [line for line in farm_info_result.split('\n') if 'Location:' in line][0]
                    location = location_line.split('Location:')[1].strip()
                    location_context["location"] = location
                    
                    # Extract state if present
                    if "," in location:
                        parts = location.split(",")
                        if len(parts) >= 2:
                            location_context["state"] = parts[-1].strip()
                except:
                    pass
            
            return location_context
        else:
            # No farm profile available
            return {
                "has_farm_profile": False,
                "location": "India",
                "state": "General",
                "coordinates": None,
                "message": "No farm profile found. Providing general guidance for India."
            }
            
    except Exception as e:
        logger.error(f"Error getting location context: {e}")
        return {
            "has_farm_profile": False,
            "location": "India",
            "state": "General",
            "error": str(e)
        }

def generate_enhanced_search_queries(original_query: str, location: str, context_type: str) -> List[str]:
    """Generate multiple search queries to get comprehensive information"""
    
    base_query = original_query.lower()
    location_specific = f"{location}" if location != "India" else "India"
    
    queries = []
    
    # Location-specific queries
    queries.append(f"{base_query} {location_specific} farming agriculture")
    queries.append(f"{base_query} best practices {location_specific} farmers")
    
    # Context-type specific queries
    if context_type == "technical":
        queries.extend([
            f"{base_query} latest techniques methods 2024 2025",
            f"{base_query} scientific research farming technology",
            f"{base_query} agricultural extension guidelines"
        ])
    elif context_type == "market":
        queries.extend([
            f"{base_query} market prices trends {location_specific}",
            f"{base_query} profitable farming business {location_specific}",
            f"{base_query} agricultural marketing {location_specific}"
        ])
    elif context_type == "seasonal":
        current_month = datetime.now().strftime("%B")
        queries.extend([
            f"{base_query} {current_month} season {location_specific}",
            f"{base_query} seasonal calendar {location_specific} farming",
            f"{base_query} timing schedule {location_specific} agriculture"
        ])
    else:
        # General enhancement
        queries.extend([
            f"{base_query} complete guide {location_specific} farming",
            f"{base_query} step by step {location_specific} agriculture",
            f"{base_query} expert advice {location_specific} farmers"
        ])
    
    return queries[:4]  # Return top 4 queries

async def get_location_specific_guidance(location: str, query: str, context: RunContext) -> str:
    """Get location-specific farming guidance"""
    
    guidance = f"📍 **Location-Specific Guidance for {location}:**\n"
    
    try:
        # Get weather context for location
        if location != "India":
            weather_advice = await get_weather_farming_advice(context, location)
            if weather_advice and "Sorry" not in weather_advice:
                guidance += f"🌤️ **Current Weather Context:**\n{weather_advice[:200]}...\n\n"
        
        # Add region-specific advice
        if "punjab" in location.lower():
            guidance += "• **Punjab-specific**: Focus on wheat-rice rotation, consider diversification\n"
            guidance += "• **Soil**: Rich alluvial soil, good for most crops\n"
            guidance += "• **Water**: Abundant irrigation, consider water-saving techniques\n"
        elif "maharashtra" in location.lower():
            guidance += "• **Maharashtra-specific**: Cotton, sugarcane, and horticulture suitable\n"
            guidance += "• **Soil**: Black cotton soil, excellent water retention\n"
            guidance += "• **Climate**: Consider drought-resistant varieties\n"
        elif "kerala" in location.lower():
            guidance += "• **Kerala-specific**: Spices, coconut, rubber cultivation suitable\n"
            guidance += "• **Climate**: High humidity, good for tropical crops\n"
            guidance += "• **Terrain**: Hilly areas good for plantation crops\n"
        elif "rajasthan" in location.lower():
            guidance += "• **Rajasthan-specific**: Millets, mustard, and drought-tolerant crops\n"
            guidance += "• **Water**: Focus on water conservation techniques\n"
            guidance += "• **Climate**: Hot and dry, choose heat-resistant varieties\n"
        else:
            guidance += "• **General India**: Diverse agro-climatic zones, choose region-appropriate crops\n"
            guidance += "• **Monsoon**: Plan activities around monsoon patterns\n"
            guidance += "• **Soil**: Test soil pH and nutrients for optimal crop selection\n"
        
        guidance += "\n"
        
    except Exception as e:
        logger.error(f"Error getting location-specific guidance: {e}")
        guidance += "• Check with local agricultural extension officers for region-specific advice\n\n"
    
    return guidance

def get_current_seasonal_context(location: str) -> str:
    """Provide current seasonal context and recommendations"""
    
    current_month = datetime.now().strftime("%B")
    current_date = datetime.now()
    
    seasonal_context = f"🗓️ **Current Seasonal Context ({current_month} 2025):**\n"
    
    if current_month in ["October", "November"]:
        seasonal_context += "• **Rabi Season**: Perfect time for wheat, mustard, gram sowing\n"
        seasonal_context += "• **Temperature**: Cooling down, ideal for rabi crop establishment\n"
        seasonal_context += "• **Activities**: Land preparation, seed treatment, sowing operations\n"
        seasonal_context += "• **Weather Watch**: Monitor for late rains that may delay sowing\n"
    elif current_month in ["December", "January", "February"]:
        seasonal_context += "• **Winter Season**: Rabi crops in vegetative growth stage\n"
        seasonal_context += "• **Activities**: Irrigation management, fertilizer application, weed control\n"
        seasonal_context += "• **Pest Watch**: Monitor for winter pests like aphids\n"
    elif current_month in ["March", "April"]:
        seasonal_context += "• **Harvest Season**: Rabi crop maturation and harvesting\n"
        seasonal_context += "• **Activities**: Harvest timing, post-harvest management\n"
        seasonal_context += "• **Summer Prep**: Plan for summer crops if irrigation available\n"
    elif current_month in ["May", "June"]:
        seasonal_context += "• **Pre-Monsoon**: Land preparation for kharif crops\n"
        seasonal_context += "• **Activities**: Deep plowing, organic matter incorporation\n"
        seasonal_context += "• **Monsoon Watch**: Track monsoon predictions for sowing timing\n"
    elif current_month in ["July", "August", "September"]:
        seasonal_context += "• **Kharif Season**: Monsoon crops - rice, cotton, sugarcane\n"
        seasonal_context += "• **Activities**: Sowing, transplanting, monsoon management\n"
        seasonal_context += "• **Water Management**: Drainage and flood protection\n"
    
    seasonal_context += f"• **Next 30 Days**: Plan activities based on seasonal calendar\n\n"
    
    return seasonal_context

def generate_actionable_recommendations(query: str, location: str) -> str:
    """Generate specific actionable recommendations"""
    
    recommendations = ""
    
    query_lower = query.lower()
    
    if any(word in query_lower for word in ["crop", "plant", "grow", "cultivate"]):
        recommendations += "1. **Immediate**: Get soil testing done for nutrient analysis\n"
        recommendations += "2. **This Week**: Check weather forecast for next 15 days\n"
        recommendations += "3. **Within Month**: Procure quality seeds from certified dealers\n"
        recommendations += "4. **Ongoing**: Connect with local agricultural extension officer\n"
    elif any(word in query_lower for word in ["disease", "pest", "problem", "issue"]):
        recommendations += "1. **Immediate**: Take clear photos of affected plants\n"
        recommendations += "2. **Today**: Isolate affected plants if possible\n"
        recommendations += "3. **Within 24 Hours**: Consult with nearest agricultural expert\n"
        recommendations += "4. **Follow-up**: Monitor spread and treatment effectiveness\n"
    elif any(word in query_lower for word in ["market", "price", "sell", "profit"]):
        recommendations += "1. **Daily**: Check market prices before harvesting/selling\n"
        recommendations += "2. **Weekly**: Monitor price trends for optimal selling time\n"
        recommendations += "3. **Planning**: Connect with buyer networks and FPOs\n"
        recommendations += "4. **Long-term**: Consider value addition for better prices\n"
    else:
        recommendations += "1. **Research**: Gather more specific information about your situation\n"
        recommendations += "2. **Plan**: Create a detailed action plan with timelines\n"
        recommendations += "3. **Resources**: Identify required materials and budget\n"
        recommendations += "4. **Expert Advice**: Consult with agricultural specialists\n"
    
    # Add location-specific action
    recommendations += f"5. **Local Action**: Contact {location} agricultural department for region-specific guidance\n"
    
    return recommendations

@function_tool()
async def provide_comprehensive_answer_with_context(
    context: RunContext,
    user_query: str,
    confidence_level: str = "medium"
) -> str:
    """
    Main function that provides comprehensive answers by automatically enhancing 
    context when needed and providing location-specific recommendations.
    
    Args:
        user_query: The user's question
        confidence_level: Agent's confidence in existing knowledge (low, medium, high)
    
    Returns:
        Comprehensive answer with enhanced context and location-specific guidance
    """
    try:
        # Get user location context
        location_info = await get_user_location_context(context)
        user_location = location_info.get("location", "India")
        
        # Get RAG system
        rag_system = await get_rag_system()
        
        response = f"🎯 **Comprehensive Answer for: {user_query}**\n\n"
        
        # Always start with location context
        if location_info.get("has_farm_profile"):
            response += f"📍 **Your Farm Context**: {user_location}\n"
            if location_info.get("state") != "Not specified":
                response += f"📍 **State**: {location_info.get('state')}\n"
        else:
            response += f"📍 **General Context**: Providing guidance for India (Add farm profile for personalized advice)\n"
        response += "\n"
        
        # Query comprehensive knowledge base
        kb_result = await rag_system.query_comprehensive(user_query, include_web_search=True)
        
        # If confidence is low or limited results, enhance with web search
        if (confidence_level == "low" or 
            len(kb_result.get("knowledge_base_results", [])) < 2 or
            len(kb_result.get("web_search_results", [])) < 2):
            
            response += "🔍 **Enhanced Research Mode Activated**\n"
            response += "Gathering additional information to provide you the most accurate answer...\n\n"
            
            # Determine context type based on query
            context_type = "general"
            if any(word in user_query.lower() for word in ["price", "market", "sell", "cost"]):
                context_type = "market"
            elif any(word in user_query.lower() for word in ["when", "time", "season", "month"]):
                context_type = "seasonal"
            elif any(word in user_query.lower() for word in ["how", "method", "technique", "process"]):
                context_type = "technical"
            
            # Get enhanced context
            enhanced_info = await enhance_context_with_web_search(
                context, user_query, context_type, user_location
            )
            
            return enhanced_info
        
        else:
            # We have sufficient context, provide comprehensive answer
            response += "📚 **Knowledge Base Results:**\n"
            for i, result in enumerate(kb_result.get("knowledge_base_results", [])[:3], 1):
                response += f"{i}. Source: {result['source']} | Category: {result['category']}\n"
            
            if kb_result.get("web_search_results"):
                response += f"\n🌐 **Additional Web Information:**\n"
                for i, result in enumerate(kb_result.get("web_search_results", [])[:2], 1):
                    response += f"{i}. {result['title'][:60]}...\n"
            
            # Add location-specific guidance
            response += "\n"
            response += await get_location_specific_guidance(user_location, user_query, context)
            
            # Add recommendations
            if kb_result.get("recommendations"):
                response += "💡 **Personalized Recommendations:**\n"
                for i, rec in enumerate(kb_result["recommendations"], 1):
                    response += f"{i}. {rec}\n"
            
            response += "\n🎯 **Trust Indicators:**\n"
            response += f"• Knowledge base: {len(kb_result.get('knowledge_base_results', []))} sources\n"
            response += f"• Web verification: {len(kb_result.get('web_search_results', []))} additional sources\n"
            response += f"• Location-optimized for: {user_location}\n"
            response += f"• Current season: {datetime.now().strftime('%B %Y')} context included\n"
            
            return response
        
    except Exception as e:
        logger.error(f"Error in provide_comprehensive_answer_with_context: {e}")
        
        # Fallback to basic enhanced search
        try:
            return await enhance_context_with_web_search(context, user_query, "general", "India")
        except:
            return f"I apologize, but I'm having technical difficulties. However, I want to help you with '{user_query}'. Please try asking again, or contact our support team. For immediate help, you can also consult your local agricultural extension officer."
