import { HttpException, HttpStatus } from '@nestjs/common';
export class InvalidCredentialsException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS',
        details: {}
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}

export class UserNotActiveException extends HttpException {
  constructor(email: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'User account is not active',
        error: 'USER_NOT_ACTIVE',
        details: { email }
      },
      HttpStatus.FORBIDDEN
    );
  }
}

export class TokenExpiredException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token has expired',
        error: 'TOKEN_EXPIRED',
        details: {}
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}

export class InvalidTokenException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid token',
        error: 'INVALID_TOKEN',
        details: {}
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}

export class RefreshTokenNotFoundException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Refresh token not found',
        error: 'REFRESH_TOKEN_NOT_FOUND',
        details: {}
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class RefreshTokenExpiredException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Refresh token has expired',
        error: 'REFRESH_TOKEN_EXPIRED',
        details: {}
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}

export class PasswordResetTokenNotFoundException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Password reset token not found',
        error: 'PASSWORD_RESET_TOKEN_NOT_FOUND',
        details: {}
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class PasswordResetTokenExpiredException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.GONE,
        message: 'Password reset token has expired',
        error: 'PASSWORD_RESET_TOKEN_EXPIRED',
        details: {}
      },
      HttpStatus.GONE
    );
  }
}

export class AccountLockedException extends HttpException {
  constructor(email: string, lockoutUntil?: Date) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Account is locked due to too many failed login attempts',
        error: 'ACCOUNT_LOCKED',
        details: { 
          email,
          lockoutUntil: lockoutUntil?.toISOString()
        }
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
}

export class EmailNotVerifiedException extends HttpException {
  constructor(email: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Email address is not verified',
        error: 'EMAIL_NOT_VERIFIED',
        details: { email }
      },
      HttpStatus.FORBIDDEN
    );
  }
}
