import { Stack } from "expo-router";
import "./global.css"



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
