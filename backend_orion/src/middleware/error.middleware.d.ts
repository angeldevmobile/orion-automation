import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
export declare class ApiError extends Error {
    statusCode: number;
    code: string | undefined;
    constructor(statusCode: number, message: string, code?: string);
}
export declare const errorHandler: (err: Error | ApiError | Prisma.PrismaClientKnownRequestError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const notFound: (resource?: string) => ApiError;
export declare const unauthorized: (message?: string) => ApiError;
export declare const forbidden: (message?: string) => ApiError;
export declare const badRequest: (message?: string) => ApiError;
export declare const conflict: (message?: string) => ApiError;
export declare const serverError: (message?: string) => ApiError;
//# sourceMappingURL=error.middleware.d.ts.map