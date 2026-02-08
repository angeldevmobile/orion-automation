import { prisma } from '../../config/database.js';
export class CodeIndexService {
    async save(projectId, index) {
        index.projectId = projectId;
        await prisma.codeIndex.upsert({
            where: { projectId },
            create: {
                projectId,
                indexData: index,
                version: 1
            },
            update: {
                indexData: index,
                version: { increment: 1 },
                updatedAt: new Date()
            }
        });
        console.log(`Code index saved for project ${projectId}`);
    }
    async get(projectId) {
        const record = await prisma.codeIndex.findUnique({
            where: { projectId }
        });
        if (!record)
            return null;
        return record.indexData;
    }
    async shouldReindex(projectId, maxAgeMinutes = 60) {
        const record = await prisma.codeIndex.findUnique({
            where: { projectId },
            select: { updatedAt: true }
        });
        if (!record)
            return true;
        const ageMinutes = (Date.now() - record.updatedAt.getTime()) / 1000 / 60;
        return ageMinutes > maxAgeMinutes;
    }
}
//# sourceMappingURL=codeIndexService.js.map