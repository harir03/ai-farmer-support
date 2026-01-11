import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface FarmData {
  id?: string;
  userId: string;
  name: string;
  cropType: string;
  soilType: string;
  irrigationType: string;
  notes: string;
  totalArea: number;
  areaInSquareMeters: number;
  coordinates: Array<{ lat: number; lng: number }>;
  perimeter?: number;
  center: { lat: number; lng: number };
  soilData?: {
    clay?: number;
    sand?: number;
    silt?: number;
    ph?: number;
    organicCarbon?: number;
    soilType?: string;
    soilDescription?: string;
    textureClass?: string;
    recommendations?: string[];
    source?: string;
    fetchedAt?: string;
    isSimulated?: boolean;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class FarmService {
  private static getUserId(): string {
    // For now, return a default user ID. In a real app, this would come from authentication
    return localStorage.getItem('userId') || 'default_user';
  }

  static async getUserFarms(): Promise<FarmData[]> {
    try {
      const userId = this.getUserId();
      const key = `farms_${userId}`;
      const farmsData = localStorage.getItem(key);
      
      if (farmsData) {
        const farms = JSON.parse(farmsData);
        return farms.filter((farm: FarmData) => farm.isActive);
      }
      return [];
    } catch (error) {
      console.error('Error fetching user farms from localStorage:', error);
      return [];
    }
  }

  static async getFarmById(farmId: string): Promise<FarmData | null> {
    try {
      const farms = await this.getUserFarms();
      return farms.find(farm => farm.id === farmId) || null;
    } catch (error) {
      console.error('Error fetching farm by ID:', error);
      return null;
    }
  }

  static async createFarm(farmData: Omit<FarmData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<FarmData> {
    try {
      const userId = this.getUserId();
      const farms = await this.getUserFarms();
      
      const newFarm: FarmData = {
        ...farmData,
        id: crypto.randomUUID(),
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      farms.push(newFarm);
      
      const key = `farms_${userId}`;
      localStorage.setItem(key, JSON.stringify(farms));
      
      return newFarm;
    } catch (error) {
      console.error('Error creating farm:', error);
      throw error;
    }
  }

  static async updateFarm(farmId: string, updateData: Partial<FarmData>): Promise<FarmData> {
    try {
      const userId = this.getUserId();
      const farms = await this.getUserFarms();
      
      const farmIndex = farms.findIndex(farm => farm.id === farmId);
      if (farmIndex === -1) {
        throw new Error('Farm not found');
      }

      farms[farmIndex] = {
        ...farms[farmIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      const key = `farms_${userId}`;
      localStorage.setItem(key, JSON.stringify(farms));
      
      return farms[farmIndex];
    } catch (error) {
      console.error('Error updating farm:', error);
      throw error;
    }
  }

  static async deleteFarm(farmId: string): Promise<void> {
    try {
      const userId = this.getUserId();
      const farms = await this.getUserFarms();
      
      const farmIndex = farms.findIndex(farm => farm.id === farmId);
      if (farmIndex === -1) {
        throw new Error('Farm not found');
      }

      farms[farmIndex] = {
        ...farms[farmIndex],
        isActive: false,
        updatedAt: new Date().toISOString()
      };

      const key = `farms_${userId}`;
      localStorage.setItem(key, JSON.stringify(farms));
    } catch (error) {
      console.error('Error deleting farm:', error);
      throw error;
    }
  }

  static async updateFarmSoilData(farmId: string, soilData: FarmData['soilData']): Promise<FarmData> {
    try {
      return await this.updateFarm(farmId, { soilData });
    } catch (error) {
      console.error('Error updating soil data:', error);
      throw error;
    }
  }

  static async getFarmInfoForAssistant(): Promise<{
    farmInfo: FarmData[];
    summary: {
      totalFarms: number;
      totalArea: number;
      avgFarmSize: number;
      cropTypes: string[];
      soilTypes: string[];
      irrigationTypes: string[];
    };
  }> {
    try {
      const farms = await this.getUserFarms();
      
      // Format data for the voice assistant with all necessary information
      const farmInfo = farms.map(farm => ({
        ...farm,
        latitude: farm.center?.lat,
        longitude: farm.center?.lng
      }));

      const summary = {
        totalFarms: farmInfo.length,
        totalArea: farmInfo.reduce((sum, farm) => sum + (farm.totalArea || 0), 0),
        avgFarmSize: farmInfo.length > 0 ? 
          (farmInfo.reduce((sum, farm) => sum + (farm.totalArea || 0), 0) / farmInfo.length) : 0,
        cropTypes: [...new Set(farmInfo.map(farm => farm.cropType).filter(Boolean))],
        soilTypes: [...new Set(farmInfo.map(farm => farm.soilType).filter(Boolean))],
        irrigationTypes: [...new Set(farmInfo.map(farm => farm.irrigationType).filter(Boolean))]
      };

      return {
        farmInfo,
        summary
      };
    } catch (error) {
      console.error('Error getting farm info for assistant:', error);
      return {
        farmInfo: [],
        summary: {
          totalFarms: 0,
          totalArea: 0,
          avgFarmSize: 0,
          cropTypes: [],
          soilTypes: [],
          irrigationTypes: []
        }
      };
    }
  }
}