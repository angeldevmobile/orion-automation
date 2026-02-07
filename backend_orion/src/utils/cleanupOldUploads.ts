import * as fs from 'fs/promises';
import * as path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const MAX_AGE_HOURS = 24;

export async function cleanupOldUploads(): Promise<void> {
  try {
    const entries = await fs.readdir(UPLOADS_DIR, { withFileTypes: true });
    const now = Date.now();
    const maxAge = MAX_AGE_HOURS * 60 * 60 * 1000;
    let cleaned = 0;

    for (const entry of entries) {
      const fullPath = path.join(UPLOADS_DIR, entry.name);
      const stat = await fs.stat(fullPath);

      if (now - stat.mtimeMs > maxAge) {
        if (entry.isDirectory()) {
          await fs.rm(fullPath, { recursive: true, force: true });
        } else {
          await fs.unlink(fullPath);
        }
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[Cleanup] Eliminados ${cleaned} archivos antiguos`);
    }
  } catch (error) {
    console.error('[Cleanup] Error:', error);
  }
}

export function startCleanupScheduler(): void {
  setInterval(cleanupOldUploads, 6 * 60 * 60 * 1000);
  console.log('[Cleanup] Scheduler iniciado (cada 6 horas)');
}