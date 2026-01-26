/**
 * 健康检查控制器
 */
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Public } from '../../common/decorators';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  /**
   * 健康检查
   */
  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  /**
   * 就绪检查
   */
  @Public()
  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  /**
   * 存活检查
   */
  @Public()
  @Get('live')
  liveness() {
    return { status: 'ok', timestamp: Date.now() };
  }
}
