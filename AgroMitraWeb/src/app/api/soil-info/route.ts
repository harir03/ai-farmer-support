import { NextRequest, NextResponse } from "next/server";

// USDA Soil Texture Classification
interface SoilTexture {
  type: string;
  description: string;
}

// Function to classify soil texture based on clay, sand, and silt percentages
function classifySoilTexture(clay: number, sand: number, silt: number): SoilTexture {
  // Normalize percentages to ensure they sum to 100
  const total = clay + sand + silt;
  const normalizedClay = (clay / total) * 100;
  const normalizedSand = (sand / total) * 100;
  const normalizedSilt = (silt / total) * 100;

  // USDA Soil Texture Classification Logic
  if (normalizedSand >= 85 && normalizedClay <= 10) {
    return { type: "Sand", description: "Very coarse-textured soil with excellent drainage" };
  }
  
  if (normalizedSand >= 70 && normalizedSand < 85 && normalizedClay <= 15) {
    return { type: "Loamy Sand", description: "Coarse-textured soil with good drainage" };
  }
  
  if (normalizedSand >= 43 && normalizedSand < 85 && normalizedClay <= 20) {
    return { type: "Sandy Loam", description: "Well-draining soil, good for many crops" };
  }
  
  if (normalizedSilt >= 50 && normalizedClay >= 12 && normalizedClay < 27) {
    return { type: "Silt Loam", description: "Fertile soil with good water retention" };
  }
  
  if (normalizedSilt >= 80 && normalizedClay < 12) {
    return { type: "Silt", description: "Fine-textured soil with high water retention" };
  }
  
  if (normalizedSand >= 20 && normalizedSand <= 45 && normalizedClay >= 27 && normalizedClay < 40) {
    return { type: "Clay Loam", description: "Heavy soil with excellent nutrient retention" };
  }
  
  if (normalizedSand >= 45 && normalizedClay >= 20 && normalizedClay < 35) {
    return { type: "Sandy Clay Loam", description: "Moderately heavy soil with good structure" };
  }
  
  if (normalizedSilt >= 28 && normalizedClay >= 40) {
    return { type: "Silty Clay Loam", description: "Heavy soil with high fertility potential" };
  }
  
  if (normalizedSand >= 45 && normalizedClay >= 35) {
    return { type: "Sandy Clay", description: "Heavy soil with drainage challenges" };
  }
  
  if (normalizedSilt >= 40 && normalizedClay >= 40) {
    return { type: "Silty Clay", description: "Very heavy soil with water retention issues" };
  }
  
  if (normalizedClay >= 40) {
    return { type: "Clay", description: "Very heavy soil requiring careful management" };
  }
  
  // Default to loam if no specific category matches
  return { type: "Loam", description: "Well-balanced soil ideal for most crops" };
}

