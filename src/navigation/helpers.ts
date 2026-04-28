type NavigationLike = {
  navigate: (...args: any[]) => void;
  getParent?: () => NavigationLike | undefined;
  getState?: () => { routeNames?: string[] } | undefined;
};

export function navigateToHome(navigation: NavigationLike) {
  const parent = navigation.getParent?.();

  if (parent) {
    parent.navigate("Discover", { screen: "Home" });
    return;
  }

  navigation.navigate("Home");
}

export function navigateToCategories(navigation: NavigationLike) {
  const routeNames = navigation.getState?.()?.routeNames ?? [];
  if (routeNames.includes("Categories")) {
    navigation.navigate("Categories");
    return;
  }

  if (routeNames.includes("BrowseHome")) {
    navigation.navigate("BrowseHome");
    return;
  }

  const parent = navigation.getParent?.();
  if (parent) {
    parent.navigate("Shop", { screen: "BrowseHome" });
    return;
  }

  navigation.navigate("BrowseHome");
}

export function navigateToOrderHistory(navigation: NavigationLike) {
  const parent = navigation.getParent?.();

  if (parent) {
    parent.navigate("Profile", { screen: "OrderHistory" });
    return;
  }

  navigation.navigate("OrderHistory");
}

export function navigateToProfileHome(navigation: NavigationLike) {
  const routeNames = navigation.getState?.()?.routeNames ?? [];
  if (routeNames.includes("ProfileHome")) {
    navigation.navigate("ProfileHome");
    return;
  }

  const parent = navigation.getParent?.();
  if (parent) {
    parent.navigate("Profile", { screen: "ProfileHome" });
    return;
  }

  navigation.navigate("ProfileHome");
}
