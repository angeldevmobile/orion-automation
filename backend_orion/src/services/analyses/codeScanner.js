import fs from 'fs/promises';
import path from 'path';
export class CodeScannerService {
    EXCLUDED_PATTERNS = [
        'node_modules',
        'dist',
        'build',
        '.git',
        'coverage',
        '.next',
        '.nuxt'
    ];
    async scanProject(sources) {
        const startTime = Date.now();
        const filteredSources = this.filterRelevantFiles(sources);
        const index = {
            projectId: '',
            timestamp: new Date(),
            stats: {
                totalFiles: 0,
                totalLines: 0,
                languages: {}
            },
            structure: {
                controllers: [],
                services: [],
                routes: [],
                models: [],
                utils: [],
                configs: []
            },
            dependencies: {
                runtime: [],
                dev: []
            },
            riskSignals: [],
            complexity: {
                avgFileSize: 0,
                maxFileSize: 0,
                deepestNesting: 0
            }
        };
        const fileSizes = [];
        let totalLines = 0;
        for (const source of filteredSources) {
            try {
                if (!source.sourceUrl)
                    continue;
                const content = await fs.readFile(source.sourceUrl, 'utf-8');
                const lines = content.split('\n').length;
                const fileSize = content.length;
                totalLines += lines;
                fileSizes.push(fileSize);
                // Detectar lenguaje
                const ext = path.extname(source.sourceName);
                index.stats.languages[ext] = (index.stats.languages[ext] || 0) + 1;
                // Clasificar archivo por estructura
                this.classifyFile(source.sourceName, index.structure);
                // Detectar dependencias (solo package.json)
                if (source.sourceName === 'package.json') {
                    await this.extractDependencies(content, index.dependencies);
                }
                // Detectar señales de riesgo
                this.detectRiskSignals(source.sourceName, content, index.riskSignals);
            }
            catch (error) {
                console.error(`Error scanning ${source.sourceName}:`, error);
            }
        }
        index.stats.totalFiles = filteredSources.length;
        index.stats.totalLines = totalLines;
        index.complexity.avgFileSize = fileSizes.length > 0
            ? Math.round(fileSizes.reduce((a, b) => a + b, 0) / fileSizes.length)
            : 0;
        index.complexity.maxFileSize = Math.max(...fileSizes, 0);
        const scanDuration = Date.now() - startTime;
        console.log(`✅ Code scan completed in ${scanDuration}ms`);
        console.log(`   Files: ${index.stats.totalFiles}, Lines: ${totalLines}`);
        return index;
    }
    filterRelevantFiles(sources) {
        return sources.filter(source => {
            const name = source.sourceName.toLowerCase();
            if (this.EXCLUDED_PATTERNS.some(pattern => name.includes(pattern))) {
                return false;
            }
            if (name.match(/\.(min|map|lock)$/))
                return false;
            if (name.match(/\.(css|scss|svg|png|jpg|jpeg|gif|ico)$/))
                return false;
            return true;
        });
    }
    classifyFile(filename, structure) {
        const lower = filename.toLowerCase();
        if (lower.includes('controller'))
            structure.controllers.push(filename);
        else if (lower.includes('service'))
            structure.services.push(filename);
        else if (lower.includes('route'))
            structure.routes.push(filename);
        else if (lower.includes('model') || lower.includes('schema'))
            structure.models.push(filename);
        else if (lower.includes('util') || lower.includes('helper'))
            structure.utils.push(filename);
        else if (lower.includes('config') || lower === 'package.json')
            structure.configs.push(filename);
    }
    async extractDependencies(packageJsonContent, deps) {
        try {
            const pkg = JSON.parse(packageJsonContent);
            deps.runtime = Object.keys(pkg.dependencies || {});
            deps.dev = Object.keys(pkg.devDependencies || {});
        }
        catch (error) {
            console.error('Error parsing package.json:', error);
        }
    }
    detectRiskSignals(filename, content, signals) {
        // Operaciones async sin await
        if (content.match(/async\s+function[^{]+{[^}]*(?<!await)/)) {
            signals.push(`Async function without await in ${filename}`);
        }
        // Llamadas secuenciales a APIs
        if (content.match(/await.*\n.*await.*\n.*await/)) {
            signals.push(`Sequential API calls detected in ${filename}`);
        }
        // Contraseñas hardcodeadas
        if (content.match(/(password|secret|api[_-]?key)\s*[:=]\s*["'][^"']+["']/i)) {
            signals.push(`Hardcoded credentials in ${filename}`);
        }
        // Try-catch vacíos
        if (content.match(/catch\s*\([^)]*\)\s*{\s*}/)) {
            signals.push(`Empty catch blocks in ${filename}`);
        }
        // Funciones muy largas (>100 líneas)
        const functionMatches = content.match(/function[^{]*{/g);
        if (functionMatches && functionMatches.length > 0) {
            const lines = content.split('\n');
            if (lines.length > 100) {
                signals.push(`Very long file (${lines.length} lines) in ${filename}`);
            }
        }
    }
}
//# sourceMappingURL=codeScanner.js.map