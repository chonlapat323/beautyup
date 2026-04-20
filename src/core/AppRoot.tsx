import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { RootNavigator } from "@/navigation/RootNavigator";
import { useAppStore } from "@/store/useAppStore";
import { colors } from "@/theme";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.borderSoft,
    primary: colors.primary,
  },
};

export function AppRoot() {
  const loadCatalog = useAppStore((state) => state.loadCatalog);
  const catalogError = useAppStore((state) => state.catalogError);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="dark" />
      {catalogError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            ⚠️  ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ — กำลังแสดงข้อมูลตัวอย่าง
          </Text>
        </View>
      ) : null}
      <RootNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: "#7C3D12",
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#FEF3C7",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
});
