import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MoreOption {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: () => void;
}

const More = () => {
  const handleProfilePress = () => {
    Alert.alert('Profile', 'Profile settings coming soon!');
  };

  const handleSettingsPress = () => {
    Alert.alert('Settings', 'App settings coming soon!');
  };

  const handleNotificationsPress = () => {
    Alert.alert('Notifications', 'Notification settings coming soon!');
  };

  const handleLanguagePress = () => {
    Alert.alert('Language', 'Language settings coming soon!');
  };

  const handleWeatherPress = () => {
    Alert.alert('Weather', 'Weather alerts settings coming soon!');
  };

  const handleFeedbackPress = () => {
    Alert.alert('Feedback', 'Thank you for your interest in providing feedback!');
  };

  const handleHelpPress = () => {
    Alert.alert('Help & Support', 'Help documentation coming soon!');
  };

  const handleAboutPress = () => {
    Alert.alert('About AgroMitra', 'AgroMitra v1.0\nYour farming companion app');
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout confirmed') }
      ]
    );
  };

  const moreOptions: MoreOption[] = [
    {
      id: '1',
      title: 'Profile',
      subtitle: 'Manage your account details',
      icon: 'person-outline',
      action: handleProfilePress
    },
    {
      id: '2',
      title: 'Settings',
      subtitle: 'App preferences and configuration',
      icon: 'settings-outline',
      action: handleSettingsPress
    },
    {
      id: '3',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      icon: 'notifications-outline',
      action: handleNotificationsPress
    },
    {
      id: '4',
      title: 'Language',
      subtitle: 'Choose your preferred language',
      icon: 'language-outline',
      action: handleLanguagePress
    },
    {
      id: '5',
      title: 'Weather Alerts',
      subtitle: 'Configure weather notifications',
      icon: 'partly-sunny-outline',
      action: handleWeatherPress
    },
    {
      id: '6',
      title: 'Feedback',
      subtitle: 'Share your thoughts with us',
      icon: 'chatbubble-outline',
      action: handleFeedbackPress
    },
    {
      id: '7',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      action: handleHelpPress
    },
    {
      id: '8',
      title: 'About',
      subtitle: 'App information and version',
      icon: 'information-circle-outline',
      action: handleAboutPress
    }
  ];

  const MoreOptionCard: React.FC<{ option: MoreOption }> = ({ option }) => {
    return (
      <TouchableOpacity 
        className="bg-[#f5e9dd] rounded-3xl mx-6 mb-4 p-6 shadow-sm"
        onPress={option.action}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-[#494949] rounded-full items-center justify-center mr-4">
            <Ionicons name={option.icon} size={24} color="#f5e9dd" />
          </View>
          
          <View className="flex-1">
            <Text className="text-[#494949] text-xl font-bold mb-1">
              {option.title}
            </Text>
            <Text className="text-[#666666] text-base">
              {option.subtitle}
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#666666" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#494949] relative">
      {/* Background Decorative Elements */}
      <View className="absolute top-[-130px] right-[-150px] w-[743px] h-[743px] bg-[#e85d56] rounded-full" />
      <View className="absolute bottom-[-200px] left-[-232px] w-[478px] h-[478px] bg-[#e85d56] rounded-full" />
      <View className="absolute top-[55px] right-[20px] w-[207px] h-[207px] border-[3px] border-[#f5e9dd] rounded-full" />
      <View className="absolute bottom-[200px] left-[-14px] w-[239px] h-[239px] border-[3px] border-[#f5e9dd] rounded-full" />
      <View className="absolute top-[0px] left-[25px] w-[400px] h-[400px] border-[3px] border-[#e85d56] rounded-full" />
      <View className="absolute bottom-[50px] left-[25px] w-[335px] h-[335px] border-[3px] border-[#e85d56] rounded-full" />
      
      {/* Header Section */}
      <View className="pt-16 pb-6">
        {/* Page Title */}
        <Text className="text-[#f5e9dd] text-3xl font-bold text-center mb-6">
          More Options
        </Text>
      </View>
      
      {/* Options List */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      >
        {moreOptions.map((option) => (
          <MoreOptionCard key={option.id} option={option} />
        ))}
        
        {/* Logout Button */}
        <TouchableOpacity 
          className="bg-[#e85d56] rounded-3xl mx-6 mb-4 p-6 shadow-sm"
          onPress={handleLogoutPress}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="log-out-outline" size={24} color="#f5e9dd" className="mr-3" />
            <Text className="text-[#f5e9dd] text-xl font-bold ml-3">
              Logout
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default More;