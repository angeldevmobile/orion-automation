import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, File, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'other';
}

interface FileAttachmentProps {
  files: AttachedFile[];
  onRemove: (id: string) => void;
}

export function FileAttachment({ files, onRemove }: FileAttachmentProps) {
  if (files.length === 0) return null;

  const getFileIcon = (type: AttachedFile['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {files.map((file) => (
        <div
          key={file.id}
          className={cn(
            "relative group flex items-center gap-2 p-2 rounded-lg border border-border bg-card",
            "hover:bg-accent transition-colors max-w-xs"
          )}
        >
          {file.type === 'image' && file.preview ? (
            <img
              src={file.preview}
              alt={file.file.name}
              className="h-12 w-12 object-cover rounded"
            />
          ) : (
            <div className="h-12 w-12 flex items-center justify-center bg-muted rounded">
              {getFileIcon(file.type)}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{file.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.file.size)}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(file.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}