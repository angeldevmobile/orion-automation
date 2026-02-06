export const resetPasswordEmailTemplate = (
  resetUrl: string, 
  userName: string = 'Usuario'
): string => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restablecer Contraseña - Orion AI</title>
      <!--[if mso]>
      <style type="text/css">
        table {border-collapse: collapse;}
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%);">
      <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh; padding: 40px 20px;" role="presentation">
        <tr>
          <td align="center">
            <!-- Contenedor principal con fondo oscuro -->
            <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid rgba(255,255,255,0.1); max-width: 600px;" role="presentation">
              
              <!-- Header con logo y título -->
              <tr>
                <td style="padding: 50px 40px 40px; text-align: center; position: relative;">
                  <!-- Efecto de brillo superior -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="height: 2px; background: linear-gradient(90deg, transparent, #667eea, transparent);"></td>
                    </tr>
                  </table>
                  
                  <!-- Logo GIF animado -->
                  <table cellpadding="0" cellspacing="0" style="margin: 20px auto;" role="presentation">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0" style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);" role="presentation">
                          <tr>
                            <td align="center" valign="middle">
                              <img src="https://i.imgur.com/UEILzli.gif" 
                                   alt="Orion AI Logo" 
                                   width="56" 
                                   height="56" 
                                   style="display: block; border: 0; border-radius: 12px;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <h1 style="color: #ffffff; margin: 16px 0 8px; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    Orion AI
                  </h1>
                  <p style="color: #94a3b8; margin: 0; font-size: 18px; font-weight: 600;">
                    Recupera tu contraseña
                  </p>
                  <p style="color: #64748b; margin: 8px 0 0; font-size: 14px;">
                    Restablece el acceso a tu cuenta de forma segura
                  </p>
                </td>
              </tr>
              
              <!-- Contenido principal -->
              <tr>
                <td style="padding: 0 40px 50px;">
                  <!-- Saludo -->
                  <h2 style="color: #e2e8f0; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">
                    Hola <span style="color: #667eea;">${userName}</span>,
                  </h2>
                  
                  <!-- Mensaje principal -->
                  <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong style="color: #e2e8f0;">Orion AI</strong>. Si no realizaste esta solicitud, puedes ignorar este mensaje de forma segura.
                  </p>
                  
                  <!-- Card de enlace seguro -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(100, 116, 139, 0.1); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 12px; margin: 32px 0;" role="presentation">
                    <tr>
                      <td style="padding: 24px;">
                        <table cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="vertical-align: top; padding-right: 16px;">
                              <!-- SVG Lock Icon -->
                              <table cellpadding="0" cellspacing="0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); border-radius: 10px;" role="presentation">
                                <tr>
                                  <td align="center" valign="middle">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td style="vertical-align: top;">
                              <h3 style="color: #e2e8f0; margin: 0; font-size: 16px; font-weight: 600;">Enlace Seguro</h3>
                              <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px; line-height: 1.5;">Este enlace expirará en <strong style="color: #f59e0b;">1 hora</strong> por tu seguridad. Si no solicitaste este cambio, ignora este correo.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Botón CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;" role="presentation">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td align="center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);">
                              <a href="${resetUrl}" 
                                 style="display: inline-flex; align-items: center; gap: 8px; padding: 16px 48px; text-decoration: none; color: #ffffff; font-weight: 600; font-size: 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;">
                                <!-- SVG Key Icon -->
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
                                  <circle cx="8.5" cy="8.5" r="5.5" stroke="white" stroke-width="2"/>
                                  <path d="M14 14L22 22M18 18L20 20" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                                <span style="vertical-align: middle;">Restablecer Contraseña</span>
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Enlace alternativo -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(51, 65, 85, 0.5); border-radius: 8px; margin-top: 32px; border: 1px solid rgba(148, 163, 184, 0.2);" role="presentation">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 12px 0; text-align: center;">
                          Si el botón no funciona, copia y pega este enlace en tu navegador:
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(102, 126, 234, 0.1); border-radius: 6px; border: 1px dashed rgba(102, 126, 234, 0.3);" role="presentation">
                          <tr>
                            <td style="padding: 12px;">
                              <p style="color: #667eea; font-size: 12px; word-break: break-all; margin: 0; text-align: center;">
                                ${resetUrl}
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Nota de seguridad con SVG -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;" role="presentation">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="vertical-align: middle; padding-right: 8px;">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="#64748b" stroke-width="2"/>
                                <path d="M12 8V12M12 16H12.01" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
                              </svg>
                            </td>
                            <td style="vertical-align: middle;">
                              <p style="color: #64748b; font-size: 13px; margin: 0; font-style: italic;">
                                Por tu seguridad, nunca compartas este enlace con nadie.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(0, 0, 0, 0.3) 100%); padding: 32px 40px; text-align: center; border-top: 1px solid rgba(148, 163, 184, 0.1);">
                  <!-- Logo pequeño GIF -->
                  <table cellpadding="0" cellspacing="0" style="margin: 0 auto 16px;" role="presentation">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0" style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; opacity: 0.8;" role="presentation">
                          <tr>
                            <td align="center" valign="middle">
                              <img src="https://i.imgur.com/UEILzli.gif" 
                                   alt="Orion AI" 
                                   width="32" 
                                   height="32" 
                                   style="display: block; border: 0; border-radius: 8px;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">
                    Enviado con 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; display: inline-block;">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    por <strong style="color: #e2e8f0;">Orion AI</strong>
                  </p>
                  
                  <!-- Links de redes sociales -->
                  <table cellpadding="0" cellspacing="0" style="margin: 16px auto;" role="presentation">
                    <tr>
                      <td style="padding: 0 8px;">
                        <a href="#" style="color: #64748b; text-decoration: none; font-size: 13px;">Twitter</a>
                      </td>
                      <td style="padding: 0 8px; color: #475569;">•</td>
                      <td style="padding: 0 8px;">
                        <a href="#" style="color: #64748b; text-decoration: none; font-size: 13px;">LinkedIn</a>
                      </td>
                      <td style="padding: 0 8px; color: #475569;">•</td>
                      <td style="padding: 0 8px;">
                        <a href="#" style="color: #64748b; text-decoration: none; font-size: 13px;">Discord</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #475569; font-size: 11px; margin: 0;">
                    © ${new Date().getFullYear()} Orion AI. Todos los derechos reservados.
                  </p>
                  
                  <!-- Links legales -->
                  <table cellpadding="0" cellspacing="0" style="margin: 12px auto 0;" role="presentation">
                    <tr>
                      <td style="padding: 0 8px;">
                        <a href="#" style="color: #475569; text-decoration: none; font-size: 11px;">Política de Privacidad</a>
                      </td>
                      <td style="padding: 0 8px; color: #334155;">•</td>
                      <td style="padding: 0 8px;">
                        <a href="#" style="color: #475569; text-decoration: none; font-size: 11px;">Términos de Servicio</a>
                      </td>
                      <td style="padding: 0 8px; color: #334155;">•</td>
                      <td style="padding: 0 8px;">
                        <a href="#" style="color: #475569; text-decoration: none; font-size: 11px;">Cancelar Suscripción</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};