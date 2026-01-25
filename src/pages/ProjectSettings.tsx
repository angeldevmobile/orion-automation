import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Trash2, Brain, Shield, Code } from 'lucide-react';
import { mockProjects } from '@/lib/mock-data';

export default function ProjectSettings() {
  const { id } = useParams();
  const project = mockProjects.find((p) => p.id === id) || mockProjects[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/project/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al proyecto
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Configuración del proyecto</h1>
          <p className="text-muted-foreground">
            Gestiona las reglas, memoria y preferencias de {project.name}
          </p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información general</CardTitle>
              <CardDescription>Datos básicos del proyecto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del proyecto</Label>
                <Input id="name" defaultValue={project.name} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description" 
                  defaultValue={project.description}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Reglas del proyecto
              </CardTitle>
              <CardDescription>
                Define cómo la IA debe analizar y trabajar con tu código
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="style">Preferencias de estilo</Label>
                <Textarea 
                  id="style" 
                  placeholder="Ej: Usar camelCase, preferir funciones arrow, evitar any..."
                  className="mt-2 font-mono text-sm"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="restrictions">Restricciones</Label>
                <Textarea 
                  id="restrictions" 
                  placeholder="Ej: No usar librerías externas sin aprobación, evitar código complejo..."
                  className="mt-2 font-mono text-sm"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Memory */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Memoria de la IA
              </CardTitle>
              <CardDescription>
                Controla qué información recuerda la IA sobre este proyecto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mantener historial de decisiones</Label>
                  <p className="text-sm text-muted-foreground">
                    La IA recordará las decisiones tomadas anteriormente
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Aprender de correcciones</Label>
                  <p className="text-sm text-muted-foreground">
                    La IA ajustará sus sugerencias basándose en tu feedback
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Contexto extendido</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que la IA analice más archivos simultáneamente
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Reiniciar memoria del proyecto
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Configuración de privacidad y acceso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Excluir archivos sensibles</Label>
                  <p className="text-sm text-muted-foreground">
                    Ignora .env, secrets.*, y archivos de credenciales
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div>
                <Label htmlFor="ignore">Patrones a ignorar</Label>
                <Textarea 
                  id="ignore" 
                  defaultValue="node_modules/&#10;.git/&#10;*.log&#10;.env*"
                  className="mt-2 font-mono text-sm"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Zona de peligro</CardTitle>
              <CardDescription>
                Acciones irreversibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar proyecto
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button variant="hero" size="lg">
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
