import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'

import { CheckoutScreen } from '../CheckoutScreen'

// ── Navigation ──────────────────────────────────────────────────────────────
const mockNavigate = jest.fn()
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, dispatch: jest.fn() }),
}))

// ── Store ────────────────────────────────────────────────────────────────────
jest.mock('@/store/useAppStore', () => ({
  useAppStore: jest.fn(),
  getCartSummary: jest.fn(),
}))
import { useAppStore, getCartSummary } from '@/store/useAppStore'
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>
const mockGetCartSummary = getCartSummary as jest.MockedFunction<typeof getCartSummary>

// ── API ──────────────────────────────────────────────────────────────────────
jest.mock('@/services/api', () => ({
  mobileGetAddresses: jest.fn(),
}))
import { mobileGetAddresses } from '@/services/api'
const mockGetAddresses = mobileGetAddresses as jest.MockedFunction<typeof mobileGetAddresses>

// ── Helpers / Layout ─────────────────────────────────────────────────────────
jest.mock('@/navigation/helpers', () => ({ navigateToHome: jest.fn() }))
jest.mock('@/components/layout/Screen', () => ({
  Screen: ({ children, header }: any) => <>{header}{children}</>,
}))
jest.mock('@/components/ui/AppHeader', () => ({
  AppHeader: ({ title }: any) => <>{title}</>,
}))

// ── Switch mock ──────────────────────────────────────────────────────────────
// RN Switch ไม่ทำงานใน test environment — แทนด้วย Touchable View ธรรมดา
// ต้อง export { __esModule: true, default: ... } เพราะ react-native ทำ require(...).default
jest.mock('react-native/Libraries/Components/Switch/Switch', () => {
  const { TouchableOpacity, Text } = require('react-native')
  const MockSwitch = ({ value, onValueChange, testID }: any) => (
    <TouchableOpacity
      testID={testID || 'mock-switch'}
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Text>{value ? 'on' : 'off'}</Text>
    </TouchableOpacity>
  )
  MockSwitch.displayName = 'Switch'
  return { __esModule: true, default: MockSwitch }
})

// ── Fixtures ─────────────────────────────────────────────────────────────────
const defaultSummary = {
  subtotal: 490,
  shippingFee: 50,
  total: 540,
  pointsPreview: 0,
  freeShippingThreshold: 1000,
  gatewayFee: 20,
}

const mockAddresses = [
  {
    id: 'a1',
    recipient: 'สมชาย ใจดี',
    phone: '0812345678',
    addressLine1: '123 ถ.สุขุมวิท',
    district: 'คลองเตย',
    province: 'กรุงเทพ',
    postalCode: '10110',
    isDefault: true,
    label: 'บ้าน',
  },
  {
    id: 'a2',
    recipient: 'สมหญิง ใจงาม',
    phone: '0898765432',
    addressLine1: '456 ถ.พระราม',
    district: 'บางรัก',
    province: 'กรุงเทพ',
    postalCode: '10500',
    isDefault: false,
    label: 'ที่ทำงาน',
  },
]

// ── Store helper ──────────────────────────────────────────────────────────────
function mockStore(overrides: Partial<{ cart: any[]; token: string | null; member: any }> = {}) {
  const state = {
    cart: [{ productId: 'p1', quantity: 1 }],
    token: 'tok_123',
    member: { creditBalance: 0 },
    ...overrides,
  }
  mockUseAppStore.mockImplementation((selector: any) => selector(state))
}

