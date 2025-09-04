import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useProgress } from "@/lib/progress";

export const Achievements = () => {
  const data = useProgress();
  useEffect(() => { document.title = "Achievements • LearnReinforced"; }, []);
  const milestones = [
    { label: "Game Explorer", desc: "Play 5 games" },
    { label: "Topic Tamer", desc: "Complete 3 topics" },
    { label: "Quick Learner", desc: "Score 80%+ in a game" },
    { label: "Getting Started", desc: "Start your first game" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">Collect badges as you learn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {milestones.map((m) => (
          <Card key={m.label} className={data.badges.includes(m.label) ? "border-accent" : "opacity-80"}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{m.label}</span>
                {data.badges.includes(m.label) && <Badge variant="secondary">Unlocked</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{m.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};