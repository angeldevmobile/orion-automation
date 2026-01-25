import { prisma } from '../../config/database.js';
import type { CodeIndex } from './codeScanner.js';
import type { Prisma } from '@prisma/client';

export class CodeIndexService {
  async save(projectId: string, index: CodeIndex): Promise<void> {
    index.projectId = projectId;

    await prisma.codeIndex.upsert({
      where: { projectId },
      create: {
        projectId,
        indexData: index as unknown as Prisma.InputJsonValue,
        version: 1
      },
      update: {
        indexData: index as unknown as Prisma.InputJsonValue,
        version: { increment: 1 },
        updatedAt: new Date()
      }
    });

    console.log(`✅ Code index saved for project ${projectId}`);
  }

  async get(projectId: string): Promise<CodeIndex | null> {
    const record = await prisma.codeIndex.findUnique({
      where: { projectId }
    });

    if (!record) return null;

    return record.indexData as unknown as CodeIndex;
  }

  async shouldReindex(projectId: string, maxAgeMinutes = 60): Promise<boolean> {
    const record = await prisma.codeIndex.findUnique({
      where: { projectId },
      select: { updatedAt: true }
    });

    if (!record) return true;

    const ageMinutes = (Date.now() - record.updatedAt.getTime()) / 1000 / 60;
    return ageMinutes > maxAgeMinutes;
  }
}