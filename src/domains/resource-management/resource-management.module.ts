import { Module } from '@nestjs/common';
import { ResourceController } from './controllers/resource.controller';
import { ResourceItemController } from './controllers/resource-item.controller';
import { ResourceDomainService } from './services/resource-domain.service';
import { ResourceCqrsModule } from './cqrs/resource-cqrs.module';

@Module({
  imports: [
    ResourceCqrsModule,
  ],
  controllers: [
    ResourceController,
    ResourceItemController,
  ],
  providers: [
    ResourceDomainService,
  ],
  exports: [
    ResourceDomainService,
    ResourceCqrsModule,
  ],
})
export class ResourceManagementModule {}
