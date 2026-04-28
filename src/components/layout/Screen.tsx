import { PropsWithChildren, ReactNode, useState } from "react";
import { RefreshControl, ScrollView, ScrollViewProps, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme";

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
  onRefresh?: () => Promise<void> | void;
  header?: ReactNode;
}>;

export function Screen({
  children,
  scrollable = true,
  contentContainerStyle,
  onRefresh,
  header,
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
        {header}
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      {header}
      <ScrollView
        style={styles.scrollArea}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
});
