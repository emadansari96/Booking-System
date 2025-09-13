import { Module } from '@nestjs/common';
import { AuditLogController } from './controllers/audit-log.controller';
import { AuditLogCqrsModule } from './cqrs/audit-log-cqrs.module';

@Module({
  imports: [AuditLogCqrsModule],
  controllers: [AuditLogController],
  exports: [AuditLogCqrsModule],
})
export class AuditLogModule {}
