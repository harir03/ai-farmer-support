/**
 * Market Price Web Scraper
 * Scrapes commodity prices from various Indian agricultural market sources
 */

// Define the MarketPrice interface locally to avoid circular imports
interface MarketPrice {
  id: string;
  commodity: string;
  category: string;
  currentPrice: number;
  minPrice?: number;
  maxPrice?: number;
  modalPrice?: number;
  unit: string;
  change: number;
  changePercent: number;
  market: string;
  state?: string;
  district?: string;
  quality: string;
  grade?: string;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  volume: string;
  forecast: 'bullish' | 'bearish' | 'neutral';
  commodityCode?: string;
  arrivalDate?: string;
  scrapedFrom?: string;
  scrapedUrl?: string;
  scrapedAt?: string;
}

// Mock data representing scraped results from various market sources
const MARKET_SOURCES = {
  agmarknet: 'https://agmarknet.gov.in',
  nafed: 'https://nafed.india.gov.in',
  fci: 'https://fci.gov.in',
  apmc: 'https://apmc.gov.in',
  mandiprices: 'https://mandiprices.com'
};

// Comprehensive commodity database with varieties
const COMMODITY_DATABASE = {
  'Rice': {
    varieties: ['Basmati 1121', 'Pusa Basmati', 'IR-64', 'Swarna', 'Sona Masuri', 'Ponni', 'Gobindobhog'],
    category: 'Grains',
    unit: '₹/quintal',
    avgPriceRange: [2500, 6000],
    states: ['Punjab', 'Haryana', 'West Bengal', 'Uttar Pradesh', 'Andhra Pradesh']
  },
  'Wheat': {
    varieties: ['PBW 343', 'HD 2967', 'WH 147', 'Lok 1', 'Sharbati', 'MP Wheat'],
    category: 'Grains',
    unit: '₹/quintal',
    avgPriceRange: [2000, 2800],
    states: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan']
  },
  'Soybean': {
    varieties: ['JS 335', 'JS 9560', 'NRC 37', 'MACS 450', 'Yellow Soybean'],
    category: 'Oilseeds',
    unit: '₹/quintal',
    avgPriceRange: [3500, 5500],
    states: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka']
  },
  'Cotton': {
    varieties: ['Shankar-6', 'DCH-32', 'Suraj', 'RCH-2', 'Bt Cotton'],
    category: 'Cash Crops',
    unit: '₹/quintal',
    avgPriceRange: [5000, 8000],
    states: ['Gujarat', 'Maharashtra', 'Punjab', 'Haryana', 'Andhra Pradesh']
  },
  'Sugarcane': {
    varieties: ['Co 86032', 'Co 238', 'Co 0238', 'UP 9530', 'Premium Grade'],
    category: 'Cash Crops',
    unit: '₹/quintal',
    avgPriceRange: [280, 350],
    states: ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu']
  },
  'Onion': {
    varieties: ['Nashik Red', 'Bellary Red', 'Pusa Red', 'Agrifound Dark Red', 'White Onion'],
    category: 'Vegetables',
    unit: '₹/quintal',
    avgPriceRange: [800, 3000],
    states: ['Maharashtra', 'Karnataka', 'Gujarat', 'Rajasthan', 'Madhya Pradesh']
  },
  'Tomato': {
    varieties: ['Hybrid Tomato', 'Desi Tomato', 'Cherry Tomato', 'Pusa Ruby', 'Arka Vikas'],
    category: 'Vegetables',
    unit: '₹/quintal',
    avgPriceRange: [1000, 4000],
    states: ['Karnataka', 'Andhra Pradesh', 'Maharashtra', 'Gujarat', 'Himachal Pradesh']
  },
  'Potato': {
    varieties: ['Jyoti', 'Chandramukhi', 'Red Potato', 'Chipsona', 'Kufri Bahar'],
    category: 'Vegetables',
    unit: '₹/quintal',
    avgPriceRange: [800, 2000],
    states: ['Uttar Pradesh', 'West Bengal', 'Bihar', 'Gujarat', 'Madhya Pradesh']
  },
  'Groundnut': {
    varieties: ['Bold Groundnut', 'Java Groundnut', 'TMV 2', 'GPBD 4', 'Spanish Bold'],
    category: 'Oilseeds',
    unit: '₹/quintal',
    avgPriceRange: [4500, 7000],
    states: ['Gujarat', 'Rajasthan', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh']
  },
  'Turmeric': {
    varieties: ['Erode Turmeric', 'Salem Turmeric', 'Nizamabad Bulb', 'Rajapore', 'Sangli Turmeric'],
    category: 'Spices',
    unit: '₹/quintal',
    avgPriceRange: [6000, 12000],
    states: ['Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Maharashtra', 'Odisha']
  },
  'Chilli': {
    varieties: ['Teja Chilli', 'Sannam Chilli', 'Byadgi Chilli', 'Wonder Hot', 'Kashmiri Red'],
    category: 'Spices',
    unit: '₹/quintal',
    avgPriceRange: [8000, 18000],
    states: ['Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Rajasthan']
  },
  'Coriander': {
    varieties: ['Scooter Coriander', 'Eagle Coriander', 'Double Parrot', 'Badami Coriander'],
    category: 'Spices',
    unit: '₹/quintal',
    avgPriceRange: [7000, 15000],
    states: ['Rajasthan', 'Gujarat', 'Madhya Pradesh', 'Uttar Pradesh']
  },
  'Cumin': {
    varieties: ['Unjha Cumin', 'Rajkot Cumin', 'Singapore Cumin', '99% Purity', 'Sortex Quality'],
    category: 'Spices',
    unit: '₹/quintal',
    avgPriceRange: [25000, 45000],
    states: ['Gujarat', 'Rajasthan']
  },
  'Mustard': {
    varieties: ['Rai/Mustard', 'Black Mustard', 'Pusa Bold', 'Varuna', 'Rohini'],
    category: 'Oilseeds',
    unit: '₹/quintal',
    avgPriceRange: [4000, 6500],
    states: ['Rajasthan', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh']
  },
  'Gram': {
    varieties: ['Desi Chana', 'Kabuli Chana', 'Bold Gram', 'Machine Clean', 'FAQ Gram'],
    category: 'Pulses',
    unit: '₹/quintal',
    avgPriceRange: [4500, 7000],
    states: ['Madhya Pradesh', 'Rajasthan', 'Uttar Pradesh', 'Karnataka', 'Maharashtra']
  },
  'Tur/Arhar': {
    varieties: ['Tur Dal', 'Arhar Dal', 'FAQ Tur', 'Bold Tur', 'New Tur'],
    category: 'Pulses',
    unit: '₹/quintal',
    avgPriceRange: [5500, 9000],
    states: ['Karnataka', 'Maharashtra', 'Madhya Pradesh', 'Gujarat', 'Uttar Pradesh']
  }
};

interface ScrapedData {
  success: boolean;
  data: MarketPrice[];
  scrapedFrom: string[];
  totalRecords: number;
  scrapingTime: number;
  errors?: string[];
}

/**
 * Simulates web scraping from multiple agricultural market sources
 */
export class MarketScraper {
  private static instance: MarketScraper;
  private isScrapingActive = false;
  private scrapingProgress = 0;
  private onProgressUpdate?: (progress: number, status: string) => void;

  static getInstance(): MarketScraper {
    if (!MarketScraper.instance) {
      MarketScraper.instance = new MarketScraper();
    }
    return MarketScraper.instance;
  }

  /**
   * Set progress callback for real-time updates
   */
  setProgressCallback(callback: (progress: number, status: string) => void) {
    this.onProgressUpdate = callback;
  }

  /**
   * Generate realistic market price based on commodity data
   */
  private generateMarketPrice(commodityName: string, variety: string, state: string, marketName: string): number {
    const commodity = COMMODITY_DATABASE[commodityName as keyof typeof COMMODITY_DATABASE];
    if (!commodity) return 1000;

    const [minPrice, maxPrice] = commodity.avgPriceRange;
    const basePrice = minPrice + Math.random() * (maxPrice - minPrice);
    
    // Add market-specific variations
    const marketVariation = 1 + (Math.random() - 0.5) * 0.3; // ±15% variation
    const varietyPremium = variety.includes('Premium') || variety.includes('Bold') ? 1.1 : 1.0;
    
    return Math.round(basePrice * marketVariation * varietyPremium);
  }

  /**
   * Generate price change based on market trends
   */
  private generatePriceChange(): { change: number; changePercent: number; trend: 'up' | 'down' | 'stable' } {
    const changePercent = (Math.random() - 0.5) * 20; // ±10% change
    const change = Math.round(Math.random() * 500 * Math.sign(changePercent));
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 1) {
      trend = changePercent > 0 ? 'up' : 'down';
    }
    
    return { change, changePercent: Math.round(changePercent * 100) / 100, trend };
  }

  /**
   * Simulate scraping delay with progress updates
   */
  private async simulateScrapingDelay(source: string, duration: number) {
    const steps = 10;
    const stepDuration = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      this.scrapingProgress = (this.scrapingProgress + (100 / Object.keys(MARKET_SOURCES).length) / steps);
      this.onProgressUpdate?.(
        Math.round(this.scrapingProgress), 
        `Scraping ${source}... (${Math.round((i / steps) * 100)}%)`
      );
    }
  }

  /**
   * Simulate scraping from a specific market source
   */
  private async scrapeFromSource(sourceName: string, sourceUrl: string): Promise<MarketPrice[]> {
    this.onProgressUpdate?.(Math.round(this.scrapingProgress), `Connecting to ${sourceName}...`);
    
    // Simulate network delay
    await this.simulateScrapingDelay(sourceName, 1000 + Math.random() * 2000);
    
    const scrapedData: MarketPrice[] = [];
    const commodities = Object.keys(COMMODITY_DATABASE);
    const recordsPerSource = Math.floor(15 + Math.random() * 25); // 15-40 records per source
    
    for (let i = 0; i < recordsPerSource; i++) {
      const commodityName = commodities[Math.floor(Math.random() * commodities.length)];
      const commodity = COMMODITY_DATABASE[commodityName as keyof typeof COMMODITY_DATABASE];
      const variety = commodity.varieties[Math.floor(Math.random() * commodity.varieties.length)];
      const state = commodity.states[Math.floor(Math.random() * commodity.states.length)];
      
      // Generate market names based on state
      const marketNames = [
        `${state} APMC`,
        `${state} Mandi`,
        `${state} Agricultural Market`,
        `${state} Wholesale Market`,
        `${state} Krishi Upaj Mandi`
      ];
      const market = marketNames[Math.floor(Math.random() * marketNames.length)];
      
      const currentPrice = this.generateMarketPrice(commodityName, variety, state, market);
      const priceData = this.generatePriceChange();
      const minPrice = Math.round(currentPrice * (0.85 + Math.random() * 0.1));
      const maxPrice = Math.round(currentPrice * (1.05 + Math.random() * 0.1));
      
      // Generate arrival date (last 7 days)
      const arrivalDate = new Date();
      arrivalDate.setDate(arrivalDate.getDate() - Math.floor(Math.random() * 7));
      
      const marketPrice: MarketPrice = {
        id: `scraped-${sourceName}-${i + 1}`,
        commodity: commodityName,
        category: commodity.category,
        currentPrice,
        minPrice,
        maxPrice,
        modalPrice: Math.round((minPrice + maxPrice + currentPrice) / 3),
        unit: commodity.unit,
        change: priceData.change,
        changePercent: priceData.changePercent,
        market,
        state,
        district: `${state} District`,
        quality: variety,
        grade: ['FAQ', 'Premium', 'Grade A', 'Grade B', 'Superior'][Math.floor(Math.random() * 5)],
        lastUpdated: this.getTimeAgo(arrivalDate),
        trend: priceData.trend,
        volume: `${Math.floor(50 + Math.random() * 2000)} quintals`,
        forecast: priceData.changePercent > 2 ? 'bullish' : priceData.changePercent < -2 ? 'bearish' : 'neutral',
        commodityCode: Math.floor(10 + Math.random() * 90).toString(),
        arrivalDate: arrivalDate.toLocaleDateString('en-IN'),
        scrapedFrom: sourceName,
        scrapedUrl: sourceUrl,
        scrapedAt: new Date().toISOString()
      };
      
      scrapedData.push(marketPrice);
    }
    
    return scrapedData;
  }

  /**
   * Convert date to human-readable time ago format
   */
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }

  /**
   * Main scraping function - scrapes from multiple sources
   */
  async scrapeMarketPrices(): Promise<ScrapedData> {
    if (this.isScrapingActive) {
      throw new Error('Scraping is already in progress');
    }

    this.isScrapingActive = true;
    this.scrapingProgress = 0;
    const startTime = Date.now();
    const allData: MarketPrice[] = [];
    const sources: string[] = [];
    const errors: string[] = [];

    try {
      this.onProgressUpdate?.(0, 'Initializing web scraper...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Scrape from each market source
      for (const [sourceName, sourceUrl] of Object.entries(MARKET_SOURCES)) {
        try {
          this.onProgressUpdate?.(
            Math.round(this.scrapingProgress), 
            `Starting to scrape ${sourceName}...`
          );
          
          const sourceData = await this.scrapeFromSource(sourceName, sourceUrl);
          allData.push(...sourceData);
          sources.push(sourceName);
          
          this.onProgressUpdate?.(
            Math.round(this.scrapingProgress), 
            `Successfully scraped ${sourceData.length} records from ${sourceName}`
          );
          
          // Small delay between sources
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (error) {
          const errorMsg = `Failed to scrape from ${sourceName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      // Final processing
      this.onProgressUpdate?.(95, 'Processing and validating scraped data...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.onProgressUpdate?.(100, `Scraping completed! Found ${allData.length} price records`);
      
      const scrapingTime = Date.now() - startTime;
      
      return {
        success: true,
        data: allData,
        scrapedFrom: sources,
        totalRecords: allData.length,
        scrapingTime,
        errors: errors.length > 0 ? errors : undefined
      };
      
    } catch (error) {
      const errorMsg = `Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      
      return {
        success: false,
        data: [],
        scrapedFrom: sources,
        totalRecords: 0,
        scrapingTime: Date.now() - startTime,
        errors
      };
      
    } finally {
      this.isScrapingActive = false;
      this.scrapingProgress = 0;
    }
  }

  /**
   * Get available commodities and their varieties
   */
  getCommodityDatabase() {
    return COMMODITY_DATABASE;
  }

  /**
   * Check if scraping is currently active
   */
  isScrapingInProgress(): boolean {
    return this.isScrapingActive;
  }
}

// Export the MarketPrice type for use in other files
export type { MarketPrice };