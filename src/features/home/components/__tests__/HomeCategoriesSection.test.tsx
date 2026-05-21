import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { HomeCategoriesSection } from '../HomeCategoriesSection';
import type { Category } from '@/types/domain';

const makeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 'cat1',
  title: 'ลิปสติก',
  eyebrow: '',
  subtitle: '',
  requiresShadeSelection: false,
  slug: 'lipstick',
  ...overrides,
});

const defaultProps = {
  categories: [makeCategory()],
  horizontalPadding: 24,
  onSelectCategory: jest.fn(),
  onViewAll: jest.fn(),
};

describe('HomeCategoriesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ควรแสดงหัวข้อ "หมวดหมู่"', () => {
    render(<HomeCategoriesSection {...defaultProps} />);
    expect(screen.getByText('หมวดหมู่')).toBeTruthy();
  });

  it('ควรแสดงปุ่ม "ดูทั้งหมด"', () => {
    render(<HomeCategoriesSection {...defaultProps} />);
    expect(screen.getByText('ดูทั้งหมด')).toBeTruthy();
  });

  it('ควรแสดงชื่อหมวดหมู่ที่ส่งเข้ามา', () => {
    const categories = [
      makeCategory({ id: 'c1', title: 'ลิปสติก' }),
      makeCategory({ id: 'c2', title: 'ครีมบำรุง' }),
    ];
    render(<HomeCategoriesSection {...defaultProps} categories={categories} />);

    expect(screen.getByText('ลิปสติก')).toBeTruthy();
    expect(screen.getByText('ครีมบำรุง')).toBeTruthy();
  });

  it('ควรแสดงปุ่ม "ช้อป" สำหรับแต่ละหมวดหมู่', () => {
    const categories = [
      makeCategory({ id: 'c1', title: 'ลิปสติก' }),
      makeCategory({ id: 'c2', title: 'ครีมบำรุง' }),
    ];
    render(<HomeCategoriesSection {...defaultProps} categories={categories} />);

    const shopButtons = screen.getAllByText('ช้อป');
    expect(shopButtons).toHaveLength(2);
  });

  it('กรณีไม่มีหมวดหมู่ (categories = []) ควรไม่แสดงอะไร', () => {
    const { toJSON } = render(
      <HomeCategoriesSection {...defaultProps} categories={[]} />
    );
    expect(toJSON()).toBeNull();
  });

  it('เมื่อกดปุ่ม "ช้อป" ควรเรียก onSelectCategory พร้อม id และ requiresShadeSelection', () => {
    const onSelectCategory = jest.fn();
    const categories = [
      makeCategory({ id: 'cat-shade', requiresShadeSelection: true, title: 'ลิปสติก' }),
    ];
    render(
      <HomeCategoriesSection
        {...defaultProps}
        categories={categories}
        onSelectCategory={onSelectCategory}
      />
    );

    fireEvent.press(screen.getByText('ช้อป'));
    expect(onSelectCategory).toHaveBeenCalledWith('cat-shade', true);
  });

  it('เมื่อกด "ดูทั้งหมด" ควรเรียก onViewAll', () => {
    const onViewAll = jest.fn();
    render(
      <HomeCategoriesSection {...defaultProps} onViewAll={onViewAll} />
    );

    fireEvent.press(screen.getByText('ดูทั้งหมด'));
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it('ควรแสดงหมวดหมู่ไม่เกิน 3 รายการ แม้จะส่งมามากกว่า', () => {
    const categories = [
      makeCategory({ id: 'c1', title: 'หมวด 1' }),
      makeCategory({ id: 'c2', title: 'หมวด 2' }),
      makeCategory({ id: 'c3', title: 'หมวด 3' }),
      makeCategory({ id: 'c4', title: 'หมวด 4' }),
    ];
    render(<HomeCategoriesSection {...defaultProps} categories={categories} />);

    // ปุ่มช้อปสูงสุด 3 ปุ่ม (slice(0,3))
    const shopButtons = screen.getAllByText('ช้อป');
    expect(shopButtons).toHaveLength(3);
    expect(screen.queryByText('หมวด 4')).toBeNull();
  });
});
