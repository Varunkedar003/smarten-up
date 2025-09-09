import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Simple offline roadmap generator (no API keys, no external calls)
// Generates a hierarchical plan with modules, submodules, and practice ideas

type Level = 'beginner' | 'intermediate' | 'advanced' | 'pro';

interface RoadNode {
  title: string;
  description?: string;
  children?: RoadNode[];
}

function generateRoadmap(topic: string, level: Level): RoadNode {
  const base = topic.trim() || 'New Skill';
  const lvl = level;
  const ladder = (arr: string[]): RoadNode[] => arr.map(t => ({ title: t }));

  const core: RoadNode = {
    title: `${base} • ${lvl.charAt(0).toUpperCase() + lvl.slice(1)} roadmap`,
    description: `A structured path to learn ${base} from ${lvl} level with theory → practice → projects.`,
    children: [
      { title: 'Foundations', children: ladder([
        `Core concepts & terminology of ${base}`,
        `Setup tools & environment for ${base}`,
        `Hello World and first steps`,
      ])},
      { title: 'Essential Skills', children: ladder([
        `Key features and common patterns in ${base}`,
        `Debugging and problem‑solving in ${base}`,
        `Reading & understanding ${base} examples`,
      ])},
      { title: 'Practice & Projects', children: ladder([
        `Daily practice plan (30–60 minutes)`,
        `Mini‑projects to apply concepts`,
        `Peer review or self‑review checklist`,
      ])},
      { title: 'Resources', children: ladder([
        `Official docs / tutorials for ${base}`,
        `Free courses, playlists, and articles`,
        `Reference cheatsheets`,
      ])},
    ]
  };

  if (lvl !== 'beginner') {
    core.children!.splice(1, 0, {
      title: 'Deeper Concepts',
      children: ladder([
        `Intermediate patterns and idioms in ${base}`,
        `Performance and optimization basics`,
        `Testing strategies and tooling`,
      ])
    });
  }
  if (lvl === 'advanced' || lvl === 'pro') {
    core.children!.push({
      title: 'Capstone',
      children: ladder([
        `Build a full project in ${base}`,
        `Document & share your work (portfolio)`,
        `Interview‑style challenges for ${base}`,
      ])
    });
  }
  if (lvl === 'pro') {
    core.children!.push({
      title: 'Expertise',
      children: ladder([
        `Teach ${base} (talks, posts, mentoring)`,
        `Contribute to open source in ${base}`,
        `Benchmarking and advanced profiling`,
      ])
    });
  }

  return core;
}

function NodeView({ node, depth = 0 }: { node: RoadNode; depth?: number }) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  return (
    <div className="relative pl-4">
      {depth > 0 && <div className="absolute left-0 top-2 h-full border-l border-border/50" />}
      <div className="rounded-lg border border-border/50 bg-card p-3 mb-2 shadow-sm">
        <div className="font-medium">{node.title}</div>
        {node.description && <div className="text-sm text-muted-foreground mt-1">{node.description}</div>}
      </div>
      {hasChildren && (
        <div className="ml-4">
          {node.children!.map((c, i) => (
            <div key={i} className="relative">
              <div className="absolute left-[-16px] top-3 w-4 border-t border-border/50" />
              <NodeView node={c} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Roadmap = () => {
  const [topicInput, setTopicInput] = useState('Python Programming');
  const [levelInput, setLevelInput] = useState<Level>('beginner');
  const [topic, setTopic] = useState('Python Programming');
  const [level, setLevel] = useState<Level>('beginner');
  const [data, setData] = useState<RoadNode>(() => generateRoadmap(topic, level));
  const [wiki, setWiki] = useState<string>('');

  useEffect(() => {
    setData(generateRoadmap(topic, level));
  }, [topic, level]);

  useEffect(() => {
    const controller = new AbortController();
    const t = topic.trim();
    if (!t) { setWiki(''); return; }
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json && json.extract) setWiki(json.extract as string); else setWiki('');
      })
      .catch(() => {});
    return () => controller.abort();
  }, [topic]);

  const onGenerate = () => {
    setTopic(topicInput.trim());
    setLevel(levelInput);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <label className="text-sm text-muted-foreground">Topic</label>
          <Input value={topicInput} onChange={e => setTopicInput(e.target.value)} placeholder="e.g., Python Programming" />
        </div>
        <div className="min-w-[200px]">
          <label className="text-sm text-muted-foreground">Level</label>
          <Select value={levelInput} onValueChange={(v: Level) => setLevelInput(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onGenerate} className="self-end">Generate</Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Roadmap Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          {wiki && (
            <div className="mb-4 text-sm text-muted-foreground">
              <span className="font-medium">Overview:</span> {wiki}
            </div>
          )}
          <NodeView node={data} />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Note: This roadmap is generated locally (no API keys needed). We can optionally connect to a provider (Gemini/ChatGPT/Perplexity) later if you add an API key.
      </p>
    </div>
  );
};