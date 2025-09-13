import { Controller, Get } from '@nestjs/common';
@Controller('health')
export class HealthController {
  @Get()
      async checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'booking-system',
      version: '1.0.0'
    };
  }
@Get('ready')
      async checkReadiness() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      service: 'booking-system'
    };
  }
@Get('live')
      async checkLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      service: 'booking-system'
    };
  }
}