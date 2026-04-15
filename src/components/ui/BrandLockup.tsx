import { Image, StyleSheet, View } from "react-native";

import { brandLogo } from "@/brand";

type BrandLockupProps = {
  compact?: boolean;
  size?: "default" | "hero";
};

export function BrandLockup({ compact = false, size = "default" }: BrandLockupProps) {
  const imageStyle = compact
    ? styles.logoCompact
    : size === "hero"
      ? styles.logoHero
      : styles.logo;

  return (
    <View style={styles.row}>
      <Image source={brandLogo} style={imageStyle} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 112,
    height: 112,
  },
  logoHero: {
    width: 224,
    height: 224,
  },
  logoCompact: {
    width: 88,
    height: 88,
  },
});
