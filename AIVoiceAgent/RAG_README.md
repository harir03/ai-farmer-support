# AI Voice Agent with Comprehensive RAG System

This AI Voice Agent now includes a comprehensive RAG (Retrieval-Augmented Generation) system that provides access to all website data, live web scraping, and an extensive agricultural knowledge base.

## 🚀 New RAG System Features

### Comprehensive Knowledge Access
- **Website Integration**: Access to all website tabs (market prices, tasks, crops, community, farm data, government schemes)
- **Live Web Scraping**: Fresh market data from multiple sources with progress tracking
- **Vector Search**: Advanced similarity search using sentence transformers and FAISS indexing
- **Agricultural Web Search**: Specialized web search focused on farming and agriculture
- **Knowledge Base**: Persistent storage of farming knowledge with SQLite database

### RAG Tools Available to the AI Agent

1. **`query_comprehensive_knowledge(query, include_web_search=True)`**
   - Primary tool for complex farming questions
   - Searches knowledge base + website data + web simultaneously
   - Returns comprehensive answers with recommendations

2. **`get_live_market_data_rag(commodity=None)`**
   - Triggers live web scraping for fresh market prices
   - Updates knowledge base with new data
   - Returns scraping statistics and sources

3. **`search_agricultural_web(query, max_results=5)`**
   - Specialized agricultural web search
   - Relevance scoring for farming content
   - Filtered results focused on agriculture

4. **`get_website_data_access(section)`**
   - Direct access to website sections
   - Available sections: market_prices, tasks, crops, community, farm, schemes
   - Real-time data from the web application

5. **`add_farming_knowledge(content, category, source)`**
   - Add new farming knowledge to the knowledge base
   - Categories: techniques, market_data, crop_info, etc.
   - Persistent storage for future reference

## 🏗️ RAG System Architecture

### Components

1. **WebsiteDataAccess**
   - Connects to all website endpoints
   - Retrieves real-time data from tabs
   - Handles API calls and data formatting

2. **WebScrapingService**
   - Live market price scraping
   - Agricultural web search with DuckDuckGo
   - Relevance scoring and filtering

3. **KnowledgeBase**
   - Vector embeddings using sentence-transformers
   - FAISS indexing for similarity search
   - SQLite database for persistent storage
   - Document metadata and categorization

4. **ComprehensiveRAGSystem**
   - Orchestrates all components
   - Query processing and routing
   - Response generation and formatting
   - Session management

### Data Flow

```
User Query → RAG System → [Knowledge Base + Website Data + Web Search] → Comprehensive Response
```

## 🛠️ Setup and Installation

### Prerequisites

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **New Dependencies Added**
   - `sentence-transformers`: For text embeddings
   - `faiss-cpu`: For vector similarity search
   - `numpy`: For numerical computations
   - `aiohttp`: For async HTTP requests

### Environment Configuration

Add to your `.env` file:
```env
# Existing variables
OPENWEATHER_API_KEY=your_openweather_key
GOOGLE_API_KEY=your_google_key
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_secret

# Ensure web application is running on correct port
WEB_APP_URL=http://localhost:3001
```

## 🧪 Testing the RAG System

Run the test script to verify everything works:

```bash
cd AIVoiceAgent
python test_rag.py
```

This will test:
- RAG system initialization
- Knowledge base population
- Website data access
- Web scraping functionality
- Vector similarity search

## 🎯 Usage Examples

### Agent Capabilities Enhanced

The AI agent can now:

1. **Answer Complex Farming Questions**
   ```
   User: "What are the best organic farming techniques for tomatoes?"
   Agent: Uses query_comprehensive_knowledge() to search knowledge base + web
   ```

2. **Provide Fresh Market Data**
   ```
   User: "What are today's wheat prices?"
   Agent: Uses get_live_market_data_rag() to scrape live data
   ```

3. **Access All Website Features**
   ```
   User: "Show me my farming tasks"
   Agent: Uses get_website_data_access("tasks") for real-time task data
   ```

4. **Learn from Interactions**
   ```
   User: Shares farming tip
   Agent: Uses add_farming_knowledge() to store for future reference
   ```

## 🔧 Configuration

### Knowledge Categories

The system organizes knowledge into categories:
- `market_data`: Market prices and trading info
- `farming_tasks`: Agricultural tasks and scheduling
- `crop_info`: Crop recommendations and guidance
- `community`: Community discussions and tips
- `government`: Government schemes and policies
- `weather`: Weather and environmental data
- `techniques`: Farming techniques and best practices

### Vector Search Settings

- **Model**: `all-MiniLM-L6-v2` (fast, efficient for farming contexts)
- **Index Type**: FAISS IndexFlatIP (inner product similarity)
- **Max Results**: Configurable (default 5 for knowledge base search)

## 📊 Performance Features

### Caching and Optimization
- Document embeddings cached in database
- FAISS index loaded once at startup
- Async operations for concurrent data access
- Session pooling for HTTP requests

### Scalability
- SQLite database for persistent storage
- Incremental knowledge base updates
- Configurable result limits
- Background session management

## 🔄 Integration with Existing Tools

The RAG system enhances existing tools:
- **Market prices**: Now includes live scraping and knowledge base
- **Crop recommendations**: Enhanced with comprehensive knowledge search
- **Weather advice**: Combined with historical farming knowledge
- **Disease diagnosis**: Augmented with community insights and web search

## 🚨 Error Handling

The system includes robust error handling:
- Graceful degradation if components fail
- Fallback to existing tools when RAG unavailable
- Comprehensive logging for debugging
- Session cleanup and resource management

## 🔮 Future Enhancements

Planned improvements:
- Multi-modal document support (images, PDFs)
- Real-time knowledge base updates
- Personalized knowledge recommendations
- Advanced agricultural domain embeddings
- Integration with IoT sensor data

---

The AI Voice Agent now has comprehensive access to all website data, live market information, and an extensive agricultural knowledge base, making it a truly comprehensive farming assistant!