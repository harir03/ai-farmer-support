import { View, Text } from 'react-native'
import React from 'react'
import AiVoiceAgent from '@/components/AiVoiceAgent'
import { SafeAreaView } from 'react-native-safe-area-context'

const index = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#f5e9dd]">
      <AiVoiceAgent/>
    </SafeAreaView>
  )
}

export default index