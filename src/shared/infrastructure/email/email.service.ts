import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs';

export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly templatesPath: string;

  constructor(private readonly configService: ConfigService) {
    // Initialize SendGrid
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }
    sgMail.setApiKey(apiKey);

    // Set templates path
    this.templatesPath = path.join(process.cwd(), 'src/shared/infrastructure/email/templates');
  }

  /**
   * Send email using SendGrid
   */
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const msg = {
        to: emailData.to,
        from: emailData.from || this.configService.get<string>('EMAIL_FROM', 'noreply@booking-system.com'),
        replyTo: emailData.replyTo,
        subject: emailData.subject,
        html: emailData.html,
        attachments: emailData.attachments,
      };

      await sgMail.send(msg);
      this.logger.log(`Email sent successfully to ${emailData.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${emailData.to}:`, error);
      return false;
    }
  }

  /**
   * Send email using template
   */
  async sendTemplateEmail(
    to: string,
    templateName: string,
    templateData: Record<string, any>,
    subject?: string
  ): Promise<boolean> {
    try {
      const template = await this.renderTemplate(templateName, templateData);
      
      return await this.sendEmail({
        to,
        subject: subject || template.subject,
        html: template.html,
      });
    } catch (error) {
      this.logger.error(`Failed to send template email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Render EJS template
   */
  async renderTemplate(templateName: string, data: Record<string, any>): Promise<EmailTemplate> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.ejs`);
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template ${templateName} not found`);
      }

      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const renderedHtml = ejs.render(templateContent, data);

      // Extract subject from template data or use default
      const subject = data.subject || `${templateName.charAt(0).toUpperCase() + templateName.slice(1)} Notification`;

      return {
        subject,
        html: renderedHtml,
      };
    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Send OTP email (immediate, no queue)
   */
  async sendOTPEmail(
    to: string,
    otp: string,
    type: 'registration' | 'login' | 'password-reset',
    expiresInMinutes: number = 10
  ): Promise<boolean> {
    const templateData = {
      otp,
      type,
      expiresInMinutes,
      subject: `Your ${type.replace('-', ' ')} verification code`,
    };

    return await this.sendTemplateEmail(to, 'otp', templateData);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    const templateData = {
      userName,
      subject: 'Welcome to Booking System!',
    };

    return await this.sendTemplateEmail(to, 'welcome', templateData);
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmationEmail(
    to: string,
    userName: string,
    paymentData: {
      amount: number;
      currency: string;
      paymentId: string;
      invoiceNumber: string;
    }
  ): Promise<boolean> {
    const templateData = {
      userName,
      ...paymentData,
      subject: 'Payment Confirmation',
    };

    return await this.sendTemplateEmail(to, 'payment-confirmation', templateData);
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmationEmail(
    to: string,
    userName: string,
    bookingData: {
      resourceName: string;
      startDate: string;
      endDate: string;
      totalAmount: number;
      currency: string;
    }
  ): Promise<boolean> {
    const templateData = {
      userName,
      ...bookingData,
      subject: 'Booking Confirmation',
    };

    return await this.sendTemplateEmail(to, 'booking-confirmation', templateData);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    userName: string,
    resetLink: string
  ): Promise<boolean> {
    const templateData = {
      userName,
      resetLink,
      subject: 'Password Reset Request',
    };

    return await this.sendTemplateEmail(to, 'password-reset', templateData);
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(
    to: string,
    userName: string,
    notificationData: {
      title: string;
      message: string;
      type: string;
      actionUrl?: string;
    }
  ): Promise<boolean> {
    const templateData = {
      userName,
      ...notificationData,
      subject: notificationData.title,
    };

    return await this.sendTemplateEmail(to, 'notification', templateData);
  }

  /**
   * Validate email address
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get email statistics (placeholder for future implementation)
   */
  async getEmailStatistics(): Promise<{
    sent: number;
    delivered: number;
    bounced: number;
    opened: number;
  }> {
    // This would integrate with SendGrid's statistics API
    return {
      sent: 0,
      delivered: 0,
      bounced: 0,
      opened: 0,
    };
  }
}
