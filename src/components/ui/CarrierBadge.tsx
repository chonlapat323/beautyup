import { StyleSheet, Text, View } from "react-native";
import { fonts } from "@/theme";
import type { Carrier } from "@/config/carriers";

/**
 * แสดง carrier badge ด้วยสีแบรนด์ + ชื่อย่อ
 * ใช้เป็น placeholder จนกว่าจะมี logo PNG จริง
 */
type Props = {
  carrier: Carrier;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: { container: 28, fontSize: 7, radius: 6 },
  md: { container: 40, fontSize: 9, radius: 8 },
  lg: { container: 52, fontSize: 11, radius: 10 },
};

export function CarrierBadge({ carrier, size = "md" }: Props) {
  const s = SIZES[size];
  return (
    <View
      style={[
        styles.badge,
        {
          width: s.container,
          height: s.container,
          borderRadius: s.radius,
          backgroundColor: carrier.color,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontSize: s.fontSize, color: carrier.textColor },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {carrier.shortName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  text: {
    fontFamily: fonts.bold,
    textAlign: "center",
    letterSpacing: -0.3,
  },
});
