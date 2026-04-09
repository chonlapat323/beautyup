import type { ReactNode } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors } from "@/theme";

type CommerceImageProps = {
  uri?: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
};

type CommerceImageBackgroundProps = {
  uri?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  children?: ReactNode;
};

export function CommerceImage({
  uri,
  style,
  resizeMode = "cover",
}: CommerceImageProps) {
  if (!uri) {
    return <View style={[styles.fallback, style]} />;
  }

  return <Image resizeMode={resizeMode} source={{ uri }} style={style} />;
}

export function CommerceImageBackground({
  uri,
  style,
  imageStyle,
  resizeMode = "cover",
  children,
}: CommerceImageBackgroundProps) {
  if (!uri) {
    return <View style={[styles.fallback, style]}>{children}</View>;
  }

  return (
    <ImageBackground
      imageStyle={imageStyle}
      resizeMode={resizeMode}
      source={{ uri }}
      style={style}
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
