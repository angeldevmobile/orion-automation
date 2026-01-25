import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlack';
import { cn } from '@/lib/utils';
import type { Components } from 'react-markdown';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  const components: Components = {
    // Bloques de código
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const value = String(children).replace(/\n$/, '');
      const isInline = !className;

      return !isInline ? (
        <CodeBlock language={language} value={value} />
      ) : (
        <code
          className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    // Títulos
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
    ),
    // Listas
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1 my-3">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1 my-3">{children}</ol>
    ),
    li: ({ children }) => <li className="ml-4">{children}</li>,
    // Enlaces
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {children}
      </a>
    ),
    // Párrafos
    p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/50 pl-4 italic my-3 text-muted-foreground">
        {children}
      </blockquote>
    ),
    // Tablas
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-border rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-muted/50">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-left font-semibold border-b border-border">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 border-b border-border">{children}</td>
    ),
  };

  return (
    <div className={cn('prose prose-sm max-w-none dark:prose-invert', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}