import React from 'react';
import { CropCard } from '@/types/CropCard';

interface CropCardComponentProps {
  card: CropCard;
}

const CropCardComponent: React.FC<CropCardComponentProps> = ({ card }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getFarmingTypeColor = (type: string): string => {
    switch (type) {
      case 'Integrated Farming':
        return 'bg-blue-100 text-blue-800';
      case 'High-Value':
        return 'bg-purple-100 text-purple-800';
      case 'Boundary Planting':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {card.strategy_name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFarmingTypeColor(card.farming_type)}`}>
            {card.farming_type}
          </span>
        </div>
        
        {/* ROI Badge - Prominent Green */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {card.roi_percentage.toFixed(1)}% ROI
          </span>
          <span className="text-2xl font-bold text-green-600">
            {formatCurrency(card.estimated_profit_net)}
          </span>
        </div>
      </div>

      {/* Crops Section */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Main Crops</h4>
        <div className="flex flex-wrap gap-1 mb-3">
          {card.crops_main.map((crop, index) => (
            <span
              key={index}
              className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium"
            >
              {crop}
            </span>
          ))}
        </div>
        
        {card.crops_secondary.length > 0 && (
          <>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Secondary/Inter Crops</h4>
            <div className="flex flex-wrap gap-1 mb-3">
              {card.crops_secondary.map((crop, index) => (
                <span
                  key={index}
                  className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium"
                >
                  {crop}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Investment Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Investment Cost</span>
          <span className="font-semibold text-gray-900">{formatCurrency(card.investment_cost)}</span>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Risk Factors</h4>
        <div className="flex flex-wrap gap-1">
          {card.key_risk_factors.map((risk, index) => (
            <span
              key={index}
              className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs"
            >
              {risk}
            </span>
          ))}
        </div>
      </div>

      {/* Soil Types */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Ideal Soil Types</h4>
        <div className="flex flex-wrap gap-1">
          {card.ideal_soil_types.map((soil, index) => (
            <span
              key={index}
              className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs"
            >
              {soil}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CropCardComponent;