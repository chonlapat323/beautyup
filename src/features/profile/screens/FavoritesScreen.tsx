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

function FavCard({
  product,
  onPress,
  onAddToCart,
  onToggleFavorite,
}: {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
}) {
  const isOutOfStock = (product.sellableStock ?? 1) === 0;
  const isLowStock =
    !isOutOfStock &&
    product.sellableStock != null &&
    product.sellableStock > 0 &&
    product.sellableStock <= (product.totalStock ?? product.sellableStock) * 0.5;

  return (
    <Pressable onPress={onPress} style={[styles.card, isOutOfStock && styles.cardOutOfStock]}>
      <View style={styles.imageWrap}>
        <CommerceImage style={styles.preview} uri={product.imageUrl} thumbnailUri={product.thumbnailUrl} contentFit="cover" />

        {product.originalPrice != null && !isOutOfStock && (
          <View style={styles.saleBadge}><Text style={styles.saleBadgeText}>ลดราคา</Text></View>
        )}
        {isOutOfStock && (
          <View style={styles.outOfStockBadge}><Text style={styles.outOfStockText}>สินค้าหมด</Text></View>
        )}
        {isLowStock && (
          <View style={styles.lowStockBadge}><Text style={styles.lowStockText}>ใกล้หมด</Text></View>
        )}

        <Pressable style={styles.heartBtn} onPress={(e) => { e.stopPropagation(); onToggleFavorite(); }} hitSlop={6}>
          <MaterialIcons name="favorite" size={14} color="#E85C7A" />
        </Pressable>

        <Pressable
          style={[styles.cartBtn, isOutOfStock && styles.cartBtnDisabled]}
          onPress={(e) => { e.stopPropagation(); if (!isOutOfStock) onAddToCart(); }}
          hitSlop={4}
          disabled={isOutOfStock}
        >
          <MaterialIcons name="add-shopping-cart" size={15} color={isOutOfStock ? colors.textMuted : colors.goldDark} />
        </Pressable>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardMeta} numberOfLines={1}>{product.subtitle}</Text>
        <Text style={styles.cardName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>฿{product.price.toFixed(0)}</Text>
          {product.originalPrice != null && (
            <Text style={styles.origPrice}>฿{product.originalPrice.toFixed(0)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function FavoritesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const favoriteIds = useAppStore((s) => s.favoriteIds);
  const products = useAppStore((s) => s.products);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const addToCart = useAppStore((s) => s.addToCart);

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
              onToggleFavorite={() => void toggleFavorite(item.id)}
              onAddToCart={() => addToCart(item.id)}
            />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 16,
    paddingBottom: spacing["2xl"],
    paddingTop: spacing.sm,
    gap: 12,
  },
  row: {
    gap: 12,
  },
  card: {
    width: "47.5%",
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.goldMuted,
  },
  cardOutOfStock: {
    opacity: 0.65,
  },
  imageWrap: {
    position: "relative",
  },
  preview: {
    width: "100%",
    aspectRatio: 0.85,
    backgroundColor: colors.surfaceMuted,
  },
  saleBadge: {
    position: "absolute",
    top: 7,
    left: 7,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  saleBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  lowStockBadge: {
    position: "absolute",
    bottom: 7,
    left: 7,
    backgroundColor: "#3a3a3a",
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  lowStockText: {
    color: "#e0e0e0",
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  outOfStockBadge: {
    position: "absolute",
    bottom: 7,
    left: 7,
    backgroundColor: "rgba(220,38,38,0.85)",
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  outOfStockText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  heartBtn: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBtn: {
    position: "absolute",
    bottom: 7,
    right: 7,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.gold,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cartBtnDisabled: {
    backgroundColor: colors.surfaceMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  cardBody: {
    padding: 10,
    gap: 3,
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  cardName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontFamily: fonts.semiBold,
    lineHeight: 17,
    minHeight: 34,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 2,
  },
  price: {
    color: colors.goldDeep,
    fontSize: 15,
    fontFamily: fonts.extraBold,
  },
  origPrice: {
    color: colors.textMuted,
    fontSize: 11,
    textDecorationLine: "line-through",
    fontFamily: fonts.medium,
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
