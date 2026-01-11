"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Farm {
  id: string;
  name: string;
  cropType: string;
  totalArea: number;
  areaInSquareMeters: number;
  coordinates: Array<{ lat: number; lng: number }>;
  perimeter: number;
  center: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  notes?: string;
  soilType?: string;
  irrigationType?: string;
  lastHarvestDate?: string;
  nextPlantingDate?: string;
  estimatedYield?: number;
  farmImage?: string;
}

interface FarmContextType {
  farms: Farm[];
  selectedFarmId: string | null;
  addFarm: (farm: Omit<Farm, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateFarm: (id: string, updates: Partial<Farm>) => void;
  deleteFarm: (id: string) => void;
  setSelectedFarm: (id: string | null) => void;
  getSelectedFarm: () => Farm | null;
  getFarmById: (id: string) => Farm | null;
  getActiveFarms: () => Farm[];
  getTotalFarmArea: () => number;
  clearAllFarms: () => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const STORAGE_KEY = 'aifarmcare_farms';
const SELECTED_FARM_KEY = 'aifarmcare_selected_farm';

export function FarmProvider({ children }: { children: ReactNode }) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedFarms = localStorage.getItem(STORAGE_KEY);
      const storedSelectedId = localStorage.getItem(SELECTED_FARM_KEY);
      
      if (storedFarms) {
        setFarms(JSON.parse(storedFarms));
      }
      if (storedSelectedId) {
        setSelectedFarmId(storedSelectedId);
      }
    } catch (error) {
      console.error('Error loading farms from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever farms change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(farms));
    } catch (error) {
      console.error('Error saving farms to localStorage:', error);
    }
  }, [farms]);

  // Save selected farm ID whenever it changes
  useEffect(() => {
    try {
      if (selectedFarmId) {
        localStorage.setItem(SELECTED_FARM_KEY, selectedFarmId);
      } else {
        localStorage.removeItem(SELECTED_FARM_KEY);
      }
    } catch (error) {
      console.error('Error saving selected farm to localStorage:', error);
    }
  }, [selectedFarmId]);

  const addFarm = (farmData: Omit<Farm, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `farm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newFarm: Farm = {
      ...farmData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    setFarms(prev => [...prev, newFarm]);
    setSelectedFarmId(id);
    
    return id;
  };

  const updateFarm = (id: string, updates: Partial<Farm>) => {
    setFarms(prev =>
      prev.map(farm =>
        farm.id === id
          ? { ...farm, ...updates, updatedAt: new Date().toISOString() }
          : farm
      )
    );
  };

  const deleteFarm = (id: string) => {
    setFarms(prev => prev.filter(farm => farm.id !== id));
    if (selectedFarmId === id) {
      setSelectedFarmId(null);
    }
  };

  const setSelectedFarm = (id: string | null) => {
    setSelectedFarmId(id);
  };

  const getSelectedFarm = (): Farm | null => {
    return farms.find(farm => farm.id === selectedFarmId) || null;
  };

  const getFarmById = (id: string): Farm | null => {
    return farms.find(farm => farm.id === id) || null;
  };

  const getActiveFarms = (): Farm[] => {
    return farms.filter(farm => farm.isActive);
  };

  const getTotalFarmArea = (): number => {
    return farms.reduce((total, farm) => total + farm.totalArea, 0);
  };

  const clearAllFarms = () => {
    setFarms([]);
    setSelectedFarmId(null);
  };

  const value: FarmContextType = {
    farms,
    selectedFarmId,
    addFarm,
    updateFarm,
    deleteFarm,
    setSelectedFarm,
    getSelectedFarm,
    getFarmById,
    getActiveFarms,
    getTotalFarmArea,
    clearAllFarms,
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarmStore(): FarmContextType {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarmStore must be used within a FarmProvider');
  }
  return context;
}