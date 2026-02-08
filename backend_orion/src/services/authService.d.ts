interface RegisterData {
    email: string;
    password: string;
    fullName?: string;
}
interface LoginData {
    email: string;
    password: string;
}
export declare class AuthService {
    private emailService;
    constructor();
    register(data: RegisterData): Promise<{
        user: {
            id: string;
            email: string;
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                fullName: string | null;
                avatarUrl: string | null;
                company: string | null;
                jobTitle: string | null;
            };
            roles: string[];
        };
        token: string;
    }>;
    login(data: LoginData): Promise<{
        user: {
            id: string;
            email: string;
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                fullName: string | null;
                avatarUrl: string | null;
                company: string | null;
                jobTitle: string | null;
            };
            roles: string[];
        };
        token: string;
    }>;
    private generateToken;
    verifyToken(token: string): Promise<{
        id: string;
        email: string;
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            fullName: string | null;
            avatarUrl: string | null;
            company: string | null;
            jobTitle: string | null;
        };
        roles: string[];
    }>;
    private getUserNameFromEmail;
    requestPasswordReset(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
//# sourceMappingURL=authService.d.ts.map