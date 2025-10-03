import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  CircuitBoard,
  Gamepad2,
  Star,
  Zap,
  Trophy,
  Play,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { recordGameStart } from "@/lib/progress";

type DifficultyLevel = "easy" | "intermediate" | "hard";
type Subject = "Computer Science" | "Engineering" | "Mathematics" | "Physics" | "Chemistry" | "Biology";

interface Topic {
  id: string;
  name: string;
  description: string;
  progress: number;
  subtopics: string[];
}

interface SubjectData {
  name: string;
  icon: any;
  color: string;
  topics: Topic[];
}

import { 
  Calculator, 
  Atom, 
  Dna,
  Globe,
  Palette,
  Music,
  BookOpen,
  Languages,
  TrendingUp,
  Camera
} from "lucide-react";


const subjectsData: Record<Subject, SubjectData> = {
  "Computer Science": {
    name: "Computer Science",
    icon: Cpu,
    color: "from-indigo-500 to-indigo-600",
    topics: [
      {
        id: "algorithms",
        name: "Algorithms",
        description: "Sorting, searching, graph algorithms, and optimization",
        progress: 35,
        subtopics: ["Sorting", "Searching", "Graph Traversal", "Dynamic Programming", "Greedy Algorithms", "Divide & Conquer"]
      },
      {
        id: "data-structures",
        name: "Data Structures",
        description: "Arrays, trees, graphs, hash tables, and advanced structures",
        progress: 50,
        subtopics: ["Arrays & Lists", "Stacks & Queues", "Trees", "Hash Tables", "Graphs", "Heaps"]
      },
      {
        id: "programming",
        name: "Programming",
        description: "Languages, paradigms, debugging, and best practices",
        progress: 20,
        subtopics: ["Syntax & Basics", "Debugging", "OOP", "Functional Programming", "Design Patterns", "Code Optimization"]
      },
      {
        id: "databases",
        name: "Database Management",
        description: "SQL, NoSQL, database design, and optimization",
        progress: 15,
        subtopics: ["SQL Fundamentals", "Database Design", "Normalization", "Indexing", "NoSQL", "Query Optimization"]
      }
    ]
  },
  "Engineering": {
    name: "Engineering",
    icon: CircuitBoard,
    color: "from-teal-500 to-teal-600",
    topics: [
      {
        id: "digital-logic",
        name: "Digital Logic",
        description: "Logic gates, circuits, and digital system design",
        progress: 45,
        subtopics: ["Basic Gates", "Boolean Algebra", "Combinational Circuits", "Sequential Logic", "Flip-Flops", "Karnaugh Maps"]
      },
      {
        id: "computer-networks",
        name: "Computer Networks",
        description: "Protocols, routing, network security, and architecture",
        progress: 30,
        subtopics: ["OSI Model", "TCP/IP", "Routing Protocols", "Network Security", "Wireless Networks", "Network Troubleshooting"]
      },
      {
        id: "software-engineering",
        name: "Software Engineering",
        description: "Development methodologies, testing, and project management",
        progress: 25,
        subtopics: ["SDLC", "Agile Methodology", "Testing Strategies", "Version Control", "Code Review", "Project Management"]
      },
      {
        id: "systems-design",
        name: "Systems Design",
        description: "Scalable systems, architecture patterns, and performance",
        progress: 10,
        subtopics: ["System Architecture", "Load Balancing", "Caching", "Microservices", "Database Scaling", "Performance Optimization"]
      }
    ]
  },
  "Mathematics": {
    name: "Mathematics",
    icon: Calculator,
    color: "from-purple-500 to-purple-600",
    topics: [
      {
        id: "algebra",
        name: "Algebra",
        description: "Linear equations, polynomials, and algebraic structures",
        progress: 60,
        subtopics: ["Linear Equations", "Quadratic Equations", "Polynomials", "Factoring", "Systems of Equations", "Inequalities"]
      },
      {
        id: "geometry",
        name: "Geometry",
        description: "Shapes, angles, area, volume, and geometric proofs",
        progress: 40,
        subtopics: ["Triangles", "Circles", "Polygons", "3D Shapes", "Coordinate Geometry", "Trigonometry"]
      },
      {
        id: "calculus",
        name: "Calculus",
        description: "Limits, derivatives, integrals, and applications",
        progress: 25,
        subtopics: ["Limits", "Derivatives", "Integration", "Applications", "Series", "Differential Equations"]
      },
      {
        id: "statistics",
        name: "Statistics & Probability",
        description: "Data analysis, probability, and statistical inference",
        progress: 55,
        subtopics: ["Descriptive Statistics", "Probability", "Distributions", "Hypothesis Testing", "Regression", "Data Visualization"]
      }
    ]
  },
  "Physics": {
    name: "Physics",
    icon: Atom,
    color: "from-blue-500 to-blue-600",
    topics: [
      {
        id: "mechanics",
        name: "Classical Mechanics",
        description: "Motion, forces, energy, and momentum",
        progress: 45,
        subtopics: ["Kinematics", "Forces", "Energy", "Momentum", "Circular Motion", "Simple Harmonic Motion"]
      },
      {
        id: "electricity",
        name: "Electricity & Magnetism",
        description: "Electric fields, circuits, magnetic fields, and waves",
        progress: 35,
        subtopics: ["Electric Fields", "Circuits", "Magnetic Fields", "Electromagnetic Induction", "AC/DC", "Maxwell's Equations"]
      },
      {
        id: "thermodynamics",
        name: "Thermodynamics",
        description: "Heat, temperature, and energy transformations",
        progress: 20,
        subtopics: ["Temperature & Heat", "Laws of Thermodynamics", "Gas Laws", "Phase Changes", "Heat Engines", "Entropy"]
      },
      {
        id: "modern-physics",
        name: "Modern Physics",
        description: "Quantum mechanics, relativity, and atomic structure",
        progress: 15,
        subtopics: ["Quantum Theory", "Atomic Structure", "Special Relativity", "Nuclear Physics", "Particle Physics", "Wave-Particle Duality"]
      }
    ]
  },
  "Chemistry": {
    name: "Chemistry",
    icon: Atom,
    color: "from-green-500 to-green-600",
    topics: [
      {
        id: "atomic-structure",
        name: "Atomic Structure",
        description: "Atoms, electrons, periodic table, and chemical bonding",
        progress: 50,
        subtopics: ["Atomic Theory", "Electron Configuration", "Periodic Trends", "Chemical Bonding", "Molecular Geometry", "Intermolecular Forces"]
      },
      {
        id: "chemical-reactions",
        name: "Chemical Reactions",
        description: "Reaction types, stoichiometry, and reaction mechanisms",
        progress: 40,
        subtopics: ["Reaction Types", "Balancing Equations", "Stoichiometry", "Reaction Rates", "Equilibrium", "Acid-Base Reactions"]
      },
      {
        id: "organic-chemistry",
        name: "Organic Chemistry",
        description: "Carbon compounds, functional groups, and mechanisms",
        progress: 25,
        subtopics: ["Hydrocarbons", "Functional Groups", "Isomerism", "Reaction Mechanisms", "Polymers", "Biomolecules"]
      },
      {
        id: "physical-chemistry",
        name: "Physical Chemistry",
        description: "Thermodynamics, kinetics, and quantum chemistry",
        progress: 20,
        subtopics: ["Thermodynamics", "Chemical Kinetics", "Electrochemistry", "Phase Diagrams", "Spectroscopy", "Quantum Chemistry"]
      }
    ]
  },
  "Biology": {
    name: "Biology",
    icon: Dna,
    color: "from-emerald-500 to-emerald-600",
    topics: [
      {
        id: "cell-biology",
        name: "Cell Biology",
        description: "Cell structure, organelles, and cellular processes",
        progress: 55,
        subtopics: ["Cell Structure", "Organelles", "Cell Membrane", "Cell Division", "Cellular Respiration", "Photosynthesis"]
      },
      {
        id: "genetics",
        name: "Genetics",
        description: "DNA, heredity, gene expression, and biotechnology",
        progress: 30,
        subtopics: ["DNA Structure", "Gene Expression", "Mendel's Laws", "Genetic Disorders", "Biotechnology", "Evolution"]
      },
      {
        id: "ecology",
        name: "Ecology",
        description: "Ecosystems, biodiversity, and environmental interactions",
        progress: 35,
        subtopics: ["Food Chains", "Ecosystems", "Population Dynamics", "Biodiversity", "Conservation", "Climate Change"]
      },
      {
        id: "human-biology",
        name: "Human Biology",
        description: "Anatomy, physiology, and human body systems",
        progress: 45,
        subtopics: ["Circulatory System", "Nervous System", "Digestive System", "Respiratory System", "Immune System", "Reproduction"]
      }
    ]
  }
};

