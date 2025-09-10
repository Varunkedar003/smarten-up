import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Send, 
  Bot, 
  User, 
  Volume2, 
  VolumeX, 
  Lightbulb,
  BookOpen,
  Calculator,
  Atom,
  Globe,
  Mic,
  MicOff,
  Key,
  Brain
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  topic?: string;
}

const suggestedQuestions = [
  {
    question: "Explain photosynthesis in simple terms",
    topic: "Science",
    icon: Atom,
    color: "bg-green-500"
  },
  {
    question: "How do I solve quadratic equations?",
    topic: "Mathematics",
    icon: Calculator,
    color: "bg-blue-500"
  },
  {
    question: "What caused World War I?",
    topic: "History",
    icon: Globe,
    color: "bg-orange-500"
  },
  {
    question: "Help me write a persuasive essay",
    topic: "Language",
    icon: BookOpen,
    color: "bg-purple-500"
  }
];

const aiResponses: Record<string, string> = {
  "explain photosynthesis in simple terms": "Photosynthesis is how plants make their own food! 🌱 Plants take in sunlight, carbon dioxide from the air, and water from their roots. Using a special green substance called chlorophyll, they combine these ingredients to make sugar (glucose) for energy and release oxygen as a bonus! It's like a plant's kitchen where sunlight is the chef. This process is super important because it gives us the oxygen we breathe and removes carbon dioxide from the air. Fun fact: without photosynthesis, there wouldn't be life on Earth as we know it!",
  
  "how do i solve quadratic equations?": "Great question! Quadratic equations are equations in the form ax² + bx + c = 0. Here are the main ways to solve them:\n\n1. **Factoring** (easiest when it works):\n   - Look for two numbers that multiply to 'c' and add to 'b'\n   - Example: x² + 5x + 6 = 0 → (x + 2)(x + 3) = 0\n\n2. **Quadratic Formula** (works for any quadratic):\n   - x = (-b ± √(b² - 4ac)) / 2a\n   - Just plug in your a, b, and c values!\n\n3. **Completing the Square**:\n   - Rewrite the equation in perfect square form\n\nWould you like me to walk through a specific example? 📊",
  
  "what caused world war i?": "World War I started in 1914 due to several interconnected factors:\n\n🔥 **Immediate Cause**: The assassination of Archduke Franz Ferdinand of Austria-Hungary in Sarajevo on June 28, 1914.\n\n⚔️ **Underlying Causes**:\n- **Militarism**: European powers were building up their armies and weapons\n- **Alliances**: Complex web of treaties meant one conflict could involve many nations\n- **Imperialism**: Competition for colonies and resources created tension\n- **Nationalism**: Ethnic groups wanted independence, creating instability\n\n🌍 The alliance system turned a regional conflict into a world war. When Austria-Hungary declared war on Serbia, Russia backed Serbia, Germany backed Austria-Hungary, and soon most of Europe was involved.\n\nIt was called 'The Great War' because nobody had seen anything like it before!",
  
  "help me write a persuasive essay": "I'd love to help you write a compelling persuasive essay! 📝 Here's a structure that works great:\n\n**1. Hook & Introduction**\n- Start with a surprising fact, question, or story\n- Clearly state your position (thesis)\n\n**2. Body Paragraphs** (usually 3):\n- **Point**: Make your argument\n- **Evidence**: Facts, statistics, expert quotes\n- **Explain**: Why this evidence supports your point\n- **Link**: Connect back to your thesis\n\n**3. Address Counter-arguments**\n- Show you understand the other side\n- Explain why your position is still stronger\n\n**4. Conclusion**\n- Restate your thesis in new words\n- Call to action - what should readers do?\n\n**Pro Tips**: Use emotional appeals, logical reasoning, and credible sources. What topic are you writing about? I can give more specific advice! 🎯"
};

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hi there! I'm your AI learning assistant powered by Gemini AI! I can help you understand any topic, solve problems, or clarify doubts. What would you like to learn about today? 🤖📚",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callGeminiAPI = async (message: string): Promise<string> => {
    if (!geminiApiKey) {
      throw new Error('API key required');
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful educational AI assistant. Provide clear, accurate, and engaging explanations. If it's a learning topic, include examples and break it down step by step. Make your response educational and easy to understand. Question: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  };

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputMessage.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      let aiResponse = "";
      
      if (geminiApiKey) {
        // Try Gemini API first
        try {
          aiResponse = await callGeminiAPI(messageContent);
        } catch (error) {
          console.error('Gemini API failed, using fallback:', error);
          // Fall back to local responses
          aiResponse = getFallbackResponse(messageContent);
        }
      } else {
        // Use fallback responses
        aiResponse = getFallbackResponse(messageContent);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Text-to-speech if enabled
      if (speechEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackResponse = (messageContent: string): string => {
    const lowercaseContent = messageContent.toLowerCase();
    
    // Check for predefined responses
    for (const [key, response] of Object.entries(aiResponses)) {
      if (lowercaseContent.includes(key.toLowerCase()) || key.toLowerCase().includes(lowercaseContent)) {
        return response;
      }
    }
    
    // Generate contextual fallback responses
    if (lowercaseContent.includes("array")) {
      return "Arrays are contiguous collections of items of the same type, accessed by index (0‑based). Key ops: access O(1), update O(1), push/pop end O(1) amortized, insert/delete middle O(n). Pitfalls: fixed size in low‑level langs, out‑of‑bounds, shifting costs. Uses: lookup tables, buffers, dynamic arrays. Want examples in JS or Python?";
    } else if (lowercaseContent.includes("stack")) {
      return "Stacks are LIFO structures. Ops: push, pop, peek. Uses: undo, recursion, parsing. Implement with arrays or linked lists. Complexity: O(1) for core ops.";
    } else if (lowercaseContent.includes("queue")) {
      return "Queues are FIFO structures. Ops: enqueue, dequeue, front. Variants: deque, priority queue. Uses: scheduling, BFS. Complexity: O(1) with circular buffer/deque.";
    } else if (lowercaseContent.includes("linked list")) {
      return "Linked lists are nodes with pointers. Pros: O(1) insertion/deletion given node. Cons: O(n) indexing, extra memory. Variants: singly, doubly, circular.";
    } else if (lowercaseContent.includes("tree") || lowercaseContent.includes("bst")) {
      return "Trees organize data hierarchically. BST keeps left<node<right; search/insert/delete O(log n) average if balanced. Variants: AVL, Red‑Black, heaps, tries.";
    } else if (lowercaseContent.includes("graph")) {
      return "Graphs model relationships: vertices + edges. Reps: adjacency list/matrix. Traversals: DFS/BFS. Problems: shortest path, connectivity, cycles.";
    } else if (lowercaseContent.includes("math") || lowercaseContent.includes("calculate")) {
      return "I'd be happy to help with your math question! Could you provide more specific details about what you're working on? Whether it's algebra, geometry, calculus, or basic arithmetic, I can break it down step by step for you. 📊";
    } else if (lowercaseContent.includes("science") || lowercaseContent.includes("biology") || lowercaseContent.includes("chemistry") || lowercaseContent.includes("physics")) {
      return "Science is fascinating! I can explain concepts from biology, chemistry, physics, and earth science. What specific topic or concept would you like me to break down for you? I'll make sure to explain it clearly with examples! 🔬";
    } else if (lowercaseContent.includes("history")) {
      return "History has so many interesting stories and lessons! Whether you're curious about ancient civilizations, world wars, important figures, or historical events, I can provide context and explanations. What period or event interests you? 🏛️";
    } else if (lowercaseContent.includes("write") || lowercaseContent.includes("essay")) {
      return "Writing is a valuable skill! I can help with essays, creative writing, grammar, structure, and more. What type of writing are you working on, and what specific area would you like help with? 📝";
    } else {
      return "That's a great question! I'm here to help you learn and understand various topics. Could you provide a bit more context or detail about what you'd like to know? The more specific you are, the better I can assist you! 💡";
    }
  };

  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled);
    if (speechEnabled && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    toast.success(speechEnabled ? "Speech disabled" : "Speech enabled");
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        toast.success("Listening... Speak now!");
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Speech recognition error. Try again!");
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      toast.error("Speech recognition not supported in this browser");
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Learning Assistant</CardTitle>
                <p className="text-sm text-muted-foreground">Ask me anything about your studies!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                {geminiApiKey ? "Gemini Connected" : "Connect Gemini"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSpeech}
                className="flex items-center gap-2"
              >
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {speechEnabled ? "Speech On" : "Speech Off"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Gemini API Key Input */}
      {showApiKeyInput && (
        <Card>
          <CardContent className="p-4">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Enter your Gemini API key to unlock advanced AI capabilities. Get your free API key from{' '}
                <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Google AI Studio
                </a>
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 mt-3">
              <Input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className="flex-1"
              />
              <Button 
                onClick={() => {
                  if (geminiApiKey) {
                    toast.success("Gemini API connected successfully!");
                    setShowApiKeyInput(false);
                  }
                }}
                disabled={!geminiApiKey}
              >
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Suggested Questions</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedQuestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/5 hover:border-accent/50 transition-colors"
                    onClick={() => handleSendMessage(suggestion.question)}
                  >
                    <div className={`w-8 h-8 ${suggestion.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{suggestion.question}</p>
                      <Badge variant="secondary" className="text-xs mt-1">{suggestion.topic}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="w-8 h-8">
                    {message.type === "ai" ? (
                      <div className="w-full h-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <>
                        <AvatarImage src="/avatars/user.png" />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div className={`flex-1 space-y-1 ${message.type === "user" ? "text-right" : ""}`}>
                    <div
                      className={`inline-block p-3 rounded-lg max-w-[80%] ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <div className="w-full h-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white animate-pulse" />
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <div className="inline-block p-3 rounded-lg bg-muted">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={startListening}
                disabled={isListening}
                className={isListening ? "animate-pulse" : ""}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};