// Function to fetch soil property from ISRIC API
async function fetchSoilProperty(lat: number, lon: number, property: string): Promise<number | null> {
  try {
    const apiUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lat=${lat}&lon=${lon}&property=${property}&depth=0-5cm&value=mean`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AIFarmCare/1.0'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${property}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Extract the mean value from the response
    if (data && data.properties && data.properties[property] && data.properties[property].depths) {
      const depthData = data.properties[property].depths.find((d: any) => d.label === "0-5cm");
      if (depthData && depthData.values && depthData.values.mean !== undefined) {
        return depthData.values.mean;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching ${property}:`, error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latitude = searchParams.get('lat') || searchParams.get('latitude');
    const longitude = searchParams.get('lon') || searchParams.get('longitude');

    // Validate input parameters
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing required parameters: latitude and longitude" },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude values" },
        { status: 400 }
      );
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json(
        { error: "Latitude must be between -90 and 90, longitude between -180 and 180" },
        { status: 400 }
      );
    }

    console.log(`Fetching soil data for coordinates: ${lat}, ${lon}`);

    // Fetch all soil properties in parallel
    const [clayRaw, sandRaw, siltRaw, phRaw, ocRaw] = await Promise.all([
      fetchSoilProperty(lat, lon, 'clay'),
      fetchSoilProperty(lat, lon, 'sand'),
      fetchSoilProperty(lat, lon, 'silt'),
      fetchSoilProperty(lat, lon, 'phh2o'),
      fetchSoilProperty(lat, lon, 'ocd') // Organic Carbon Density
    ]);

    // Check if we got valid data for texture analysis
    if (clayRaw === null || sandRaw === null || siltRaw === null) {
      console.log(`ISRIC data not available for coordinates: ${lat}, ${lon}. Generating regional estimates.`);
      
      // Generate realistic soil data based on geographic location
      const simulatedData = generateRegionalSoilData(lat, lon);
      
      return NextResponse.json({
        ...simulatedData,
        coordinates: { lat, lon },
        data_source: "Regional estimates (ISRIC data unavailable)",
        is_simulated: true,
        note: "ISRIC SoilGrids data not available for this location. Values are regional estimates.",
        fetched_at: new Date().toISOString()
      }, { status: 200 });
    }

    // Convert units and calculate percentages
    // ISRIC values are typically in g/kg, convert to percentages
    const clay = clayRaw / 10; // Convert g/kg to %
    const sand = sandRaw / 10; // Convert g/kg to %
    const silt = siltRaw / 10; // Convert g/kg to %
    
    // pH is typically in pH units * 10, so divide by 10
    const ph = phRaw ? phRaw / 10 : null;
    
    // Organic carbon is in dg/kg, convert to %
    const organicCarbon = ocRaw ? ocRaw / 100 : null;

    // Classify soil texture
    const soilTexture = classifySoilTexture(clay, sand, silt);

    // Prepare response data
    const soilData = {
      coordinates: { lat, lon },
      texture: {
        clay_percentage: Math.round(clay * 100) / 100,
        sand_percentage: Math.round(sand * 100) / 100,
        silt_percentage: Math.round(silt * 100) / 100,
        classification: soilTexture
      },
      chemical_properties: {
        ph: ph ? Math.round(ph * 100) / 100 : null,
        organic_carbon_percentage: organicCarbon ? Math.round(organicCarbon * 100) / 100 : null
      },
      raw_values: {
        clay_g_kg: clayRaw,
        sand_g_kg: sandRaw,
        silt_g_kg: siltRaw,
        ph_h2o_x10: phRaw,
        organic_carbon_dg_kg: ocRaw
      },
      recommendations: generateRecommendations(soilTexture.type, ph, organicCarbon),
      data_source: "ISRIC SoilGrids v2.0",
      depth: "0-5cm (topsoil)",
      fetched_at: new Date().toISOString()
    };

    return NextResponse.json(soilData, { status: 200 });

  } catch (error) {
    console.error("Error in soil-info API:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching soil data" },
      { status: 500 }
    );
  }
}

