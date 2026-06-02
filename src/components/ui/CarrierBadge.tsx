import { Image, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { fonts } from "@/theme";
import type { Carrier } from "@/config/carriers";

type Props = {
  carrier: Carrier;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
};

const SIZES = {
  sm: { img: 24, radius: 6, fontSize: 7 },
  md: { img: 36, radius: 8, fontSize: 9 },
  lg: { img: 48, radius: 10, fontSize: 11 },
};

export function CarrierBadge({ carrier, size = "md", showName = false }: Props) {
  const s = SIZES[size];

  return (
    <View style={styles.wrap}>
      <View style={[styles.imgBox, { width: s.img, height: s.img, borderRadius: s.radius, backgroundColor: carrier.color + "22" }]}>
        {carrier.logoUrl ? (
          <Image
            source={{ uri: carrier.logoUrl }}
            style={{ width: s.img - 8, height: s.img - 8, borderRadius: s.radius - 2 }}
            resizeMode="contain"
          />
        ) : (
          // ไปรษณีย์ไทย — mail icon
          <MaterialIcons name="mail" size={s.img * 0.55} color={carrier.color} />
        )}
      </View>
      {showName && (
        <Text style={[styles.name, { fontSize: s.fontSize }]} numberOfLines={1}>
          {carrier.name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 4,
  },
  imgBox: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  name: {
    fontFamily: fonts.semiBold,
    color: "#1a1a1a",
    textAlign: "center",
  },
});
