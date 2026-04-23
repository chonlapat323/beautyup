type NavigationLike = {
  navigate: (...args: any[]) => void;
  getParent?: () => NavigationLike | undefined;
};

export function navigateToHome(navigation: NavigationLike) {
  const parent = navigation.getParent?.();

  if (parent) {
    parent.navigate("Discover", { screen: "Home" });
    return;
  }

  navigation.navigate("Home");
}

export function navigateToOrderHistory(navigation: NavigationLike) {
  const parent = navigation.getParent?.();

  if (parent) {
    parent.navigate("Profile", { screen: "OrderHistory" });
    return;
  }

  navigation.navigate("OrderHistory");
}
