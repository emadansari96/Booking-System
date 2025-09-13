import { HttpException, HttpStatus } from '@nestjs/common';
export class ResourceNotFoundException extends HttpException {
  constructor(resourceId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Resource not found',
        error: 'RESOURCE_NOT_FOUND',
        details: { resourceId }
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class ResourceItemNotFoundException extends HttpException {
  constructor(resourceItemId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Resource item not found',
        error: 'RESOURCE_ITEM_NOT_FOUND',
        details: { resourceItemId }
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class ResourceNotAvailableException extends HttpException {
  constructor(resourceId: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Resource is not available',
        error: 'RESOURCE_NOT_AVAILABLE',
        details: { resourceId }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class ResourceItemNotAvailableException extends HttpException {
  constructor(resourceItemId: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Resource item is not available',
        error: 'RESOURCE_ITEM_NOT_AVAILABLE',
        details: { resourceItemId }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidResourceCapacityException extends HttpException {
  constructor(minCapacity: number, maxCapacity: number) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid resource capacity',
        error: 'INVALID_RESOURCE_CAPACITY',
        details: { 
          minCapacity, 
          maxCapacity,
          reason: 'Min capacity must be less than or equal to max capacity'
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidResourcePriceException extends HttpException {
  constructor(price: number) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid resource price',
        error: 'INVALID_RESOURCE_PRICE',
        details: { 
          price,
          reason: 'Price must be greater than or equal to 0'
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

