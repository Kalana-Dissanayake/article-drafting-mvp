import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Settings, 
  Zap, 
  Eye,
  MousePointer,
  Quote,
  CheckCircle
} from "lucide-react";

interface DraftGeneratorProps {
  projectData: any;
  onUpdate: (data: any) => void;
}

export const DraftGenerator = ({ projectData, onUpdate }: DraftGeneratorProps) => {
  const [storyDirection, setStoryDirection] = useState({
    tone: "informative",
    angle: "balanced",
    length: "medium"
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [hoveredParagraph, setHoveredParagraph] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Sample generated article
  const sampleDraft = `# The Growing Challenge of AI Bias: Lessons from Recent Developments

Artificial intelligence systems are becoming increasingly integrated into our daily lives, from hiring decisions to loan approvals. However, as these systems become more pervasive, a critical concern has emerged: the perpetuation and amplification of societal biases present in training data.

## Real-World Examples of AI Bias

The impact of biased AI systems has been documented across multiple industries. **Hiring algorithms have discriminated against women in real-world applications**, creating unfair barriers to employment opportunities. Similarly, **facial recognition systems have been shown to perform poorly on darker skin tones**, raising serious questions about equitable technology deployment.

Dr. Sarah Chen, an AI researcher at Stanford University, emphasizes the scope of this challenge: *"These aren't intentional issues—they emerge from biased training data or inadequate testing across diverse populations."*

## The Path Forward: Regulation and Awareness

The regulatory landscape is beginning to respond to these challenges. **The EU's AI Act represents progress in proactive governance frameworks**, though experts argue that global coordination remains essential for effective oversight.

For consumers, awareness is key. As Dr. Chen notes: *"Understand that AI systems make mistakes, can be biased, and their decisions aren't necessarily neutral or objective. Always maintain human judgment and don't defer completely to algorithmic recommendations."*

## Conclusion

The future of ethical AI depends on continued vigilance from developers, regulators, and users alike. While technical solutions like bias auditing tools and explainable AI methods show promise, the human element—maintaining critical thinking and diverse perspectives—remains irreplaceable.`;

  const generateDraft = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const draft = {
        content: sampleDraft,
        sourceMapping: {
          "p1": ["transcript"],
          "p2": ["transcript", "source1"],
          "p3": ["transcript"],
          "p4": ["transcript", "source2"],
          "p5": ["transcript"]
        },
        generatedAt: new Date().toISOString()
      };
      
      onUpdate({
        ...projectData,
        storyDirection,
        draft
      });
      
      setIsGenerating(false);
      toast({
        title: "Draft Generated",
        description: "Article draft created with source mapping",
      });
    }, 3000);
  };

  const exportMarkdown = () => {
    const markdown = projectData.draft?.content || sampleDraft;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectData.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete", 
      description: "Markdown file downloaded successfully",
    });
  };

  const exportProvenance = () => {
    const provenanceData = {
      projectTitle: projectData.title,
      generatedAt: projectData.draft?.generatedAt || new Date().toISOString(),
      sources: projectData.sources,
      keyPoints: projectData.keyPoints,
      sourceMapping: projectData.draft?.sourceMapping || {},
      storyDirection: projectData.storyDirection || storyDirection
    };
    
    const blob = new Blob([JSON.stringify(provenanceData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectData.title.replace(/\s+/g, '-').toLowerCase()}-provenance.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Provenance Exported",
      description: "Source mapping data downloaded",
    });
  };

  const quotes = [
    {
      id: "q1",
      text: "These aren't intentional issues—they emerge from biased training data or inadequate testing across diverse populations.",
      source: "Dr. Sarah Chen (Interview Transcript)",
      context: "Discussion about AI bias origins"
    },
    {
      id: "q2", 
      text: "Understand that AI systems make mistakes, can be biased, and their decisions aren't necessarily neutral or objective.",
      source: "Dr. Sarah Chen (Interview Transcript)",
      context: "Advice for consumers"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Story Direction Controls */}
      {!projectData.draft && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Story Direction
            </CardTitle>
            <CardDescription>
              Configure the tone, angle, and length for your article draft
            </CardDescription>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={storyDirection.tone} onValueChange={(value) => 
                setStoryDirection(prev => ({ ...prev, tone: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="informative">Informative</SelectItem>
                  <SelectItem value="analytical">Analytical</SelectItem>
                  <SelectItem value="investigative">Investigative</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="angle">Angle</Label>
              <Select value={storyDirection.angle} onValueChange={(value) => 
                setStoryDirection(prev => ({ ...prev, angle: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="optimistic">Optimistic</SelectItem>
                  <SelectItem value="cautionary">Cautionary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="length">Target Length</Label>
              <Select value={storyDirection.length} onValueChange={(value) => 
                setStoryDirection(prev => ({ ...prev, length: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (500 words)</SelectItem>
                  <SelectItem value="medium">Medium (1000 words)</SelectItem>
                  <SelectItem value="long">Long (2000+ words)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Draft Generation
          </CardTitle>
          <CardDescription>
            Generate your article draft with integrated source mapping and quote verification
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!projectData.draft ? (
            <div className="text-center py-8">
              <Button 
                onClick={generateDraft}
                disabled={isGenerating}
                size="lg"
                className="gap-2"
              >
                <Zap className="w-5 h-5" />
                {isGenerating ? "Generating Draft..." : "Generate Article Draft"}
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4">
                Using {projectData.keyPoints?.length || 0} approved key points from {projectData.sources?.length || 0} sources
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <div className="font-medium">Draft Generated</div>
                  <div className="text-sm text-muted-foreground">
                    Created {new Date(projectData.draft.generatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <Button onClick={generateDraft} variant="outline" className="gap-2">
                <Zap className="w-4 h-4" />
                Regenerate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Article Preview */}
      {(projectData.draft || isGenerating) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Article Draft
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span>Interactive preview with source mapping</span>
              <div className="flex items-center gap-2">
                <MousePointer className="w-3 h-3" />
                <span className="text-xs">Hover paragraphs to see sources</span>
              </div>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {isGenerating ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Generating article draft...</p>
              </div>
            ) : (
              <>
                {/* Article Content */}
                <div className="prose prose-sm max-w-none bg-background border border-border rounded-lg p-6">
                  <div 
                    className="whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: 
                      sampleDraft
                        .split('\n\n')
                        .map((paragraph, index) => 
                          `<div 
                            class="paragraph-hover p-2 -m-2 rounded transition-colors hover:bg-accent-subtle/50 cursor-pointer" 
                            data-paragraph="p${index + 1}"
                          >${paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
                                     .replace(/\*(.*?)\*/g, '<em class="text-accent-foreground">$1</em>')}</div>`
                        )
                        .join('')
                    }}
                  />
                </div>

                {/* Source Mapping Panel */}
                {hoveredParagraph && (
                  <div className="bg-accent-subtle border border-accent/30 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Sources for this section:
                    </h4>
                    <div className="space-y-2">
                      {["Interview Transcript", "Supporting Source"].map((source, index) => (
                        <Badge key={index} variant="secondary" className="mr-2">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quote Checker */}
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Quote className="w-4 h-4" />
                      Quote Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {quotes.map((quote) => (
                      <div key={quote.id} className="border border-border rounded-lg p-3 bg-background">
                        <div className="text-sm mb-2">
                          <Quote className="w-3 h-3 inline mr-1" />
                          "{quote.text}"
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <strong>Source:</strong> {quote.source} • <strong>Context:</strong> {quote.context}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Export Controls */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={exportMarkdown} className="gap-2">
                    <Download className="w-4 h-4" />
                    Export Markdown
                  </Button>
                  <Button onClick={exportProvenance} variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Export Provenance
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};