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
        <MaterialIcons name="auto-awesome" size={14} color={colors.goldDark} />
      </View>
      <Text style={styles.text}>{member.pointBalance.toLocaleString()} แต้ม</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.goldSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.goldDeep,
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
});
