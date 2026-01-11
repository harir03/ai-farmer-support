import axios from 'axios';

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;
  pressure: number;
  forecast: Array<{
    date: string;
    temp: number;
    description: string;
    precipitation: number;
  }>;
}

export interface CropRecommendation {
  crop: string;
  suitability: number;
  reasons: string[];
  plantingTime: string;
  expectedYield: string;
  marketPrice: number;
}

export interface MarketPrice {
  crop: string;
  price: number;
  unit: string;
  market: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
}

export interface TaskRecommendation {
  task: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  dueDate: string;
  category: 'planting' | 'irrigation' | 'fertilization' | 'pest-control' | 'harvesting';
}

export class FarmingFunctions {
  private weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || '';
  
  async getWeatherData(location: string): Promise<WeatherData> {
    try {
      // Using OpenWeatherMap API as example
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${this.weatherApiKey}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${this.weatherApiKey}&units=metric`;

      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(currentWeatherUrl),
        axios.get(forecastUrl)
      ]);

      const current = currentResponse.data;
      const forecast = forecastResponse.data;

      return {
        location: current.name,
        temperature: Math.round(current.main.temp),
        humidity: current.main.humidity,
        description: current.weather[0].description,
        windSpeed: current.wind.speed,
        pressure: current.main.pressure,
        forecast: forecast.list.slice(0, 5).map((item: any) => ({
          date: new Date(item.dt * 1000).toLocaleDateString(),
          temp: Math.round(item.main.temp),
          description: item.weather[0].description,
          precipitation: item.rain ? item.rain['3h'] || 0 : 0
        }))
      };
    } catch (error) {
      console.error('Weather API error:', error);
      // Return mock data for demonstration
      return {
        location: location,
        temperature: 28,
        humidity: 75,
        description: 'Partly cloudy',
        windSpeed: 3.5,
        pressure: 1013,
        forecast: [
          { date: new Date().toLocaleDateString(), temp: 29, description: 'Sunny', precipitation: 0 },
          { date: new Date(Date.now() + 86400000).toLocaleDateString(), temp: 27, description: 'Cloudy', precipitation: 2 },
          { date: new Date(Date.now() + 172800000).toLocaleDateString(), temp: 25, description: 'Light rain', precipitation: 5 }
        ]
      };
    }
  }

  async getCropRecommendations(soilType: string, climate: string, landSize: number): Promise<CropRecommendation[]> {
    // Simulate AI-powered crop recommendations based on various factors
    const cropDatabase = [
      {
        crop: 'Rice',
        suitability: 85,
        reasons: ['High water availability', 'Suitable soil pH', 'Good market demand'],
        plantingTime: 'June-July',
        expectedYield: '4-6 tons/hectare',
        marketPrice: 2500
      },
      {
        crop: 'Wheat',
        suitability: 75,
        reasons: ['Good winter crop', 'Stable market prices', 'Low water requirement'],
        plantingTime: 'November-December',
        expectedYield: '3-4 tons/hectare',
        marketPrice: 2200
      },
      {
        crop: 'Maize',
        suitability: 70,
        reasons: ['Fast growing', 'Multiple uses', 'Good for rotation'],
        plantingTime: 'March-April',
        expectedYield: '5-7 tons/hectare',
        marketPrice: 1800
      },
      {
        crop: 'Tomato',
        suitability: 80,
        reasons: ['High value crop', 'Year-round demand', 'Good for small farms'],
        plantingTime: 'October-November',
        expectedYield: '20-30 tons/hectare',
        marketPrice: 3000
      }
    ];

    // Filter and sort based on suitability
    return cropDatabase
      .filter(crop => landSize < 2 ? crop.crop !== 'Rice' : true) // Rice needs larger fields
      .sort((a, b) => b.suitability - a.suitability);
  }

  async getMarketPrices(crops?: string[]): Promise<MarketPrice[]> {
    // Simulate real-time market price data
    const mockPrices: MarketPrice[] = [
      { crop: 'Rice', price: 2500, unit: 'per quintal', market: 'Local Mandi', date: new Date().toISOString().split('T')[0], trend: 'up' },
      { crop: 'Wheat', price: 2200, unit: 'per quintal', market: 'Local Mandi', date: new Date().toISOString().split('T')[0], trend: 'stable' },
      { crop: 'Maize', price: 1800, unit: 'per quintal', market: 'Local Mandi', date: new Date().toISOString().split('T')[0], trend: 'down' },
      { crop: 'Tomato', price: 3000, unit: 'per quintal', market: 'Local Market', date: new Date().toISOString().split('T')[0], trend: 'up' },
      { crop: 'Onion', price: 2800, unit: 'per quintal', market: 'Local Market', date: new Date().toISOString().split('T')[0], trend: 'stable' },
      { crop: 'Potato', price: 1500, unit: 'per quintal', market: 'Local Market', date: new Date().toISOString().split('T')[0], trend: 'up' }
    ];

    if (crops && crops.length > 0) {
      return mockPrices.filter(price => 
        crops.some(crop => price.crop.toLowerCase().includes(crop.toLowerCase()))
      );
    }

    return mockPrices;
  }

  async getTaskRecommendations(season: string, crops: string[] = []): Promise<TaskRecommendation[]> {
    const currentMonth = new Date().getMonth() + 1;
    const tasks: TaskRecommendation[] = [];

    // Season-based task recommendations
    if (season === 'monsoon' || [6, 7, 8, 9].includes(currentMonth)) {
      tasks.push(
        {
          task: 'Prepare drainage channels',
          priority: 'high',
          description: 'Ensure proper drainage to prevent waterlogging during heavy rains',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          category: 'irrigation'
        },
        {
          task: 'Plant rice seedlings',
          priority: 'high',
          description: 'Optimal time for rice transplantation',
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          category: 'planting'
        }
      );
    }

    if (season === 'winter' || [11, 12, 1, 2].includes(currentMonth)) {
      tasks.push(
        {
          task: 'Sow wheat seeds',
          priority: 'high',
          description: 'Plant wheat for rabi season harvest',
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          category: 'planting'
        },
        {
          task: 'Apply organic fertilizer',
          priority: 'medium',
          description: 'Winter crops need proper nutrition',
          dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          category: 'fertilization'
        }
      );
    }

    if (season === 'summer' || [3, 4, 5].includes(currentMonth)) {
      tasks.push(
        {
          task: 'Install drip irrigation',
          priority: 'high',
          description: 'Water conservation is critical in summer',
          dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          category: 'irrigation'
        },
        {
          task: 'Harvest winter crops',
          priority: 'high',
          description: 'Complete harvesting before extreme heat',
          dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
          category: 'harvesting'
        }
      );
    }

    return tasks;
  }

  async diagnoseCropIssue(symptoms: string, cropType?: string): Promise<{
    possibleDiseases: string[];
    possiblePests: string[];
    recommendations: string[];
  }> {
    const symptomsLower = symptoms.toLowerCase();
    const result = {
      possibleDiseases: [] as string[],
      possiblePests: [] as string[],
      recommendations: [] as string[]
    };

    // Disease detection based on symptoms
    if (symptomsLower.includes('yellow') || symptomsLower.includes('yellowing')) {
      result.possibleDiseases.push('Nutrient deficiency (Nitrogen)', 'Viral infection', 'Root rot');
      result.recommendations.push('Apply balanced fertilizer', 'Improve drainage', 'Test soil pH');
    }

    if (symptomsLower.includes('spots') || symptomsLower.includes('spots on leaves')) {
      result.possibleDiseases.push('Leaf spot disease', 'Fungal infection', 'Bacterial blight');
      result.recommendations.push('Apply fungicide spray', 'Remove affected leaves', 'Improve air circulation');
    }

    if (symptomsLower.includes('holes') || symptomsLower.includes('eaten')) {
      result.possiblePests.push('Caterpillars', 'Beetles', 'Grasshoppers');
      result.recommendations.push('Use neem oil spray', 'Install pheromone traps', 'Introduce beneficial insects');
    }

    if (symptomsLower.includes('wilting') || symptomsLower.includes('drooping')) {
      result.possibleDiseases.push('Wilt disease', 'Root damage', 'Water stress');
      result.recommendations.push('Check irrigation schedule', 'Inspect root system', 'Apply organic matter');
    }

    return result;
  }
}

export const farmingFunctions = new FarmingFunctions();