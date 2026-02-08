import type { Prisma } from '@prisma/client';
interface CreateProjectData {
    name: string;
    description?: string;
    type: string;
    settings?: Prisma.InputJsonValue;
}
interface ProjectSourceData {
    sourceType: string;
    sourceName: string;
    sourceUrl?: string;
    branch?: string;
    accessToken?: string;
    metadata?: Prisma.InputJsonValue;
}
export declare class ProjectsService {
    getUserProjects(userId: string): Promise<({
        _count: {
            conversations: number;
            projectSources: number;
            analyses: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        description: string | null;
        type: string;
        fileCount: number;
        issuesFound: number;
        lastAnalysisAt: Date | null;
        settings: Prisma.JsonValue;
    })[]>;
    getProjectById(id: string, userId: string): Promise<{
        _count: {
            conversations: number;
            analyses: number;
        };
        projectSources: {
            id: string;
            createdAt: Date;
            projectId: string;
            metadata: Prisma.JsonValue;
            sourceType: string;
            sourceName: string;
            sourceUrl: string | null;
            branch: string | null;
            accessToken: string | null;
            syncStatus: string;
            lastSyncedAt: Date | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        description: string | null;
        type: string;
        fileCount: number;
        issuesFound: number;
        lastAnalysisAt: Date | null;
        settings: Prisma.JsonValue;
    }>;
    createProject(userId: string, data: CreateProjectData): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        description: string | null;
        type: string;
        fileCount: number;
        issuesFound: number;
        lastAnalysisAt: Date | null;
        settings: Prisma.JsonValue;
    }>;
    updateProject(id: string, userId: string, data: Partial<CreateProjectData>): Promise<{
        success: boolean;
    }>;
    deleteProject(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    addProjectSource(projectId: string, userId: string, data: ProjectSourceData): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        metadata: Prisma.JsonValue;
        sourceType: string;
        sourceName: string;
        sourceUrl: string | null;
        branch: string | null;
        accessToken: string | null;
        syncStatus: string;
        lastSyncedAt: Date | null;
    }>;
    uploadProjectFiles(projectId: string, userId: string, files: Express.Multer.File[]): Promise<any[]>;
    getProjectFiles(projectId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        metadata: Prisma.JsonValue;
        sourceType: string;
        sourceName: string;
        sourceUrl: string | null;
        branch: string | null;
        accessToken: string | null;
        syncStatus: string;
        lastSyncedAt: Date | null;
    }[]>;
    deleteProjectFile(fileId: string, projectId: string, userId: string): Promise<{
        success: boolean;
    }>;
    getProjectStats(id: string, userId: string): Promise<{
        projectId: string;
        name: string;
        conversationsCount: number;
        analysesCount: number;
        sourcesCount: number;
        actionsCount: number;
        totalTokensUsed: number;
        avgAnalysisDuration: number;
        fileCount: number;
        issuesFound: number;
        lastAnalysisAt: Date;
    }>;
}
export {};
//# sourceMappingURL=projectService.d.ts.map