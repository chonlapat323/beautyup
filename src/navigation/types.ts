import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Login: undefined;
  Register: undefined;
  Addresses: undefined;
  AddressForm: { addressId?: string };
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
};

export type ShopStackParamList = {
  Home: undefined;
  Search: undefined;
  Categories: undefined;
  ShadeSelection: { categoryId: string };
  ProductList: { categoryId: string; shadeId?: string; shadeName?: string };
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
};

export type OrderStackParamList = {
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
};

export type ShopBrowseStackParamList = {
  BrowseHome: undefined;
  ShadeSelection: { categoryId: string };
  ProductList: { categoryId: string; shadeId?: string; shadeName?: string };
  ProductDetail: { productId: string };
};

export type TabParamList = {
  Discover: undefined;
  Shop: NavigatorScreenParams<ShopBrowseStackParamList>;
  Cart: undefined;
  Profile: undefined;
};
