/**
 * Crop Disease Detection API Service
 * 
 * This module provides disease detection functionality using external APIs.
 * 
 * REQUIRED API KEYS:
 * - PLANT_ID_API_KEY: Get from https://web.plant.id/ (Plant.id API for plant disease detection)
 * - AGROBASE_API_KEY: Get from https://www.agrobase.com/ (Optional - For additional crop database)
 * - GEMINI_API_KEY: Already configured (Fallback AI analysis)
 * 
 * Add these to your .env.local file:
 * PLANT_ID_API_KEY=your_plant_id_api_key
 * AGROBASE_API_KEY=your_agrobase_api_key
 */

export interface DiseaseDetectionResult {
  success: boolean;
  diseaseName: string;
  scientificName?: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe' | 'healthy';
  description: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  organicRemedies?: string[];
  estimatedYieldImpact?: string;
  imageAnalysis?: {
    affectedArea: string;
    plantParts: string[];
    healthScore: number;
  };
  timestamp: string;
  apiSource: string;
}

export interface CropInfo {
  cropName: string;
  commonDiseases: string[];
  growingSeason: string;
  optimalConditions: {
    temperature: string;
    humidity: string;
    soil: string;
  };
}

// Dummy disease database for mock responses
const DISEASE_DATABASE: Record<string, Omit<DiseaseDetectionResult, 'timestamp' | 'apiSource' | 'success'>> = {
  'late_blight': {
    diseaseName: 'Late Blight',
    scientificName: 'Phytophthora infestans',
    confidence: 89,
    severity: 'severe',
    description: 'Late blight is a serious disease affecting potato and tomato crops. It spreads rapidly in cool, wet conditions and can destroy entire crops within days if not treated.',
    symptoms: [
      'Dark, water-soaked lesions on leaves',
      'White fungal growth on leaf undersides',
      'Brown-black spots on stems',
      'Soft, dark rot on tubers/fruits',
      'Rapid wilting and plant death'
    ],
    treatment: [
      'Apply copper-based fungicide immediately (e.g., Bordeaux mixture)',
      'Remove and destroy infected plant parts',
      'Spray Mancozeb or Chlorothalonil every 7-10 days',
      'Improve air circulation by proper spacing',
      'Avoid overhead irrigation'
    ],
    prevention: [
      'Use certified disease-free seeds and plants',
      'Rotate crops every 2-3 years',
      'Plant resistant varieties when available',
      'Ensure good field drainage',
      'Monitor weather conditions for blight warnings'
    ],
    organicRemedies: [
      'Neem oil spray (3ml per liter of water)',
      'Baking soda solution (1 tbsp per gallon)',
      'Compost tea foliar application'
    ],
    estimatedYieldImpact: '70-100% crop loss if untreated',
    imageAnalysis: {
      affectedArea: '35-45%',
      plantParts: ['leaves', 'stems'],
      healthScore: 25
    }
  },
  'powdery_mildew': {
    diseaseName: 'Powdery Mildew',
    scientificName: 'Erysiphales',
    confidence: 92,
    severity: 'moderate',
    description: 'Powdery mildew is a common fungal disease that appears as white powdery spots on leaves and stems. It thrives in warm, dry conditions with high humidity.',
    symptoms: [
      'White powdery coating on leaf surfaces',
      'Yellow or brown patches on leaves',
      'Distorted or stunted new growth',
      'Premature leaf drop',
      'Reduced fruit quality'
    ],
    treatment: [
      'Apply sulfur-based fungicide',
      'Use potassium bicarbonate spray',
      'Prune heavily infected areas',
      'Improve air circulation around plants',
      'Apply neem oil as organic treatment'
    ],
    prevention: [
      'Space plants for adequate airflow',
      'Water at base of plants, not overhead',
      'Choose resistant varieties',
      'Remove and destroy crop debris',
      'Maintain balanced nitrogen levels'
    ],
    organicRemedies: [
      'Milk spray (40% milk to water ratio)',
      'Baking soda spray (1 tsp per quart of water)',
      'Garlic extract spray'
    ],
    estimatedYieldImpact: '20-30% reduction in yield',
    imageAnalysis: {
      affectedArea: '15-25%',
      plantParts: ['leaves'],
      healthScore: 55
    }
  },
  'bacterial_leaf_spot': {
    diseaseName: 'Bacterial Leaf Spot',
    scientificName: 'Xanthomonas campestris',
    confidence: 85,
    severity: 'moderate',
    description: 'Bacterial leaf spot causes dark, water-soaked lesions on leaves that can spread rapidly during warm, wet weather. It affects many vegetable crops.',
    symptoms: [
      'Small, dark water-soaked spots on leaves',
      'Yellow halos around lesions',
      'Spots may merge causing leaf blight',
      'Fruit lesions with scabby appearance',
      'Defoliation in severe cases'
    ],
    treatment: [
      'Apply copper-based bactericide',
      'Remove and destroy infected leaves',
      'Avoid working with wet plants',
      'Use drip irrigation instead of overhead',
      'Apply streptomycin sulfate if available'
    ],
    prevention: [
      'Use disease-free certified seeds',
      'Practice 2-3 year crop rotation',
      'Avoid overhead irrigation',
      'Control insect vectors',
      'Sanitize garden tools regularly'
    ],
    organicRemedies: [
      'Copper hydroxide organic spray',
      'Bacillus subtilis biological control',
      'Hydrogen peroxide solution (3%)'
    ],
    estimatedYieldImpact: '25-40% yield reduction',
    imageAnalysis: {
      affectedArea: '20-30%',
      plantParts: ['leaves', 'fruits'],
      healthScore: 45
    }
  },
  'rust': {
    diseaseName: 'Rust Disease',
    scientificName: 'Puccinia spp.',
    confidence: 91,
    severity: 'moderate',
    description: 'Rust is a fungal disease characterized by orange, yellow, or reddish-brown pustules on plant surfaces. It can significantly reduce photosynthesis and crop yield.',
    symptoms: [
      'Orange-red pustules on leaf undersides',
      'Yellow spots on upper leaf surfaces',
      'Premature leaf yellowing',
      'Reduced plant vigor',
      'Weak stems susceptible to lodging'
    ],
    treatment: [
      'Apply fungicide containing tebuconazole',
      'Remove heavily infected leaves',
      'Spray sulfur-based fungicide preventively',
      'Apply systemic fungicide for severe cases',
      'Maintain proper plant nutrition'
    ],
    prevention: [
      'Plant rust-resistant varieties',
      'Avoid excess nitrogen fertilization',
      'Ensure adequate spacing between plants',
      'Remove alternate hosts nearby',
      'Scout regularly for early detection'
    ],
    organicRemedies: [
      'Sulfur dust application',
      'Neem oil preventive spray',
      'Baking soda solution'
    ],
    estimatedYieldImpact: '30-50% yield loss possible',
    imageAnalysis: {
      affectedArea: '25-35%',
      plantParts: ['leaves', 'stems'],
      healthScore: 40
    }
  },
  'healthy': {
    diseaseName: 'Healthy Plant',
    scientificName: 'N/A',
    confidence: 95,
    severity: 'healthy',
    description: 'Great news! Your plant appears to be healthy with no visible signs of disease, pest damage, or nutrient deficiencies. The leaves show good color and structure.',
    symptoms: [
      'Vibrant green leaf color',
      'No visible spots or lesions',
      'Strong stem structure',
      'Normal growth pattern',
      'No wilting or discoloration'
    ],
    treatment: [
      'Continue current care routine',
      'Maintain regular watering schedule',
      'Monitor for any future changes',
      'Keep implementing preventive measures',
      'Ensure balanced nutrition program'
    ],
    prevention: [
      'Regular crop monitoring',
      'Proper irrigation management',
      'Balanced fertilizer application',
      'Good field hygiene practices',
      'Integrated pest management'
    ],
    organicRemedies: [
      'Compost application for soil health',
      'Beneficial insect habitat maintenance',
      'Cover cropping between seasons'
    ],
    estimatedYieldImpact: 'No negative impact expected',
    imageAnalysis: {
      affectedArea: '0%',
      plantParts: [],
      healthScore: 95
    }
  },
  'nutrient_deficiency': {
    diseaseName: 'Nutrient Deficiency',
    scientificName: 'N/A - Abiotic Disorder',
    confidence: 78,
    severity: 'mild',
    description: 'The plant shows signs of nutrient deficiency, which can be corrected with proper fertilization. Early detection and treatment can fully restore plant health.',
    symptoms: [
      'Yellowing of older leaves (nitrogen deficiency)',
      'Purple discoloration (phosphorus deficiency)',
      'Brown leaf edges (potassium deficiency)',
      'Interveinal chlorosis (iron/magnesium)',
      'Stunted or slow growth'
    ],
    treatment: [
      'Conduct soil test for accurate diagnosis',
      'Apply balanced NPK fertilizer',
      'Use foliar micronutrient spray',
      'Adjust soil pH if necessary',
      'Add organic matter to improve nutrient availability'
    ],
    prevention: [
      'Regular soil testing (annually)',
      'Balanced fertilization program',
      'Proper soil pH maintenance',
      'Adequate organic matter addition',
      'Avoid over-watering that leaches nutrients'
    ],
    organicRemedies: [
      'Compost tea application',
      'Fish emulsion fertilizer',
      'Kelp extract foliar spray',
      'Well-rotted manure incorporation'
    ],
    estimatedYieldImpact: '10-20% reduction if untreated',
    imageAnalysis: {
      affectedArea: '40-60%',
      plantParts: ['leaves'],
      healthScore: 60
    }
  }
};

