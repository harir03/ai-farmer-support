import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage, getDummyDiseaseResult, DiseaseDetectionResult } from '@/lib/diseaseDetectionAPI';

/**
 * Crop Disease Detection API Route
 * 
 * This endpoint analyzes plant images for diseases using multiple AI services.
 * 
 * REQUIRED API KEYS (add to .env.local):
 * - PLANT_ID_API_KEY: Get from https://web.plant.id/
 * - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey
 * - OPENAI_API_KEY: (Optional) Get from https://platform.openai.com/api-keys
 * 
 * When API keys are not configured, the endpoint returns realistic dummy data
 * for development and demo purposes.
 */

interface LegacyDetectionResult {
  success: boolean;
  diagnosis: string;
  confidence?: number;
  recommendations?: string[];
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    console.log('🔍 Starting disease detection analysis...');

    // Try multiple detection methods with fallback
    let result: DiseaseDetectionResult;

    try {
      // Method 1: Try Susya API (original implementation)
      if (process.env.SUSYA_API_URL) {
        console.log('📡 Attempting Susya API...');
        const susyaResult = await analyzeWithSusyaAPI(base64Image);
        result = transformToNewFormat(susyaResult);
      }
      // Method 2: Try Plant.id API
      else if (process.env.PLANT_ID_API_KEY) {
        console.log('📡 Attempting Plant.id API...');
        result = await analyzeImage(base64Image);
      }
      // Method 3: Try Gemini Vision API
      else if (process.env.GEMINI_API_KEY) {
        console.log('📡 Attempting Gemini Vision API...');
        const geminiResult = await analyzeWithGemini(base64Image, imageFile.type);
        result = transformToNewFormat(geminiResult);
      }
      // Method 4: Use dummy API for demo
      else {
        console.log('📋 Using Dummy API for demo (no API keys configured)');
        // Simulate network delay for realistic UX
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        result = getDummyDiseaseResult();
      }
    } catch (apiError) {
      console.warn('⚠️ All APIs failed, using dummy response:', apiError);
      result = getDummyDiseaseResult();
    }

