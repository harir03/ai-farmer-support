import { router, useNavigation } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {API_BASE_URL} from '../utils/constant';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Pressable,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  // Calculate responsive dimensions based on screen size
  const cardWidth = Math.min(screenWidth * 0.9, 380);
  const cardHeight = Math.min(screenHeight * 0.7, 520);

  const navigation = useNavigation();

  const handleLogin = async () =>{
    try {
      const response = await fetch(`${API_BASE_URL}api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const data = await response.json();
      if (response.ok) {
        // Navigate to main app screen on successful login
        Alert.alert('Login Successful', `Welcome back!`);
        router.push('/(tabs)');
      } else {
        // Handle login error (e.g., show error message)
        Alert.alert('Login Failed', data.message);
      }
    } catch (error) {
      
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f5e9dd]">
      <View className="flex-1 relative overflow-hidden">
        {/* Background decorative circles - adjusted for mobile */}
        <View className="absolute bg-[#e85d56] rounded-full"
          style={{
            width: screenWidth * 1.5,
            height: screenWidth * 1.5,
            right: -screenWidth * 0.3,
            top: -screenWidth * 0.6,
          }}
        />
        <View className="absolute bg-[#e85d56] rounded-full"
          style={{
            width: screenWidth * 0.8,
            height: screenWidth * 0.8,
            left: -screenWidth * 0.4,
            bottom: -screenWidth * 0.4,
          }}
        />
        
        {/* Decorative border circles - adjusted for mobile */}
        <View className="absolute border-[#f5e9dd] border-[3px] rounded-full"
          style={{
            width: screenWidth * 0.4,
            height: screenWidth * 0.4,
            right: -screenWidth * 0.1,
            top: screenHeight * 0.15,
          }}
        />
        <View className="absolute border-[#f5e9dd] border-[3px] rounded-full"
          style={{
            width: screenWidth * 0.5,
            height: screenWidth * 0.5,
            left: -screenWidth * 0.2,
            bottom: screenHeight * 0.1,
          }}
        />
        <View className="absolute border-[#e85d56] border-[3px] rounded-full"
          style={{
            width: screenWidth * 0.6,
            height: screenWidth * 0.6,
            left: screenWidth * 0.1,
            top: screenHeight * 0.1,
          }}
        />

        {/* Main login card - centered and responsive */}
        <View className="flex-1 justify-center items-center px-6">
          <View 
            className="bg-[#494949] rounded-[30px] shadow-lg p-8"
            style={{
              width: cardWidth,
              minHeight: cardHeight,
            }}
          >
            {/* Title */}
            <Text className="text-[#f5e9dd] text-[28px] font-bold text-center mb-2">
              Sign in to AgnoMitra
            </Text>

            {/* Subtitle */}
            <Text className="text-[#f5e9dd] text-[16px] text-center mb-8 opacity-90">
              Welcome back! Please sign in to continue
            </Text>

            {/* Google Sign In Button */}
            <TouchableOpacity 
              className="bg-[#494949] border border-black rounded-[30px] flex-row items-center justify-center py-4 px-6 mb-6"
              style={{ height: 56 }}
            >
              {/* Google Icon */}
              <View className="w-6 h-6 mr-3 bg-white rounded-full flex items-center justify-center">
                <Text className="text-[#4285f4] text-[14px] font-bold">G</Text>
              </View>
              <Text className="text-[#f5e9dd] text-[18px]">
                Continue with google
              </Text>
            </TouchableOpacity>

            {/* Or divider */}
            <Text className="text-[#f5e9dd] text-[18px] text-center mb-6">
              Or
            </Text>

            {/* Phone number label */}
            <Text className="text-[#f5e9dd] text-[18px] mb-3 self-start">
              Phone number
            </Text>

            {/* Phone input container */}
            <View className="flex-row items-center w-full mb-8">
              {/* Country code dropdown */}
              <TouchableOpacity 
                className="bg-[#3a3a3a] rounded-l-[25px] border border-[#5a5a5a] flex-row items-center justify-center px-4"
                style={{ height: 56, minWidth: 70 }}
              >
                <Text className="text-[#f5e9dd] text-[16px] mr-1">+91</Text>
                {/* Dropdown arrow */}
                <View style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 4,
                  borderRightWidth: 4,
                  borderTopWidth: 6,
                  borderLeftColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderTopColor: '#f5e9dd',
                }} />
              </TouchableOpacity>

              {/* Phone number input */}
              <TextInput
                className="flex-1 bg-[#3a3a3a] rounded-r-[25px] border border-[#5a5a5a] border-l-0 text-[#f5e9dd] text-[16px] px-4"
                style={{ height: 56 }}
                placeholder=""
                placeholderTextColor="#888"
                value={phoneNumber}
                maxLength={10} 
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            {/* Continue button */}
            <Pressable onPress={handleLogin} className="bg-[#f5e9dd] rounded-[25px] flex items-center justify-center py-4 px-8">
              <Text className="text-[#494949] text-[18px] font-medium">
                Continue
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