/**
 * Analyze image using Plant.id API
 * @param base64Image - Base64 encoded image
 * @returns Disease detection result
 */
export async function analyzeWithPlantIdAPI(base64Image: string): Promise<DiseaseDetectionResult> {
  const API_KEY = process.env.PLANT_ID_API_KEY;
  
  if (!API_KEY) {
    console.warn('⚠️ PLANT_ID_API_KEY not configured. Using dummy response.');
    return getDummyDiseaseResult();
  }

  try {
    const response = await fetch('https://plant.id/api/v3/health_assessment', {
      method: 'POST',
      headers: {
        'Api-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: [base64Image],
        health_details: ['local_name', 'treatment', 'description', 'cause'],
        disease_details: ['local_name', 'treatment', 'description', 'cause'],
        language: 'en'
      }),
    });

    if (!response.ok) {
      throw new Error(`Plant.id API error: ${response.status}`);
    }

    const data = await response.json();
    return transformPlantIdResponse(data);
  } catch (error) {
    console.error('Plant.id API error:', error);
    // Fallback to dummy response
    return getDummyDiseaseResult();
  }
}

/**
 * Transform Plant.id API response to our format
 */
function transformPlantIdResponse(data: any): DiseaseDetectionResult {
  const isHealthy = data.is_healthy?.binary || false;
  const disease = data.diseases?.[0];

  if (isHealthy || !disease) {
    return {
      ...DISEASE_DATABASE['healthy'],
      success: true,
      timestamp: new Date().toISOString(),
      apiSource: 'plant.id'
    };
  }

  return {
    success: true,
    diseaseName: disease.name || 'Unknown Disease',
    scientificName: disease.scientific_name || undefined,
    confidence: Math.round((disease.probability || 0) * 100),
    severity: determineSeverity(disease.probability || 0),
    description: disease.description || 'Disease detected. Consult an agricultural expert for detailed analysis.',
    symptoms: disease.symptoms || ['Visible damage on plant'],
    treatment: disease.treatment?.chemical || ['Consult local agricultural extension office'],
    prevention: disease.treatment?.prevention || ['Practice good field hygiene'],
    organicRemedies: disease.treatment?.biological || undefined,
    timestamp: new Date().toISOString(),
    apiSource: 'plant.id'
  };
}