    console.log('✅ Disease detection completed:', result.diseaseName);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Disease detection error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Transform legacy format to new enhanced format
 */
function transformToNewFormat(legacyResult: {
  text: string;
  confidence: number;
  recommendations?: string[];
}): DiseaseDetectionResult {
  return {
    success: true,
    diseaseName: extractDiseaseName(legacyResult.text),
    confidence: legacyResult.confidence,
    severity: determineSeverity(legacyResult.confidence),
    description: legacyResult.text,
    symptoms: extractSymptoms(legacyResult.text),
    treatment: legacyResult.recommendations || extractRecommendations(legacyResult.text),
    prevention: extractPrevention(legacyResult.text),
    timestamp: new Date().toISOString(),
    apiSource: 'legacy_api'
  };
}

/**
 * Extract disease name from analysis text
 */
function extractDiseaseName(text: string): string {
  // Common patterns for disease names
  const patterns = [
    /disease[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /diagnosis[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /identified[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /detected[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // Check for common disease keywords
  const diseaseKeywords = [
    'Late Blight', 'Early Blight', 'Powdery Mildew', 'Rust',
    'Bacterial Spot', 'Leaf Spot', 'Mosaic Virus', 'Wilt',
    'Anthracnose', 'Downy Mildew', 'Root Rot'
  ];

  for (const disease of diseaseKeywords) {
    if (text.toLowerCase().includes(disease.toLowerCase())) {
      return disease;
    }
  }

  // Check if plant appears healthy
  if (text.toLowerCase().includes('healthy') && !text.toLowerCase().includes('unhealthy')) {
    return 'Healthy Plant';
  }

  return 'Disease Detected';
}

/**
 * Determine severity based on confidence and keywords
 */
function determineSeverity(confidence: number): 'mild' | 'moderate' | 'severe' | 'healthy' {
  if (confidence >= 90) return 'severe';
  if (confidence >= 70) return 'moderate';
  if (confidence >= 50) return 'mild';
  return 'healthy';
}

/**
 * Extract symptoms from analysis text
 */
function extractSymptoms(text: string): string[] {
  const symptoms: string[] = [];
  const lines = text.split('\n');

  let inSymptomSection = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().includes('symptom')) {
      inSymptomSection = true;
      continue;
    }
    if (inSymptomSection && (trimmed.match(/^[\-\*\•\d]/) || trimmed.length > 10)) {
      const clean = trimmed.replace(/^[\d\.\-\*\•]\s*/, '').trim();
      if (clean.length > 5) symptoms.push(clean);
    }
    if (inSymptomSection && trimmed.length === 0) {
      inSymptomSection = false;
    }
  }

  return symptoms.slice(0, 5);
}

/**
 * Extract prevention measures from text
 */
function extractPrevention(text: string): string[] {
  const prevention: string[] = [];
  const lines = text.split('\n');

  let inPreventionSection = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().includes('prevention') || trimmed.toLowerCase().includes('prevent')) {
      inPreventionSection = true;
      continue;
    }
    if (inPreventionSection && (trimmed.match(/^[\-\*\•\d]/) || trimmed.length > 10)) {
      const clean = trimmed.replace(/^[\d\.\-\*\•]\s*/, '').trim();
      if (clean.length > 5) prevention.push(clean);
    }
    if (inPreventionSection && trimmed.length === 0) {
      inPreventionSection = false;
    }
  }

  return prevention.slice(0, 5);
}

// ========================
// LEGACY API INTEGRATIONS
// ========================

/**
 * Analyze using Susya API (original implementation)
 */
async function analyzeWithSusyaAPI(base64Image: string) {
  const SUSYA_API_URL = process.env.SUSYA_API_URL || "https://susya.onrender.com";

  try {
    console.log('🚀 Sending request to Susya API...');

    const response = await fetch(SUSYA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-FarmCare-WebApp/1.0',
      },
      body: JSON.stringify({
        image: base64Image
      }),
      signal: AbortSignal.timeout(30000),
    });

    console.log(`📡 Susya API responded with status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Susya API error response: ${errorText}`);
      throw new Error(`Susya API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.text();
    const cleanResult = result.trim();

    console.log('📥 Raw Susya API response:', cleanResult.substring(0, 200) + '...');

    return parseSusyaResponse(cleanResult);

  } catch (error) {
    console.error('❌ Susya API error:', error);
    throw error;
  }
}

/**
 * Parse Susya API response
 */
function parseSusyaResponse(rawResponse: string) {
  try {
    const jsonResponse = JSON.parse(rawResponse);

    if (jsonResponse.diagnosis || jsonResponse.disease || jsonResponse.result) {
      return {
        text: jsonResponse.diagnosis || jsonResponse.disease || jsonResponse.result || rawResponse,
        confidence: jsonResponse.confidence || extractConfidenceFromText(rawResponse),
        recommendations: jsonResponse.recommendations || jsonResponse.treatment || extractRecommendations(rawResponse)
      };
    }
  } catch {
    // Not JSON, treat as plain text
  }

  return {
    text: rawResponse,
    confidence: extractConfidenceFromText(rawResponse),
    recommendations: extractRecommendations(rawResponse)
  };
}

/**
 * Analyze using Google Gemini Vision API
 */
async function analyzeWithGemini(base64Image: string, mimeType: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are an expert agricultural specialist analyzing this plant/crop image for diseases and health issues.
    
    Please analyze the image and provide a structured response with:
    
    1. **Disease Name**: Identify the disease (or "Healthy Plant" if none detected)
    2. **Scientific Name**: If known
    3. **Severity**: Mild, Moderate, or Severe
    4. **Confidence Level**: 0-100%
    5. **Description**: Brief explanation of the condition
    
    6. **Symptoms**:
    - List visible symptoms (one per line)
    
    7. **Treatment Recommendations**:
    - List specific treatments (one per line)
    
    8. **Prevention Measures**:
    - List prevention steps (one per line)
    
    9. **Organic Remedies**:
    - List natural/organic treatment options
    
    10. **Estimated Yield Impact**: How this might affect crop yield
    
    Be specific, practical, and farmer-friendly. Include both chemical and organic treatment options.
  `;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const confidenceMatch = text.match(/confidence[:\s]*([\d]+)%/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 85;

    return {
      text: text,
      confidence: confidence,
      recommendations: extractRecommendations(text)
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to analyze image with Gemini API');
  }
}

/**
 * Extract confidence level from text
 */
function extractConfidenceFromText(text: string): number {
  const confidenceMatch = text.match(/confidence[:\s]*([\d]+)%/i) ||
    text.match(/accuracy[:\s]*([\d]+)%/i) ||
    text.match(/([\d]+)%\s*confident/i);
  return confidenceMatch ? parseInt(confidenceMatch[1]) : 85;
}

/**
 * Extract recommendations from text
 */
function extractRecommendations(text: string): string[] {
  const recommendations: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^[\d]+\.\s/) || trimmed.match(/^[\-\*\•]\s/)) {
      const clean = trimmed.replace(/^[\d]+\.\s|^[\-\*\•]\s/, '').trim();
      if (clean.length > 10) {
        recommendations.push(clean);
      }
    }
  }

  if (recommendations.length === 0) {
    const treatmentMatch = text.match(/treatment[s]?[:\-\s]+(.*?)(?=prevention|$)/i);
    const preventionMatch = text.match(/prevention[:\-\s]+(.*?)$/i);

    if (treatmentMatch) {
      recommendations.push(`Treatment: ${treatmentMatch[1].trim()}`);
    }
    if (preventionMatch) {
      recommendations.push(`Prevention: ${preventionMatch[1].trim()}`);
    }
  }

  return recommendations.slice(0, 5);
}