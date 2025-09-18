import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const { toast } = useToast();

  const handleExtractPoints = async () => {
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
      const { data, error } = await supabase.functions.invoke('extract-key-points', {
        body: {
          transcript: projectData.transcript,
          sources: projectData.sources
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to extract key points');
      }

      if (data?.keyPoints) {
        setExtractedPoints(data.keyPoints);
        toast({
          title: "Key Points Extracted",
          description: `Found ${data.keyPoints.length} key insights from your sources`,
        });
      } else {
        throw new Error('No key points returned from the API');
      }
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
                {isExtracting ? "Extracting..." : "Extract Key Points"}
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