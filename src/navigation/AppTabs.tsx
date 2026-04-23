import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";

import { ProfileStack } from "@/navigation/ProfileStack";
import { CartScreen } from "@/features/cart/screens/CartScreen";
import { ShopBrowseStack } from "@/navigation/ShopBrowseStack";
import { ShopStack } from "@/navigation/ShopStack";
import { useAppStore } from "@/store/useAppStore";
import type { TabParamList } from "@/navigation/types";
import { colors, fonts } from "@/theme";

const Tab = createBottomTabNavigator<TabParamList>();

type IconName = keyof typeof MaterialIcons.glyphMap;

function TabIcon({
  name,
  focused,
  badgeCount,
}: {
  name: IconName;
  focused: boolean;
  badgeCount?: number;
}) {
  return (
    <View>
      <MaterialIcons
        color={focused ? colors.primary : colors.textMuted}
        name={name}
        size={24}
      />
      {badgeCount != null && badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 99 ? "99+" : badgeCount}</Text>
        </View>
      )}
    </View>
  );
}

export function AppTabs() {
  const cartCount = useAppStore((state) =>
    state.cart.reduce((sum, item) => sum + item.quantity, 0),
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSoft,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fonts.medium,
          marginTop: 1,
        },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={ShopStack}
        options={{
          title: "สำรวจ",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="home" />
          ),
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopBrowseStack}
        options={{
          title: "ช้อป",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="local-mall" />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: "ตะกร้า",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              name={focused ? "shopping-cart" : "shopping-cart"}
              badgeCount={cartCount}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: "บัญชี",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name={focused ? "person" : "person-outline"} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 12,
  },
});
