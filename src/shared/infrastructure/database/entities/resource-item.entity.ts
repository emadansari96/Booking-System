import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ResourceEntity } from './resource.entity';

@Entity('resource_items')
@Index('idx_resource_item_status_active', ['resourceId', 'status', 'isActive'])
@Index('idx_resource_item_type_active', ['resourceId', 'type', 'isActive'])
@Index('idx_resource_item_status', ['status', 'isActive'])
@Index('idx_resource_item_type', ['type', 'isActive'])
// Index for availability queries
@Index('idx_resource_item_availability', ['resourceId', 'status'])
export class ResourceItemEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  resourceId: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'UNAVAILABLE', 'OUT_OF_ORDER'],
    default: 'AVAILABLE'
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['ROOM', 'HALL', 'EQUIPMENT', 'SERVICE', 'VENUE', 'TABLE', 'SEAT', 'PARKING_SPOT', 'LOCKER']
  })
  type: string;

  @Column('int')
  capacity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ length: 255, nullable: true })
  location?: string;

  @Column('json', { nullable: true })
  amenities?: string[];

  @Column('json', { nullable: true })
  images?: string[];

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resourceId' })
  resource?: ResourceEntity;
}
