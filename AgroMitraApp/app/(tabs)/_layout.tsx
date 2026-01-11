import { Tabs } from "expo-router";
import { FontAwesome6, Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#059669', // Green color to match your app theme
                tabBarInactiveTintColor: '#6b7280',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e5e7eb',
                    height: 80,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
                }} />
            <Tabs.Screen
                name="Task"
                options={{
                    title: "Tasks",
                    tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
                }} />
            <Tabs.Screen
                name="Community"
                options={{
                    title: "Community",
                    tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
                }} />
            <Tabs.Screen
                name="Farm"
                options={{
                    title: "Farm",
                    tabBarIcon: ({ color, size }) => <FontAwesome6 name="tractor" size={20} color={color} />,
                }} />
            <Tabs.Screen
                name="More"
                options={{
                    title: "More",
                    tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" size={size} color={color} />,
                }} />
            {/* <Tabs.Screen
                name="Aichat"
                options={{
                    title: "Aichat",
                    tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" size={size} color={color} />,
                }} /> */}
        </Tabs>
    );
}