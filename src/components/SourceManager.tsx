import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Link, 
  FileText, 
  Video, 
  Plus, 
  Trash2, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Globe
} from "lucide-react";

interface SourceManagerProps {
  projectData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export const SourceManager = ({ projectData, onUpdate, onNext }: SourceManagerProps) => {
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceType, setNewSourceType] = useState<"url" | "pdf" | "youtube">("url");
  const { toast } = useToast();

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="w-4 h-4" />;
      case "youtube": return <Video className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getSourceColor = (type: string) => {
    switch (type) {
      case "pdf": return "source-pdf";
      case "youtube": return "source-youtube";
      default: return "source-url";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return <CheckCircle className="w-4 h-4 text-success" />;
      case "processing": return <Clock className="w-4 h-4 text-warning animate-pulse" />;
      case "error": return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const detectSourceType = (url: string): "url" | "pdf" | "youtube" => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.toLowerCase().endsWith(".pdf")) return "pdf";
    return "url";
  };

  const addSource = async () => {
    if (!newSourceUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    const type = detectSourceType(newSourceUrl);
    const newSource = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      name: newSourceUrl.split('/').pop() || "Untitled Source",
      url: newSourceUrl,
      status: "processing" as const,
    };

    const updatedSources = [...projectData.sources, newSource];
    onUpdate({
      ...projectData,
      sources: updatedSources,
    });

    setNewSourceUrl("");

    // Simulate processing
    setTimeout(() => {
      const processedSources = updatedSources.map(s => 
        s.id === newSource.id 
          ? { ...s, status: "ready" as const, name: `${type.toUpperCase()} Source ${s.id.slice(-4)}` }
          : s
      );
      
      onUpdate({
        ...projectData,
        sources: processedSources,
      });
      
      toast({
        title: "Source Added",
        description: `${type.toUpperCase()} source processed successfully`,
      });
    }, 2000);
  };

  const removeSource = (sourceId: string) => {
    const updatedSources = projectData.sources.filter((s: any) => s.id !== sourceId);
    onUpdate({
      ...projectData,
      sources: updatedSources,
    });
    
    toast({
      title: "Source Removed",
      description: "Source has been deleted from the project",
    });
  };

  const hasReadySources = projectData.sources.some((s: any) => s.status === "ready");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Supporting Sources
          </CardTitle>
          <CardDescription>
            Add PDFs, web articles, or YouTube videos to support your article with additional context and citations
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Add New Source */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Add New Source</h3>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="https://example.com/article or YouTube URL or PDF link"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSource()}
                />
              </div>
              <Button onClick={addSource} className="gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                Add Source
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Supported: Web articles, PDF documents, YouTube videos
            </div>
          </div>

          {/* Sources List */}
          {projectData.sources.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-medium">Added Sources ({projectData.sources.length})</h3>
              
              {projectData.sources.map((source: any) => (
                <div key={source.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-md`} style={{backgroundColor: `hsl(var(--${getSourceColor(source.type)}) / 0.1)`}}>
                        {getSourceIcon(source.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{source.name}</span>
                          <Badge 
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: `hsl(var(--${getSourceColor(source.type)}) / 0.1)`,
                              color: `hsl(var(--${getSourceColor(source.type)}))`
                            }}
                          >
                            {source.type.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {source.url && (
                          <div className="text-sm text-muted-foreground truncate">
                            {source.url}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getStatusIcon(source.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSource(source.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {source.status === "processing" && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      Processing source content...
                    </div>
                  )}
                  
                  {source.status === "error" && (
                    <div className="mt-3 text-sm text-destructive">
                      Failed to process this source. Please check the URL and try again.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <Link className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-2">No Sources Added Yet</h3>
              <p className="text-sm text-muted-foreground">
                Add supporting sources to enrich your article with additional context and citations
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center gap-2">
              {hasReadySources && (
                <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                  ✓ {projectData.sources.filter((s: any) => s.status === "ready").length} Sources Ready
                </Badge>
              )}
            </div>
            
            <Button 
              onClick={onNext}
              disabled={!hasReadySources}
              className="gap-2"
            >
              Extract Key Points
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};