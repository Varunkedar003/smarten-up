import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useProgress } from "@/lib/progress";

export const Progress = () => {
  const data = useProgress();
  useEffect(() => { document.title = "Progress • LearnReinforced"; }, []);
  const pct = Math.min(100, (data.topicsCompleted / Math.max(1, data.completedSubtopics.length || 5)) * 100);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Learning Progress</h1>
        <p className="text-muted-foreground">Live stats updated as you play</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between"><span>Games Played</span><strong>{data.gamesPlayed}</strong></div>
            <div className="flex items-center justify-between"><span>Topics Completed</span><strong>{data.topicsCompleted}</strong></div>
            <div className="flex items-center justify-between"><span>XP</span><strong>{data.xp}</strong></div>
            <ProgressBar value={pct} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Rewards & Penalties</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between"><span>Rewards</span><strong>{data.rewards}</strong></div>
            <div className="flex items-center justify-between"><span>Punishments</span><strong>{data.punishments}</strong></div>
            <div className="text-xs text-muted-foreground">Play better to earn more rewards and fewer penalties!</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Last played: {data.lastPlayedAt ? new Date(data.lastPlayedAt).toLocaleString() : "—"}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {data.badges.length === 0 ? (
            <span className="text-sm text-muted-foreground">No badges yet. Start a game to earn some!</span>
          ) : (
            data.badges.map((b) => <Badge key={b} variant="secondary">{b}</Badge>)
          )}
        </CardContent>
      </Card>
    </div>
  );
};