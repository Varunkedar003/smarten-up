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

  const title = `${base} • ${lvl.charAt(0).toUpperCase() + lvl.slice(1)} roadmap`;

  const beginner: RoadNode = {
    title,
    description: `A friendly path to learn ${base} from zero — short theory, quick practice, and tiny projects.`,
    children: [
      { title: 'Getting Started', children: ladder([
        `What is ${base}? Key terms with simple examples`,
        `Set up tools for ${base} (install, editor, hello world)`,
        `First hands‑on: your very first ${base} task`,
      ])},
      { title: 'Core Concepts', children: ladder([
        `Understand essential building blocks of ${base}`,
        `Learn by examples — read, run, tweak`,
        `Debug basics: find and fix simple issues`,
      ])},
      { title: 'Practice Routine', children: ladder([
        `Daily plan (20–30 min): 1 concept → 2 examples → 1 mini task`,
        `Flashcards / notes: your personal cheat sheet`,
        `Weekly quiz: check understanding`,
      ])},
      { title: 'Mini Projects', children: ladder([
        `Project 1: a tiny ${base} demo you can finish in 1–2 hours`,
        `Project 2: extend the demo with one new feature`,
        `Share or present what you built`,
      ])},
      { title: 'Resources', children: ladder([
        `Official docs (beginner sections)`,
        `Free playlists and beginner tutorials for ${base}`,
        `Cheatsheets & quick‑reference`,
      ])},
    ]
  };

  const intermediate: RoadNode = {
    title,
    description: `Upgrade your ${base} skills — patterns, tooling, testing, and a guided project sprint.`,
    children: [
      { title: 'Review & Fill Gaps', children: ladder([
        `Revisit core ideas of ${base} with quick challenges`,
        `Common mistakes and how to avoid them`,
        `Refactor beginner projects`,
      ])},
      { title: 'Deeper Concepts', children: ladder([
        `Intermediate patterns & idioms in ${base}`,
        `Performance basics (do less, reuse more)`,
        `Data handling, I/O, and error control`,
      ])},
      { title: 'Tooling & Debugging', children: ladder([
        `Linters/formatters and productive editor setup`,
        `Debug workflows and logs`,
        `CLI tools and scripts for ${base}`,
      ])},
      { title: 'Project Sprint', children: ladder([
        `Build 2–3 small projects (2–4 hours each)` ,
        `Document decisions and trade‑offs`,
        `Peer/self review checklist`,
      ])},
      { title: 'Testing & Quality', children: ladder([
        `Write tests for main flows`,
        `Automate checks (where possible)`,
        `Measure and tune performance`,
      ])},
      { title: 'Resources', children: ladder([
        `Curated articles & intermediate courses for ${base}`,
        `Recommended repos/examples to study`,
        `Interview‑style practice (optional)`,
      ])},
    ]
  };

  const advanced: RoadNode = {
    title,
    description: `Think like a builder — architecture, performance, scaling, and a capstone in ${base}.`,
    children: [
      { title: 'Architecture & Patterns', children: ladder([
        `Design choices & trade‑offs in ${base}`,
        `Advanced patterns and composition`,
        `Error boundaries, resilience, reliability`,
      ])},
      { title: 'Performance & Optimization', children: ladder([
        `Measure first: profiling & tracing`,
        `Optimize hotspots & memory`,
        `Benchmarking and baselines`,
      ])},
      { title: 'Scaling & Reliability', children: ladder([
        `Modularity and boundaries`,
        `Caching, batching, and backpressure (if relevant)`,
        `Security & robustness basics`,
      ])},
      { title: 'Capstone Project', children: ladder([
        `Plan an end‑to‑end build in ${base}`,
        `Implement with documentation and tests`,
        `Publish and collect feedback`,
      ])},
      { title: 'Prep & Portfolio', children: ladder([
        `Challenge problems relevant to ${base}`,
        `Polish resume/portfolio with your capstone`,
        `Share learnings (post or talk)`,
      ])},
    ]
  };

  const pro: RoadNode = {
    title,
    description: `Go beyond — specialize, contribute, teach, and lead in ${base}.`,
    children: [
      { title: 'Specialization Tracks', children: ladder([
        `Pick a niche within ${base} and study top resources`,
        `Create a deep‑dive project or library`,
        `Compare approaches across ecosystems`,
      ])},
      { title: 'Open Source & Community', children: ladder([
        `Contribute issues/PRs to notable ${base} projects`,
        `Maintain a small OSS repo`,
        `Engage in community Q&A`,
      ])},
      { title: 'Teaching & Mentoring', children: ladder([
        `Write posts or record short lessons`,
        `Mentor beginners and run code reviews`,
        `Design exercises and rubrics`,
      ])},
      { title: 'Advanced Profiling', children: ladder([
        `Benchmark across versions/environments`,
        `Track regressions & automate checks`,
        `Share methodology and results`,
      ])},
    ]
  };

  switch (lvl) {
    case 'beginner':
      return beginner;
    case 'intermediate':
      return intermediate;
    case 'advanced':
      return advanced;
    case 'pro':
      return pro;
    default:
      return beginner;
  }
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