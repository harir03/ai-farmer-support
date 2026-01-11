import { CropCard } from '@/types/CropCard';
import mockCropCardsData from '@/data/mockCropCards.json';

export const fetchCropCards = (): CropCard[] => {
  return mockCropCardsData as CropCard[];
};

export const getCropCardById = (id: string): CropCard | undefined => {
  const cropCards = fetchCropCards();
  return cropCards.find(card => card.strategy_id === id);
};

export const getCropCardsByFarmingType = (farmingType: CropCard['farming_type']): CropCard[] => {
  const cropCards = fetchCropCards();
  return cropCards.filter(card => card.farming_type === farmingType);
};