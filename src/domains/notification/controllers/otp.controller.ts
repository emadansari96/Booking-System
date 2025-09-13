import { Controller, Post, Get, Put, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOtpCommand } from '../commands/create-otp.command';
import { VerifyOtpCommand } from '../commands/verify-otp.command';
import { MarkOtpUsedCommand } from '../commands/mark-otp-used.command';
import { GetOtpByIdQuery } from '../queries/get-otp-by-id.query';
import { GetOtpStatisticsQuery } from '../queries/get-otp-statistics.query';
import { CreateOtpDto, VerifyOtpDto, OtpResponseDto, OtpStatisticsDto, GetOtpsDto } from '../dtos/otp.dto';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOtp(@Body() dto: CreateOtpDto): Promise<{
    success: boolean;
    message: string;
    otp?: OtpResponseDto;
    remainingAttempts?: number;
    timeUntilExpiry?: number;
  }> {
    const command = new CreateOtpCommand(
      dto.userId,
      dto.email,
      dto.type as any,
      dto.expiresInMinutes,
      dto.maxAttempts,
      dto.metadata
    );

    const result = await this.commandBus.execute(command);
    return {
      success: result.success,
      message: result.message,
      otp: result.otp ? this.mapToResponseDto(result.otp) : undefined,
      remainingAttempts: result.remainingAttempts,
      timeUntilExpiry: result.timeUntilExpiry,
    };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<{
    success: boolean;
    message: string;
    otp?: OtpResponseDto;
    remainingAttempts?: number;
    timeUntilExpiry?: number;
  }> {
    const command = new VerifyOtpCommand(
      dto.userId,
      dto.email,
      dto.code,
      dto.type as any
    );

    const result = await this.commandBus.execute(command);
    return {
      success: result.success,
      message: result.message,
      otp: result.otp ? this.mapToResponseDto(result.otp) : undefined,
      remainingAttempts: result.remainingAttempts,
      timeUntilExpiry: result.timeUntilExpiry,
    };
  }

  @Put(':id/use')
  @HttpCode(HttpStatus.OK)
  async markOtpAsUsed(@Param('id') id: string): Promise<{
    success: boolean;
    message: string;
    otp?: OtpResponseDto;
  }> {
    const command = new MarkOtpUsedCommand(id);
    const result = await this.commandBus.execute(command);
    return {
      success: result.success,
      message: result.message,
      otp: result.otp ? this.mapToResponseDto(result.otp) : undefined,
    };
  }

  @Get(':id')
  async getOtpById(@Param('id') id: string): Promise<OtpResponseDto> {
    const query = new GetOtpByIdQuery(id);
    const otp = await this.queryBus.execute(query);
    return this.mapToResponseDto(otp);
  }

  @Get('statistics/summary')
  async getOtpStatistics(@Query() dto: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OtpStatisticsDto> {
    const query = new GetOtpStatisticsQuery(
      dto.userId,
      dto.startDate ? new Date(dto.startDate) : undefined,
      dto.endDate ? new Date(dto.endDate) : undefined
    );

    return await this.queryBus.execute(query);
  }

  private mapToResponseDto(otp: any): OtpResponseDto {
    return {
      id: otp.id.value,
      userId: otp.userId.value,
      email: otp.email,
      type: otp.type.value,
      status: otp.status.value,
      expiresAt: otp.expiresAt,
      verifiedAt: otp.verifiedAt,
      usedAt: otp.usedAt,
      attempts: otp.attempts,
      maxAttempts: otp.maxAttempts,
      metadata: otp.metadata,
      createdAt: otp.createdAt,
      updatedAt: otp.updatedAt,
    };
  }
}
