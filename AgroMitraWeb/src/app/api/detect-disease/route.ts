import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

interface DetectionResult {
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

    // Try Susya API first, with fallback to other services
    let diagnosis;
    
    try {
      diagnosis = await analyzeWithSusyaAPI(base64Image);
      console.log('✅ Susya API analysis successful');
    } catch (susyaError) {
      console.warn('⚠️ Susya API failed, trying fallback:', susyaError);
      
      // Fallback to Gemini API if available
      if (process.env.GEMINI_API_KEY) {
        try {
          diagnosis = await analyzeWithGemini(base64Image, imageFile.type);
          console.log('✅ Fallback to Gemini API successful');
        } catch (geminiError) {
          console.warn('⚠️ Gemini API also failed:', geminiError);
          throw new Error('Both Susya and Gemini APIs failed');
        }
      } else {
        throw new Error('Susya API failed and no fallback API configured');
      }
    }

    const result: DetectionResult = {
      success: true,
      diagnosis: diagnosis.text,
      confidence: diagnosis.confidence,
      recommendations: diagnosis.recommendations,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Disease detection error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Analyze using Susya API
async function analyzeWithSusyaAPI(base64Image: string) {
  const SUSYA_API_URL = "https://susya.onrender.com";

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
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    console.log(`📡 Susya API responded with status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Susya API error response: ${errorText}`);
      throw new Error(`Susya API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.text();
    const cleanResult = result.trim();
    
    console.log('📥 Raw Susya API response:', cleanResult.substring(0, 200) + '...');

    // Parse the response and extract relevant information
    const diagnosis = parseSusyaResponse(cleanResult);

    console.log('✅ Successfully parsed Susya API response');
    
    return {
      text: diagnosis.text,
      confidence: diagnosis.confidence,
      recommendations: diagnosis.recommendations
    };

  } catch (error) {
    console.error('❌ Susya API error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Susya API request timeout (30s exceeded)');
      }
      throw new Error(`Susya API failed: ${error.message}`);
    }
    
    throw new Error('Susya API failed with unknown error');
  }
}

// Parse Susya API response and structure it
function parseSusyaResponse(rawResponse: string) {
  try {
    // Try to parse as JSON first
    const jsonResponse = JSON.parse(rawResponse);
    
    if (jsonResponse.diagnosis || jsonResponse.disease || jsonResponse.result) {
      return {
        text: jsonResponse.diagnosis || jsonResponse.disease || jsonResponse.result || rawResponse,
        confidence: jsonResponse.confidence || extractConfidenceFromText(rawResponse),
        recommendations: jsonResponse.recommendations || jsonResponse.treatment || extractRecommendationsFromText(rawResponse)
      };
    }
  } catch {
    // If not JSON, treat as plain text
  }

  // Handle plain text response
  const text = rawResponse;
  const confidence = extractConfidenceFromText(text);
  const recommendations = extractRecommendationsFromText(text);

  return {
    text: text,
    confidence: confidence,
    recommendations: recommendations
  };
}

// Extract confidence level from text
function extractConfidenceFromText(text: string): number {
  const confidenceMatch = text.match(/confidence[:\s]*(\d+)%/i) || 
                         text.match(/accuracy[:\s]*(\d+)%/i) ||
                         text.match(/(\d+)%\s*confident/i);
  return confidenceMatch ? parseInt(confidenceMatch[1]) : 85; // Default confidence
}

// Extract recommendations from text
function extractRecommendationsFromText(text: string): string[] {
  const recommendations: string[] = [];
  
  // Look for numbered lists, bullet points, or structured recommendations
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^\d+\.\s/) || trimmed.match(/^[\-\*\•]\s/) || 
        trimmed.toLowerCase().includes('recommend') || 
        trimmed.toLowerCase().includes('treatment') ||
        trimmed.toLowerCase().includes('spray') ||
        trimmed.toLowerCase().includes('apply')) {
      const clean = trimmed.replace(/^\d+\.\s|^[\-\*\•]\s/, '').trim();
      if (clean.length > 10) {
        recommendations.push(clean);
      }
    }
  }
  
  // If no structured recommendations found, look for treatment/prevention sections
  if (recommendations.length === 0) {
    const treatmentMatch = text.match(/treatment[:\-\s]+(.*?)(?=prevention|control|$)/i);
    const preventionMatch = text.match(/prevention[:\-\s]+(.*?)(?=treatment|control|$)/i);
    const controlMatch = text.match(/control[:\-\s]+(.*?)$/i);
    
    if (treatmentMatch) recommendations.push(`Treatment: ${treatmentMatch[1].trim()}`);
    if (preventionMatch) recommendations.push(`Prevention: ${preventionMatch[1].trim()}`);
    if (controlMatch) recommendations.push(`Control: ${controlMatch[1].trim()}`);
  }
  
  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

// Analyze using Google Gemini Vision API (Fallback)
async function analyzeWithGemini(base64Image: string, mimeType: string) {

  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are an expert agricultural specialist analyzing this plant/crop image for diseases and health issues.
    
    Please analyze the image and provide:
    1. **Disease Identification**: Identify any diseases, pests, or health issues visible
    2. **Severity Assessment**: Rate the severity (Mild/Moderate/Severe)
    3. **Affected Parts**: Which parts of the plant are affected
    4. **Treatment Recommendations**: Specific treatments or interventions needed
    5. **Prevention Measures**: How to prevent this issue in the future
    6. **Confidence Level**: Your confidence in the diagnosis (0-100%)
    
    If the plant appears healthy, mention that clearly.
    If you cannot identify the plant or see issues clearly, mention the limitations.
    
    Format your response in a clear, farmer-friendly manner with actionable advice.
    Be specific about treatments and include organic/natural options when possible.
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

    // Extract confidence level if mentioned in the response
    const confidenceMatch = text.match(/confidence[:\s]*(\d+)%/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 85;

    // Extract recommendations (simple parsing - you can make this more sophisticated)
    const recommendations = extractRecommendations(text);

    return {
      text: text,
      confidence: confidence,
      recommendations: recommendations
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to analyze image with Gemini API');
  }
}

// Analyze using OpenAI Vision API (alternative)
async function analyzeWithOpenAI(base64Image: string) {
  const OpenAI = require('openai');
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert agricultural specialist. Analyze this plant/crop image for diseases, pests, or health issues. Provide:
              1. Disease identification (if any)
              2. Severity level (Mild/Moderate/Severe)
              3. Treatment recommendations
              4. Prevention measures
              5. Confidence level (0-100%)
              
              If no disease is detected, mention the plant appears healthy.
              Keep the response practical and farmer-friendly.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const text = response.choices[0].message.content || 'Unable to analyze image';
    const confidenceMatch = text.match(/confidence[:\s]*(\d+)%/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 80;
    const recommendations = extractRecommendations(text);

    return {
      text: text,
      confidence: confidence,
      recommendations: recommendations
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to analyze image with OpenAI API');
  }
}

// Custom ML model analysis (placeholder)
async function analyzeWithCustomModel(base64Image: string) {
  // This is where you would integrate with your own trained model
  // For example, using TensorFlow.js, PyTorch serving, or a custom API
  
  try {
    // Example custom API call
    const response = await fetch(process.env.CUSTOM_MODEL_ENDPOINT || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CUSTOM_MODEL_API_KEY}`
      },
      body: JSON.stringify({
        image: base64Image,
        model: 'plant-disease-detection-v1'
      })
    });

    if (!response.ok) {
      throw new Error('Custom model API error');
    }

    const result = await response.json();
    
    return {
      text: result.diagnosis || 'Analysis completed',
      confidence: result.confidence || 75,
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error('Custom model error:', error);
    throw new Error('Failed to analyze image with custom model');
  }
}

// Helper function to extract recommendations from text
function extractRecommendations(text: string): string[] {
  const recommendations: string[] = [];
  
  // Look for numbered lists or bullet points
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^\d+\.\s/) || trimmed.match(/^[\-\*]\s/)) {
      // Remove numbering/bullets and add to recommendations
      const clean = trimmed.replace(/^\d+\.\s|^[\-\*]\s/, '').trim();
      if (clean.length > 10) { // Only meaningful recommendations
        recommendations.push(clean);
      }
    }
  }
  
  // If no structured recommendations found, look for treatment/prevention sections
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
  
  return recommendations.slice(0, 5); // Limit to 5 recommendations
}