import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, G, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Location Icon Component
const LocationIcon = () => (
  <Svg width="14" height="20" viewBox="0 0 14 20" fill="none">
    <Path
      d="M7 0C10.866 0 14 3.134 14 7C14 12.25 7 20 7 20S0 12.25 0 7C0 3.134 3.134 0 7 0ZM7 4.5C5.619 4.5 4.5 5.619 4.5 7S5.619 9.5 7 9.5S9.5 8.381 9.5 7S8.381 4.5 7 4.5Z"
      fill="#494949"
    />
  </Svg>
);

// Commodity Icon Component
const CommodityIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Rect x="2" y="6" width="12" height="8" rx="1" fill="#494949"/>
    <Path d="M4 6V4C4 2.895 4.895 2 6 2H10C11.105 2 12 2.895 12 4V6" stroke="#494949" strokeWidth="1.5" fill="none"/>
  </Svg>
);

// Grade Icon Component
const GradeIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 1L10.09 5.26L15 6L11 9.74L12 15L8 12.5L4 15L5 9.74L1 6L5.91 5.26L8 1Z"
      fill="#494949"
    />
  </Svg>
);

// Calendar Icon Component
const CalendarIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Rect x="2" y="3" width="12" height="11" rx="2" stroke="#494949" strokeWidth="1.5" fill="none"/>
    <Path d="M5 1V5M11 1V5M2 7H14" stroke="#494949" strokeWidth="1.5"/>
  </Svg>
);

// Price Icon Component
const PriceIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 0C12.418 0 16 3.582 16 8C16 12.418 12.418 16 8 16C3.582 16 0 12.418 0 8C0 3.582 3.582 0 8 0ZM8 3V4H6.5V5.5H8V7.5H6V9H8V10.5H9.5V9H11V7.5H9.5V5.5H11V4H9.5V3H8Z"
      fill="#494949"
    />
  </Svg>
);

// Code Icon Component
const CodeIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path
      d="M4.5 5L2 7.5L4.5 10M11.5 5L14 7.5L11.5 10M9.5 2L6.5 13"
      stroke="#494949"
      strokeWidth="1.5"
      fill="none"
    />
  </Svg>
);

interface MarketPriceData {
  location: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string;
  minPrice: string;
  maxPrice: string;
  modalPrice: string;
  commodityCode: string;
}

const MarketPriceCard: React.FC<{ data: MarketPriceData }> = ({ data }) => (
  <View className="bg-[#f5e9dd] rounded-[24px] mb-4 p-4 shadow-sm">
    {/* Location */}
    <View className="flex-row items-center mb-3">
      <LocationIcon />
      <Text className="ml-3 text-[#494949] text-base font-normal flex-1">
        {data.location}
      </Text>
    </View>

    {/* First Row - Commodity and Variety */}
    <View className="flex-row justify-between mb-2">
      <View className="flex-row items-center flex-1">
        <CommodityIcon />
        <Text className="ml-2 text-[#494949] text-base">
          <Text className="font-semibold">Commodity :</Text>
          <Text className="font-normal"> {data.commodity}</Text>
        </Text>
      </View>
      <View className="flex-row items-center flex-1">
        <CommodityIcon />
        <Text className="ml-2 text-[#494949] text-base">
          <Text className="font-semibold">Variety :</Text>
          <Text className="font-normal"> {data.variety}</Text>
        </Text>
      </View>
    </View>

    {/* Second Row - Grade and Arrival Date */}
    <View className="flex-row justify-between mb-2">
      <View className="flex-row items-center flex-1">
        <GradeIcon />
        <Text className="ml-2 text-[#494949] text-base">
          <Text className="font-semibold">Grade :</Text>
          <Text className="font-normal"> {data.grade}</Text>
        </Text>
      </View>
      <View className="flex-row items-center flex-1">
        <CalendarIcon />
        <Text className="ml-2 text-[#494949] text-base">
          <Text className="font-semibold">Arrival_Date : </Text>
          <Text className="font-normal">{data.arrivalDate}</Text>
        </Text>
      </View>
    </View>

    {/* Third Row - Min Price and Max Price */}
    <View className="flex-row justify-between mb-2">
      <View className="flex-row items-center flex-1">
        <PriceIcon />
        <Text className="ml-2 text-[#494949] text-base">
          <Text className="font-semibold">Min_Price :</Text>
          <Text className="font-normal"> {data.minPrice}</Text>
        </Text>
      </View>
      <View className="flex-row items-center flex-1">
        <PriceIcon />
        <Text className="ml-2 text-[#494949] text-base">
          <Text className="font-semibold">Max_Price :</Text>
          <Text className="font-normal"> {data.maxPrice}</Text>
        </Text>
      </View>
    </View>

    {/* Fourth Row - Modal Price and Commodity Code */}
    <View className="flex-row justify-between">
      <View className="flex-row items-center flex-1">
        <PriceIcon />
        <Text className="ml-2 text-[#494949] text-base">
          <Text className="font-semibold">Modal_Price :</Text>
          <Text className="font-normal"> {data.modalPrice}</Text>
        </Text>
      </View>
      <View className="flex-row items-center flex-1">
        <CodeIcon />
        <Text className="ml-2 text-[#494949] text-base">
          <Text className="font-semibold">Commodity_Code :</Text>
          <Text className="font-normal"> {data.commodityCode}</Text>
        </Text>
      </View>
    </View>
  </View>
);

const MarketPrice: React.FC = () => {
  // Sample market price data
  const marketPrices: MarketPriceData[] = [
    {
      location: "Sarangpur, Rajgarh, Madhya Pradesh",
      commodity: "Soyabean",
      variety: "Yellow",
      grade: "FAQ",
      arrivalDate: "15/10/2025",
      minPrice: "₹ 3200",
      maxPrice: "₹ 3600",
      modalPrice: "₹ 3200",
      commodityCode: "13"
    },
    {
      location: "Sarangpur, Rajgarh, Madhya Pradesh",
      commodity: "Soyabean",
      variety: "Yellow",
      grade: "FAQ",
      arrivalDate: "15/10/2025",
      minPrice: "₹ 3200",
      maxPrice: "₹ 3600",
      modalPrice: "₹ 3200",
      commodityCode: "13"
    },
    {
      location: "Sarangpur, Rajgarh, Madhya Pradesh",
      commodity: "Soyabean",
      variety: "Yellow",
      grade: "FAQ",
      arrivalDate: "15/10/2025",
      minPrice: "₹ 3200",
      maxPrice: "₹ 3600",
      modalPrice: "₹ 3200",
      commodityCode: "13"
    },
    {
      location: "Sarangpur, Rajgarh, Madhya Pradesh",
      commodity: "Soyabean",
      variety: "Yellow",
      grade: "FAQ",
      arrivalDate: "15/10/2025",
      minPrice: "₹ 3200",
      maxPrice: "₹ 3600",
      modalPrice: "₹ 3200",
      commodityCode: "13"
    }
  ];

  return (
    <View className="flex-1">
      {/* Market Price Cards */}
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {marketPrices.map((price, index) => (
          <MarketPriceCard key={index} data={price} />
        ))}
      </ScrollView>
    </View>
  );
};

export default MarketPrice;
