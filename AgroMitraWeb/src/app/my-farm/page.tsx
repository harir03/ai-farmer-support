"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { componentClasses } from '@/lib/theme';
import { StatsCard, InfoCard, InstructionCard } from '@/components/ui/Cards';
import { FarmService, FarmData } from '@/lib/farmService';
import AreaCalc from './AreaCalc';

function calculatePerimeter(coordinates: Array<{ lat: number; lng: number }>): number {
  if (coordinates.length < 2) return 0;
  
  let perimeter = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const current = coordinates[i];
    const next = coordinates[(i + 1) % coordinates.length];
    perimeter += haversineDistance(current, next);
  }
  return perimeter;
}

function haversineDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getPolygonCenter(coordinates: Array<{ lat: number; lng: number }>): { lat: number; lng: number } {
  if (coordinates.length === 0) return { lat: 0, lng: 0 };
  
  let sumLat = 0;
  let sumLng = 0;
  coordinates.forEach(coord => {
    sumLat += coord.lat;
    sumLng += coord.lng;
  });
  
  return {
    lat: sumLat / coordinates.length,
    lng: sumLng / coordinates.length
  };
}

export default function MyFarmPage() {
  const [farms, setFarms] = useState<FarmData[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [soilDataLoading, setSoilDataLoading] = useState<string[]>([]);
  const [soilDataCache, setSoilDataCache] = useState<{[key: string]: any}>({});
  const [newFarmData, setNewFarmData] = useState({
    name: '',
    cropType: 'Mixed Crops',
    soilType: '',
    irrigationType: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [autoStartMapping, setAutoStartMapping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [voiceLoading, setVoiceLoading] = useState(true);

  // Voice synthesis function
  const speakText = (text: string) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // Slightly slower for instructions
    utterance.pitch = 1;
    utterance.volume = 0.9;
    
    // Try to find a clear English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.includes('en') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft'))
    );
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Generate farm instructions
  const generateFarmInstructions = () => {
    return "Welcome to My Farm! To find the area of your field, click on 'Find My Location', then wait for 4 seconds, and then click 'Draw Boundary'. Click on the dots to create the area and click on the first point to finish marking the area.";
  };

  // Function to toggle voice
  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (isVoiceEnabled) {
      window.speechSynthesis.cancel();
    }
  };

  // Function to repeat instructions
  const repeatInstructions = () => {
    const instructions = generateFarmInstructions();
    speakText(instructions);
  };

  const selectedFarm = farms.find(farm => farm.id === selectedFarmId);
  const activeFarms = farms.filter((farm: FarmData) => farm.isActive);

  useEffect(() => {
    const loadFarms = async () => {
      try {
        const userFarms = await FarmService.getUserFarms();
        setFarms(userFarms);
        
        // Auto-start mapping if no farms exist
        if (userFarms.length === 0) {
          setAutoStartMapping(true);
          setTimeout(() => {
            setShowMap(true);
            setSelectedFarmId(null);
          }, 500); // Small delay to ensure UI is ready
        }
      } catch (error) {
        console.error('Error loading farms:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFarms();
  }, []);

  // Voice system initialization and automatic instructions
  useEffect(() => {
    const initializeVoice = () => {
      if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            if (isVoiceEnabled && !loading) {
              const instructions = generateFarmInstructions();
              setTimeout(() => speakText(instructions), 1000);
            }
            setVoiceLoading(false);
          };
        } else {
          if (isVoiceEnabled && !loading) {
            const instructions = generateFarmInstructions();
            setTimeout(() => speakText(instructions), 1000);
          }
          setVoiceLoading(false);
        }
      } else {
        setVoiceLoading(false);
      }
    };

    if (!loading) {
      initializeVoice();
    }
  }, [isVoiceEnabled, loading]);

  const addFarm = async (farmData: Omit<FarmData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newFarm = await FarmService.createFarm(farmData);
      setFarms(prev => [...prev, newFarm]);
      return newFarm.id!;
    } catch (error) {
      console.error('Error adding farm:', error);
      throw error;
    }
  };

  const updateFarm = async (farmId: string, updateData: Partial<FarmData>) => {
    try {
      const updatedFarm = await FarmService.updateFarm(farmId, updateData);
      setFarms(prev => prev.map(farm => farm.id === farmId ? updatedFarm : farm));
    } catch (error) {
      console.error('Error updating farm:', error);
      throw error;
    }
  };

  const deleteFarm = async (farmId: string) => {
    try {
      await FarmService.deleteFarm(farmId);
      setFarms(prev => prev.map(farm => farm.id === farmId ? { ...farm, isActive: false } : farm));
    } catch (error) {
      console.error('Error deleting farm:', error);
      throw error;
    }
  };

  const getTotalFarmArea = () => {
    return activeFarms.reduce((total, farm) => total + (farm.totalArea || 0), 0);
  };

  React.useEffect(() => {
    activeFarms.forEach(farm => {
      if (farm.center && farm.id && !soilDataLoading.includes(farm.id)) {
        const cacheKey = `${farm.center.lat.toFixed(6)}_${farm.center.lng.toFixed(6)}`;
        if (!soilDataCache[cacheKey]) {
          fetchSoilData(farm.id, farm.center.lat, farm.center.lng);
        }
      }
    });
  }, [activeFarms, soilDataCache, soilDataLoading]);

  const handleAreaCalculated = useCallback(
    async (area: number, unit: string, coordinates: Array<{ lat: number; lng: number }>) => {
      const acres = area / 4046.85642;
      const perimeter = calculatePerimeter(coordinates);
      const center = getPolygonCenter(coordinates);

      if (selectedFarm && selectedFarm.id) {
        await updateFarm(selectedFarm.id, {
          totalArea: acres,
          areaInSquareMeters: area,
          coordinates,
          perimeter,
          center,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const farmName = newFarmData.name.trim() || `Farm ${farms.length + 1}`;
        
        const farmId = await addFarm({
          name: farmName,
          cropType: 'Mixed Crops',
          soilType: '',
          irrigationType: '',
          notes: '',
          totalArea: acres,
          areaInSquareMeters: area,
          coordinates,
          perimeter,
          center,
          isActive: true,
        });
        
        if (center && farmId) {
          fetchSoilData(farmId, center.lat, center.lng);
        }
        
        setShowCreateForm(false);
        setShowMap(false);
        setNewFarmData({
          name: '',
          cropType: 'Mixed Crops',
          soilType: '',
          irrigationType: '',
          notes: '',
        });
      }
    },
    [selectedFarm, newFarmData, farms.length]
  );

  const handleLocationFound = (location: { lat: number; lng: number }) => {
    console.log('Location found:', location);
  };

  const generateSimulatedSoilData = (lat: number, lng: number) => {
    return {
      clay: Math.floor(Math.random() * 35) + 15,
      sand: Math.floor(Math.random() * 40) + 25,
      silt: Math.floor(Math.random() * 30) + 15,
      ph: +(Math.random() * 2.5 + 5.5).toFixed(1),
      organicCarbon: +(Math.random() * 2.5 + 1.0).toFixed(1),
      soilType: 'Loam',
      soilDescription: 'Regional soil estimate (ISRIC data unavailable)',
      textureClass: 'Loam (Regional Estimate)',
      recommendations: [
        'Soil data estimated based on regional characteristics',
        'Consider professional soil testing for accurate analysis',
        'Monitor soil moisture levels regularly'
      ],
      source: 'Regional estimates',
      coordinates: { lat, lng },
      fetchedAt: new Date().toISOString(),
      isSimulated: true
    };
  };

  const fetchSoilData = async (farmId: string, lat: number, lng: number) => {
    const cacheKey = `${lat.toFixed(6)}_${lng.toFixed(6)}`;
    
    if (soilDataCache[cacheKey]) {
      return soilDataCache[cacheKey];
    }

    try {
      setSoilDataLoading(prev => [...prev, farmId]);
      console.log(`Fetching soil data for coordinates: ${lat}, ${lng}`);
      
      const apiUrl = `/api/soil-info?lat=${lat}&lon=${lng}`;
      console.log('Calling backend API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('Backend API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend API Error Response:', errorText);
        
        if (response.status === 404) {
          console.log('ISRIC data not available for this location, using regional estimates');
          const simulatedData = generateSimulatedSoilData(lat, lng);
          
          setSoilDataCache(prev => ({
            ...prev,
            [cacheKey]: simulatedData
          }));
          
          return simulatedData;
        }
        
        throw new Error(`Backend API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Soil data received from backend:', data);
      
      if (data.is_simulated) {
        console.log('Using estimated soil data for this location');
      } else {
        console.log('ISRIC SoilGrids data retrieved successfully');
      }
      
      const processedData = {
        clay: data.texture?.clay_percentage || null,
        sand: data.texture?.sand_percentage || null,
        silt: data.texture?.silt_percentage || null,
        ph: data.chemical_properties?.ph || null,
        organicCarbon: data.chemical_properties?.organic_carbon_percentage || null,
        soilType: data.texture?.classification?.type || 'Unknown',
        soilDescription: data.texture?.classification?.description || '',
        textureClass: data.texture?.classification?.type || 'Unknown',
        recommendations: data.recommendations || [],
        coordinates: { lat, lng },
        fetchedAt: data.fetched_at || new Date().toISOString(),
        dataSource: data.data_source || 'ISRIC SoilGrids v2.0',
        isSimulated: data.is_simulated || false,
        note: data.note || null
      };
      
      setSoilDataCache(prev => ({
        ...prev,
        [cacheKey]: processedData
      }));
      
      return processedData;
    } catch (error) {
      console.error('Error fetching soil data:', error);
      
      const fallbackData = {
        clay: Math.floor(Math.random() * 40) + 20,
        sand: Math.floor(Math.random() * 40) + 20,
        silt: Math.floor(Math.random() * 30) + 10,
        ph: (Math.random() * 3 + 5.5).toFixed(1),
        organicCarbon: Math.floor(Math.random() * 25) + 5,
        textureClass: 'Loam (Simulated)',
        coordinates: { lat, lng },
        fetchedAt: new Date().toISOString(),
        isSimulated: true
      };
      
      setSoilDataCache(prev => ({
        ...prev,
        [cacheKey]: fallbackData
      }));
      
      return fallbackData;
    } finally {
      setSoilDataLoading(prev => prev.filter(id => id !== farmId));
    }
  };

  const handleCreateNewFarm = () => {
    setSelectedFarmId(null);
    setShowCreateForm(true);
  };

  const handleEditFarm = (farmId: string) => {
    setSelectedFarmId(farmId);
    setShowMap(true);
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (window.confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
      await deleteFarm(farmId);
    }
  };

  const startMapping = () => {
    setShowMap(true);
    setShowCreateForm(false);
  };

  const cancelMapping = () => {
    setShowMap(false);
    setShowCreateForm(false);
    setSelectedFarmId(null);
    setNewFarmData({
      name: '',
      cropType: 'Mixed Crops',
      soilType: '',
      irrigationType: '',
      notes: '',
    });
  };

  const testDirectAPI = () => {
    console.log('Testing Backend Soil API...');
    
    const testLat = 52.0907;
    const testLng = 5.1214;
    
    const apiUrl = `/api/soil-info?lat=${testLat}&lon=${testLng}`;
    console.log('Test Backend API URL:', apiUrl);
    
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })
    .then(response => {
      console.log('Test Response status:', response.status);
      console.log('Test Response ok:', response.ok);
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Test Backend API Success! Data:', data);
      alert(`API test successful! 
Soil Type: ${data.texture?.classification?.type}
Clay: ${data.texture?.clay_percentage}%
Sand: ${data.texture?.sand_percentage}%
Silt: ${data.texture?.silt_percentage}%
pH: ${data.chemical_properties?.ph}
Check console for full details.`);
    })
    .catch(error => {
      console.error('Test Backend API Error:', error);
      alert(`Backend API test failed: ${error.message}`);
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="animate-fade-in">
          {/* Enhanced Header Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 shadow-lg bg-white/80 backdrop-blur-lg rounded-3xl">
              <svg
                className="w-12 h-12 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">
              My Farms
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive farm management with real-time monitoring, soil analysis, and intelligent insights
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleCreateNewFarm}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Draw New Area
              </button>
              
              {/* Voice Control Buttons */}
              <button
                onClick={repeatInstructions}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-300 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg border border-blue-300/20 flex items-center gap-2"
                title="Hear area mapping instructions"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.586 17.414L4 20l2.586 2.586A2 2 0 008 21.172V18.828a2 2 0 00-.586-1.414zM4 12a8 8 0 008-8v0a8 8 0 118 8v0a8 8 0 01-8 8v0a8 8 0 00-8-8z" />
                </svg>
                🔊 Instructions
              </button>
              
              <button
                onClick={toggleVoice}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg border flex items-center gap-2 ${
                  isVoiceEnabled 
                    ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:text-orange-300 border-orange-300/20' 
                    : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-600 dark:text-gray-300 border-gray-300/20'
                }`}
                title={isVoiceEnabled ? 'Disable voice instructions' : 'Enable voice instructions'}
              >
                {isVoiceEnabled ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728m-6.95 6.95a8.966 8.966 0 01-2.829-2.828M12 6.586l1.414-1.414M19.414 12L18 10.586" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
                {isVoiceEnabled ? 'Voice ON' : 'Voice OFF'}
              </button>
              <button
                onClick={testDirectAPI}
                className="bg-white/80 backdrop-blur-lg hover:bg-white text-blue-600 px-6 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg border border-blue-200 hover:border-blue-300"
                title="Test Backend Soil API"
              >
                Test Soil API
              </button>
              <button
                onClick={testDirectAPI}
                className="bg-white/80 backdrop-blur-lg hover:bg-white text-blue-600 px-6 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg border border-blue-200 hover:border-blue-300"
                title="Test Backend Soil API"
              >
                Test Soil API
              </button>
            </div>
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Farms</p>
                  <p className="text-4xl font-bold text-blue-600">{activeFarms.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Active properties</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-3a1 1 0 011-1h1a1 1 0 011 1v3M9 7h1a1 1 0 011 1v1a1 1 0 01-1 1H9a1 1 0 01-1-1V8a1 1 0 011-1z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Area</p>
                  <p className="text-4xl font-bold text-green-600">{getTotalFarmArea().toFixed(1)}</p>
                  <p className="text-sm text-gray-500 mt-1">Acres ({(getTotalFarmArea() * 0.404686).toFixed(1)} hectares)</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Active Status</p>
                  <p className="text-4xl font-bold text-emerald-600">{activeFarms.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Currently managed</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Average Size</p>
                  <p className="text-4xl font-bold text-purple-600">
                    {activeFarms.length > 0 ? (getTotalFarmArea() / activeFarms.length).toFixed(1) : '0'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Acres per farm</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Farm Creation Form */}
          {showCreateForm && (
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Create New Farm</h3>
                  <p className="text-gray-600">Add a new farm to your management dashboard</p>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="max-w-md">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Farm Name (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newFarmData.name}
                      onChange={(e) => setNewFarmData(prev => ({ ...prev, name: e.target.value }))}
                      className="block w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm"
                      placeholder={`Farm ${farms.length + 1} (auto-generated)`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 ml-1">
                    Leave empty for automatic naming
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={startMapping}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Start Mapping
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Map Component */}
          {showMap && (
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedFarm ? `Edit ${selectedFarm.name}` : (newFarmData.name || `Farm ${farms.length + 1}`)}
                  </h3>
                  <p className="text-gray-600">Draw boundaries on the map to define your farm area</p>
                </div>
                <button
                  onClick={cancelMapping}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
                >
                  Cancel Mapping
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-inner overflow-hidden">
                <AreaCalc
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyD8gBWLxc8QRTI8ljXACQUJK1RfMyHPol0"}
                  defaultCenter={{ lat: 40.7128, lng: -74.0060 }}
                  defaultZoom={10}
                  onAreaCalculated={handleAreaCalculated}
                  onLocationFound={handleLocationFound}
                  height="600px"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Enhanced Instructions */}
          {!showCreateForm && !showMap && (
            <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-3xl p-8 border border-white/20 shadow-lg mb-12">
              <div className="flex items-start">
                <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mr-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Manage Your Farms</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { step: 1, text: "Click 'Add New Farm' to create a new farm with optional name", icon: "🌱" },
                      { step: 2, text: "Farm names are auto-generated if not provided (Farm 1, Farm 2, etc.)", icon: "🏷️" },
                      { step: 3, text: "Use the interactive map to draw your farm boundaries accurately", icon: "🗺️" },
                      { step: 4, text: "View detailed coordinates, soil analysis, and area calculations", icon: "📊" },
                      { step: 5, text: "Export coordinates and data for external use or record keeping", icon: "📋" },
                      { step: 6, text: "Monitor soil health with real-time analysis and recommendations", icon: "🧪" },
                    ].map((instruction, index) => (
                      <div key={index} className="flex items-start p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-300">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white text-lg font-bold rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                          {instruction.step}
                        </div>
                        <div>
                          <div className="text-2xl mb-2">{instruction.icon}</div>
                          <p className="text-gray-700 leading-relaxed">{instruction.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Farms List */}
          {activeFarms.length > 0 && !showCreateForm && !showMap && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Farm Portfolio</h2>
                <p className="text-lg text-gray-600">Comprehensive overview of all your agricultural properties</p>
              </div>

              <div className="space-y-8">
                {activeFarms.map((farm) => (
                  <div key={farm.id} className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-3xl transition-all duration-300">
                    <div className="grid lg:grid-cols-2 gap-0">
                      {/* Enhanced Farm Info Section */}
                      <div className="p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <h3 className="text-2xl font-bold text-gray-900">{farm.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {farm.cropType}
                              </span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                Active
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => farm.id && handleEditFarm(farm.id)}
                              className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-200"
                              title="Edit farm boundaries"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => farm.id && handleDeleteFarm(farm.id)}
                              className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200"
                              title="Delete farm"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Farm Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200 hover:border-green-300 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-green-700">{farm.totalArea?.toFixed(1) || '0'}</p>
                                <p className="text-sm text-green-600">Acres</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200 hover:border-blue-300 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-blue-700">
                                  {farm.perimeter ? (farm.perimeter / 1000).toFixed(1) : '0'}
                                </p>
                                <p className="text-sm text-blue-600">KM Perimeter</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200 hover:border-purple-300 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-purple-700">{farm.coordinates?.length || 0}</p>
                                <p className="text-sm text-purple-600">Boundary Points</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl border border-amber-200 hover:border-amber-300 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-amber-700">
                                  {farm.totalArea ? (farm.totalArea * 0.404686).toFixed(1) : '0'}
                                </p>
                                <p className="text-sm text-amber-600">Hectares</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Right Panel - Soil Analysis & Coordinates */}
                      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                        {/* Soil Information Section */}
                        {farm.center && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-semibold text-gray-900">Soil Analysis</h5>
                              <button
                                onClick={() => {
                                  const cacheKey = `${farm.center!.lat.toFixed(6)}_${farm.center!.lng.toFixed(6)}`;
                                  setSoilDataCache(prev => {
                                    const newCache = { ...prev };
                                    delete newCache[cacheKey];
                                    return newCache;
                                  });
                                  farm.id && fetchSoilData(farm.id, farm.center!.lat, farm.center!.lng);
                                }}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Refresh soil data"
                                disabled={!farm.id || soilDataLoading.includes(farm.id || '')}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                            </div>
                            {farm.id && soilDataLoading.includes(farm.id) ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                <span className="ml-2 text-sm text-gray-500">Analyzing soil...</span>
                              </div>
                            ) : (() => {
                              const cacheKey = `${farm.center.lat.toFixed(6)}_${farm.center.lng.toFixed(6)}`;
                              const soilData = soilDataCache[cacheKey];
                              
                              if (!soilData) {
                                return (
                                  <div className="space-y-2">
                                    <div className="text-sm text-gray-500 italic">
                                      Soil data unavailable
                                    </div>
                                    <button
                                      onClick={() => {
                                        console.log('Manual fetch triggered for farm:', farm.id);
                                        farm.id && fetchSoilData(farm.id, farm.center!.lat, farm.center!.lng);
                                      }}
                                      className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                    >
                                      Try Fetch Soil Data
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Soil Type:</span>
                                    <span className="text-sm font-semibold text-green-600">
                                      {soilData.textureClass}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="bg-yellow-50 p-2 rounded text-center">
                                      <div className="font-medium text-yellow-700">Clay</div>
                                      <div className="text-yellow-600">{soilData.clay || '--'}%</div>
                                    </div>
                                    <div className="bg-orange-50 p-2 rounded text-center">
                                      <div className="font-medium text-orange-700">Sand</div>
                                      <div className="text-orange-600">{soilData.sand || '--'}%</div>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded text-center">
                                      <div className="font-medium text-blue-700">Silt</div>
                                      <div className="text-blue-600">{soilData.silt || '--'}%</div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">pH:</span>
                                      <span className="font-medium text-gray-800">
                                        {soilData.ph || '--'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Organic C:</span>
                                      <span className="font-medium text-gray-800">
                                        {soilData.organicCarbon || '--'} g/kg
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="text-xs mt-2">
                                    <div className="bg-green-50 px-2 py-1 rounded border-l-2 border-green-300">
                                      <span className="text-green-600 font-medium">
                                        Soil Analysis
                                      </span>
                                      <div className="text-green-500 text-xs mt-1">
                                        Topsoil characteristics • Depth: 0-5cm
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Enhanced Coordinates Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <h4 className="text-lg font-semibold text-gray-900">GPS Coordinates</h4>
                            </div>
                            {farm.coordinates && farm.coordinates.length > 0 && (
                              <button
                                onClick={() => {
                                  const coordsText = farm.coordinates.map((coord, index) => 
                                    `Point ${index + 1}: ${coord.lat.toFixed(8)}, ${coord.lng.toFixed(8)}`
                                  ).join('\n');
                                  const centerText = farm.center ? 
                                    `Center: ${farm.center.lat.toFixed(8)}, ${farm.center.lng.toFixed(8)}` : 
                                    'Center: Not calculated';
                                  const fullText = `${farm.name}\n${centerText}\n\nBoundary Points:\n${coordsText}`;
                                  
                                  navigator.clipboard.writeText(fullText).then(() => {
                                    alert('Coordinates copied to clipboard!');
                                  }).catch(() => {
                                    alert('Failed to copy coordinates');
                                  });
                                }}
                                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all duration-200 text-sm font-medium"
                                title="Copy all coordinates"
                              >
                                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy GPS Data
                              </button>
                            )}
                          </div>

                          {/* Center Point */}
                          <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                            <h5 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Farm Center Point
                            </h5>
                            {farm.center ? (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-indigo-700 font-medium">Latitude:</span>
                                  <span className="font-mono text-indigo-900 bg-white px-3 py-1 rounded-lg">
                                    {farm.center.lat.toFixed(8)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-indigo-700 font-medium">Longitude:</span>
                                  <span className="font-mono text-indigo-900 bg-white px-3 py-1 rounded-lg">
                                    {farm.center.lng.toFixed(8)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-indigo-600 text-center py-4">Center point not calculated</p>
                            )}
                          </div>

                          {/* Boundary Coordinates */}
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                            <h5 className="font-semibold text-purple-900 mb-3 flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Boundary Points ({farm.coordinates?.length || 0})
                              </span>
                            </h5>
                            {farm.coordinates && farm.coordinates.length > 0 ? (
                              <div className="max-h-48 overflow-y-auto space-y-2">
                                {farm.coordinates.map((coord, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-purple-100 hover:border-purple-300 transition-all">
                                    <span className="font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded-full text-sm">
                                      Point {index + 1}
                                    </span>
                                    <div className="font-mono text-purple-900 text-sm">
                                      {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-purple-600 text-center py-4">No boundary coordinates available</p>
                            )}
                          </div>
                        </div>

                        {/* Farm Metadata */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Farm Information
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                              <span className="text-gray-600 font-medium">Created:</span>
                              <span className="text-gray-800 font-semibold">
                                {farm.createdAt ? new Date(farm.createdAt).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                              <span className="text-gray-600 font-medium">Last Updated:</span>
                              <span className="text-gray-800 font-semibold">
                                {farm.updatedAt ? new Date(farm.updatedAt).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                            {farm.soilType && (
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                                <span className="text-gray-600 font-medium">Soil Type:</span>
                                <span className="text-gray-800 font-semibold">{farm.soilType}</span>
                              </div>
                            )}
                            {farm.irrigationType && (
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                                <span className="text-gray-600 font-medium">Irrigation:</span>
                                <span className="text-gray-800 font-semibold">{farm.irrigationType}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Empty State */}
          {activeFarms.length === 0 && !showCreateForm && !showMap && (
            <div className="text-center py-20">
              <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-8 p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl">
                  <svg className="w-full h-full text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Your Farm Journey</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Create your first farm to unlock powerful agricultural management tools, soil analysis, and intelligent insights.
                </p>
                <button
                  onClick={handleCreateNewFarm}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-3 mx-auto"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Farm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}