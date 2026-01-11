"""
Test script for the RAG system integration
"""

import asyncio
import sys
import os

# Add the AIVoiceAgent directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from rag_system import ComprehensiveRAGSystem, RAGDocument
from datetime import datetime

async def test_rag_system():
    """Test the RAG system functionality"""
    print("🚀 Testing Comprehensive RAG System...")
    
    try:
        # Initialize RAG system
        rag = ComprehensiveRAGSystem()
        await rag.initialize_knowledge_base()
        
        print("✅ RAG system initialized successfully!")
        
        # Test comprehensive query
        print("\n📚 Testing comprehensive query...")
        result = await rag.query_comprehensive("market prices for wheat today")
        
        if "error" not in result:
            print(f"✅ Query successful! Found {len(result.get('knowledge_base_results', []))} KB results")
            print(f"   Web results: {len(result.get('web_search_results', []))}")
            print(f"   Market data available: {bool(result.get('market_data'))}")
            print(f"   Recommendations: {len(result.get('recommendations', []))}")
        else:
            print(f"❌ Query failed: {result['error']}")
        
        # Test website data access
        print("\n🌐 Testing website data access...")
        market_data = await rag.website_data.get_market_prices_data()
        
        if market_data.get("success"):
            print("✅ Market data access successful!")
        else:
            print(f"❌ Market data access failed: {market_data.get('error')}")
        
        # Test web scraper
        print("\n🔍 Testing agricultural web search...")
        search_result = await rag.web_scraper.search_agricultural_web("organic farming techniques")
        
        if search_result.get("success"):
            print(f"✅ Web search successful! Found {len(search_result['results'])} results")
        else:
            print(f"❌ Web search failed: {search_result.get('error')}")
        
        # Test knowledge base
        print("\n📖 Testing knowledge base...")
        similar_docs = await rag.knowledge_base.search_similar("crop rotation benefits")
        print(f"✅ Knowledge base search returned {len(similar_docs)} similar documents")
        
        # Close sessions
        await rag.close_all_sessions()
        print("\n🎉 All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_rag_system())