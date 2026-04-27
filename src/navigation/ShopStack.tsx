import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CartScreen } from "@/features/cart/screens/CartScreen";
import { CheckoutScreen } from "@/features/cart/screens/CheckoutScreen";
import { OrderSuccessScreen } from "@/features/cart/screens/OrderSuccessScreen";
import { PaymentScreen } from "@/features/cart/screens/PaymentScreen";
import { HomeScreen } from "@/features/home/screens/HomeScreen";
import { CategoriesScreen } from "@/features/shop/screens/CategoriesScreen";
import { ProductDetailScreen } from "@/features/shop/screens/ProductDetailScreen";
import { ProductListScreen } from "@/features/shop/screens/ProductListScreen";
import { SearchScreen } from "@/features/shop/screens/SearchScreen";
import { ShadeSelectionScreen } from "@/features/shop/screens/ShadeSelectionScreen";
import type { ShopStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<ShopStackParamList>();

export function ShopStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="ShadeSelection" component={ShadeSelectionScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
    </Stack.Navigator>
  );
}
