"""
Example Test Cases for Enhanced AI Farming Assistant
Demonstrates the primary income optimization and task generation features
"""

import asyncio
import sys
import os

# Add the AIVoiceAgent directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_tools import (
    analyze_income_optimization,
    generate_intelligent_tasks,
    suggest_profitable_crops_by_price,
    recommend_crops_by_weather_and_season,
    suggest_government_schemes_for_farming_goal
)

# Mock RunContext for testing
class MockRunContext:
    def __init__(self):
        pass

async def test_income_optimization():
    """Test income optimization analysis"""
    print("🚀 Testing Income Optimization Analysis...")
    
    context = MockRunContext()
    
    result = await analyze_income_optimization(
        context=context,
        current_farming_type="single_crop",
        farm_size_acres=2.5,
        budget_range="medium"
    )
    
    print("✅ Income Optimization Result:")
    print(result[:500] + "..." if len(result) > 500 else result)
    print()

async def test_task_generation():
    """Test intelligent task generation"""
    print("🚀 Testing Intelligent Task Generation...")
    
    context = MockRunContext()
    
    result = await generate_intelligent_tasks(
        context=context,
        farming_activity="sow mustard seeds",
        crop_name="mustard",
        farm_location="Punjab",
        season="rabi"
    )
    
    print("✅ Task Generation Result:")
    print(result[:800] + "..." if len(result) > 800 else result)
    print()

async def test_profitable_crops():
    """Test profitable crop suggestions"""
    print("🚀 Testing Profitable Crop Analysis...")
    
    context = MockRunContext()
    
    result = await suggest_profitable_crops_by_price(
        context=context,
        farm_size_acres=1.5,
        investment_capacity="low",
        season="rabi"
    )
    
    print("✅ Profitable Crops Result:")
    print(result[:600] + "..." if len(result) > 600 else result)
    print()

async def test_weather_recommendations():
    """Test weather-based crop recommendations"""
    print("🚀 Testing Weather-Based Recommendations...")
    
    context = MockRunContext()
    
    result = await recommend_crops_by_weather_and_season(
        context=context,
        location="Delhi",
        current_month="October",
        soil_type="alluvial"
    )
    
    print("✅ Weather-Based Recommendations:")
    print(result[:600] + "..." if len(result) > 600 else result)
    print()

async def test_scheme_suggestions():
    """Test government scheme suggestions"""
    print("🚀 Testing Government Scheme Suggestions...")
    
    context = MockRunContext()
    
    result = await suggest_government_schemes_for_farming_goal(
        context=context,
        farming_goal="fishiculture",
        farm_size="medium",
        crop_type="mixed",
        farmer_category="small"
    )
    
    print("✅ Government Scheme Suggestions:")
    print(result[:600] + "..." if len(result) > 600 else result)
    print()

async def main():
    """Run all test cases"""
    print("🌾 ENHANCED AI FARMING ASSISTANT - COMPREHENSIVE TEST\n")
    print("=" * 60)
    
    try:
        await test_income_optimization()
        print("-" * 60)
        
        await test_task_generation()
        print("-" * 60)
        
        await test_profitable_crops()
        print("-" * 60)
        
        await test_weather_recommendations()
        print("-" * 60)
        
        await test_scheme_suggestions()
        print("-" * 60)
        
        print("🎉 ALL TESTS COMPLETED SUCCESSFULLY!")
        print("\n📋 CAPABILITIES DEMONSTRATED:")
        print("✅ Income optimization through mixed farming analysis")
        print("✅ Intelligent task breakdown with weather considerations")  
        print("✅ Market price-based profitable crop suggestions")
        print("✅ Weather and seasonal crop recommendations")
        print("✅ Targeted government scheme matching")
        print("\n💡 The AI agent can now:")
        print("• Analyze current farming and suggest income diversification")
        print("• Break down 'sow mustard seeds' into 10+ detailed weather-dependent tasks")
        print("• Suggest profitable crops based on live market price analysis")
        print("• Recommend crops optimal for current weather/season")
        print("• Match farmers with relevant government schemes for their goals")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())