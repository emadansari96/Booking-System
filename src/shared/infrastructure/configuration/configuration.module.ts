// src/shared/infrastructure/configuration/configuration.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigurationService } from './configuration.service';
import { Configuration } from '../../domain/interfaces/configuration.interface';

// ✅ Injection Token
export const CONFIGURATION_TOKEN = 'Configuration';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CONFIGURATION_TOKEN,
      useClass: AppConfigurationService
    }
  ],
  exports: [CONFIGURATION_TOKEN]
})
export class ConfigurationModule {}