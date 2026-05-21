import { act } from 'react';
import { useAppStore, getCartSummary } from '../useAppStore';

// Mock async storage used by zustand/persist
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Reset store state before each test
beforeEach(() => {
  useAppStore.setState({
    isAuthenticated: false,
    token: null,
    member: null,
    selectedShadeId: undefined,
    cart: [],
    orders: [],
    categories: [],
    products: [],
    banners: [],
    gatewayFee: 20,
    pointTiers: [
      { minSpend: 3000, points: 300 },
      { minSpend: 5000, points: 500 },
      { minSpend: 10000, points: 1000 },
    ],
    freeShippingThreshold: 1000,
    defaultShippingFee: 50,
    social: {},
    favoriteIds: [],
    isLoadingCatalog: false,
    isLoadingOrders: false,
    catalogError: false,
  });
});

describe('useAppStore — state เริ่มต้น', () => {
  it('ควรมี isAuthenticated เป็น false', () => {
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });

  it('ควรมี cart ว่างเปล่า', () => {
    expect(useAppStore.getState().cart).toEqual([]);
  });

  it('ควรมี favoriteIds ว่างเปล่า', () => {
    expect(useAppStore.getState().favoriteIds).toEqual([]);
  });

  it('ควรมีค่า gatewayFee เริ่มต้นเป็น 20', () => {
    expect(useAppStore.getState().gatewayFee).toBe(20);
  });

  it('ควรมีค่า defaultShippingFee เริ่มต้นเป็น 50', () => {
    expect(useAppStore.getState().defaultShippingFee).toBe(50);
  });

  it('ควรมีค่า freeShippingThreshold เริ่มต้นเป็น 1000', () => {
    expect(useAppStore.getState().freeShippingThreshold).toBe(1000);
  });
});

describe('useAppStore — signIn / signOut', () => {
  const memberInfo = {
    id: 'm1',
    fullName: 'ทดสอบ ผู้ใช้',
    email: 'test@example.com',
    phone: '0812345678',
    memberType: 'normal',
    pointBalance: 100,
    creditBalance: 0,
    referralCode: null,
    bankName: null,
    bankAccountNumber: null,
    bankAccountName: null,
  };

  it('เมื่อ signIn ควรตั้ง isAuthenticated เป็น true และ token ถูกต้อง', () => {
    act(() => {
      useAppStore.getState().signIn('token-abc', memberInfo);
    });

    const state = useAppStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('token-abc');
    expect(state.member?.fullName).toBe('ทดสอบ ผู้ใช้');
  });

  it('เมื่อ signOut ควรล้าง token และ member', () => {
    act(() => {
      useAppStore.getState().signIn('token-abc', memberInfo);
      useAppStore.getState().signOut();
    });

    const state = useAppStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.member).toBeNull();
  });
});

describe('useAppStore — addToCart', () => {
  it('ควรเพิ่มสินค้าใหม่เข้าตะกร้าพร้อม quantity = 1', () => {
    act(() => {
      useAppStore.getState().addToCart('prod-1');
    });

    const cart = useAppStore.getState().cart;
    expect(cart).toHaveLength(1);
    expect(cart[0]).toEqual({ productId: 'prod-1', quantity: 1 });
  });

  it('ควรเพิ่ม quantity หากสินค้าเดิมอยู่ในตะกร้าแล้ว', () => {
    act(() => {
      useAppStore.getState().addToCart('prod-1');
      useAppStore.getState().addToCart('prod-1');
    });

    const cart = useAppStore.getState().cart;
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it('ควรรองรับการระบุ quantity เอง', () => {
    act(() => {
      useAppStore.getState().addToCart('prod-1', 3);
    });

    expect(useAppStore.getState().cart[0].quantity).toBe(3);
  });

  it('ควรเพิ่มสินค้าหลายรายการได้อิสระ', () => {
    act(() => {
      useAppStore.getState().addToCart('prod-1');
      useAppStore.getState().addToCart('prod-2');
    });

    expect(useAppStore.getState().cart).toHaveLength(2);
  });
});

describe('useAppStore — updateQuantity', () => {
  it('ควรอัปเดต quantity ของสินค้าในตะกร้า', () => {
    act(() => {
      useAppStore.getState().addToCart('prod-1');
      useAppStore.getState().updateQuantity('prod-1', 5);
    });

    expect(useAppStore.getState().cart[0].quantity).toBe(5);
  });

  it('กรณี quantity <= 0 ควรลบสินค้าออกจากตะกร้า', () => {
    act(() => {
      useAppStore.getState().addToCart('prod-1');
      useAppStore.getState().updateQuantity('prod-1', 0);
    });

    expect(useAppStore.getState().cart).toHaveLength(0);
  });
});

describe('useAppStore — clearCart', () => {
  it('ควรล้างตะกร้าสินค้าทั้งหมด', () => {
    act(() => {
      useAppStore.getState().addToCart('prod-1');
      useAppStore.getState().addToCart('prod-2');
      useAppStore.getState().clearCart();
    });

    expect(useAppStore.getState().cart).toEqual([]);
  });
});

describe('useAppStore — toggleFavorite', () => {
  it('ควรเพิ่ม productId เข้า favoriteIds เมื่อยังไม่อยู่ในรายการ', () => {
    act(() => {
      useAppStore.getState().toggleFavorite('prod-1');
    });

    expect(useAppStore.getState().favoriteIds).toContain('prod-1');
  });

  it('ควรลบ productId ออกจาก favoriteIds เมื่อกด toggle ซ้ำ', () => {
    act(() => {
      useAppStore.getState().toggleFavorite('prod-1');
      useAppStore.getState().toggleFavorite('prod-1');
    });

    expect(useAppStore.getState().favoriteIds).not.toContain('prod-1');
  });
});

describe('getCartSummary', () => {
  it('ควรคำนวณ subtotal จากสินค้าในตะกร้าถูกต้อง', () => {
    act(() => {
      useAppStore.setState({
        products: [
          {
            id: 'p1',
            categoryId: 'c1',
            name: 'สินค้า A',
            subtitle: '',
            price: 500,
            description: '',
            accentColor: '',
          },
        ],
        cart: [{ productId: 'p1', quantity: 2 }],
      });
    });

    const summary = getCartSummary(useAppStore.getState().cart);
    expect(summary.subtotal).toBe(1000);
  });

  it('ควรไม่คิดค่าจัดส่งเมื่อ subtotal ถึง freeShippingThreshold', () => {
    act(() => {
      useAppStore.setState({
        products: [
          {
            id: 'p1',
            categoryId: 'c1',
            name: 'สินค้า A',
            subtitle: '',
            price: 1000,
            description: '',
            accentColor: '',
          },
        ],
        cart: [{ productId: 'p1', quantity: 1 }],
        freeShippingThreshold: 1000,
        defaultShippingFee: 50,
      });
    });

    const summary = getCartSummary(useAppStore.getState().cart);
    expect(summary.shippingFee).toBe(0);
  });

  it('ควรคิดค่าจัดส่งเมื่อ subtotal ต่ำกว่า freeShippingThreshold', () => {
    act(() => {
      useAppStore.setState({
        products: [
          {
            id: 'p1',
            categoryId: 'c1',
            name: 'สินค้า A',
            subtitle: '',
            price: 200,
            description: '',
            accentColor: '',
          },
        ],
        cart: [{ productId: 'p1', quantity: 1 }],
        freeShippingThreshold: 1000,
        defaultShippingFee: 50,
      });
    });

    const summary = getCartSummary(useAppStore.getState().cart);
    expect(summary.shippingFee).toBe(50);
    expect(summary.total).toBe(250);
  });
});
