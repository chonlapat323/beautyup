import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { RootNavigator } from "@/navigation/RootNavigator";
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
  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}
