import { Controller, Get } from '@nestjs/common';
import { Publico } from '../auth/decorators/publico.decorator.js';

@Publico()
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
