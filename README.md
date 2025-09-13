# 🏨 Booking System

سیستم رزرواسیون پیشرفته با استفاده از NestJS، CQRS، Domain-Driven Design و Prisma

## 📁 ساختار پروژه

```
booking-system/
├── prisma/                     # Prisma ORM Configuration
│   ├── migrations/             # Database migrations
│   ├── seeds/                  # Database seeders
│   └── schema.prisma          # Database schema
├── src/
│   ├── app.module.ts          # Root module
│   ├── main.ts                # Application entry point
│   ├── domains/               # Domain layer (DDD)
│   │   ├── auth/              # Authentication domain
│   │   │   ├── controllers/   # Auth controllers
│   │   │   ├── services/      # Auth services
│   │   │   └── dtos/          # Data transfer objects
│   │   ├── user-management/   # User management domain
│   │   │   ├── entities/      # Domain entities
│   │   │   ├── commands/      # CQRS commands
│   │   │   ├── queries/       # CQRS queries
│   │   │   ├── events/        # Domain events
│   │   │   ├── services/      # Domain services
│   │   │   ├── controllers/   # User controllers
│   │   │   └── dtos/          # Data transfer objects
│   │   ├── resource-management/ # Resource management domain
│   │   │   ├── entities/      # Resource & ResourceItem entities
│   │   │   ├── commands/      # CQRS commands
│   │   │   ├── queries/       # CQRS queries
│   │   │   ├── controllers/   # Resource controllers
│   │   │   └── services/      # Domain services
│   │   ├── booking/           # Booking domain
│   │   │   ├── entities/      # Booking entities
│   │   │   ├── services/      # Booking services
│   │   │   ├── controllers/   # Booking controllers
│   │   │   └── value-objects/ # Value objects
│   │   ├── payment/           # Payment & Invoice domain
│   │   │   ├── entities/      # Payment & Invoice entities
│   │   │   ├── services/      # Payment services
│   │   │   ├── controllers/   # Payment controllers
│   │   │   └── value-objects/ # Value objects
│   │   ├── pricing/           # Commission & Pricing domain
│   │   │   ├── entities/      # Commission entities
│   │   │   ├── services/      # Pricing services
│   │   │   └── controllers/   # Commission controllers
│   │   ├── notification/      # Notification domain
│   │   │   ├── entities/      # Notification entities
│   │   │   ├── services/      # Notification services
│   │   │   └── controllers/   # Notification controllers
│   │   └── expiry/            # Expiry management
│   │       └── services/      # Expiry cron jobs
│   └── shared/                # Shared infrastructure
│       ├── domain/            # Shared domain logic
│       │   ├── base/          # Base classes
│       │   └── interfaces/    # Domain interfaces
│       ├── infrastructure/    # Infrastructure layer
│       │   ├── database/      # Database repositories
│       │   │   └── repositories/ # Prisma repositories
│       │   ├── mongodb/       # MongoDB for audit logs
│       │   ├── redis/         # Redis for caching & locks
│       │   └── security/      # Security services
│       ├── exceptions/        # Custom exceptions
│       ├── filters/           # Global exception filters
│       └── pipes/             # Custom validation pipes
├── docker-compose.yml         # Docker services
├── package.json               # Dependencies
└── Booking-System-API.postman_collection.json # API documentation
```

## 🏗️ معماری

### Domain-Driven Design (DDD)
- **Entities**: Business objects with identity
- **Value Objects**: Immutable objects
- **Aggregate Roots**: Entity clusters
- **Domain Services**: Business logic services
- **Repositories**: Data access interfaces

### CQRS (Command Query Responsibility Segregation)
- **Commands**: State-changing operations
- **Queries**: Data retrieval operations
- **Handlers**: Command/Query processing
- **Events**: Domain events for side effects

### Infrastructure
- **Prisma**: Primary ORM for PostgreSQL
- **MongoDB**: Audit logs storage
- **Redis**: Caching and distributed locking
- **PostgreSQL**: Main database with GIST indexes

## 🚀 راه‌اندازی

### پیش‌نیازها
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (through Docker)
- Redis (through Docker)
- MongoDB (through Docker)

### مراحل نصب

1. **Clone پروژه:**
```bash
git clone <repository-url>
cd booking-system
```

2. **نصب dependencies:**
```bash
npm install
```

3. **راه‌اندازی Docker services:**
```bash
npm run docker:up
```

4. **تنظیم متغیرهای محیطی:**
```bash
cp .env.example .env
# Edit .env file with your configurations
```

5. **ریست دیتابیس و اجرای migrations:**
```bash
# Reset database (destructive!)
npx prisma migrate reset --force

# Apply migrations
npx prisma migrate deploy
```

6. **Seed دیتابیس:**
```bash
npm run seed
```

7. **Build و اجرای پروژه:**
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## 📊 دیتابیس

