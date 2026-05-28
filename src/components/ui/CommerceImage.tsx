import { Image, ImageBackground } from "expo-image";
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { ImageStyle } from "expo-image";

import { colors } from "@/theme";

type CommerceImageProps = {
  uri?: string;
  style?: StyleProp<ImageStyle>;
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
};

type CommerceImageBackgroundProps = {
  uri?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  children?: ReactNode;
};

export function CommerceImage({
  uri,
  style,
  contentFit = "cover",
}: CommerceImageProps) {
  if (!uri) {
    return <View style={[styles.fallback, style as StyleProp<ViewStyle>]} />;
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      cachePolicy="disk"
      transition={150}
    />
  );
}

export function CommerceImageBackground({
  uri,
  style,
  imageStyle,
  contentFit = "cover",
  children,
}: CommerceImageBackgroundProps) {
  if (!uri) {
    return <View style={[styles.fallback, style]}>{children}</View>;
  }

  return (
    <ImageBackground
      source={{ uri }}
      style={style}
      imageStyle={imageStyle}
      contentFit={contentFit}
      cachePolicy="disk"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.surfaceMuted,
  },
});
