import { MarketPrice } from '../models/index.js';

// Get market prices
export const getMarketPrices = async (req, res) => {
  try {
    const { crop, state, city, category, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = { isActive: true };
    if (crop) {
      filter['crop.name'] = new RegExp(crop, 'i');
    }
    if (state) {
      filter['market.location.state'] = new RegExp(state, 'i');
    }
    if (city) {
      filter['market.location.city'] = new RegExp(city, 'i');
    }
    if (category) {
      filter['crop.category'] = category;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get prices
    const prices = await MarketPrice.find(filter)
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MarketPrice.countDocuments(filter);

    // Add calculated fields
    const pricesWithStats = prices.map(price => ({
      ...price.toObject(),
      priceChangePercent: price.priceChangePercent,
      weeklyTrend: price.calculateTrend('weekly'),
      monthlyTrend: price.calculateTrend('monthly')
    }));

    res.status(200).json({
      success: true,
      data: {
        prices: pricesWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get market prices error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get price for specific crop and location
export const getSpecificPrice = async (req, res) => {
  try {
    const { crop, state, city } = req.params;

    const price = await MarketPrice.findOne({
      'crop.name': new RegExp(crop, 'i'),
      'market.location.state': new RegExp(state, 'i'),
      'market.location.city': new RegExp(city, 'i'),
      isActive: true
    }).sort({ lastUpdated: -1 });

    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Price data not found for the specified crop and location'
      });
    }

    res.status(200).json({
      success: true,
      data: { price }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create/Update market price
export const updateMarketPrice = async (req, res) => {
  try {
    const { crop, market, price, quality, dataSource } = req.body;

    // Find existing price record
    let marketPrice = await MarketPrice.findOne({
      'crop.name': crop.name.toLowerCase(),
      'market.name': market.name,
      'market.location.city': market.location.city,
      'market.location.state': market.location.state
    });

    if (marketPrice) {
      // Update existing record
      marketPrice.price.previous = marketPrice.price.current;
      marketPrice.price.current = price.current;
      marketPrice.price.unit = price.unit || marketPrice.price.unit;
      
      // Add to price history
      marketPrice.addPriceHistory(price.current, req.body.volume, dataSource);
      
      // Update other fields
      if (quality) marketPrice.quality = quality;
      marketPrice.lastUpdated = new Date();
      marketPrice.dataSource = dataSource;

      // Calculate trends
      marketPrice.trends.weekly = marketPrice.calculateTrend('weekly');
      marketPrice.trends.monthly = marketPrice.calculateTrend('monthly');

      await marketPrice.save();
    } else {
      // Create new record
      marketPrice = new MarketPrice({
        crop,
        market,
        price,
        quality,
        dataSource,
        priceHistory: [{
          date: new Date(),
          price: price.current,
          volume: req.body.volume,
          source: dataSource
        }]
      });

      await marketPrice.save();
    }

    res.status(200).json({
      success: true,
      message: 'Market price updated successfully',
      data: { marketPrice }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get price trends
export const getPriceTrends = async (req, res) => {
  try {
    const { crop, state, days = 30 } = req.query;

    const filter = { isActive: true };
    if (crop) filter['crop.name'] = new RegExp(crop, 'i');
    if (state) filter['market.location.state'] = new RegExp(state, 'i');

    const prices = await MarketPrice.find(filter)
      .sort({ lastUpdated: -1 })
      .limit(50);

    // Extract price history for trends
    const trends = [];
    prices.forEach(priceDoc => {
      const recentHistory = priceDoc.priceHistory
        .filter(entry => {
          const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
          return entry.date >= daysAgo;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (recentHistory.length > 0) {
        trends.push({
          crop: priceDoc.crop.name,
          market: `${priceDoc.market.location.city}, ${priceDoc.market.location.state}`,
          history: recentHistory,
          currentPrice: priceDoc.price.current,
          unit: priceDoc.price.unit,
          trend: priceDoc.calculateTrend('weekly')
        });
      }
    });

    res.status(200).json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get crops by category
export const getCropsByCategory = async (req, res) => {
  try {
    const categories = await MarketPrice.distinct('crop.category', { isActive: true });
    
    const cropsByCategory = {};
    for (const category of categories) {
      const crops = await MarketPrice.distinct('crop.name', { 'crop.category': category, isActive: true });
      cropsByCategory[category] = crops;
    }

    res.status(200).json({
      success: true,
      data: { cropsByCategory }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get mock market price data
export const getMockMarketPrices = () => {
  return [
    {
      _id: 'mock_price_1',
      crop: {
        name: 'wheat',
        variety: 'HD-2967',
        category: 'cereals'
      },
      market: {
        name: 'Ludhiana Mandi',
        location: {
          city: 'Ludhiana',
          state: 'Punjab',
          district: 'Ludhiana'
        },
        type: 'mandi'
      },
      price: {
        current: 2150,
        previous: 2100,
        unit: 'per_quintal',
        currency: 'INR'
      },
      trends: {
        weekly: {
          change: 2.38,
          trend: 'increasing'
        },
        monthly: {
          change: 5.2,
          trend: 'increasing'
        }
      },
      quality: { grade: 'A' },
      lastUpdated: new Date()
    },
    {
      _id: 'mock_price_2',
      crop: {
        name: 'rice',
        variety: 'Basmati',
        category: 'cereals'
      },
      market: {
        name: 'Delhi Azadpur Mandi',
        location: {
          city: 'Delhi',
          state: 'Delhi',
          district: 'North Delhi'
        },
        type: 'mandi'
      },
      price: {
        current: 4200,
        previous: 4150,
        unit: 'per_quintal',
        currency: 'INR'
      },
      trends: {
        weekly: {
          change: 1.2,
          trend: 'increasing'
        },
        monthly: {
          change: 3.8,
          trend: 'increasing'
        }
      },
      quality: { grade: 'Premium' },
      lastUpdated: new Date()
    },
    {
      _id: 'mock_price_3',
      crop: {
        name: 'onion',
        variety: 'Red',
        category: 'vegetables'
      },
      market: {
        name: 'Nashik APMC',
        location: {
          city: 'Nashik',
          state: 'Maharashtra',
          district: 'Nashik'
        },
        type: 'mandi'
      },
      price: {
        current: 2800,
        previous: 3200,
        unit: 'per_quintal',
        currency: 'INR'
      },
      trends: {
        weekly: {
          change: -12.5,
          trend: 'decreasing'
        },
        monthly: {
          change: -8.2,
          trend: 'decreasing'
        }
      },
      quality: { grade: 'A' },
      lastUpdated: new Date()
    },
    {
      _id: 'mock_price_4',
      crop: {
        name: 'tomato',
        variety: 'Hybrid',
        category: 'vegetables'
      },
      market: {
        name: 'Bangalore Market',
        location: {
          city: 'Bangalore',
          state: 'Karnataka',
          district: 'Bangalore'
        },
        type: 'wholesale'
      },
      price: {
        current: 1800,
        previous: 1750,
        unit: 'per_quintal',
        currency: 'INR'
      },
      trends: {
        weekly: {
          change: 2.86,
          trend: 'increasing'
        },
        monthly: {
          change: 15.4,
          trend: 'increasing'
        }
      },
      quality: { grade: 'A' },
      lastUpdated: new Date()
    }
  ];
};