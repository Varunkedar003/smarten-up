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
    const explanations = this.getExplanationText(topic, subtopic, level);
    if (explanations.length > 0) {
      // Speak the main explanation
      this.speak(explanations[0], { rate: 0.8, volume: 0.6 });
      
      // Queue additional explanations with delays
      explanations.slice(1).forEach((explanation, index) => {
        setTimeout(() => {
          if (this.isEnabled) {
            this.speak(explanation, { rate: 0.8, volume: 0.6 });
          }
        }, (index + 1) * 8000); // 8 second intervals
      });
    }
  }

  private getExplanationText(topic: string, subtopic: string, level: string): string[] {
    const key = `${topic}-${subtopic}-${level}`.toLowerCase().replace(/\s+/g, '-');
    
    const explanations: Record<string, string[]> = {
      // Computer Science - Algorithms
      'algorithms-sorting-easy': [
        'Sorting algorithms help us arrange data in order. Think of it like organizing books on a shelf by height.',
        'Bubble sort compares neighboring items and swaps them if they are in wrong order. It repeats this process until everything is sorted.',
        'Selection sort finds the smallest item and puts it first, then finds the next smallest and so on.'
      ],
      'algorithms-sorting-intermediate': [
        'Merge sort uses divide and conquer strategy. It splits the array into halves, sorts each half, then merges them back.',
        'Quick sort picks a pivot element and partitions the array around it. Elements smaller than pivot go left, larger go right.',
        'These algorithms are more efficient than basic sorting with better time complexity.'
      ],
      'algorithms-sorting-hard': [
        'Advanced sorting algorithms like heap sort and radix sort use specialized data structures.',
        'Heap sort builds a max heap and repeatedly extracts the maximum element.',
        'Understanding time and space complexity helps choose the right algorithm for different scenarios.'
      ],

      // Computer Science - Data Structures
      'data-structures-arrays-&-lists-easy': [
        'Arrays store elements in continuous memory locations. Each element has an index starting from zero.',
        'You can access any element directly using its index. This makes arrays very fast for reading data.',
        'Lists are similar but can grow or shrink in size dynamically as you add or remove elements.'
      ],
      'data-structures-stacks-&-queues-easy': [
        'Stacks follow Last In First Out principle, like a stack of plates. You can only add or remove from the top.',
        'Queues follow First In First Out principle, like a line at a store. First person in line is first to be served.',
        'These data structures are fundamental for many algorithms and system designs.'
      ],

      // Mathematics 
      'algebra-linear-equations-easy': [
        'Linear equations represent straight lines on a graph. They have the form y equals mx plus b.',
        'The variable m is the slope, which tells us how steep the line is.',
        'The variable b is the y-intercept, where the line crosses the y-axis.'
      ],
      'geometry-triangles-easy': [
        'Triangles have three sides and three angles. The sum of all angles in a triangle is always 180 degrees.',
        'Different types include equilateral with all sides equal, isosceles with two equal sides, and scalene with all different sides.',
        'The Pythagorean theorem relates the sides of right triangles: a squared plus b squared equals c squared.'
      ],

      // Physics
      'mechanics-forces-easy': [
        'Forces are pushes or pulls that can change how objects move. Force equals mass times acceleration.',
        'Newtons first law states that objects at rest stay at rest, and objects in motion stay in motion, unless acted upon by a force.',
        'Friction is a force that opposes motion between surfaces in contact.'
      ],
      'electricity-circuits-easy': [
        'Electric current is the flow of electric charge through a conductor like a wire.',
        'Voltage is the force that pushes the current through the circuit. Current flows from high voltage to low voltage.',
        'Resistance opposes the flow of current. Ohms law states voltage equals current times resistance.'
      ],

      // Add more explanations for other subjects...
    };

    return explanations[key] || [
      `Let's learn about ${subtopic} in ${topic}. This ${level} level content will help you understand the fundamentals.`,
      `Pay attention to the interactive elements as they demonstrate key concepts in ${subtopic}.`,
      `Practice makes perfect! Try different approaches to master ${subtopic}.`
    ];
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