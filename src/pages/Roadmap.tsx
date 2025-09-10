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

  // Make title and content much more topic-specific
  const title = `${base} Learning Journey • ${lvl.charAt(0).toUpperCase() + lvl.slice(1)} Track`;

  const beginner: RoadNode = {
    title,
    description: `🌱 Your gentle introduction to ${base} — hands-on learning with immediate wins!`,
    children: generateBeginnerPath(base)
  };

  function generateBeginnerPath(topic: string): RoadNode[] {
    const t = topic.toLowerCase();
    
    if (t.includes('python')) {
      return [
        { title: '🚀 Getting Started', children: ladder([
          '💻 Install Python & VS Code - your coding toolkit',
          '👋 Hello World program - your first Python script!', 
          '🔤 Variables & basic data types (strings, numbers)',
          '📊 Simple input/output with print() and input()',
        ])},
        { title: '🏗️ Core Building Blocks', children: ladder([
          '🔄 Loops: for and while (repeat actions easily)',
          '🤔 Conditionals: if, elif, else (decision making)',
          '📝 Lists and dictionaries (store collections of data)',
          '⚙️ Functions: write reusable code blocks',
        ])},
        { title: '🛠️ Practice Projects', children: ladder([
          '🎯 Calculator app (practice math operations)',
          '🎲 Number guessing game (use loops & conditionals)',
          '📋 To-do list manager (work with lists)',
          '📈 Simple data analysis with CSV files',
        ])},
        { title: '📚 Resources & Next Steps', children: ladder([
          '📖 Python.org official tutorial',
          '🎥 "Python for Everybody" course (Coursera)',
          '💡 Join Python communities (Reddit r/Python)',
          '🎯 Choose specialization: web, data, automation',
        ])},
      ];
    }
    
    if (t.includes('javascript') || t.includes('js')) {
      return [
        { title: '🌐 Web Development Basics', children: ladder([
          '🏗️ HTML structure + CSS styling basics',
          '⚡ Add JavaScript to make pages interactive',
          '🔧 Browser dev tools - inspect and debug',
          '📊 Variables, functions, and DOM manipulation',
        ])},
        { title: '🎯 Interactive Features', children: ladder([
          '🖱️ Handle clicks, hovers, form submissions',
          '🎨 Change styles and content dynamically',
          '📦 Arrays and objects for data management',
          '🔄 Loops and conditionals for logic flow',
        ])},
        { title: '🚀 Mini Web Projects', children: ladder([
          '🎲 Random quote generator',
          '📝 Interactive to-do list with local storage',
          '🌡️ Weather app using a free API',
          '🎮 Simple browser game (tic-tac-toe)',
        ])},
        { title: '📈 Level Up', children: ladder([
          '📚 MDN Web Docs (mozilla.org)',
          '🎯 freeCodeCamp JavaScript curriculum',
          '💡 Learn modern ES6+ features',
          '🏗️ Explore React or Vue for advanced UIs',
        ])},
      ];
    }

    if (t.includes('java')) {
      return [
        { title: '☕ Java Fundamentals', children: ladder([
          '🔧 Install JDK + IDE (IntelliJ or Eclipse)',
          '👋 "Hello World" and understanding main() method',
          '📊 Variables, primitive types, and String basics',
          '🏗️ Classes and objects - the core of Java',
        ])},
        { title: '🔨 Object-Oriented Programming', children: ladder([
          '📦 Encapsulation: private fields, public methods',
          '🏗️ Constructors and method overloading',
          '📋 Collections: ArrayList, HashMap basics',
          '🔄 Inheritance and polymorphism intro',
        ])},
        { title: '💼 Practical Applications', children: ladder([
          '💰 Banking system with classes and methods',
          '📚 Library management system',
          '🎯 Simple console-based games',
          '📊 File I/O and exception handling basics',
        ])},
        { title: '🎯 Professional Skills', children: ladder([
          '📖 Oracle Java documentation',
          '🧪 JUnit testing framework basics',
          '🏗️ Maven or Gradle for project management',
          '🌐 Spring framework for web development',
        ])},
      ];
    }

    // Generic fallback with topic-specific customization
    return [
      { title: '🚀 Getting Started', children: ladder([
        `📋 What is ${topic}? Core concepts and terminology`,
        `🔧 Set up your ${topic} development environment`,
        `👋 Create your first simple ${topic} project`,
        `💡 Understanding ${topic} best practices basics`,
      ])},
      { title: '🏗️ Building Foundation', children: ladder([
        `📊 Master fundamental ${topic} concepts`,
        `🔄 Practice with guided examples and tutorials`,
        `🐛 Learn debugging basics for ${topic}`,
        `📈 Build confidence with small wins`,
      ])},
      { title: '🛠️ Hands-On Practice', children: ladder([
        `🎯 Project 1: Simple ${topic} application`,
        `🚀 Project 2: Add new features and functionality`,
        `📱 Project 3: Real-world ${topic} use case`,
        `🎨 Polish and present your work`,
      ])},
      { title: '📚 Resources & Community', children: ladder([
        `📖 Official ${topic} documentation and tutorials`,
        `🎥 Quality video courses and workshops`,
        `💬 Join ${topic} communities and forums`,
        `🎯 Plan your next learning milestone`,
      ])},
    ];
  }

  const intermediate: RoadNode = {
    title,
    description: `🚀 Accelerate your ${base} skills with real-world projects and advanced concepts!`,
    children: generateIntermediatePath(base)
  };

  function generateIntermediatePath(topic: string): RoadNode[] {
    const t = topic.toLowerCase();
    
    if (t.includes('python')) {
      return [
        { title: '🧠 Advanced Python Concepts', children: ladder([
          '🎭 Object-Oriented Programming: classes, inheritance, polymorphism',
          '📦 Modules and packages: organize and reuse code',
          '⚡ List comprehensions and lambda functions',
          '🔧 Error handling with try/except blocks',
        ])},
        { title: '📊 Specialized Libraries', children: ladder([
          '🐼 Pandas for data analysis and CSV/Excel processing', 
          '📈 Matplotlib/Seaborn for data visualization',
          '🌐 Requests for web scraping and API calls',
          '🤖 NumPy for numerical computing and arrays',
        ])},
        { title: '🏗️ Real-World Projects', children: ladder([
          '📊 Data analysis dashboard with real datasets',
          '🌐 Web scraper for price monitoring',
          '🤖 Automated report generator',
          '🎯 Personal finance tracker with visualizations',
        ])},
        { title: '🚀 Professional Development', children: ladder([
          '🧪 Unit testing with pytest framework',
          '📝 Code documentation and type hints',
          '🐳 Virtual environments and dependency management',
          '🔄 Version control with Git and GitHub',
        ])},
      ];
    }
    
    if (t.includes('javascript') || t.includes('js')) {
      return [
        { title: '⚡ Modern JavaScript', children: ladder([
          '🎯 ES6+: arrow functions, destructuring, modules',
          '🔄 Async/await for handling promises cleanly',
          '🏗️ Object-oriented JS: classes and prototypes',
          '📦 npm packages and build tools (Webpack/Vite)',
        ])},
        { title: '🖥️ Frontend Frameworks', children: ladder([
          '⚛️ React basics: components, state, props',
          '🎯 State management with hooks or Redux',
          '🎨 CSS frameworks: Tailwind or styled-components',
          '🌐 API integration and data fetching',
        ])},
        { title: '🚀 Full-Stack Projects', children: ladder([
          '💬 Chat application with real-time messaging',
          '🛒 E-commerce frontend with cart functionality',
          '📱 Progressive Web App (PWA) with offline support',
          '🎮 Interactive game with score tracking',
        ])},
        { title: '🔧 Developer Tools', children: ladder([
          '🧪 Testing with Jest and React Testing Library',
          '📦 Package management and deployment',
          '🔍 Performance optimization and debugging',
          '🏗️ TypeScript for type safety',
        ])},
      ];
    }

    if (t.includes('java')) {
      return [
        { title: '🏗️ Advanced Java Features', children: ladder([
          '📋 Generics and Collections framework mastery',
          '🧵 Multi-threading and concurrent programming',
          '📡 Streams API for functional programming',
          '🔧 Annotations and reflection basics',
        ])},
        { title: '🌐 Enterprise Development', children: ladder([
          '🍃 Spring Framework: dependency injection, MVC',
          '💾 Database integration with JPA/Hibernate',
          '🌐 RESTful web services development',
          '🔒 Security basics: authentication and authorization',
        ])},
        { title: '💼 Professional Projects', children: ladder([
          '🏪 E-commerce backend with database',
          '📊 REST API for a mobile app backend',
          '💰 Banking system with transaction processing',
          '📈 Data processing pipeline with Java streams',
        ])},
        { title: '🚀 Industry Standards', children: ladder([
          '📋 Design patterns: Singleton, Factory, Observer',
          '🧪 Test-driven development with JUnit/Mockito',
          '🔄 CI/CD pipelines with Maven/Gradle',
          '📊 Performance monitoring and profiling',
        ])},
      ];
    }

    // Generic intermediate path
    return [
      { title: '🧠 Advanced Concepts', children: ladder([
        `🎯 Master intermediate ${topic} patterns and techniques`,
        `🔧 Advanced tooling and development environment`,
        `🏗️ Architecture and design principles`,
        `⚡ Performance optimization techniques`,
      ])},
      { title: '🛠️ Professional Skills', children: ladder([
        `🧪 Testing frameworks and methodologies`,
        `📝 Documentation and code quality`,
        `🤝 Team collaboration and version control`,
        `🔒 Security and best practices`,
      ])},
      { title: '🚀 Portfolio Projects', children: ladder([
        `💼 Industry-relevant ${topic} application`,
        `🌐 Full-stack project showcasing skills`,
        `📊 Data-driven project with analytics`,
        `🎯 Open-source contribution to ${topic} project`,
      ])},
      { title: '📈 Career Development', children: ladder([
        `💡 Stay current with ${topic} trends`,
        `🎤 Present your work and teach others`,
        `🌐 Build professional network in ${topic}`,
        `🎯 Specialize in ${topic} subdomain`,
      ])},
    ];
  }

  const advanced: RoadNode = {
    title,
    description: `🎯 Master ${base} architecture, performance, and leadership in complex systems!`,
    children: generateAdvancedPath(base)
  };

  function generateAdvancedPath(topic: string): RoadNode[] {
    const t = topic.toLowerCase();
    
    if (t.includes('python')) {
      return [
        { title: '🏛️ Advanced Architecture', children: ladder([
          '🎯 Design patterns: Factory, Observer, Strategy',
          '🏗️ Microservices architecture with FastAPI/Flask',
          '💾 Advanced database design and ORMs',
          '⚡ Asynchronous programming with asyncio',
        ])},
        { title: '🚀 Performance & Scale', children: ladder([
          '📊 Profiling and performance optimization',
          '🔄 Caching strategies (Redis, Memcached)',
          '🐳 Docker containerization and orchestration',
          '☁️ Cloud deployment (AWS, GCP, Azure)',
        ])},
        { title: '🤖 Specialized Domains', children: ladder([
          '🧠 Machine Learning with scikit-learn/PyTorch',
          '🌐 Web development with Django/FastAPI',
          '📊 Big Data processing with Spark/Dask',
          '🔬 Scientific computing and data engineering',
        ])},
        { title: '👑 Leadership & Innovation', children: ladder([
          '📋 Lead technical architecture decisions',
          '🎓 Mentor junior developers and code reviews',
          '🌟 Contribute to open-source Python projects',
          '🎤 Conference speaking and technical writing',
        ])},
      ];
    }
    
    if (t.includes('javascript') || t.includes('js')) {
      return [
        { title: '🏛️ Advanced Frontend Architecture', children: ladder([
          '🎯 Micro-frontends and component architecture',
          '🔄 State management: Redux Toolkit, Zustand, Recoil',
          '⚡ Performance: lazy loading, code splitting, caching',
          '🧪 Advanced testing: E2E, visual regression, performance',
        ])},
        { title: '🌐 Full-Stack Mastery', children: ladder([
          '🟢 Node.js: Express, NestJS, serverless functions',
          '💾 Database design: PostgreSQL, MongoDB, Redis',
          '🔒 Security: authentication, authorization, OWASP',
          '☁️ DevOps: CI/CD, monitoring, cloud deployment',
        ])},
        { title: '📱 Modern Development', children: ladder([
          '📲 React Native or mobile-first development',
          '⚡ Next.js or advanced SSR/SSG frameworks',
          '🎨 Advanced CSS: animations, responsive design',
          '🔧 TypeScript advanced patterns and tooling',
        ])},
        { title: '🚀 Innovation & Leadership', children: ladder([
          '🏗️ Technical architecture and system design',
          '👥 Team leadership and mentoring',
          '🌟 Open source contributions and maintenance',
          '📈 Performance monitoring and optimization',
        ])},
      ];
    }

    if (t.includes('java')) {
      return [
        { title: '🏛️ Enterprise Architecture', children: ladder([
          '🏗️ Microservices with Spring Boot and Cloud',
          '📊 Event-driven architecture with Apache Kafka',
          '💾 Advanced database patterns and sharding',
          '🔒 Enterprise security and OAuth2/JWT',
        ])},
        { title: '⚡ Performance & Scalability', children: ladder([
          '📈 JVM tuning and garbage collection optimization',
          '🔄 Distributed systems and load balancing',
          '💾 Caching strategies and data partitioning',
          '📊 Monitoring with metrics and distributed tracing',
        ])},
        { title: '☁️ Cloud & DevOps', children: ladder([
          '🐳 Kubernetes orchestration and service mesh',
          '🔄 CI/CD pipelines with Jenkins/GitHub Actions',
          '☁️ AWS/GCP/Azure cloud-native development',
          '📊 Infrastructure as Code with Terraform',
        ])},
        { title: '👑 Technical Leadership', children: ladder([
          '🎯 System design and architecture reviews',
          '👥 Technical mentoring and team building',
          '📋 Code standards and engineering excellence',
          '🌟 Innovation and emerging technology adoption',
        ])},
      ];
    }

    // Generic advanced path
    return [
      { title: '🏛️ System Architecture', children: ladder([
        `🎯 Design scalable ${topic} systems and architectures`,
        `🔧 Advanced patterns and enterprise solutions`,
        `⚡ Performance optimization and bottleneck analysis`,
        `🔒 Security architecture and compliance`,
      ])},
      { title: '🚀 Innovation & Research', children: ladder([
        `🧪 Research emerging ${topic} technologies`,
        `💡 Prototype and evaluate new solutions`,
        `📊 Contribute to ${topic} standards and specifications`,
        `🌟 Innovation in ${topic} tooling and processes`,
      ])},
      { title: '👑 Technical Leadership', children: ladder([
        `🎯 Lead architecture decisions and technical vision`,
        `👥 Mentor teams and establish best practices`,
        `📋 Drive technical strategy and roadmap`,
        `🌐 Build and maintain technical community`,
      ])},
      { title: '🌍 Industry Impact', children: ladder([
        `🎤 Conference speaking and thought leadership`,
        `📝 Technical writing and knowledge sharing`,
        `🌟 Open source leadership and contributions`,
        `🎯 Consulting and advisory roles in ${topic}`,
      ])},
    ];
  }

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
  
  // Determine visual styling based on depth and content
  const getNodeStyling = () => {
    if (depth === 0) {
      return "bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 shadow-lg";
    }
    if (depth === 1) {
      return "bg-gradient-to-r from-accent/5 to-success/5 border-accent/40 shadow-md hover:shadow-lg transition-shadow";
    }
    return "bg-card/80 border-border/60 hover:bg-accent/5 hover:border-accent/50 transition-colors";
  };

  const getTextStyling = () => {
    if (depth === 0) return "text-lg font-bold text-foreground";
    if (depth === 1) return "text-base font-semibold text-foreground";
    return "text-sm font-medium text-foreground/90";
  };

  const getConnectorColor = () => {
    if (depth === 1) return "border-accent/60";
    return "border-border/40";
  };

  return (
    <div className="relative pl-4 mb-2">
      {depth > 0 && (
        <div className={`absolute left-0 top-2 h-full border-l-2 ${getConnectorColor()}`} />
      )}
      
      <div className={`rounded-xl border-2 p-4 ${getNodeStyling()} backdrop-blur-sm`}>
        <div className={getTextStyling()}>{node.title}</div>
        {node.description && (
          <div className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {node.description}
          </div>
        )}
        
        {/* Progress indicator for leaf nodes */}
        {!hasChildren && depth > 1 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1 bg-border/30 rounded-full">
              <div className="h-full w-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 hover:w-1/3" />
            </div>
            <span className="text-xs text-muted-foreground">Ready to start</span>
          </div>
        )}
      </div>
      
      {hasChildren && (
        <div className="ml-6 mt-3 space-y-2">
          {node.children!.map((c, i) => (
            <div key={i} className="relative">
              <div className={`absolute left-[-24px] top-4 w-6 border-t-2 ${getConnectorColor()}`} />
              {depth === 1 && (
                <div className={`absolute left-[-26px] top-3 w-2 h-2 rounded-full bg-accent/70`} />
              )}
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