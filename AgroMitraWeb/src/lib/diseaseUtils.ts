/**
 * Disease Detection Utility Functions
 * 
 * Provides additional features for the disease detection system:
 * - PDF Report Generation
 * - Treatment Cost Estimation
 * - Weather-Disease Correlation
 * - Voice Alerts
 * - Share functionality
 */

import { DiseaseDetectionResult } from './diseaseDetectionAPI';

// =====================
// TREATMENT COST DATABASE
// =====================
interface TreatmentCost {
    treatmentName: string;
    estimatedCost: {
        min: number;
        max: number;
        currency: string;
    };
    availability: 'common' | 'moderate' | 'rare';
    applicationMethod: string;
}

const TREATMENT_COSTS: Record<string, TreatmentCost[]> = {
    'Late Blight': [
        {
            treatmentName: 'Copper-based Fungicide (Bordeaux mixture)',
            estimatedCost: { min: 200, max: 400, currency: 'INR' },
            availability: 'common',
            applicationMethod: 'Foliar spray, 2-3 applications'
        },
        {
            treatmentName: 'Mancozeb 75% WP',
            estimatedCost: { min: 350, max: 600, currency: 'INR' },
            availability: 'common',
            applicationMethod: 'Spray every 7-10 days'
        },
        {
            treatmentName: 'Metalaxyl + Mancozeb',
            estimatedCost: { min: 500, max: 800, currency: 'INR' },
            availability: 'moderate',
            applicationMethod: 'Systemic spray application'
        }
    ],
    'Powdery Mildew': [
        {
            treatmentName: 'Sulfur-based Fungicide',
            estimatedCost: { min: 150, max: 300, currency: 'INR' },
            availability: 'common',
            applicationMethod: 'Dust or spray application'
        },
        {
            treatmentName: 'Potassium Bicarbonate',
            estimatedCost: { min: 100, max: 200, currency: 'INR' },
            availability: 'common',
            applicationMethod: 'Foliar spray'
        },
        {
            treatmentName: 'Neem Oil (Organic)',
            estimatedCost: { min: 180, max: 350, currency: 'INR' },
            availability: 'common',
            applicationMethod: 'Weekly spray application'
        }
    ],
    'Bacterial Leaf Spot': [
        {
            treatmentName: 'Copper Hydroxide',
            estimatedCost: { min: 250, max: 450, currency: 'INR' },
            availability: 'common',
            applicationMethod: 'Preventive spray'
        },
        {
            treatmentName: 'Streptomycin Sulfate',
            estimatedCost: { min: 400, max: 700, currency: 'INR' },
            availability: 'moderate',
            applicationMethod: 'As directed by agricultural officer'
        }
    ],
    'Rust Disease': [
        {
            treatmentName: 'Tebuconazole Fungicide',
            estimatedCost: { min: 450, max: 750, currency: 'INR' },
            availability: 'moderate',
            applicationMethod: 'Systemic spray'
        },
        {
            treatmentName: 'Sulfur Dust',
            estimatedCost: { min: 100, max: 200, currency: 'INR' },
            availability: 'common',
            applicationMethod: 'Dusting application'
        }
    ],
    'Nutrient Deficiency': [
        {
            treatmentName: 'NPK Fertilizer (19-19-19)',
            estimatedCost: { min: 300, max: 500, currency: 'INR' },
            availability: 'common',
            applicationMethod: 'Soil application'
        },
        {
            treatmentName: 'Micronutrient Mixture',
            estimatedCost: { min: 200, max: 400, currency: 'INR' },
            availability: 'common',
            applicationMethod: 'Foliar spray'
        },
        {
            treatmentName: 'Organic Compost',
            estimatedCost: { min: 150, max: 300, currency: 'INR' },
            availability: 'common',
            applicationMethod: 'Soil incorporation'
        }
    ]
};

// =====================
// WEATHER-DISEASE CORRELATION
// =====================
interface WeatherCondition {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    rainfall: 'none' | 'light' | 'moderate' | 'heavy';
    riskLevel: 'low' | 'medium' | 'high' | 'very_high';
}

const DISEASE_WEATHER_CONDITIONS: Record<string, WeatherCondition> = {
    'Late Blight': {
        temperature: { min: 10, max: 25 },
        humidity: { min: 80, max: 100 },
        rainfall: 'moderate',
        riskLevel: 'very_high'
    },
    'Powdery Mildew': {
        temperature: { min: 20, max: 30 },
        humidity: { min: 40, max: 70 },
        rainfall: 'none',
        riskLevel: 'high'
    },
    'Bacterial Leaf Spot': {
        temperature: { min: 25, max: 35 },
        humidity: { min: 70, max: 90 },
        rainfall: 'light',
        riskLevel: 'high'
    },
    'Rust Disease': {
        temperature: { min: 15, max: 25 },
        humidity: { min: 60, max: 80 },
        rainfall: 'light',
        riskLevel: 'medium'
    }
};

