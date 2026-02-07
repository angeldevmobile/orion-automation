import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, Maximize2, ExternalLink, Code2, Eye } from 'lucide-react';
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

  // Generar HTML para renderizar Mermaid en iframe
  const getMermaidHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
      <style>
        body {
          margin: 0;
          padding: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100%;
          background: transparent;
          font-family: system-ui, sans-serif;
        }
        .mermaid {
          max-width: 100%;
        }
      </style>
    </head>
    <body>
      <div class="mermaid">
        ${value}
      </div>
      <script>
        mermaid.initialize({ 
          startOnLoad: true, 
          theme: 'dark',
          securityLevel: 'loose',
        });
      </script>
    </body>
    </html>
  `;

  // Generar HTML para Isoflow JSON
  const getIsoflowHTML = () => {
    try {
      const model = JSON.parse(value);
      const nodes = model.nodes || [];
      const edges = model.edges || [];

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 20px; background: #0f172a; font-family: system-ui; }
            .container { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; padding: 20px; }
            .node {
              background: linear-gradient(135deg, #1e293b, #334155);
              border: 1px solid #475569;
              border-radius: 12px;
              padding: 16px 20px;
              color: #e2e8f0;
              text-align: center;
              min-width: 120px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              transform: perspective(500px) rotateX(5deg) rotateY(-5deg);
              transition: transform 0.2s;
            }
            .node:hover { transform: perspective(500px) rotateX(0deg) rotateY(0deg) scale(1.05); }
            .node-name { font-weight: 600; font-size: 14px; }
            .node-type { font-size: 11px; color: #94a3b8; margin-top: 4px; }
            .edges { text-align: center; color: #64748b; font-size: 12px; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            ${nodes.map((n: { name?: string; type?: string; id?: string }) => `
              <div class="node">
                <div class="node-name">${n.name || n.id || 'Node'}</div>
                <div class="node-type">${n.type || ''}</div>
              </div>
            `).join('')}
          </div>
          ${edges.length > 0 ? `
            <div class="edges">
              ${edges.length} conexiones entre componentes
            </div>
          ` : ''}
        </body>
        </html>
      `;
    } catch {
      return `<html><body style="color:white;padding:20px;">Error parsing Isoflow JSON</body></html>`;
    }
  };

  const isRenderable = language === 'mermaid' || language === 'isoflow';
  const iframeHTML = language === 'mermaid' ? getMermaidHTML() : language === 'isoflow' ? getIsoflowHTML() : '';

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-border group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground uppercase">{language}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Diagrama
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {isRenderable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              className="h-7 px-2 text-xs"
            >
              {showCode ? <Eye className="h-3 w-3 mr-1" /> : <Code2 className="h-3 w-3 mr-1" />}
              {showCode ? 'Vista previa' : 'Ver código'}
            </Button>
          )}
          {language === 'mermaid' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenMermaidLive}
              className="h-7 px-2 text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Live
            </Button>
          )}
          {isRenderable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(true)}
              className="h-7 px-2 text-xs"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs"
          >
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
      </div>

      {/* Contenido */}
      {isRenderable && !showCode ? (
        <div className="bg-background">
          <iframe
            ref={iframeRef}
            srcDoc={iframeHTML}
            className="w-full h-[350px] border-0"
            title={`${language} diagram`}
            sandbox="allow-scripts"
          />
        </div>
      ) : (
        <div className="overflow-x-auto bg-muted/30 p-4">
          <pre className="text-sm font-mono whitespace-pre-wrap">{value}</pre>
        </div>
      )}

      {/* Dialog Fullscreen */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Code2 className="h-4 w-4 text-primary" />
              Diagrama {language.toUpperCase()}
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