import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GitBranch, FileText, Database, ArrowRight, Clock, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const typeIcons = {
  code: GitBranch,
  documents: FileText,
  data: Database,
};

const typeLabels = {
  code: 'Código',
  documents: 'Documentos',
  data: 'Datos',
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return 'Hace unos minutos';
  if (diffInHours < 24) return `Hace ${diffInHours}h`;
  if (diffInDays < 7) return `Hace ${diffInDays}d`;
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    type: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    settings?: Record<string, unknown>;
  };
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const projectType = project.type as keyof typeof typeIcons;
  const TypeIcon = typeIcons[projectType] || GitBranch;
  const typeLabel = typeLabels[projectType] || 'Proyecto';
  
  const [confirmationText, setConfirmationText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(project.id);
      setConfirmationText('');
      setIsOpen(false);
    }
  };

  const isDeleteEnabled = confirmationText === project.name;

  return (
    <Card className="group border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TypeIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <span className="text-xs text-muted-foreground">{typeLabel}</span>
          </div>
        </div>
        <div className="flex gap-1">
          {onDelete && (
            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3">
                      <p>
                        Esta acción no se puede deshacer. Se eliminarán todos los análisis y archivos asociados al proyecto.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          Escribe <span className="font-bold text-destructive">{project.name}</span> para confirmar:
                        </p>
                        <Input
                          placeholder="Nombre del proyecto"
                          value={confirmationText}
                          onChange={(e) => setConfirmationText(e.target.value)}
                          className="border-destructive/50 focus-visible:ring-destructive/50"
                        />
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmationText('')}>
                    Cancelar
                  </AlertDialogCancel>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={!isDeleteEnabled}
                  >
                    Eliminar proyecto
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <Badge className="text-xs font-medium border bg-primary/10 text-primary border-primary/20 mb-3">
          Activo
        </Badge>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description || 'Sin descripción'}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Actualizado {formatDate(project.updatedAt)}</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300" 
          asChild
        >
          <Link to={`/project/${project.id}`}>
            Abrir proyecto
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
