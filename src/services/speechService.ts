// Free text-to-speech service using Web Speech API (no API key required)
export class SpeechService {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  speak(text: string, options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: string;
    lang?: string;
  } = {}): void {
    if (!this.isEnabled || !text.trim()) return;

    // Stop any current speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice properties
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.7;
    utterance.lang = options.lang || 'en-US';

    // Try to find a specific voice
    const voices = this.synthesis.getVoices();
    if (options.voice && voices.length > 0) {
      const selectedVoice = voices.find(voice => 
        voice.name.toLowerCase().includes(options.voice!.toLowerCase())
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else if (voices.length > 0) {
      // Use a pleasant default voice (prefer female voices for educational content)
      const preferredVoice = voices.find(voice => 
        voice.lang === 'en-US' && (
          voice.name.includes('Google') || 
          voice.name.includes('Microsoft') ||
          voice.name.includes('female')
        )
      ) || voices.find(voice => voice.lang === 'en-US') || voices[0];
      
      utterance.voice = preferredVoice;
    }

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  speakExplanation(topic: string, subtopic: string, level: string): void {
    if (!this.isEnabled) return;

    // Build level-aware paragraphs: definition, examples, tips
    const paragraphs = this.getExplanationText(topic, subtopic, level);
    if (!paragraphs || paragraphs.length === 0) return;

    // Cancel any ongoing narration and queue a seamless batch using onend chaining
    this.stop();

    const speakOne = (text: string, onEnd?: () => void) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.7;
      utterance.lang = 'en-US';

      // Prefer pleasant default voice when available
      const voices = this.synthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferred = voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.toLowerCase().includes('female')))
          || voices.find(v => v.lang === 'en-US')
          || voices[0];
        utterance.voice = preferred;
      }

      utterance.onend = () => { onEnd?.(); };
      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    };

    let i = 0;
    const next = () => {
      if (!this.isEnabled) return;
      if (i >= paragraphs.length) return;
      const text = paragraphs[i++];
      speakOne(text, next);
    };

    next();
  }

  private getExplanationText(topic: string, subtopic: string, level: string): string[] {
    // Keyed hand-crafted content (kept for specific cases)
    const key = `${topic}-${subtopic}-${level}`.toLowerCase().replace(/\s+/g, '-');
    const canned: Record<string, string[]> = {
      'algorithms-sorting-easy': [
        'Definition: Sorting means arranging items in order (like smallest to largest).',
        'Example: Bubble sort compares neighbors and swaps them until everything is in order.',
        'Tip: Imagine bubbles rising to the top — the largest elements move toward the end each pass.'
      ],
      'algorithms-sorting-intermediate': [
        'Definition: Efficient sorts use "divide and conquer" to reduce work.',
        'Example: Merge sort splits the list, sorts parts, then merges them in order.',
        'Trade-off: Better time complexity (O(n log n)) but uses extra memory for merging.'
      ],
      'algorithms-sorting-hard': [
        'Definition: Advanced sorts use specialized structures (heaps, buckets, digits).',
        'Example: Heap sort builds a max-heap and repeatedly extracts the max.',
        'Insight: Choose based on constraints — data range, memory, and stability requirements.'
      ],
      'data-structures-arrays-&-lists-easy': [
        'Definition: Arrays store items in order, each with an index starting at 0.',
        'Example: Accessing arr[3] is instant (O(1)).',
        'Tip: Use arrays when you read a lot but don’t insert in the middle often.'
      ],
      'data-structures-stacks-&-queues-easy': [
        'Definition: Stacks are LIFO; Queues are FIFO.',
        'Example: Stack = undo history; Queue = line at a store.',
        'Tip: Push/Pop for stacks; Enqueue/Dequeue for queues.'
      ],
      'algebra-linear-equations-easy': [
        'Definition: A linear equation has the form y = m x + b — a straight line.',
        'Example: y = 2x + 1 passes through (0,1) and (1,3).',
        'Tip: m is slope (rise/run); b is where the line crosses the y‑axis.'
      ],
      'geometry-triangles-easy': [
        'Definition: Triangles have 3 sides/angles; angles sum to 180°.',
        'Example: Right triangle with legs 3 and 4 has hypotenuse 5 (3-4-5).',
        'Tip: Equilateral = all equal; Isosceles = two equal; Scalene = all different.'
      ],
      'mechanics-forces-easy': [
        'Definition: Force makes objects speed up, slow down, or change direction.',
        'Example: F = m × a; doubling mass doubles needed force for same acceleration.',
        'Tip: Inertia keeps motion unchanged unless an external force acts.'
      ],
      'electricity-circuits-easy': [
        'Definition: Current is charge flow; Voltage pushes current; Resistance opposes it.',
        'Example: Ohm’s Law: V = I × R — 9V across 3Ω gives 3A.',
        'Tip: Series adds resistances; parallel reduces equivalent resistance.'
      ],
    };
    if (canned[key]) return canned[key];

    // Dynamic level-aware generator (definition → example → tip)
    const lvl = level.toLowerCase();
    const friendlyLevel = lvl === 'easy' ? 'beginner' : lvl === 'intermediate' ? 'intermediate' : 'advanced';
    const simple = (s: string) => s
      .replace(/\s+/g, ' ')
      .replace(/\s([.,!?:;])/g, '$1');

    const make = (def: string, ex: string, tip: string) => [
      `Definition: ${def}`,
      `Example: ${ex}`,
      `Tip: ${tip}`,
    ].map(simple);

    const t = topic.toLowerCase();
    const st = (subtopic || '').toLowerCase();

    // Computer Science defaults
    if (t.includes('data') && st.includes('array')) {
      if (lvl === 'easy') return make(
        'An array stores items in order with positions called indexes (0, 1, 2, …).',
        'If arr = [5, 2, 9], arr[1] is 2 because indexing starts at 0.',
        'When you mostly read values, arrays are great because access is instant (O(1)).'
      );
      if (lvl === 'intermediate') return make(
        'Arrays have fixed size; inserting in the middle shifts elements (O(n)).',
        'Inserting at index 2 of [1,3,4,5] to add 2 gives [1,3,2,4,5].',
        'Use dynamic arrays (like vectors) to handle growth efficiently.'
      );
      return make(
        'Know cache locality, slicing, and in‑place algorithms for performance.',
        'Quicksort partitions in place; mergesort uses extra memory but is stable.',
        'Choose structure by workload: reads vs inserts vs memory constraints.'
      );
    }
    if (t.includes('data') && (st.includes('stack') || st.includes('queue'))) {
      if (lvl === 'easy') return make(
        'Stacks are last‑in first‑out; queues are first‑in first‑out.',
        'Browser back button = stack; print jobs = queue.',
        'Pick stack for undo; queue for tasks in arrival order.'
      );
      if (lvl === 'intermediate') return make(
        'Stacks use push/pop; queues use enqueue/dequeue; both are O(1).',
        'Queue with two stacks: push to in‑stack; pop from out‑stack, refill when empty.',
        'Bounded queues prevent overflow in producer‑consumer systems.'
      );
      return make(
        'Use deque or ring buffer for high‑throughput queues.',
        'Monotonic stacks/queues help solve sliding window and span problems.',
        'Consider thread‑safe queues in concurrent systems.'
      );
    }
    if (t.includes('data') && st.includes('tree')) {
      if (lvl === 'easy') return make(
        'A tree connects nodes without cycles; a binary tree has up to two children.',
        'In‑order traversal of a BST visits nodes in ascending order.',
        'Picture a family tree: parent → children relationships.'
      );
      if (lvl === 'intermediate') return make(
        'Balancing (AVL/Red‑Black) keeps operations near O(log n).',
        'Pre, In, Post order traversals visit different parts at different times.',
        'Use tries for fast prefix search and autocompletion.'
      );
      return make(
        'Heaps give fast min/max; segment/fenwick trees support range queries.',
        'Binary indexed tree supports prefix sums in O(log n).',
        'Choose structure by query type: range sum, k‑th order, or path queries.'
      );
    }

    // Physics, Chemistry, Biology, Mathematics fallbacks
    if (t.includes('physics')) {
      if (lvl === 'easy') return make(
        `${subtopic} is a basic idea in physics you can feel in daily life.`,
        'For instance, pushing a cart harder makes it speed up more.',
        'Focus on how the formula describes what you experience.'
      );
      if (lvl === 'intermediate') return make(
        `${subtopic} follows specific laws and units; practice with real values.`,
        'Example problems with step‑by‑step solutions build intuition.',
        'Draw free‑body diagrams to reason clearly.'
      );
      return make(
        `Analyse ${subtopic} using models, approximations, and limits.`,
        'Compare theoretical predictions with edge cases.',
        'Check assumptions: frictionless, point mass, steady state, etc.'
      );
    }
    if (t.includes('chem')) {
      if (lvl === 'easy') return make(
        `${subtopic} explains how particles combine or change.`,
        'Mixing acids and bases can neutralize into salt and water.',
        'Balance simple equations to conserve atoms.'
      );
      if (lvl === 'intermediate') return make(
        `${subtopic} follows rules about energy, charge, and molecular shape.`,
        'Rate depends on collisions and activation energy.',
        'Use Lewis structures to predict bonding.'
      );
      return make(
        `Consider kinetics, thermodynamics, and mechanisms together.`,
        'Catalysts change pathway but not equilibrium position.',
        'Spectroscopy helps verify structures and transitions.'
      );
    }
    if (t.includes('bio')) {
      if (lvl === 'easy') return make(
        `${subtopic} looks at living things and how their parts work.`,
        'Mitochondria make cellular energy (ATP).',
        'Compare to a city: nucleus = city hall; membrane = gate.'
      );
      if (lvl === 'intermediate') return make(
        `Zoom into processes: transcription, translation, transport, and control.`,
        'Punnett squares predict inheritance patterns.',
        'Homeostasis keeps internal conditions steady.'
      );
      return make(
        `Study regulation networks, signaling pathways, and evolution.`,
        'Enzyme kinetics follows Michaelis–Menten relations.',
        'Systems biology models interactions at scale.'
      );
    }
    if (t.includes('math')) {
      if (lvl === 'easy') return make(
        `${subtopic} builds on numbers and patterns you already know.`,
        'Solve a simple example step by step to see the rule.',
        'Check your answer by plugging it back in.'
      );
      if (lvl === 'intermediate') return make(
        `Generalize rules and connect them across topics.`,
        'Draw graphs to visualize relationships.',
        'Practice with varied problems to strengthen transfer.'
      );
      return make(
        `Prove properties and analyse limits, growth, or convergence.`,
        'Compare multiple strategies and their complexity.',
        'Abstract the pattern to apply it widely.'
      );
    }

    // Generic fallback
    return make(
      `Let’s explore ${subtopic} in ${topic} at a ${friendlyLevel} level.`,
      `Here is a simple example to ground the idea in practice.`,
      `Listen for tips while you play — repetition builds mastery.`
    );
  }

  stop(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  pause(): void {
    if (this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  isAvailable(): boolean {
    return 'speechSynthesis' in window;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }
}

// Global speech service instance
export const speechService = new SpeechService();

// Initialize voices (some browsers load voices asynchronously)
if (speechService.isAvailable()) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Voices are now loaded
  };
}