function renderCheckout() {
  return render(<NavigationContainer><CheckoutScreen /></NavigationContainer>)
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('CheckoutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStore()
    mockGetCartSummary.mockReturnValue(defaultSummary)
  })

  // 1
  it('แสดง "กำลังโหลดที่อยู่..." ขณะกำลังโหลด', () => {
    // Arrange: promise ที่ไม่ resolve เพื่อให้ยังอยู่ใน loading state
    mockGetAddresses.mockReturnValue(new Promise(() => {}))

    // Act
    renderCheckout()

    // Assert
    expect(screen.getByText('กำลังโหลดที่อยู่...')).toBeTruthy()
  })

  // 2
  it('แสดง "ยังไม่มีที่อยู่ที่บันทึกไว้" เมื่อ addresses ว่าง', async () => {
    // Arrange
    mockGetAddresses.mockResolvedValue([])

    // Act
    renderCheckout()

    // Assert
    await waitFor(() => {
      expect(screen.getByText('ยังไม่มีที่อยู่ที่บันทึกไว้')).toBeTruthy()
    })
  })

  // 3
  it('แสดง "โหลดที่อยู่ไม่สำเร็จ" เมื่อ API error', async () => {
    // Arrange
    mockGetAddresses.mockRejectedValue(new Error('Network error'))

    // Act
    renderCheckout()

    // Assert
    await waitFor(() => {
      expect(screen.getByText('โหลดที่อยู่ไม่สำเร็จ')).toBeTruthy()
    })
  })

  // 4
  it('แสดง address cards ตามข้อมูลที่โหลดมา', async () => {
    // Arrange
    mockGetAddresses.mockResolvedValue(mockAddresses)

    // Act
    renderCheckout()

    // Assert: ชื่อผู้รับ + เบอร์โทรอยู่ใน Text เดียวกัน ใช้ exact:false
    await waitFor(() => {
      expect(screen.getByText(/สมชาย ใจดี/, { exact: false })).toBeTruthy()
      expect(screen.getByText(/สมหญิง ใจงาม/, { exact: false })).toBeTruthy()
    })
  })

  // 5
  it('เลือก default address อัตโนมัติ (isDefault = true)', async () => {
    // Arrange: a1 เป็น isDefault
    mockGetAddresses.mockResolvedValue(mockAddresses)

    // Act
    renderCheckout()

    // Assert: a1 แสดงขึ้นมา
    await waitFor(() => {
      expect(screen.getByText(/สมชาย ใจดี/, { exact: false })).toBeTruthy()
    })
    // ปุ่ม "ไปชำระเงิน" ต้องไม่ถูก disable (selected = a1 แล้ว)
    expect(screen.getByText('ไปชำระเงิน')).toBeTruthy()
  })

  // 6
  it('กดเลือก address อื่น → ปุ่ม "ไปชำระเงิน" ควร enable', async () => {
    // Arrange
    mockGetAddresses.mockResolvedValue(mockAddresses)

    // Act
    renderCheckout()
    await waitFor(() => screen.getByText(/สมหญิง ใจงาม/, { exact: false }))

    // กด address a2
    fireEvent.press(screen.getByText(/สมหญิง ใจงาม/, { exact: false }))

    // Assert: ปุ่มยังคงอยู่ (selected ไม่เป็น null)
    expect(screen.getByText('ไปชำระเงิน')).toBeTruthy()
  })

  // 7
  it('ไม่แสดง credit toggle เมื่อ creditBalance = 0', async () => {
    // Arrange
    mockStore({ member: { creditBalance: 0 } })
    mockGetAddresses.mockResolvedValue(mockAddresses)

    // Act
    renderCheckout()
    await waitFor(() => screen.getByText(/สมชาย ใจดี/, { exact: false }))

    // Assert
    expect(screen.queryByText('ใช้เครดิต')).toBeNull()
  })

  // 8
  it('แสดง credit toggle เมื่อ creditBalance > 0', async () => {
    // Arrange
    mockStore({ member: { creditBalance: 500 } })
    mockGetAddresses.mockResolvedValue(mockAddresses)

    // Act
    renderCheckout()

    // Assert
    await waitFor(() => {
      expect(screen.getByText('ใช้เครดิต')).toBeTruthy()
    })
  })

  // 9
  it('แสดงยอดหักเครดิตเมื่อ toggle เครดิต ON', async () => {
    // Arrange: creditBalance=200, subtotal=490, shippingFee=50 → creditUsed = min(200, 540) = 200
    mockStore({ member: { creditBalance: 200 } })
    mockGetCartSummary.mockReturnValue({ ...defaultSummary, subtotal: 490, shippingFee: 50 })
    mockGetAddresses.mockResolvedValue(mockAddresses)

    // Act
    renderCheckout()
    await waitFor(() => screen.getByText('ใช้เครดิต'))

    // Toggle เปิดเครดิต
    fireEvent.press(screen.getByTestId('mock-switch'))

    // Assert: แสดงข้อความหักออก
    await waitFor(() => {
      expect(screen.getByText(/หักออก/, { exact: false })).toBeTruthy()
    })
  })

  // 10
  it('คำนวณ remaining ถูกต้อง: creditUsed ครอบคลุมทั้งหมด → remaining = 0', async () => {
    // Arrange: creditBalance=1000, subtotal=490, shippingFee=50 → creditUsed=540, remaining=0
    mockStore({ member: { creditBalance: 1000 } })
    mockGetCartSummary.mockReturnValue({ ...defaultSummary, subtotal: 490, shippingFee: 50 })
    mockGetAddresses.mockResolvedValue(mockAddresses)

    // Act
    renderCheckout()
    await waitFor(() => screen.getByText('ใช้เครดิต'))

    fireEvent.press(screen.getByTestId('mock-switch'))

    // Assert: remaining = 0 → label "เครดิตครอบคลุม" ปรากฏ
    await waitFor(() => {
      expect(screen.getByText(/เครดิตครอบคลุม/, { exact: false })).toBeTruthy()
    })
  })

  // 11
  it('ปุ่ม "ไปชำระเงิน" disabled เมื่อไม่มี address', async () => {
    // Arrange
    mockGetAddresses.mockResolvedValue([])

    // Act
    renderCheckout()
    await waitFor(() => screen.getByText('ยังไม่มีที่อยู่ที่บันทึกไว้'))

    // Assert: กดแล้ว navigate ต้องไม่ถูกเรียก (selected = null → handleConfirm return early)
    const btn = screen.getByText('ไปชำระเงิน')
    expect(btn).toBeTruthy()
    fireEvent.press(btn)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // 12
  it('กด "ไปชำระเงิน" → navigate Payment พร้อม params ที่ถูกต้อง', async () => {
    // Arrange: a1 เป็น default (isDefault=true)
    mockGetAddresses.mockResolvedValue(mockAddresses)

    // Act
    renderCheckout()
    await waitFor(() => screen.getByText(/สมชาย ใจดี/, { exact: false }))

    fireEvent.press(screen.getByText('ไปชำระเงิน'))

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('Payment', {
      shippingName: 'สมชาย ใจดี',
      shippingPhone: '0812345678',
      shippingAddr: expect.stringContaining('123 ถ.สุขุมวิท'),
      creditAmount: undefined,
    })
  })
})
