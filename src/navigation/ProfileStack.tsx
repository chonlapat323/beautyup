import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";
import { LoginScreen } from "@/features/auth/screens/LoginScreen";
import { RegisterScreen } from "@/features/auth/screens/RegisterScreen";
import type { ProfileStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
