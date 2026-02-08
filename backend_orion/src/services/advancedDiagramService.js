import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import pako from 'pako';
import puppeteer from 'puppeteer';
export class AdvancedDiagramService {
    /**
     * Genera diagrama usando Kroki con Mermaid (PNG de alta calidad)
     */
    async generateMermaidImage(mermaidCode, outputPath, format = 'png') {
        try {
            const compressed = pako.deflate(mermaidCode, { level: 9 });
            const encoded = Buffer.from(compressed)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_');
            const url = `https://kroki.io/mermaid/${format}/${encoded}`;
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 10000,
            });
            await fs.writeFile(outputPath, response.data);
            console.log(`Diagrama Mermaid generado: ${outputPath}`);
        }
        catch (error) {
            console.error('Error generando diagrama Mermaid con Kroki:', error);
            await this.generateMermaidInk(mermaidCode, outputPath);
        }
    }
    /**
     * Fallback: Mermaid.ink (método alternativo)
     */
    async generateMermaidInk(mermaidCode, outputPath) {
        try {
            const encoded = Buffer.from(mermaidCode).toString('base64');
            const url = `https://mermaid.ink/img/${encoded}`;
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 10000,
            });
            await fs.writeFile(outputPath, response.data);
            console.log(`Diagrama Mermaid.ink generado: ${outputPath}`);
        }
        catch (error) {
            console.error('Error generando diagrama Mermaid.ink:', error);
            throw new Error('No se pudo generar el diagrama Mermaid');
        }
    }
    /**
     * Genera diagrama profesional usando D2 (con iconos y estilo avanzado)
     */
    async generateD2Diagram(d2Code, outputPath, format = 'png') {
        try {
            const compressed = pako.deflate(d2Code, { level: 9 });
            const encoded = Buffer.from(compressed)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_');
            const url = `https://kroki.io/d2/${format}/${encoded}`;
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 15000,
            });
            await fs.writeFile(outputPath, response.data);
            console.log(`Diagrama D2 generado: ${outputPath}`);
        }
        catch (error) {
            console.error('Error generando diagrama D2:', error);
            throw new Error('No se pudo generar el diagrama D2');
        }
    }
    /**
     * Genera diagrama usando PlantUML (alternativa adicional)
     */
    async generatePlantUMLDiagram(plantUMLCode, outputPath, format = 'png') {
        try {
            const compressed = pako.deflate(plantUMLCode, { level: 9 });
            const encoded = Buffer.from(compressed)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_');
            const url = `https://kroki.io/plantuml/${format}/${encoded}`;
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 12000,
            });
            await fs.writeFile(outputPath, response.data);
            console.log(`Diagrama PlantUML generado: ${outputPath}`);
        }
        catch (error) {
            console.error('Error generando diagrama PlantUML:', error);
            throw error;
        }
    }
    // ═══════════════════════════════════════════════════════
    // ISOFLOW — Renderizado isométrico real + PNG
    // ═══════════════════════════════════════════════════════
    /**
     * Guarda modelo Isoflow como JSON (importable por FossFLOW)
     */
    async saveIsoflowModel(model, outputPath) {
        await fs.writeFile(outputPath, JSON.stringify(model, null, 2), 'utf-8');
        console.log(`Modelo Isoflow JSON guardado: ${outputPath}`);
    }
    /**
     * Genera HTML con Isoflow embebido (React + @isoflow/isopacks)
     * Este HTML renderiza un diagrama isométrico REAL
     */
    async generateIsoflowHTML(model, outputPath) {
        const html = this.buildIsoflowHTML(model);
        await fs.writeFile(outputPath, html, 'utf-8');
        console.log(`Isoflow HTML generado: ${outputPath}`);
    }
    /**
     * Genera imagen PNG del diagrama isométrico
     * Usa Puppeteer para renderizar el HTML de Isoflow y capturar screenshot
     */
    async generateIsoflowImage(model, outputPath, options = {}) {
        const { width = 1920, height = 1080, format = 'png', quality = 100, } = options;
        const html = this.buildIsoflowHTML(model);
        let browser;
        try {
            console.log('Iniciando Puppeteer para renderizar Isoflow...');
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                ],
            });
            const page = await browser.newPage();
            await page.setViewport({ width, height, deviceScaleFactor: 2 });
            // Cargar el HTML directamente
            await page.setContent(html, {
                waitUntil: 'networkidle0',
                timeout: 30000,
            });
            // Esperar a que el canvas se renderice
            await page.waitForSelector('#iso-render-complete', { timeout: 15000 }).catch(() => {
                console.log('Timeout esperando render completo, capturando igualmente...');
            });
            // Espera extra para animaciones
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Capturar screenshot
            const screenshotOptions = {
                path: outputPath,
                type: format,
                fullPage: false,
                clip: { x: 0, y: 0, width, height },
                ...(format === 'jpeg' ? { quality } : {}),
            };
            await page.screenshot(screenshotOptions);
            console.log(`Diagrama isométrico PNG generado: ${outputPath}`);
        }
        catch (error) {
            console.error('Error generando imagen Isoflow:', error);
            // Fallback: guardar el HTML
            const htmlFallbackPath = outputPath.replace(/\.(png|jpeg|jpg)$/, '.html');
            await fs.writeFile(htmlFallbackPath, html, 'utf-8');
            console.log(`Fallback: HTML guardado en ${htmlFallbackPath}`);
            throw new Error(`No se pudo generar la imagen isométrica: ${error}`);
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    /**
     * Construye el HTML completo que renderiza Isoflow con React
     * Usa CDN para React + renderizado isométrico con canvas
     */
    buildIsoflowHTML(model) {
        // Mapeo de iconos a emojis/SVG para el renderizado isométrico
        const ICON_SVG = {
            person: { emoji: '👤', color: '#1976d2' },
            browser: { emoji: '🖥️', color: '#5c6bc0' },
            server: { emoji: '⚙️', color: '#7b1fa2' },
            database: { emoji: '🗄️', color: '#388e3c' },
            cloud: { emoji: '☁️', color: '#0277bd' },
            queue: { emoji: '📨', color: '#f57c00' },
            lock: { emoji: '🔐', color: '#c62828' },
            cache: { emoji: '⚡', color: '#f9a825' },
            lambda: { emoji: 'λ', color: '#ff6f00' },
            cdn: { emoji: '🌐', color: '#00838f' },
            loadbalancer: { emoji: '⚖️', color: '#4527a0' },
            firewall: { emoji: '🛡️', color: '#bf360c' },
            storage: { emoji: '💾', color: '#2e7d32' },
            microservice: { emoji: '🔷', color: '#283593' },
            container: { emoji: '📦', color: '#4e342e' },
        };
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${model.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      background: linear-gradient(145deg, #0a0a1a 0%, #1a1a3e 50%, #0d1b2a 100%);
      min-height: 100vh;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      overflow: hidden;
    }
    
    /* Header */
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      padding: 16px 32px;
      background: rgba(10, 10, 26, 0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .header h1 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #e0e0ff;
      letter-spacing: 0.5px;
    }
    
    .header .badge {
      font-size: 0.65rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: #fff;
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 600;
    }
    
    /* Canvas isométrico */
    .iso-viewport {
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: auto;
    }
    
    .iso-world {
      position: relative;
      min-width: 2000px;
      min-height: 1400px;
      /* Transformación isométrica real */
      transform-origin: center center;
    }
    
    /* Grid isométrico de fondo */
    .iso-grid {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }
    
    /* Grupos / Regiones */
    .iso-region {
      position: absolute;
      border-radius: 20px;
      border: 1.5px solid rgba(255,255,255,0.1);
      padding: 16px;
      transition: box-shadow 0.3s;
    }
    
    .iso-region:hover {
      box-shadow: 0 0 40px rgba(102, 126, 234, 0.15);
    }
    
    .iso-region-label {
      font-size: 0.6rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(255,255,255,0.4);
      margin-bottom: 8px;
    }
    
    /* Nodos isométricos 3D */
    .iso-node {
      position: absolute;
      width: 130px;
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s;
      filter: drop-shadow(0 6px 20px rgba(0,0,0,0.4));
      z-index: 10;
    }
    
    .iso-node:hover {
      transform: translateY(-8px) scale(1.08);
      filter: drop-shadow(0 12px 35px rgba(102, 126, 234, 0.3));
      z-index: 20;
    }
    
    /* Cara superior del cubo isométrico */
    .iso-cube {
      position: relative;
      width: 130px;
      height: 100px;
      transform: rotateX(55deg) rotateZ(-45deg);
      transform-style: preserve-3d;
    }
    
    /* Versión simplificada: tarjeta con perspectiva isométrica */
    .iso-card {
      position: relative;
      width: 130px;
      background: linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05));
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 14px;
      padding: 14px 10px;
      text-align: center;
      backdrop-filter: blur(10px);
      transform: perspective(800px) rotateX(10deg) rotateY(-5deg);
      transition: transform 0.3s;
    }
    
    .iso-node:hover .iso-card {
      transform: perspective(800px) rotateX(5deg) rotateY(-2deg);
    }
    
    .iso-card::before {
      content: '';
      position: absolute;
      top: -1px; left: -1px; right: -1px; bottom: -1px;
      border-radius: 14px;
      padding: 1px;
      background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent, rgba(255,255,255,0.1));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }
    
    /* Acento de color en la parte superior */
    .iso-card .color-bar {
      position: absolute;
      top: 0;
      left: 12px;
      right: 12px;
      height: 3px;
      border-radius: 0 0 4px 4px;
    }
    
    .iso-card .icon {
      font-size: 2rem;
      margin-bottom: 6px;
      display: block;
    }
    
    .iso-card .label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #e0e0ff;
      line-height: 1.3;
      margin-bottom: 3px;
    }
    
    .iso-card .desc {
      font-size: 0.58rem;
      color: rgba(255,255,255,0.45);
      line-height: 1.3;
    }
    
    .iso-card .type-pill {
      display: inline-block;
      font-size: 0.5rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 2px 8px;
      border-radius: 6px;
      margin-top: 6px;
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.5);
    }
    
    /* Tooltip */
    .iso-tooltip {
      display: none;
      position: absolute;
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(10, 10, 30, 0.95);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 10px;
      padding: 10px 14px;
      min-width: 180px;
      z-index: 50;
      backdrop-filter: blur(20px);
    }
    
    .iso-node:hover .iso-tooltip {
      display: block;
    }
    
    .iso-tooltip .tt-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #e0e0ff;
      margin-bottom: 4px;
    }
    
    .iso-tooltip .tt-desc {
      font-size: 0.65rem;
      color: rgba(255,255,255,0.6);
    }
    
    /* SVG Edges */
    svg.edge-layer {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 5;
    }
    
    .edge-label {
      font-size: 9px;
      fill: rgba(255,255,255,0.5);
      font-family: 'Segoe UI', sans-serif;
      font-weight: 600;
    }
    
    .edge-label-bg {
      fill: rgba(10, 10, 26, 0.8);
      rx: 4;
    }
    
    /* Metadata footer */
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 8px 32px;
      background: rgba(10, 10, 26, 0.7);
      backdrop-filter: blur(10px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.6rem;
      color: rgba(255,255,255,0.25);
      z-index: 100;
    }
    
    .footer .stats span {
      margin-right: 16px;
    }
    
    /* Animación de entrada */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .iso-node {
      animation: fadeInUp 0.6s ease-out backwards;
    }
    
    /* Glow animado para edges */
    @keyframes edgePulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    
    .edge-animated {
      animation: edgePulse 2s ease-in-out infinite;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>${model.name}</h1>
    <span class="badge">ISOMETRIC</span>
    <span class="badge" style="background: linear-gradient(135deg, #f093fb, #f5576c);">AI Generated</span>
  </div>

  <!-- Viewport -->
  <div class="iso-viewport">
    <div class="iso-world" id="world">
      <div class="iso-grid"></div>
      <!-- Nodes y edges se renderizan via JS -->
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="stats">
      <span>📦 ${model.nodes.length} components</span>
      <span>🔗 ${model.edges.length} connections</span>
      <span>📂 ${model.groups?.length || 0} layers</span>
    </div>
    <div>
      Generated by Orion AI • ${model.metadata?.generatedAt || new Date().toISOString()} • Powered by Isoflow
    </div>
  </div>

  <script>
    // ═══════ DATA ═══════
    const model = ${JSON.stringify(model)};
    
    const ICONS = ${JSON.stringify(ICON_SVG)};
    
    const GRID_X = 200;  // Espacio horizontal entre nodos
    const GRID_Y = 180;  // Espacio vertical entre nodos
    const OFFSET_X = 300; // Offset inicial X
    const OFFSET_Y = 200; // Offset inicial Y
    
    const world = document.getElementById('world');
    
    // ═══════ RENDER REGIONS (Groups) ═══════
    if (model.groups && model.groups.length > 0) {
      // Calcular bounds por grupo
      const groupBounds = {};
      model.groups.forEach(g => {
        groupBounds[g.id] = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
      });
      
      model.nodes.forEach(node => {
        if (node.group && groupBounds[node.group]) {
          const px = (node.position?.x || 0) * GRID_X + OFFSET_X;
          const py = (node.position?.y || 0) * GRID_Y + OFFSET_Y;
          const b = groupBounds[node.group];
          b.minX = Math.min(b.minX, px);
          b.minY = Math.min(b.minY, py);
          b.maxX = Math.max(b.maxX, px + 130);
          b.maxY = Math.max(b.maxY, py + 140);
        }
      });
      
      model.groups.forEach(group => {
        const b = groupBounds[group.id];
        if (b.minX === Infinity) return; // No nodes in group
        
        const padding = 30;
        const el = document.createElement('div');
        el.className = 'iso-region';
        el.style.left = (b.minX - padding) + 'px';
        el.style.top = (b.minY - padding - 20) + 'px';
        el.style.width = (b.maxX - b.minX + padding * 2) + 'px';
        el.style.height = (b.maxY - b.minY + padding * 2 + 20) + 'px';
        el.style.background = (group.style?.color || 'rgba(255,255,255,0.03)');
        el.style.opacity = '0.15';
        
        const label = document.createElement('div');
        label.className = 'iso-region-label';
        label.textContent = group.label;
        el.appendChild(label);
        
        world.appendChild(el);
      });
    }
    
    // ═══════ RENDER NODES ═══════
    const nodePositions = {};
    
    model.nodes.forEach((node, index) => {
      const x = (node.position?.x || 0) * GRID_X + OFFSET_X;
      const y = (node.position?.y || 0) * GRID_Y + OFFSET_Y;
      
      const iconDef = ICONS[node.icon] || ICONS[node.type] || { emoji: '📦', color: '#667eea' };
      const nodeColor = node.style?.color || iconDef.color;
      
      const el = document.createElement('div');
      el.className = 'iso-node';
      el.id = 'node-' + node.id;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.animationDelay = (index * 0.1) + 's';
      
      el.innerHTML = \`
        <div class="iso-card">
          <div class="color-bar" style="background: linear-gradient(90deg, \${nodeColor}, \${nodeColor}88);"></div>
          <span class="icon">\${iconDef.emoji}</span>
          <div class="label">\${node.label}</div>
          \${node.description ? '<div class="desc">' + node.description + '</div>' : ''}
          <div class="type-pill" style="color: \${nodeColor}; border: 1px solid \${nodeColor}33;">\${node.type}</div>
        </div>
        <div class="iso-tooltip">
          <div class="tt-title">\${node.label}</div>
          <div class="tt-desc">\${node.description || node.type}</div>
        </div>
      \`;
      
      world.appendChild(el);
      
      // Guardar posición central para edges
      nodePositions[node.id] = {
        x: x + 65,  // centro del nodo
        y: y + 60
      };
    });
    
    // ═══════ RENDER EDGES (SVG) ═══════
    requestAnimationFrame(() => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('edge-layer');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.width = world.scrollWidth + 'px';
      svg.style.height = world.scrollHeight + 'px';
      
      // Defs: markers y filtros
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      
      // Arrowhead marker
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'arrow');
      marker.setAttribute('markerWidth', '8');
      marker.setAttribute('markerHeight', '6');
      marker.setAttribute('refX', '8');
      marker.setAttribute('refY', '3');
      marker.setAttribute('orient', 'auto');
      const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arrowPath.setAttribute('d', 'M0,0 L8,3 L0,6 L2,3 Z');
      arrowPath.setAttribute('fill', 'rgba(255,255,255,0.4)');
      marker.appendChild(arrowPath);
      defs.appendChild(marker);
      
      // Glow filter
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', 'glow');
      const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      blur.setAttribute('stdDeviation', '2');
      blur.setAttribute('result', 'glow');
      filter.appendChild(blur);
      const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
      const mergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
      mergeNode1.setAttribute('in', 'glow');
      merge.appendChild(mergeNode1);
      const mergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
      mergeNode2.setAttribute('in', 'SourceGraphic');
      merge.appendChild(mergeNode2);
      filter.appendChild(merge);
      defs.appendChild(filter);
      
      svg.appendChild(defs);
      
      // Render cada edge como curva bezier
      model.edges.forEach(edge => {
        const fromPos = nodePositions[edge.from];
        const toPos = nodePositions[edge.to];
        if (!fromPos || !toPos) return;
        
        const edgeColor = edge.style?.color || 'rgba(255,255,255,0.3)';
        const isAnimated = edge.style?.animated || false;
        
        // Calcular control points para curva suave
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const cx1 = fromPos.x + dx * 0.4;
        const cy1 = fromPos.y;
        const cx2 = toPos.x - dx * 0.4;
        const cy2 = toPos.y;
        
        // Path curvo
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', \`M \${fromPos.x} \${fromPos.y} C \${cx1} \${cy1}, \${cx2} \${cy2}, \${toPos.x} \${toPos.y}\`);
        path.setAttribute('stroke', edgeColor);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#arrow)');
        path.setAttribute('filter', 'url(#glow)');
        
        if (edge.style?.strokeDash) {
          path.setAttribute('stroke-dasharray', edge.style.strokeDash);
        }
        
        if (isAnimated) {
          path.classList.add('edge-animated');
        }
        
        svg.appendChild(path);
        
        // Label del edge
        if (edge.label) {
          const midX = (fromPos.x + toPos.x) / 2;
          const midY = (fromPos.y + toPos.y) / 2 - 12;
          
          // Background del label
          const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          const labelWidth = edge.label.length * 5.5 + 12;
          labelBg.setAttribute('x', String(midX - labelWidth / 2));
          labelBg.setAttribute('y', String(midY - 8));
          labelBg.setAttribute('width', String(labelWidth));
          labelBg.setAttribute('height', '16');
          labelBg.classList.add('edge-label-bg');
          svg.appendChild(labelBg);
          
          // Texto del label
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', String(midX));
          text.setAttribute('y', String(midY + 3));
          text.setAttribute('text-anchor', 'middle');
          text.classList.add('edge-label');
          text.textContent = edge.label;
          svg.appendChild(text);
        }
      });
      
      world.insertBefore(svg, world.firstChild?.nextSibling || null);
      
      // Señal de render completo para Puppeteer
      const signal = document.createElement('div');
      signal.id = 'iso-render-complete';
      signal.style.display = 'none';
      document.body.appendChild(signal);
    });
  </script>
</body>
</html>`;
    }
    /**
     * Convierte modelo Isoflow → código Mermaid (fallback)
     */
    isoflowToMermaid(model) {
        const ICON_MAP = {
            person: '👤', browser: '🖥️', server: '⚙️', database: '🗄️',
            cloud: '☁️', queue: '📨', lock: '🔐', cache: '⚡',
            lambda: 'λ', cdn: '🌐', loadbalancer: '⚖️', firewall: '🛡️',
            storage: '💾', microservice: '🔷', container: '📦',
        };
        let mermaid = 'graph TB\n';
        // Agrupar nodos
        const grouped = new Map();
        model.nodes.forEach(node => {
            const g = node.group || 'default';
            if (!grouped.has(g))
                grouped.set(g, []);
            grouped.get(g).push(node);
        });
        const groupLabels = new Map();
        model.groups?.forEach(g => groupLabels.set(g.id, g.label));
        grouped.forEach((nodes, groupId) => {
            const label = groupLabels.get(groupId) || groupId;
            mermaid += `    subgraph "${label}"\n`;
            nodes.forEach(node => {
                const icon = ICON_MAP[node.icon || node.type] || '📦';
                if (node.type === 'database') {
                    mermaid += `        ${node.id}[(${icon} ${node.label})]\n`;
                }
                else {
                    mermaid += `        ${node.id}[${icon} ${node.label}]\n`;
                }
            });
            mermaid += '    end\n';
        });
        model.edges.forEach(edge => {
            const label = edge.label ? `|${edge.label}|` : '';
            const arrow = edge.style?.strokeDash ? '-.->' : '-->';
            mermaid += `    ${edge.from} ${arrow}${label} ${edge.to}\n`;
        });
        return mermaid;
    }
}
//# sourceMappingURL=advancedDiagramService.js.map