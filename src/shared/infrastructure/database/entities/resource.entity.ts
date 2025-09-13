import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('resources')
@Index(['name'], { unique: true })
@Index(['type'])
@Index(['status'])
@Index(['location'])
@Index(['createdAt'])
export class ResourceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ 
    type: 'enum', 
    enum: ['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'UNAVAILABLE'],
    default: 'AVAILABLE'
  })
  status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'UNAVAILABLE';

  @Column({ 
    type: 'enum', 
    enum: ['ROOM', 'HALL', 'EQUIPMENT', 'SERVICE', 'VENUE']
  })
  type: 'ROOM' | 'HALL' | 'EQUIPMENT' | 'SERVICE' | 'VENUE';

  @Column({ type: 'varchar', length: 200, nullable: true })
  location?: string;

  @Column({ type: 'json', nullable: true })
  amenities?: string[];

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
