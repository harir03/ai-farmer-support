import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FieldData {
  id: string;
  name: string;
  location: string;
  size: string;
  crop: string;
  plannedDate: string;
}

const mockFieldData: FieldData[] = [
  {
    id: '1',
    name: 'Field 1',
    location: 'North Block, Sector 1',
    size: '2.5 acres',
    crop: 'Wheat',
    plannedDate: '15/10/2025'
  },
  {
    id: '2',
    name: 'Field 2',
    location: 'North Block, Sector 1',
    size: '2.5 acres',
    crop: 'Wheat',
    plannedDate: '15/10/2025'
  },
  {
    id: '3',
    name: 'Field 3',
    location: 'North Block, Sector 1',
    size: '2.5 acres',
    crop: 'Wheat',
    plannedDate: '15/10/2025'
  }
];

interface FieldCardProps {
  field: FieldData;
}

const FieldCard: React.FC<FieldCardProps> = ({ field }) => {
  return (
    <View className="bg-[#f5e9dd] rounded-3xl mb-4 p-6 shadow-sm">
      {/* Field Title */}
      <View className="mb-3">
        <Text className="text-[#494949] text-xl font-bold">{field.name}</Text>
      </View>
      
      {/* Divider Line */}
      <View className="h-px bg-[#d0d0d0] mb-4 mx-[-8px]" />
      
      {/* Field Details */}
      <View className="space-y-2">
        {/* Location */}
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text className="text-[#494949] text-base ml-2">{field.location}</Text>
        </View>
        
        {/* Size */}
        <View className="flex-row items-center">
          <Ionicons name="resize-outline" size={16} color="#666" />
          <Text className="text-[#494949] text-base ml-2">
            <Text className="font-semibold">Size : </Text>
            {field.size}
          </Text>
        </View>
        
        {/* Crop */}
        <View className="flex-row items-center">
          <Ionicons name="leaf-outline" size={16} color="#666" />
          <Text className="text-[#494949] text-base ml-2">
            <Text className="font-semibold">Crop : </Text>
            {field.crop}
          </Text>
        </View>
        
        {/* Planned Date */}
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text className="text-[#494949] text-base ml-2">
            <Text className="font-semibold">Planned : </Text>
            {field.plannedDate}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function MyFarm() {
  return (
    <View className="flex-1">
      {/* Fields List */}
      <ScrollView 
        className="flex-1 px-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      >
        {mockFieldData.map((field) => (
          <FieldCard key={field.id} field={field} />
        ))}
      </ScrollView>
    </View>
  );
}