// =====================
// UTILITY FUNCTIONS
// =====================

/**
 * Get treatment cost estimates for a detected disease
 */
export function getTreatmentCosts(diseaseName: string): TreatmentCost[] {
    return TREATMENT_COSTS[diseaseName] || TREATMENT_COSTS['Nutrient Deficiency'];
}

/**
 * Calculate total estimated treatment cost
 */
export function calculateTotalCost(diseaseName: string, areaInAcres: number = 1): {
    minimum: number;
    maximum: number;
    currency: string;
} {
    const treatments = getTreatmentCosts(diseaseName);
    let minTotal = 0;
    let maxTotal = 0;

    treatments.forEach(t => {
        minTotal += t.estimatedCost.min;
        maxTotal += t.estimatedCost.max;
    });

    return {
        minimum: minTotal * areaInAcres,
        maximum: maxTotal * areaInAcres,
        currency: 'INR'
    };
}

/**
 * Get weather-based disease risk assessment
 */
export function getWeatherRisk(
    diseaseName: string,
    currentTemp: number,
    currentHumidity: number
): {
    riskLevel: 'low' | 'medium' | 'high' | 'very_high';
    riskPercentage: number;
    recommendation: string;
} {
    const conditions = DISEASE_WEATHER_CONDITIONS[diseaseName];

    if (!conditions) {
        return {
            riskLevel: 'low',
            riskPercentage: 20,
            recommendation: 'Current weather conditions are not particularly favorable for this disease.'
        };
    }

    let riskScore = 0;

    // Check temperature match
    if (currentTemp >= conditions.temperature.min && currentTemp <= conditions.temperature.max) {
        riskScore += 40;
    } else if (
        currentTemp >= conditions.temperature.min - 5 &&
        currentTemp <= conditions.temperature.max + 5
    ) {
        riskScore += 20;
    }

    // Check humidity match
    if (currentHumidity >= conditions.humidity.min && currentHumidity <= conditions.humidity.max) {
        riskScore += 40;
    } else if (
        currentHumidity >= conditions.humidity.min - 10 &&
        currentHumidity <= conditions.humidity.max + 10
    ) {
        riskScore += 20;
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'very_high' = 'low';
    let recommendation = '';

    if (riskScore >= 70) {
        riskLevel = 'very_high';
        recommendation = 'ALERT: Weather conditions are highly favorable for this disease. Take immediate preventive measures!';
    } else if (riskScore >= 50) {
        riskLevel = 'high';
        recommendation = 'Weather conditions are conducive to disease spread. Consider preventive fungicide application.';
    } else if (riskScore >= 30) {
        riskLevel = 'medium';
        recommendation = 'Moderate risk. Monitor plants closely and maintain good field hygiene.';
    } else {
        riskLevel = 'low';
        recommendation = 'Low risk currently. Continue regular monitoring practices.';
    }

    return {
        riskLevel,
        riskPercentage: Math.min(riskScore + 20, 100),
        recommendation
    };
}

/**
 * Generate voice alert message for disease detection
 */
export function generateVoiceAlert(result: DiseaseDetectionResult): string {
    if (result.severity === 'healthy') {
        return `Great news! Your plant appears to be healthy with ${result.confidence}% confidence. Keep up the good practices!`;
    }

    const severityMessages = {
        mild: 'Minor issue detected.',
        moderate: 'Attention needed.',
        severe: 'Alert! Serious condition detected.'
    };

    const message = `${severityMessages[result.severity]} ${result.diseaseName} detected with ${result.confidence}% confidence. 
    ${result.treatment?.[0] ? `Recommended action: ${result.treatment[0]}` : 'Please consult an agricultural expert.'}`;

    return message;
}

/**
 * Speak the alert message using Web Speech API
 */
export function speakAlert(message: string, lang: string = 'en-US'): void {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        window.speechSynthesis.speak(utterance);
    }
}

/**
 * Generate shareable text summary
 */
