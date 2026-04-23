import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";
import { LoginScreen } from "@/features/auth/screens/LoginScreen";
import { RegisterScreen } from "@/features/auth/screens/RegisterScreen";
import { AddressesScreen } from "@/features/profile/screens/AddressesScreen";
import { AddressFormScreen } from "@/features/profile/screens/AddressFormScreen";
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
    </Stack.Navigator>
  );
}
