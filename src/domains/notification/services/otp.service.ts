import { Injectable, Inject } from '@nestjs/common';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { OtpEntity } from '../entities/otp.entity';
import { OtpRepositoryInterface } from '../interfaces/otp-repository.interface';
import { EmailService } from '../../../shared/infrastructure/email/email.service';

export interface CreateOtpRequest {
  userId: UuidValueObject;
  email: string;
  type: 'registration' | 'login' | 'password-reset';
  expiresInMinutes?: number;
  maxAttempts?: number;
  metadata?: Record<string, any>;
}

export interface VerifyOtpRequest {
  userId: UuidValueObject;
  email: string;
  code: string;
  type: 'registration' | 'login' | 'password-reset';
}

export interface OtpResult {
  success: boolean;
  message: string;
  otp?: OtpEntity;
  remainingAttempts?: number;
  timeUntilExpiry?: number;
}

@Injectable()
export class OtpService {
  constructor(
    @Inject('OtpRepositoryInterface')
    private readonly otpRepository: OtpRepositoryInterface,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Create and send OTP
   */
  async createAndSendOtp(request: CreateOtpRequest): Promise<OtpResult> {
    try {
      // Check if there's already a valid OTP for this user and type
      const existingOtp = await this.otpRepository.findValidOtpByUserAndType(
        request.userId,
        request.email,
        request.type
      );

      if (existingOtp) {
        // If there's a valid OTP, don't create a new one
        return {
          success: false,
          message: 'A valid OTP already exists. Please check your email or wait for it to expire.',
          otp: existingOtp,
          remainingAttempts: existingOtp.getRemainingAttempts(),
          timeUntilExpiry: existingOtp.getTimeUntilExpiry(),
        };
      }

      // Create new OTP
      const otp = OtpEntity.create(
        UuidValueObject.generate(),
        request.userId,
        request.email,
        request.type,
        request.expiresInMinutes || 10,
        request.maxAttempts || 3,
        request.metadata
      );

      // Save OTP
      const savedOtp = await this.otpRepository.save(otp);

      // Send OTP email immediately (no queue)
      const emailSent = await this.emailService.sendOTPEmail(
        request.email,
        savedOtp.code.value,
        request.type,
        request.expiresInMinutes || 10
      );

      if (!emailSent) {
        // If email failed, mark OTP as expired
        savedOtp.markAsExpired();
        await this.otpRepository.save(savedOtp);

        return {
          success: false,
          message: 'Failed to send OTP email. Please try again.',
        };
      }

      return {
        success: true,
        message: 'OTP sent successfully to your email.',
        otp: savedOtp,
        remainingAttempts: savedOtp.getRemainingAttempts(),
        timeUntilExpiry: savedOtp.getTimeUntilExpiry(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create OTP: ${error.message}`,
      };
    }
  }

  /**
   * Verify OTP
   */
  async verifyOtp(request: VerifyOtpRequest): Promise<OtpResult> {
    try {
      // Find the OTP
      const otp = await this.otpRepository.findValidOtpByUserAndType(
        request.userId,
        request.email,
        request.type
      );

      if (!otp) {
        return {
          success: false,
          message: 'No valid OTP found. Please request a new one.',
        };
      }

      // Verify the code
      const isValid = otp.verify(request.code);

      if (isValid) {
        // Save the verified OTP
        await this.otpRepository.save(otp);

        return {
          success: true,
          message: 'OTP verified successfully.',
          otp,
        };
      } else {
        // Save the updated OTP (with increased attempts)
        await this.otpRepository.save(otp);

        if (otp.isExpired()) {
          return {
            success: false,
            message: 'OTP has expired. Please request a new one.',
          };
        }

        if (otp.attempts >= otp.maxAttempts) {
          return {
            success: false,
            message: 'Maximum attempts exceeded. Please request a new OTP.',
          };
        }

        return {
          success: false,
          message: 'Invalid OTP code. Please try again.',
          remainingAttempts: otp.getRemainingAttempts(),
          timeUntilExpiry: otp.getTimeUntilExpiry(),
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to verify OTP: ${error.message}`,
      };
    }
  }

  /**
   * Mark OTP as used
   */
  async markOtpAsUsed(otpId: UuidValueObject): Promise<OtpResult> {
    try {
      const otp = await this.otpRepository.findById(otpId);

      if (!otp) {
        return {
          success: false,
          message: 'OTP not found.',
        };
      }

      if (!otp.isVerified()) {
        return {
          success: false,
          message: 'OTP must be verified before it can be used.',
        };
      }

      otp.markAsUsed();
      await this.otpRepository.save(otp);

      return {
        success: true,
        message: 'OTP marked as used successfully.',
        otp,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to mark OTP as used: ${error.message}`,
      };
    }
  }

  /**
   * Clean up expired OTPs
   */
  async cleanupExpiredOtps(): Promise<number> {
    try {
      const expiredOtps = await this.otpRepository.findExpiredOtps();
      let cleanedCount = 0;

      for (const otp of expiredOtps) {
        if (otp.isExpired() && otp.isPending()) {
          otp.markAsExpired();
          await this.otpRepository.save(otp);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      throw new Error(`Failed to cleanup expired OTPs: ${error.message}`);
    }
  }

  /**
   * Get OTP statistics
   */
  async getOtpStatistics(
    userId?: UuidValueObject,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalOtps: number;
    pendingOtps: number;
    verifiedOtps: number;
    expiredOtps: number;
    usedOtps: number;
    successRate: number;
  }> {
    const otps = await this.otpRepository.findByDateRange(startDate, endDate);
    
    let filteredOtps = otps;
    if (userId) {
      filteredOtps = otps.filter(otp => otp.userId.equals(userId));
    }

    const totalOtps = filteredOtps.length;
    const pendingOtps = filteredOtps.filter(otp => otp.isPending()).length;
    const verifiedOtps = filteredOtps.filter(otp => otp.isVerified()).length;
    const expiredOtps = filteredOtps.filter(otp => otp.isExpired()).length;
    const usedOtps = filteredOtps.filter(otp => otp.isUsed()).length;
    const successRate = totalOtps > 0 ? (verifiedOtps / totalOtps) * 100 : 0;

    return {
      totalOtps,
      pendingOtps,
      verifiedOtps,
      expiredOtps,
      usedOtps,
      successRate,
    };
  }

  /**
   * Resend OTP (invalidate current and create new)
   */
  async resendOtp(request: CreateOtpRequest): Promise<OtpResult> {
    try {
      // Find and invalidate existing OTP
      const existingOtp = await this.otpRepository.findValidOtpByUserAndType(
        request.userId,
        request.email,
        request.type
      );

      if (existingOtp) {
        existingOtp.markAsExpired();
        await this.otpRepository.save(existingOtp);
      }

      // Create and send new OTP
      return await this.createAndSendOtp(request);
    } catch (error) {
      return {
        success: false,
        message: `Failed to resend OTP: ${error.message}`,
      };
    }
  }
}