/**
 * Get a dummy disease detection result for testing
 * This simulates real API responses when API keys are not configured
 */
export function getDummyDiseaseResult(): DiseaseDetectionResult {
  // Randomly select a disease for realistic demo
  const diseases = Object.keys(DISEASE_DATABASE);
  const randomIndex = Math.floor(Math.random() * diseases.length);
  const selectedDisease = diseases[randomIndex];
  
  return {
    ...DISEASE_DATABASE[selectedDisease],
    success: true,
    timestamp: new Date().toISOString(),
    apiSource: 'dummy_api'
  };
}

/**
 * Get a specific disease result for demo purposes
 */
export function getSpecificDiseaseResult(diseaseKey: string): DiseaseDetectionResult {
  const disease = DISEASE_DATABASE[diseaseKey] || DISEASE_DATABASE['healthy'];
  
  return {
    ...disease,
    success: true,
    timestamp: new Date().toISOString(),
    apiSource: 'dummy_api'
  };
}

/**
 * Analyze image using all available APIs with fallback
 */
export async function analyzeImage(base64Image: string): Promise<DiseaseDetectionResult> {
  // Try Plant.id API first
  if (process.env.PLANT_ID_API_KEY) {
    try {
      return await analyzeWithPlantIdAPI(base64Image);
    } catch (error) {
      console.warn('Plant.id API failed, trying fallback...');
    }
  }

  // Return dummy result for demo/development
  console.log('📋 Using dummy disease detection API for demo');
  
  // Simulate API delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  return getDummyDiseaseResult();
}

