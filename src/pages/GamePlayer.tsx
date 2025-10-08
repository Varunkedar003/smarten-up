import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { recordGameComplete, GameSelection } from "@/lib/progress";
import { GameRouter } from "@/components/games/GameRouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { speechService } from "@/services/speechService";
import { Volume2, VolumeX } from "lucide-react";

interface LocationState {
  selection?: GameSelection;
}


export const GamePlayer = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState };
  const selection = state?.selection;

  useEffect(() => {
    document.title = selection
      ? `Play: ${selection.subtopic} • LearnReinforced`
      : "Play • LearnReinforced";
  }, [selection]);

  const [finished, setFinished] = useState(false);
  const [explanationText, setExplanationText] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = speechService.onExplanationChange((text) => {
      setExplanationText(text);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!selection) {
      navigate("/learning", { replace: true });
    }
  }, [selection, navigate]);

  if (!selection) return null;

  const onComplete = (correct: number, total: number) => {
    recordGameComplete(selection, correct, total);
    setFinished(true);
  };

  if (finished) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto p-6">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Game Complete!</h2>
            <p className="text-lg mb-2">Great job completing the game!</p>
            <Button onClick={() => navigate('/learning')} className="mr-4">
              Play Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">
              {selection.subject} - {selection.topic}
            </h1>
            <Badge variant="secondary" className="capitalize">
              Level: {selection.level}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {ready ? (
              <GameRouter selection={selection} onComplete={onComplete} />
            ) : (
              <Card className="p-6 h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-semibold">Study first, then play</h2>
                  <p className="text-muted-foreground">Read or listen to the explanation on the right, then start the game.</p>
                  <Button onClick={() => setReady(true)}>Start Game</Button>
                </div>
              </Card>
            )}
          </div>
          
          <div className="lg:col-span-1 space-y-4">
            <Card className="sticky top-6 border-2 border-primary/20 bg-gradient-to-br from-background to-secondary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Background Explanation
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => speechService.speak(explanationText.join(' '))}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                      title="Play audio"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => speechService.stop()}
                      className="h-8 w-8 p-0 hover:bg-destructive/10"
                      title="Stop audio"
                    >
                      <VolumeX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Level: <span className="font-semibold capitalize">{selection.level}</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                {explanationText.length > 0 ? (
                  explanationText.map((text, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-lg bg-secondary/50 border border-border animate-fade-in"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <p className="text-sm leading-relaxed">
                        {text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-lg bg-secondary/30 border border-dashed border-border">
                    <p className="text-sm text-muted-foreground italic text-center">
                      Loading explanation...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
