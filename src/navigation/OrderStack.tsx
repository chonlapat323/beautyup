import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OrderDetailScreen } from "@/features/orders/screens/OrderDetailScreen";
import { OrderHistoryListScreen } from "@/features/orders/screens/OrderHistoryListScreen";
import type { OrderStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<OrderStackParamList>();

export function OrderStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={OrderHistoryListScreen} name="OrderHistory" />
      <Stack.Screen component={OrderDetailScreen} name="OrderDetail" />
    </Stack.Navigator>
  );
}
