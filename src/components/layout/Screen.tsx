import { PropsWithChildren, useState } from "react";
import { RefreshControl, ScrollView, ScrollViewProps, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PointsPill } from "@/components/ui/PointsPill";
import { colors } from "@/theme";

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
  onRefresh?: () => Promise<void> | void;
}>;

export function Screen({
  children,
  scrollable = true,
  contentContainerStyle,
  onRefresh,
}: ScreenProps) {
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    if (!onRefresh) return;
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  }

  // edges excludes 'bottom' — the tab bar handles its own safe area inset
  if (!scrollable) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <View style={styles.content}>{children}</View>
        <View style={styles.pillOverlay} pointerEvents="box-none">
          <PointsPill />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      <View style={styles.pillOverlay} pointerEvents="box-none">
        <PointsPill />
      </View>
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
  pillOverlay: {
    position: "absolute",
    top: 16,
    right: 24,
  },
});
