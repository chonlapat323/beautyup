import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { HomeFeaturedSection } from '../HomeFeaturedSection';
import type { Product } from '@/types/domain';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  categoryId: 'cat1',
  name: 'ครีมบำรุงผิว',
  subtitle: 'สูตรอ่อนโยน',
  price: 299,
  description: '',
  accentColor: '#fff',
  ...overrides,
});

const defaultProps = {
  products: [makeProduct()],
  horizontalPadding: 24,
  onViewAll: jest.fn(),
  onPressProduct: jest.fn(),
  onAddToCart: jest.fn(),
};

describe('HomeFeaturedSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ควรแสดงหัวข้อ "สินค้าแนะนำ"', () => {
    render(<HomeFeaturedSection {...defaultProps} />);
    expect(screen.getByText('สินค้าแนะนำ')).toBeTruthy();
  });

  it('ควรแสดงปุ่ม "ดูทั้งหมด"', () => {
    render(<HomeFeaturedSection {...defaultProps} />);
    expect(screen.getByText(/ดูทั้งหมด/)).toBeTruthy();
  });

  it('ควรแสดงชื่อสินค้าและราคาถูกต้อง', () => {
    const products = [
      makeProduct({ id: 'p1', name: 'ครีมบำรุงผิว', price: 299 }),
    ];
    render(<HomeFeaturedSection {...defaultProps} products={products} />);

    expect(screen.getByText('ครีมบำรุงผิว')).toBeTruthy();
    expect(screen.getByText('฿299')).toBeTruthy();
  });

  it('ควรแสดงปุ่ม "ใส่ตะกร้า" สำหรับแต่ละสินค้า', () => {
    const products = [
      makeProduct({ id: 'p1', name: 'สินค้า 1' }),
      makeProduct({ id: 'p2', name: 'สินค้า 2' }),
    ];
    render(<HomeFeaturedSection {...defaultProps} products={products} />);

    const cartButtons = screen.getAllByText('ใส่ตะกร้า');
    expect(cartButtons).toHaveLength(2);
  });

  it('เมื่อกด "ใส่ตะกร้า" ควรเรียก onAddToCart พร้อม productId ที่ถูกต้อง', () => {
    const onAddToCart = jest.fn();
    const products = [makeProduct({ id: 'prod-123' })];
    render(
      <HomeFeaturedSection
        {...defaultProps}
        products={products}
        onAddToCart={onAddToCart}
      />
    );

    // ปุ่ม "ใส่ตะกร้า" เรียก event.stopPropagation() — ต้องส่ง event object ที่มี method นั้น
    fireEvent(screen.getByText('ใส่ตะกร้า'), 'press', { stopPropagation: jest.fn() });
    expect(onAddToCart).toHaveBeenCalledWith('prod-123');
  });

  it('เมื่อกดการ์ดสินค้าควรเรียก onPressProduct พร้อม productId', () => {
    const onPressProduct = jest.fn();
    const products = [makeProduct({ id: 'prod-abc', name: 'สินค้าทดสอบ' })];
    render(
      <HomeFeaturedSection
        {...defaultProps}
        products={products}
        onPressProduct={onPressProduct}
      />
    );

    fireEvent.press(screen.getByText('สินค้าทดสอบ'));
    expect(onPressProduct).toHaveBeenCalledWith('prod-abc');
  });

  it('กรณีไม่มีสินค้า (products = []) ควรไม่แสดงอะไรเลย', () => {
    const { toJSON } = render(
      <HomeFeaturedSection {...defaultProps} products={[]} />
    );
    expect(toJSON()).toBeNull();
  });

  it('ควรแสดงราคาที่ขีดทับ (originalPrice) เมื่อมีราคาเดิม', () => {
    const products = [makeProduct({ id: 'p1', price: 199, originalPrice: 350 })];
    render(<HomeFeaturedSection {...defaultProps} products={products} />);

    expect(screen.getByText('฿199')).toBeTruthy();
    expect(screen.getByText('฿350')).toBeTruthy();
  });

  it('เมื่อกด "ดูทั้งหมด" ควรเรียก onViewAll', () => {
    const onViewAll = jest.fn();
    render(
      <HomeFeaturedSection {...defaultProps} onViewAll={onViewAll} />
    );

    fireEvent.press(screen.getByText(/ดูทั้งหมด/));
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });
});
