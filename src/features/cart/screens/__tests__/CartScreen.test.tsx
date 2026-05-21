import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'

import { CartScreen } from '../CartScreen'

// ── Navigation mock ───────────────────────────────────────────────────────────
const mockNavigate = jest.fn()
const mockDispatch = jest.fn()

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, dispatch: mockDispatch }),
}))

// ── Store mock ────────────────────────────────────────────────────────────────
jest.mock('@/store/useAppStore', () => ({
  useAppStore: jest.fn(),
  getCartSummary: jest.fn(),
}))

import { useAppStore, getCartSummary } from '@/store/useAppStore'
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>
const mockGetCartSummary = getCartSummary as jest.MockedFunction<typeof getCartSummary>

// ── Navigation helpers mock ───────────────────────────────────────────────────
const mockNavigateToCategories = jest.fn()

jest.mock('@/navigation/helpers', () => ({
  navigateToHome: jest.fn(),
  navigateToCategories: (...args: any[]) => mockNavigateToCategories(...args),
}))

// ── Child component mocks ─────────────────────────────────────────────────────
jest.mock('@/components/layout/Screen', () => ({
  Screen: ({ children, header }: any) => (
    <>
      {header}
      {children}
    </>
  ),
}))

jest.mock('@/components/ui/AppHeader', () => ({
  AppHeader: ({ title }: any) => <>{title}</>,
}))

