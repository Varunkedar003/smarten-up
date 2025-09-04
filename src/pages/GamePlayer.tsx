import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { recordGameComplete, GameSelection } from "@/lib/progress";

interface LocationState {
  selection?: GameSelection;
}

type Q = { q: string; options: string[]; answer: number };

function genQuestions(sel: GameSelection): Q[] {
  const lvl = sel.level;
  const count = 5;
  const qs: Q[] = [];
  for (let i = 0; i < count; i++) {
    if (sel.subject === "mathematics") {
      const a = Math.floor(Math.random() * (lvl === "hard" ? 20 : 10)) + 1;
      const b = Math.floor(Math.random() * (lvl === "hard" ? 20 : 10)) + 1;
      const ans = a + b;
      const wrong1 = ans + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3));
      const wrong2 = ans + (Math.random() > 0.5 ? 1 : -1) * (2 + Math.floor(Math.random() * 3));
      const opts = [ans, wrong1, wrong2].sort(() => Math.random() - 0.5);
      qs.push({ q: `What is ${a} + ${b}?`, options: opts.map(String), answer: opts.indexOf(ans) });
    } else if (sel.subject === "science") {
      const opts = ["Velocity", "Force", "Energy"];
      const idx = 0;
      qs.push({ q: "In motion, what is the rate of change of position?", options: opts, answer: idx });
    } else if (sel.subject === "history") {
      const opts = ["Renaissance", "Industrial Revolution", "Cold War"];
      qs.push({ q: "Which period followed the Middle Ages in Europe?", options: opts, answer: 0 });
    } else {
      const opts = ["Noun", "Verb", "Adjective"];
      qs.push({ q: "What part of speech names a person, place, or thing?", options: opts, answer: 0 });
    }
  }
  return qs;
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

  const questions = useMemo(() => (selection ? genQuestions(selection) : []), [selection]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!selection) {
      navigate("/learning", { replace: true });
    }
  }, [selection, navigate]);

  if (!selection) return null;

  const current = questions[idx];

  const correctCount = answers.reduce((acc, a, i) => acc + (a === questions[i].answer ? 1 : 0), 0);

  const onChoose = (choice: number) => {
    if (finished) return;
    const next = [...answers];
    next[idx] = choice;
    const isLast = idx >= questions.length - 1;
    if (isLast) {
      setAnswers(next);
      setFinished(true);
      // small delay to compute score
      setTimeout(() => {
        recordGameComplete(selection, correctCount + (choice === current.answer ? 1 : 0), questions.length);
      }, 50);
    } else {
      setAnswers(next);
      setIdx(idx + 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{selection.subject} • {selection.topic} • {selection.subtopic}</span>
            <Badge variant="secondary" className="capitalize">{selection.level}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!finished ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Question {idx + 1} of {questions.length}</div>
              <h2 className="text-xl font-semibold">{current.q}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {current.options.map((opt, i) => (
                  <Button key={i} variant="outline" onClick={() => onChoose(i)}>
                    {opt}
                  </Button>
                ))}
              </div>
              <Progress value={(idx / questions.length) * 100} />
            </div>
          ) : (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Results</h2>
              <p className="text-muted-foreground">You answered {correctCount} / {questions.length} correctly</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate("/learning")}>Back to Learning</Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Background explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Concept Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {selection.level === "easy" && (
            <p>Quick intro: Focus on core ideas and simple examples for {selection.subtopic}. Keep an eye on patterns and try estimating before solving.</p>
          )}
          {selection.level === "intermediate" && (
            <p>Medium depth: Watch for edge-cases and relationships between formulas and definitions related to {selection.subtopic}. Try explaining your reasoning.</p>
          )}
          {selection.level === "hard" && (
            <p>Challenge mode: Analyze constraints, derive formulas, and compare multiple solution strategies for {selection.subtopic}. Optimize time and accuracy.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
