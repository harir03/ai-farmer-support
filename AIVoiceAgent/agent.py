from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    noise_cancellation,
)
from livekit.plugins import google
from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION
from tools import (
    get_weather, 
    search_web, 
    send_email,
    show_recommended_crop,
    get_market_prices,
    diagnose_crop_disease,
    get_farming_tasks,
    get_weather_farming_advice,
    calculate_farm_area,
    get_user_farm_info,
    get_farm_for_crop_recommendations,
    navigate_to_page,
    get_soil_health_analysis,
    get_irrigation_schedule,
    get_pest_control_guide,
    get_fertilizer_recommendations,
    get_crop_rotation_plan,
    get_seasonal_calendar,
    get_government_schemes,
    get_harvest_planning,
    get_equipment_recommendations,
    get_organic_farming_guide,
    # RAG System Tools
    query_comprehensive_knowledge,
    get_live_market_data_rag,
    search_agricultural_web,
    get_website_data_access,
    add_farming_knowledge
)

# Import Enhanced Tools for Income Optimization and Intelligent Task Management
from enhanced_tools import (
    analyze_income_optimization,
    generate_intelligent_tasks,
    suggest_profitable_crops_by_price,
    recommend_crops_by_weather_and_season,
    suggest_government_schemes_for_farming_goal
)

# Import Context Enhancement Tools for Intelligent Web Scraping and Location-based Advice
from context_enhancement import (
    enhance_context_with_web_search,
    get_user_location_context,
    provide_comprehensive_answer_with_context
)

# Import RAG system
from rag_system import get_rag_system, cleanup_rag_system
load_dotenv()


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=AGENT_INSTRUCTION,
            llm=google.beta.realtime.RealtimeModel(
            voice="Aoede",
            temperature=0.8,
        ),
            tools=[
                # Core farming tools
                get_weather,
                get_weather_farming_advice,
                search_web,
                send_email,
                show_recommended_crop,
                get_market_prices,
                diagnose_crop_disease,
                get_farming_tasks,
                calculate_farm_area,
                get_user_farm_info,
                get_farm_for_crop_recommendations,
                # Navigation tool
                navigate_to_page,
                # Comprehensive farming tools
                get_soil_health_analysis,
                get_irrigation_schedule,
                get_pest_control_guide,
                get_fertilizer_recommendations,
                get_crop_rotation_plan,
                get_seasonal_calendar,
                get_government_schemes,
                get_harvest_planning,
                get_equipment_recommendations,
                get_organic_farming_guide,
                # RAG System Tools - Comprehensive Knowledge Access
                query_comprehensive_knowledge,
                get_live_market_data_rag,
                search_agricultural_web,
                get_website_data_access,
                add_farming_knowledge,
                # Enhanced Income Optimization & Task Management Tools
                analyze_income_optimization,
                generate_intelligent_tasks,
                suggest_profitable_crops_by_price,
                recommend_crops_by_weather_and_season,
                suggest_government_schemes_for_farming_goal,
                # Intelligent Context Enhancement & Location-based Tools
                enhance_context_with_web_search,
                get_user_location_context,
                provide_comprehensive_answer_with_context
            ],

        )
        


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            video_enabled=True,
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await ctx.connect()

    await session.generate_reply(
        instructions=SESSION_INSTRUCTION,
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))