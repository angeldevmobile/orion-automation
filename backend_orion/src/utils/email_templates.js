export const resetPasswordEmailTemplate = (resetUrl, userName = 'Usuario') => {
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
            <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid rgba(255,255,255,0.15); max-width: 600px;" role="presentation">
              
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
                  <p style="color: #c8d6e5; margin: 0; font-size: 18px; font-weight: 600;">
                    Recupera tu contraseña
                  </p>
                  <p style="color: #a0aec0; margin: 8px 0 0; font-size: 14px;">
                    Restablece el acceso a tu cuenta de forma segura
                  </p>
                </td>
              </tr>
              
              <!-- Contenido principal -->
              <tr>
                <td style="padding: 0 40px 50px;">
                  <!-- Saludo -->
                  <h2 style="color: #f1f5f9; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">
                    Hola <span style="color: #818cf8;">${userName}</span>,
                  </h2>
                  
                  <!-- Mensaje principal -->
                  <p style="color: #e2e8f0; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong style="color: #ffffff;">Orion AI</strong>. Si no realizaste esta solicitud, puedes ignorar este mensaje de forma segura.
                  </p>
                  
                  <!-- Card de enlace seguro -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(100, 116, 139, 0.15); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 12px; margin: 32px 0;" role="presentation">
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
                              <h3 style="color: #f1f5f9; margin: 0; font-size: 16px; font-weight: 600;">Enlace Seguro</h3>
                              <p style="color: #cbd5e1; margin: 4px 0 0; font-size: 13px; line-height: 1.5;">Este enlace expirará en <strong style="color: #fbbf24;">1 hora</strong> por tu seguridad. Si no solicitaste este cambio, ignora este correo.</p>
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
                                 style="display: inline-flex; align-items: center; gap: 8px; padding: 16px 48px; text-decoration: none; color: #ffffff; font-weight: 700; font-size: 16px; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px;">
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
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(51, 65, 85, 0.6); border-radius: 8px; margin-top: 32px; border: 1px solid rgba(148, 163, 184, 0.25);" role="presentation">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="color: #cbd5e1; font-size: 12px; margin: 0 0 12px 0; text-align: center;">
                          Si el botón no funciona, copia y pega este enlace en tu navegador:
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(102, 126, 234, 0.15); border-radius: 6px; border: 1px dashed rgba(102, 126, 234, 0.4);" role="presentation">
                          <tr>
                            <td style="padding: 12px;">
                              <p style="color: #93a8f4; font-size: 12px; word-break: break-all; margin: 0; text-align: center;">
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
                                <circle cx="12" cy="12" r="10" stroke="#94a3b8" stroke-width="2"/>
                                <path d="M12 8V12M12 16H12.01" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
                              </svg>
                            </td>
                            <td style="vertical-align: middle;">
                              <p style="color: #94a3b8; font-size: 13px; margin: 0; font-style: italic;">
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
                <td style="background: linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(0, 0, 0, 0.3) 100%); padding: 32px 40px; text-align: center; border-top: 1px solid rgba(148, 163, 184, 0.15);">
                  <!-- Logo pequeño GIF -->
                  <table cellpadding="0" cellspacing="0" style="margin: 0 auto 16px;" role="presentation">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0" style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; opacity: 0.9;" role="presentation">
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
                  
                  <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 8px 0;">
                    Enviado con 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; display: inline-block;">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    por <strong style="color: #ffffff;">Orion AI</strong>
                  </p>
                  
                  <!-- Links de redes sociales -->
                  <table cellpadding="0" cellspacing="0" style="margin: 16px auto;" role="presentation">
                    <tr>
                      <td style="padding: 0 8px;">
                        <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 13px;">Twitter</a>
                      </td>
                      <td style="padding: 0 8px; color: #64748b;">•</td>
                      <td style="padding: 0 8px;">
                        <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 13px;">LinkedIn</a>
                      </td>
                      <td style="padding: 0 8px; color: #64748b;">•</td>
                      <td style="padding: 0 8px;">
                        <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 13px;">Discord</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                    © ${new Date().getFullYear()} Orion AI. Todos los derechos reservados.
                  </p>
                  
                  <!-- Links legales -->
                  <table cellpadding="0" cellspacing="0" style="margin: 12px auto 0;" role="presentation">
                    <tr>
                      <td style="padding: 0 8px;">
                        <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 11px;">Política de Privacidad</a>
                      </td>
                      <td style="padding: 0 8px; color: #64748b;">•</td>
                      <td style="padding: 0 8px;">
                        <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 11px;">Términos de Servicio</a>
                      </td>
                      <td style="padding: 0 8px; color: #64748b;">•</td>
                      <td style="padding: 0 8px;">
                        <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 11px;">Cancelar Suscripción</a>
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
export const welcomeEmailTemplate = (userName = 'Usuario', dashboardUrl = 'https://orion-ai.com/dashboard') => {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a Orion AI</title>
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
            <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid rgba(255,255,255,0.15); max-width: 600px;" role="presentation">
              
              <!-- Header -->
              <tr>
                <td style="padding: 50px 40px 40px; text-align: center;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="height: 2px; background: linear-gradient(90deg, transparent, #22d3ee, transparent);"></td>
                    </tr>
                  </table>
                  
                  <!-- Estrellas decorativas -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="padding: 16px 0 0; position: relative;">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td width="60" style="vertical-align: top;">
                              <span style="color: #22d3ee; font-size: 16px;">&#10022;</span>
                            </td>
                            <td>&nbsp;</td>
                            <td width="60" style="vertical-align: top; text-align: right;">
                              <span style="color: #818cf8; font-size: 12px;">&#10022;</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Logo -->
                  <table cellpadding="0" cellspacing="0" style="margin: 12px auto;" role="presentation">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="vertical-align: middle; padding-right: 12px;">
                              <table cellpadding="0" cellspacing="0" style="width: 52px; height: 52px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border-radius: 14px; box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);" role="presentation">
                                <tr>
                                  <td align="center" valign="middle">
                                    <img src="https://i.imgur.com/UEILzli.gif" 
                                         alt="Orion AI Logo" 
                                         width="36" 
                                         height="36" 
                                         style="display: block; border: 0; border-radius: 8px;" />
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td style="vertical-align: middle;">
                              <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Orion AI</h2>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <h1 style="color: #ffffff; margin: 24px 0 8px; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">
                    Bienvenido a Orion AI
                  </h1>
                  <p style="color: #c8d6e5; margin: 0; font-size: 16px; font-weight: 500;">
                    Tu viaje hacia el futuro de la IA comienza ahora
                  </p>
                  
                  <!-- Estrella central -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td align="center" style="padding: 12px 0 0;">
                        <span style="color: #22d3ee; font-size: 10px;">&#10022;</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Contenido -->
              <tr>
                <td style="padding: 0 40px 50px;">
                  <h2 style="color: #f1f5f9; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">
                    Hola <span style="color: #22d3ee;">${userName}</span>,
                  </h2>
                  
                  <p style="color: #e2e8f0; font-size: 15px; line-height: 1.7; margin: 0 0 32px 0;">
                    Gracias por unirte a <strong style="color: #ffffff;">Orion AI</strong>. Estamos emocionados de tenerte con nosotros. Tu cuenta ha sido activada y ya puedes comenzar a explorar todas las funcionalidades de nuestra plataforma de inteligencia artificial.
                  </p>
                  
                  <!-- Features Cards -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px 0;" role="presentation">
                    <tr>
                      <td>
                        <!-- Feature 1 -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 12px; margin-bottom: 12px;" role="presentation">
                          <tr>
                            <td style="padding: 20px;">
                              <table cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="vertical-align: top; padding-right: 16px;">
                                    <table cellpadding="0" cellspacing="0" style="width: 44px; height: 44px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border-radius: 12px; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);" role="presentation">
                                      <tr>
                                        <td align="center" valign="middle">
                                          <span style="font-size: 20px;">&#9889;</span>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                  <td style="vertical-align: top;">
                                    <h3 style="color: #f1f5f9; margin: 0 0 4px; font-size: 15px; font-weight: 700;">Procesamiento Ultra Rápido</h3>
                                    <p style="color: #cbd5e1; margin: 0; font-size: 13px; line-height: 1.5;">Experimenta respuestas instantáneas con nuestro motor de IA de última generación.</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Feature 2 -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(129, 140, 248, 0.08); border: 1px solid rgba(129, 140, 248, 0.2); border-radius: 12px; margin-bottom: 12px;" role="presentation">
                          <tr>
                            <td style="padding: 20px;">
                              <table cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="vertical-align: top; padding-right: 16px;">
                                    <table cellpadding="0" cellspacing="0" style="width: 44px; height: 44px; background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%); border-radius: 12px; box-shadow: 0 4px 12px rgba(129, 140, 248, 0.3);" role="presentation">
                                      <tr>
                                        <td align="center" valign="middle">
                                          <span style="font-size: 20px;">&#128274;</span>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                  <td style="vertical-align: top;">
                                    <h3 style="color: #f1f5f9; margin: 0 0 4px; font-size: 15px; font-weight: 700;">Seguridad Avanzada</h3>
                                    <p style="color: #cbd5e1; margin: 0; font-size: 13px; line-height: 1.5;">Tus datos están protegidos con encriptación de nivel empresarial.</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Feature 3 -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 12px;" role="presentation">
                          <tr>
                            <td style="padding: 20px;">
                              <table cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="vertical-align: top; padding-right: 16px;">
                                    <table cellpadding="0" cellspacing="0" style="width: 44px; height: 44px; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); border-radius: 12px; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);" role="presentation">
                                      <tr>
                                        <td align="center" valign="middle">
                                          <span style="font-size: 20px;">&#128640;</span>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                  <td style="vertical-align: top;">
                                    <h3 style="color: #f1f5f9; margin: 0 0 4px; font-size: 15px; font-weight: 700;">Automatización Inteligente</h3>
                                    <p style="color: #cbd5e1; margin: 0; font-size: 13px; line-height: 1.5;">Automatiza tus flujos de trabajo con IA y ahorra horas de trabajo manual.</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Botón CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 36px 0;" role="presentation">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td align="center" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border-radius: 12px; box-shadow: 0 8px 24px rgba(6, 182, 212, 0.4);">
                              <a href="${dashboardUrl}" 
                                 style="display: inline-block; padding: 16px 48px; text-decoration: none; color: #ffffff; font-weight: 700; font-size: 16px; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px;">
                                Ir al Dashboard
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Mensaje de ayuda -->
                  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                    Si tienes alguna pregunta, no dudes en contactarnos. Estamos aquí para ayudarte.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(0, 0, 0, 0.3) 100%); padding: 32px 40px; text-align: center; border-top: 1px solid rgba(148, 163, 184, 0.15);">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="vertical-align: middle;" width="50%">
                        <table cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="vertical-align: middle; padding-right: 10px;">
                              <table cellpadding="0" cellspacing="0" style="width: 36px; height: 36px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border-radius: 10px;" role="presentation">
                                <tr>
                                  <td align="center" valign="middle">
                                    <img src="https://i.imgur.com/UEILzli.gif" 
                                         alt="Orion AI" 
                                         width="24" 
                                         height="24" 
                                         style="display: block; border: 0; border-radius: 6px;" />
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td style="vertical-align: middle;">
                              <strong style="color: #ffffff; font-size: 14px;">Orion AI</strong>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align: middle; text-align: right;" width="50%">
                        <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 13px; padding: 0 6px;">Twitter</a>
                        <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 13px; padding: 0 6px;">LinkedIn</a>
                        <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 13px; padding: 0 6px;">Discord</a>
                      </td>
                    </tr>
                  </table>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border-top: 1px solid rgba(148, 163, 184, 0.1); padding-top: 20px;" role="presentation">
                    <tr>
                      <td align="center">
                        <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">
                          © ${new Date().getFullYear()} Orion AI. Todos los derechos reservados.
                        </p>
                        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;" role="presentation">
                          <tr>
                            <td style="padding: 0 8px;">
                              <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 11px;">Política de Privacidad</a>
                            </td>
                            <td style="padding: 0 8px; color: #64748b;">•</td>
                            <td style="padding: 0 8px;">
                              <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 11px;">Términos de Servicio</a>
                            </td>
                            <td style="padding: 0 8px; color: #64748b;">•</td>
                            <td style="padding: 0 8px;">
                              <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 11px;">Cancelar Suscripción</a>
                            </td>
                          </tr>
                        </table>
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
//# sourceMappingURL=email_templates.js.map