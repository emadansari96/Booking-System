# Audit Log System

سیستم Audit Log برای ثبت و گزارش‌گیری از تمام فعالیت‌های سیستم با استفاده از MongoDB.

## ویژگی‌ها

### 📊 ثبت فعالیت‌ها
- **User Actions** - ورود، خروج، تغییرات پروفایل
- **Entity Operations** - ایجاد، ویرایش، حذف entities
- **Business Operations** - پرداخت، رزرو، نوتیفیکیشن
- **System Events** - خطاها، تغییرات سیستم

### 🔍 گزارش‌گیری پیشرفته
- **جستجو بر اساس فیلترهای مختلف**
- **آمار و نمودارها**
- **گزارش‌های زمانی**
- **تحلیل رفتار کاربران**

### 🏗️ Architecture
- **DDD + CQRS** - Domain-Driven Design
- **MongoDB** - برای ذخیره‌سازی لاگ‌ها
- **Indexes** - برای query های سریع
- **Decorators** - برای automatic logging

## استفاده

### 1. Manual Logging

```typescript
import { AuditLogService } from './audit-log.service';

// Log user login
await auditLogService.logUserLogin(
  userId,
  ipAddress,
  userAgent
);

// Log entity creation
await auditLogService.logEntityCreation(
  userId,
  AuditDomain.BOOKING,
  'Booking',
  bookingId,
  newValues,
  ipAddress,
  userAgent
);
```

### 2. Automatic Logging با Decorator

```typescript
import { AuditLog } from '../../../shared/infrastructure/decorators/audit-log.decorator';

@AuditLog({
  action: AuditAction.CREATE,
  domain: AuditDomain.BOOKING,
  entityType: 'Booking',
  severity: AuditSeverity.MEDIUM,
  description: 'Create new booking'
})
@Post()
async createBooking(@Body() dto: CreateBookingDto) {
  // Controller method
}
```

### 3. API Endpoints

```bash
# Log activity
POST /audit-logs
{
  "userId": "user-123",
  "action": "CREATE",
  "domain": "BOOKING",
  "entityType": "Booking",
  "status": "SUCCESS",
  "severity": "MEDIUM",
  "description": "Booking created"
}

# Search logs
GET /audit-logs?domain=BOOKING&action=CREATE&page=1&limit=50

# Get statistics
GET /audit-logs/statistics/overview?startDate=2024-01-01&endDate=2024-12-31
```

## MongoDB Schema

```javascript
{
  id: String,           // UUID
  userId: String,       // User ID (optional)
  sessionId: String,    // Session ID (optional)
  action: String,       // CREATE, UPDATE, DELETE, etc.
  domain: String,       // BOOKING, PAYMENT, etc.
  entityType: String,   // Booking, Payment, etc.
  entityId: String,     // Entity ID (optional)
  status: String,       // SUCCESS, FAILED, etc.
  severity: String,     // LOW, MEDIUM, HIGH, CRITICAL
  description: String,  // Human readable description
  oldValues: Object,    // Previous values (optional)
  newValues: Object,    // New values (optional)
  metadata: Object,     // Additional data (optional)
  ipAddress: String,    // Client IP (optional)
  userAgent: String,    // Client User Agent (optional)
  timestamp: Date       // When the action occurred
}
```

## Indexes

```javascript
// Single field indexes
{ userId: 1, timestamp: -1 }
{ sessionId: 1, timestamp: -1 }
{ action: 1, timestamp: -1 }
{ domain: 1, timestamp: -1 }
{ entityType: 1, entityId: 1, timestamp: -1 }
{ status: 1, timestamp: -1 }
{ severity: 1, timestamp: -1 }
{ timestamp: -1 }
{ ipAddress: 1, timestamp: -1 }

// Compound indexes
{ domain: 1, action: 1, timestamp: -1 }
{ userId: 1, domain: 1, timestamp: -1 }
{ status: 1, severity: 1, timestamp: -1 }
```

## Configuration

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/booking-system-audit
```

## Security

- **IP Tracking** - ثبت IP address کاربران
- **User Agent** - ثبت browser/device اطلاعات
- **Session Tracking** - پیگیری فعالیت‌های session
- **Data Retention** - امکان حذف لاگ‌های قدیمی

## Performance

- **Indexes** - query های سریع
- **Pagination** - برای datasets بزرگ
- **Aggregation** - برای آمار و گزارش‌ها
- **Background Cleanup** - حذف خودکار لاگ‌های قدیمی
