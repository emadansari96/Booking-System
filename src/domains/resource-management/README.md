# Resource Management Domain

این دامنه مسئول مدیریت منابع (Resources) در سیستم رزرواسیون است.

## 🏗️ Architecture

### Domain Structure
```
resource-management/
├── entities/           # Domain entities
├── value-objects/      # Value objects
├── commands/           # CQRS commands
├── queries/            # CQRS queries
├── events/             # Domain events
├── controllers/        # REST API controllers
├── services/           # Domain services
├── dtos/              # Data Transfer Objects
├── interfaces/        # Repository interfaces
├── cqrs/              # CQRS buses and modules
└── repositories/      # Repository implementations
```

## 📋 Features

### Resource Management
- **Create Resource**: ایجاد منابع جدید
- **Update Resource**: به‌روزرسانی اطلاعات منابع
- **Delete Resource**: حذف منابع
- **Change Status**: تغییر وضعیت منابع
- **Search Resources**: جستجوی منابع
- **Get Available Resources**: دریافت منابع در دسترس
- **Check Availability**: بررسی دسترسی منابع

### Resource Types
- **ROOM**: اتاق
- **HALL**: سالن
- **EQUIPMENT**: تجهیزات
- **SERVICE**: خدمات
- **VENUE**: مکان

### Resource Status
- **AVAILABLE**: در دسترس
- **BOOKED**: رزرو شده
- **MAINTENANCE**: در تعمیر
- **UNAVAILABLE**: غیرقابل دسترس

## 🔧 API Endpoints

### Resources
- `POST /resources` - ایجاد منبع جدید
- `GET /resources/:id` - دریافت منبع با ID
- `PUT /resources/:id` - به‌روزرسانی منبع
- `DELETE /resources/:id` - حذف منبع
- `PUT /resources/:id/status` - تغییر وضعیت منبع
- `GET /resources` - جستجوی منابع
- `GET /resources/available` - دریافت منابع در دسترس
- `GET /resources/:id/availability` - بررسی دسترسی منبع

## 📊 Value Objects

### ResourceName
- نام منبع (1-100 کاراکتر)

### ResourceDescription
- توضیحات منبع (1-500 کاراکتر)

### ResourceCapacity
- ظرفیت منبع (1-1000 نفر)

### ResourcePrice
- قیمت منبع (0-1,000,000)
- واحد پول (3 کاراکتر)

### ResourceStatus
- وضعیت منبع (AVAILABLE, BOOKED, MAINTENANCE, UNAVAILABLE)

### ResourceType
- نوع منبع (ROOM, HALL, EQUIPMENT, SERVICE, VENUE)

## 🎯 CQRS Implementation

### Commands
- `CreateResourceCommand` - ایجاد منبع
- `UpdateResourceCommand` - به‌روزرسانی منبع
- `DeleteResourceCommand` - حذف منبع
- `ChangeResourceStatusCommand` - تغییر وضعیت

### Queries
- `GetResourceByIdQuery` - دریافت منبع با ID
- `SearchResourcesQuery` - جستجوی منابع
- `GetAvailableResourcesQuery` - دریافت منابع در دسترس
- `GetResourceAvailabilityQuery` - بررسی دسترسی

### Events
- `ResourceCreatedEvent` - منبع ایجاد شد
- `ResourceUpdatedEvent` - منبع به‌روزرسانی شد
- `ResourceDeletedEvent` - منبع حذف شد

## 🗄️ Database

### Resource Entity
```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('AVAILABLE', 'BOOKED', 'MAINTENANCE', 'UNAVAILABLE') DEFAULT 'AVAILABLE',
  type ENUM('ROOM', 'HALL', 'EQUIPMENT', 'SERVICE', 'VENUE') NOT NULL,
  location VARCHAR(200),
  amenities JSON,
  images JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Indexes
- `name` (unique)
- `type`
- `status`
- `location`
- `created_at`

## 🔍 Search & Filtering

### Search Criteria
- نام منبع
- نوع منبع
- وضعیت منبع
- ظرفیت (حداقل/حداکثر)
- قیمت (حداقل/حداکثر)
- مکان
- امکانات

### Sorting
- نام
- قیمت
- ظرفیت
- تاریخ ایجاد

## 🚀 Usage

### Creating a Resource
```typescript
const createResourceDto = {
  name: 'Conference Room A',
  description: 'Large conference room with projector',
  capacity: 20,
  price: 100,
  currency: 'USD',
  type: 'ROOM',
  location: 'Building A, Floor 2',
  amenities: ['projector', 'whiteboard', 'wifi']
};

const resource = await resourceCommandBus.createResource(createResourceDto);
```

### Searching Resources
```typescript
const searchQuery = {
  type: 'ROOM',
  minCapacity: 10,
  maxPrice: 200,
  location: 'Building A',
  page: 1,
  limit: 10
};

const results = await resourceQueryBus.searchResources(searchQuery);
```

## 🧪 Testing

### Unit Tests
- Entity tests
- Value object tests
- Command handler tests
- Query handler tests
- Service tests

### Integration Tests
- Controller tests
- Repository tests
- CQRS flow tests

## 📝 Notes

- تمام منابع باید نام منحصر به فرد داشته باشند
- تغییر وضعیت منابع باید طبق قوانین تجاری انجام شود
- حذف منابع رزرو شده امکان‌پذیر نیست
- قیمت‌ها به 2 رقم اعشار محدود می‌شوند
- ظرفیت منابع بین 1 تا 1000 نفر است
