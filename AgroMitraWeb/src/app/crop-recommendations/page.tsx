"use client";

import { useState, useEffect } from 'react';
import CropCardComponent from '@/components/CropCard';
import { fetchCropCards } from '@/lib/data';
import { CropCard } from '@/types/CropCard';

export default function CropRecommendations() {
  const [cropCards, setCropCards] = useState<CropCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<CropCard[]>([]);
  const [selectedFarmingType, setSelectedFarmingType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const cards = fetchCropCards();
      setCropCards(cards);
      setFilteredCards(cards);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching crop cards:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFarmingType === 'all') {
      setFilteredCards(cropCards);
    } else {
      setFilteredCards(cropCards.filter(card => card.farming_type === selectedFarmingType));
    }
  }, [selectedFarmingType, cropCards]);

  const farmingTypes = ['all', 'Integrated Farming', 'High-Value', 'Boundary Planting'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading crop recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Integrated Farming Recommendations
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover profitable farming strategies tailored to your needs. Explore integrated farming, 
              high-value crops, and boundary planting systems with detailed ROI analysis.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{cropCards.length}</div>
              <div className="text-sm text-green-700">Total Strategies</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {cropCards.filter(c => c.farming_type === 'Integrated Farming').length}
              </div>
              <div className="text-sm text-blue-700">Integrated Farming</div>
            </div>
            <div className="bg-purple-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {cropCards.filter(c => c.farming_type === 'High-Value').length}
              </div>
              <div className="text-sm text-purple-700">High-Value Crops</div>
            </div>
            <div className="bg-orange-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {cropCards.filter(c => c.farming_type === 'Boundary Planting').length}
              </div>
              <div className="text-sm text-orange-700">Boundary Planting</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {farmingTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFarmingType(type)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                selectedFarmingType === type
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-300'
              }`}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No crop recommendations found for the selected filter.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <div key={card.strategy_id} className="transform hover:scale-[1.02] transition-transform duration-200">
                <CropCardComponent card={card} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back to Voice Assistant */}
      <div className="fixed bottom-6 right-6">
        <a
          href="/"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Voice Assistant
        </a>
      </div>
    </div>
  );
}