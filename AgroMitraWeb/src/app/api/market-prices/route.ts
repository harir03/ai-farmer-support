import { NextRequest, NextResponse } from 'next/server';
import { MarketScraper, type MarketPrice } from '@/lib/marketScraper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldScrape = searchParams.get('scrape') === 'true';
    const state = searchParams.get('state') || '';
    const commodity = searchParams.get('commodity') || '';
    const category = searchParams.get('category') || '';

    const scraper = MarketScraper.getInstance();

    // If scraping is requested, perform web scraping
    if (shouldScrape) {
      console.log('Starting web scraping for market prices...');
      
      const scrapedResult = await scraper.scrapeMarketPrices();
      
      if (!scrapedResult.success) {
        return NextResponse.json({
          success: false,
          error: 'Web scraping failed',
          message: scrapedResult.errors?.join(', ') || 'Unknown scraping error',
          scrapingTime: scrapedResult.scrapingTime
        }, { status: 500 });
      }

      // Apply filters to scraped data
      let filteredData = scrapedResult.data;

      if (state && state !== 'all') {
        filteredData = filteredData.filter(item => 
          item.state?.toLowerCase().includes(state.toLowerCase())
        );
      }

      if (commodity && commodity !== 'all') {
        filteredData = filteredData.filter(item => 
          item.commodity.toLowerCase().includes(commodity.toLowerCase())
        );
      }

      if (category && category !== 'all') {
        filteredData = filteredData.filter(item => 
          item.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        total: filteredData.length,
        scrapedFrom: scrapedResult.scrapedFrom,
        scrapingTime: scrapedResult.scrapingTime,
        totalRecordsScraped: scrapedResult.totalRecords,
        message: `Successfully scraped ${scrapedResult.totalRecords} records from ${scrapedResult.scrapedFrom.length} sources`,
        errors: scrapedResult.errors
      });
    }

    // Return cached/sample data if not scraping
    const commodityDb = scraper.getCommodityDatabase();
    const sampleData = generateSampleData(commodityDb, state, commodity, category);

    return NextResponse.json({
      success: true,
      data: sampleData,
      total: sampleData.length,
      message: 'Sample data returned. Click "Refresh Prices" to scrape live data.',
      cached: true
    });

  } catch (error) {
    console.error('Market prices API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch market prices',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Generate sample data for initial display
function generateSampleData(commodityDb: any, state: string, commodity: string, category: string) {
  const sampleData = [];
  const commodities = Object.keys(commodityDb);
  
  for (let i = 0; i < Math.min(20, commodities.length); i++) {
    const commodityName = commodities[i];
    const commodityInfo = commodityDb[commodityName];
    
    // Apply filters
    if (commodity && commodity !== 'all' && !commodityName.toLowerCase().includes(commodity.toLowerCase())) {
      continue;
    }
    
    if (category && category !== 'all' && !commodityInfo.category.toLowerCase().includes(category.toLowerCase())) {
      continue;
    }
    
    const randomState = commodityInfo.states[Math.floor(Math.random() * commodityInfo.states.length)];
    
    if (state && state !== 'all' && !randomState.toLowerCase().includes(state.toLowerCase())) {
      continue;
    }
    
    const variety = commodityInfo.varieties[Math.floor(Math.random() * commodityInfo.varieties.length)];
    const [minRange, maxRange] = commodityInfo.avgPriceRange;
    const price = Math.round(minRange + Math.random() * (maxRange - minRange));
    const change = Math.round((Math.random() - 0.5) * 400);
    const changePercent = price > 0 ? Math.round((change / price) * 10000) / 100 : 0;
    
    sampleData.push({
      id: `sample-${i + 1}`,
      commodity: commodityName,
      category: commodityInfo.category,
      currentPrice: price,
      minPrice: Math.round(price * 0.9),
      maxPrice: Math.round(price * 1.1),
      modalPrice: price,
      unit: commodityInfo.unit,
      change,
      changePercent,
      market: `${randomState} APMC`,
      state: randomState,
      district: `${randomState} District`,
      quality: variety,
      grade: 'FAQ',
      lastUpdated: `${Math.floor(Math.random() * 60)} minutes ago`,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      volume: `${Math.floor(50 + Math.random() * 500)} quintals`,
      forecast: changePercent > 2 ? 'bullish' : changePercent < -2 ? 'bearish' : 'neutral',
      commodityCode: Math.floor(10 + Math.random() * 90).toString(),
      arrivalDate: new Date().toLocaleDateString('en-IN')
    });
  }
  
  return sampleData;
}