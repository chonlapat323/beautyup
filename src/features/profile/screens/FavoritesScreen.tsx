import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { CommerceImage } from "@/components/ui/CommerceImage";
import { navigateToHome } from "@/navigation/helpers";
import type { ProfileStackParamList } from "@/navigation/types";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";
import type { Product } from "@/types/domain";

const CARD_GAP = 10;
const CARD_PADDING = 14;

function FavCard({
  product,
  onPress,
  onUnfavorite,
}: {
  product: Product;
  onPress: () => void;
  onUnfavorite: () => void;
}) {
  const isOutOfStock = (product.sellableStock ?? 1) === 0;
  const price = product.specialPrice ?? product.price;

  return (
    <Pressable
      style={[styles.card, isOutOfStock && styles.cardDim]}
      onPress={onPress}
    >
      <View style={styles.imageWrap}>
        <CommerceImage uri={product.images?.[0]?.url} style={styles.image} />
        {isOutOfStock && (
          <View style={styles.outBadge}>
            <Text style={styles.outBadgeText}>สินค้าหมด</Text>
          </View>
        )}
        <Pressable style={styles.heartBtn} onPress={onUnfavorite} hitSlop={6}>
          <MaterialIcons name="favorite" size={16} color={colors.gold} />
        </Pressable>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        {isOutOfStock ? (
          <Text style={styles.outText}>สินค้าหมด</Text>
        ) : (
          <Text style={styles.price}>฿{Number(price).toLocaleString()}</Text>
        )}
      </View>
    </Pressable>
  );
}

export function FavoritesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const favoriteIds = useAppStore((s) => s.favoriteIds);
  const products = useAppStore((s) => s.products);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  const favorited = products.filter((p) => favoriteIds.includes(p.id));

  return (
    <Screen scrollable={false}>
      <AppHeader
        title="สินค้าที่ถูกใจ"
        subtitle={favorited.length > 0 ? `${favorited.length} รายการ` : undefined}
        onBack={() => navigation.goBack()}
        breadcrumbs={[
          { label: "หน้าหลัก", onPress: () => navigateToHome(navigation) },
          { label: "บัญชีของฉัน", onPress: () => navigation.goBack() },
          { label: "ถูกใจ" },
        ]}
      />

      {favorited.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <MaterialIcons name="favorite-border" size={32} color={colors.gold} />
          </View>
          <Text style={styles.emptyTitle}>ยังไม่มีสินค้าที่ถูกใจ</Text>
          <Text style={styles.emptySub}>กดหัวใจที่สินค้าเพื่อเพิ่มในรายการนี้</Text>
          <Pressable style={styles.browseBtn} onPress={() => navigateToHome(navigation)}>
            <Text style={styles.browseBtnText}>เลือกดูสินค้า</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={favorited}
          keyExtractor={(item) => item.id}
          numColumns={2}
          style={{ flex: 1 }}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <FavCard
              product={item}
              onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
              onUnfavorite={() => void toggleFavorite(item.id)}
            />
          )}
        />
      )}
    </Screen>
  );
}

const CARD_WIDTH = `${(100 - CARD_PADDING * 2 - CARD_GAP) / 2}%` as unknown as number;

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: CARD_PADDING,
    paddingBottom: spacing["2xl"],
    paddingTop: spacing.sm,
    gap: CARD_GAP,
  },
  row: {
    gap: CARD_GAP,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    overflow: "hidden",
  },
  cardDim: {
    opacity: 0.65,
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceMuted,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  outBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#DC2626",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  outBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: fonts.semiBold,
  },
  heartBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.goldMuted,
  },
  cardBody: {
    padding: 8,
    gap: 2,
  },
  name: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  price: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.gold,
  },
  outText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "#DC2626",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing["2xl"],
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gold,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: "#fff",
    textAlign: "center",
  },
  emptySub: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },
  browseBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  browseBtnText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#fff",
  },
});
