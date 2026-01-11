import express from 'express';
import axios from 'axios';

const router = express.Router();

// Farm knowledge base - comprehensive farming information
const farmingKnowledge = [
    // Crop Management
    {
        id: 'crop-rice-1',
        content: 'Rice cultivation requires flooded fields for optimal growth. Plant rice seedlings 2-3 weeks old in rows 20cm apart. Water levels should be maintained at 2-5cm throughout growing season.',
        category: 'crops',
        language: 'en',
        keywords: ['rice', 'paddy', 'cultivation', 'water', 'seedlings']
    },
    {
        id: 'crop-wheat-1',
        content: 'Wheat should be sown in November-December in tropical regions. Optimal spacing is 22.5cm between rows. Water requirement is 450-650mm throughout crop cycle.',
        category: 'crops',
        language: 'en',
        keywords: ['wheat', 'sowing', 'november', 'december', 'spacing']
    },
    {
        id: 'crop-maize-1',
        content: 'Maize (corn) thrives in well-drained soil with pH 6.0-7.5. Plant seeds 60cm apart in rows. Harvest when moisture content is 20-25% for optimal yield.',
        category: 'crops',
        language: 'en',
        keywords: ['maize', 'corn', 'soil', 'pH', 'harvest']
    },
    
    // Disease Management
    {
        id: 'disease-blight-1',
        content: 'Late blight in potatoes appears as dark spots on leaves. Prevent with copper-based fungicides. Ensure good air circulation and avoid overhead watering.',
        category: 'diseases',
        language: 'en',
        keywords: ['blight', 'potato', 'dark spots', 'fungicide', 'copper']
    },
    {
        id: 'disease-rust-1',
        content: 'Wheat rust shows orange pustules on leaves. Apply propiconazole fungicide at first sign. Use resistant varieties when possible.',
        category: 'diseases',
        language: 'en',
        keywords: ['rust', 'wheat', 'orange', 'pustules', 'propiconazole']
    },
    
    // Pest Control
    {
        id: 'pest-aphids-1',
        content: 'Aphids cluster on new growth and undersides of leaves. Control with neem oil spray or introduce ladybugs as natural predators.',
        category: 'pests',
        language: 'en',
        keywords: ['aphids', 'leaves', 'neem oil', 'ladybugs', 'predators']
    },
    {
        id: 'pest-bollworm-1',
        content: 'Cotton bollworm damages cotton bolls and other crops. Use pheromone traps for monitoring and Bt cotton varieties for resistance.',
        category: 'pests',
        language: 'en',
        keywords: ['bollworm', 'cotton', 'pheromone', 'traps', 'Bt cotton']
    },
    
    // Soil Management
    {
        id: 'soil-ph-1',
        content: 'Soil pH affects nutrient availability. Most crops prefer pH 6.0-7.0. Add lime to increase pH or sulfur to decrease pH gradually.',
        category: 'soil',
        language: 'en',
        keywords: ['soil', 'pH', 'nutrients', 'lime', 'sulfur']
    },
    {
        id: 'soil-organic-1',
        content: 'Organic matter improves soil structure and water retention. Add compost, manure, or green manure crops to increase organic content.',
        category: 'soil',
        language: 'en',
        keywords: ['organic matter', 'soil structure', 'compost', 'manure', 'water retention']
    },
    
    // Weather & Climate
    {
        id: 'weather-monsoon-1',
        content: 'Monsoon timing is crucial for crop planning. Early monsoon favors rice and sugarcane. Delayed monsoon may require drought-resistant varieties.',
        category: 'weather',
        language: 'en',
        keywords: ['monsoon', 'crop planning', 'rice', 'sugarcane', 'drought resistant']
    },
    {
        id: 'weather-frost-1',
        content: 'Protect crops from frost using water spraying, smoke, or row covers. Plant frost-sensitive crops after last frost date.',
        category: 'weather',
        language: 'en',
        keywords: ['frost', 'protection', 'water spraying', 'smoke', 'row covers']
    },
    
    // Irrigation
    {
        id: 'irrigation-drip-1',
        content: 'Drip irrigation saves 30-50% water compared to flood irrigation. Best for high-value crops like vegetables and fruits.',
        category: 'irrigation',
        language: 'en',
        keywords: ['drip irrigation', 'water saving', 'vegetables', 'fruits', 'high-value crops']
    },
    {
        id: 'irrigation-timing-1',
        content: 'Water crops early morning or evening to reduce evaporation. Critical watering periods include flowering and fruit development stages.',
        category: 'irrigation',
        language: 'en',
        keywords: ['watering timing', 'early morning', 'evening', 'evaporation', 'flowering']
    }
];

