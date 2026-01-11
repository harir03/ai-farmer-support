"use client";

import React, { useState, useEffect } from 'react';
import { componentClasses } from '@/lib/theme';
import { StatsCard, InfoCard, InstructionCard } from '@/components/ui/Cards';
import { uiTranslations, getUIText, speakInLanguage, speakInEnglish } from '@/lib/uiTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

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

interface PriceAlert {
  id: string;
  commodity: string;
  targetPrice: number;
  currentPrice: number;
  alertType: 'above' | 'below';
  isActive: boolean;
}

export default function MarketPricesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCommodityInfo, setSelectedCommodityInfo] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('commodity');
  const [showAlerts, setShowAlerts] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [scrapingStatus, setScrapingStatus] = useState('');
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapingResults, setScrapingResults] = useState<{
    totalRecords: number;
    scrapedFrom: string[];
    scrapingTime: number;
  } | null>(null);
  const { language } = useLanguage();

  // Fetch market prices using web scraper
  const fetchMarketPrices = async (shouldScrape = false) => {
    setLoading(true);
    setError('');
    setScrapingProgress(0);
    setScrapingStatus('');
    setIsScrapingActive(shouldScrape);
    setScrapingResults(null);

    try {
      const params = new URLSearchParams();

      if (shouldScrape) {
        params.append('scrape', 'true');
      }

      if (selectedState !== 'all') {
        params.append('state', selectedState);
      }

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      // Simulate progress updates during scraping
      if (shouldScrape) {
        setScrapingStatus('Initializing web scraper...');

        // Setup progress tracking via polling or websocket in real implementation
        const progressInterval = setInterval(() => {
          setScrapingProgress(prev => {
            const newProgress = Math.min(prev + Math.random() * 15, 95);
            if (newProgress < 30) setScrapingStatus('Connecting to market websites...');
            else if (newProgress < 60) setScrapingStatus('Scraping commodity data...');
            else if (newProgress < 90) setScrapingStatus('Processing scraped information...');
            else setScrapingStatus('Finalizing results...');
            return newProgress;
          });
        }, 200);

        const response = await fetch(`/api/market-prices?${params}`);
        const result = await response.json();

        clearInterval(progressInterval);
        setScrapingProgress(100);
        setScrapingStatus('Scraping completed!');

        if (result.success) {
          setMarketPrices(result.data);
          setScrapingResults({
            totalRecords: result.totalRecordsScraped || result.total,
            scrapedFrom: result.scrapedFrom || [],
            scrapingTime: result.scrapingTime || 0
          });

          if (result.errors && result.errors.length > 0) {
            setError(`Warning: ${result.errors.join(', ')}`);
          }
        } else {
          setError(result.message || 'Failed to scrape market prices');
          setMarketPrices([]);
        }
      } else {
        // Load cached/sample data
        const response = await fetch(`/api/market-prices?${params}`);
        const result = await response.json();

        if (result.success) {
          setMarketPrices(result.data);
        } else {
          setError(result.message || 'Failed to load market prices');
          setMarketPrices([]);
        }
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching market prices:', err);
      setMarketPrices([]);
    } finally {
      setLoading(false);
      setIsScrapingActive(false);
    }
  };

  // Load initial sample data on component mount
  useEffect(() => {
    fetchMarketPrices(false); // Load sample data initially
  }, []);

  // Update data when filters change (but don't re-scrape automatically)
  useEffect(() => {
    if (marketPrices.length > 0 && !isScrapingActive) {
      // Only re-fetch if we have existing data and aren't currently scraping
      fetchMarketPrices(false);
    }
  }, [selectedState, selectedCategory]);

  const priceAlerts: PriceAlert[] = [
    {
      id: '1',
      commodity: 'Wheat',
      targetPrice: 2200,
      currentPrice: 2180,
      alertType: 'above',
      isActive: true
    },
    {
      id: '2',
      commodity: 'Rice (Basmati)',
      targetPrice: 4000,
      currentPrice: 4250,
      alertType: 'below',
      isActive: true
    },
    {
      id: '3',
      commodity: 'Tomatoes',
      targetPrice: 2000,
      currentPrice: 1850,
      alertType: 'above',
      isActive: true
    }
  ];

  const filteredPrices = marketPrices.filter(price => {
    const categoryMatch = selectedCategory === 'all' || price.category.toLowerCase() === selectedCategory.toLowerCase();
    const marketMatch = selectedMarket === 'all' || price.market.toLowerCase().includes(selectedMarket.toLowerCase());
    const stateMatch = selectedState === 'all' || (price.state && price.state.toLowerCase().includes(selectedState.toLowerCase()));
    return categoryMatch && marketMatch && stateMatch;
  });

  // Get unique states for filter dropdown
  const availableStates = ['all', ...Array.from(new Set(marketPrices.map(p => p.state).filter(Boolean)))];

  // Get unique categories for filter dropdown
  const availableCategories = ['all', ...Array.from(new Set(marketPrices.map(p => p.category).filter(Boolean)))];

  // Get unique markets for filter dropdown
  const availableMarkets = ['all', ...Array.from(new Set(marketPrices.map(p => p.market).filter(Boolean)))];

  // Sort filtered prices
  const sortedPrices = filteredPrices.sort((a, b) => {
    switch (sortBy) {
      case 'commodity':
        return a.commodity.localeCompare(b.commodity);
      case 'price':
        return b.currentPrice - a.currentPrice;
      case 'change':
        return Math.abs(b.changePercent) - Math.abs(a.changePercent);
      case 'market':
        return a.market.localeCompare(b.market);
      default:
        return 0;
    }
  });

  const marketStats = {
    totalCommodities: marketPrices.length,
    pricesUp: marketPrices.filter(p => p.trend === 'up').length,
    pricesDown: marketPrices.filter(p => p.trend === 'down').length,
    activeAlerts: priceAlerts.filter(a => a.isActive).length,
  };

  // Voice announcement on page load (uses selected language)
  useEffect(() => {
    if (isVoiceEnabled) {
      const timer = setTimeout(() => {
        const welcomeText = language === 'hi'
          ? 'बाज़ार मूल्य में आपका स्वागत है। यहाँ नवीनतम कीमतें हैं।'
          : 'Welcome to Market Prices. Here are the latest commodity prices.';
        speakInLanguage(welcomeText, language);

        // Announce price count
        setTimeout(() => {
          const countText = language === 'hi'
            ? `${sortedPrices.length} बाज़ार मूल्य उपलब्ध हैं।`
            : `Found ${sortedPrices.length} market prices available.`;
          speakInLanguage(countText, language);

          // Announce first 3 prices
          sortedPrices.slice(0, 3).forEach((price, index) => {
            setTimeout(() => {
              const changeTextEn = price.change > 0 ? `up ${Math.abs(price.change)}` :
                price.change < 0 ? `down ${Math.abs(price.change)}` : 'unchanged';
              const changeTextHi = price.change > 0 ? `बढ़ा ${Math.abs(price.change)}` :
                price.change < 0 ? `घटा ${Math.abs(price.change)}` : 'स्थिर';
              const priceText = language === 'hi'
                ? `${price.commodity} की कीमत ${price.currentPrice.toFixed(2)} ${price.unit} है, ${changeTextHi}`
                : `${price.commodity} is priced at ${price.currentPrice.toFixed(2)} ${price.unit}, ${changeTextEn}`;
              speakInLanguage(priceText, language);
            }, (index + 1) * 3000);
          });
        }, 2000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [language, isVoiceEnabled, sortedPrices]);

  const speakPriceInfo = (price: MarketPrice) => {
    if (isVoiceEnabled) {
      const changeTextEn = price.change > 0 ? `up ${Math.abs(price.change)}` :
        price.change < 0 ? `down ${Math.abs(price.change)}` : 'unchanged';
      const changeTextHi = price.change > 0 ? `बढ़ा ${Math.abs(price.change)}` :
        price.change < 0 ? `घटा ${Math.abs(price.change)}` : 'स्थिर';
      const priceText = language === 'hi'
        ? `${price.commodity} की कीमत ${price.currentPrice.toFixed(2)} ${price.unit} है, ${changeTextHi}`
        : `${price.commodity} is priced at ${price.currentPrice.toFixed(2)} ${price.unit}, ${changeTextEn}`;
      speakInLanguage(priceText, language);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
      case 'down':
        return <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
      default:
        return <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
    }
  };

  const getForecastColor = (forecast: string) => {
    switch (forecast) {
      case 'bullish': return 'text-green-600 bg-green-50';
      case 'bearish': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="animate-fade-in">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className={`${componentClasses.text.h1} mb-4`}>{getUIText('title', language, 'market')}</h1>
                <p className={`${componentClasses.text.bodyLarge} max-w-2xl`}>
                  {getUIText('description', language, 'market')}
                </p>

                {/* Voice Controls */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isVoiceEnabled
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                  >
                    {isVoiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className={showAlerts ? componentClasses.button.secondary : componentClasses.button.outline}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5h-5m-6 0H4l5 5-5 5h5" />
                </svg>
                {showAlerts ? 'Hide' : 'Show'} Alerts ({marketStats.activeAlerts})
              </button>
              <button
                onClick={() => fetchMarketPrices(true)}
                disabled={loading}
                className={`${componentClasses.button.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isScrapingActive ? 'Scraping...' : loading ? 'Loading...' : '🌐 Scrape Live Prices'}
              </button>
              <button className={componentClasses.button.outlinePrimary}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Data
              </button>
            </div>
          </div>

          {/* Statistics Cards with Enhanced Design */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <StatsCard
              title="Total Commodities"
              value={marketStats.totalCommodities}
              subtitle="Indian markets tracked"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
              color="secondary"
            />
            <StatsCard
              title="Bullish Trends"
              value={marketStats.pricesUp}
              subtitle="Price increasing"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              color="success"
              trend={{
                value: 15.2,
                isPositive: true
              }}
            />
            <StatsCard
              title="Bearish Trends"
              value={marketStats.pricesDown}
              subtitle="Price declining"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              }
              color="error"
              trend={{
                value: 6.8,
                isPositive: false
              }}
            />
            <StatsCard
              title="Price Alerts"
              value={marketStats.activeAlerts}
              subtitle="Active notifications"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.132l1.414-1.414 8.484-8.484 1.414 1.414-8.484 8.484-1.414-1.414z" />
                </svg>
              }
              color="warning"
            />
          </div>

          {/* Enhanced Filters Card */}
          <InfoCard title="🔍 Filter & Sort Market Data" className="mb-8 bg-gradient-to-r from-white to-green-50/50 border-green-200">
            <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-5">
              <div>
                <label className={`${componentClasses.text.caption} block mb-3 font-semibold text-gray-700`}>State</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className={`${componentClasses.select} bg-gradient-to-r from-white to-green-50/30 border-green-200 focus:border-green-400 focus:ring-green-400`}
                >
                  {availableStates.map(state => (
                    <option key={state} value={state}>
                      {state === 'all' ? 'All States' : state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`${componentClasses.text.caption} block mb-3 font-semibold text-gray-700`}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`${componentClasses.select} bg-gradient-to-r from-white to-green-50/30 border-green-200 focus:border-green-400 focus:ring-green-400`}
                >
                  {availableCategories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`${componentClasses.text.caption} block mb-3 font-semibold text-gray-700`}>Market</label>
                <select
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className={`${componentClasses.select} bg-gradient-to-r from-white to-green-50/30 border-green-200 focus:border-green-400 focus:ring-green-400`}
                >
                  {availableMarkets.slice(0, 20).map(market => (
                    <option key={market} value={market}>
                      {market === 'all' ? 'All Markets' : market}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`${componentClasses.text.caption} block mb-3 font-semibold text-gray-700`}>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`${componentClasses.select} bg-gradient-to-r from-white to-green-50/30 border-green-200 focus:border-green-400 focus:ring-green-400`}
                >
                  <option value="commodity">Commodity Name</option>
                  <option value="price">Current Price (₹)</option>
                  <option value="change">Price Change</option>
                  <option value="market">Market</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => fetchMarketPrices(true)}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isScrapingActive ? 'Scraping...' : loading ? 'Loading...' : '🔄 Scrape Fresh Data'}
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">⚠️ {error}</p>
              </div>
            )}
          </InfoCard>

          {/* Scraping Progress Indicator */}
          {isScrapingActive && (
            <InfoCard title="🔄 Web Scraping in Progress" className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{scrapingStatus}</span>
                  <span className="text-sm font-bold text-blue-600">{scrapingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${scrapingProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600">
                  Scraping market data from multiple agricultural websites...
                </div>
              </div>
            </InfoCard>
          )}

          {/* Scraping Results Summary */}
          {scrapingResults && !isScrapingActive && (
            <InfoCard title="✅ Scraping Results" className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white/60 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{scrapingResults.totalRecords}</div>
                  <div className="text-sm text-gray-600">Records Scraped</div>
                </div>
                <div className="bg-white/60 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{scrapingResults.scrapedFrom.length}</div>
                  <div className="text-sm text-gray-600">Market Sources</div>
                </div>
                <div className="bg-white/60 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{(scrapingResults.scrapingTime / 1000).toFixed(1)}s</div>
                  <div className="text-sm text-gray-600">Scraping Time</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <strong>Sources:</strong> {scrapingResults.scrapedFrom.join(', ')}
              </div>
            </InfoCard>
          )}

          {/* Enhanced Price Alerts */}
          {showAlerts && (
            <InfoCard title="🔔 Active Price Alerts" className="mb-8 animate-slide-up bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
              <div className="space-y-4">
                {priceAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-white to-amber-50/50 rounded-2xl border border-amber-200 hover:shadow-lg transition-all duration-300 hover:border-amber-300">
                    <div className="flex items-center">
                      <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl mr-4 shadow-md">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-1 text-lg">
                          {alert.commodity} - Alert {alert.alertType} ₹{alert.targetPrice.toLocaleString('en-IN')}
                        </p>
                        <p className="text-gray-600 font-medium">
                          Current price: ₹{alert.currentPrice.toLocaleString('en-IN')}/quintal
                        </p>
                        <span className={`${componentClasses.badge.warning} mt-2 inline-block font-semibold`}>
                          {alert.isActive ? '🟢 Active' : '⭕ Inactive'}
                        </span>
                      </div>
                    </div>
                    <button className="p-3 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-xl transition-all duration-200 hover:shadow-md">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Price Alert
                </button>
              </div>
            </InfoCard>
          )}

          {/* Commodity Varieties Showcase */}
          <InfoCard title="🌾 Comprehensive Commodity Database" className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries({
                'Rice': { varieties: ['Basmati 1121', 'Pusa Basmati', 'IR-64', 'Swarna'], category: 'Grains', icon: '🍚' },
                'Wheat': { varieties: ['PBW 343', 'HD 2967', 'Sharbati', 'MP Wheat'], category: 'Grains', icon: '🌾' },
                'Cotton': { varieties: ['Shankar-6', 'DCH-32', 'Bt Cotton'], category: 'Cash Crops', icon: '🌱' },
                'Soybean': { varieties: ['JS 335', 'JS 9560', 'NRC 37'], category: 'Oilseeds', icon: '🫘' },
                'Onion': { varieties: ['Nashik Red', 'Bellary Red', 'Pusa Red'], category: 'Vegetables', icon: '🧅' },
                'Turmeric': { varieties: ['Erode', 'Salem', 'Nizamabad'], category: 'Spices', icon: '🟡' },
                'Cumin': { varieties: ['Unjha', 'Rajkot', 'Singapore'], category: 'Spices', icon: '🟤' },
                'Groundnut': { varieties: ['Bold', 'Java', 'Spanish Bold'], category: 'Oilseeds', icon: '🥜' },
              }).map(([commodity, info]) => (
                <div key={commodity} className="bg-white rounded-lg p-4 border border-amber-200 hover:border-amber-300 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-800">{commodity}</h4>
                      <p className="text-xs text-gray-500">{info.category}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {info.varieties.map((variety, idx) => (
                      <div key={idx} className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full inline-block mr-1 mb-1">
                        {variety}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600 text-center bg-white/50 rounded-lg p-3">
              💡 <strong>Web Scraper Database:</strong> Our intelligent scraper recognizes 15+ commodities with 100+ varieties from major Indian agricultural markets (APMC, Mandis, etc.)
            </div>
          </InfoCard>

          {/* Enhanced Market Prices Table */}
          <InfoCard title={`📊 Live Market Prices (${sortedPrices.length} commodities)`} className="animate-fade-in bg-gradient-to-r from-white to-blue-50/30 border-blue-200">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                <p className="mt-4 text-gray-600">Loading market prices from Government API...</p>
              </div>
            ) : sortedPrices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Market Data Available</h3>
                <p className="text-gray-500 mb-4">
                  {error ? 'Unable to load data from government API. Please try again.' : 'No prices match your current filters.'}
                </p>
                <button
                  onClick={() => fetchMarketPrices(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  Retry Loading Data
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
                      <th className="text-left py-5 px-6 font-bold text-gray-900 text-sm">Commodity</th>
                      <th className="text-left py-5 px-6 font-bold text-gray-900 text-sm">Price (₹)</th>
                      <th className="text-left py-5 px-6 font-bold text-gray-900 text-sm">Change</th>
                      <th className="text-left py-5 px-6 font-bold text-gray-900 text-sm">Market</th>
                      <th className="text-left py-5 px-6 font-bold text-gray-900 text-sm">Volume</th>
                      <th className="text-left py-5 px-6 font-bold text-gray-900 text-sm">Forecast</th>
                      <th className="text-left py-5 px-6 font-bold text-gray-900 text-sm">Updated</th>
                      <th className="text-center py-5 px-6 font-bold text-gray-900 text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPrices.map((price, index) => (
                      <tr key={price.id} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-blue-50/50 transition-all duration-200 hover:shadow-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="py-6 px-6">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="font-bold text-gray-900 text-lg">{price.commodity}</div>
                              {price.scrapedFrom && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full" title={`Scraped from ${price.scrapedFrom}`}>
                                  🌐 LIVE
                                </span>
                              )}
                              {!price.scrapedFrom && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full" title="Sample data">
                                  📊 SAMPLE
                                </span>
                              )}
                            </div>
                            <div className={`${componentClasses.badge.purple} inline-block font-medium`}>{price.quality}</div>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="font-bold text-2xl text-gray-900 mb-1">
                            ₹{price.currentPrice.toLocaleString('en-IN')}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">{price.unit}</div>
                          {(price.minPrice || price.maxPrice) && (
                            <div className="text-xs text-gray-500 mt-1">
                              Range: ₹{price.minPrice?.toLocaleString('en-IN')} - ₹{price.maxPrice?.toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>
                        <td className="py-6 px-6">
                          <div className={`flex items-center font-bold ${price.change > 0 ? 'text-green-600' : price.change < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                            {getTrendIcon(price.trend)}
                            <div className="ml-3">
                              <div className="font-bold text-lg">
                                {price.change > 0 ? '+' : ''}₹{Math.abs(price.change).toLocaleString('en-IN')}
                              </div>
                              <div className="text-sm font-semibold">
                                ({price.changePercent > 0 ? '+' : ''}{price.changePercent.toFixed(1)}%)
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="text-sm font-bold text-gray-900 mb-1">{price.market}</div>
                          {price.state && (
                            <div className="text-xs text-gray-600 font-medium">{price.state}</div>
                          )}
                          {price.grade && (
                            <div className="text-xs text-blue-600 font-medium">Grade: {price.grade}</div>
                          )}
                        </td>
                        <td className="py-6 px-6">
                          <div className="text-sm font-bold text-gray-900 mb-1">{price.volume}</div>
                          <div className="text-xs text-gray-600 font-medium">Traded today</div>
                        </td>
                        <td className="py-6 px-6">
                          <span className={`${price.forecast === 'bullish'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : price.forecast === 'bearish'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            } px-3 py-2 rounded-full text-xs font-bold capitalize inline-flex items-center`}>
                            {price.forecast === 'bullish' ? '📈 ' : price.forecast === 'bearish' ? '📉 ' : '➡️ '}
                            {price.forecast}
                          </span>
                        </td>
                        <td className="py-6 px-6">
                          <div className="text-sm text-gray-900 font-bold mb-1">{price.lastUpdated}</div>
                          <div className="text-xs text-gray-600 font-medium">Last update</div>
                        </td>
                        <td className="py-5 px-6 text-center">
                          <div className="flex gap-2 justify-center">
                            {isVoiceEnabled && (
                              <button
                                onClick={() => speakPriceInfo(price)}
                                className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm"
                                title="Speak price info"
                              >
                                🔊
                              </button>
                            )}
                            <button className={`${componentClasses.button.small} ${componentClasses.button.outline}`}>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5h-5m-6 0H4l5 5-5 5h5" />
                              </svg>
                              Alert
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </InfoCard>

          {/* Market Insights Banner */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0">
                  <h2 className="text-3xl font-bold mb-2">🌾 Today's Market Insights</h2>
                  <p className="text-indigo-100 text-lg">Key trends affecting Indian agriculture markets</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">+12.5%</div>
                    <div className="text-indigo-200 text-sm">Wheat demand up</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">₹2,180</div>
                    <div className="text-indigo-200 text-sm">Avg wheat price</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <span className="font-semibold">🌧️ Monsoon Impact:</span> Normal rainfall expected to boost kharif crop yields
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <span className="font-semibold">🚚 Export News:</span> Government allows increased rice exports, prices stabilizing
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <span className="font-semibold">💰 MSP Update:</span> New minimum support prices announced for rabi season
                </div>
              </div>
            </div>
          </div>

          {/* Quick Market Actions */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Best Selling Prices</h3>
              <p className="text-green-100 text-sm">Find the highest paying mandis near you</p>
              <div className="mt-4 text-right">
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Live Updates</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.132l1.414-1.414 8.484-8.484 1.414 1.414-8.484 8.484-1.414-1.414z" />
                  </svg>
                </div>
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Price Alerts</h3>
              <p className="text-blue-100 text-sm">Get notified when prices hit your targets</p>
              <div className="mt-4 text-right">
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Smart Alerts</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Market Analysis</h3>
              <p className="text-purple-100 text-sm">Advanced insights and trend predictions</p>
              <div className="mt-4 text-right">
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">AI Powered</span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}