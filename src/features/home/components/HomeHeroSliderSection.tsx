import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

import { CommerceImage } from "@/components/ui/CommerceImage";
import { colors, fonts, spacing } from "@/theme";
import type { Banner } from "@/types/domain";

type HomeHeroSliderSectionProps = {
  banners: Banner[];
  horizontalPadding: number;
  onPressBanner: (linkType: string, linkId?: string) => void;
};

export function HomeHeroSliderSection({
  banners,
  horizontalPadding,
  onPressBanner,
}: HomeHeroSliderSectionProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width - horizontalPadding * 2;
  const cardHeight = Math.round(cardWidth * 0.78);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<ScrollView>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const intervalId = setInterval(() => {
      setActiveIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % banners.length;
        sliderRef.current?.scrollTo({
          x: nextIndex * cardWidth,
          animated: true,
        });
        return nextIndex;
      });
    }, 4200);

    return () => clearInterval(intervalId);
  }, [banners.length, cardWidth]);

  if (banners.length === 0) return null;

  return (
    <View style={[styles.section, { marginHorizontal: horizontalPadding }]}>
      <ScrollView
        ref={sliderRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
          setActiveIndex(index);
        }}
      >
        {banners.map((banner) => (
          <Pressable
            key={banner.id}
            onPress={() => onPressBanner(banner.linkType, banner.linkId)}
            style={[styles.card, { width: cardWidth, height: cardHeight }]}
          >
            <View style={styles.imageLayer}>
              <CommerceImage
                resizeMode="cover"
                style={styles.backgroundImage}
                uri={banner.imageUrl}
              />
            </View>

            <View style={styles.rightFadeLayer} />
            <View style={styles.globalTint} />
            <View style={styles.leftMistyVeil} />
            <View style={styles.topGlassSheen} />

            <View style={styles.copyWrap}>
              <Text style={styles.eyebrow}>{banner.eyebrow || "Spring ritual"}</Text>
              <Text numberOfLines={2} style={styles.title}>
                {banner.title}
              </Text>
              <Text numberOfLines={2} style={styles.body}>
                {banner.body ||
                  "Curated haircare with a softer feel, calm styling, and a premium finish."}
              </Text>

              <Pressable style={styles.ctaButton}>
                <Text style={styles.ctaText}>{banner.buttonLabel || "Shop now"}</Text>
                <Animated.View
                  style={{
                    transform: [
                      {
                        translateX: pulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 4],
                        }),
                      },
                    ],
                  }}
                >
                  <MaterialIcons color="#FFFFFF" name="arrow-forward" size={14} />
                </Animated.View>
              </Pressable>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing["2xl"],
  },
  card: {
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "#D9E7DC",
    position: "relative",
    justifyContent: "center",
    shadowColor: "#214530",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  imageLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    opacity: 0.92,
  },
  rightFadeLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  globalTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(29, 63, 43, 0.14)",
  },
  leftMistyVeil: {
    position: "absolute",
    width: 320,
    height: 320,
    top: -72,
    left: -92,
    borderRadius: 999,
    backgroundColor: "rgba(24, 66, 45, 0.5)",
    transform: [{ scaleX: 1.05 }, { scaleY: 1.25 }],
  },
  topGlassSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  copyWrap: {
    width: "58%",
    paddingHorizontal: 24,
    paddingVertical: 26,
    gap: 10,
    zIndex: 2,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.86)",
    fontFamily: fonts.semiBold,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    color: "#FFFFFF",
    fontFamily: fonts.extraBold,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.92)",
    fontFamily: fonts.medium,
    maxWidth: 220,
  },
  ctaButton: {
    alignSelf: "flex-start",
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D5DFD7",
  },
  dotActive: {
    width: 24,
    borderRadius: 8,
    backgroundColor: colors.primaryDark,
  },
});
