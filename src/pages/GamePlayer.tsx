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
            <GameRouter selection={selection} onComplete={onComplete} />
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Background Explanation</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => speechService.stop()}
                    className="h-8 w-8 p-0"
                  >
                    <VolumeX className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {explanationText.length > 0 ? (
                  explanationText.map((text, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground leading-relaxed">
                      {text}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Explanation will appear here when the game starts...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