export const LearningGames = () => {
  // Updated subjects: Computer Science & Engineering
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(null);

  const handleStartGame = () => {
    if (selectedSubject && selectedTopic && selectedSubtopic && selectedLevel) {
      const selection = {
        subject: selectedSubject,
        topic: selectedTopic.name,
        subtopic: selectedSubtopic,
        level: selectedLevel,
      } as const;
      recordGameStart(selection);
      navigate("/learning/play", { state: { selection } });
    }
  };

  const resetSelections = () => {
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setSelectedLevel(null);
  };

  const getLevelColor = (level: DifficultyLevel) => {
    switch (level) {
      case "easy": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // Subject Selection
  if (!selectedSubject) {
    const timestamp = Date.now(); // Force fresh render
    return (
      <div className="space-y-6" key={`subjects-${timestamp}`}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Choose Your Subject</h1>
          <p className="text-muted-foreground">Select a subject to start your learning adventure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" key="cs-eng-subjects">
          {Object.entries(subjectsData).map(([key, subject]) => {
            const Icon = subject.icon;
            return (
              <Card 
                key={key}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => setSelectedSubject(key as Subject)}
              >
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${subject.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{subject.name}</h3>
                  <p className="text-muted-foreground mb-4">
                    {subject.topics.length} topics available
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Interactive Games</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Topic Selection
  if (!selectedTopic) {
    const subject = subjectsData[selectedSubject];
    const Icon = subject.icon;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={resetSelections}>
            ← Back to Subjects
          </Button>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${subject.color} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{subject.name}</h1>
              <p className="text-muted-foreground">Choose a topic to learn</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subject.topics.map((topic) => (
            <Card 
              key={topic.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => setSelectedTopic(topic)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {topic.name}
                  <Badge variant="secondary">{topic.progress}%</Badge>
                </CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={topic.progress} className="mb-4" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {topic.subtopics.length} subtopics
                  </span>
                  <span className="font-medium text-primary">
                    {Math.floor(topic.progress / 25)} games completed
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Subtopic Selection
  if (!selectedSubtopic) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setSelectedTopic(null)}>
            ← Back to Topics
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedTopic.name}</h1>
            <p className="text-muted-foreground">Choose a subtopic to focus on</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedTopic.subtopics.map((subtopic, index) => (
            <Card 
              key={subtopic}
              className="cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => setSelectedSubtopic(subtopic)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{subtopic}</h3>
                    <p className="text-sm text-muted-foreground">
                      {Math.floor(Math.random() * 5) + 3} games available
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-primary" />
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Difficulty Level Selection
  if (!selectedLevel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setSelectedSubtopic(null)}>
            ← Back to Subtopics
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedSubtopic}</h1>
            <p className="text-muted-foreground">Choose your difficulty level</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {(["easy", "intermediate", "hard"] as DifficultyLevel[]).map((level) => (
            <Card 
              key={level}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 text-center"
              onClick={() => setSelectedLevel(level)}
            >
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-full ${getLevelColor(level)} flex items-center justify-center mx-auto mb-4`}>
                  {level === "easy" && <Zap className="w-8 h-8 text-white" />}
                  {level === "intermediate" && <Star className="w-8 h-8 text-white" />}
                  {level === "hard" && <Trophy className="w-8 h-8 text-white" />}
                </div>
                <h3 className="text-xl font-semibold capitalize mb-2">{level}</h3>
                <p className="text-muted-foreground mb-4">
                  {level === "easy" && "Perfect for beginners"}
                  {level === "intermediate" && "For those with some knowledge"}
                  {level === "hard" && "Challenge yourself!"}
                </p>
                <Badge variant={level === "easy" ? "secondary" : level === "intermediate" ? "default" : "destructive"}>
                  {level === "easy" && "Recommended"}
                  {level === "intermediate" && "Popular"}
                  {level === "hard" && "Expert"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Game Start Screen
  return (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <div className="p-8 bg-gradient-to-r from-primary to-secondary rounded-lg text-white">
        <h1 className="text-3xl font-bold mb-4">Ready to Start!</h1>
        <div className="space-y-2 text-white/90">
          <p><strong>Subject:</strong> {subjectsData[selectedSubject].name}</p>
          <p><strong>Topic:</strong> {selectedTopic.name}</p>
          <p><strong>Subtopic:</strong> {selectedSubtopic}</p>
          <p><strong>Level:</strong> {selectedLevel}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Game Features</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-primary" />
                <span>Interactive gameplay</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                <span>Instant feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Earn points & badges</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-500" />
                <span>AI-powered hints</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={resetSelections}>
          Change Selection
        </Button>
        <Button onClick={handleStartGame} className="bg-gradient-to-r from-primary to-secondary">
          <Play className="w-4 h-4 mr-2" />
          Start Game
        </Button>
      </div>
    </div>
  );
};