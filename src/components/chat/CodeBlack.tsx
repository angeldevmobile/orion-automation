import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface CodeBlockProps {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determinar si el tema es oscuro
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const codeStyle = isDark ? vscDarkPlus : vs;

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-border">
      {/* Header con lenguaje y botón copiar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground uppercase">
          {language || 'code'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copiar
            </>
          )}
        </Button>
      </div>

      {/* Código con resaltado de sintaxis */}
      <div className="overflow-x-auto bg-muted/30">
        <SyntaxHighlighter
          language={language}
          style={codeStyle}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-mono, "Courier New", monospace)',
            },
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}