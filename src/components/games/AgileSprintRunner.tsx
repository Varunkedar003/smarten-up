import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Target, Users, Calendar, TrendingUp } from 'lucide-react';

interface AgileSprintRunnerProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

interface Task {
  id: number;
  name: string;
  storyPoints: number;
  priority: 'high' | 'medium' | 'low';
}

interface Sprint {
  capacity: number;
  tasks: Task[];
}

export const AgileSprintRunner: React.FC<AgileSprintRunnerProps> = ({
  level,
  subtopic,
  onComplete,
}) => {
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');

  useEffect(() => {
    generateSprint();
  }, [level]);

  const generateSprint = () => {
    const capacity = level === 'easy' ? 20 : level === 'intermediate' ? 30 : 40;
    const taskCount = level === 'easy' ? 8 : level === 'intermediate' ? 12 : 16;
    
    const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
    const tasks: Task[] = Array.from({ length: taskCount }, (_, i) => ({
      id: i + 1,
      name: `Task ${i + 1}`,
      storyPoints: Math.floor(Math.random() * 8) + 1,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
    }));

    setSprint({ capacity, tasks });
    setAvailableTasks(tasks);
    setSelectedTasks([]);
  };

  const toggleTask = (task: Task) => {
    if (selectedTasks.find(t => t.id === task.id)) {
      setSelectedTasks(selectedTasks.filter(t => t.id !== task.id));
    } else {
      const newSelected = [...selectedTasks, task];
      const totalPoints = newSelected.reduce((sum, t) => sum + t.storyPoints, 0);
      
      if (sprint && totalPoints <= sprint.capacity) {
        setSelectedTasks(newSelected);
      } else {
        toast.error('Sprint capacity exceeded!');
      }
    }
  };

  const submitSprint = () => {
    if (!sprint) return;

    const totalPoints = selectedTasks.reduce((sum, t) => sum + t.storyPoints, 0);
    const highPriorityTasks = selectedTasks.filter(t => t.priority === 'high').length;
    const optimalHighPriority = sprint.tasks.filter(t => t.priority === 'high').length;
    
    const isGoodPlan = 
      totalPoints >= sprint.capacity * 0.8 && 
      totalPoints <= sprint.capacity &&
      highPriorityTasks >= Math.floor(optimalHighPriority * 0.7);

    const newScore = {
      correct: score.correct + (isGoodPlan ? 1 : 0),
      total: score.total + 1,
    };
    setScore(newScore);

    if (isGoodPlan) {
      toast.success(`Great sprint planning! ${totalPoints}/${sprint.capacity} points`);
    } else {
      toast.error('Could be better - focus on high priority and optimal capacity!');
    }

    if (newScore.total >= (level === 'easy' ? 3 : level === 'intermediate' ? 5 : 7)) {
      setGameState('completed');
      onComplete(newScore.correct, newScore.total);
    } else {
      setTimeout(() => {
        generateSprint();
      }, 1500);
    }
  };

  const totalPoints = selectedTasks.reduce((sum, t) => sum + t.storyPoints, 0);
  const capacityPercent = sprint ? (totalPoints / sprint.capacity) * 100 : 0;

  if (gameState === 'completed') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🏃</div>
          <h2 className="text-2xl font-bold mb-4">Sprint Planning Complete!</h2>
          <p className="text-lg mb-4">
            Score: {score.correct} / {score.total}
          </p>
          <p className="text-muted-foreground mb-6">
            Success Rate: {Math.round((score.correct / score.total) * 100)}%
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Agile Sprint Planning
          </CardTitle>
          <Badge variant="secondary">
            Score: {score.correct}/{score.total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sprint && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sprint Capacity</span>
                <span className="font-semibold">
                  {totalPoints} / {sprint.capacity} points
                </span>
              </div>
              <Progress value={capacityPercent} className="h-2" />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Available Tasks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableTasks.map((task) => {
                  const isSelected = selectedTasks.find(t => t.id === task.id);
                  const priorityColors = {
                    high: 'bg-red-500/10 border-red-500/50',
                    medium: 'bg-yellow-500/10 border-yellow-500/50',
                    low: 'bg-blue-500/10 border-blue-500/50',
                  };
                  
                  return (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task)}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : priorityColors[task.priority]
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm">{task.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {task.storyPoints}sp
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {task.priority}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button 
              onClick={submitSprint} 
              className="w-full"
              disabled={selectedTasks.length === 0}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Start Sprint
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
