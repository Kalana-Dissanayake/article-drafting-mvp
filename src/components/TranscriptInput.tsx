import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Mic, ArrowRight, AlertCircle } from "lucide-react";

interface TranscriptInputProps {
  projectData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export const TranscriptInput = ({ projectData, onUpdate, onNext }: TranscriptInputProps) => {
  const [transcript, setTranscript] = useState(projectData.transcript || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTranscript(content);
      toast({
        title: "File Uploaded",
        description: `Successfully loaded ${file.name}`,
      });
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Transcript Required",
        description: "Please enter or upload a transcript before proceeding",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      onUpdate({
        ...projectData,
        transcript: transcript.trim(),
      });
      
      setIsProcessing(false);
      toast({
        title: "Transcript Saved",
        description: "Ready to add supporting sources",
      });
      onNext();
    }, 1500);
  };

  const sampleTranscripts = [
    {
      title: "AI Ethics Discussion",
      preview: "Host: Today we're discussing the ethical implications of artificial intelligence...",
      content: `Host: Today we're discussing the ethical implications of artificial intelligence with Dr. Sarah Chen, AI researcher at Stanford University.

Dr. Chen: Thank you for having me. AI ethics is becoming increasingly critical as these systems become more pervasive in our daily lives.

Host: What are the main concerns you see in current AI development?

Dr. Chen: There are several key issues. First, bias in AI systems - these models often perpetuate or amplify existing societal biases present in their training data. Second, transparency and explainability - many AI systems are "black boxes" that make decisions without clear reasoning that humans can understand.

Host: Can you give us a specific example of bias in AI?

Dr. Chen: Certainly. We've seen hiring algorithms that discriminated against women, facial recognition systems that performed poorly on darker skin tones, and loan approval systems that unfairly denied credit to certain demographic groups. These aren't intentional - they emerge from biased training data or inadequate testing across diverse populations.

Host: What about the future of AI regulation?

Dr. Chen: I believe we need proactive governance frameworks. The EU's AI Act is a good start, but we need global coordination. We also need technical solutions like bias auditing tools, explainable AI methods, and diverse development teams.

Host: What should consumers know about AI systems they interact with daily?

Dr. Chen: Awareness is key. Understand that AI systems make mistakes, can be biased, and their decisions aren't necessarily neutral or objective. Always maintain human judgment and don't defer completely to algorithmic recommendations.`
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Add Interview Transcript
          </CardTitle>
          <CardDescription>
            Upload or paste the interview transcript that will be the foundation of your article
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Upload Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-2">Upload File</h3>
              <p className="text-sm text-muted-foreground mb-4">Support for .txt, .docx files</p>
              <input
                type="file"
                accept=".txt,.docx,.doc"
                onChange={handleFileUpload}
                className="hidden"
                id="transcript-upload"
              />
              <label htmlFor="transcript-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
            </div>
            
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-2">Paste Text</h3>
              <p className="text-sm text-muted-foreground mb-4">Copy and paste directly</p>
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('transcript-text')?.focus()}
              >
                Start Typing
              </Button>
            </div>
          </div>

          {/* Sample Content */}
          {!transcript && (
            <div className="border border-accent/20 rounded-lg p-4 bg-accent-subtle/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-accent-foreground mb-2">Try a Sample</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Test the workflow with our sample AI ethics interview transcript
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTranscript(sampleTranscripts[0].content)}
                  >
                    Load Sample Transcript
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Transcript Input */}
          <div className="space-y-3">
            <Label htmlFor="transcript-text" className="text-base font-medium">
              Interview Transcript
            </Label>
            <Textarea
              id="transcript-text"
              placeholder="Paste your interview transcript here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            
            {transcript && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>{transcript.split(' ').length} words</span>
                <span>•</span>
                <span>{transcript.split('\n').filter(line => line.trim()).length} lines</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center gap-2">
              {projectData.transcript && (
                <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                  ✓ Transcript Ready
                </Badge>
              )}
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={!transcript.trim() || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  Continue to Sources
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};