// Search knowledge base
router.get('/knowledge/search', (req, res) => {
    try {
        const { query, category, limit = 5 } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }
        
        const keywords = query.toLowerCase().split(' ');
        
        let filteredKnowledge = farmingKnowledge;
        if (category) {
            filteredKnowledge = farmingKnowledge.filter(item => item.category === category);
        }
        
        const scoredResults = filteredKnowledge.map(item => {
            const content = item.content.toLowerCase();
            const keywordMatches = item.keywords.filter(keyword => 
                keywords.some(q => keyword.includes(q) || q.includes(keyword))
            );
            
            const contentScore = keywords.reduce((acc, keyword) => {
                return content.includes(keyword) ? acc + 1 : acc;
            }, 0);
            
            const score = keywordMatches.length * 2 + contentScore;
            return { ...item, score };
        });
        
        const results = scoredResults
            .filter(result => result.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, parseInt(limit));
        
        res.json({
            success: true,
            query,
            results,
            total: results.length
        });
        
    } catch (error) {
        console.error('Knowledge search error:', error);
        res.status(500).json({ error: 'Failed to search knowledge base' });
    }
});

// Get market prices
router.get('/market-prices', (req, res) => {
    try {
        const { crop, location } = req.query;
        
        // Mock market data - replace with actual market API
        const marketPrices = [
            { crop: 'Rice', price: 2500, unit: 'per quintal', market: 'Local Mandi', date: new Date().toISOString().split('T')[0], trend: 'up' },
            { crop: 'Wheat', price: 2200, unit: 'per quintal', market: 'Local Mandi', date: new Date().toISOString().split('T')[0], trend: 'stable' },
            { crop: 'Maize', price: 1800, unit: 'per quintal', market: 'Local Mandi', date: new Date().toISOString().split('T')[0], trend: 'down' },
            { crop: 'Tomato', price: 3000, unit: 'per quintal', market: 'Local Market', date: new Date().toISOString().split('T')[0], trend: 'up' },
            { crop: 'Onion', price: 2800, unit: 'per quintal', market: 'Local Market', date: new Date().toISOString().split('T')[0], trend: 'stable' },
            { crop: 'Potato', price: 1500, unit: 'per quintal', market: 'Local Market', date: new Date().toISOString().split('T')[0], trend: 'up' }
        ];
        
        let filteredPrices = marketPrices;
        
        if (crop) {
            filteredPrices = marketPrices.filter(price => 
                price.crop.toLowerCase().includes(crop.toLowerCase())
            );
        }
        
        res.json({
            success: true,
            data: filteredPrices,
            lastUpdated: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Market prices error:', error);
        res.status(500).json({ error: 'Failed to fetch market prices' });
    }
});

// Get crop recommendations
router.post('/crop-recommendations', async (req, res) => {
    try {
        const { latitude, longitude, soilType, landSize } = req.body;
        
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }
        
        // Mock recommendations - enhance with actual ML/AI models
        const recommendations = [
            {
                crop: 'Rice',
                suitability: 85,
                reasons: ['High water availability', 'Suitable soil pH', 'Good market demand'],
                plantingTime: 'June-July',
                expectedYield: '4-6 tons/hectare',
                marketPrice: 2500,
                investment: 45000,
                profit: 65000,
                roi: 44.4
            },
            {
                crop: 'Wheat',
                suitability: 75,
                reasons: ['Good winter crop', 'Stable market prices', 'Low water requirement'],
                plantingTime: 'November-December',
                expectedYield: '3-4 tons/hectare',
                marketPrice: 2200,
                investment: 35000,
                profit: 48000,
                roi: 37.1
            },
            {
                crop: 'Maize',
                suitability: 70,
                reasons: ['Fast growing', 'Multiple uses', 'Good for rotation'],
                plantingTime: 'March-April',
                expectedYield: '5-7 tons/hectare',
                marketPrice: 1800,
                investment: 30000,
                profit: 42000,
                roi: 40.0
            }
        ];
        
        // Filter based on land size
        const filteredRecommendations = recommendations.filter(crop => {
            if (landSize && landSize < 2) {
                return crop.crop !== 'Rice'; // Rice needs larger fields
            }
            return true;
        });
        
        res.json({
            success: true,
            location: { latitude, longitude },
            soilType: soilType || 'loamy',
            landSize: landSize || 'not specified',
            recommendations: filteredRecommendations,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Crop recommendations error:', error);
        res.status(500).json({ error: 'Failed to generate crop recommendations' });
    }
});

// Weather data with farming advice
router.get('/weather/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'Weather API key not configured' });
        }
        
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        
        const [weatherResponse, forecastResponse] = await Promise.all([
            axios.get(weatherUrl),
            axios.get(forecastUrl)
        ]);
        
        const weather = weatherResponse.data;
        const forecast = forecastResponse.data;
        
        // Generate farming advice based on weather
        const advice = [];
        const temp = weather.main.temp;
        
        if (temp > 35) {
            advice.push('High temperature - increase irrigation frequency');
            advice.push('Apply mulch to protect crops from heat stress');
            advice.push('Schedule farming activities for early morning/evening');
        } else if (temp < 10) {
            advice.push('Cold weather - protect sensitive crops with covers');
            advice.push('Reduce irrigation frequency');
            advice.push('Consider frost protection measures');
        }
        
        if (weather.weather[0].main.toLowerCase().includes('rain')) {
            advice.push('Rain expected - check drainage systems');
            advice.push('Avoid pesticide/fungicide application during rain');
        }
        
        res.json({
            success: true,
            location: weather.name,
            current: {
                temperature: Math.round(weather.main.temp),
                humidity: weather.main.humidity,
                description: weather.weather[0].description,
                windSpeed: weather.wind.speed,
                pressure: weather.main.pressure
            },
            forecast: forecast.list.slice(0, 5).map(item => ({
                date: new Date(item.dt * 1000).toLocaleDateString(),
                temp: Math.round(item.main.temp),
                description: item.weather[0].description,
                precipitation: item.rain ? item.rain['3h'] || 0 : 0
            })),
            farmingAdvice: advice
        });
        
    } catch (error) {
        console.error('Weather error:', error);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'City not found' });
        }
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Disease diagnosis
router.post('/diagnose-disease', (req, res) => {
    try {
        const { symptoms, cropType } = req.body;
        
        if (!symptoms) {
            return res.status(400).json({ error: 'Symptoms description is required' });
        }
        
        const symptomsLower = symptoms.toLowerCase();
        const diagnosis = {
            possibleDiseases: [],
            possiblePests: [],
            recommendations: []
        };
        
        // Disease detection logic
        if (symptomsLower.includes('yellow') || symptomsLower.includes('yellowing')) {
            diagnosis.possibleDiseases.push('Nutrient deficiency (Nitrogen)', 'Viral infection', 'Root rot');
            diagnosis.recommendations.push('Apply balanced fertilizer', 'Improve drainage', 'Test soil pH');
        }
        
        if (symptomsLower.includes('spots') || symptomsLower.includes('lesions')) {
            diagnosis.possibleDiseases.push('Leaf spot disease', 'Fungal infection', 'Bacterial blight');
            diagnosis.recommendations.push('Apply fungicide spray', 'Remove affected leaves', 'Improve air circulation');
        }
        
        if (symptomsLower.includes('holes') || symptomsLower.includes('eaten')) {
            diagnosis.possiblePests.push('Caterpillars', 'Beetles', 'Grasshoppers');
            diagnosis.recommendations.push('Use neem oil spray', 'Install pheromone traps', 'Introduce beneficial insects');
        }
        
        if (symptomsLower.includes('wilting') || symptomsLower.includes('drooping')) {
            diagnosis.possibleDiseases.push('Wilt disease', 'Root damage', 'Water stress');
            diagnosis.recommendations.push('Check irrigation schedule', 'Inspect root system', 'Apply organic matter');
        }
        
        res.json({
            success: true,
            symptoms,
            cropType: cropType || 'general',
            diagnosis,
            confidence: diagnosis.possibleDiseases.length > 0 || diagnosis.possiblePests.length > 0 ? 'medium' : 'low',
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Disease diagnosis error:', error);
        res.status(500).json({ error: 'Failed to diagnose disease' });
    }
});

// Farming tasks
router.get('/tasks', (req, res) => {
    try {
        const { season, cropType } = req.query;
        const currentMonth = new Date().getMonth() + 1;
        
        // Determine season if not provided
        let currentSeason = season;
        if (!currentSeason) {
            if ([12, 1, 2].includes(currentMonth)) {
                currentSeason = 'winter';
            } else if ([3, 4, 5].includes(currentMonth)) {
                currentSeason = 'summer';
            } else if ([6, 7, 8, 9].includes(currentMonth)) {
                currentSeason = 'monsoon';
            } else {
                currentSeason = 'post-monsoon';
            }
        }
        
        const tasks = [];
        
        // Season-based tasks
        if (currentSeason === 'monsoon') {
            tasks.push(
                {
                    task: 'Prepare drainage channels',
                    priority: 'high',
                    description: 'Ensure proper drainage to prevent waterlogging during heavy rains',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    category: 'irrigation'
                },
                {
                    task: 'Plant rice seedlings',
                    priority: 'high',
                    description: 'Optimal time for rice transplantation',
                    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    category: 'planting'
                }
            );
        }
        
        if (currentSeason === 'winter') {
            tasks.push(
                {
                    task: 'Sow wheat seeds',
                    priority: 'high',
                    description: 'Plant wheat for rabi season harvest',
                    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    category: 'planting'
                },
                {
                    task: 'Apply organic fertilizer',
                    priority: 'medium',
                    description: 'Winter crops need proper nutrition',
                    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    category: 'fertilization'
                }
            );
        }
        
        if (currentSeason === 'summer') {
            tasks.push(
                {
                    task: 'Install drip irrigation',
                    priority: 'high',
                    description: 'Water conservation is critical in summer',
                    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    category: 'irrigation'
                },
                {
                    task: 'Harvest winter crops',
                    priority: 'high',
                    description: 'Complete harvesting before extreme heat',
                    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    category: 'harvesting'
                }
            );
        }
        
        res.json({
            success: true,
            season: currentSeason,
            cropType: cropType || 'general',
            tasks,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Farming tasks error:', error);
        res.status(500).json({ error: 'Failed to get farming tasks' });
    }
});

export default router;