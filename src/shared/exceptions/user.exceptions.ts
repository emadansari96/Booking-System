import { HttpException, HttpStatus } from '@nestjs/common';
export class UserNotFoundException extends HttpException {
  constructor(userId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
        details: { userId }
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class UserAlreadyExistsException extends HttpException {
  constructor(email: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: 'User already exists',
        error: 'USER_ALREADY_EXISTS',
        details: { email }
      },
      HttpStatus.CONFLICT
    );
  }
}

export class InvalidUserRoleException extends HttpException {
  constructor(role: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid user role',
        error: 'INVALID_USER_ROLE',
        details: { 
          role,
          validRoles: ['admin', 'customer']
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class UserDeactivatedException extends HttpException {
  constructor(userId: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'User account is deactivated',
        error: 'USER_DEACTIVATED',
        details: { userId }
      },
      HttpStatus.FORBIDDEN
    );
  }
}

export class InvalidPhoneNumberException extends HttpException {
  constructor(phoneNumber: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid phone number format',
        error: 'INVALID_PHONE_NUMBER',
        details: { 
          phoneNumber,
          reason: 'Phone number must be in valid format'
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidEmailException extends HttpException {
  constructor(email: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid email format',
        error: 'INVALID_EMAIL',
        details: { 
          email,
          reason: 'Email must be in valid format'
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

