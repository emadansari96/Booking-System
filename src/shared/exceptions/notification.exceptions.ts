import { HttpException, HttpStatus } from '@nestjs/common';
export class NotificationNotFoundException extends HttpException {
  constructor(notificationId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Notification not found',
        error: 'NOTIFICATION_NOT_FOUND',
        details: { notificationId }
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class NotificationAlreadySentException extends HttpException {
  constructor(notificationId: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Notification has already been sent',
        error: 'NOTIFICATION_ALREADY_SENT',
        details: { notificationId }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class NotificationDeliveryFailedException extends HttpException {
  constructor(notificationId: string, reason: string) {
    super(
      {
        statusCode: HttpStatus.FAILED_DEPENDENCY,
        message: 'Notification delivery failed',
        error: 'NOTIFICATION_DELIVERY_FAILED',
        details: { notificationId, reason }
      },
      HttpStatus.FAILED_DEPENDENCY
    );
  }
}

export class InvalidNotificationTypeException extends HttpException {
  constructor(type: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid notification type',
        error: 'INVALID_NOTIFICATION_TYPE',
        details: { 
          type,
          validTypes: ['EMAIL', 'SMS', 'PUSH', 'IN_APP']
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class NotificationTemplateNotFoundException extends HttpException {
  constructor(templateId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Notification template not found',
        error: 'NOTIFICATION_TEMPLATE_NOT_FOUND',
        details: { templateId }
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class OTPNotFoundException extends HttpException {
  constructor(otpId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'OTP not found',
        error: 'OTP_NOT_FOUND',
        details: { otpId }
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class OTPExpiredException extends HttpException {
  constructor(otpId: string) {
    super(
      {
        statusCode: HttpStatus.GONE,
        message: 'OTP has expired',
        error: 'OTP_EXPIRED',
        details: { otpId }
      },
      HttpStatus.GONE
    );
  }
}

export class OTPAlreadyUsedException extends HttpException {
  constructor(otpId: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'OTP has already been used',
        error: 'OTP_ALREADY_USED',
        details: { otpId }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidOTPException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid OTP code',
        error: 'INVALID_OTP',
        details: {}
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class NotificationRateLimitExceededException extends HttpException {
  constructor(userId: string, limit: number) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Notification rate limit exceeded',
        error: 'NOTIFICATION_RATE_LIMIT_EXCEEDED',
        details: { userId, limit }
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
}

