import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import { OrderHistoryScreen } from "@/features/orders/screens/OrderHistoryScreen";
import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";
import { ShopStack } from "@/navigation/ShopStack";
import type { TabParamList } from "@/navigation/types";
import { colors } from "@/theme";

const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ color: focused ? colors.primary : colors.textMuted, fontSize: 11 }}>
      {label}
    </Text>
  );
}

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSoft,
        },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={ShopStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Home" /> }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderHistoryScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Orders" /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Profile" /> }}
      />
    </Tab.Navigator>
  );
}
