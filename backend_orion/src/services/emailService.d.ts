interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare class EmailService {
    private transporter;
    constructor();
    sendEmail(options: EmailOptions): Promise<{
        success: boolean;
    }>;
    sendPasswordResetEmail(email: string, resetToken: string, htmlContent: string): Promise<{
        success: boolean;
    }>;
}
export {};
//# sourceMappingURL=emailService.d.ts.map