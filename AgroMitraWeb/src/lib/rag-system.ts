import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

const supabase = createClient(supabaseUrl, supabaseKey);

export interface FarmingKnowledge {
  id: string;
  content: string;
  category: 'crops' | 'pests' | 'diseases' | 'weather' | 'soil' | 'irrigation' | 'harvesting' | 'storage' | 'market';
  language: string;
  embedding?: number[];
}

export class RAGSystem {
  private knowledgeBase: FarmingKnowledge[] = [
    // Crop Management
    {
      id: 'crop-rice-1',
      content: 'Rice cultivation requires flooded fields for optimal growth. Plant rice seedlings 2-3 weeks old in rows 20cm apart. Water levels should be maintained at 2-5cm throughout growing season.',
      category: 'crops',
      language: 'en'
    },
    {
      id: 'crop-wheat-1',
      content: 'Wheat should be sown in November-December in tropical regions. Optimal spacing is 22.5cm between rows. Water requirement is 450-650mm throughout crop cycle.',
      category: 'crops',
      language: 'en'
    },
    {
      id: 'crop-maize-1',
      content: 'Maize (corn) thrives in well-drained soil with pH 6.0-7.5. Plant seeds 60cm apart in rows. Harvest when moisture content is 20-25% for optimal yield.',
      category: 'crops',
      language: 'en'
    },
    
    // Disease Management
    {
      id: 'disease-blight-1',
      content: 'Late blight in potatoes appears as dark spots on leaves. Prevent with copper-based fungicides. Ensure good air circulation and avoid overhead watering.',
      category: 'diseases',
      language: 'en'
    },
    {
      id: 'disease-rust-1',
      content: 'Wheat rust shows orange pustules on leaves. Apply propiconazole fungicide at first sign. Use resistant varieties when possible.',
      category: 'diseases',
      language: 'en'
    },
    
    // Pest Control
    {
      id: 'pest-aphids-1',
      content: 'Aphids cluster on new growth and undersides of leaves. Control with neem oil spray or introduce ladybugs as natural predators.',
      category: 'pests',
      language: 'en'
    },
    {
      id: 'pest-bollworm-1',
      content: 'Cotton bollworm damages cotton bolls and other crops. Use pheromone traps for monitoring and Bt cotton varieties for resistance.',
      category: 'pests',
      language: 'en'
    },
    
    // Soil Management
    {
      id: 'soil-ph-1',
      content: 'Soil pH affects nutrient availability. Most crops prefer pH 6.0-7.0. Add lime to increase pH or sulfur to decrease pH gradually.',
      category: 'soil',
      language: 'en'
    },
    {
      id: 'soil-organic-1',
      content: 'Organic matter improves soil structure and water retention. Add compost, manure, or green manure crops to increase organic content.',
      category: 'soil',
      language: 'en'
    },
    
    // Weather & Climate
    {
      id: 'weather-monsoon-1',
      content: 'Monsoon timing is crucial for crop planning. Early monsoon favors rice and sugarcane. Delayed monsoon may require drought-resistant varieties.',
      category: 'weather',
      language: 'en'
    },
    {
      id: 'weather-frost-1',
      content: 'Protect crops from frost using water spraying, smoke, or row covers. Plant frost-sensitive crops after last frost date.',
      category: 'weather',
      language: 'en'
    },
    
    // Irrigation
    {
      id: 'irrigation-drip-1',
      content: 'Drip irrigation saves 30-50% water compared to flood irrigation. Best for high-value crops like vegetables and fruits.',
      category: 'irrigation',
      language: 'en'
    },
    {
      id: 'irrigation-timing-1',
      content: 'Water crops early morning or evening to reduce evaporation. Critical watering periods include flowering and fruit development stages.',
      category: 'irrigation',
      language: 'en'
    }
  ];

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return [];
    }
  }

  async initializeKnowledgeBase(): Promise<void> {
    // In a real implementation, this would populate the Supabase vector database
    // For now, we'll use in-memory search with cosine similarity
    console.log('Knowledge base initialized with', this.knowledgeBase.length, 'entries');
  }

  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async searchKnowledge(query: string, category?: string, limit: number = 5): Promise<FarmingKnowledge[]> {
    try {
      // For demonstration, using keyword-based search
      // In production, use vector similarity search
      const keywords = query.toLowerCase().split(' ');
      
      let filteredKnowledge = this.knowledgeBase;
      if (category) {
        filteredKnowledge = this.knowledgeBase.filter(kb => kb.category === category);
      }

      const scoredResults = filteredKnowledge.map(kb => {
        const content = kb.content.toLowerCase();
        const score = keywords.reduce((acc, keyword) => {
          if (content.includes(keyword)) {
            return acc + 1;
          }
          return acc;
        }, 0);
        return { ...kb, score };
      });

      return scoredResults
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error searching knowledge:', error);
      return [];
    }
  }

  async getRelevantContext(userQuery: string, userContext?: any): Promise<string> {
    const relevantKnowledge = await this.searchKnowledge(userQuery, undefined, 3);
    
    if (relevantKnowledge.length === 0) {
      return "I don't have specific information about that topic in my knowledge base.";
    }

    const context = relevantKnowledge
      .map(kb => kb.content)
      .join('\n\n');

    return `Based on my farming knowledge:\n\n${context}`;
  }

  async addKnowledge(knowledge: Omit<FarmingKnowledge, 'id'>): Promise<void> {
    const id = Date.now().toString();
    this.knowledgeBase.push({ ...knowledge, id });
  }
}

export const ragSystem = new RAGSystem();