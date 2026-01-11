export interface CropCard {
  strategy_id: string;
  strategy_name: string;
  farming_type: 'Integrated Farming' | 'High-Value' | 'Boundary Planting';
  crops_main: string[];
  crops_secondary: string[];
  investment_cost: number;
  estimated_profit_net: number;
  roi_percentage: number;
  key_risk_factors: string[];
  ideal_soil_types: string[];
}