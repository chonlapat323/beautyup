import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius } from "@/theme";

export function PointsPill() {
  const member = useAppStore((state) => state.member);
  if (!member) return null;

  return (
    <View style={styles.pill}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="auto-awesome" size={14} color={colors.primaryDark} />
      </View>
      <Text style={styles.text}>{member.pointBalance.toLocaleString()} pts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECF5EE",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#D3E5DA",
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.primaryDark,
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
});
