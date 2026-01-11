import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Weather Icon Component
const WeatherIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.7454 9.09494C17.0219 7.29703 15.3161 6.01172 13.3454 6.01172C10.9946 6.01172 8.94528 7.85101 8.59653 10.2986C6.9473 10.6153 5.7012 12.0676 5.7012 13.8119C5.7012 15.7553 7.28425 17.3384 9.22766 17.3384H17.7454C19.2488 17.3384 20.4766 16.1107 20.4766 14.6072C20.4766 13.1038 19.2488 11.876 17.7454 11.876C17.7454 10.8884 17.7454 10.3725 17.7454 9.09494Z"
      stroke="#000000"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Talk IQ Icon
const TalkIQIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#E74C3C" strokeWidth="2" fill="none" />
    <Circle cx="8" cy="12" r="1" fill="#E74C3C" />
    <Circle cx="12" cy="12" r="1" fill="#E74C3C" />
    <Circle cx="16" cy="12" r="1" fill="#E74C3C" />
  </Svg>
);

// Talk Pro Icon  
const TalkProIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      stroke="#E74C3C"
      strokeWidth="2"
      fill="none"
    />
  </Svg>
);

// Crop Recommendation Icon
const CropIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
      fill="#E74C3C"
    />
    <Path
      d="M12 16V22"
      stroke="#E74C3C"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// Microphone Icon
const MicIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="2" width="6" height="12" rx="3" fill="#E74C3C" />
    <Path
      d="M19 10v2a7 7 0 0 1-14 0v-2"
      stroke="#E74C3C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M12 19v3"
      stroke="#E74C3C"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// Circular background patterns
type CircularPatternProps = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  size?: number;
  color?: string;
};

const CircularPattern = ({
  top,
  right,
  bottom,
  left,
  size = 150,
  color = "#F05454"
}: CircularPatternProps) => (
  <View
    style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity: 0.7,
      top,
      right,
      bottom,
      left,
      zIndex: -1
    }}
  />
);

const Home = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: '#F0E6E0',
        paddingTop: insets.top,
        paddingBottom: insets.bottom
      }}
    >
      {/* <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ 
            paddingBottom: 30,
            flexGrow: 1 
          }}
          showsVerticalScrollIndicator={false}
        > */}
      <View className="flex-1 relative" style={{ minHeight: height - insets.top - insets.bottom }}>
        {/* Background circular patterns */}
        <CircularPattern
          top={-100}
          right={-80}
          size={200}
          color="#E74C3C"
        />
        <CircularPattern
          top={40}
          right={width - 50}
          size={120}
          color="#E74C3C"
        />
        <CircularPattern
          bottom={200}
          left={-80}
          size={160}
          color="#E74C3C"
        />
        <CircularPattern
          bottom={-60}
          left={-40}
          size={140}
          color="#E74C3C"
        />

        {/* Add circular stroke patterns */}
        <View
          style={{
            position: 'absolute',
            top: 80,
            left: -60,
            width: 150,
            height: 150,
            borderRadius: 75,
            borderWidth: 2,
            borderColor: '#E74C3C',
            opacity: 0.6,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 150,
            right: -70,
            width: 180,
            height: 180,
            borderRadius: 90,
            borderWidth: 2,
            borderColor: '#E74C3C',
            opacity: 0.6,
          }}
        />

        <View className="px-6 pt-16 flex-1 justify-evenly  items-center">
          {/* Weather Update Card */}
          <View
            className="rounded-full py-5 px-6 mb-8"
            style={{
              backgroundColor: 'rgba(200, 200, 200, 0.9)',
              backdropFilter: 'blur(10px)',
              alignSelf: 'center',
              width: '90%',
            }}
          >
            <View className="flex-row items-center">
              <WeatherIcon />
              <View className="ml-4 flex-1">
                <Text className="font-bold text-lg text-black">Today's Weather Update</Text>
                <Text className="text-sm text-black mt-1">Weather : 28 C</Text>
                <Text className="text-sm text-black">Wind Speed : 10 km/h NW</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons Row */}
          {/* <View className="flex-row justify-between mb-8 px-2">
              <TouchableOpacity 
                className="rounded-full py-4 px-5 flex-row items-center justify-center"
                style={{ 
                  width: '47%',
                  backgroundColor: '#4A4A4A',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
                // onPress={() => router.push('/(tabs)/Community')}
              >
                <TalkIQIcon />
                <Text className="text-white ml-3 font-semibold text-base">TalkIQ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="rounded-full py-4 px-5 flex-row items-center justify-center"
                style={{ 
                  width: '47%',
                  backgroundColor: '#4CAF50',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
                onPress={() => router.push('/(tabs)')}
              >
                <MaterialCommunityIcons name="microphone" size={20} color="white" />
                <Text className="text-white ml-3 font-semibold text-base">Voice AI</Text>
              </TouchableOpacity>
            </View> */}

          {/* Crop Recommendation Button */}
          {/* <TouchableOpacity 
              className="rounded-full py-5 px-6 flex-row items-center mb-12"
              style={{ 
                backgroundColor: '#4A4A4A',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                width: '100%',
              }}
              onPress={() => {}}
            >
              <CropIcon />
              <Text className="text-white ml-4 font-semibold text-lg">Crop Recommendation</Text>
            </TouchableOpacity> */}

          {/* Let's Cultivate Button */}
          <View className="items-center mb-16 px-4">
            <Pressable
              className="rounded-full py-8 px-12 flex-row items-center justify-center"
              style={{
                backgroundColor: '#4A4A4A',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 8,
                width: '85%',
                minHeight: 70,
              }}
              onPress={() => { router.push('/Aichat') }}
            >
              <MicIcon />
              <Text className="text-white ml-4 font-semibold text-xl">Let's Cultivate</Text>
            </Pressable>
          </View>

          {/* Latest News Section */}
          <View
            className="rounded-3xl py-6 px-6"
            style={{
              backgroundColor: 'rgba(200, 200, 200, 0.9)',
              backdropFilter: 'blur(10px)',
              width: '100%',
              alignSelf: 'center',
            }}
          >
            <Text className="font-bold text-xl mb-4 text-black">Latest New's</Text>
            <View>
              <Text className="text-base mb-3 text-black">1. Govt. Launches New Crop Insurance Sceheme</Text>
              <Text className="text-base text-black">2. Monsoon Forecast Looks Promising This Year</Text>
            </View>
          </View>
        </View>
      </View>
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

export default Home;
