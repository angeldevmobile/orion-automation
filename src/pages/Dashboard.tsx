import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import { getUserProjects, deleteProject, type Project } from '@/services/orionApi';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProjects = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'No autenticado',
        description: 'Por favor inicia sesión',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await getUserProjects(token);
      
      if (response.success) {
        setProjects(response.data);
      } else {
        throw new Error(response.error || 'Error al cargar proyectos');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los proyectos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  const handleDeleteProject = async (projectId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await deleteProject(projectId, token);
      
      if (response.success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        toast({
          title: 'Proyecto eliminado',
          description: 'El proyecto se ha eliminado correctamente',
        });
      } else {
        throw new Error(response.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el proyecto',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando proyectos...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold mb-1">Tus proyectos</h1>
            <p className="text-muted-foreground">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'proyecto activo' : 'proyectos activos'}
            </p>
          </div>
          <Button variant="hero" asChild className="group">
            <Link to="/new-project">
              <Plus className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
              Nuevo proyecto
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div 
          className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar proyectos..." 
              className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="default" className="transition-all duration-200 hover:border-primary/50">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No se encontraron proyectos' : 'Aún no tienes proyectos'}
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchTerm 
                  ? 'Intenta con otro término de búsqueda'
                  : 'Crea tu primer proyecto para comenzar a analizar código con IA'
                }
              </p>
              {!searchTerm && (
                <Button variant="hero" asChild>
                  <Link to="/new-project">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primer proyecto
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <div 
                key={project.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${0.15 + index * 0.05}s` }}
              >
                <ProjectCard 
                  project={project} 
                  onDelete={handleDeleteProject}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
