import { env } from '../config/env.js';

export interface EmailOptions {
  to: string;
  name: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface PasswordResetEmailOptions {
  to: string;
  name: string;
  resetUrl: string;
}

export interface IEmailService {
  sendPasswordResetEmail(options: PasswordResetEmailOptions): Promise<boolean>;
}

class EmailService implements IEmailService {
  /**
   * Send password reset email
   * In development: prints formatted email box with the one-click reset link to console
   * In production: ready for integration with Resend / SendGrid / AWS SES
   */
  async sendPasswordResetEmail({
    to,
    name,
    resetUrl,
  }: PasswordResetEmailOptions): Promise<boolean> {
    if (env.NODE_ENV !== 'production') {
      console.log('\n================== 📧 LOCAL EMAIL DISPATCH (DEV) ==================');
      console.log(`TO:      ${name} <${to}>`);
      console.log('SUBJECT: Password Reset Request - Silver Business Suite');
      console.log('BODY:');
      console.log(`Hello ${name},`);
      console.log('You requested a password reset for your Silver Business Suite account.');
      console.log('Click or copy the link below to set a new password (valid for 15 minutes):');
      console.log(`\n🔗 ${resetUrl}\n`);
      console.log('If you did not request this, please ignore this email.');
      console.log('==================================================================\n');
      return true;
    }

    // Production email integration placeholder (Resend / SendGrid)
    // Example: await resend.emails.send({ ... })
    return true;
  }
}

export const emailService: IEmailService = new EmailService();
