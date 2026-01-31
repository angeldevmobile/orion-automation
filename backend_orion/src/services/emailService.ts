import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter;

  constructor() {
    // Usar las variables EMAIL_* que ya tienes configuradas
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
      console.log('Usando configuración:');
      console.log('- Host:', process.env.EMAIL_HOST);
      console.log('- Port:', process.env.EMAIL_PORT);
      console.log('- User:', process.env.EMAIL_USER);
      console.log('- Pass:', process.env.EMAIL_PASS ? 'Configurada' : 'No configurada');
      
      await this.transporter.sendMail({
        from: `"Orion AI" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log('Correo enviado exitosamente a:', options.to);
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  generatePasswordResetEmail(resetToken: string, userEmail: string): string {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperar Contraseña</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <!-- Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <div style="background-color: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); display: inline-block; padding: 15px 20px; border-radius: 12px; margin-bottom: 20px;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✨ Orion AI</h1>
                      </div>
                      <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Recuperar Contraseña</h2>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                        Hola,
                      </p>
                      <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta <strong>${userEmail}</strong>.
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                              Restablecer Contraseña
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 30px 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        O copia y pega este enlace en tu navegador:
                      </p>
                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; word-break: break-all;">
                        <a href="${resetUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">${resetUrl}</a>
                      </div>

                      <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                          ⚠️ <strong>Este enlace expirará en 1 hora.</strong> Si no solicitaste este cambio, ignora este correo.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                        © ${new Date().getFullYear()} Orion AI. Todos los derechos reservados.
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        Este correo fue enviado automáticamente. Por favor no respondas.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const html = this.generatePasswordResetEmail(resetToken, email);
    
    return this.sendEmail({
      to: email,
      subject: '🔐 Recupera tu contraseña de Orion AI',
      html,
    });
  }
}