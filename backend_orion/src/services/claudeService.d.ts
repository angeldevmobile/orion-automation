type TextBlock = {
    type: 'text';
    text: string;
};
type ImageBlock = {
    type: 'image';
    source: {
        type: 'base64';
        media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
        data: string;
    };
};
export type MessageContent = string | Array<TextBlock | ImageBlock>;
export interface ClaudeMessage {
    role: 'user' | 'assistant';
    content: MessageContent;
}
export declare class ClaudeService {
    sendMessage(messages: ClaudeMessage[], systemPrompt?: string): Promise<string>;
    sendMessageWithContext(messages: ClaudeMessage[], projectContext?: string): Promise<string>;
}
export {};
//# sourceMappingURL=claudeService.d.ts.map