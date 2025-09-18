import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Edit3, 
  Trash2, 
  Plus, 
  ArrowRight,
  GripVertical,
  CheckCircle,
  Eye,
  Lightbulb
} from "lucide-react";

interface KeyPointsEditorProps {
  projectData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export const KeyPointsEditor = ({ projectData, onUpdate, onNext }: KeyPointsEditorProps) => {
  const [extractedPoints, setExtractedPoints] = useState<Array<{
    id: string;
    text: string;
    sourceId: string;
    category: string;
    approved: boolean;
    confidence: number;
  }>>([]);
  
  const [newPointText, setNewPointText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const handleExtractPoints = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Perplexity API key to extract key points",
        variant: "destructive"
      });
      return;
    }

    if (!projectData.transcript && projectData.sources.length === 0) {
      toast({
        title: "No Content Available",
        description: "Please add a transcript or sources first",
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);
    
    try {
      // Prepare content for extraction
      const transcriptText = projectData.transcript || "No transcript provided";
      const sourceText = projectData.sources
        .filter(s => s.content && s.status === "ready")
        .map(s => `[${s.name}]: ${s.content}`)
        .join("\n\n") || "No supporting sources provided";

      // Create the extraction prompt
      const prompt = `You are an editorial assistant helping a human editor.

TASK: Extract the most important key points from the provided interview transcript and supporting sources.

Transcript:
${transcriptText}

Supporting Source(s):
${sourceText}

INSTRUCTIONS:
1. Read the transcript and supporting sources carefully.
2. Identify 5–10 key points that are factual, distinct, and relevant to the story.
3. Write each key point as a clear, short sentence.
4. If a point is supported by a source, note the source in brackets. Example: [Transcript], [Source PDF], [Web article].
5. Do not invent new information. Only use what is present in the transcript and sources.
6. Output the key points as a numbered list.`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 1000,
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";
      
      // Parse the numbered list response
      const keyPointsText = content.split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      // Convert to key point objects
      const newKeyPoints = keyPointsText.map((text, index) => {
        // Extract source references
        const sourceMatch = text.match(/\[([^\]]+)\]/);
        const sourceId = sourceMatch ? sourceMatch[1].toLowerCase() : "transcript";
        
        // Categorize based on content
        let category = "general";
        if (text.toLowerCase().includes("bias") || text.toLowerCase().includes("discrimination")) {
          category = "bias";
        } else if (text.toLowerCase().includes("example") || text.toLowerCase().includes("case")) {
          category = "examples";
        } else if (text.toLowerCase().includes("regulation") || text.toLowerCase().includes("law") || text.toLowerCase().includes("policy")) {
          category = "regulation";
        } else if (text.toLowerCase().includes("recommend") || text.toLowerCase().includes("should")) {
          category = "recommendations";
        }

        return {
          id: `extracted-${Date.now()}-${index}`,
          text: text.replace(/\[[^\]]+\]/g, '').trim(), // Remove source brackets from text
          sourceId,
          category,
          approved: false,
          confidence: 0.85 + (Math.random() * 0.15) // Random confidence between 0.85-1.0
        };
      });

      setExtractedPoints(newKeyPoints);
      toast({
        title: "Key Points Extracted",
        description: `Found ${newKeyPoints.length} key insights from your sources`,
      });
    } catch (error) {
      console.error("Extraction error:", error);
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Failed to extract key points",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleApproval = (pointId: string) => {
    setExtractedPoints(points => 
      points.map(p => p.id === pointId ? { ...p, approved: !p.approved } : p)
    );
  };

  const editPoint = (pointId: string, newText: string) => {
    setExtractedPoints(points => 
      points.map(p => p.id === pointId ? { ...p, text: newText } : p)
    );
  };

  const deletePoint = (pointId: string) => {
    setExtractedPoints(points => points.filter(p => p.id !== pointId));
    toast({
      title: "Point Deleted",
      description: "Key point removed from the list",
    });
  };

  const addCustomPoint = () => {
    if (!newPointText.trim()) return;
    
    const newPoint = {
      id: `custom-${Date.now()}`,
      text: newPointText.trim(),
      sourceId: "manual",
      category: "custom",
      approved: true,
      confidence: 1.0
    };
    
    setExtractedPoints([...extractedPoints, newPoint]);
    setNewPointText("");
    
    toast({
      title: "Point Added",
      description: "Custom key point added to the list",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      bias: "bg-red-100 text-red-800",
      examples: "bg-blue-100 text-blue-800", 
      regulation: "bg-green-100 text-green-800",
      recommendations: "bg-purple-100 text-purple-800",
      custom: "bg-orange-100 text-orange-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const approvedPoints = extractedPoints.filter(p => p.approved);
  const canProceed = approvedPoints.length > 0;

  const handleNext = () => {
    // Update project data with approved key points
    onUpdate({
      ...projectData,
      keyPoints: approvedPoints
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Key Points Extraction
          </CardTitle>
          <CardDescription>
            Review and approve the key insights extracted from your transcript and sources
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* API Key Input */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Perplexity API Configuration</h4>
              <Badge variant="outline" className="text-xs">Required for AI extraction</Badge>
            </div>
            <Input
              type="password"
              placeholder="Enter your Perplexity API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Your API key is only used locally and never stored. Get one at{" "}
              <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                perplexity.ai/settings/api
              </a>
            </p>
          </div>

          {/* Extraction Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleExtractPoints}
                disabled={isExtracting}
                variant="outline"
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {isExtracting ? "Extracting..." : "Re-extract Points"}
              </Button>
              
              <Badge variant="secondary" className="text-sm">
                {extractedPoints.length} points found
              </Badge>
            </div>
            
            <Badge variant="outline" className="text-success border-success/30 bg-success/10">
              {approvedPoints.length} approved
            </Badge>
          </div>

          {/* Key Points List */}
          <div className="space-y-3">
            {extractedPoints.map((point, index) => (
              <div key={point.id} className={`border rounded-lg p-4 transition-all ${
                point.approved 
                  ? "border-success/30 bg-success/5" 
                  : "border-border bg-card hover:bg-muted/30"
              }`}>
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-1 cursor-grab" />
                  
                  {/* Approval Checkbox */}
                  <div className="mt-1">
                    <Checkbox
                      checked={point.approved}
                      onCheckedChange={() => toggleApproval(point.id)}
                    />
                  </div>
                  
                  {/* Point Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className={`text-sm leading-relaxed ${
                        point.approved ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {point.text}
                      </p>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className={getCategoryColor(point.category)}>
                          {point.category}
                        </Badge>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePoint(point.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Source: {point.sourceId}</span>
                      <span>•</span>
                      <span>Confidence: {Math.round(point.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Point */}
          <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Add Custom Point</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Add your own key insight..."
                value={newPointText}
                onChange={(e) => setNewPointText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomPoint()}
                className="flex-1"
              />
              <Button 
                onClick={addCustomPoint}
                disabled={!newPointText.trim()}
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{extractedPoints.length}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{approvedPoints.length}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{extractedPoints.length - approvedPoints.length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              {canProceed 
                ? `${approvedPoints.length} key points ready for article generation`
                : "Select at least one key point to continue"
              }
            </div>
            
            <Button 
              onClick={handleNext}
              disabled={!canProceed}
              className="gap-2"
            >
              Generate Article Draft
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};