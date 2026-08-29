import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, X, Send, Sparkles, User, Volume2, VolumeX, Mic, MicOff,
  BookOpen, Calendar, CreditCard, Clock, Award, ShieldAlert,
  CheckCircle2, HelpCircle, RefreshCw, Trophy, Flame, Play,
  FileText, UserCheck, Briefcase, Zap, Brain, MapPin, Smile,
  ExternalLink, ArrowRight, MessageSquare, ChevronRight, Maximize2,
  Minimize2, Trash2, Download, Copy, Check, Sliders, Settings,
  Calculator, Key, AlertTriangle, ShieldCheck, Dumbbell, Code
} from 'lucide-react';
import {
  callGeminiAPI,
  processOfflineQuery,
  generateFormalDocument,
  getStoredGeminiKey,
  saveGeminiKey,
  getStoredPersona,
  savePersona
} from '../../lib/aiEngineService';
import './AIAssistant.css';
import './Dashboard.css';

/* ═══════════════════════════════════════════════════════════════
   PRACTICE QUIZ DATA BANK (6 SUBJECT TRACKS)
   ═══════════════════════════════════════════════════════════════ */
const QUIZ_BANK = {
  cloud: {
    title: 'Cloud Computing & DevOps',
    code: 'MCA-501',
    icon: '☁️',
    questions: [
      {
        q: 'Which cloud deployment model is operated solely for a single organization?',
        options: ['Public Cloud', 'Private Cloud', 'Community Cloud', 'Hybrid Cloud'],
        correct: 1,
        explanation: 'Private cloud infrastructure is provisioned for exclusive use by a single organization, ensuring maximum security and governance.',
      },
      {
        q: 'What type of cloud service model is AWS EC2 or Google Compute Engine?',
        options: ['SaaS', 'PaaS', 'IaaS', 'FaaS'],
        correct: 2,
        explanation: 'IaaS (Infrastructure as a Service) provides raw compute, virtual machines, networking, and block storage.',
      },
      {
        q: 'Which hypervisor runs directly on bare-metal hardware without an underlying OS?',
        options: ['Type 2 Hypervisor', 'Type 1 Bare-Metal Hypervisor', 'Container Engine', 'KVM User Module'],
        correct: 1,
        explanation: 'Type 1 hypervisors (e.g. VMware ESXi, Xen) run directly on physical hardware for minimal virtualization overhead.',
      },
      {
        q: 'What is the key advantage of Containerization (Docker) over traditional Virtual Machines?',
        options: ['Runs full OS kernel per container', 'Lightweight, shares host OS kernel, starts in milliseconds', 'Requires dedicated physical blade servers', 'Higher disk memory footprint'],
        correct: 1,
        explanation: 'Containers share the host operating system kernel and isolate at process level, starting in milliseconds.',
      },
    ],
  },
  ml: {
    title: 'Machine Learning & Neural Networks',
    code: 'MCA-502',
    icon: '🧠',
    questions: [
      {
        q: 'Which algorithm is typically used for classification tasks with a non-linear decision boundary?',
        options: ['Linear Regression', 'Support Vector Machine (RBF Kernel)', 'K-Means Clustering', 'Apriori Algorithm'],
        correct: 1,
        explanation: 'SVM with RBF (Radial Basis Function) kernel transforms data into higher dimensions for non-linear classification.',
      },
      {
        q: 'What activation function is commonly used in hidden layers of Deep Neural Networks to prevent vanishing gradients?',
        options: ['Sigmoid', 'Softmax', 'ReLU (Rectified Linear Unit)', 'Tanh'],
        correct: 2,
        explanation: 'ReLU f(x) = max(0, x) prevents vanishing gradients for positive inputs and computes extremely fast.',
      },
      {
        q: 'Which metric measures the proportion of actual positives that were correctly identified by the model?',
        options: ['Precision', 'Recall (Sensitivity)', 'Accuracy', 'F1-Score'],
        correct: 1,
        explanation: 'Recall = True Positives / (True Positives + False Negatives), measuring sensitivity to positive cases.',
      },
      {
        q: 'Which optimization algorithm adapts learning rates per parameter using moving averages of gradients?',
        options: ['Vanilla SGD', 'Batch Gradient Descent', 'Adam (Adaptive Moment Estimation)', 'Hill Climbing'],
        correct: 2,
        explanation: 'Adam combines the advantages of AdaGrad and RMSProp for efficient deep learning gradient descent optimization.',
      },
    ],
  },
  dbms: {
    title: 'Advanced Database Systems',
    code: 'MCA-503',
    icon: '🗄️',
    questions: [
      {
        q: 'What does the "A" in ACID database transactions stand for?',
        options: ['Availability', 'Atomicity', 'Authentication', 'Aggregation'],
        correct: 1,
        explanation: 'Atomicity ensures that all statements within a transaction commit successfully or all rollback without partial execution.',
      },
      {
        q: 'Which SQL join returns all rows from the left table and matched rows from the right table?',
        options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'FULL OUTER JOIN'],
        correct: 2,
        explanation: 'LEFT JOIN keeps all records from the left table regardless of right table matches.',
      },
      {
        q: 'What is the primary advantage of B+ Tree indexes in relational database engines?',
        options: ['O(1) lookup speed', 'Sequential disk I/O and balanced range searches', 'Zero memory overhead', 'Automatic sharding'],
        correct: 1,
        explanation: 'B+ Trees store all data pointers at leaf nodes linked sequentially for optimal range scans and logarithmic search.',
      },
      {
        q: 'Which normalization form eliminates transitive functional dependencies on candidate keys?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correct: 2,
        explanation: 'Third Normal Form (3NF) requires 2NF and ensures no non-prime attribute depends transitively on the primary key.',
      },
    ],
  },
  web: {
    title: 'Web Technologies & Frameworks',
    code: 'MCA-504',
    icon: '🌐',
    questions: [
      {
        q: 'What does the Virtual DOM in React primarily optimize?',
        options: ['Database query speeds', 'Batch updates to minimize direct browser DOM reflows', 'CSS file download size', 'Server CPU usage'],
        correct: 1,
        explanation: 'Virtual DOM computes diffs in memory and patches only changed real DOM nodes in batches to maximize rendering efficiency.',
      },
      {
        q: 'Which HTTP method is idempotent and used to replace an entire resource?',
        options: ['POST', 'PATCH', 'PUT', 'CONNECT'],
        correct: 2,
        explanation: 'PUT replaces the entire targeted resource and multiple identical requests yield the exact same server state.',
      },
      {
        q: 'In JavaScript, what is the event loop mechanism primarily responsible for?',
        options: ['Compiling C++ bindings', 'Executing asynchronous callbacks from the task queue onto the call stack', 'Garbage collecting global variables', 'Managing TCP sockets'],
        correct: 1,
        explanation: 'The event loop continuously monitors the call stack and moves pending callbacks from task/microtask queues when the stack is empty.',
      },
    ],
  },
  dsa: {
    title: 'Data Structures & Algorithms',
    code: 'BCA-301',
    icon: '💻',
    questions: [
      {
        q: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black)?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correct: 1,
        explanation: 'Balanced BSTs halve the search space at each level, ensuring O(log n) worst and average search time.',
      },
      {
        q: 'Which algorithm is used to find the minimum spanning tree of an undirected weighted graph?',
        options: ['Dijkstra Algorithm', 'Kruskal Algorithm', 'Floyd-Warshall', 'A* Search'],
        correct: 1,
        explanation: 'Kruskal (using Disjoint Set Union) and Prim algorithms construct Minimum Spanning Trees in O(E log V) time.',
      },
    ],
  },
  sports: {
    title: 'Sports Science & Kinesiology',
    code: 'BPED-101',
    icon: '🏅',
    questions: [
      {
        q: 'Which energy system is predominantly utilized during a 100-meter sprint (0 to 10 seconds)?',
        options: ['Aerobic Oxidative System', 'ATP-CP (Phosphagen) System', 'Lactic Acid Glycolytic System', 'Beta-Oxidation'],
        correct: 1,
        explanation: 'The ATP-CP phosphocreatine system provides instantaneous maximal anaerobic power for explosive efforts lasting under 10 seconds.',
      },
      {
        q: 'In biomechanics, what does the first-class lever in the human body represent?',
        options: ['Fulcrum between Effort and Load (e.g. Neck extension)', 'Load between Fulcrum and Effort (e.g. Calf raise)', 'Effort between Fulcrum and Load (e.g. Biceps curl)', 'Zero torque lever'],
        correct: 0,
        explanation: 'First-class levers have the fulcrum situated between the effort and resistance, such as the atlanto-occipital joint of the neck.',
      },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   QUICK ACTION CHIPS BY ROLE
   ═══════════════════════════════════════════════════════════════ */
const QUICK_SUGGESTIONS = [
  { label: '📊 Attendance Risk Radar', query: 'Check my attendance and bunk simulation', modalKey: 'risk_radar' },
  { label: '📜 Marksheet & CGPA', query: 'Show my marksheet and SGPA grades', modalKey: 'marksheet' },
  { label: '💳 Fee Passbook & Ledger', query: 'View my semester fee status and receipt', modalKey: 'fee_passbook' },
  { label: '🪪 Smart Digital ID Card', query: 'Open my digital ID card', modalKey: 'id_card' },
  { label: '🎫 Exam Hall Ticket', query: 'Check my hall ticket approval and seat number', modalKey: 'hall_ticket' },
  { label: '💼 T&P Placement Drives', query: 'Show campus placement drives and applications', modalKey: 'placement' },
  { label: '📄 ATS Resume Builder', query: 'Open ATS Resume Builder Studio', modalKey: 'resume' },
  { label: '🤖 AI Career Path', query: 'Predict my career roadmap and salary fit', modalKey: 'career_path' },
  { label: '🏆 Gamified Leaderboard', query: 'Show student leaderboard rank and XP', modalKey: 'leaderboard' },
  { label: '📅 Academic Calendar', query: 'Show upcoming exam dates and holidays', modalKey: 'calendar' },
  { label: '📚 Central Library', query: 'Search library catalog and issued books', modalKey: 'library' },
  { label: '⏰ Class Timetable', query: 'Show my weekly timetable schedule', modalKey: 'timetable' },
  { label: '📝 Apply for Leave', query: 'How do I apply for student leave or medical excuse?', modalKey: 'leave' },
  { label: '🗺️ Interactive Campus Map', query: 'Open campus map and facility locator', modalKey: 'campus_map' },
];

/**
 * Helper to render formatted markdown, bold text, code blocks with copy
 */
function MarkdownRenderer({ content }) {
  // Check for fenced code blocks
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex),
    });
  }

  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div>
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          return (
            <div key={idx} className="ai-code-block">
              <div className="ai-code-header">
                <span>{part.language || 'Code Snippet'}</span>
                <button
                  onClick={() => handleCopyCode(part.content, idx)}
                  className="ai-code-copy-btn"
                  title="Copy code to clipboard"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check size={12} color="#10b981" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy Code
                    </>
                  )}
                </button>
              </div>
              <pre className="ai-code-content">{part.content}</pre>
            </div>
          );
        }

        // Render simple markdown: bold, list items, inline code
        const lines = part.content.split('\n');
        return (
          <div key={idx}>
            {lines.map((line, lIdx) => {
              if (!line.trim()) return <div key={lIdx} style={{ height: '6px' }} />;

              // Format **bold**
              const formattedLine = line.split(/(\*\*.*?\*\*)/g).map((seg, sIdx) => {
                if (seg.startsWith('**') && seg.endsWith('**')) {
                  return <strong key={sIdx} style={{ color: '#ffffff' }}>{seg.slice(2, -2)}</strong>;
                }
                if (seg.startsWith('`') && seg.endsWith('`')) {
                  return (
                    <code
                      key={sIdx}
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#67e8f9',
                        fontFamily: 'monospace',
                      }}
                    >
                      {seg.slice(1, -1)}
                    </code>
                  );
                }
                return seg;
              });

              return (
                <p key={lIdx} style={{ margin: '0 0 4px', lineHeight: '1.45' }}>
                  {formattedLine}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function AIAssistantWidget({ currentUser, onOpenModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'quiz' | 'tools' | 'settings'
  const [inputQuery, setInputQuery] = useState('');
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN'); // 'en-IN' | 'hi-IN' | 'mr-IN'
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Tools state
  const [bunkSimLectures, setBunkSimLectures] = useState(4);
  const [targetCgpa, setTargetCgpa] = useState(8.5);
  const [docType, setDocType] = useState('sick_leave');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [docCopied, setDocCopied] = useState(false);

  // Settings state
  const [apiKeyInput, setApiKeyInput] = useState(getStoredGeminiKey());
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(getStoredPersona());

  // Quiz state
  const [activeSubject, setActiveSubject] = useState('cloud');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const isHOD = currentUser?.role === 'hod' || currentUser?.userType === 'hod';
  const isFaculty = currentUser?.role === 'faculty' || currentUser?.userType === 'faculty';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.userType === 'admin';
  const isStudent = !isHOD && !isFaculty && !isAdmin && (currentUser?.userType === 'student' || currentUser?.prn || currentUser?.course);
  const displayName = currentUser ? currentUser.name.split(' ')[0] : 'Visitor';

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: currentUser
        ? isHOD
          ? `Greetings Dr. ${displayName}! 🎓 I am your DCPE HOD Copilot. How may I assist you with pending student approvals, faculty lecture timetables, department circulars, or seating arrangements today?`
          : isFaculty
          ? `Welcome Prof. ${displayName}! 👨‍🏫 I am your Faculty Copilot. Ask me about your teaching timetable, student attendance summaries, or generating classroom exam quizzes!`
          : isAdmin
          ? `Welcome Admin Executive ${displayName}! ⚙️ I am your DCPE ERP Copilot. How may I assist you with fee collections, user roles, or institutional analytics?`
          : `Hello ${displayName}! 👋 I am your DCPE Genius AI Copilot v4.0. Ask me anything about Attendance Risk Radar, SGPA Marksheet, Fee Passbook, Coding Doubts, Placements, or Practice Quizzes!`
        : `Welcome to Shree H.V.P. Mandal's Degree College of Physical Education (Autonomous)! 👋 I am your Campus AI Assistant. How can I help you with Autonomous Programs (MCA, BCA, B.P.Ed, M.P.Ed), 2026 Admissions, or Campus Facilities?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionKey: null,
      actionLabel: null,
      suggestedFollowUps: ['Check my Attendance %', 'Show my Marksheet', 'How many classes can I bunk?', 'Start Practice Quiz'],
    },
  ]);

  useEffect(() => {
    if (messagesEndRef.current && isOpen && activeTab === 'chat') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab, isLoadingAI]);

  // Voice Recognition (Web Speech API)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please try Google Chrome or MS Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = (event) => {
        console.error('[DCPE Voice Error]:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to initialize:', err);
      setIsListening(false);
    }
  };

  // Speech Synthesis
  const speakText = (text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[^\w\s.,?!]/gi, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = selectedLanguage;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Main Query Dispatcher (Gemini Live API + Offline Intelligence Engine)
  const handleSend = async (textToSend) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg = {
      sender: 'user',
      text: q.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoadingAI(true);

    const storedKey = getStoredGeminiKey();
    let reply = '';
    let actionKey = null;
    let actionLabel = null;
    let suggestedFollowUps = [];

    if (storedKey) {
      // Attempt live Google Gemini API
      try {
        reply = await callGeminiAPI(q.trim(), messages, currentUser || {}, selectedLanguage);
        // Extract matching action key from query
        const offlineCheck = processOfflineQuery(q.trim(), currentUser, selectedLanguage);
        actionKey = offlineCheck.actionKey;
        actionLabel = offlineCheck.actionLabel;
        suggestedFollowUps = offlineCheck.suggestedFollowUps || [];
      } catch (err) {
        console.warn('[DCPE Gemini API Fallback]:', err.message);
        const offline = processOfflineQuery(q.trim(), currentUser, selectedLanguage);
        reply = offline.reply;
        actionKey = offline.actionKey;
        actionLabel = offline.actionLabel;
        suggestedFollowUps = offline.suggestedFollowUps || [];
      }
    } else {
      // Use local offline Institutional Intelligence Engine
      const offline = processOfflineQuery(q.trim(), currentUser, selectedLanguage);
      reply = offline.reply;
      actionKey = offline.actionKey;
      actionLabel = offline.actionLabel;
      suggestedFollowUps = offline.suggestedFollowUps || [];
    }

    const aiMsg = {
      sender: 'ai',
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionKey,
      actionLabel,
      suggestedFollowUps,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoadingAI(false);
    speakText(reply);
  };

  const handleQuickChip = (chip) => {
    if (chip.modalKey === 'quiz') {
      setActiveTab('quiz');
      return;
    }
    if (onOpenModal && chip.modalKey) {
      onOpenModal(chip.modalKey);
    }
    handleSend(chip.query);
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: `Conversation cleared. How can I assist you now, ${displayName}?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: ['Check my Attendance', 'Practice Exam Quiz', 'ATS Resume Tips'],
      },
    ]);
  };

  const exportChat = () => {
    const textData = messages.map((m) => `[${m.time}] ${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
    const blob = new Blob([textData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DCPE_AI_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Save API Key
  const handleSaveApiKey = () => {
    saveGeminiKey(apiKeyInput);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2500);
  };

  // Handle Generate Document
  const handleGenerateDoc = () => {
    const doc = generateFormalDocument(docType, {
      name: currentUser?.name || 'Parth Deshmukh',
      prn: currentUser?.prn || '2024MCA0042',
      course: currentUser?.course || 'MCA 2nd Year (Autonomous)',
      cgpa: currentUser?.cgpa || '8.50',
    });
    setGeneratedDoc(doc);
    setDocCopied(false);
  };

  const handleCopyDoc = () => {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc);
    setDocCopied(true);
    setTimeout(() => setDocCopied(false), 2000);
  };

  // Quiz Handlers
  const handleQuizAnswer = (optionIdx) => {
    setSelectedOption(optionIdx);
    const qObj = QUIZ_BANK[activeSubject].questions[currentQIndex];
    if (optionIdx === qObj.correct) {
      setQuizScore((s) => s + 1);
    }
  };

  const nextQuizQuestion = () => {
    const totalQ = QUIZ_BANK[activeSubject].questions.length;
    if (currentQIndex < totalQ - 1) {
      setCurrentQIndex((i) => i + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  // Calculated bunk simulation values
  const rawAtt = parseFloat(currentUser?.attendance || '78.5');
  const simTotal = 80;
  const currentAttended = Math.round((rawAtt / 100) * simTotal);
  const simNewPct = (((currentAttended) / (simTotal + bunkSimLectures)) * 100).toFixed(1);

  // Calculated required SGPA
  const currentCgpa = parseFloat(currentUser?.cgpa || '8.50');
  const completedSems = 3;
  const remainingSems = 1;
  const neededSgpa = Math.max(0, ((targetCgpa * (completedSems + remainingSems)) - (currentCgpa * completedSems)) / remainingSems).toFixed(2);

  return (
    <>
      {/* Floating Trigger Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="ai-floating-trigger"
          title="Open DCPE Genius AI Copilot v4.0"
        >
          <Sparkles size={26} color="#67e8f9" />
          <span className="ai-floating-badge" />
        </button>
      )}

      {/* Backdrop for fullscreen mode */}
      {isOpen && isFullscreen && (
        <div className="ai-assistant-backdrop" onClick={() => setIsFullscreen(false)} />
      )}

      {/* Main AI Chat & Workstation Drawer */}
      {isOpen && (
        <div className={`ai-assistant-drawer ${isFullscreen ? 'fullscreen' : ''}`}>
          {/* Header */}
          <div className="ai-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #d9234f, #f43f5e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(217,35,79,0.35)',
                }}
              >
                <Bot size={20} color="#fff" />
              </div>
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: '14.5px',
                    fontWeight: 800,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  DCPE Genius AI
                  <span
                    style={{
                      fontSize: '9.5px',
                      background: getStoredGeminiKey() ? 'rgba(16,185,129,0.25)' : 'rgba(56,189,248,0.2)',
                      color: getStoredGeminiKey() ? '#34d399' : '#38bdf8',
                      padding: '2px 7px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      border: `1px solid ${getStoredGeminiKey() ? 'rgba(16,185,129,0.4)' : 'rgba(56,189,248,0.3)'}`,
                    }}
                  >
                    {getStoredGeminiKey() ? '⚡ Gemini Live' : '🧠 Knowledge Engine v4.0'}
                  </span>
                </h4>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                  {currentUser ? `${currentUser.name} (${currentUser.role || 'Student'})` : 'Campus Copilot & Knowledge Engine'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '11px',
                  borderRadius: '8px',
                  padding: '3px 6px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                title="Voice & Language Preference"
              >
                <option value="en-IN" style={{ background: '#1e1b4b', color: '#fff' }}>English</option>
                <option value="hi-IN" style={{ background: '#1e1b4b', color: '#fff' }}>हिन्दी (Hindi)</option>
                <option value="mr-IN" style={{ background: '#1e1b4b', color: '#fff' }}>मराठी (Marathi)</option>
              </select>

              {/* Speech Synthesis Audio Toggle */}
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                style={{
                  background: speechEnabled ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.06)',
                  border: 'none',
                  borderRadius: '8px',
                  color: speechEnabled ? '#38bdf8' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={speechEnabled ? 'Mute AI Voice' : 'Enable AI Voice Synthesis'}
              >
                {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsFullscreen(false);
                }}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Close AI Assistant"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <div className="ai-nav-tabs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`ai-nav-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            >
              <MessageSquare size={13} /> AI Copilot
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`ai-nav-tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            >
              <Trophy size={13} /> Exam Quiz Studio
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`ai-nav-tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
            >
              <Zap size={13} /> AI Quick Tools
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`ai-nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={13} /> AI Settings
            </button>
          </div>

          {/* TAB 1: AI COPILOT CHAT */}
          {activeTab === 'chat' && (
            <>
              {/* Chat Actions Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 14px',
                  background: 'rgba(0,0,0,0.2)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                <span>{messages.length} messages in conversation</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={exportChat}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                    title="Export conversation history"
                  >
                    <Download size={12} /> Export
                  </button>
                  <button
                    onClick={clearChat}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                    title="Clear chat"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div className="ai-messages-container">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`ai-message-bubble ${msg.sender === 'user' ? 'user' : 'ai'}`}
                  >
                    {msg.sender === 'ai' ? (
                      <MarkdownRenderer content={msg.text} />
                    ) : (
                      <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                    )}

                    {/* Interactive Action Button for AI recommendations */}
                    {msg.sender === 'ai' && msg.actionKey && (
                      <div style={{ marginTop: '10px' }}>
                        <button
                          onClick={() => {
                            if (msg.actionKey === 'quiz') {
                              setActiveTab('quiz');
                            } else if (onOpenModal) {
                              onOpenModal(msg.actionKey);
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'linear-gradient(135deg, #059669, #10b981)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '6px 12px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
                            transition: 'transform 0.2s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          <span>{msg.actionLabel || 'Open Feature →'}</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}

                    {/* Suggested Follow-up Chips */}
                    {msg.sender === 'ai' && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && idx === messages.length - 1 && (
                      <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {msg.suggestedFollowUps.map((chipText, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => handleSend(chipText)}
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '12px',
                              padding: '4px 9px',
                              color: '#93c5fd',
                              fontSize: '10.5px',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            💡 {chipText}
                          </button>
                        ))}
                      </div>
                    )}

                    <div style={{ fontSize: '9.5px', opacity: 0.55, marginTop: '4px', textAlign: 'right' }}>
                      {msg.time}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoadingAI && (
                  <div className="ai-message-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="ai-voice-wave">
                      <div className="ai-voice-bar" />
                      <div className="ai-voice-bar" />
                      <div className="ai-voice-bar" />
                      <div className="ai-voice-bar" />
                    </div>
                    <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Thinking & reasoning...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips Scroll */}
              <div className="ai-chips-scroll">
                {QUICK_SUGGESTIONS.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickChip(chip)}
                    className="ai-chip-btn"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Voice Listening Active Wave Bar */}
              {isListening && (
                <div
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    borderTop: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    fontSize: '11.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="ai-voice-wave">
                      <div className="ai-voice-bar" style={{ background: '#ef4444' }} />
                      <div className="ai-voice-bar" style={{ background: '#ef4444' }} />
                      <div className="ai-voice-bar" style={{ background: '#ef4444' }} />
                      <div className="ai-voice-bar" style={{ background: '#ef4444' }} />
                    </div>
                    <span>Listening in {selectedLanguage === 'en-IN' ? 'English' : selectedLanguage === 'hi-IN' ? 'Hindi' : 'Marathi'}... Speak now!</span>
                  </div>
                  <button
                    onClick={toggleListening}
                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: '11px', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Chat Input & Voice Trigger */}
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.35)',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}
              >
                <button
                  onClick={toggleListening}
                  style={{
                    background: isListening ? '#ef4444' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                  title={isListening ? 'Stop Listening' : 'Speak Prompt (English / Hindi / Marathi)'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isLoadingAI && handleSend()}
                  placeholder={isListening ? 'Listening...' : 'Ask about attendance, marksheets, fees, coding...'}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    padding: '9px 14px',
                    color: '#fff',
                    fontSize: '12.5px',
                    outline: 'none',
                  }}
                  disabled={isLoadingAI}
                />

                <button
                  onClick={() => handleSend()}
                  disabled={isLoadingAI || !inputQuery.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    border: 'none',
                    borderRadius: '12px',
                    width: '38px',
                    height: '38px',
                    color: '#fff',
                    cursor: !inputQuery.trim() || isLoadingAI ? 'default' : 'pointer',
                    opacity: !inputQuery.trim() || isLoadingAI ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  title="Send Query"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}

          {/* TAB 2: EXAM PRACTICE QUIZ ENGINE */}
          {activeTab === 'quiz' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
              {/* Subject Selector */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
                {Object.entries(QUIZ_BANK).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveSubject(key);
                      resetQuiz();
                    }}
                    style={{
                      background: activeSubject === key ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(255,255,255,0.08)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '7px 12px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>{s.icon}</span> {s.code} • {s.title.split(' ')[0]}
                  </button>
                ))}
              </div>

              {!quizFinished ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase' }}>
                        {QUIZ_BANK[activeSubject].title}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                        Question {currentQIndex + 1} of {QUIZ_BANK[activeSubject].questions.length}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 14px', lineHeight: '1.45' }}>
                      {QUIZ_BANK[activeSubject].questions[currentQIndex].q}
                    </h4>

                    {/* MCQ Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {QUIZ_BANK[activeSubject].questions[currentQIndex].options.map((opt, idx) => {
                        const isCorrect = idx === QUIZ_BANK[activeSubject].questions[currentQIndex].correct;
                        const isSelected = selectedOption === idx;
                        let bg = 'rgba(255,255,255,0.06)';
                        let border = '1px solid rgba(255,255,255,0.1)';

                        if (selectedOption !== null) {
                          if (isCorrect) {
                            bg = 'rgba(16,185,129,0.25)';
                            border = '1px solid #10b981';
                          } else if (isSelected) {
                            bg = 'rgba(239,68,68,0.25)';
                            border = '1px solid #ef4444';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleQuizAnswer(idx)}
                            disabled={selectedOption !== null}
                            style={{
                              background: bg,
                              border: border,
                              borderRadius: '12px',
                              padding: '12px 14px',
                              color: '#fff',
                              fontSize: '12.5px',
                              fontWeight: 600,
                              textAlign: 'left',
                              cursor: selectedOption !== null ? 'default' : 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>
                              <span style={{ opacity: 0.7, marginRight: '8px' }}>{String.fromCharCode(65 + idx)}.</span> {opt}
                            </span>
                            {selectedOption !== null && isCorrect && <CheckCircle2 size={16} color="#10b981" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {selectedOption !== null && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '10px 14px',
                          background: 'rgba(59,130,246,0.15)',
                          borderLeft: '3px solid #3b82f6',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          color: '#93c5fd',
                          lineHeight: '1.45',
                        }}
                      >
                        💡 <strong>Explanation:</strong> {QUIZ_BANK[activeSubject].questions[currentQIndex].explanation}
                      </div>
                    )}
                  </div>

                  {/* Next Button */}
                  {selectedOption !== null && (
                    <button
                      onClick={nextQuizQuestion}
                      style={{
                        marginTop: '16px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      {currentQIndex < QUIZ_BANK[activeSubject].questions.length - 1 ? 'Next Question →' : 'Complete Quiz & View Score 🎉'}
                    </button>
                  )}
                </div>
              ) : (
                /* Quiz Completion View */
                <div style={{ textAlign: 'center', padding: '20px 10px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={52} color="#f59e0b" style={{ marginBottom: '12px' }} />
                  <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#fff' }}>Practice Quiz Complete!</h3>
                  <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                    You scored <strong>{quizScore} / {QUIZ_BANK[activeSubject].questions.length}</strong> in {QUIZ_BANK[activeSubject].title}!
                  </p>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(16,185,129,0.2)',
                      color: '#10b981',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 800,
                      marginBottom: '20px',
                      border: '1px solid rgba(16,185,129,0.3)',
                    }}
                  >
                    <Flame size={16} /> +50 XP Earned towards Leaderboard!
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={resetQuiz}
                      style={{
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '10px 18px',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                      }}
                    >
                      Retake Quiz 🔄
                    </button>
                    <button
                      onClick={() => setActiveTab('chat')}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        padding: '10px 18px',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                      }}
                    >
                      Back to Chat 💬
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI QUICK TOOLS & CALCULATORS */}
          {activeTab === 'tools' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Tool 1: Attendance Bunk Forecaster */}
              <div className="ai-tool-card">
                <h5 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 800, color: '#67e8f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calculator size={16} /> Attendance Bunk & Safety Calculator
                </h5>
                <p style={{ margin: '0 0 10px', fontSize: '11.5px', color: 'rgba(255,255,255,0.7)' }}>
                  Simulate your attendance percentage if you miss upcoming lectures.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#fff' }}>Simulated Missed Classes: <strong>{bunkSimLectures}</strong></span>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={bunkSimLectures}
                    onChange={(e) => setBunkSimLectures(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: '#38bdf8' }}
                  />
                </div>
                <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '11.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Current: <strong>{currentUser?.attendance || '78.5%'}</strong></span>
                  <span>Projected: <strong style={{ color: parseFloat(simNewPct) >= 75 ? '#10b981' : '#f87171' }}>{simNewPct}%</strong> {parseFloat(simNewPct) >= 75 ? '(Safe ✓)' : '(Warning ⚠️)'}</span>
                </div>
              </div>

              {/* Tool 2: Target CGPA Forecaster */}
              <div className="ai-tool-card">
                <h5 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} /> Target CGPA SGPA Planner
                </h5>
                <p style={{ margin: '0 0 10px', fontSize: '11.5px', color: 'rgba(255,255,255,0.7)' }}>
                  Find the exact SGPA needed in remaining semesters to achieve your goal.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#fff' }}>Target Overall CGPA:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="6.0"
                    max="10.0"
                    value={targetCgpa}
                    onChange={(e) => setTargetCgpa(parseFloat(e.target.value) || 8.0)}
                    style={{ width: '70px', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                  />
                </div>
                <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '11.5px', color: '#fbbf24' }}>
                  🎯 Required SGPA next semester: <strong>{neededSgpa} / 10.0</strong> {parseFloat(neededSgpa) > 10.0 ? '(Mathematically unattainable in 1 semester)' : '✓'}
                </div>
              </div>

              {/* Tool 3: AI Formal Application & Letter Drafter */}
              <div className="ai-tool-card">
                <h5 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> AI Formal Letter & Application Drafter
                </h5>
                <p style={{ margin: '0 0 10px', fontSize: '11.5px', color: 'rgba(255,255,255,0.7)' }}>
                  Auto-generate formatted institutional applications ready for submission.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontSize: '11.5px', outline: 'none' }}
                  >
                    <option value="sick_leave" style={{ background: '#1e1b4b' }}>Sick Leave Application (Fever/Medical)</option>
                    <option value="sports_leave" style={{ background: '#1e1b4b' }}>Sports Tournament Duty Attendance Condonation</option>
                    <option value="bonafide" style={{ background: '#1e1b4b' }}>Bonafide Certificate Request</option>
                    <option value="fee_concession" style={{ background: '#1e1b4b' }}>Fee Concession / Installment Request</option>
                  </select>
                  <button
                    onClick={handleGenerateDoc}
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#fff', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Draft Letter ⚡
                  </button>
                </div>

                {generatedDoc && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Generated Document Preview:</span>
                      <button
                        onClick={handleCopyDoc}
                        style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                      >
                        {docCopied ? <Check size={12} color="#10b981" /> : <Copy size={12} />} {docCopied ? 'Copied!' : 'Copy Letter'}
                      </button>
                    </div>
                    <pre
                      style={{
                        background: 'rgba(0,0,0,0.45)',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#cbd5e1',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '140px',
                        overflowY: 'auto',
                        lineHeight: '1.4',
                        fontFamily: 'monospace',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {generatedDoc}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AI SETTINGS & PERSONA */}
          {activeTab === 'settings' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Gemini API Key Configuration */}
              <div className="ai-tool-card">
                <h5 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={16} /> Google Gemini Live API Key
                </h5>
                <p style={{ margin: '0 0 10px', fontSize: '11.5px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
                  Connect your Google Gemini API key to activate real-time LLM generative reasoning. If left blank, the built-in DCPE Autonomous Institutional Knowledge Engine will handle all queries.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Enter AIzaSy... Gemini API Key"
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleSaveApiKey}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      color: '#fff',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Save Key
                  </button>
                </div>
                {apiKeySaved && (
                  <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> Gemini API key updated successfully!
                  </div>
                )}
              </div>

              {/* Persona Selector */}
              <div className="ai-tool-card">
                <h5 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 800, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bot size={16} /> AI Persona & Response Style
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {[
                    { id: 'tutor', label: '🎓 Academic Tutor', desc: 'Focuses on structured syllabus explanations, math formulas, and clean code examples.' },
                    { id: 'advisor', label: '📋 HOD Strict Academic Advisor', desc: 'Emphasizes 75% attendance rules, exam deadlines, and formal university compliance.' },
                    { id: 'career', label: '💼 Career & Placement Mentor', desc: 'Provides recruitment tips, ATS resume optimization, and salary negotiation insights.' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPersona(p.id);
                        savePersona(p.id);
                      }}
                      style={{
                        background: selectedPersona === p.id ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selectedPersona === p.id ? '#f43f5e' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '10px',
                        padding: '10px 12px',
                        color: '#fff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: selectedPersona === p.id ? '#f43f5e' : '#fff' }}>
                        {p.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
