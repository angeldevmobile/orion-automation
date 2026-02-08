import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions) {
    try {
      console.log('Intentando enviar email a:', options.to);

      await this.transporter.sendMail({
        from: `"Orion AI" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        // Agregar logo como attachment inline
        attachments: [{
          filename: 'orion-logo.png',
          path: 'https://i.imgur.com/kWMCysB.png',
          cid: 'orion-logo'
        }]
      });

      console.log('Correo enviado exitosamente a:', options.to);
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, htmlContent: string) {
    return this.sendEmail({
      to: email,
      subject: 'Orion AI - Recupera tu contraseña de forma segura',
      html: htmlContent,
    });
  }

  async sendWelcomeEmail(email: string, htmlContent: string) {
    return this.sendEmail({
      to: email,
      subject: '¡Bienvenido a Orion AI! 🚀',
      html: htmlContent,
    });
  }
}