import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type ShopStackParamList = {
  Home: undefined;
  Categories: undefined;
  ShadeSelection: { categoryId: string };
  ProductList: { categoryId: string; shadeId?: string };
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
};

export type OrderStackParamList = {
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
};

export type TabParamList = {
  Discover: undefined;
  Cart: undefined;
  Orders: NavigatorScreenParams<OrderStackParamList>;
  Profile: undefined;
};
