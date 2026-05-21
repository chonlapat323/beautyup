# BeautyUp — Maestro E2E Tests

App ID: `com.beautyup.app`

## ติดตั้ง Maestro (ครั้งแรก)

Windows (PowerShell as Admin):
```
iwr get.maestro.mobile.dev -useb | iex
```

macOS/Linux:
```
curl -Ls "https://get.maestro.mobile.dev" | bash
```

## รัน tests

```bash
# รัน flow เดียว
maestro test .maestro/flows/01-launch.yaml

# รัน ทุก flow
maestro test .maestro/flows/

# รันพร้อม report
maestro test .maestro/flows/ --format junit --output report.xml
```

## ต้องการ

- Android emulator หรือ iOS simulator เปิดอยู่
- App ติดตั้งแล้วบน device/emulator
- สำหรับ Expo: รัน `expo run:android` หรือ `expo run:ios` ก่อน (ไม่ใช่ Expo Go)

## Flows

| Flow | ทดสอบอะไร |
|------|----------|
| 01-launch | App เปิดได้, แสดง landing screen |
| 02-login | Login flow ครบ (กรอก email+password, กด เข้าสู่ระบบ, assert บัญชีของฉัน) |
| 03-browse-and-cart | หน้าหลัก → ดูทั้งหมด → categories → product → เพิ่มลงตะกร้า |
| 04-cart-view | ดู cart, assert สรุปรายการ, ปุ่ม ดำเนินการชำระเงิน |
| 05-profile | Profile screen, ออเดอร์/แต้ม stats, logout → กลับ guest screen |

## Test credentials

- Email: `test@beautyup.com`
- Password: `Test1234!`

เปลี่ยน credentials ได้ในไฟล์ `flows/02-login.yaml`

## หมายเหตุ

- Flow 03–05 ใช้ `runFlow: 02-login.yaml` เพื่อ login ก่อนเสมอ
- Flow 04 ใช้ `runFlow: 03-browse-and-cart.yaml` เพื่อให้มีสินค้าในตะกร้า
- Assertions ที่ใช้ `optional: true` หมายความว่า text นั้นอาจไม่แสดงทุก state (เช่น ขึ้นกับข้อมูล mock/server)
- หลัง `เพิ่มลงตะกร้า` app จะ navigate ไป CartScreen อัตโนมัติ (ดู `handleAddToCart` ใน ProductDetailScreen)
