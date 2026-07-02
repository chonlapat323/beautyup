import { Image, ImageBackground } from "expo-image";
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { ImageStyle } from "expo-image";

import { colors } from "@/theme";

type CommerceImageProps = {
  uri?: string;
  thumbnailUri?: string;
  style?: StyleProp<ImageStyle>;
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
};

type CommerceImageBackgroundProps = {
  uri?: string;
  thumbnailUri?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  children?: ReactNode;
};

export function CommerceImage({
  uri,
  thumbnailUri,
  style,
  contentFit = "cover",
}: CommerceImageProps) {
  if (!uri) {
    return <View style={[styles.fallback, style as StyleProp<ViewStyle>]} />;
  }

  return (
    <Image
      source={{ uri }}
      placeholder={thumbnailUri ? { uri: thumbnailUri } : undefined}
      style={style}
      contentFit={contentFit}
      cachePolicy="disk"
      transition={200}
    />
  );
}

export function CommerceImageBackground({
  uri,
  thumbnailUri,
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
      placeholder={thumbnailUri ? { uri: thumbnailUri } : undefined}
      style={style}
      imageStyle={imageStyle}
      contentFit={contentFit}
      cachePolicy="disk"
      transition={200}
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
