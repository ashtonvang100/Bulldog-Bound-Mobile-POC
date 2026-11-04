import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: "bottom",
        tabBarActiveTintColor: colors.red,
        tabBarInactiveTintColor: colors.navy,
        tabBarStyle: { backgroundColor: colors.background },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={focused ? colors.red : colors.navy}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="genie"
        options={{
          title: "Bulldog Genie",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              color={focused ? colors.red : colors.navy}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
