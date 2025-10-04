import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useProgress } from "@/lib/progress";

export const Achievements = () => {
  const data = useProgress();
  useEffect(() => { document.title = "Achievements • LearnReinforced"; }, []);
  const milestones = [
    { label: "Getting Started", desc: "Start your first game", icon: "🎮" },
    { label: "Game Explorer", desc: "Play 5 games", icon: "🗺️" },
    { label: "Gaming Enthusiast", desc: "Play 15 games", icon: "🎯" },
    { label: "Topic Tamer", desc: "Complete 3 topics", icon: "📚" },
    { label: "Subject Master", desc: "Complete 10 topics", icon: "🏆" },
    { label: "Quick Learner", desc: "Score 80%+ in a game", icon: "⚡" },
    { label: "Perfect Score", desc: "Get 100% in a game", icon: "💯" },
    { label: "XP Hunter", desc: "Earn 100 XP", icon: "⭐" },
    { label: "XP Legend", desc: "Earn 500 XP", icon: "🌟" },
    { label: "Comeback King", desc: "Recover from 3 low scores", icon: "👑" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">Collect badges as you learn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {milestones.map((m) => {
          const unlocked = data.badges.includes(m.label);
          return (
            <Card 
              key={m.label} 
              className={`transition-all duration-300 ${
                unlocked 
                  ? "border-primary shadow-lg shadow-primary/20 scale-105" 
                  : "opacity-60 grayscale"
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-3xl">{m.icon}</span>
                    <span>{m.label}</span>
                  </span>
                  {unlocked && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black">
                      ✓ Unlocked
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{m.desc}</p>
                {unlocked && (
                  <p className="text-xs text-primary mt-2 font-semibold">🎉 Achievement Unlocked!</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};