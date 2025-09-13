import { HttpException, HttpStatus } from '@nestjs/common';
export class AuditLogNotFoundException extends HttpException {
  constructor(auditLogId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Audit log not found',
        error: 'AUDIT_LOG_NOT_FOUND',
        details: { auditLogId }
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class InvalidAuditActionException extends HttpException {
  constructor(action: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid audit action',
        error: 'INVALID_AUDIT_ACTION',
        details: { 
          action,
          validActions: ['CREATE', 'UPDATE', 'DELETE', 'READ', 'LOGIN', 'LOGOUT', 'PAYMENT']
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidAuditDomainException extends HttpException {
  constructor(domain: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid audit domain',
        error: 'INVALID_AUDIT_DOMAIN',
        details: { 
          domain,
          validDomains: ['USER', 'BOOKING', 'PAYMENT', 'RESOURCE', 'NOTIFICATION', 'AUDIT']
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidAuditSeverityException extends HttpException {
  constructor(severity: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid audit severity',
        error: 'INVALID_AUDIT_SEVERITY',
        details: { 
          severity,
          validSeverities: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class AuditLogCreationFailedException extends HttpException {
  constructor(reason: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to create audit log',
        error: 'AUDIT_LOG_CREATION_FAILED',
        details: { reason }
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class AuditLogRetentionExceededException extends HttpException {
  constructor(retentionDays: number) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Audit log retention period exceeded',
        error: 'AUDIT_LOG_RETENTION_EXCEEDED',
        details: { 
          retentionDays,
          reason: 'Cannot access audit logs older than retention period'
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class AuditLogSearchFailedException extends HttpException {
  constructor(reason: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Audit log search failed',
        error: 'AUDIT_LOG_SEARCH_FAILED',
        details: { reason }
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class AuditLogStatisticsFailedException extends HttpException {
  constructor(reason: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to generate audit log statistics',
        error: 'AUDIT_LOG_STATISTICS_FAILED',
        details: { reason }
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

