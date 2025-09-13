-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'MANAGER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."ResourceStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'MAINTENANCE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "public"."ResourceType" AS ENUM ('ROOM', 'HALL', 'EQUIPMENT', 'SERVICE', 'VENUE', 'HOTEL', 'RESTAURANT', 'CONFERENCE_HALL');

-- CreateEnum
CREATE TYPE "public"."ResourceItemStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'MAINTENANCE', 'UNAVAILABLE', 'OUT_OF_ORDER');

-- CreateEnum
CREATE TYPE "public"."ResourceItemType" AS ENUM ('ROOM', 'HALL', 'EQUIPMENT', 'SERVICE', 'VENUE', 'TABLE', 'SEAT', 'PARKING_SPOT', 'LOCKER');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'EXPIRED', 'PAYMENT_PENDING', 'PAYMENT_FAILED');

-- CreateEnum
CREATE TYPE "public"."CommissionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'NEED_TO_PAY', 'APPROVED', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('USD', 'EUR', 'GBP', 'IRR', 'AED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('PAYMENT_CONFIRMATION', 'BOOKING_CONFIRMATION', 'BOOKING_CANCELLATION', 'PAYMENT_FAILED', 'RESOURCE_AVAILABLE', 'REMINDER', 'SYSTEM_UPDATE', 'PROMOTION', 'SECURITY_ALERT', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."OtpType" AS ENUM ('REGISTRATION', 'LOGIN', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "public"."OtpStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'USED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatarUrl" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."ResourceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "type" "public"."ResourceType" NOT NULL,
    "location" TEXT,
    "amenities" JSONB,
    "images" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_items" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."ResourceItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "type" "public"."ResourceItemType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "location" TEXT,
    "amenities" JSONB,
    "images" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceItemId" TEXT NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "period" tstzrange,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "commissionAmount" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "paymentDeadline" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "paymentFailedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."commission_strategies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."CommissionType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "applicableResourceTypes" JSONB,
    "minBookingDuration" INTEGER,
    "maxBookingDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "metadata" JSONB,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "resourceItemId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "metadata" JSONB,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "public"."OtpType" NOT NULL,
    "status" "public"."OtpStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "public"."users"("phone");

-- CreateIndex
CREATE INDEX "resources_status_isActive_idx" ON "public"."resources"("status", "isActive");

-- CreateIndex
CREATE INDEX "resources_type_isActive_idx" ON "public"."resources"("type", "isActive");

-- CreateIndex
CREATE INDEX "resources_status_type_isActive_idx" ON "public"."resources"("status", "type", "isActive");

-- CreateIndex
CREATE INDEX "resource_items_resourceId_status_isActive_idx" ON "public"."resource_items"("resourceId", "status", "isActive");

-- CreateIndex
CREATE INDEX "resource_items_resourceId_type_isActive_idx" ON "public"."resource_items"("resourceId", "type", "isActive");

-- CreateIndex
CREATE INDEX "resource_items_status_isActive_idx" ON "public"."resource_items"("status", "isActive");

-- CreateIndex
CREATE INDEX "resource_items_type_isActive_idx" ON "public"."resource_items"("type", "isActive");

-- CreateIndex
CREATE INDEX "bookings_resourceItemId_startDate_endDate_idx" ON "public"."bookings"("resourceItemId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "bookings_userId_status_idx" ON "public"."bookings"("userId", "status");

-- CreateIndex
CREATE INDEX "bookings_status_startDate_idx" ON "public"."bookings"("status", "startDate");

-- CreateIndex
CREATE INDEX "bookings_paymentDeadline_idx" ON "public"."bookings"("paymentDeadline");

-- CreateIndex
CREATE INDEX "bookings_createdAt_idx" ON "public"."bookings"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "commission_strategies_name_key" ON "public"."commission_strategies"("name");

-- CreateIndex
CREATE INDEX "commission_strategies_isActive_priority_idx" ON "public"."commission_strategies"("isActive", "priority");

-- CreateIndex
CREATE INDEX "commission_strategies_type_isActive_idx" ON "public"."commission_strategies"("type", "isActive");

-- CreateIndex
CREATE INDEX "commission_strategies_priority_idx" ON "public"."commission_strategies"("priority");

-- CreateIndex
CREATE INDEX "payments_userId_status_idx" ON "public"."payments"("userId", "status");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "public"."payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_status_method_idx" ON "public"."payments"("status", "method");

-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "public"."payments"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "public"."invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_userId_status_idx" ON "public"."invoices"("userId", "status");

-- CreateIndex
CREATE INDEX "invoices_invoiceNumber_idx" ON "public"."invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_status_dueDate_idx" ON "public"."invoices"("status", "dueDate");

-- CreateIndex
CREATE INDEX "invoices_createdAt_idx" ON "public"."invoices"("createdAt");

-- CreateIndex
CREATE INDEX "invoice_items_invoiceId_idx" ON "public"."invoice_items"("invoiceId");

-- CreateIndex
CREATE INDEX "invoice_items_resourceId_idx" ON "public"."invoice_items"("resourceId");

-- CreateIndex
CREATE INDEX "invoice_items_resourceItemId_idx" ON "public"."invoice_items"("resourceItemId");

-- CreateIndex
CREATE INDEX "notifications_userId_status_idx" ON "public"."notifications"("userId", "status");

-- CreateIndex
CREATE INDEX "notifications_type_status_idx" ON "public"."notifications"("type", "status");

-- CreateIndex
CREATE INDEX "notifications_status_priority_idx" ON "public"."notifications"("status", "priority");

-- CreateIndex
CREATE INDEX "notifications_scheduledAt_idx" ON "public"."notifications"("scheduledAt");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "public"."notifications"("createdAt");

-- CreateIndex
CREATE INDEX "otps_userId_type_status_idx" ON "public"."otps"("userId", "type", "status");

-- CreateIndex
CREATE INDEX "otps_email_type_status_idx" ON "public"."otps"("email", "type", "status");

-- CreateIndex
CREATE INDEX "otps_status_expiresAt_idx" ON "public"."otps"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "otps_createdAt_idx" ON "public"."otps"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."resource_items" ADD CONSTRAINT "resource_items_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_resourceItemId_fkey" FOREIGN KEY ("resourceItemId") REFERENCES "public"."resource_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."otps" ADD CONSTRAINT "otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