// Function to generate regional soil data based on geographic location
function generateRegionalSoilData(lat: number, lon: number) {
  // Regional soil characteristics based on geographic location
  let baseClayPercent, baseSandPercent, baseSiltPercent, basePh, baseOrganicCarbon;
  
  // North America (United States/Canada)
  if (lat >= 25 && lat <= 70 && lon >= -170 && lon <= -50) {
    if (lat >= 40 && lon >= -90 && lon <= -70) {
      // Northeastern US - more clay and organic matter
      baseClayPercent = 25 + Math.random() * 15; // 25-40%
      baseSandPercent = 30 + Math.random() * 25; // 30-55%
      basePh = 6.0 + Math.random() * 1.5; // 6.0-7.5
      baseOrganicCarbon = 2.0 + Math.random() * 2.0; // 2-4%
    } else if (lat >= 30 && lat <= 45 && lon >= -110 && lon <= -90) {
      // Midwest US - fertile agricultural soils
      baseClayPercent = 20 + Math.random() * 20; // 20-40%
      baseSandPercent = 25 + Math.random() * 30; // 25-55%
      basePh = 6.5 + Math.random() * 1.0; // 6.5-7.5
      baseOrganicCarbon = 2.5 + Math.random() * 2.0; // 2.5-4.5%
    } else {
      // General North American soil
      baseClayPercent = 20 + Math.random() * 25; // 20-45%
      baseSandPercent = 30 + Math.random() * 35; // 30-65%
      basePh = 6.0 + Math.random() * 2.0; // 6.0-8.0
      baseOrganicCarbon = 1.5 + Math.random() * 2.5; // 1.5-4.0%
    }
  }
  // Europe
  else if (lat >= 35 && lat <= 70 && lon >= -10 && lon <= 45) {
    baseClayPercent = 25 + Math.random() * 20; // 25-45%
    baseSandPercent = 25 + Math.random() * 30; // 25-55%
    basePh = 6.5 + Math.random() * 1.5; // 6.5-8.0
    baseOrganicCarbon = 2.0 + Math.random() * 3.0; // 2-5%
  }
  // Asia
  else if (lat >= 10 && lat <= 55 && lon >= 60 && lon <= 150) {
    baseClayPercent = 30 + Math.random() * 25; // 30-55%
    baseSandPercent = 20 + Math.random() * 35; // 20-55%
    basePh = 5.5 + Math.random() * 2.5; // 5.5-8.0
    baseOrganicCarbon = 1.0 + Math.random() * 2.5; // 1-3.5%
  }
  // Default (global average)
  else {
    baseClayPercent = 25 + Math.random() * 20; // 25-45%
    baseSandPercent = 30 + Math.random() * 30; // 30-60%
    basePh = 6.0 + Math.random() * 2.0; // 6.0-8.0
    baseOrganicCarbon = 1.5 + Math.random() * 2.0; // 1.5-3.5%
  }
  
  // Ensure percentages add up to approximately 100%
  baseSiltPercent = 100 - baseClayPercent - baseSandPercent;
  if (baseSiltPercent < 5) {
    baseSiltPercent = 5 + Math.random() * 15;
    const total = baseClayPercent + baseSandPercent + baseSiltPercent;
    baseClayPercent = (baseClayPercent / total) * 100;
    baseSandPercent = (baseSandPercent / total) * 100;
    baseSiltPercent = (baseSiltPercent / total) * 100;
  }
  
  // Round to realistic precision
  const clay = Math.round(baseClayPercent * 10) / 10;
  const sand = Math.round(baseSandPercent * 10) / 10;
  const silt = Math.round(baseSiltPercent * 10) / 10;
  const ph = Math.round(basePh * 10) / 10;
  const organicCarbon = Math.round(baseOrganicCarbon * 10) / 10;
  
  // Classify soil texture
  const soilTexture = classifySoilTexture(clay, sand, silt);
  
  return {
    texture: {
      clay_percentage: clay,
      sand_percentage: sand,
      silt_percentage: silt,
      classification: soilTexture
    },
    chemical_properties: {
      ph: ph,
      organic_carbon_percentage: organicCarbon
    },
    recommendations: generateRecommendations(soilTexture.type, ph, organicCarbon)
  };
}

// Function to generate farming recommendations based on soil properties
function generateRecommendations(soilType: string, ph: number | null, organicCarbon: number | null) {
  const recommendations = [];

  // Texture-based recommendations
  switch (soilType) {
    case "Sand":
      recommendations.push("Improve water retention with organic matter");
      recommendations.push("Consider drip irrigation for water efficiency");
      recommendations.push("Add compost regularly to increase nutrient retention");
      break;
    case "Clay":
      recommendations.push("Improve drainage with raised beds or tile drainage");
      recommendations.push("Add organic matter to improve soil structure");
      recommendations.push("Avoid working soil when wet to prevent compaction");
      break;
    case "Loam":
      recommendations.push("Excellent soil for most crops");
      recommendations.push("Maintain organic matter levels with cover crops");
      break;
    default:
      recommendations.push("Monitor soil moisture levels regularly");
      break;
  }

  // pH-based recommendations
  if (ph !== null) {
    if (ph < 6.0) {
      recommendations.push("Consider liming to raise soil pH for better nutrient availability");
    } else if (ph > 8.0) {
      recommendations.push("Consider sulfur application to lower pH");
    } else {
      recommendations.push("pH levels are suitable for most crops");
    }
  }

  // Organic matter recommendations
  if (organicCarbon !== null) {
    if (organicCarbon < 1.0) {
      recommendations.push("Increase organic matter with compost or cover crops");
    } else if (organicCarbon > 3.0) {
      recommendations.push("Excellent organic matter levels - maintain current practices");
    }
  }

  return recommendations;
}