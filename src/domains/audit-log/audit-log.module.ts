import { Module } from '@nestjs/common';
import { AuditLogCqrsModule } from './cqrs/audit-log-cqrs.module';
@Module({
  imports: [AuditLogCqrsModule],
  controllers: [],
  exports: [AuditLogCqrsModule],
})
export class AuditLogModule {}
