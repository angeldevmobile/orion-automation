import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, Maximize2, ExternalLink, Code2, Eye, Box } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DiagramBlockProps {
  language: 'mermaid' | 'd2' | 'isoflow';
  value: string;
}

export function DiagramBlock({ language, value }: DiagramBlockProps) {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMermaidLive = () => {
    const encoded = btoa(JSON.stringify({ code: value, mermaid: { theme: 'dark' } }));
    window.open(`https://mermaid.live/edit#base64:${encoded}`, '_blank');
  };

  // Mermaid → HTML con renderizado via CDN
  const getMermaidHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"><` + `/script>
      <style>
        body { margin:0; padding:16px; display:flex; justify-content:center; align-items:center; min-height:100%; background:transparent; }
        .mermaid { max-width:100%; }
      </style>
    </head>
    <body>
      <div class="mermaid">${value}</div>
      <script>mermaid.initialize({ startOnLoad:true, theme:'dark', securityLevel:'loose' });<` + `/script>
    </body>
    </html>`;

  // Isoflow JSON → HTML isométrico 3D interactivo
  const getIsoflowHTML = () => {
    try {
      const model = JSON.parse(value);
      const nodes = model.nodes || [];
      const edges = model.edges || [];

      // Colores por tipo de nodo
      const typeColors: Record<string, { bg: string; border: string; icon: string }> = {
        client:   { bg: '#1e3a5f', border: '#3b82f6', icon: '🖥️' },
        server:   { bg: '#1e3f2e', border: '#22c55e', icon: '⚙️' },
        service:  { bg: '#3f1e3f', border: '#a855f7', icon: '🔧' },
        database: { bg: '#3f2e1e', border: '#f59e0b', icon: '🗄️' },
        cache:    { bg: '#1e3f3f', border: '#06b6d4', icon: '⚡' },
        queue:    { bg: '#3f1e2e', border: '#ec4899', icon: '📨' },
        storage:  { bg: '#2e3f1e', border: '#84cc16', icon: '💾' },
        cdn:      { bg: '#1e2e3f', border: '#0ea5e9', icon: '🌐' },
        default:  { bg: '#1e293b', border: '#64748b', icon: '📦' },
      };

      const getColor = (type: string) => typeColors[type] || typeColors.default;

      // Calcular posiciones isométricas
      const isoX = (x: number, y: number) => 200 + (x - y) * 140;
      const isoY = (x: number, y: number) => 80 + (x + y) * 80;

      const nodesHTML = nodes.map((n: { id?: string; name?: string; type?: string; x?: number; y?: number }, i: number) => {
        const x = n.x ?? (i % 4);
        const y = n.y ?? Math.floor(i / 4);
        const px = isoX(x, y);
        const py = isoY(x, y);
        const c = getColor(n.type || 'default');

        return `
          <div class="iso-node" style="left:${px}px; top:${py}px; background:${c.bg}; border-color:${c.border};" data-id="${n.id || i}">
            <div class="iso-top" style="background:${c.border}20; border-color:${c.border};"></div>
            <div class="iso-icon">${c.icon}</div>
            <div class="iso-name">${n.name || n.id || 'Node'}</div>
            <div class="iso-type" style="color:${c.border};">${n.type || ''}</div>
          </div>
        `;
      }).join('');

      // SVG lines para conexiones
      const maxX = Math.max(...nodes.map((n: { x?: number }, i: number) => isoX(n.x ?? i % 4, 0))) + 300;
      const maxY = Math.max(...nodes.map((n: { y?: number }, i: number) => isoY(0, n.y ?? Math.floor(i / 4)))) + 200;

      const nodePositions: Record<string, { x: number; y: number }> = {};
      nodes.forEach((n: { id?: string; x?: number; y?: number }, i: number) => {
        const x = n.x ?? (i % 4);
        const y = n.y ?? Math.floor(i / 4);
        nodePositions[n.id || String(i)] = { x: isoX(x, y) + 70, y: isoY(x, y) + 50 };
      });

      const edgesHTML = edges.map((e: { from?: string; to?: string; label?: string }) => {
        const fromPos = nodePositions[e.from || ''];
        const toPos = nodePositions[e.to || ''];
        if (!fromPos || !toPos) return '';

        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;

        return `
          <line x1="${fromPos.x}" y1="${fromPos.y}" x2="${toPos.x}" y2="${toPos.y}" 
                stroke="#475569" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#arrow)"/>
          ${e.label ? `<text x="${midX}" y="${midY - 8}" fill="#94a3b8" font-size="11" text-anchor="middle" font-family="system-ui">${e.label}</text>` : ''}
        `;
      }).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { background:#0f172a; font-family:system-ui,sans-serif; overflow:auto; position:relative; min-height:${maxY + 100}px; min-width:${maxX + 100}px; }
            
            .iso-node {
              position:absolute;
              width:140px;
              padding:12px;
              border-radius:10px;
              border:2px solid;
              text-align:center;
              cursor:pointer;
              transition: all 0.3s ease;
              transform: perspective(800px) rotateX(10deg) rotateY(-10deg) rotateZ(0deg);
              box-shadow: 8px 8px 0 rgba(0,0,0,0.3), 4px 4px 0 rgba(0,0,0,0.2);
              z-index:10;
            }
            .iso-node:hover {
              transform: perspective(800px) rotateX(5deg) rotateY(-5deg) scale(1.08);
              box-shadow: 12px 12px 20px rgba(0,0,0,0.4);
              z-index:20;
            }
            .iso-top {
              position:absolute;
              top:-6px; left:4px; right:4px;
              height:6px;
              border-radius:6px 6px 0 0;
              border:1px solid;
              border-bottom:none;
            }
            .iso-icon { font-size:24px; margin-bottom:4px; }
            .iso-name { color:#e2e8f0; font-weight:600; font-size:12px; line-height:1.3; }
            .iso-type { font-size:10px; margin-top:2px; text-transform:uppercase; letter-spacing:0.5px; }
            
            .edges-svg {
              position:absolute;
              top:0; left:0;
              width:100%;
              height:100%;
              pointer-events:none;
              z-index:5;
            }

            .legend {
              position:fixed;
              bottom:12px; right:12px;
              background:#1e293b;
              border:1px solid #334155;
              border-radius:8px;
              padding:10px 14px;
              z-index:30;
            }
            .legend-title { color:#94a3b8; font-size:10px; text-transform:uppercase; margin-bottom:6px; letter-spacing:1px; }
            .legend-item { display:flex; align-items:center; gap:6px; margin:3px 0; }
            .legend-dot { width:8px; height:8px; border-radius:2px; }
            .legend-label { color:#cbd5e1; font-size:11px; }

            .stats {
              position:fixed;
              top:12px; left:12px;
              color:#64748b;
              font-size:11px;
              z-index:30;
            }
          </style>
        </head>
        <body>
          <div class="stats">
            ${nodes.length} componentes · ${edges.length} conexiones
          </div>
          
          <svg class="edges-svg" width="${maxX + 100}" height="${maxY + 100}">
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#475569"/>
              </marker>
            </defs>
            ${edgesHTML}
          </svg>
          
          ${nodesHTML}
          
          <div class="legend">
            <div class="legend-title">Componentes</div>
            ${[...new Set(nodes.map((n: { type?: string }) => n.type || 'default'))].map((type: string) => {
              const c = getColor(type);
              return `<div class="legend-item"><div class="legend-dot" style="background:${c.border}"></div><span class="legend-label">${c.icon} ${type}</span></div>`;
            }).join('')}
          </div>
        </body>
        </html>
      `;
    } catch {
      return `<html><body style="color:#ef4444;background:#0f172a;padding:20px;font-family:system-ui;">
        <h3>⚠️ Error parseando Isoflow JSON</h3>
        <pre style="color:#94a3b8;margin-top:8px;font-size:12px;">${value.slice(0, 500)}</pre>
      </body></html>`;
    }
  };

  const isRenderable = language === 'mermaid' || language === 'isoflow';
  const iframeHTML = language === 'mermaid' ? getMermaidHTML() : language === 'isoflow' ? getIsoflowHTML() : '';
  const iframeHeight = language === 'isoflow' ? 450 : 350;

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-border group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          {language === 'isoflow' ? (
            <Box className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="text-xs font-mono text-muted-foreground uppercase">{language}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {language === 'isoflow' ? 'Isométrico 3D' : 'Diagrama'}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {isRenderable && (
            <Button variant="ghost" size="sm" onClick={() => setShowCode(!showCode)} className="h-7 px-2 text-xs">
              {showCode ? <Eye className="h-3 w-3 mr-1" /> : <Code2 className="h-3 w-3 mr-1" />}
              {showCode ? 'Vista previa' : 'Ver código'}
            </Button>
          )}
          {language === 'mermaid' && (
            <Button variant="ghost" size="sm" onClick={handleOpenMermaidLive} className="h-7 px-2 text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              Live
            </Button>
          )}
          {isRenderable && (
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(true)} className="h-7 px-2 text-xs">
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs">
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
      </div>

      {/* Contenido */}
      {isRenderable && !showCode ? (
        <div className="bg-[#0f172a]">
          <iframe
            ref={iframeRef}
            srcDoc={iframeHTML}
            className="w-full border-0"
            style={{ height: `${iframeHeight}px` }}
            title={`${language} diagram`}
            sandbox="allow-scripts"
          />
        </div>
      ) : (
        <div className="overflow-x-auto bg-muted/30 p-4">
          <pre className="text-sm font-mono whitespace-pre-wrap">{value}</pre>
        </div>
      )}

      {/* Fullscreen */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-sm">
              {language === 'isoflow' ? <Box className="h-4 w-4 text-primary" /> : <Code2 className="h-4 w-4 text-primary" />}
              Diagrama {language === 'isoflow' ? 'Isométrico 3D' : language.toUpperCase()}
              <Badge variant="outline" className="text-xs">Fullscreen</Badge>
            </DialogTitle>
          </DialogHeader>
          <iframe
            srcDoc={iframeHTML}
            className="w-full flex-1 border-0"
            style={{ height: 'calc(95vh - 60px)' }}
            title={`${language} diagram fullscreen`}
            sandbox="allow-scripts"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}