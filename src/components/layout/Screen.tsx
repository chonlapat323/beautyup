import { PropsWithChildren, ReactNode, useState } from "react";
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, ScrollViewProps, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme";
import { FLOAT_TAB_HEIGHT, FLOAT_TAB_MARGIN } from "@/navigation/AppTabs";

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
  onRefresh?: () => Promise<void> | void;
  header?: ReactNode;
  backgroundColor?: string;
  noTabOffset?: boolean;
}>;

export function Screen({
  children,
  scrollable = true,
  contentContainerStyle,
  onRefresh,
  header,
  backgroundColor,
  noTabOffset = false,
}: ScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const { bottom } = useSafeAreaInsets();

  // Floating tab bar clearance — always at least this much paddingBottom
  const tabBarOffset = FLOAT_TAB_HEIGHT + FLOAT_TAB_MARGIN + (bottom > 0 ? bottom : 0) + 8;

  // Merge: take the max of screen's own paddingBottom vs tabBarOffset
  const passedStyle = StyleSheet.flatten(contentContainerStyle) as Record<string, unknown> | undefined;
  const passedPaddingBottom = typeof passedStyle?.paddingBottom === "number" ? passedStyle.paddingBottom : 0;
  const safePaddingBottom = noTabOffset ? passedPaddingBottom : Math.max(passedPaddingBottom, tabBarOffset);

  async function handleRefresh() {
    if (!onRefresh) return;
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  }

  if (!scrollable) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={[styles.safeArea, backgroundColor ? { backgroundColor } : null]}>
        {header}
        <View style={[styles.fixed, contentContainerStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, backgroundColor ? { backgroundColor } : null]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView edges={["top", "left", "right"]} style={[styles.safeArea, backgroundColor ? { backgroundColor } : null]}>
        {header}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[styles.content, backgroundColor ? { backgroundColor } : null, contentContainerStyle, { paddingBottom: safePaddingBottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollArea: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "flex-start",
    backgroundColor: colors.background,
  },
  fixed: { flex: 1, backgroundColor: colors.background },
});
