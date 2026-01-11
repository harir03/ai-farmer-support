import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MyFarm from '../../components/MyFarm';
import MarketPrice from '../../components/MarketPrice';

const Farm = () => {
  const [activeTab, setActiveTab] = useState<'myFarm' | 'marketPrice'>('myFarm');

  const renderContent = () => {
    if (activeTab === 'myFarm') {
      return <MyFarm />;
    } else {
      return <MarketPrice />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f5e9dd]">
      {/* Background Decorative Elements */}
      <View className="absolute top-[-100px] right-[-200px] w-[400px] h-[400px] bg-[#e85d56] rounded-full" />
      <View className="absolute bottom-[-150px] left-[-150px] w-[350px] h-[350px] bg-[#e85d56] rounded-full" />
      <View className="absolute top-[100px] right-[50px] w-[150px] h-[150px] border-[3px] border-white rounded-full" />
      <View className="absolute bottom-[200px] left-[20px] w-[180px] h-[180px] border-[3px] border-white rounded-full" />
      <View className="absolute top-[50px] left-[30px] w-[300px] h-[300px] border-[3px] border-[#e85d56] rounded-full" />
      <View className="absolute bottom-[100px] left-[50px] w-[250px] h-[250px] border-[3px] border-[#e85d56] rounded-full" />

      {/* Custom Header with Navigation */}
      <View className="pt-6  px-6 pb-3">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity 
            className={`rounded-3xl px-6 py-3 ${
              activeTab === 'myFarm' 
                ? 'bg-[#494949]' 
                : 'bg-[#ffe4c9] border border-[#494949]'
            }`}
            onPress={() => setActiveTab('myFarm')}
          >
            <Text className={`text-base font-bold ${
              activeTab === 'myFarm' ? 'text-[#f5e9dd]' : 'text-[#494949]'
            }`}>
              My Farm
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`rounded-3xl px-6 py-3 ${
              activeTab === 'marketPrice' 
                ? 'bg-[#494949]' 
                : 'bg-[#ffe4c9] border border-[#494949]'
            }`}
            onPress={() => setActiveTab('marketPrice')}
          >
            <Text className={`text-base font-bold text-center ${
              activeTab === 'marketPrice' ? 'text-[#f5e9dd]' : 'text-[#494949]'
            }`}>
              Market Prices
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area with Rounded Background */}
      <View className="flex-1 bg-[#494949] rounded-tl-[40px] rounded-tr-[40px] mx-4 ">
        {/* Page Title */}
        <Text className="text-[#f5e9dd] text-2xl font-bold text-center py-6">
          {activeTab === 'myFarm' ? 'My Farms' : 'Market Prices'}
        </Text>
        
        {/* Content Area */}
        <View className="flex-1">
          {renderContent()}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Farm;