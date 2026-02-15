import { simpleGit } from 'simple-git';
import type { SimpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';

export class GitHubService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  /**
   * Clona un repositorio de GitHub
   */
  async cloneRepository(repoUrl: string, projectId: string): Promise<string> {
    try {
      // Validar URL
      if (!this.isValidGitUrl(repoUrl)) {
        throw new Error('URL de repositorio inválida');
      }

      // Crear directorio de destino
      const uploadsDir = path.join(process.cwd(), 'uploads', 'projects', projectId);
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const cloneDir = path.join(uploadsDir, 'repository');

      // Si ya existe, eliminar
      if (fs.existsSync(cloneDir)) {
        fs.rmSync(cloneDir, { recursive: true, force: true });
      }

      console.log(`Clonando repositorio: ${repoUrl} -> ${cloneDir}`);

      // Clonar repositorio (shallow clone para ser más rápido)
      await this.git.clone(repoUrl, cloneDir, ['--depth', '1']);

      // Eliminar .git para ahorrar espacio
      const gitDir = path.join(cloneDir, '.git');
      if (fs.existsSync(gitDir)) {
        fs.rmSync(gitDir, { recursive: true, force: true });
      }

      // Contar archivos clonados
      const fileCount = this.countFiles(cloneDir);

      console.log(`Repositorio clonado exitosamente. Archivos: ${fileCount}`);

      return cloneDir;
    } catch (error) {
      console.error('Error cloning repository:', error);
      throw new Error(
        `Error al clonar repositorio: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Valida si la URL es de GitHub, GitLab o Bitbucket
   */
  private isValidGitUrl(url: string): boolean {
    const gitUrlPatterns = [
      /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/,
      /^https:\/\/gitlab\.com\/[\w-]+\/[\w.-]+$/,
      /^https:\/\/bitbucket\.org\/[\w-]+\/[\w.-]+$/,
      /^git@github\.com:[\w-]+\/[\w.-]+\.git$/,
      /^git@gitlab\.com:[\w-]+\/[\w.-]+\.git$/,
    ];

    return gitUrlPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Cuenta archivos recursivamente (excluyendo node_modules, etc.)
   */
  private countFiles(dir: string): number {
    let count = 0;

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);

      // Excluir directorios no deseados
      if (
        item === 'node_modules' ||
        item === '.git' ||
        item === 'dist' ||
        item === 'build' ||
        item === '.next'
      ) {
        continue;
      }

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        count += this.countFiles(fullPath);
      } else {
        count++;
      }
    }

    return count;
  }

  /**
   * Obtiene información del repositorio desde la URL
   */
  extractRepoInfo(repoUrl: string): { owner: string; repo: string } | null {
    const githubMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
    if (githubMatch) {
      return { owner: githubMatch[1], repo: githubMatch[2] };
    }

    const gitlabMatch = repoUrl.match(/gitlab\.com\/([^/]+)\/([^/.]+)/);
    if (gitlabMatch) {
      return { owner: gitlabMatch[1], repo: gitlabMatch[2] };
    }

    return null;
  }
}