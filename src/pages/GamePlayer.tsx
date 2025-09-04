import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { recordGameComplete, GameSelection } from "@/lib/progress";
import { GameRouter } from "@/components/games/GameRouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

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
      <div className="max-w-4xl mx-auto p-6">
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

        <GameRouter selection={selection} onComplete={onComplete} />
      </div>
    </DashboardLayout>
  );
};
