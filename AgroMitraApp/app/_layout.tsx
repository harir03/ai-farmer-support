import { Stack } from "expo-router";
import "./global.css"
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'



export default function RootLayout() {
  return (

    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Aichat" options={{
        headerShown: false,
        navigationBarHidden: true,
        statusBarHidden: true
      }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  )
}
