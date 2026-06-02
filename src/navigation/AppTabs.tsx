/**
 * AppTabs — Floating Tab Bar v2
 *
 * การเปลี่ยนแปลง:
 * ─────────────────
 * • position: 'absolute' → tab bar ลอยเหนือ content ไม่ดัน layout
 * • left / right: FLOAT_MARGIN (14px) → เว้นขอบทุกด้าน
 * • bottom: FLOAT_MARGIN + inset → ลอยขึ้นจากขอบจอ
 * • borderRadius: 28 → มนทุกด้าน (ไม่ใช่แค่ top)
 * • borderWidth: 1px gold → เส้นขอบบาง
 * • shadow → ให้ความรู้สึกลอยจริง
 * • ลบ borderTopWidth / borderTopColor → ไม่จำเป็นเมื่อมี border ครบรอบ
 *
 * ป้องกันการกระทบ screens อื่น:
 * ─────────────────────────────────
 * Export FLOAT_TAB_BAR_HEIGHT → ทุก Screen ใช้เป็น paddingBottom
 * โดย Screen component wrapper อ่านค่านี้อัตโนมัติ
 * (ดูตัวอย่างการใช้งานใน Screen.tsx ด้านล่าง)
 */

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfileStack } from "@/navigation/ProfileStack";
import { CartScreen } from "@/features/cart/screens/CartScreen";
import { ShopBrowseStack } from "@/navigation/ShopBrowseStack";
import { ShopStack } from "@/navigation/ShopStack";
import { useAppStore } from "@/store/useAppStore";
import type { TabParamList } from "@/navigation/types";
import { colors, fonts } from "@/theme";

const Tab = createBottomTabNavigator<TabParamList>();

// ✦ Export ค่านี้ให้ Screen component ใช้เป็น paddingBottom
export const FLOAT_TAB_MARGIN = 14;       // margin รอบ tab bar
export const FLOAT_TAB_HEIGHT = 58;       // ความสูงของ tab bar (ไม่รวม inset)

// TAB_BAR_TOTAL = FLOAT_TAB_HEIGHT + FLOAT_TAB_MARGIN + bottom inset
// → Screen จะ import FLOAT_TAB_HEIGHT + FLOAT_TAB_MARGIN แล้วบวก inset เอง

type IconName = keyof typeof MaterialIcons.glyphMap;

function TabIcon({
  name, focused, badgeCount,
}: {
  name: IconName; focused: boolean; badgeCount?: number;
}) {
  return (
    <View>
      <MaterialIcons
        color={focused ? colors.gold : colors.textMuted}
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
  const { bottom } = useSafeAreaInsets();

  // ✦ Tab bar style — floating
  const floatingTabBarStyle = {
    // ── Position ──
    position: "absolute" as const,
    left: FLOAT_TAB_MARGIN,
    right: FLOAT_TAB_MARGIN,
    bottom: FLOAT_TAB_MARGIN + (bottom > 0 ? bottom : 0),

    // ── Shape ──
    height: FLOAT_TAB_HEIGHT,
    borderRadius: 28,             // ✦ มนทุกด้าน

    // ── Color / Border ──
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.goldMuted,

    // ── Padding ──
    paddingTop: 8,
    paddingBottom: 8,

    // ── Shadow (iOS) ──
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },

    // ── Elevation (Android) ──
    elevation: 12,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: floatingTabBarStyle,
        tabBarActiveTintColor: colors.gold,
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
          title: "หน้าหลัก",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="home" />,
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopBrowseStack}
        options={{
          title: "ช้อป",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="local-mall" />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: "ตะกร้า",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="shopping-cart" badgeCount={cartCount} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        listeners={({ navigation }) => ({
          tabPress: () => navigation.navigate("Profile", { screen: "ProfileHome" }),
        })}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "ProfileHome";
          const hideTabBar = routeName === "Login" || routeName === "Register";
          return {
            title: "บัญชี",
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} name={focused ? "person" : "person-outline"} />
            ),
            tabBarStyle: hideTabBar ? { display: "none" } : floatingTabBarStyle,
          };
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
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.goldDark,
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 12,
  },
});

/**
 * ─────────────────────────────────────────────────────────────
 * วิธีใช้ใน Screen.tsx (Layout wrapper)
 * ─────────────────────────────────────────────────────────────
 *
 * import { FLOAT_TAB_HEIGHT, FLOAT_TAB_MARGIN } from "@/navigation/AppTabs";
 * import { useSafeAreaInsets } from "react-native-safe-area-context";
 *
 * export function Screen({ contentContainerStyle, children, ...props }) {
 *   const { bottom } = useSafeAreaInsets();
 *
 *   // ✦ padding ที่ต้องเพิ่มให้ content ไม่ถูก floating tab bar บัง
 *   const tabBarOffset = FLOAT_TAB_HEIGHT + FLOAT_TAB_MARGIN + (bottom > 0 ? bottom : 0);
 *
 *   return (
 *     <ScrollView
 *       contentContainerStyle={[
 *         { paddingBottom: tabBarOffset + 8 },  // +8 breathing room
 *         contentContainerStyle,
 *       ]}
 *       {...props}
 *     >
 *       {children}
 *     </ScrollView>
 *   );
 * }
 *
 * ─────────────────────────────────────────────────────────────
 * หรือถ้าใช้ Screen ที่มี scrollable={false} (เช่น SearchScreen):
 * ─────────────────────────────────────────────────────────────
 * ใน FlatList / ScrollView ใส่:
 *   contentInset={{ bottom: tabBarOffset }}          // iOS
 *   contentContainerStyle={{ paddingBottom: tabBarOffset }}  // Android + iOS
 * ─────────────────────────────────────────────────────────────
 */
