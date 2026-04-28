import { StyleSheet, View } from "react-native";

import { BrandLockup } from "@/components/ui/BrandLockup";
import { PointsPill } from "@/components/ui/PointsPill";
import { spacing } from "@/theme";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function AppHeader(_: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <BrandLockup compact />
      <PointsPill />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 92,
    paddingHorizontal: spacing["2xl"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 40, 25, 0.06)",
    shadowColor: "#1f5236",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});
