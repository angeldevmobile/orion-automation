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

  const getIsoflowHTML = () => {
    try {
      const model = JSON.parse(value);
      const nodes = model.nodes || [];
      const edges = model.edges || [];

      const typeColors: Record<string, { bg: string; border: string; glow: string; gradient: string }> = {
        client:   { bg: '#0c1929', border: '#3b82f6', glow: 'rgba(59,130,246,0.35)',  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0c1929 100%)' },
        server:   { bg: '#0c1f15', border: '#22c55e', glow: 'rgba(34,197,94,0.35)',   gradient: 'linear-gradient(135deg, #1e3f2e 0%, #0c1f15 100%)' },
        service:  { bg: '#1f0c1f', border: '#a855f7', glow: 'rgba(168,85,247,0.35)',  gradient: 'linear-gradient(135deg, #3f1e3f 0%, #1f0c1f 100%)' },
        database: { bg: '#1f150c', border: '#f59e0b', glow: 'rgba(245,158,11,0.35)',  gradient: 'linear-gradient(135deg, #3f2e1e 0%, #1f150c 100%)' },
        cache:    { bg: '#0c1f1f', border: '#06b6d4', glow: 'rgba(6,182,212,0.35)',   gradient: 'linear-gradient(135deg, #1e3f3f 0%, #0c1f1f 100%)' },
        queue:    { bg: '#1f0c15', border: '#ec4899', glow: 'rgba(236,72,153,0.35)',  gradient: 'linear-gradient(135deg, #3f1e2e 0%, #1f0c15 100%)' },
        storage:  { bg: '#151f0c', border: '#84cc16', glow: 'rgba(132,204,22,0.35)',  gradient: 'linear-gradient(135deg, #2e3f1e 0%, #151f0c 100%)' },
        cdn:      { bg: '#0c151f', border: '#0ea5e9', glow: 'rgba(14,165,233,0.35)', gradient: 'linear-gradient(135deg, #1e2e3f 0%, #0c151f 100%)' },
        cloud:    { bg: '#0f1629', border: '#818cf8', glow: 'rgba(129,140,248,0.35)', gradient: 'linear-gradient(135deg, #1e2340 0%, #0f1629 100%)' },
        api:      { bg: '#0c1929', border: '#38bdf8', glow: 'rgba(56,189,248,0.35)',  gradient: 'linear-gradient(135deg, #0c2744 0%, #0c1929 100%)' },
        gateway:  { bg: '#1a0c29', border: '#c084fc', glow: 'rgba(192,132,252,0.35)', gradient: 'linear-gradient(135deg, #2e1a4a 0%, #1a0c29 100%)' },
        loadbalancer: { bg: '#0c2920', border: '#34d399', glow: 'rgba(52,211,153,0.35)', gradient: 'linear-gradient(135deg, #0f3d2e 0%, #0c2920 100%)' },
        firewall: { bg: '#290c0c', border: '#f87171', glow: 'rgba(248,113,113,0.35)', gradient: 'linear-gradient(135deg, #3f1e1e 0%, #290c0c 100%)' },
        monitor:  { bg: '#29200c', border: '#fbbf24', glow: 'rgba(251,191,36,0.35)', gradient: 'linear-gradient(135deg, #3f301e 0%, #29200c 100%)' },
        user:     { bg: '#0c1929', border: '#60a5fa', glow: 'rgba(96,165,250,0.35)',  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0c1929 100%)' },
        default:  { bg: '#0f172a', border: '#64748b', glow: 'rgba(100,116,139,0.25)', gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
      };

      const nodesData = JSON.stringify(nodes.map((n: { id?: string; name?: string; type?: string; description?: string; x?: number; y?: number }, i: number) => ({
        id: n.id || String(i),
        name: n.name || n.id || 'Node',
        type: n.type || 'default',
        description: n.description || '',
        x: n.x ?? (i % 4),
        y: n.y ?? Math.floor(i / 4),
      })));

      const edgesData = JSON.stringify(edges.map((e: { from?: string; to?: string; label?: string; color?: string; style?: string }) => ({
        from: e.from || '',
        to: e.to || '',
        label: e.label || '',
        color: e.color || '',
        style: e.style || 'solid',
      })));

      const colorsData = JSON.stringify(typeColors);

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            html, body { 
              width:100%; height:100%; overflow:hidden;
              background: #0a0e1a;
              font-family: 'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif;
              user-select: none;
            }

            #iso-grid {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              pointer-events: none;
              z-index: 0;
              opacity: 0.4;
            }

            #canvas {
              position: absolute;
              top: 0; left: 0;
              cursor: grab;
              transform-origin: 0 0;
              z-index: 1;
            }
            #canvas.grabbing { cursor: grabbing; }
            #canvas.node-dragging { cursor: grabbing; }

            /* ── Node container ── */
            .iso-node {
              position: absolute;
              width: 200px;
              text-align: center;
              cursor: grab;
              z-index: 10;
              filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
              transition: filter 0.3s ease;
            }
            .iso-node:active { cursor: grabbing; }
            .iso-node:hover {
              z-index: 20;
              filter: drop-shadow(0 8px 30px rgba(0,0,0,0.6));
            }
            .iso-node:hover .iso-platform { opacity: 0.95; }
            .iso-node:hover .iso-object { transform: translateY(-6px); }
            .iso-node:hover .iso-label-box { opacity: 1; transform: translateY(2px); }

            /* ── Isometric diamond platform ── */
            .iso-platform-wrap {
              position: relative;
              width: 200px;
              height: 120px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .iso-platform {
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              opacity: 0.75;
              transition: opacity 0.3s;
            }

            /* ── 3D Object sitting on platform ── */
            .iso-object {
              position: relative;
              z-index: 2;
              transition: transform 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 10px;
            }

            /* ── Label below ── */
            .iso-label-box {
              margin-top: 4px;
              opacity: 0.9;
              transition: all 0.3s ease;
            }
            .iso-label-name {
              color: #e2e8f0;
              font-weight: 700;
              font-size: 12.5px;
              line-height: 1.3;
              letter-spacing: -0.01em;
            }
            .iso-label-desc {
              color: #64748b;
              font-size: 10px;
              line-height: 1.3;
              margin-top: 2px;
              max-width: 180px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .iso-label-badge {
              display: inline-block;
              margin-top: 5px;
              font-size: 8.5px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 2px 10px;
              border-radius: 4px;
              border: 1px solid;
            }

            /* ── Floating name tag (like isoflow) ── */
            .iso-nametag {
              position: absolute;
              top: -30px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(15,23,42,0.9);
              border: 1px solid rgba(100,116,139,0.3);
              border-radius: 4px;
              padding: 3px 10px;
              white-space: nowrap;
              z-index: 30;
              backdrop-filter: blur(6px);
            }
            .iso-nametag-text {
              color: #cbd5e1;
              font-size: 11px;
              font-weight: 600;
            }
            .iso-nametag-line {
              position: absolute;
              bottom: -16px;
              left: 50%;
              width: 1px;
              height: 16px;
              background: rgba(100,116,139,0.4);
              border: none;
            }
            .iso-nametag-dot {
              position: absolute;
              bottom: -20px;
              left: 50%;
              transform: translateX(-50%);
              width: 5px;
              height: 5px;
              border-radius: 50%;
              background: rgba(100,116,139,0.6);
            }

            /* ── Connection labels ── */
            .edge-label {
              position: absolute;
              padding: 3px 10px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 500;
              color: #94a3b8;
              background: rgba(15,23,42,0.85);
              border: 1px solid rgba(71,85,105,0.4);
              pointer-events: none;
              white-space: nowrap;
              backdrop-filter: blur(8px);
              transform: translate(-50%, -50%);
              z-index: 8;
            }

            #edges-svg {
              position: absolute;
              top: 0; left: 0;
              pointer-events: none;
              z-index: 5;
              overflow: visible;
            }

            @keyframes flowDash { to { stroke-dashoffset: -24; } }
            .edge-line-animated { animation: flowDash 2s linear infinite; }

            @keyframes flowDot { 0%{ opacity:0.9; } 50%{ opacity:0.4; } 100%{ opacity:0.9; } }

            /* ── Controls ── */
            .controls {
              position: fixed;
              bottom: 16px; left: 50%;
              transform: translateX(-50%);
              display: flex;
              gap: 4px;
              background: rgba(10,14,26,0.9);
              border: 1px solid rgba(71,85,105,0.3);
              border-radius: 10px;
              padding: 5px 8px;
              z-index: 50;
              backdrop-filter: blur(16px);
            }
            .ctrl-btn {
              width: 32px; height: 32px;
              display: flex; align-items: center; justify-content: center;
              border: 1px solid rgba(71,85,105,0.2);
              border-radius: 6px;
              background: transparent;
              color: #64748b;
              font-size: 15px;
              cursor: pointer;
              transition: all 0.15s;
            }
            .ctrl-btn:hover { background: rgba(51,65,85,0.4); color: #e2e8f0; }
            .ctrl-sep { width:1px; background:rgba(71,85,105,0.2); margin:4px 2px; }
            .zoom-display {
              color: #475569;
              font-size: 11px;
              display: flex;
              align-items: center;
              padding: 0 6px;
              font-variant-numeric: tabular-nums;
              min-width: 40px;
              justify-content: center;
            }

            /* ── Stats ── */
            .stats-bar {
              position: fixed;
              bottom: 16px; left: 16px;
              display: flex; gap: 14px;
              z-index: 50;
            }
            .stat-item {
              display: flex; align-items: center; gap: 5px;
              color: #334155;
              font-size: 10.5px;
            }
            .stat-dot { width: 5px; height: 5px; border-radius: 50%; }

            /* ── Legend ── */
            .legend {
              position: fixed;
              top: 16px; right: 16px;
              background: rgba(10,14,26,0.88);
              border: 1px solid rgba(71,85,105,0.25);
              border-radius: 10px;
              padding: 12px 16px;
              z-index: 50;
              backdrop-filter: blur(16px);
              max-height: calc(100vh - 100px);
              overflow-y: auto;
            }
            .legend-title {
              color: #475569;
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-bottom: 8px;
              font-weight: 700;
            }
            .legend-item { display: flex; align-items: center; gap: 8px; margin: 5px 0; }
            .legend-color {
              width: 18px; height: 12px;
              border-radius: 2px;
              border: 1px solid;
              flex-shrink: 0;
              position: relative;
              overflow: hidden;
            }
            .legend-color::after {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 100%);
            }
            .legend-label { color: #94a3b8; font-size: 11px; }

            /* ── Minimap ── */
            .minimap {
              position: fixed;
              bottom: 60px; right: 16px;
              width: 150px; height: 90px;
              background: rgba(10,14,26,0.85);
              border: 1px solid rgba(71,85,105,0.25);
              border-radius: 6px;
              z-index: 50;
              overflow: hidden;
              backdrop-filter: blur(8px);
            }
            .minimap-viewport {
              position: absolute;
              border: 1.5px solid rgba(99,102,241,0.4);
              background: rgba(99,102,241,0.04);
              border-radius: 2px;
            }
            .minimap-node {
              position: absolute;
              border-radius: 2px;
              border: 1px solid;
            }

            /* ── Title ── */
            .diagram-title {
              position: fixed;
              top: 16px; left: 16px;
              z-index: 50;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .diagram-title-text {
              color: #e2e8f0;
              font-size: 14px;
              font-weight: 700;
              letter-spacing: -0.02em;
            }
            .title-badge {
              font-size: 8.5px;
              padding: 2px 8px;
              border-radius: 4px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.8px;
            }

            /* ── Tooltip ── */
            .node-tooltip {
              display: none;
              position: absolute;
              bottom: calc(100% + 8px);
              left: 50%;
              transform: translateX(-50%);
              background: rgba(10,14,26,0.95);
              border: 1px solid rgba(71,85,105,0.4);
              border-radius: 8px;
              padding: 10px 14px;
              z-index: 100;
              white-space: nowrap;
              backdrop-filter: blur(12px);
              pointer-events: none;
              min-width: 160px;
            }
            .iso-node:hover .node-tooltip { display: block; }
            .node-tooltip::after {
              content: '';
              position: absolute;
              top: 100%;
              left: 50%;
              transform: translateX(-50%);
              border: 5px solid transparent;
              border-top-color: rgba(71,85,105,0.4);
            }
            .tooltip-row { display:flex; justify-content:space-between; gap:14px; font-size:10.5px; margin:2px 0; }
            .tooltip-key { color:#475569; }
            .tooltip-val { color:#e2e8f0; font-weight:600; }
          </style>
        </head>
        <body>
          <svg id="iso-grid" width="100%" height="100%">
            <defs>
              <pattern id="isoGrid" width="56" height="32" patternUnits="userSpaceOnUse" patternTransform="translate(0,0)">
                <line x1="0" y1="16" x2="28" y2="0" stroke="rgba(99,102,241,0.06)" stroke-width="0.5"/>
                <line x1="28" y1="0" x2="56" y2="16" stroke="rgba(99,102,241,0.06)" stroke-width="0.5"/>
                <line x1="0" y1="16" x2="28" y2="32" stroke="rgba(99,102,241,0.06)" stroke-width="0.5"/>
                <line x1="28" y1="32" x2="56" y2="16" stroke="rgba(99,102,241,0.06)" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#isoGrid)"/>
          </svg>

          <div id="canvas">
            <svg id="edges-svg"></svg>
          </div>

          <div class="controls">
            <button class="ctrl-btn" id="zoomIn" title="Zoom in">+</button>
            <span class="zoom-display" id="zoomDisplay">100%</span>
            <button class="ctrl-btn" id="zoomOut" title="Zoom out">−</button>
            <div class="ctrl-sep"></div>
            <button class="ctrl-btn" id="fitBtn" title="Fit to view">⊡</button>
            <button class="ctrl-btn" id="resetBtn" title="Reset view">↺</button>
          </div>

          <div class="minimap" id="minimap"></div>

          <script>
            const NODES_RAW = ${nodesData};
            const EDGES_RAW = ${edgesData};
            const TYPE_COLORS = ${colorsData};

            // ═══ Isometric SVG Icons ═══
            // Each icon is an SVG string rendered as a 3D isometric object
            function getIsoSVGIcon(type, color) {
              const c = color;
              const cL = color + '40';  // light
              const cM = color + '80';  // mid
              const cD = color + 'cc';  // dark
              const cG = color + '15';  // ghost

              const icons = {
                // ── Server rack (isometric box with front panels) ──
                server: '<svg viewBox="0 0 80 90" width="70" height="78">' +
                  // Left face
                  '<polygon points="10,55 40,70 40,30 10,15" fill="' + c + '25" stroke="' + cM + '" stroke-width="1"/>' +
                  // Right face
                  '<polygon points="40,70 70,55 70,15 40,30" fill="' + c + '15" stroke="' + cM + '" stroke-width="1"/>' +
                  // Top face
                  '<polygon points="10,15 40,0 70,15 40,30" fill="' + c + '35" stroke="' + cM + '" stroke-width="1"/>' +
                  // Drive bays on right face
                  '<rect x="43" y="34" width="22" height="4" rx="0.5" fill="' + c + '50" stroke="' + cM + '" stroke-width="0.5" transform="skewY(-26.5) translate(0, 48)"/>' +
                  '<rect x="43" y="40" width="22" height="4" rx="0.5" fill="' + c + '50" stroke="' + cM + '" stroke-width="0.5" transform="skewY(-26.5) translate(0, 48)"/>' +
                  '<rect x="43" y="46" width="22" height="4" rx="0.5" fill="' + c + '50" stroke="' + cM + '" stroke-width="0.5" transform="skewY(-26.5) translate(0, 48)"/>' +
                  // Status LEDs
                  '<circle cx="48" cy="40" r="1.5" fill="' + c + '" opacity="0.9"><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite"/></circle>' +
                  '<circle cx="53" cy="38" r="1.5" fill="#22c55e" opacity="0.7"/>' +
                  '</svg>',

                // ── Client / Laptop (isometric) ──
                client: '<svg viewBox="0 0 80 70" width="72" height="63">' +
                  // Screen back
                  '<polygon points="15,10 45,0 70,12 40,22" fill="' + c + '30" stroke="' + cM + '" stroke-width="1"/>' +
                  // Screen front (display)
                  '<polygon points="18,12 43,3 65,13 40,22" fill="' + c + '60" stroke="' + c + '" stroke-width="0.5"/>' +
                  // Screen content glow
                  '<polygon points="21,13 43,5 62,14 40,21" fill="' + c + '20"/>' +
                  // Base/keyboard - top
                  '<polygon points="10,45 40,58 70,45 40,32" fill="' + c + '25" stroke="' + cM + '" stroke-width="1"/>' +
                  // Base - front left
                  '<polygon points="10,45 40,58 40,62 10,49" fill="' + c + '15" stroke="' + cM + '" stroke-width="0.5"/>' +
                  // Base - front right
                  '<polygon points="40,58 70,45 70,49 40,62" fill="' + c + '10" stroke="' + cM + '" stroke-width="0.5"/>' +
                  // Hinge
                  '<line x1="15" y1="22" x2="40" y2="32" stroke="' + cM + '" stroke-width="1"/>' +
                  // Keyboard dots
                  '<circle cx="30" cy="44" r="0.8" fill="' + cM + '"/>' +
                  '<circle cx="34" cy="42" r="0.8" fill="' + cM + '"/>' +
                  '<circle cx="38" cy="44" r="0.8" fill="' + cM + '"/>' +
                  '<circle cx="42" cy="42" r="0.8" fill="' + cM + '"/>' +
                  '<circle cx="46" cy="44" r="0.8" fill="' + cM + '"/>' +
                  '<circle cx="50" cy="42" r="0.8" fill="' + cM + '"/>' +
                  '</svg>',

                // ── Database (isometric cylinder) ──
                database: '<svg viewBox="0 0 70 80" width="64" height="73">' +
                  // Cylinder body
                  '<ellipse cx="35" cy="60" rx="28" ry="10" fill="' + c + '20" stroke="' + cM + '" stroke-width="1"/>' +
                  '<rect x="7" y="20" width="56" height="40" fill="' + c + '18" stroke="none"/>' +
                  '<line x1="7" y1="20" x2="7" y2="60" stroke="' + cM + '" stroke-width="1"/>' +
                  '<line x1="63" y1="20" x2="63" y2="60" stroke="' + cM + '" stroke-width="1"/>' +
                  // Top ellipse
                  '<ellipse cx="35" cy="20" rx="28" ry="10" fill="' + c + '35" stroke="' + cM + '" stroke-width="1"/>' +
                  // Rings
                  '<ellipse cx="35" cy="32" rx="28" ry="8" fill="none" stroke="' + c + '30" stroke-width="0.5" stroke-dasharray="3,3"/>' +
                  '<ellipse cx="35" cy="46" rx="28" ry="9" fill="none" stroke="' + c + '30" stroke-width="0.5" stroke-dasharray="3,3"/>' +
                  // Data lines on surface
                  '<line x1="20" y1="28" x2="50" y2="28" stroke="' + c + '40" stroke-width="1" stroke-dasharray="4,2"/>' +
                  '<line x1="18" y1="42" x2="52" y2="42" stroke="' + c + '40" stroke-width="1" stroke-dasharray="4,2"/>' +
                  // Glow on top
                  '<ellipse cx="35" cy="20" rx="18" ry="5" fill="' + c + '15" stroke="none"/>' +
                  '</svg>',

                // ── Cloud (isometric cloud shape) ──
                cloud: '<svg viewBox="0 0 80 60" width="72" height="54">' +
                  // Cloud body (multiple overlapping ellipses)
                  '<ellipse cx="30" cy="35" rx="22" ry="14" fill="' + c + '20" stroke="' + cM + '" stroke-width="1"/>' +
                  '<ellipse cx="50" cy="32" rx="20" ry="12" fill="' + c + '18" stroke="' + cM + '" stroke-width="1"/>' +
                  '<ellipse cx="40" cy="25" rx="18" ry="12" fill="' + c + '25" stroke="' + cM + '" stroke-width="1"/>' +
                  '<ellipse cx="25" cy="28" rx="14" ry="10" fill="' + c + '22" stroke="' + cM + '" stroke-width="0.8"/>' +
                  '<ellipse cx="55" cy="28" rx="12" ry="9" fill="' + c + '22" stroke="' + cM + '" stroke-width="0.8"/>' +
                  // Inner highlight
                  '<ellipse cx="38" cy="28" rx="12" ry="6" fill="' + c + '10" stroke="none"/>' +
                  // Arrow or signal
                  '<path d="M36,38 L40,33 L44,38" fill="none" stroke="' + c + '" stroke-width="1.5" opacity="0.6"/>' +
                  '<line x1="40" y1="33" x2="40" y2="44" stroke="' + c + '" stroke-width="1.5" opacity="0.4"/>' +
                  '</svg>',

                // ── API / Gateway (isometric diamond with arrows) ──
                api: '<svg viewBox="0 0 80 70" width="70" height="62">' +
                  // Diamond shape
                  '<polygon points="40,5 70,25 40,45 10,25" fill="' + c + '25" stroke="' + cM + '" stroke-width="1.2"/>' +
                  '<polygon points="10,25 40,45 40,55 10,35" fill="' + c + '15" stroke="' + cM + '" stroke-width="0.8"/>' +
                  '<polygon points="40,45 70,25 70,35 40,55" fill="' + c + '10" stroke="' + cM + '" stroke-width="0.8"/>' +
                  // Inner arrows (data flow)
                  '<path d="M28,22 L40,16 L52,22" fill="none" stroke="' + c + '" stroke-width="1.5" opacity="0.6"/>' +
                  '<path d="M28,30 L40,36 L52,30" fill="none" stroke="' + c + '" stroke-width="1.5" opacity="0.6"/>' +
                  // Center dot
                  '<circle cx="40" cy="26" r="3" fill="' + c + '" opacity="0.5"/>' +
                  '<circle cx="40" cy="26" r="1.5" fill="' + c + '" opacity="0.8"/>' +
                  '</svg>',

                // ── Service (isometric gear/cog) ──
                service: '<svg viewBox="0 0 80 80" width="68" height="68">' +
                  // Gear body (isometric hexagon-ish)
                  '<polygon points="40,5 58,14 65,32 58,50 40,59 22,50 15,32 22,14" fill="' + c + '22" stroke="' + cM + '" stroke-width="1"/>' +
                  // Gear teeth
                  '<polygon points="38,2 42,2 44,8 36,8" fill="' + c + '30" stroke="' + cM + '" stroke-width="0.5"/>' +
                  '<polygon points="60,11 63,14 58,18 55,15" fill="' + c + '30" stroke="' + cM + '" stroke-width="0.5"/>' +
                  '<polygon points="67,30 67,34 62,35 62,31" fill="' + c + '30" stroke="' + cM + '" stroke-width="0.5"/>' +
                  '<polygon points="60,49 63,52 58,54 55,51" fill="' + c + '30" stroke="' + cM + '" stroke-width="0.5"/>' +
                  '<polygon points="38,58 42,58 44,62 36,62" fill="' + c + '30" stroke="' + cM + '" stroke-width="0.5"/>' +
                  '<polygon points="17,49 20,52 18,54 15,51" fill="' + c + '30" stroke="' + cM + '" stroke-width="0.5"/>' +
                  '<polygon points="13,30 13,34 18,35 18,31" fill="' + c + '30" stroke="' + cM + '" stroke-width="0.5"/>' +
                  '<polygon points="17,11 20,14 18,18 15,15" fill="' + c + '30" stroke="' + cM + '" stroke-width="0.5"/>' +
                  // Inner circle
                  '<circle cx="40" cy="32" r="12" fill="' + c + '15" stroke="' + cM + '" stroke-width="0.8"/>' +
                  '<circle cx="40" cy="32" r="6" fill="' + c + '30" stroke="' + c + '" stroke-width="1"/>' +
                  '<circle cx="40" cy="32" r="2" fill="' + c + '" opacity="0.7"/>' +
                  // 3D depth
                  '<polygon points="40,59 22,50 22,54 40,63 58,54 58,50" fill="' + c + '10" stroke="' + cM + '" stroke-width="0.5"/>' +
                  '</svg>',

                // ── Cache (isometric lightning bolt) ──
                cache: '<svg viewBox="0 0 70 80" width="62" height="70">' +
                  // Hexagonal container
                  '<polygon points="35,5 60,18 60,52 35,65 10,52 10,18" fill="' + c + '18" stroke="' + cM + '" stroke-width="1"/>' +
                  // Lightning bolt
                  '<polygon points="38,15 25,40 33,40 28,58 48,30 38,30 44,15" fill="' + c + '" opacity="0.5"/>' +
                  '<polygon points="38,15 25,40 33,40 28,58 48,30 38,30 44,15" fill="none" stroke="' + c + '" stroke-width="1" opacity="0.8"/>' +
                  // Glow effect
                  '<ellipse cx="35" cy="38" rx="14" ry="16" fill="' + c + '08"/>' +
                  '</svg>',

                // ── Queue (isometric stack of messages) ──
                queue: '<svg viewBox="0 0 80 70" width="70" height="62">' +
                  // Bottom envelope
                  '<polygon points="15,45 40,55 65,45 40,35" fill="' + c + '18" stroke="' + cM + '" stroke-width="0.8"/>' +
                  '<polygon points="15,45 40,55 40,60 15,50" fill="' + c + '12" stroke="' + cM + '" stroke-width="0.5"/>' +
                  '<polygon points="40,55 65,45 65,50 40,60" fill="' + c + '08" stroke="' + cM + '" stroke-width="0.5"/>' +
                  // Middle envelope
                  '<polygon points="15,35 40,45 65,35 40,25" fill="' + c + '25" stroke="' + cM + '" stroke-width="0.8"/>' +
                  '<polygon points="15,35 40,45 40,50 15,40" fill="' + c + '15" stroke="' + cM + '" stroke-width="0.5"/>' +
                  '<polygon points="40,45 65,35 65,40 40,50" fill="' + c + '10" stroke="' + cM + '" stroke-width="0.5"/>' +
                  // Top envelope (prominent)
                  '<polygon points="15,25 40,35 65,25 40,15" fill="' + c + '35" stroke="' + c + '" stroke-width="1"/>' +
                  '<polygon points="15,25 40,35 40,40 15,30" fill="' + c + '20" stroke="' + cM + '" stroke-width="0.8"/>' +
                  '<polygon points="40,35 65,25 65,30 40,40" fill="' + c + '12" stroke="' + cM + '" stroke-width="0.8"/>' +
                  // Envelope flap
                  '<polygon points="15,25 40,15 40,22" fill="' + c + '15" stroke="' + cM + '" stroke-width="0.5"/>' +
                  '<polygon points="65,25 40,15 40,22" fill="' + c + '10" stroke="' + cM + '" stroke-width="0.5"/>' +
                  '</svg>',

                // ── Storage (isometric hard drive) ──
                storage: '<svg viewBox="0 0 80 60" width="72" height="54">' +
                  // Top
                  '<polygon points="10,20 40,8 70,20 40,32" fill="' + c + '30" stroke="' + cM + '" stroke-width="1"/>' +
                  // Left face
                  '<polygon points="10,20 40,32 40,45 10,33" fill="' + c + '20" stroke="' + cM + '" stroke-width="1"/>' +
                  // Right face
                  '<polygon points="40,32 70,20 70,33 40,45" fill="' + c + '12" stroke="' + cM + '" stroke-width="1"/>' +
                  // Disk circles on top
                  '<ellipse cx="38" cy="18" rx="10" ry="4" fill="none" stroke="' + c + '50" stroke-width="0.8"/>' +
                  '<ellipse cx="38" cy="18" rx="5" ry="2" fill="' + c + '30" stroke="' + c + '60" stroke-width="0.8"/>' +
                  '<circle cx="38" cy="18" r="1.5" fill="' + c + '" opacity="0.6"/>' +
                  // Read arm
                  '<line x1="38" y1="18" x2="50" y2="14" stroke="' + c + '80" stroke-width="1"/>' +
                  '<circle cx="50" cy="14" r="1" fill="' + c + '" opacity="0.7"/>' +
                  // LED
                  '<circle cx="60" cy="27" r="1.5" fill="' + c + '" opacity="0.8"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite"/></circle>' +
                  '</svg>',

                // ── CDN (isometric globe) ──
                cdn: '<svg viewBox="0 0 70 70" width="62" height="62">' +
                  // Globe circle
                  '<circle cx="35" cy="32" r="24" fill="' + c + '15" stroke="' + cM + '" stroke-width="1"/>' +
                  // Latitude lines
                  '<ellipse cx="35" cy="32" rx="24" ry="8" fill="none" stroke="' + c + '25" stroke-width="0.7"/>' +
                  '<ellipse cx="35" cy="22" rx="18" ry="5" fill="none" stroke="' + c + '20" stroke-width="0.5"/>' +
                  '<ellipse cx="35" cy="42" rx="18" ry="5" fill="none" stroke="' + c + '20" stroke-width="0.5"/>' +
                  // Longitude lines
                  '<ellipse cx="35" cy="32" rx="8" ry="24" fill="none" stroke="' + c + '25" stroke-width="0.7"/>' +
                  '<ellipse cx="35" cy="32" rx="16" ry="24" fill="none" stroke="' + c + '20" stroke-width="0.5"/>' +
                  // Nodes
                  '<circle cx="22" cy="26" r="2.5" fill="' + c + '" opacity="0.6"/>' +
                  '<circle cx="48" cy="28" r="2.5" fill="' + c + '" opacity="0.6"/>' +
                  '<circle cx="35" cy="40" r="2.5" fill="' + c + '" opacity="0.6"/>' +
                  '<circle cx="30" cy="18" r="2" fill="' + c + '" opacity="0.4"/>' +
                  '<circle cx="45" cy="38" r="2" fill="' + c + '" opacity="0.4"/>' +
                  // Connection lines between nodes
                  '<line x1="22" y1="26" x2="35" y2="40" stroke="' + c + '" stroke-width="0.5" opacity="0.3"/>' +
                  '<line x1="48" y1="28" x2="35" y2="40" stroke="' + c + '" stroke-width="0.5" opacity="0.3"/>' +
                  '<line x1="22" y1="26" x2="48" y2="28" stroke="' + c + '" stroke-width="0.5" opacity="0.3"/>' +
                  '</svg>',

                // ── User (isometric person) ──
                user: '<svg viewBox="0 0 60 80" width="52" height="70">' +
                  // Head
                  '<circle cx="30" cy="18" r="10" fill="' + c + '30" stroke="' + cM + '" stroke-width="1"/>' +
                  '<circle cx="30" cy="16" r="7" fill="' + c + '20" stroke="none"/>' +
                  // Body
                  '<path d="M14,42 Q14,30 30,28 Q46,30 46,42 L46,50 Q46,55 30,58 Q14,55 14,50 Z" fill="' + c + '25" stroke="' + cM + '" stroke-width="1"/>' +
                  // Shoulder details
                  '<path d="M18,34 Q30,30 42,34" fill="none" stroke="' + c + '40" stroke-width="0.8"/>' +
                  // Badge/ID
                  '<rect x="26" y="38" width="8" height="6" rx="1" fill="' + c + '50" stroke="' + c + '" stroke-width="0.5"/>' +
                  '</svg>',

                // ── Gateway (isometric shield) ──
                gateway: '<svg viewBox="0 0 70 80" width="62" height="70">' +
                  // Shield shape
                  '<path d="M35,8 L58,18 L58,42 Q58,60 35,70 Q12,60 12,42 L12,18 Z" fill="' + c + '20" stroke="' + cM + '" stroke-width="1.2"/>' +
                  // Inner shield
                  '<path d="M35,16 L50,23 L50,40 Q50,54 35,62 Q20,54 20,40 L20,23 Z" fill="' + c + '12" stroke="' + c + '40" stroke-width="0.8"/>' +
                  // Lock icon
                  '<rect x="29" y="36" width="12" height="10" rx="2" fill="' + c + '40" stroke="' + c + '" stroke-width="0.8"/>' +
                  '<path d="M31,36 L31,30 Q31,24 35,24 Q39,24 39,30 L39,36" fill="none" stroke="' + c + '" stroke-width="1.2"/>' +
                  '<circle cx="35" cy="41" r="1.5" fill="' + c + '" opacity="0.8"/>' +
                  '</svg>',

                // ── Load Balancer (isometric scale) ──
                loadbalancer: '<svg viewBox="0 0 80 70" width="70" height="62">' +
                  // Base
                  '<polygon points="40,55 55,62 40,68 25,62" fill="' + c + '25" stroke="' + cM + '" stroke-width="1"/>' +
                  // Pillar
                  '<rect x="38" y="25" width="4" height="30" fill="' + c + '20" stroke="' + cM + '" stroke-width="0.8"/>' +
                  // Beam
                  '<line x1="12" y1="25" x2="68" y2="25" stroke="' + c + '" stroke-width="2" opacity="0.6"/>' +
                  // Left plate
                  '<polygon points="12,25 22,22 22,30 12,33" fill="' + c + '25" stroke="' + cM + '" stroke-width="0.8"/>' +
                  // Right plate
                  '<polygon points="58,22 68,25 68,33 58,30" fill="' + c + '25" stroke="' + cM + '" stroke-width="0.8"/>' +
                  // Arrows
                  '<path d="M30,18 L40,10 L50,18" fill="none" stroke="' + c + '" stroke-width="1.5" opacity="0.5"/>' +
                  '<line x1="40" y1="10" x2="40" y2="25" stroke="' + c + '" stroke-width="1" opacity="0.4" stroke-dasharray="3,2"/>' +
                  '</svg>',

                // ── Firewall (isometric wall with flames) ──
                firewall: '<svg viewBox="0 0 80 70" width="70" height="62">' +
                  // Brick wall
                  '<polygon points="10,20 40,8 70,20 40,32" fill="' + c + '25" stroke="' + cM + '" stroke-width="1"/>' +
                  '<polygon points="10,20 40,32 40,55 10,43" fill="' + c + '18" stroke="' + cM + '" stroke-width="1"/>' +
                  '<polygon points="40,32 70,20 70,43 40,55" fill="' + c + '12" stroke="' + cM + '" stroke-width="1"/>' +
                  // Brick lines
                  '<line x1="10" y1="28" x2="40" y2="40" stroke="' + c + '30" stroke-width="0.5"/>' +
                  '<line x1="40" y1="40" x2="70" y2="28" stroke="' + c + '30" stroke-width="0.5"/>' +
                  '<line x1="10" y1="36" x2="40" y2="48" stroke="' + c + '30" stroke-width="0.5"/>' +
                  '<line x1="40" y1="48" x2="70" y2="36" stroke="' + c + '30" stroke-width="0.5"/>' +
                  // Flame icon
                  '<path d="M35,12 Q32,8 35,3 Q37,7 40,5 Q38,10 42,12 Q40,10 38,12 Z" fill="' + c + '" opacity="0.5"><animate attributeName="d" values="M35,12 Q32,8 35,3 Q37,7 40,5 Q38,10 42,12 Q40,10 38,12 Z;M35,13 Q31,7 35,2 Q38,7 41,4 Q39,10 43,13 Q40,11 38,13 Z;M35,12 Q32,8 35,3 Q37,7 40,5 Q38,10 42,12 Q40,10 38,12 Z" dur="1s" repeatCount="indefinite"/></path>' +
                  '</svg>',

                // ── Monitor (isometric screen with chart) ──
                monitor: '<svg viewBox="0 0 70 70" width="62" height="62">' +
                  // Screen frame
                  '<polygon points="10,15 55,5 65,22 20,32" fill="' + c + '25" stroke="' + cM + '" stroke-width="1"/>' +
                  // Screen display
                  '<polygon points="14,17 53,8 61,22 22,30" fill="' + c + '12" stroke="' + c + '40" stroke-width="0.5"/>' +
                  // Chart line
                  '<polyline points="18,26 28,22 35,24 42,17 50,19 57,14" fill="none" stroke="' + c + '" stroke-width="1.5" opacity="0.7"/>' +
                  // Chart dots
                  '<circle cx="28" cy="22" r="1.5" fill="' + c + '" opacity="0.8"/>' +
                  '<circle cx="42" cy="17" r="1.5" fill="' + c + '" opacity="0.8"/>' +
                  '<circle cx="57" cy="14" r="1.5" fill="' + c + '" opacity="0.8"/>' +
                  // Stand
                  '<polygon points="32,32 42,38 42,42 32,36" fill="' + c + '20" stroke="' + cM + '" stroke-width="0.5"/>' +
                  // Base
                  '<polygon points="25,42 45,48 50,46 30,40" fill="' + c + '20" stroke="' + cM + '" stroke-width="0.8"/>' +
                  '</svg>',

                // ── Default (isometric cube) ──
                default: '<svg viewBox="0 0 70 80" width="62" height="70">' +
                  // Left face
                  '<polygon points="5,40 35,55 35,25 5,10" fill="' + c + '22" stroke="' + cM + '" stroke-width="1"/>' +
                  // Right face
                  '<polygon points="35,55 65,40 65,10 35,25" fill="' + c + '15" stroke="' + cM + '" stroke-width="1"/>' +
                  // Top face
                  '<polygon points="5,10 35,0 65,10 35,25" fill="' + c + '30" stroke="' + cM + '" stroke-width="1"/>' +
                  // Highlight edge
                  '<line x1="35" y1="25" x2="35" y2="55" stroke="' + c + '" stroke-width="0.8" opacity="0.3"/>' +
                  // Label lines on front
                  '<line x1="12" y1="22" x2="28" y2="30" stroke="' + c + '30" stroke-width="0.5" stroke-dasharray="2,2"/>' +
                  '<line x1="12" y1="30" x2="28" y2="38" stroke="' + c + '30" stroke-width="0.5" stroke-dasharray="2,2"/>' +
                  '</svg>'
              };

              return icons[type?.toLowerCase()] || icons.default;
            }

            // ═══ Isometric diamond platform SVG ═══
            function getIsoPlatform(color, w, h) {
              w = w || 120;
              h = h || 32;
              var hw = w / 2;
              var hh = h / 2;
              var depth = 12;
              return '<svg viewBox="0 0 ' + w + ' ' + (h + depth) + '" width="' + w + '" height="' + (h + depth) + '">' +
                // Top diamond
                '<polygon points="' + hw + ',0 ' + w + ',' + hh + ' ' + hw + ',' + h + ' 0,' + hh + '" fill="' + color + '12" stroke="' + color + '30" stroke-width="1"/>' +
                // Left depth
                '<polygon points="0,' + hh + ' ' + hw + ',' + h + ' ' + hw + ',' + (h+depth) + ' 0,' + (hh+depth) + '" fill="' + color + '08" stroke="' + color + '20" stroke-width="0.5"/>' +
                // Right depth
                '<polygon points="' + hw + ',' + h + ' ' + w + ',' + hh + ' ' + w + ',' + (hh+depth) + ' ' + hw + ',' + (h+depth) + '" fill="' + color + '05" stroke="' + color + '15" stroke-width="0.5"/>' +
                // Inner glow
                '<polygon points="' + hw + ',4 ' + (w-8) + ',' + hh + ' ' + hw + ',' + (h-4) + ' 8,' + hh + '" fill="' + color + '06" stroke="none"/>' +
                '</svg>';
            }

            // ═══ State ═══
            let zoom = 1;
            let panX = 0, panY = 0;
            let isPanning = false;
            let panStartX = 0, panStartY = 0;
            let draggingNode = null;
            let dragOffsetX = 0, dragOffsetY = 0;

            const SPACING_X = 280;
            const SPACING_Y = 220;
            const NODE_W = 200;
            const NODE_H = 180;

            const canvas = document.getElementById('canvas');
            const svg = document.getElementById('edges-svg');

            const nodeState = NODES_RAW.map(function(n, i) {
              return {
                id: n.id,
                name: n.name,
                type: n.type,
                description: n.description,
                px: 120 + n.x * SPACING_X,
                py: 120 + n.y * SPACING_Y,
              };
            });

            function getColor(type) {
              return TYPE_COLORS[type?.toLowerCase()] || TYPE_COLORS['default'];
            }

            // ═══ Create DOM nodes ═══
            nodeState.forEach(function(n, i) {
              var c = getColor(n.type);
              var el = document.createElement('div');
              el.className = 'iso-node';
              el.dataset.idx = i;
              el.style.left = n.px + 'px';
              el.style.top = n.py + 'px';

              var platformSVG = getIsoPlatform(c.border, 160, 40);
              var iconSVG = getIsoSVGIcon(n.type, c.border);
              var connCount = EDGES_RAW.filter(function(e) { return e.from === n.id || e.to === n.id; }).length;

              el.innerHTML = 
                // Floating name tag (like isoflow original)
                '<div class="iso-nametag">' +
                  '<span class="iso-nametag-text">' + n.name + '</span>' +
                  '<div class="iso-nametag-line"></div>' +
                  '<div class="iso-nametag-dot" style="background:' + c.border + '80;"></div>' +
                '</div>' +
                // 3D Object
                '<div class="iso-object">' + iconSVG + '</div>' +
                // Platform
                '<div class="iso-platform">' + platformSVG + '</div>' +
                // Label
                '<div class="iso-label-box">' +
                  (n.description ? '<div class="iso-label-desc">' + n.description + '</div>' : '') +
                  '<div class="iso-label-badge" style="color:' + c.border + '; border-color:' + c.border + '40; background:' + c.border + '12;">' + n.type + '</div>' +
                '</div>' +
                // Tooltip
                '<div class="node-tooltip">' +
                  '<div class="tooltip-row"><span class="tooltip-key">Name</span><span class="tooltip-val">' + n.name + '</span></div>' +
                  '<div class="tooltip-row"><span class="tooltip-key">Type</span><span class="tooltip-val">' + n.type + '</span></div>' +
                  (n.description ? '<div class="tooltip-row"><span class="tooltip-key">Info</span><span class="tooltip-val">' + n.description + '</span></div>' : '') +
                  '<div class="tooltip-row"><span class="tooltip-key">Connections</span><span class="tooltip-val">' + connCount + '</span></div>' +
                '</div>';

              // Hover effects
              el.addEventListener('mouseenter', function() {
                el.style.filter = 'drop-shadow(0 12px 40px ' + c.glow + ')';
              });
              el.addEventListener('mouseleave', function() {
                el.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))';
              });

              canvas.appendChild(el);
            });

            // ═══ Render edges ═══
            function renderEdges() {
              var W = 5000, H = 5000;
              svg.setAttribute('width', W);
              svg.setAttribute('height', H);
              svg.style.width = W + 'px';
              svg.style.height = H + 'px';

              var html = '<defs>';
              var usedColors = {};
              EDGES_RAW.forEach(function(e) {
                var fromNode = nodeState.find(function(n) { return n.id === e.from; });
                var toNode = nodeState.find(function(n) { return n.id === e.to; });
                if (!fromNode || !toNode) return;
                var ec = e.color || getColor(fromNode.type).border;
                if (!usedColors[ec]) {
                  usedColors[ec] = true;
                  html += '<marker id="arr-' + ec.replace('#','') + '" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><polygon points="0 1, 8 4, 0 7" fill="' + ec + '" opacity="0.7"/></marker>';
                }
              });
              // Glow filter
              html += '<filter id="edgeGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
              html += '</defs>';

              // Labels container
              var labelsDiv = document.getElementById('edge-labels');
              if (labelsDiv) labelsDiv.remove();
              var newLabels = document.createElement('div');
              newLabels.id = 'edge-labels';
              newLabels.style.position = 'absolute';
              newLabels.style.top = '0';
              newLabels.style.left = '0';
              newLabels.style.pointerEvents = 'none';
              newLabels.style.zIndex = '8';
              canvas.appendChild(newLabels);

              EDGES_RAW.forEach(function(e) {
                var fromNode = nodeState.find(function(n) { return n.id === e.from; });
                var toNode = nodeState.find(function(n) { return n.id === e.to; });
                if (!fromNode || !toNode) return;

                var x1 = fromNode.px + NODE_W / 2;
                var y1 = fromNode.py + 90;
                var x2 = toNode.px + NODE_W / 2;
                var y2 = toNode.py + 90;
                var ec = e.color || getColor(fromNode.type).border;
                var markerId = 'arr-' + ec.replace('#','');
                var isDashed = e.style === 'dashed';

                // Smart Bézier control points
                var dx = x2 - x1;
                var dy = y2 - y1;
                var dist = Math.sqrt(dx*dx + dy*dy);
                var tension = Math.min(dist * 0.3, 120);

                var cx1, cy1, cx2, cy2;
                if (Math.abs(dy) > Math.abs(dx)) {
                  cx1 = x1;
                  cy1 = y1 + (dy > 0 ? tension : -tension);
                  cx2 = x2;
                  cy2 = y2 - (dy > 0 ? tension : -tension);
                } else {
                  cx1 = x1 + (dx > 0 ? tension : -tension);
                  cy1 = y1;
                  cx2 = x2 - (dx > 0 ? tension : -tension);
                  cy2 = y2;
                }

                var pathD = 'M' + x1 + ',' + y1 + ' C' + cx1 + ',' + cy1 + ' ' + cx2 + ',' + cy2 + ' ' + x2 + ',' + y2;

                // bg glow
                html += '<path d="' + pathD + '" fill="none" stroke="' + ec + '" stroke-width="8" opacity="0.04" filter="url(#edgeGlow)"/>';

                // Main line
                var dashAttr = isDashed ? ' stroke-dasharray="10,8"' : ' stroke-dasharray="6,4"';
                html += '<path d="' + pathD + '" fill="none" stroke="' + ec + '" stroke-width="2" opacity="0.45"' + dashAttr + ' marker-end="url(#' + markerId + ')" class="edge-line-animated"/>';

                // Animated flow dot
                html += '<circle r="3" fill="' + ec + '" opacity="0.7">' +
                  '<animateMotion dur="' + (2 + Math.random() * 2) + 's" repeatCount="indefinite" path="' + pathD + '"/>' +
                  '</circle>';

                // Second flow dot offset
                html += '<circle r="2" fill="' + ec + '" opacity="0.4">' +
                  '<animateMotion dur="' + (2.5 + Math.random() * 2) + 's" repeatCount="indefinite" begin="-1s" path="' + pathD + '"/>' +
                  '</circle>';

                // Label
                if (e.label) {
                  var lx = (x1 + x2) / 2;
                  var ly = (y1 + y2) / 2 - 8;
                  var label = document.createElement('div');
                  label.className = 'edge-label';
                  label.style.left = lx + 'px';
                  label.style.top = ly + 'px';
                  label.textContent = e.label;
                  newLabels.appendChild(label);
                }
              });

              svg.innerHTML = html;
            }

            renderEdges();

            // ═══ Transform ═══
            function applyTransform() {
              canvas.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + zoom + ')';
              document.getElementById('zoomDisplay').textContent = Math.round(zoom * 100) + '%';
              updateMinimap();
            }

            // ═══ Pan ═══
            document.addEventListener('mousedown', function(e) {
              var nodeEl = e.target.closest('.iso-node');
              if (nodeEl && e.button === 0) {
                var idx = parseInt(nodeEl.dataset.idx);
                draggingNode = idx;
                var rect = nodeEl.getBoundingClientRect();
                dragOffsetX = (e.clientX - rect.left) / zoom;
                dragOffsetY = (e.clientY - rect.top) / zoom;
                canvas.classList.add('node-dragging');
                nodeEl.style.zIndex = 100;
                e.preventDefault();
                return;
              }
              if (e.button === 0 && !nodeEl) {
                isPanning = true;
                panStartX = e.clientX - panX;
                panStartY = e.clientY - panY;
                canvas.classList.add('grabbing');
              }
            });

            document.addEventListener('mousemove', function(e) {
              if (draggingNode !== null) {
                var newPx = (e.clientX - panX) / zoom - dragOffsetX;
                var newPy = (e.clientY - panY) / zoom - dragOffsetY;
                nodeState[draggingNode].px = newPx;
                nodeState[draggingNode].py = newPy;
                var el = document.querySelectorAll('.iso-node')[draggingNode];
                el.style.left = newPx + 'px';
                el.style.top = newPy + 'px';
                renderEdges();
                return;
              }
              if (isPanning) {
                panX = e.clientX - panStartX;
                panY = e.clientY - panStartY;
                applyTransform();
              }
            });

            document.addEventListener('mouseup', function() {
              if (draggingNode !== null) {
                var el = document.querySelectorAll('.iso-node')[draggingNode];
                el.style.zIndex = 10;
                draggingNode = null;
                canvas.classList.remove('node-dragging');
                updateMinimap();
              }
              isPanning = false;
              canvas.classList.remove('grabbing');
            });

            // ═══ Zoom ═══
            document.addEventListener('wheel', function(e) {
              e.preventDefault();
              var delta = e.deltaY > 0 ? 0.9 : 1.1;
              var newZoom = Math.min(3, Math.max(0.15, zoom * delta));
              var mx = e.clientX;
              var my = e.clientY;
              panX = mx - (mx - panX) * (newZoom / zoom);
              panY = my - (my - panY) * (newZoom / zoom);
              zoom = newZoom;
              applyTransform();
            }, { passive: false });

            // ═══ Controls ═══
            document.getElementById('zoomIn').onclick = function() {
              zoom = Math.min(3, zoom * 1.25);
              applyTransform();
            };
            document.getElementById('zoomOut').onclick = function() {
              zoom = Math.max(0.15, zoom / 1.25);
              applyTransform();
            };
            document.getElementById('resetBtn').onclick = function() {
              zoom = 1; panX = 0; panY = 0;
              applyTransform();
            };
            document.getElementById('fitBtn').onclick = fitToView;

            function fitToView() {
              if (nodeState.length === 0) return;
              var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
              nodeState.forEach(function(n) {
                if (n.px < minX) minX = n.px;
                if (n.py < minY) minY = n.py;
                if (n.px + NODE_W > maxX) maxX = n.px + NODE_W;
                if (n.py + NODE_H > maxY) maxY = n.py + NODE_H;
              });
              var contentW = maxX - minX + 100;
              var contentH = maxY - minY + 100;
              var viewW = window.innerWidth;
              var viewH = window.innerHeight;
              zoom = Math.min(viewW / contentW, viewH / contentH, 1.2) * 0.82;
              panX = (viewW - contentW * zoom) / 2 - minX * zoom + 50;
              panY = (viewH - contentH * zoom) / 2 - minY * zoom + 50;
              applyTransform();
            }

            // ═══ Minimap ═══
            function updateMinimap() {
              var minimap = document.getElementById('minimap');
              if (!minimap || nodeState.length === 0) return;
              var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
              nodeState.forEach(function(n) {
                if (n.px < minX) minX = n.px;
                if (n.py < minY) minY = n.py;
                if (n.px + NODE_W > maxX) maxX = n.px + NODE_W;
                if (n.py + NODE_H > maxY) maxY = n.py + NODE_H;
              });
              var pad = 30;
              var cW = maxX - minX + pad * 2;
              var cH = maxY - minY + pad * 2;
              var mW = 150, mH = 90;
              var scale = Math.min(mW / cW, mH / cH);

              var mhtml = '';
              nodeState.forEach(function(n) {
                var cc = getColor(n.type);
                var nx = (n.px - minX + pad) * scale;
                var ny = (n.py - minY + pad) * scale;
                var nw = NODE_W * scale;
                mhtml += '<div class="minimap-node" style="left:' + nx + 'px;top:' + ny + 'px;width:' + nw + 'px;height:' + Math.max(6, 8 * scale) + 'px;background:' + cc.border + '50;border-color:' + cc.border + '70;"></div>';
              });

              var vx = (-panX / zoom - minX + pad) * scale;
              var vy = (-panY / zoom - minY + pad) * scale;
              var vw = (window.innerWidth / zoom) * scale;
              var vh = (window.innerHeight / zoom) * scale;
              mhtml += '<div class="minimap-viewport" style="left:' + vx + 'px;top:' + vy + 'px;width:' + vw + 'px;height:' + vh + 'px;"></div>';
              minimap.innerHTML = mhtml;
            }

            // ═══ Legend ═══
            var types = [];
            nodeState.forEach(function(n) { if (types.indexOf(n.type) === -1) types.push(n.type); });
            var legendEl = document.createElement('div');
            legendEl.className = 'legend';
            legendEl.innerHTML = '<div class="legend-title">Components</div>' +
              types.map(function(t) {
                var cc = getColor(t);
                return '<div class="legend-item"><div class="legend-color" style="background:' + cc.border + '30;border-color:' + cc.border + ';"></div><span class="legend-label">' + t + '</span></div>';
              }).join('');
            document.body.appendChild(legendEl);

            // ═══ Stats ═══
            var statsEl = document.createElement('div');
            statsEl.className = 'stats-bar';
            statsEl.innerHTML = 
              '<div class="stat-item"><div class="stat-dot" style="background:#818cf8;"></div>' + nodeState.length + ' components</div>' +
              '<div class="stat-item"><div class="stat-dot" style="background:#22c55e;"></div>' + EDGES_RAW.length + ' connections</div>' +
              '<div class="stat-item"><div class="stat-dot" style="background:#f59e0b;"></div>' + types.length + ' layers</div>';
            document.body.appendChild(statsEl);

            // ═══ Title ═══
            var titleText = ${JSON.stringify(model.title || model.name || 'Architecture Diagram')};
            var titleEl = document.createElement('div');
            titleEl.className = 'diagram-title';
            titleEl.innerHTML = '<span class="diagram-title-text">' + titleText + '</span>' +
              '<span class="title-badge" style="background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#818cf8;">ISOMETRIC</span>' +
              '<span class="title-badge" style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);color:#22c55e;">AI Generated</span>';
            document.body.appendChild(titleEl);

            // ═══ Initial fit ═══
            setTimeout(fitToView, 150);
            window.addEventListener('resize', function() { setTimeout(fitToView, 50); });
            updateMinimap();
          <` + `/script>
        </body>
        </html>
      `;
    } catch(err) {
      return `<html><body style="color:#ef4444;background:#0a0e1a;padding:24px;font-family:system-ui;">
        <h3>⚠️ Error parsing Isoflow JSON</h3>
        <pre style="color:#94a3b8;margin-top:12px;font-size:12px;white-space:pre-wrap;">${value.slice(0, 800)}</pre>
        <p style="color:#64748b;margin-top:12px;font-size:12px;">Error: ${String(err)}</p>
      </body></html>`;
    }
  };

  const isRenderable = language === 'mermaid' || language === 'isoflow';
  const iframeHTML = language === 'mermaid' ? getMermaidHTML() : language === 'isoflow' ? getIsoflowHTML() : '';
  const iframeHeight = language === 'isoflow' ? 580 : 350;

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
            {language === 'isoflow' ? 'Isométrico 3D Interactivo' : 'Diagrama'}
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

      {/* Content */}
      {isRenderable && !showCode ? (
        <div className="bg-[#0a0e1a]">
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
              Diagrama {language === 'isoflow' ? 'Isométrico 3D Interactivo' : language.toUpperCase()}
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