import React from "react";

interface PasswordResetEmailProps {
	resetUrl: string;
	userEmail: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
	resetUrl,
	userEmail,
}) => {
	return (
		<html>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Orion AI - Recuperar Contraseña</title>
				<style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          .hover-button:hover {
            background: linear-gradient(135deg, #5b6ce8 0%, #6b4ba0 100%) !important;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(91, 108, 232, 0.4) !important;
          }
        `}</style>
			</head>
			<body
				style={{
					margin: 0,
					padding: 0,
					fontFamily:
						"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
					background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
					minHeight: "100vh",
				}}>
				{/* Main Container */}
				<table
					width="100%"
					cellPadding="0"
					cellSpacing="0"
					style={{ padding: "40px 20px" }}>
					<tr>
						<td align="center">
							{/* Email Card */}
							<table
								width="600"
								cellPadding="0"
								cellSpacing="0"
								style={{
									backgroundColor: "#ffffff",
									borderRadius: "20px",
									boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
									overflow: "hidden",
									border: "1px solid rgba(255, 255, 255, 0.2)",
								}}>
								{/* Header with Logo and Branding */}
								<tr>
									<td
										style={{
											background:
												"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
											padding: "50px 40px",
											textAlign: "center",
											position: "relative",
										}}>
										{/* Orion AI Logo with GIF */}
										<div style={{ position: "relative", zIndex: 2 }}>
											<div
												style={{
													display: "inline-block",
													background: "rgba(255, 255, 255, 0.15)",
													backdropFilter: "blur(20px)",
													padding: "20px",
													borderRadius: "20px",
													marginBottom: "30px",
													border: "1px solid rgba(255, 255, 255, 0.2)",
												}}>
												<img
													src="https://i.imgur.com/UEILzli.gif"
													alt="🌟 Orion AI"
													style={{
														width: "60px",
														height: "60px",
														borderRadius: "10px",
														display: "block",
													}}
													onError={(e) => {
														e.currentTarget.style.display = "none";
														(e.currentTarget.nextElementSibling as HTMLElement)!.style.display =
															"block";
													}}
												/>
												{/* Fallback emoji */}
												<div
													style={{
														display: "none",
														width: "60px",
														height: "60px",
														lineHeight: "60px",
														fontSize: "40px",
														textAlign: "center",
													}}>
													🌟
												</div>
											</div>

											<h1
												style={{
													margin: "0 0 10px",
													color: "#ffffff",
													fontSize: "36px",
													fontWeight: "700",
													letterSpacing: "-0.5px",
												}}>
												Orion AI
											</h1>
											<p
												style={{
													margin: 0,
													color: "rgba(255, 255, 255, 0.9)",
													fontSize: "16px",
													fontWeight: "400",
												}}>
												Inteligencia Artificial Avanzada
											</p>
										</div>
									</td>
								</tr>

								{/* Security Badge */}
								<tr>
									<td style={{ padding: 0, textAlign: "center" }}>
										<div
											style={{
												background: "linear-gradient(90deg, #10b981, #059669)",
												color: "white",
												padding: "15px 30px",
												margin: "-10px 40px 0",
												borderRadius: "50px",
												display: "inline-block",
												fontSize: "14px",
												fontWeight: "600",
												boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
											}}>
											🔒 Solicitud de Recuperación Segura
										</div>
									</td>
								</tr>

								{/* Main Content */}
								<tr>
									<td style={{ padding: "50px 40px" }}>
										{/* Greeting */}
										<div style={{ textAlign: "center", marginBottom: "40px" }}>
											<h2
												style={{
													margin: "0 0 15px",
													color: "#1f2937",
													fontSize: "28px",
													fontWeight: "700",
												}}>
												¡Hola!
											</h2>
											<p
												style={{
													margin: 0,
													color: "#6b7280",
													fontSize: "16px",
													lineHeight: "1.6",
												}}>
												Recibimos una solicitud para restablecer tu contraseña
											</p>
										</div>

										{/* User Info Card */}
										<div
											style={{
												background:
													"linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
												border: "1px solid #e2e8f0",
												borderRadius: "16px",
												padding: "25px",
												marginBottom: "35px",
												textAlign: "center",
											}}>
											<div
												style={{
													display: "inline-block",
													background: "#667eea",
													color: "white",
													width: "50px",
													height: "50px",
													borderRadius: "50%",
													lineHeight: "50px",
													fontSize: "20px",
													fontWeight: "700",
													marginBottom: "15px",
												}}>
												{userEmail.charAt(0).toUpperCase()}
											</div>
											<p
												style={{
													margin: 0,
													color: "#374151",
													fontSize: "16px",
													fontWeight: "600",
												}}>
												{userEmail}
											</p>
										</div>

										{/* CTA Button */}
										<div style={{ textAlign: "center", margin: "40px 0" }}>
											<table width="100%" cellPadding="0" cellSpacing="0">
												<tr>
													<td align="center">
														<a
															href={resetUrl}
															className="hover-button"
															style={{
																display: "inline-block",
																background:
																	"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
																color: "#ffffff",
																textDecoration: "none",
																padding: "18px 45px",
																borderRadius: "50px",
																fontSize: "16px",
																fontWeight: "600",
																boxShadow:
																	"0 10px 30px rgba(102, 126, 234, 0.4)",
																transition: "all 0.3s ease",
																border: "2px solid rgba(255, 255, 255, 0.1)",
															}}>
															🔐 Restablecer mi Contraseña
														</a>
													</td>
												</tr>
											</table>
										</div>

										{/* Alternative Link */}
										<div style={{ margin: "35px 0" }}>
											<p
												style={{
													margin: "0 0 15px",
													color: "#6b7280",
													fontSize: "14px",
													textAlign: "center",
												}}>
												¿Tienes problemas con el botón? Usa este enlace:
											</p>
											<div
												style={{
													background: "#f8fafc",
													border: "2px dashed #e2e8f0",
													borderRadius: "12px",
													padding: "20px",
													wordBreak: "break-all",
													textAlign: "center",
												}}>
												<a
													href={resetUrl}
													style={{
														color: "#667eea",
														textDecoration: "none",
														fontSize: "14px",
														fontWeight: "500",
													}}>
													{resetUrl}
												</a>
											</div>
										</div>

										{/* Security Warning */}
										<div
											style={{
												background:
													"linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
												border: "2px solid #f59e0b",
												borderRadius: "16px",
												padding: "25px",
												marginTop: "35px",
											}}>
											<div
												style={{ textAlign: "center", marginBottom: "15px" }}>
												⚠️
											</div>
											<h3
												style={{
													margin: "0 0 10px",
													color: "#92400e",
													fontSize: "18px",
													fontWeight: "700",
													textAlign: "center",
												}}>
												Importante
											</h3>
											<p
												style={{
													margin: 0,
													color: "#92400e",
													fontSize: "14px",
													lineHeight: "1.6",
													textAlign: "center",
												}}>
												Este enlace <strong>expirará en 1 hora</strong> por
												seguridad. Si no solicitaste este cambio, ignora este
												correo y tu cuenta permanecerá segura.
											</p>
										</div>

										{/* Help Section */}
										<div
											style={{
												textAlign: "center",
												marginTop: "40px",
												paddingTop: "30px",
												borderTop: "1px solid #e5e7eb",
											}}>
											<p
												style={{
													margin: "0 0 15px",
													color: "#6b7280",
													fontSize: "14px",
												}}>
												¿Necesitas ayuda? Contáctanos
											</p>
											<a
												href="mailto:support@orion-ai.com"
												style={{
													color: "#667eea",
													textDecoration: "none",
													fontSize: "14px",
													fontWeight: "600",
												}}>
												support@orion-ai.com
											</a>
										</div>
									</td>
								</tr>

								{/* Footer */}
								<tr>
									<td
										style={{
											background:
												"linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
											padding: "40px",
											textAlign: "center",
											borderTop: "1px solid #e2e8f0",
										}}>
										<div
											style={{
												borderTop: "1px solid #d1d5db",
												paddingTop: "25px",
											}}>
											<p
												style={{
													margin: "0 0 10px",
													color: "#6b7280",
													fontSize: "14px",
													fontWeight: "600",
												}}>
												© {new Date().getFullYear()} Orion AI - Tecnología del
												Futuro
											</p>
											<p
												style={{
													margin: 0,
													color: "#9ca3af",
													fontSize: "12px",
												}}>
												Este correo fue generado automáticamente por nuestro
												sistema de seguridad.
											</p>
											<p
												style={{
													margin: "10px 0 0",
													color: "#9ca3af",
													fontSize: "12px",
												}}>
												Orion AI Labs • Perú, Lima
											</p>
										</div>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</body>
		</html>
	);
};
