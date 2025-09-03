import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp, 
  Gamepad2, 
  MessageCircle,
  BarChart3,
  Star,
  Zap,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent rounded-lg p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, John! 🎉</h1>
          <p className="text-white/90 mb-4">Ready to continue your learning adventure?</p>
          <div className="flex gap-3">
            <Link to="/learning">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Start Learning
              </Button>
            </Link>
            <Link to="/assistant">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask AI
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">2,450</div>
            <p className="text-xs text-muted-foreground">
              +180 this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Completed</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">24</div>
            <p className="text-xs text-muted-foreground">
              +3 today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">7 Days</div>
            <p className="text-xs text-muted-foreground">
              Keep it up!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">4.5h</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Continue Learning
            </CardTitle>
            <CardDescription>
              Pick up where you left off
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Mathematics - Algebra</h4>
                  <p className="text-sm text-muted-foreground">Quadratic Equations</p>
                </div>
                <Badge variant="secondary">75%</Badge>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Science - Physics</h4>
                  <p className="text-sm text-muted-foreground">Motion & Forces</p>
                </div>
                <Badge variant="secondary">45%</Badge>
              </div>
              <Progress value={45} className="h-2" />
            </div>

            <Link to="/learning">
              <Button className="w-full">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Continue Learning
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Recent Achievements
            </CardTitle>
            <CardDescription>
              Your latest accomplishments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium">Math Master</h4>
                <p className="text-sm text-muted-foreground">Completed 10 algebra games</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium">Speed Learner</h4>
                <p className="text-sm text-muted-foreground">Completed a game in under 2 minutes</p>
              </div>
            </div>

            <Link to="/achievements">
              <Button variant="outline" className="w-full">
                <Trophy className="w-4 h-4 mr-2" />
                View All Achievements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump into your favorite features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/learning">
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40">
                <CardContent className="p-4 text-center">
                  <Gamepad2 className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-medium">Start New Game</h3>
                  <p className="text-sm text-muted-foreground">Choose a subject and play</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/assistant">
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20 hover:border-secondary/40">
                <CardContent className="p-4 text-center">
                  <MessageCircle className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <h3 className="font-medium">Ask AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">Get help with any topic</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/progress">
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:border-accent/40">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-8 h-8 text-accent mx-auto mb-2" />
                  <h3 className="font-medium">View Progress</h3>
                  <p className="text-sm text-muted-foreground">Track your learning journey</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};