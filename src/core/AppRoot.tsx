import {
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_600SemiBold,
  NotoSansThai_700Bold,
  NotoSansThai_800ExtraBold,
} from "@expo-google-fonts/noto-sans-thai";
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

import { RootNavigator } from "@/navigation/RootNavigator";
import { useAppStore } from "@/store/useAppStore";
import { colors } from "@/theme";

SplashScreen.preventAutoHideAsync();

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

  const [fontsLoaded] = useFonts({
    NotoSansThai_400Regular,
    NotoSansThai_500Medium,
    NotoSansThai_600SemiBold,
    NotoSansThai_700Bold,
    NotoSansThai_800ExtraBold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
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
    fontFamily: "NotoSansThai_500Medium",
  },
});
