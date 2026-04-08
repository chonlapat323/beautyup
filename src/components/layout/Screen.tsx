import { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, ScrollViewProps, StyleSheet, View } from "react-native";

import { colors } from "@/theme";

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
}>;

export function Screen({
  children,
  scrollable = true,
  contentContainerStyle,
}: ScreenProps) {
  if (!scrollable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
});
