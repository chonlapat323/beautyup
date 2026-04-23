import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius } from "@/theme";

export function PointsPill() {
  const member = useAppStore((state) => state.member);
  if (!member) return null;

  return (
    <View style={styles.pill}>
      <MaterialIcons name="auto-awesome" size={13} color="#fff" />
      <Text style={styles.text}>{member.pointBalance.toLocaleString()} แต้ม</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    color: "#fff",
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
});