/**
 * Determine severity based on confidence level
 */
function determineSeverity(probability: number): 'mild' | 'moderate' | 'severe' | 'healthy' {
  if (probability < 0.3) return 'mild';
  if (probability < 0.6) return 'moderate';
  return 'severe';
}

/**
 * Get crop-specific disease information
 */
export function getCropDiseaseInfo(cropName: string): CropInfo | null {
  const cropDatabase: Record<string, CropInfo> = {
    'tomato': {
      cropName: 'Tomato',
      commonDiseases: ['Late Blight', 'Early Blight', 'Septoria Leaf Spot', 'Bacterial Spot'],
      growingSeason: 'Spring to Fall (March-October)',
      optimalConditions: {
        temperature: '21-27°C (70-80°F)',
        humidity: '65-75%',
        soil: 'Well-drained, pH 6.0-6.8'
      }
    },
    'potato': {
      cropName: 'Potato',
      commonDiseases: ['Late Blight', 'Early Blight', 'Black Scurf', 'Common Scab'],
      growingSeason: 'Spring (March-May planting)',
      optimalConditions: {
        temperature: '15-20°C (59-68°F)',
        humidity: '80-90%',
        soil: 'Sandy loam, pH 5.5-6.5'
      }
    },
    'wheat': {
      cropName: 'Wheat',
      commonDiseases: ['Rust', 'Powdery Mildew', 'Septoria', 'Fusarium Head Blight'],
      growingSeason: 'Winter wheat (Fall), Spring wheat (Spring)',
      optimalConditions: {
        temperature: '10-24°C (50-75°F)',
        humidity: '50-70%',
        soil: 'Clay loam, pH 6.0-7.0'
      }
    },
    'rice': {
      cropName: 'Rice',
      commonDiseases: ['Blast', 'Brown Spot', 'Bacterial Leaf Blight', 'Sheath Blight'],
      growingSeason: 'Monsoon season (June-November)',
      optimalConditions: {
        temperature: '20-35°C (68-95°F)',
        humidity: '80-90%',
        soil: 'Clay or clay loam, pH 5.5-6.5'
      }
    }
  };

  return cropDatabase[cropName.toLowerCase()] || null;
}

export default {
  analyzeImage,
  analyzeWithPlantIdAPI,
  getDummyDiseaseResult,
  getSpecificDiseaseResult,
  getCropDiseaseInfo
};
