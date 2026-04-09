import { AuthStack } from "@/navigation/AuthStack";
import { AppTabs } from "@/navigation/AppTabs";
import { useAppStore } from "@/store/useAppStore";

export function RootNavigator() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  return isAuthenticated ? <AppTabs /> : <AuthStack />;
}
