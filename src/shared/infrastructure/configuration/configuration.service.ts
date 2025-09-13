// src/shared/infrastructure/configuration/configuration.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AppConfigurationService {
  constructor(private readonly configService: ConfigService) {}

  get<T>(key: string, defaultValue?: T): T {
    return this.configService.get<T>(key, defaultValue);
  }

  set<T>(key: string, value: T): void {
    // برای runtime configuration
    process.env[key] = String(value);
  }

  has(key: string): boolean {
    return this.configService.get(key) !== undefined;
  }

  // Payment configurations
  getPaymentConfig() {
    return {
      stripeEnabled: this.get<boolean>('PAYMENT_STRIPE_ENABLED', false),
      eTransferEnabled: this.get<boolean>('PAYMENT_ETRANSFER_ENABLED', true),
      eTransferRequiresApproval: this.get<boolean>('PAYMENT_ETRANSFER_REQUIRES_APPROVAL', true),
    };
  }

  // Email configurations
  getEmailConfig() {
    return {
      enabled: this.get<boolean>('EMAIL_ENABLED', true),
      provider: this.get<string>('EMAIL_PROVIDER', 'sendgrid'),
      fromEmail: this.get<string>('EMAIL_FROM', 'noreply@bookingsystem.com'),
    };
  }

  // Booking configurations
  getBookingConfig() {
    return {
      mode: this.get<string>('BOOKING_MODE', 'hotel'), // 'hotel' | 'ticket'
      autoExpireMinutes: this.get<number>('BOOKING_AUTO_EXPIRE_MINUTES', 15),
      maxBookingDays: this.get<number>('BOOKING_MAX_DAYS', 365),
    };
  }
}