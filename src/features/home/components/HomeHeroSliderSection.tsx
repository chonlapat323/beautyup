import { MaterialIcons } from "@expo/vector-icons";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useEffect, useRef, useState } from "react";

import { CommerceImage } from "@/components/ui/CommerceImage";
import { colors, fonts, spacing } from "@/theme";
import type { Banner } from "@/types/domain";
import { HtmlText } from "@/utils/htmlText";

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
  const cardHeight = Math.round(cardWidth * 0.62);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<ScrollView>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const intervalId = setInterval(() => {
      setActiveIndex((cur) => {
        const next = (cur + 1) % banners.length;
        sliderRef.current?.scrollTo({ x: next * cardWidth, animated: true });
        return next;
      });
    }, 4200);
    return () => clearInterval(intervalId);
  }, [banners.length, cardWidth]);

  if (banners.length === 0) return null;

  const imageAreaSize = Math.round(cardHeight * 0.72);

  return (
    <View style={[styles.section, { marginHorizontal: horizontalPadding }]}>
      <ScrollView
        ref={sliderRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / cardWidth));
        }}
      >
        {banners.map((banner) => (
          <Pressable
            key={banner.id}
            onPress={() => onPressBanner(banner.linkType, banner.linkId)}
            style={[styles.card, { width: cardWidth, height: cardHeight }]}
          >
            {/* Background decoration */}
            <View style={styles.bgCircle} />
            <View style={styles.bgCircle2} />

            {/* Left: text content */}
            <View style={styles.copyWrap}>
              <Text style={styles.eyebrow}>{banner.eyebrow || "ดูแลเส้นผมทุกวัน"}</Text>
              <Text numberOfLines={2} style={styles.title}>{banner.title}</Text>
              {banner.body ? (
                <HtmlText html={banner.body} numberOfLines={2} style={styles.body} />
              ) : null}
              <Pressable style={styles.ctaButton} onPress={() => onPressBanner(banner.linkType, banner.linkId)}>
                <Text style={styles.ctaText}>{banner.buttonLabel || "ช้อปเลย"}</Text>
                <Animated.View
                  style={{
                    transform: [{
                      translateX: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }),
                    }],
                  }}
                >
                  <MaterialIcons color={colors.goldDark} name="arrow-forward" size={14} />
                </Animated.View>
              </Pressable>
            </View>

            {/* Right: product image */}
            <View style={[styles.imageContainer, { width: imageAreaSize, height: imageAreaSize }]}>
              {banner.imageUrl ? (
                <CommerceImage
                  style={styles.productImage}
                  uri={banner.imageUrl}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialIcons name="image" size={36} color="rgba(255,255,255,0.3)" />
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {banners.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 0,
  },
  card: {
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "#1A3A2A",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 24,
    paddingRight: 12,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  // Decorative background circles
  bgCircle: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: -80,
    right: -40,
  },
  bgCircle2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.03)",
    bottom: -60,
    left: -30,
  },
  // Left: text
  copyWrap: {
    flex: 1,
    gap: 8,
    zIndex: 1,
  },
  eyebrow: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: colors.gold,
    fontFamily: fonts.semiBold,
  },
  title: {
    fontSize: 28,
    lineHeight: 38,
    color: "#FFFFFF",
    fontFamily: fonts.extraBold,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.80)",
    fontFamily: fonts.medium,
  },
  ctaButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.gold,
  },
  ctaText: {
    color: colors.goldDark,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  // Right: image frame
  imageContainer: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    flexShrink: 0,
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  // Dots
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
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    width: 24,
    borderRadius: 8,
    backgroundColor: colors.gold,
  },
});
