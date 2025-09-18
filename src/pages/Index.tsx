import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Users, Zap, Download, CheckCircle, Plus } from "lucide-react";
import heroImage from "@/assets/editorial-hero.jpg";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "draft" | "in-progress" | "completed";
  createdAt: string;
}

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateProject = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a project title",
        variant: "destructive",
      });
      return;
    }

    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    setProjects([newProject, ...projects]);
    setFormData({ title: "", description: "" });
    setShowCreateForm(false);
    
    toast({
      title: "Project Created",
      description: `"${newProject.title}" is ready for content`,
    });
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "draft": return "secondary";
      case "in-progress": return "default";
      case "completed": return "default";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={heroImage} alt="Editorial workflow" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Article Drafting Assistant</h1>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Transform interview transcripts and research sources into compelling, well-sourced articles 
            with intelligent extraction, human-in-the-loop editing, and automated provenance tracking.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/20">
              <FileText className="w-8 h-8 mb-3 text-accent" />
              <h3 className="font-semibold mb-2">Smart Extraction</h3>
              <p className="text-sm text-primary-foreground/80">Extract key points from transcripts and sources automatically</p>
            </div>
            
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/20">
              <Users className="w-8 h-8 mb-3 text-accent" />
              <h3 className="font-semibold mb-2">Human Control</h3>
              <p className="text-sm text-primary-foreground/80">Review, edit, and reorder content with intuitive controls</p>
            </div>
            
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/20">
              <Zap className="w-8 h-8 mb-3 text-accent" />
              <h3 className="font-semibold mb-2">Draft Generation</h3>
              <p className="text-sm text-primary-foreground/80">Generate coherent articles with source mapping and quotes</p>
            </div>
            
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/20">
              <Download className="w-8 h-8 mb-3 text-accent" />
              <h3 className="font-semibold mb-2">Export & Provenance</h3>
              <p className="text-sm text-primary-foreground/80">Export with full source tracking and citation mapping</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Your Projects</h2>
              <p className="text-muted-foreground">Manage your article drafting projects</p>
            </div>
            
            <Button 
              onClick={() => setShowCreateForm(true)}
              variant="default"
              size="lg"
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              New Project
            </Button>
          </div>

          {/* Create Project Form */}
          {showCreateForm && (
            <Card className="mb-8 border-accent/20 shadow-lg">
              <CardHeader>
                <CardTitle>Create New Project</CardTitle>
                <CardDescription>Start a new article drafting workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., 'AI Ethics Interview Analysis'"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the article focus..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleCreateProject} variant="default">
                    Create Project
                  </Button>
                  <Button 
                    onClick={() => setShowCreateForm(false)} 
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground mb-6">Create your first article drafting project to get started</p>
                <Button onClick={() => setShowCreateForm(true)} variant="default">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            ) : (
              projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => navigate(`/project/${project.id}`)}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {project.title}
                      </CardTitle>
                      <Badge variant={getStatusColor(project.status)}>
                        {project.status === "draft" && "Draft"}
                        {project.status === "in-progress" && "In Progress"}
                        {project.status === "completed" && <><CheckCircle className="w-3 h-3 mr-1" />Complete</>}
                      </Badge>
                    </div>
                    <CardDescription>{project.description || "No description provided"}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    
                    <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/project/${project.id}`);
                    }}>
                      Open Project
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;