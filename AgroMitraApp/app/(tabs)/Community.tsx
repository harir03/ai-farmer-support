import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommunityFeed from '../../components/CommunityFeed';
import CommunityGroups from '../../components/CommunityGroups';

const Community = () => {
  const [activeTab, setActiveTab] = useState<'Feed' | 'Groups'>('Feed');

  const handleTabChange = (tab: 'Feed' | 'Groups') => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (activeTab === 'Feed') {
      return <CommunityFeed />;
    } else {
      return <CommunityGroups activeTab={activeTab} onTabChange={handleTabChange} />;
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
      <View className="pt-6 px-6 pb-3">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity 
            className={`rounded-3xl px-6 py-3 ${
              activeTab === 'Feed' 
                ? 'bg-[#494949]' 
                : 'bg-[#ffe4c9] border border-[#494949]'
            }`}
            onPress={() => handleTabChange('Feed')}
          >
            <Text className={`text-base font-bold ${
              activeTab === 'Feed' ? 'text-[#f5e9dd]' : 'text-[#494949]'
            }`}>
              Feed
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`rounded-3xl px-6 py-3 ${
              activeTab === 'Groups' 
                ? 'bg-[#494949]' 
                : 'bg-[#ffe4c9] border border-[#494949]'
            }`}
            onPress={() => handleTabChange('Groups')}
          >
            <Text className={`text-base font-bold text-center ${
              activeTab === 'Groups' ? 'text-[#f5e9dd]' : 'text-[#494949]'
            }`}>
              Groups
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area with Rounded Background */}
      <View className="flex-1 bg-[#494949] rounded-tl-[40px] rounded-tr-[40px] mx-4">
        {/* Page Title */}
        {/* <Text className="text-[#f5e9dd] text-2xl font-bold text-center py-6">
          {activeTab === 'Feed' ? 'Community Feed' : 'Community Groups'}
        </Text> */}
        
        {/* Content Area */}
        <View className="flex-1">
          {renderContent()}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Community