export function generateShareableText(result: DiseaseDetectionResult): string {
    const text = `
🌱 Crop Disease Detection Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Detection: ${result.diseaseName}
${result.scientificName ? `🔬 Scientific: ${result.scientificName}` : ''}
📊 Confidence: ${result.confidence}%
⚠️ Severity: ${result.severity.toUpperCase()}

📝 Description:
${result.description}

🩺 Symptoms:
${result.symptoms?.map(s => `• ${s}`).join('\n') || 'N/A'}

💊 Treatment:
${result.treatment?.map(t => `✓ ${t}`).join('\n') || 'Consult agricultural expert'}

🛡️ Prevention:
${result.prevention?.map(p => `→ ${p}`).join('\n') || 'N/A'}

📅 Detected: ${new Date(result.timestamp).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Powered by AgroMitra AI
`;

    return text.trim();
}

/**
 * Share detection result via Web Share API or copy to clipboard
 */
export async function shareDetectionResult(result: DiseaseDetectionResult): Promise<boolean> {
    const text = generateShareableText(result);

    if (navigator.share) {
        try {
            await navigator.share({
                title: `Disease Detection: ${result.diseaseName}`,
                text: text,
            });
            return true;
        } catch (error) {
            console.error('Share failed:', error);
        }
    }

    // Fallback to clipboard
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Clipboard copy failed:', error);
        return false;
    }
}

/**
 * Generate PDF Report Data (to be used with a PDF library)
 */
export function generateReportData(result: DiseaseDetectionResult, imageDataUrl?: string) {
    const costs = calculateTotalCost(result.diseaseName);

    return {
        title: 'Crop Disease Detection Report',
        generatedAt: new Date().toISOString(),
        detection: {
            diseaseName: result.diseaseName,
            scientificName: result.scientificName,
            confidence: result.confidence,
            severity: result.severity,
            description: result.description,
            detectedAt: result.timestamp
        },
        symptoms: result.symptoms || [],
        treatment: result.treatment || [],
        prevention: result.prevention || [],
        organicRemedies: result.organicRemedies || [],
        estimatedCost: costs,
        treatmentDetails: getTreatmentCosts(result.diseaseName),
        imageAnalysis: result.imageAnalysis,
        image: imageDataUrl,
        yieldImpact: result.estimatedYieldImpact
    };
}

/**
 * Download detection report as JSON
 */
export function downloadReportAsJSON(result: DiseaseDetectionResult): void {
    const reportData = generateReportData(result);
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `disease-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Download detection report as text file
 */
export function downloadReportAsText(result: DiseaseDetectionResult): void {
    const text = generateShareableText(result);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `disease-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// =====================
// NEARBY EXPERTS DATA
// =====================
interface AgriculturalExpert {
    id: string;
    name: string;
    specialization: string[];
    phone: string;
    email?: string;
    address: string;
    distance?: number;
    rating: number;
    available: boolean;
}

// Sample expert data (In production, this would come from an API)
const SAMPLE_EXPERTS: AgriculturalExpert[] = [
    {
        id: '1',
        name: 'Dr. Rajesh Kumar',
        specialization: ['Plant Pathology', 'Fungal Diseases'],
        phone: '+91 98765 43210',
        email: 'rajesh.kumar@agri.gov.in',
        address: 'Krishi Vigyan Kendra, District Center',
        rating: 4.8,
        available: true
    },
    {
        id: '2',
        name: 'Agricultural Extension Officer',
        specialization: ['Crop Protection', 'Pest Management'],
        phone: '+91 1800-180-1551',
        email: 'help@agriculture.gov.in',
        address: 'District Agriculture Office',
        rating: 4.5,
        available: true
    },
    {
        id: '3',
        name: 'KVK - Krishi Vigyan Kendra',
        specialization: ['All Crops', 'Training', 'Demonstrations'],
        phone: 'Check local KVK number',
        address: 'Available in every district',
        rating: 4.7,
        available: true
    }
];

/**
 * Get nearby agricultural experts (mock implementation)
 */
export function getNearbyExperts(): AgriculturalExpert[] {
    return SAMPLE_EXPERTS;
}

/**
 * Get helpline numbers based on severity
 */
export function getEmergencyContacts(severity: string): { name: string; number: string }[] {
    const contacts = [
        { name: 'Kisan Call Center', number: '1551' },
        { name: 'Agriculture Helpline', number: '1800-180-1551' }
    ];

    if (severity === 'severe') {
        contacts.unshift({ name: 'Emergency Crop Advisory', number: '14447' });
    }

    return contacts;
}

export default {
    getTreatmentCosts,
    calculateTotalCost,
    getWeatherRisk,
    generateVoiceAlert,
    speakAlert,
    shareDetectionResult,
    generateReportData,
    downloadReportAsJSON,
    downloadReportAsText,
    getNearbyExperts,
    getEmergencyContacts
};
