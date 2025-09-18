import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Upload, 
  Link, 
  Video, 
  CheckCircle, 
  Edit3, 
  ArrowRight,
  Download
} from "lucide-react";
import { TranscriptInput } from "@/components/TranscriptInput";
import { SourceManager } from "@/components/SourceManager";
import { KeyPointsEditor } from "@/components/KeyPointsEditor";
import { DraftGenerator } from "@/components/DraftGenerator";

interface ProjectData {
  id: string;
  title: string;
  transcript?: string;
  sources: Array<{
    id: string;
    type: "pdf" | "url" | "youtube";
    name: string;
    url?: string;
    content?: string;
    status: "pending" | "processing" | "ready" | "error";
  }>;
  keyPoints: Array<{
    id: string;
    text: string;
    sourceId?: string;
    category?: string;
    approved: boolean;
  }>;
  storyDirection?: {
    tone: string;
    angle: string;
    length: string;
  };
  draft?: {
    content: string;
    sourceMapping: Record<string, string[]>;
    generatedAt: string;
  };
}

const ProjectDashboard = () => {
  const [projectData, setProjectData] = useState<ProjectData>({
    id: "demo-project",
    title: "AI Ethics Interview Analysis",
    sources: [],
    keyPoints: [],
  });

  const [currentStep, setCurrentStep] = useState<"transcript" | "sources" | "keypoints" | "draft">("transcript");

  // Calculate progress
  const calculateProgress = () => {
    let progress = 0;
    if (projectData.transcript) progress += 25;
    if (projectData.sources.some(s => s.status === "ready")) progress += 25;
    if (projectData.keyPoints.some(kp => kp.approved)) progress += 25;
    if (projectData.draft) progress += 25;
    return progress;
  };

  const getStepStatus = (step: string) => {
    switch (step) {
      case "transcript":
        return projectData.transcript ? "completed" : "current";
      case "sources":
        return projectData.sources.some(s => s.status === "ready") 
          ? "completed" 
          : projectData.transcript ? "current" : "pending";
      case "keypoints":
        return projectData.keyPoints.some(kp => kp.approved)
          ? "completed"
          : projectData.sources.some(s => s.status === "ready") ? "current" : "pending";
      case "draft":
        return projectData.draft
          ? "completed"
          : projectData.keyPoints.some(kp => kp.approved) ? "current" : "pending";
      default:
        return "pending";
    }
  };

  const getStepIcon = (step: string, status: string) => {
    if (status === "completed") return <CheckCircle className="w-5 h-5 text-success" />;
    
    switch (step) {
      case "transcript": return <FileText className="w-5 h-5" />;
      case "sources": return <Link className="w-5 h-5" />;
      case "keypoints": return <Edit3 className="w-5 h-5" />;
      case "draft": return <Download className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{projectData.title}</h1>
              <p className="text-muted-foreground">Article drafting workflow</p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-2">Progress</div>
              <div className="flex items-center gap-3">
                <Progress value={calculateProgress()} className="w-32" />
                <span className="text-sm font-medium">{calculateProgress()}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Workflow Steps Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Steps</CardTitle>
                <CardDescription>Follow these steps to create your article</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "transcript", label: "Add Transcript", desc: "Upload or paste interview content" },
                  { key: "sources", label: "Attach Sources", desc: "Add supporting materials" },
                  { key: "keypoints", label: "Review Key Points", desc: "Edit extracted insights" },
                  { key: "draft", label: "Generate Draft", desc: "Create final article" }
                ].map((step, index) => {
                  const status = getStepStatus(step.key);
                  
                  return (
                    <div 
                      key={step.key}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        currentStep === step.key 
                          ? "bg-accent-subtle border border-accent/30" 
                          : status === "completed" 
                            ? "bg-success/10 border border-success/20"
                            : "hover:bg-muted/50"
                      }`}
                      onClick={() => status !== "pending" && setCurrentStep(step.key as any)}
                    >
                      <div className="mt-0.5">
                        {getStepIcon(step.key, status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium text-sm ${
                            status === "completed" ? "text-success" : "text-foreground"
                          }`}>
                            {step.label}
                          </span>
                          {status === "completed" && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">Done</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{step.desc}</p>
                      </div>
                      
                      {index < 3 && (
                        <ArrowRight className={`w-4 h-4 mt-1 ${
                          status === "completed" ? "text-success" : "text-muted-foreground"
                        }`} />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
              <TabsContent value="transcript">
                <TranscriptInput 
                  projectData={projectData}
                  onUpdate={setProjectData}
                  onNext={() => setCurrentStep("sources")}
                />
              </TabsContent>
              
              <TabsContent value="sources">
                <SourceManager 
                  projectData={projectData}
                  onUpdate={setProjectData}
                  onNext={() => setCurrentStep("keypoints")}
                />
              </TabsContent>
              
              <TabsContent value="keypoints">
                <KeyPointsEditor 
                  projectData={projectData}
                  onUpdate={setProjectData}
                  onNext={() => setCurrentStep("draft")}
                />
              </TabsContent>
              
              <TabsContent value="draft">
                <DraftGenerator 
                  projectData={projectData}
                  onUpdate={setProjectData}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;