import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";
import { LoginScreen } from "@/features/auth/screens/LoginScreen";
import { RegisterScreen } from "@/features/auth/screens/RegisterScreen";
import { AddressesScreen } from "@/features/profile/screens/AddressesScreen";
import { AddressFormScreen } from "@/features/profile/screens/AddressFormScreen";
import { OrderHistoryScreen } from "@/features/orders/screens/OrderHistoryScreen";
import { OrderDetailScreen } from "@/features/orders/screens/OrderDetailScreen";
import { RewardsScreen } from "@/features/profile/screens/RewardsScreen";
import { MyRedemptionsScreen } from "@/features/profile/screens/MyRedemptionsScreen";
import { RedemptionDetailScreen } from "@/features/profile/screens/RedemptionDetailScreen";
import { WithdrawalScreen } from "@/features/profile/screens/WithdrawalScreen";
import { CreditHistoryScreen } from "@/features/profile/screens/CreditHistoryScreen";
import { BankAccountScreen } from "@/features/profile/screens/BankAccountScreen";
import type { ProfileStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="AddressForm" component={AddressFormScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="MyRedemptions" component={MyRedemptionsScreen} />
      <Stack.Screen name="RedemptionDetail" component={RedemptionDetailScreen} />
      <Stack.Screen name="Withdrawal" component={WithdrawalScreen} />
      <Stack.Screen name="CreditHistory" component={CreditHistoryScreen} />
      <Stack.Screen name="BankAccount" component={BankAccountScreen} />
    </Stack.Navigator>
  );
}
