import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ 
  collection: 'audit_logs',
  timestamps: true,
  versionKey: false,
})
export class AuditLog {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ type: String })
  userId?: string;

  @Prop({ type: String })
  sessionId?: string;

  @Prop({ required: true, type: String })
  action: string;

  @Prop({ required: true, type: String })
  domain: string;

  @Prop({ required: true, type: String })
  entityType: string;

  @Prop({ type: String })
  entityId?: string;

  @Prop({ required: true, type: String })
  status: string;

  @Prop({ required: true, type: String })
  severity: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ type: Object })
  oldValues?: Record<string, any>;

  @Prop({ type: Object })
  newValues?: Record<string, any>;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ required: true, type: Date })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Create indexes for efficient queries
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ sessionId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ domain: 1, timestamp: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
AuditLogSchema.index({ status: 1, timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ ipAddress: 1, timestamp: -1 });

// Compound indexes for complex queries
AuditLogSchema.index({ domain: 1, action: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, domain: 1, timestamp: -1 });
AuditLogSchema.index({ status: 1, severity: 1, timestamp: -1 });