### PostgreSQL Schema
- **Users**: اطلاعات کاربران با password hash
- **Resources**: منابع قابل رزرو (هتل، سالن، ...)
- **ResourceItems**: آیتم‌های خاص هر منبع (اتاق، میز، ...)
- **Bookings**: رزروهای انجام شده
- **Invoices**: فاکتورهای مالی
- **Payments**: پرداخت‌ها
- **CommissionStrategies**: استراتژی‌های کمیسیون
- **Notifications**: اعلانات سیستم

### ویژگی‌های خاص
- **GIST Index**: جلوگیری از overlap در بوکینگ‌ها
- **Exclusion Constraint**: فقط روی PENDING و CONFIRMED bookings
- **Expiry Logic**: انقضای خودکار invoices و bookings

### Migration مهم

#### GIST Index Migration
این migration برای جلوگیری از overlap در bookings ضروری است:

```bash
# اجرای migration
npx prisma migrate dev

# یا برای production
npx prisma migrate deploy

# بررسی وضعیت migrations
npx prisma migrate status
```

#### ایجاد GIST Migration جدید
اگر نیاز به ایجاد migration جدید برای GIST index دارید:

```bash
# 1. ایجاد migration خالی
npx prisma migrate dev --name add_gist_index_for_booking_overlap --create-only

# 2. ویرایش migration file
# فایل: prisma/migrations/[timestamp]_add_gist_index_for_booking_overlap/migration.sql
# محتوا:
```

```sql
-- Enable btree_gist extension for GIST indexes
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Drop existing constraint if exists
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "booking_no_overlap";

-- Create GIST exclusion constraint to prevent overlapping bookings
-- Only applies to PENDING and CONFIRMED bookings (excludes EXPIRED ones)
ALTER TABLE "bookings" ADD CONSTRAINT "booking_no_overlap_active" EXCLUDE USING GIST (
  "resourceItemId" WITH =,
  tsrange("startDate", "endDate", '[)') WITH &&
) WHERE ("status" IN ('PENDING', 'CONFIRMED'));
```

```bash
# 3. اجرای migration
npx prisma migrate dev
```

## 🔐 احراز هویت

### User Credentials (Seeded)
- **Email**: `admin@booking.com`
- **Password**: `booking_password`
- **Role**: `ADMIN`

### JWT Authentication
- **Endpoint**: `POST /auth/login`
- **Token Expiry**: 7 days (configurable)
- **Protected Routes**: تمام endpoints غیر از auth

## 📡 API Documentation

### Postman Collection
- Import `Booking-System-API.postman_collection.json`
- Set `baseUrl` variable to `http://localhost:3000`
- Use `/auth/login` to get token
- Set `authToken` variable for protected endpoints

### Main Endpoints
- **Auth**: `/auth/login`, `/auth/register`
- **Users**: `/users-cqrs/profile`
- **Resources**: `/resources`, `/resource-items`
- **Bookings**: `/bookings`
- **Invoices**: `/invoices`
- **Payments**: `/payments`
- **Pricing**: `/commission-strategies`

## 🔄 Workflow

### Booking Process
1. **Create Booking**: ایجاد بوکینگ (status: PENDING)
2. **Auto Invoice**: ایجاد خودکار invoice
3. **Payment**: پرداخت invoice
4. **Complete**: تکمیل بوکینگ (status: CONFIRMED)
5. **Expiry**: انقضای خودکار پس از 5 دقیقه

### Expiry Management
- **Cron Jobs**: هر دقیقه چک می‌شود
- **Invoice Expiry**: 5 دقیقه بعد از ایجاد
- **Booking Expiry**: 5 دقیقه بعد از ایجاد
- **Status Change**: PENDING → EXPIRED

## 🛠️ Scripts

```bash
# Development
npm run start:dev          # Development mode with watch
npm run build             # Build for production
npm run start:prod        # Production mode

# Database
npm run seed              # Seed database with sample data
npx prisma studio         # Database GUI
npx prisma migrate dev    # Create new migration

# Docker
npm run docker:up         # Start all services
npm run docker:down       # Stop all services
npm run docker:clean      # Clean volumes and containers

# Testing
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
```

## ⚠️ نکات مهم

1. **GIST Index**: حتماً migration مربوط به GIST index اجرا شود
   - از دستور `npx prisma migrate dev` استفاده کنید
   - Migration موجود: `20250913215848_add_gist_index_for_booking_overlap`
2. **Password Security**: تمام passwords با bcrypt hash می‌شوند
3. **Expiry Logic**: بوکینگ‌ها و فاکتورها خودکار منقضی می‌شوند
4. **Error Handling**: Exception filters سراسری پیاده‌سازی شده
5. **Audit Logs**: تمام عملیات در MongoDB ثبت می‌شود
6. **Migration Management**: 
   - برای ایجاد migration جدید از `--create-only` استفاده کنید
   - سپس migration file را ویرایش کنید
   - در نهایت با `npx prisma migrate dev` اجرا کنید

## 🐳 Docker Services

- **PostgreSQL**: Port 5432
- **Redis**: Port 6379  
- **MongoDB**: Port 27017
- **Application**: Port 3000

تمام services از طریق `docker-compose.yml` مدیریت می‌شوند.
