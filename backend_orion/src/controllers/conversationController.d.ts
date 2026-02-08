import type { Request, Response } from 'express';
export declare const uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare class ConversationsController {
    getUserConversations(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getConversationById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createConversation(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    sendMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    addMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateConversation(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteConversation(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=conversationController.d.ts.map