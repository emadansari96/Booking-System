import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
// Command Handlers
import { LogActivityHandler } from '../commands/handlers/log-activity.handler';
import { DeleteOldLogsHandler } from '../commands/handlers/delete-old-logs.handler';
// Query Handlers
import { GetAuditLogsHandler } from '../queries/handlers/get-audit-logs.handler';
import { GetAuditLogByIdHandler } from '../queries/handlers/get-audit-log-by-id.handler';
import { GetAuditLogStatisticsHandler } from '../queries/handlers/get-audit-log-statistics.handler';
// Services
import { AuditLogService } from '../services/audit-log.service';
// Repositories
import { MongoDBAuditLogRepository } from '../../../shared/infrastructure/mongodb/repositories/mongodb-audit-log.repository';
import { AuditLogRepositoryInterface } from '../interfaces/audit-log-repository.interface';
// Schemas
import { AuditLog, AuditLogSchema } from '../../../shared/infrastructure/mongodb/schemas/audit-log.schema';
@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
  ],
  providers: [
    // Services
    AuditLogService,
    
    // Repositories
    MongoDBAuditLogRepository,
    {
      provide: 'AuditLogRepositoryInterface',
      useClass: MongoDBAuditLogRepository,
    },
    
    // Command Handlers
    LogActivityHandler,
    DeleteOldLogsHandler,
    
    // Query Handlers
    GetAuditLogsHandler,
    GetAuditLogByIdHandler,
    GetAuditLogStatisticsHandler,
  ],
  exports: [
    CqrsModule,
    AuditLogService,
    'AuditLogRepositoryInterface',
  ],
})
export class AuditLogCqrsModule {}
