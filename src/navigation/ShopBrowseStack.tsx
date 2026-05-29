import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ProductDetailScreen } from "@/features/shop/screens/ProductDetailScreen";
import { ProductListScreen } from "@/features/shop/screens/ProductListScreen";
import { ShopFilterScreen } from "@/features/shop/screens/ShopFilterScreen";
import type { ShopBrowseStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<ShopBrowseStackParamList>();

export function ShopBrowseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseHome" component={ShopFilterScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
