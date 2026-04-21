import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

import { ProfileStack } from "@/navigation/ProfileStack";
import { CartScreen } from "@/features/cart/screens/CartScreen";
import { OrderStack } from "@/navigation/OrderStack";
import { ShopStack } from "@/navigation/ShopStack";
import type { TabParamList } from "@/navigation/types";
import { colors } from "@/theme";

const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ name, focused }: { name: keyof typeof MaterialIcons.glyphMap; focused: boolean }) {
  return (
    <MaterialIcons color={focused ? colors.primary : colors.textMuted} name={name} size={22} />
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
          height: 74,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={ShopStack}
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="home-filled" />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="shopping-bag" />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="receipt-long" />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="person-outline" />,
        }}
      />
    </Tab.Navigator>
  );
}