jest.mock('@/components/ui/CommerceImage', () => ({
  CommerceImage: () => null,
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────
const defaultSummary = {
  subtotal: 0,
  shippingFee: 50,
  total: 50,
  pointsPreview: 0,
  freeShippingThreshold: 1000,
  gatewayFee: 20,
}

const sampleProduct = {
  id: 'p1',
  name: 'Velvet Hair Oil',
  price: 490,
  imageUrl: '',
  categoryId: 'c1',
  subtitle: '',
  description: '',
  accentColor: '',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function mockStore(overrides: Partial<{
  cart: any[]
  products: any[]
  updateQuantity: jest.Mock
  isAuthenticated: boolean
}> = {}) {
  const state = {
    cart: [],
    products: [],
    updateQuantity: jest.fn(),
    isAuthenticated: true,
    ...overrides,
  }
  mockUseAppStore.mockImplementation((selector: any) => selector(state))
}

function renderCart() {
  return render(
    <NavigationContainer>
      <CartScreen />
    </NavigationContainer>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks()
  mockGetCartSummary.mockReturnValue(defaultSummary)
})

describe('CartScreen', () => {
  it('แสดงข้อความ "ยังไม่มีสินค้าในตะกร้า" เมื่อตะกร้าว่าง', () => {
    // Arrange
    mockStore({ cart: [] })
    mockGetCartSummary.mockReturnValue(defaultSummary)

    // Act
    renderCart()

    // Assert
    expect(screen.getByText('ยังไม่มีสินค้าในตะกร้า')).toBeTruthy()
  })

  it('ปุ่ม "ดำเนินการชำระเงิน" disabled เมื่อตะกร้าว่าง', () => {
    // Arrange
    mockStore({ cart: [] })

    // Act
    renderCart()

    // Assert
    // Text → Text → View(host Pressable) — accessibilityState.disabled อยู่ที่ depth 2
    const button = screen.getByText('ดำเนินการชำระเงิน')
    const hostPressable = button.parent?.parent
    expect(hostPressable?.props.accessibilityState?.disabled).toBe(true)
  })

  it('แสดงชื่อสินค้าและราคาเมื่อมีสินค้าในตะกร้า', () => {
    // Arrange
    mockStore({
      cart: [{ productId: 'p1', quantity: 2 }],
      products: [sampleProduct],
    })
    mockGetCartSummary.mockReturnValue({
      ...defaultSummary,
      subtotal: 980,
      total: 1030,
    })

    // Act
    renderCart()

    // Assert
    expect(screen.getByText('Velvet Hair Oil')).toBeTruthy()
    expect(screen.getByText('฿490')).toBeTruthy()
  })

  it('แสดง quantity ของสินค้าในตะกร้า', () => {
    // Arrange
    mockStore({
      cart: [{ productId: 'p1', quantity: 3 }],
      products: [sampleProduct],
    })
    mockGetCartSummary.mockReturnValue({
      ...defaultSummary,
      subtotal: 1470,
      total: 1470,
    })

    // Act
    renderCart()

    // Assert
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('กดปุ่ม + เพิ่ม quantity → เรียก updateQuantity(productId, quantity+1)', () => {
    // Arrange
    const updateQuantity = jest.fn()
    mockStore({
      cart: [{ productId: 'p1', quantity: 2 }],
      products: [sampleProduct],
      updateQuantity,
    })
    mockGetCartSummary.mockReturnValue({
      ...defaultSummary,
      subtotal: 980,
      total: 1030,
    })

    // Act
    renderCart()
    fireEvent.press(screen.getByText('+'))

    // Assert
    expect(updateQuantity).toHaveBeenCalledWith('p1', 3)
  })

  it('กดปุ่ม - ลด quantity → เรียก updateQuantity(productId, quantity-1)', () => {
    // Arrange
    const updateQuantity = jest.fn()
    mockStore({
      cart: [{ productId: 'p1', quantity: 2 }],
      products: [sampleProduct],
      updateQuantity,
    })
    mockGetCartSummary.mockReturnValue({
      ...defaultSummary,
      subtotal: 980,
      total: 1030,
    })

    // Act
    renderCart()
    fireEvent.press(screen.getByText('-'))

    // Assert
    expect(updateQuantity).toHaveBeenCalledWith('p1', 1)
  })

  it('แสดง summary card พร้อมยอดสินค้า ค่าจัดส่ง และยอดรวม', () => {
    // Arrange
    mockStore({
      cart: [{ productId: 'p1', quantity: 1 }],
      products: [sampleProduct],
    })
    mockGetCartSummary.mockReturnValue({
      ...defaultSummary,
      subtotal: 490,
      shippingFee: 50,
      total: 540,
    })

    // Act
    renderCart()

    // Assert — ฿490 ปรากฏทั้งใน itemPrice และ summaryCard subtotal จึงใช้ getAllByText
    expect(screen.getAllByText('฿490').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('฿50')).toBeTruthy()
    expect(screen.getByText('฿540')).toBeTruthy()
  })

  it('แสดงค่าจัดส่ง "ฟรี" เมื่อ subtotal ถึง threshold', () => {
    // Arrange
    mockStore({
      cart: [{ productId: 'p1', quantity: 3 }],
      products: [sampleProduct],
    })
    mockGetCartSummary.mockReturnValue({
      ...defaultSummary,
      subtotal: 1200,
      shippingFee: 0,
      total: 1200,
    })

    // Act
    renderCart()

    // Assert
    expect(screen.getByText('ฟรี')).toBeTruthy()
  })

  it('กด "ดำเนินการชำระเงิน" เมื่อ authenticated → navigate ไป Checkout', () => {
    // Arrange
    mockStore({
      cart: [{ productId: 'p1', quantity: 1 }],
      products: [sampleProduct],
      isAuthenticated: true,
    })
    mockGetCartSummary.mockReturnValue({
      ...defaultSummary,
      subtotal: 490,
      total: 540,
    })

    // Act
    renderCart()
    fireEvent.press(screen.getByText('ดำเนินการชำระเงิน'))

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('Checkout')
  })

  it('กด "ดำเนินการชำระเงิน" เมื่อไม่ได้ login → dispatch navigate ไป Profile', () => {
    // Arrange
    mockStore({
      cart: [{ productId: 'p1', quantity: 1 }],
      products: [sampleProduct],
      isAuthenticated: false,
    })
    mockGetCartSummary.mockReturnValue({
      ...defaultSummary,
      subtotal: 490,
      total: 540,
    })

    // Act
    renderCart()
    fireEvent.press(screen.getByText('ดำเนินการชำระเงิน'))

    // Assert
    expect(mockDispatch).toHaveBeenCalledTimes(1)
    const dispatchArg = mockDispatch.mock.calls[0][0]
    expect(dispatchArg).toMatchObject({ payload: { name: 'Profile' } })
  })
})
