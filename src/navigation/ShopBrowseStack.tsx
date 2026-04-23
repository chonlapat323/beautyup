import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CategoriesScreen } from "@/features/shop/screens/CategoriesScreen";
import { ProductDetailScreen } from "@/features/shop/screens/ProductDetailScreen";
import { ProductListScreen } from "@/features/shop/screens/ProductListScreen";
import { ShadeSelectionScreen } from "@/features/shop/screens/ShadeSelectionScreen";
import type { ShopBrowseStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<ShopBrowseStackParamList>();

export function ShopBrowseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseHome" component={CategoriesScreen} />
      <Stack.Screen name="ShadeSelection" component={ShadeSelectionScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
