"""
Comprehensive RAG (Retrieval-Augmented Generation) System for AI Farm Care Assistant
Provides access to all website data, web scraping, and knowledge base for the chatbot
"""

import json
import logging
import os
import requests
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import asyncio
import aiohttp
from dataclasses import dataclass
from pathlib import Path
import sqlite3
import hashlib
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
import pickle
from duckduckgo_search import DDGS
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class RAGDocument:
    """Document structure for RAG system"""
    id: str
    content: str
    metadata: Dict[str, Any]
    embedding: Optional[np.ndarray] = None
    timestamp: datetime = None
    source: str = ""
    category: str = ""

class WebsiteDataAccess:
    """Handles access to all website tabs and their data"""
    
    def __init__(self, base_url: str = "http://localhost:3001"):
        self.base_url = base_url
        self.session = None
        
    async def get_session(self):
        """Get or create aiohttp session"""
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close_session(self):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()
            self.session = None
    
    async def get_market_prices_data(self, scrape_live: bool = False) -> Dict[str, Any]:
        """Get market prices data from the website"""
        try:
            session = await self.get_session()
            params = {"scrape": "true"} if scrape_live else {}
            
            async with session.get(f"{self.base_url}/api/market-prices", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "success": True,
                        "data": data,
                        "source": "market_prices_api",
                        "timestamp": datetime.now(),
                        "scraped": scrape_live
                    }
                else:
                    logger.error(f"Failed to get market prices: {response.status}")
                    return {"success": False, "error": f"API returned {response.status}"}
                    
        except Exception as e:
            logger.error(f"Error fetching market prices: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_tasks_data(self) -> Dict[str, Any]:
        """Get farming tasks data"""
        try:
            # Simulate task data (in real implementation, this would call the tasks API)
            tasks_data = {
                "active_tasks": [
                    {"id": 1, "title": "Water vegetable garden", "priority": "high", "due": "Today 8:00 AM"},
                    {"id": 2, "title": "Check livestock feed", "priority": "medium", "due": "Today 10:00 AM"},
                    {"id": 3, "title": "Fertilize crop field A", "priority": "high", "due": "Yesterday", "status": "overdue"},
                ],
                "completed_tasks": 12,
                "pending_tasks": 8,
                "categories": ["irrigation", "livestock", "fertilization", "harvesting", "maintenance"]
            }
            
            return {
                "success": True,
                "data": tasks_data,
                "source": "tasks_data",
                "timestamp": datetime.now()
            }
        except Exception as e:
            logger.error(f"Error fetching tasks data: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_crop_recommendations_data(self) -> Dict[str, Any]:
        """Get crop recommendations data"""
        try:
            crop_data = {
                "recommended_crops": [
                    {"name": "Wheat", "season": "Rabi", "suitability": 95, "expected_yield": "4.5 tonnes/hectare"},
                    {"name": "Rice", "season": "Kharif", "suitability": 88, "expected_yield": "3.8 tonnes/hectare"},
                    {"name": "Sugarcane", "season": "Annual", "suitability": 82, "expected_yield": "75 tonnes/hectare"}
                ],
                "soil_conditions": {"pH": 6.8, "nitrogen": "Medium", "phosphorus": "High", "potassium": "Medium"},
                "weather_factors": {"rainfall": "Normal", "temperature": "Optimal", "humidity": "Moderate"}
            }
            
            return {
                "success": True,
                "data": crop_data,
                "source": "crop_recommendations",
                "timestamp": datetime.now()
            }
        except Exception as e:
            logger.error(f"Error fetching crop recommendations: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_community_data(self) -> Dict[str, Any]:
        """Get community feed and groups data"""
        try:
            community_data = {
                "recent_posts": [
                    {"user": "Farmer John", "content": "Great harvest this season! Rice yield exceeded expectations.", "likes": 45, "comments": 12},
                    {"user": "AgriExpert", "content": "Tips for pest control in cotton farming", "likes": 32, "comments": 8},
                    {"user": "CropScientist", "content": "New organic fertilizer showing promising results", "likes": 28, "comments": 15}
                ],
                "active_groups": ["Rice Farmers", "Organic Farming", "Pest Control", "Government Schemes"],
                "trending_topics": ["Market Prices", "Weather Updates", "Crop Disease", "Government Subsidies"]
            }
            
            return {
                "success": True,
                "data": community_data,
                "source": "community_data",
                "timestamp": datetime.now()
            }
        except Exception as e:
            logger.error(f"Error fetching community data: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_farm_data(self) -> Dict[str, Any]:
        """Get user's farm information"""
        try:
            farm_data = {
                "farm_info": {
                    "name": "Green Valley Farm",
                    "size": "25 hectares",
                    "location": "Punjab, India",
                    "soil_type": "Alluvial",
                    "water_source": "Tube well + Canal irrigation"
                },
                "current_crops": [
                    {"name": "Wheat", "area": "10 hectares", "stage": "Harvesting", "health": "Excellent"},
                    {"name": "Rice", "area": "8 hectares", "stage": "Flowering", "health": "Good"},
                    {"name": "Sugarcane", "area": "7 hectares", "stage": "Growing", "health": "Fair"}
                ],
                "equipment": ["Tractor", "Harvester", "Irrigation System", "Sprayer"],
                "recent_activities": ["Applied fertilizer to wheat field", "Irrigation schedule updated", "Pest control in rice field"]
            }
            
            return {
                "success": True,
                "data": farm_data,
                "source": "farm_data",
                "timestamp": datetime.now()
            }
        except Exception as e:
            logger.error(f"Error fetching farm data: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_government_schemes_data(self) -> Dict[str, Any]:
        """Get government schemes information"""
        try:
            schemes_data = {
                "available_schemes": [
                    {
                        "name": "PM-KISAN",
                        "description": "Direct income support to farmer families",
                        "benefit": "₹6,000 per year",
                        "eligibility": "All landholding farmer families",
                        "application_url": "https://pmkisan.gov.in"
                    },
                    {
                        "name": "Kisan Credit Card",
                        "description": "Credit facility for agricultural needs",
                        "benefit": "Flexible credit limit",
                        "eligibility": "Farmers with land records",
                        "application_url": "https://www.nabard.org/kcc"
                    },
                    {
                        "name": "PMFBY",
                        "description": "Crop insurance scheme",
                        "benefit": "Crop loss compensation",
                        "eligibility": "All farmers growing notified crops",
                        "application_url": "https://pmfby.gov.in"
                    }
                ],
                "recent_updates": ["New subsidy for organic farming", "Extended deadline for KCC applications"],
                "application_status": {"PM-KISAN": "Approved", "KCC": "Pending", "PMFBY": "Not Applied"}
            }
            
            return {
                "success": True,
                "data": schemes_data,
                "source": "government_schemes",
                "timestamp": datetime.now()
            }
        except Exception as e:
            logger.error(f"Error fetching government schemes: {e}")
            return {"success": False, "error": str(e)}

class WebScrapingService:
    """Enhanced web scraping service for agricultural data"""
    
    def __init__(self):
        self.session = None
        self.scraped_cache = {}
        
    async def get_session(self):
        """Get or create aiohttp session"""
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def scrape_market_prices_live(self) -> Dict[str, Any]:
        """Scrape live market prices from various sources"""
        try:
            # Call the local web scraper API
            session = await self.get_session()
            async with session.get("http://localhost:3001/api/market-prices?scrape=true") as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "success": True,
                        "data": data.get("data", []),
                        "sources": data.get("scrapedFrom", []),
                        "total_records": data.get("totalRecordsScraped", 0),
                        "scraping_time": data.get("scrapingTime", 0),
                        "timestamp": datetime.now()
                    }
                else:
                    return {"success": False, "error": f"Scraping API returned {response.status}"}
                    
        except Exception as e:
            logger.error(f"Error in live market scraping: {e}")
            return {"success": False, "error": str(e)}
    
    async def search_agricultural_web(self, query: str, max_results: int = 10) -> Dict[str, Any]:
        """Search the web for agricultural information"""
        try:
            with DDGS() as ddgs:
                # Add farming-specific context to queries
                farming_query = f"{query} farming agriculture india"
                results = list(ddgs.text(farming_query, max_results=max_results))
                
                if not results:
                    return {"success": False, "error": "No search results found"}
                
                processed_results = []
                for result in results:
                    processed_results.append({
                        "title": result.get("title", ""),
                        "description": result.get("body", ""),
                        "url": result.get("href", ""),
                        "relevance_score": self._calculate_relevance(result.get("body", ""), query)
                    })
                
                # Sort by relevance
                processed_results.sort(key=lambda x: x["relevance_score"], reverse=True)
                
                return {
                    "success": True,
                    "results": processed_results,
                    "query": query,
                    "timestamp": datetime.now()
                }
                
        except Exception as e:
            logger.error(f"Error in web search: {e}")
            return {"success": False, "error": str(e)}
    
    def _calculate_relevance(self, text: str, query: str) -> float:
        """Calculate relevance score for search results"""
        try:
            text_lower = text.lower()
            query_lower = query.lower()
            
            # Basic keyword matching
            query_words = query_lower.split()
            matches = sum(1 for word in query_words if word in text_lower)
            
            # Bonus for agricultural terms
            ag_terms = ["farming", "agriculture", "crop", "soil", "irrigation", "fertilizer", "pest", "yield"]
            ag_matches = sum(1 for term in ag_terms if term in text_lower)
            
            # Calculate score (0-1 range)
            keyword_score = matches / len(query_words) if query_words else 0
            ag_score = min(ag_matches / 5, 1.0)  # Cap at 1.0
            
            return (keyword_score * 0.7) + (ag_score * 0.3)
            
        except Exception:
            return 0.0
    
    async def close_session(self):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()
            self.session = None

class KnowledgeBase:
    """Agricultural knowledge base with vector search"""
    
    def __init__(self, db_path: str = "farm_knowledge.db"):
        self.db_path = db_path
        self.model = None
        self.index = None
        self.documents = []
        self.document_metadata = []
        
        # Initialize embedding model
        self._init_embedding_model()
        
        # Initialize database
        self._init_database()
        
        # Load existing knowledge
        self._load_knowledge()
    
    def _init_embedding_model(self):
        """Initialize the sentence transformer model"""
        try:
            # Use a smaller, faster model suitable for farming contexts
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Embedding model initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing embedding model: {e}")
            self.model = None
    
    def _init_database(self):
        """Initialize SQLite database for knowledge storage"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS knowledge_documents (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    metadata TEXT,
                    embedding BLOB,
                    timestamp DATETIME,
                    source TEXT,
                    category TEXT
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Knowledge database initialized")
            
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
    
    def _load_knowledge(self):
        """Load existing knowledge from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM knowledge_documents")
            rows = cursor.fetchall()
            
            documents = []
            embeddings = []
            
            for row in rows:
                doc_id, content, metadata_json, embedding_blob, timestamp, source, category = row
                
                # Deserialize metadata
                metadata = json.loads(metadata_json) if metadata_json else {}
                
                # Deserialize embedding
                if embedding_blob:
                    embedding = pickle.loads(embedding_blob)
                    embeddings.append(embedding)
                    documents.append(content)
                    
                    self.document_metadata.append({
                        "id": doc_id,
                        "metadata": metadata,
                        "timestamp": timestamp,
                        "source": source,
                        "category": category
                    })
            
            if embeddings:
                # Create FAISS index
                dimension = len(embeddings[0])
                self.index = faiss.IndexFlatIP(dimension)  # Inner product similarity
                embeddings_array = np.array(embeddings).astype('float32')
                self.index.add(embeddings_array)
                
                logger.info(f"Loaded {len(documents)} documents into knowledge base")
            else:
                # Create empty index
                if self.model:
                    dimension = self.model.get_sentence_embedding_dimension()
                    self.index = faiss.IndexFlatIP(dimension)
                    
            conn.close()
            
        except Exception as e:
            logger.error(f"Error loading knowledge: {e}")
    
    async def add_document(self, doc: RAGDocument) -> bool:
        """Add a document to the knowledge base"""
        try:
            if not self.model or not self.index:
                logger.error("Model or index not initialized")
                return False
            
            # Generate embedding
            embedding = self.model.encode(doc.content)
            doc.embedding = embedding
            
            # Add to FAISS index
            self.index.add(np.array([embedding]).astype('float32'))
            
            # Store in database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO knowledge_documents 
                (id, content, metadata, embedding, timestamp, source, category)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                doc.id,
                doc.content,
                json.dumps(doc.metadata),
                pickle.dumps(embedding),
                doc.timestamp or datetime.now(),
                doc.source,
                doc.category
            ))
            
            conn.commit()
            conn.close()
            
            # Update local metadata
            self.document_metadata.append({
                "id": doc.id,
                "metadata": doc.metadata,
                "timestamp": doc.timestamp,
                "source": doc.source,
                "category": doc.category
            })
            
            logger.info(f"Added document {doc.id} to knowledge base")
            return True
            
        except Exception as e:
            logger.error(f"Error adding document: {e}")
            return False
    
    async def search_similar(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents using vector similarity"""
        try:
            if not self.model or not self.index or self.index.ntotal == 0:
                logger.warning("No documents in knowledge base or model not initialized")
                return []
            
            # Generate query embedding
            query_embedding = self.model.encode(query)
            
            # Search FAISS index
            scores, indices = self.index.search(
                np.array([query_embedding]).astype('float32'), 
                min(k, self.index.ntotal)
            )
            
            results = []
            for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
                if idx < len(self.document_metadata):
                    metadata = self.document_metadata[idx]
                    results.append({
                        "document_id": metadata["id"],
                        "similarity_score": float(score),
                        "metadata": metadata["metadata"],
                        "source": metadata["source"],
                        "category": metadata["category"],
                        "timestamp": metadata["timestamp"]
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching knowledge base: {e}")
            return []
    
    async def get_document_content(self, document_id: str) -> Optional[str]:
        """Get the full content of a document by ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT content FROM knowledge_documents WHERE id = ?", (document_id,))
            result = cursor.fetchone()
            
            conn.close()
            
            return result[0] if result else None
            
        except Exception as e:
            logger.error(f"Error retrieving document content: {e}")
            return None

class ComprehensiveRAGSystem:
    """Main RAG system combining all components"""
    
    def __init__(self):
        self.website_data = WebsiteDataAccess()
        self.web_scraper = WebScrapingService()
        self.knowledge_base = KnowledgeBase()
        
        # Categories for organizing information
        self.categories = {
            "market_data": "Market prices and trading information",
            "farming_tasks": "Agricultural tasks and scheduling",
            "crop_info": "Crop recommendations and guidance",
            "community": "Community discussions and tips",
            "government": "Government schemes and policies",
            "weather": "Weather and environmental data",
            "techniques": "Farming techniques and best practices"
        }
    
    async def initialize_knowledge_base(self):
        """Initialize the knowledge base with website data"""
        try:
            logger.info("Initializing knowledge base with website data...")
            
            # Get data from all website tabs
            data_sources = [
                ("market_prices", await self.website_data.get_market_prices_data()),
                ("tasks", await self.website_data.get_tasks_data()),
                ("crops", await self.website_data.get_crop_recommendations_data()),
                ("community", await self.website_data.get_community_data()),
                ("farm", await self.website_data.get_farm_data()),
                ("schemes", await self.website_data.get_government_schemes_data())
            ]
            
            # Process each data source
            for source_name, data in data_sources:
                if data.get("success"):
                    await self._process_and_store_data(source_name, data["data"])
            
            # Add static farming knowledge
            await self._add_static_farming_knowledge()
            
            logger.info("Knowledge base initialization completed")
            
        except Exception as e:
            logger.error(f"Error initializing knowledge base: {e}")
    
    async def _process_and_store_data(self, source: str, data: Dict[str, Any]):
        """Process and store data from a specific source"""
        try:
            # Convert data to searchable documents
            if source == "market_prices" and "data" in data:
                for item in data["data"][:10]:  # Limit to prevent overflow
                    content = f"""
                    Commodity: {item.get('commodity', 'Unknown')}
                    Price: ₹{item.get('currentPrice', 0)} per {item.get('unit', 'unit')}
                    Market: {item.get('market', 'Unknown')}
                    State: {item.get('state', 'Unknown')}
                    Quality: {item.get('quality', 'Standard')}
                    Trend: {item.get('trend', 'stable')}
                    Last Updated: {item.get('lastUpdated', 'Unknown')}
                    """
                    
                    doc = RAGDocument(
                        id=f"market_{item.get('id', 'unknown')}",
                        content=content.strip(),
                        metadata=item,
                        timestamp=datetime.now(),
                        source=source,
                        category="market_data"
                    )
                    await self.knowledge_base.add_document(doc)
            
            elif source == "tasks" and "active_tasks" in data:
                for task in data["active_tasks"]:
                    content = f"""
                    Task: {task.get('title', 'Unknown Task')}
                    Priority: {task.get('priority', 'normal')}
                    Due: {task.get('due', 'No deadline')}
                    Status: {task.get('status', 'active')}
                    """
                    
                    doc = RAGDocument(
                        id=f"task_{task.get('id', 'unknown')}",
                        content=content.strip(),
                        metadata=task,
                        timestamp=datetime.now(),
                        source=source,
                        category="farming_tasks"
                    )
                    await self.knowledge_base.add_document(doc)
            
            elif source == "crops" and "recommended_crops" in data:
                for crop in data["recommended_crops"]:
                    content = f"""
                    Crop: {crop.get('name', 'Unknown')}
                    Season: {crop.get('season', 'Unknown')}
                    Suitability: {crop.get('suitability', 0)}%
                    Expected Yield: {crop.get('expected_yield', 'Unknown')}
                    """
                    
                    doc = RAGDocument(
                        id=f"crop_{crop.get('name', 'unknown').lower().replace(' ', '_')}",
                        content=content.strip(),
                        metadata=crop,
                        timestamp=datetime.now(),
                        source=source,
                        category="crop_info"
                    )
                    await self.knowledge_base.add_document(doc)
            
            # Add other data processing logic for community, farm, schemes
            
        except Exception as e:
            logger.error(f"Error processing data from {source}: {e}")
    
    async def _add_static_farming_knowledge(self):
        """Add static farming knowledge to the knowledge base"""
        try:
            static_knowledge = [
                {
                    "id": "irrigation_best_practices",
                    "content": """
                    Irrigation Best Practices:
                    - Water early morning or late evening to reduce evaporation
                    - Check soil moisture before irrigating
                    - Use drip irrigation for water conservation
                    - Avoid overwatering which can cause root rot
                    - Consider crop water requirements and growth stage
                    """,
                    "category": "techniques"
                },
                {
                    "id": "pest_control_organic",
                    "content": """
                    Organic Pest Control Methods:
                    - Use neem oil as natural pesticide
                    - Introduce beneficial insects like ladybugs
                    - Plant companion crops that repel pests
                    - Regular field inspection for early detection
                    - Use pheromone traps for monitoring
                    """,
                    "category": "techniques"
                },
                {
                    "id": "soil_health_indicators",
                    "content": """
                    Soil Health Indicators:
                    - pH level should be 6.0-7.5 for most crops
                    - Organic matter content above 3%
                    - Good soil structure and drainage
                    - Presence of earthworms indicates healthy soil
                    - Regular soil testing recommended
                    """,
                    "category": "techniques"
                }
            ]
            
            for knowledge in static_knowledge:
                doc = RAGDocument(
                    id=knowledge["id"],
                    content=knowledge["content"].strip(),
                    metadata={"type": "static_knowledge"},
                    timestamp=datetime.now(),
                    source="static",
                    category=knowledge["category"]
                )
                await self.knowledge_base.add_document(doc)
                
        except Exception as e:
            logger.error(f"Error adding static knowledge: {e}")
    
    async def query_comprehensive(self, query: str, include_web_search: bool = True) -> Dict[str, Any]:
        """Comprehensive query that searches knowledge base and web if needed"""
        try:
            # Search knowledge base first
            kb_results = await self.knowledge_base.search_similar(query, k=5)
            
            response = {
                "query": query,
                "knowledge_base_results": kb_results,
                "web_search_results": [],
                "market_data": None,
                "recommendations": [],
                "timestamp": datetime.now()
            }
            
            # If knowledge base results are insufficient, search web
            if include_web_search and len(kb_results) < 3:
                web_results = await self.web_scraper.search_agricultural_web(query)
                if web_results.get("success"):
                    response["web_search_results"] = web_results["results"][:3]
            
            # Check if query is market-related and get fresh data
            market_keywords = ["price", "market", "cost", "sell", "buy", "commodity"]
            if any(keyword in query.lower() for keyword in market_keywords):
                market_data = await self.website_data.get_market_prices_data()
                if market_data.get("success"):
                    response["market_data"] = market_data["data"]
            
            # Generate recommendations based on query type
            response["recommendations"] = await self._generate_recommendations(query, kb_results)
            
            return response
            
        except Exception as e:
            logger.error(f"Error in comprehensive query: {e}")
            return {
                "query": query,
                "error": str(e),
                "timestamp": datetime.now()
            }
    
    async def _generate_recommendations(self, query: str, kb_results: List[Dict]) -> List[str]:
        """Generate contextual recommendations based on query and results"""
        try:
            recommendations = []
            
            # Analyze query type
            query_lower = query.lower()
            
            if "price" in query_lower or "market" in query_lower:
                recommendations.extend([
                    "Check the market prices tab for live commodity rates",
                    "Use the web scraper to get fresh market data",
                    "Compare prices across different markets and states"
                ])
            
            if "crop" in query_lower or "plant" in query_lower:
                recommendations.extend([
                    "Visit the crop recommendations page for personalized suggestions",
                    "Check current season suitability for your location",
                    "Review soil conditions before planting"
                ])
            
            if "task" in query_lower or "schedule" in query_lower:
                recommendations.extend([
                    "Check your tasks page for current farming activities",
                    "Set reminders for time-sensitive activities",
                    "Prioritize tasks based on weather conditions"
                ])
            
            if "scheme" in query_lower or "government" in query_lower or "subsidy" in query_lower:
                recommendations.extend([
                    "Visit the government schemes page for available programs",
                    "Check eligibility criteria for each scheme",
                    "Apply online through official portals"
                ])
            
            # Add general recommendations if no specific category
            if not recommendations:
                recommendations = [
                    "Explore different tabs on the website for comprehensive information",
                    "Use the community feature to connect with other farmers",
                    "Keep your farm profile updated for better recommendations"
                ]
            
            return recommendations[:3]  # Limit to top 3 recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return []
    
    async def update_market_data_live(self) -> Dict[str, Any]:
        """Trigger live market data scraping and update knowledge base"""
        try:
            # Scrape fresh market data
            scrape_result = await self.web_scraper.scrape_market_prices_live()
            
            if scrape_result.get("success"):
                # Update knowledge base with fresh data
                await self._process_and_store_data("market_prices", {"data": scrape_result["data"]})
                
                return {
                    "success": True,
                    "total_records": scrape_result.get("total_records", 0),
                    "sources": scrape_result.get("sources", []),
                    "scraping_time": scrape_result.get("scraping_time", 0),
                    "message": "Market data updated successfully"
                }
            else:
                return {
                    "success": False,
                    "error": scrape_result.get("error", "Unknown error")
                }
                
        except Exception as e:
            logger.error(f"Error updating market data: {e}")
            return {"success": False, "error": str(e)}
    
    async def close_all_sessions(self):
        """Close all active sessions"""
        try:
            await self.website_data.close_session()
            await self.web_scraper.close_session()
            logger.info("All sessions closed successfully")
        except Exception as e:
            logger.error(f"Error closing sessions: {e}")

# Global RAG system instance
rag_system = None

async def get_rag_system() -> ComprehensiveRAGSystem:
    """Get or create the global RAG system instance"""
    global rag_system
    if rag_system is None:
        rag_system = ComprehensiveRAGSystem()
        await rag_system.initialize_knowledge_base()
    return rag_system

async def cleanup_rag_system():
    """Cleanup RAG system resources"""
    global rag_system
    if rag_system:
        await rag_system.close_all_sessions()
        rag_system = None
