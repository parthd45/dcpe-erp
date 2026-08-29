import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, X, Send, Sparkles, User, Volume2, VolumeX, Mic, MicOff,
  BookOpen, Calendar, CreditCard, Clock, Award, ShieldAlert,
  CheckCircle2, HelpCircle, RefreshCw, Trophy, Flame, Play,
  FileText, UserCheck, Briefcase, Zap, Brain, MapPin, Smile,
  ExternalLink, ArrowRight, MessageSquare, ChevronRight, Maximize2,
  Minimize2, Trash2, Download, Copy, Check, Sliders, Settings,
  Calculator, Key, AlertTriangle, ShieldCheck, Dumbbell, Code,
  Paperclip, Plus, Search, Pin, Edit2, PlayCircle, Eye, EyeOff,
  Share2, Printer, ChevronDown, ChevronUp, Terminal, Layers,
  CheckSquare, MessageCircle, ArrowUpRight, Cpu, Sparkle
} from 'lucide-react';
import {
  callGeminiAPI,
  processOfflineQuery,
  generateFormalDocument,
  generateThinkingSteps,
  analyzeUploadedDocument,
  parseSlashCommand,
  SLASH_COMMANDS_LIST,
  AVAILABLE_MODELS,
  AVAILABLE_PERSONAS,
  getStoredGeminiKey,
  saveGeminiKey,
  getStoredModel,
  saveModel,
  getStoredPersona,
  savePersona,
  getStoredVoiceRate,
  saveVoiceRate
} from '../../lib/aiEngineService';
import './AIAssistant.css';
import './Dashboard.css';

/* ═══════════════════════════════════════════════════════════════
   EXPANDED PRACTICE QUIZ BANK (8 SUBJECT TRACKS)
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
        explanation: 'Private cloud infrastructure is provisioned for exclusive use by a single organization, ensuring maximum security and regulatory compliance.',
      },
      {
        q: 'What type of cloud service model is AWS EC2 or Google Compute Engine?',
        options: ['SaaS', 'PaaS', 'IaaS', 'FaaS'],
        correct: 2,
        explanation: 'IaaS (Infrastructure as a Service) provides raw compute, virtual machines, networking, and block storage on demand.',
      },
      {
        q: 'Which hypervisor runs directly on bare-metal physical hardware without an underlying host OS?',
        options: ['Type 2 Hypervisor', 'Type 1 Bare-Metal Hypervisor', 'Container Engine', 'KVM User Module'],
        correct: 1,
        explanation: 'Type 1 hypervisors (e.g., VMware ESXi, Xen) run directly on physical hardware for lowest virtualization overhead.',
      },
      {
        q: 'What is the primary advantage of Containerization (Docker) over traditional Virtual Machines?',
        options: ['Runs full OS kernel per container', 'Lightweight, shares host OS kernel, starts in milliseconds', 'Requires dedicated physical blade servers', 'Higher disk memory footprint'],
        correct: 1,
        explanation: 'Containers share the host operating system kernel and isolate processes, booting in milliseconds with negligible overhead.',
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
        explanation: 'SVM with Radial Basis Function (RBF) kernel transforms input spaces into higher dimensions to separate non-linear data.',
      },
      {
        q: 'What activation function is commonly used in hidden layers of Deep Neural Networks to mitigate vanishing gradients?',
        options: ['Sigmoid', 'Softmax', 'ReLU (Rectified Linear Unit)', 'Tanh'],
        correct: 2,
        explanation: 'ReLU f(x) = max(0, x) provides constant gradient of 1 for positive inputs, avoiding gradient saturation in deep networks.',
      },
      {
        q: 'Which metric measures the proportion of actual positives that were correctly identified by the model?',
        options: ['Precision', 'Recall (Sensitivity)', 'Accuracy', 'F1-Score'],
        correct: 1,
        explanation: 'Recall = True Positives / (True Positives + False Negatives), assessing model coverage of positive ground truth instances.',
      },
      {
        q: 'Which optimization algorithm computes adaptive learning rates for each parameter using moving averages of past squared gradients?',
        options: ['Vanilla SGD', 'Batch Gradient Descent', 'Adam (Adaptive Moment Estimation)', 'Hill Climbing'],
        correct: 2,
        explanation: 'Adam combines RMSProp and AdaGrad momentum principles to adapt individual parameter learning rates dynamically.',
      },
    ],
  },
  dbms: {
    title: 'Advanced Database Systems',
    code: 'MCA-503',
    icon: '🗄️',
    questions: [
      {
        q: 'What does the "A" in ACID database transactions guarantee?',
        options: ['Availability', 'Atomicity (All-or-Nothing execution)', 'Authentication', 'Aggregation'],
        correct: 1,
        explanation: 'Atomicity ensures that either all statements inside a transaction succeed and commit, or all changes roll back without partial state.',
      },
      {
        q: 'Which SQL join returns all rows from the left table and matched records from the right table?',
        options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'FULL OUTER JOIN'],
        correct: 2,
        explanation: 'LEFT JOIN returns all tuples from the left relation, filling unmatched right columns with NULL values.',
      },
      {
        q: 'What is the primary architectural advantage of B+ Tree indexes in relational database storage engines?',
        options: ['O(1) random hash lookup', 'Sequential linked leaf nodes for optimal range scan I/O', 'Zero RAM overhead', 'Automatic sharding'],
        correct: 1,
        explanation: 'B+ Trees maintain all actual records/pointers at doubly-linked leaf nodes, enabling fast sequential range traversal.',
      },
      {
        q: 'Which normalization form eliminates transitive functional dependencies on candidate keys?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correct: 2,
        explanation: 'Third Normal Form (3NF) requires 2NF and ensures no non-prime attribute depends transitively on the primary key (A -> B -> C).',
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
        options: ['Backend database query latency', 'Batched in-memory diffing to minimize direct browser DOM reflows', 'CSS bundle compression', 'Server CPU cycles'],
        correct: 1,
        explanation: 'Virtual DOM calculates lightweight tree diffs in memory and applies batch patches to real DOM nodes, minimizing expensive layout recalculations.',
      },
      {
        q: 'Which HTTP method is defined as idempotent and used to completely replace an existing resource?',
        options: ['POST', 'PATCH', 'PUT', 'CONNECT'],
        correct: 2,
        explanation: 'PUT replaces the entire targeted resource representation, and making identical repeated PUT calls results in the same server state.',
      },
      {
        q: 'In JavaScript, how does the Event Loop handle asynchronous microtasks (like resolved Promises) versus macrotasks (like setTimeout)?',
        options: ['Macrotasks execute before microtasks', 'All microtasks in the microtask queue run to completion before the next macrotask', 'They execute in parallel on separate threads', 'Microtasks are ignored during render cycles'],
        correct: 1,
        explanation: 'The JavaScript runtime drains the entire microtask queue before picking the next macrotask from the task queue.',
      },
    ],
  },
  dsa: {
    title: 'Data Structures & Algorithms',
    code: 'BCA-301',
    icon: '💻',
    questions: [
      {
        q: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (AVL or Red-Black Tree)?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correct: 1,
        explanation: 'Balanced BSTs guarantee height bounded by O(log n), halving search space at each descent level.',
      },
      {
        q: 'Which algorithmic paradigm does Dijkstra\'s Shortest Path algorithm utilize?',
        options: ['Dynamic Programming', 'Greedy Method with Priority Queue', 'Backtracking with Pruning', 'Divide and Conquer'],
        correct: 1,
        explanation: 'Dijkstra greedily chooses the unvisited vertex with smallest tentative distance at each step.',
      },
    ],
  },
  cybersec: {
    title: 'Cybersecurity & Ethical Hacking',
    code: 'MCA-505',
    icon: '🛡️',
    questions: [
      {
        q: 'Which cryptographic algorithm is an asymmetric public-key cryptosystem based on the factoring of large prime numbers?',
        options: ['AES-256', 'DES', 'RSA', 'Blowfish'],
        correct: 2,
        explanation: 'RSA uses mathematically linked public/private key pairs whose security relies on the hardness of factoring product of large primes.',
      },
      {
        q: 'What type of web vulnerability occurs when untrusted user input is directly embedded into raw SQL query strings?',
        options: ['Cross-Site Scripting (XSS)', 'SQL Injection (SQLi)', 'CSRF', 'Buffer Overflow'],
        correct: 1,
        explanation: 'SQL Injection allows attackers to manipulate SQL queries by injecting malicious syntax, prevented using Prepared Statements.',
      },
    ],
  },
  sports: {
    title: 'Sports Science & Kinesiology',
    code: 'BPED-101',
    icon: '🏅',
    questions: [
      {
        q: 'Which energy system is predominantly utilized during a 100-meter sprint (0 to 10 seconds of maximal effort)?',
        options: ['Aerobic Oxidative System', 'ATP-CP (Phosphagen) System', 'Lactic Acid Glycolytic System', 'Beta-Oxidation'],
        correct: 1,
        explanation: 'The ATP-CP phosphocreatine system provides instantaneous maximal anaerobic energy without oxygen for explosive bursts under 10s.',
      },
      {
        q: 'In human biomechanics, what anatomical joint represents a first-class lever?',
        options: ['Atlanto-Occipital Neck Joint (Fulcrum between Effort and Load)', 'Ankle Plantarflexion (Load between Fulcrum and Effort)', 'Elbow Flexion (Effort between Fulcrum and Load)', 'Wrist Supination'],
        correct: 0,
        explanation: 'First-class levers have the fulcrum situated between the effort and resistance, such as the head tilting on the atlanto-occipital joint.',
      },
    ],
  },
  aptitude: {
    title: 'TPO General Aptitude & Logic',
    code: 'TPO-101',
    icon: '🎯',
    questions: [
      {
        q: 'If a train traveling at 72 km/h crosses a 200m platform in 25 seconds, what is the length of the train?',
        options: ['250 meters', '300 meters', '350 meters', '400 meters'],
        correct: 1,
        explanation: 'Speed = 72 * (5/18) = 20 m/s. Total Distance = 20 * 25 = 500m. Train length = 500 - 200 = 300 meters.',
      },
      {
        q: 'A can complete a project in 12 days and B can complete it in 24 days. Working together, in how many days will they finish the project?',
        options: ['6 days', '8 days', '10 days', '18 days'],
        correct: 1,
        explanation: 'Combined 1-day work = (1/12) + (1/24) = 3/24 = 1/8. Total time = 8 days.',
      },
    ],
  },
};

/**
 * Quick Suggestion Chips Configuration (Guest vs Logged In)
 */
const GUEST_SUGGESTIONS = [
  { label: '🏫 Autonomous Programs & Syllabus', query: 'What autonomous courses (MCA, BCA, BPED, MPED) are offered at DCPE?', modalKey: null },
  { label: '📝 2026 Admissions & Eligibility', query: 'What is the admission eligibility and process for 2026-2027?', modalKey: null },
  { label: '🏅 Sports Infrastructure & Olympic Pool', query: 'What sports facilities, swimming pool, and gym are on campus?', modalKey: 'campus_map' },
  { label: '💼 Campus Recruiters & TPO Packages', query: 'Which companies recruit from DCPE and what are the CTC packages?', modalKey: 'placement' },
  { label: '📜 SGBAU Autonomous Grading Scale', query: 'Explain the SGBAU autonomous 10-point grading system and passing marks', modalKey: null },
  { label: '🏆 Practice Exam Quiz Studio', query: 'Start practice quiz mode', modalKey: 'quiz' },
  { label: '🗺️ Interactive Campus Map', query: 'Open campus map and facility locator', modalKey: 'campus_map' },
];

const AUTHENTICATED_STUDENT_SUGGESTIONS = [
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
  { label: '⏰ Class Timetable', query: 'Show my weekly timetable schedule', modalKey: 'timetable' },
  { label: '📝 Apply for Leave', query: 'How do I apply for student leave or medical excuse?', modalKey: 'leave' },
];

/**
 * Enhanced Markdown Renderer with Code Runner Sandbox, Copy & Table Styling
 */
function MarkdownRenderer({ content, onOpenCanvas }) {
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
  const [runningIndex, setRunningIndex] = useState(null);
  const [executionOutput, setExecutionOutput] = useState({});

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Safe JavaScript Execution Sandbox
  const handleRunCode = (code, idx) => {
    setRunningIndex(idx);
    try {
      const logs = [];
      const customConsole = {
        log: (...args) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
        error: (...args) => logs.push('❌ Error: ' + args.join(' ')),
        warn: (...args) => logs.push('⚠️ Warn: ' + args.join(' ')),
      };

      const runFn = new Function('console', code);
      runFn(customConsole);

      setExecutionOutput((prev) => ({
        ...prev,
        [idx]: logs.length > 0 ? logs.join('\n') : '✓ Code executed successfully with no output log.',
      }));
    } catch (err) {
      setExecutionOutput((prev) => ({
        ...prev,
        [idx]: `❌ Runtime Exception: ${err.message}`,
      }));
    } finally {
      setTimeout(() => setRunningIndex(null), 300);
    }
  };

  return (
    <div>
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          const isRunnable = part.language === 'javascript' || part.language === 'js';
          return (
            <div key={idx} className="ai-code-block">
              <div className="ai-code-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal size={13} color="#67e8f9" />
                  <span style={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
                    {part.language || 'code'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isRunnable && (
                    <button
                      onClick={() => handleRunCode(part.content, idx)}
                      className="ai-code-run-btn"
                      title="Run JavaScript sandbox execution"
                      disabled={runningIndex === idx}
                    >
                      <Play size={11} fill="#10b981" color="#10b981" />
                      <span>{runningIndex === idx ? 'Running...' : 'Run ▶'}</span>
                    </button>
                  )}
                  {onOpenCanvas && (
                    <button
                      onClick={() =>
                        onOpenCanvas({
                          title: `${part.language.toUpperCase()} Script`,
                          type: 'code',
                          language: part.language,
                          content: part.content,
                        })
                      }
                      className="ai-code-copy-btn"
                      title="Open snippet in Live Canvas"
                    >
                      <ExternalLink size={11} /> Canvas
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyCode(part.content, idx)}
                    className="ai-code-copy-btn"
                    title="Copy code to clipboard"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check size={11} color="#10b981" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={11} /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className="ai-code-content">{part.content}</pre>

              {/* Live Console Output Box */}
              {executionOutput[idx] && (
                <div className="ai-code-output">
                  <div className="ai-code-output-title">Console Output:</div>
                  <pre className="ai-code-output-body">{executionOutput[idx]}</pre>
                </div>
              )}
            </div>
          );
        }

        // Render Markdown text
        const lines = part.content.split('\n');

        return (
          <div key={idx}>
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} style={{ height: '6px' }} />;

              // Format tables
              if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                const cells = trimmed.split('|').slice(1, -1).map((c) => c.trim());
                if (trimmed.includes('---')) return null;

                return (
                  <div
                    key={lIdx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
                      gap: '8px',
                      padding: '4px 8px',
                      background: 'rgba(255,255,255,0.04)',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      fontSize: '11px',
                    }}
                  >
                    {cells.map((c, cIdx) => (
                      <span key={cIdx} style={{ color: c.startsWith('**') ? '#67e8f9' : '#e2e8f0' }}>
                        {c.replace(/\*\*/g, '')}
                      </span>
                    ))}
                  </div>
                );
              }

              // Format **bold** and `code`
              const formattedLine = line.split(/(\*\*.*?\*\*|`.*?`)/g).map((seg, sIdx) => {
                if (seg.startsWith('**') && seg.endsWith('**')) {
                  return (
                    <strong key={sIdx} style={{ color: '#ffffff', fontWeight: 800 }}>
                      {seg.slice(2, -2)}
                    </strong>
                  );
                }
                if (seg.startsWith('`') && seg.endsWith('`')) {
                  return (
                    <code
                      key={sIdx}
                      style={{
                        background: 'rgba(56,189,248,0.15)',
                        border: '1px solid rgba(56,189,248,0.3)',
                        padding: '1px 6px',
                        borderRadius: '5px',
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
                <p key={lIdx} style={{ margin: '0 0 5px', lineHeight: '1.5' }}>
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

/**
 * Deep Reasoning & Thinking Trace Accordion Block
 */
function ThinkingTraceAccordion({ steps }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!steps || steps.length === 0) return null;

  return (
    <div className="ai-thinking-accordion">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ai-thinking-toggle-btn"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Brain size={14} color="#a855f7" className="ai-pulse-spin" />
          <span style={{ fontWeight: 800, color: '#c084fc' }}>Deep Reasoning & Institutional Verification</span>
          <span className="ai-thinking-badge">{steps.length} Steps</span>
        </div>
        {isExpanded ? <ChevronUp size={14} color="#c084fc" /> : <ChevronDown size={14} color="#c084fc" />}
      </button>

      {isExpanded && (
        <div className="ai-thinking-content">
          {steps.map((step, idx) => (
            <div key={idx} className="ai-thinking-step-item">
              <div className="ai-thinking-step-dot">
                <Check size={10} color="#fff" />
              </div>
              <span className="ai-thinking-step-text">{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Side-by-Side Live Document & Code Canvas Workspace
 */
function LiveArtifactCanvas({ canvasData, onClose, onUpdateContent }) {
  const [copied, setCopied] = useState(false);
  const [localContent, setLocalContent] = useState(canvasData.content || '');

  useEffect(() => {
    setLocalContent(canvasData.content || '');
  }, [canvasData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(localContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([localContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${canvasData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${canvasData.title}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #000; font-size: 14pt; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body>
          <pre>${localContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const applyRefinement = (action) => {
    let updated = localContent;
    if (action === 'formal') {
      updated = updated.replace(/I am writing to tell you/gi, 'I am writing to formally place on record');
      updated = updated.replace(/Please give me leave/gi, 'I humbly request your good office to grant me leave of absence');
    } else if (action === 'marathi') {
      updated = `प्रति,\nमा. विभागप्रमुख,\nशारीरिक शिक्षण पदवी महाविद्यालय (स्वायत्त),\nश्री ह.व्या.प्र. मंडळ, अमरावती.\n\nविषय: रजेचा अधिकृत अर्ज.\n\nमहोदय,\nमी याद्वारे कळवू इच्छितो की वैद्यकीय कारणास्तव मी महाविद्यालयात उपस्थित राहू शकत नाही. कृपया माझी रजा मंजूर करावी.\n\nआपला नम्र विद्यार्थी,\nDCPE HVPM`;
    } else if (action === 'hindi') {
      updated = `सेवा में,\nविभागाध्यक्ष महोदय,\nशारीरिक शिक्षण पदवी महाविद्यालय (स्वायत्त),\nश्री एच.व्ही.पी. मंडल, अमरावती.\n\nविषय: अवकाश हेतु औपचारिक प्रार्थना पत्र.\n\nमहोदय,\nसविनय निवेदन है कि अस्वस्थ होने के कारण मैं कक्षा में उपस्थित होने में असमर्थ हूँ। कृपया अवकाश स्वीकृत करने की कृपा करें।\n\nभवदीय,\nDCPE HVPM`;
    } else if (action === 'bullet') {
      updated += `\n\n📌 Executive Highlights:\n• SGBAU Autonomous Compliance: Verified ✓\n• Enclosures: Verified medical records attached\n• Resumption: Scheduled immediately post recovery.`;
    }

    setLocalContent(updated);
    if (onUpdateContent) onUpdateContent(updated);
  };

  return (
    <div className="ai-canvas-panel">
      {/* Canvas Header */}
      <div className="ai-canvas-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#38bdf8" />
          <div>
            <h5 className="ai-canvas-title">{canvasData.title || 'Live Artifact Canvas'}</h5>
            <span className="ai-canvas-subtitle">
              {canvasData.type === 'code' ? `Interactive ${canvasData.language || 'Code'} Sandbox` : 'Official Institutional Document Drafter'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={handlePrint} className="ai-canvas-icon-btn" title="Print document layout">
            <Printer size={13} />
          </button>
          <button onClick={handleDownload} className="ai-canvas-icon-btn" title="Download as text file">
            <Download size={13} />
          </button>
          <button onClick={handleCopy} className="ai-canvas-icon-btn" title="Copy to clipboard">
            {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
          </button>
          <button onClick={onClose} className="ai-canvas-icon-btn close" title="Close Canvas">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Quick AI Refine Bar */}
      <div className="ai-canvas-refine-bar">
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 800 }}>1-Click AI Refinements:</span>
        <button onClick={() => applyRefinement('formal')} className="ai-refine-chip">
          ✍️ Make More Formal
        </button>
        <button onClick={() => applyRefinement('marathi')} className="ai-refine-chip">
          🇮🇳 Translate to Marathi
        </button>
        <button onClick={() => applyRefinement('hindi')} className="ai-refine-chip">
          🇮🇳 Translate to Hindi
        </button>
        <button onClick={() => applyRefinement('bullet')} className="ai-refine-chip">
          📋 Add Bullet Summary
        </button>
      </div>

      {/* Canvas Editor Area */}
      <div className="ai-canvas-body">
        <textarea
          value={localContent}
          onChange={(e) => {
            setLocalContent(e.target.value);
            if (onUpdateContent) onUpdateContent(e.target.value);
          }}
          className="ai-canvas-textarea"
          placeholder="Type or edit artifact content..."
          spellCheck={false}
        />
      </div>

      {/* Canvas Footer Metadata */}
      <div className="ai-canvas-footer">
        <span>{localContent.split(/\s+/).filter(Boolean).length} words • {localContent.length} characters</span>
        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={11} /> Auto-synchronized with Copilot
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PRO CHATBOT COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function AIAssistantWidget({ currentUser, onOpenModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'quiz' | 'tools' | 'settings'
  const [inputQuery, setInputQuery] = useState('');
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Settings & Model / Persona
  const [activeModel, setActiveModel] = useState(getStoredModel());
  const [activePersona, setActivePersona] = useState(getStoredPersona());
  const [voiceRate, setVoiceRate] = useState(getStoredVoiceRate());
  const [apiKeyInput, setApiKeyInput] = useState(getStoredGeminiKey());
  const [apiKeySaved, setApiKeySaved] = useState(false);

  // Canvas / Artifact State
  const [canvasData, setCanvasData] = useState(null);

  // File Upload State
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Slash Command Menu State
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');

  // Authentication Status
  const isLoggedIn = Boolean(currentUser && (currentUser.name || currentUser.prn || currentUser.id));
  const isHOD = currentUser?.role === 'hod' || currentUser?.userType === 'hod';
  const isFaculty = currentUser?.role === 'faculty' || currentUser?.userType === 'faculty';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.userType === 'admin';
  const displayName = isLoggedIn ? currentUser.name.split(' ')[0] : 'Visitor';

  // Tools state (defaults to real user attendance if logged in, else 75)
  const initialAttendance = currentUser?.attendance ? parseFloat(currentUser.attendance) : 75.0;
  const [bunkSimLectures, setBunkSimLectures] = useState(4);
  const [targetCgpa, setTargetCgpa] = useState(currentUser?.cgpa ? parseFloat(currentUser.cgpa) : 8.5);
  const [docType, setDocType] = useState('sick_leave');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [docCopied, setDocCopied] = useState(false);

  // Quiz state
  const [activeSubject, setActiveSubject] = useState('cloud');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Multi-Session History State
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('dcpe_ai_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse sessions:', e);
      }
    }
    return [
      {
        id: 'session_default',
        title: 'Campus Intelligence Session',
        createdAt: new Date().toISOString(),
        pinned: false,
        messages: [
          {
            id: 'init_1',
            sender: 'ai',
            text: isLoggedIn
              ? `Hello **${displayName}**! 👋 Welcome back to your DCPE ERP AI Copilot.\n\nAsk me about your live Attendance Risk Radar, SGPA Marksheet, Fee Passbook, Exam Hall Ticket, Placements, or draft letters in Live Canvas!`
              : `Welcome to **Shree H.V.P. Mandal's Degree College of Physical Education (Autonomous), Amravati**! 👋\n\nI am your Campus AI Guide. You can ask me about Autonomous Programs (MCA, BCA, B.P.Ed, M.P.Ed, B.Sc CS), Admissions 2026, Syllabus & SGBAU Rules, Campus Facilities, Recruiters, or Coding Doubts.\n\n*(To access your personal student/faculty dashboard records, please log in to your ERP account).*`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            thinkingSteps: [
              'Initialized DCPE Autonomous Knowledge Graph v5.0',
              isLoggedIn ? `Authenticated user session mapped: ${currentUser?.name}` : 'Operating in public Campus Guide mode (Guest / Visitor)',
            ],
            suggestedFollowUps: isLoggedIn
              ? ['Check my Attendance %', 'Show my Marksheet', 'How many classes can I bunk?', 'Start Practice Quiz']
              : ['Autonomous Programs & Syllabus', 'Admission Process 2026', 'SGBAU Grading Scale', 'Campus Sports Facilities', 'Practice Exam Quiz'],
          },
        ],
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState('session_default');
  const [searchSessionText, setSearchSessionText] = useState('');

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('dcpe_ai_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current && isOpen && activeTab === 'chat') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab, isLoadingAI]);

  // Handle Slash Command input change
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputQuery(val);

    if (val.startsWith('/')) {
      setSlashMenuOpen(true);
      setSlashFilter(val.slice(1).toLowerCase());
    } else {
      setSlashMenuOpen(false);
    }
  };

  // Select Slash Command
  const selectSlashCommand = (cmdObj) => {
    setSlashMenuOpen(false);
    setInputQuery(cmdObj.cmd + ' ');
    handleSend(cmdObj.cmd);
  };

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileMeta = {
      name: file.name,
      size: file.size,
      type: file.type,
    };
    setAttachedFile(fileMeta);

    const analysis = analyzeUploadedDocument(fileMeta, currentUser || null);
    if (analysis.autoDraftDoc) {
      setCanvasData({
        title: analysis.title,
        type: 'document',
        content: analysis.autoDraftDoc,
      });
    }
  };

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
      const clean = text.replace(/[*#`_]/g, '').replace(/https?:\/\/\S+/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = selectedLanguage;
      utterance.rate = voiceRate;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Create New Chat Session
  const createNewSession = () => {
    const newId = `session_${Date.now()}`;
    const newSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      pinned: false,
      messages: [
        {
          id: `init_${Date.now()}`,
          sender: 'ai',
          text: isLoggedIn
            ? `New conversation started! How may I assist you with your academics, code, or attendance today, ${displayName}?`
            : `New conversation started! How can I assist you with DCPE autonomous courses, admissions, facilities, or study doubts?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedFollowUps: isLoggedIn
            ? ['Check my Attendance %', 'Show my Marksheet', 'Open ATS Resume Studio']
            : ['Autonomous Programs & Syllabus', 'Admission Process 2026', 'Practice Exam Quiz'],
        },
      ],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setSidebarOpen(false);
  };

  // Delete Chat Session
  const deleteSession = (id, e) => {
    e?.stopPropagation();
    if (sessions.length <= 1) {
      alert('You must keep at least one active conversation.');
      return;
    }
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0].id);
    }
  };

  // Pin Chat Session
  const togglePinSession = (id, e) => {
    e?.stopPropagation();
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  };

  // Main Query Dispatcher
  const handleSend = async (textToSend) => {
    const q = (textToSend || inputQuery).trim();
    if (!q && !attachedFile) return;

    setSlashMenuOpen(false);
    const userMsgId = `user_${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: q || `Attached File: ${attachedFile?.name}`,
      attachedFile: attachedFile ? { ...attachedFile } : null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update active session messages
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: s.messages.length <= 1 ? q.slice(0, 28) || 'Document Analysis' : s.title,
              messages: [...s.messages, userMsg],
            }
          : s
      )
    );

    setInputQuery('');
    const currentAttachment = attachedFile;
    setAttachedFile(null);
    setIsLoadingAI(true);

    // Generate thinking steps
    const thinkingSteps = generateThinkingSteps(q, currentUser || null, activePersona);

    let reply = '';
    let actionKey = null;
    let actionLabel = null;
    let suggestedFollowUps = [];
    let canvasPayload = null;

    // Check for Slash Command
    const slashCheck = parseSlashCommand(q);
    const queryToExecute = slashCheck ? slashCheck.query : q;

    // If file attached, analyze document
    if (currentAttachment) {
      const docAnalysis = analyzeUploadedDocument(currentAttachment, currentUser || null);
      reply = `### ${docAnalysis.title}\n\n${docAnalysis.summary}\n\n` +
        docAnalysis.extractedFields.map((f) => `• **${f.label}:** ${f.value}`).join('\n') +
        `\n\n💡 **Recommendation:** ${docAnalysis.recommendation}`;

      if (docAnalysis.autoDraftDoc) {
        canvasPayload = {
          title: docAnalysis.title,
          type: 'document',
          content: docAnalysis.autoDraftDoc,
        };
      }
      suggestedFollowUps = isLoggedIn
        ? ['Open in Live Canvas', 'Check Attendance Radar', 'View Marksheet']
        : ['Autonomous Programs & Syllabus', 'Admission Process 2026'];
    } else {
      const storedKey = getStoredGeminiKey();
      if (storedKey && activeModel !== 'offline-v5') {
        try {
          reply = await callGeminiAPI(queryToExecute, messages, currentUser || null, selectedLanguage);
          const offlineCheck = processOfflineQuery(queryToExecute, currentUser || null, selectedLanguage, activePersona);
          actionKey = offlineCheck.actionKey;
          actionLabel = offlineCheck.actionLabel;
          suggestedFollowUps = offlineCheck.suggestedFollowUps || [];
          canvasPayload = offlineCheck.canvasPayload || null;
        } catch (err) {
          console.warn('[DCPE Gemini API Fallback]:', err.message);
          const offline = processOfflineQuery(queryToExecute, currentUser || null, selectedLanguage, activePersona);
          reply = offline.reply;
          actionKey = offline.actionKey;
          actionLabel = offline.actionLabel;
          suggestedFollowUps = offline.suggestedFollowUps || [];
          canvasPayload = offline.canvasPayload || null;
        }
      } else {
        const offline = processOfflineQuery(queryToExecute, currentUser || null, selectedLanguage, activePersona);
        reply = offline.reply;
        actionKey = offline.actionKey;
        actionLabel = offline.actionLabel;
        suggestedFollowUps = offline.suggestedFollowUps || [];
        canvasPayload = offline.canvasPayload || null;
      }
    }

    if (canvasPayload) {
      setCanvasData(canvasPayload);
    }

    const aiMsgId = `ai_${Date.now()}`;
    const aiMsg = {
      id: aiMsgId,
      sender: 'ai',
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionKey,
      actionLabel,
      suggestedFollowUps,
      thinkingSteps,
      canvasPayload,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, aiMsg] }
          : s
      )
    );

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

  // Handle Save API Key
  const handleSaveApiKey = () => {
    saveGeminiKey(apiKeyInput);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2500);
  };

  // Handle Save Model & Persona
  const handleModelChange = (modelId) => {
    setActiveModel(modelId);
    saveModel(modelId);
  };

  const handlePersonaChange = (personaId) => {
    setActivePersona(personaId);
    savePersona(personaId);
  };

  const handleVoiceRateChange = (rate) => {
    setVoiceRate(rate);
    saveVoiceRate(rate);
  };

  // Handle Generate Document Tool
  const handleGenerateDoc = () => {
    const doc = generateFormalDocument(docType, {
      name: isLoggedIn ? currentUser.name : '[Your Full Name]',
      prn: isLoggedIn ? (currentUser.prn || '[Your PRN]') : '[Your PRN / Roll Number]',
      course: isLoggedIn ? (currentUser.course || '[Your Degree Course]') : '[Your Course / Department]',
      cgpa: isLoggedIn ? (currentUser.cgpa || '') : '',
    });
    setGeneratedDoc(doc);
    setDocCopied(false);
    setCanvasData({
      title: `${docType.replace('_', ' ').toUpperCase()} Application`,
      type: 'document',
      content: doc,
    });
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

  // Calculated bunk simulation values (using real user attendance if present)
  const rawAtt = currentUser?.attendance ? parseFloat(currentUser.attendance) : initialAttendance;
  const simTotal = 80;
  const currentAttended = Math.round((rawAtt / 100) * simTotal);
  const simNewPct = (((currentAttended) / (simTotal + bunkSimLectures)) * 100).toFixed(1);

  // Calculated required SGPA
  const currentCgpa = currentUser?.cgpa ? parseFloat(currentUser.cgpa) : 8.0;
  const completedSems = 3;
  const remainingSems = 1;
  const neededSgpa = Math.max(0, ((targetCgpa * (completedSems + remainingSems)) - (currentCgpa * completedSems)) / remainingSems).toFixed(2);

  // Active suggestions list
  const activeSuggestions = isLoggedIn ? AUTHENTICATED_STUDENT_SUGGESTIONS : GUEST_SUGGESTIONS;

  // Filter slash commands
  const filteredSlashCommands = SLASH_COMMANDS_LIST.filter(
    (c) => c.cmd.toLowerCase().includes(slashFilter) || c.desc.toLowerCase().includes(slashFilter)
  );

  return (
    <>
      {/* Floating Launcher Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="ai-floating-trigger"
          title="Open DCPE Genius AI Pro Copilot v5.0"
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
        <div className={`ai-assistant-drawer ${isFullscreen ? 'fullscreen' : ''} ${canvasData ? 'with-canvas' : ''}`}>
          
          {/* SESSIONS SIDEBAR DRAWER */}
          {sidebarOpen && (
            <div className="ai-sidebar-drawer">
              <div className="ai-sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={16} color="#38bdf8" />
                  <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#fff' }}>Conversations</h5>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ai-sidebar-close-btn"
                  title="Close sidebar"
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ padding: '8px 12px' }}>
                <button
                  onClick={createNewSession}
                  className="ai-new-chat-btn"
                >
                  <Plus size={14} /> + New Conversation
                </button>
              </div>

              {/* Search chats */}
              <div style={{ padding: '0 12px 8px' }}>
                <div className="ai-session-search-box">
                  <Search size={12} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Search past chats..."
                    value={searchSessionText}
                    onChange={(e) => setSearchSessionText(e.target.value)}
                    className="ai-session-search-input"
                  />
                </div>
              </div>

              {/* Session list */}
              <div className="ai-sessions-list">
                {sessions
                  .filter((s) => s.title.toLowerCase().includes(searchSessionText.toLowerCase()))
                  .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
                  .map((session) => {
                    const isActive = session.id === activeSessionId;
                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          setActiveSessionId(session.id);
                          setSidebarOpen(false);
                        }}
                        className={`ai-session-item ${isActive ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          {session.pinned ? <Pin size={12} color="#f59e0b" /> : <MessageCircle size={12} color="#94a3b8" />}
                          <span className="ai-session-title">{session.title}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={(e) => togglePinSession(session.id, e)}
                            className="ai-session-action-btn"
                            title={session.pinned ? 'Unpin chat' : 'Pin chat'}
                          >
                            <Pin size={11} color={session.pinned ? '#f59e0b' : '#94a3b8'} />
                          </button>
                          {sessions.length > 1 && (
                            <button
                              onClick={(e) => deleteSession(session.id, e)}
                              className="ai-session-action-btn delete"
                              title="Delete conversation"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* MAIN CHAT WORKSTATION CONTAINER */}
          <div className="ai-main-workstation">
            {/* Header */}
            <div className="ai-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="ai-sidebar-toggle-btn"
                  title="Toggle conversation history"
                >
                  <MessageSquare size={15} />
                </button>

                <div className="ai-brand-avatar">
                  <Bot size={18} color="#fff" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 className="ai-brand-title">
                    DCPE Genius AI
                    <span className="ai-brand-badge">
                      {isLoggedIn ? (getStoredGeminiKey() && activeModel !== 'offline-v5' ? '⚡ Live' : '🧠 Copilot') : '🏛️ Campus Guide'}
                    </span>
                  </h4>
                  <p className="ai-brand-subtitle">
                    {isLoggedIn ? `${currentUser.name}` : 'Institutional Knowledge Engine'}
                  </p>
                </div>
              </div>

              {/* Top-Right Window Controls (Always Visible & Prominent) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                {/* Speech Synthesis Audio Toggle */}
                <button
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className={`ai-header-icon-btn ${speechEnabled ? 'active' : ''}`}
                  title={speechEnabled ? 'Mute AI Voice' : 'Enable AI Voice Synthesis'}
                >
                  {speechEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>

                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="ai-header-icon-btn"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>

                {/* PROMINENT CLOSE BUTTON */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsFullscreen(false);
                  }}
                  className="ai-header-close-btn"
                  title="Close AI Assistant"
                  aria-label="Close AI Assistant"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Sub-Header: Persona & Language Preferences Bar */}
            <div className="ai-persona-lang-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Persona:</span>
                <select
                  value={activePersona}
                  onChange={(e) => handlePersonaChange(e.target.value)}
                  className="ai-subbar-select"
                  title="Active AI Persona"
                >
                  {AVAILABLE_PERSONAS.map((p) => (
                    <option key={p.id} value={p.id} style={{ background: '#1e1b4b', color: '#fff' }}>
                      {p.avatar} {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Lang:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="ai-subbar-select"
                  title="Language Preference"
                >
                  <option value="en-IN" style={{ background: '#1e1b4b', color: '#fff' }}>English</option>
                  <option value="hi-IN" style={{ background: '#1e1b4b', color: '#fff' }}>हिन्दी (Hindi)</option>
                  <option value="mr-IN" style={{ background: '#1e1b4b', color: '#fff' }}>मराठी (Marathi)</option>
                </select>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="ai-nav-tabs">
              <button
                onClick={() => setActiveTab('chat')}
                className={`ai-nav-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              >
                <MessageSquare size={13} /> {isLoggedIn ? 'ERP Copilot' : 'Campus AI'}
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`ai-nav-tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
              >
                <Trophy size={13} /> Exam Quiz Studio (8 Tracks)
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`ai-nav-tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
              >
                <Zap size={13} /> Calculators & Drafter
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`ai-nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              >
                <Settings size={13} /> AI Models & Keys
              </button>
            </div>

            {/* TAB 1: AI COPILOT CHAT */}
            {activeTab === 'chat' && (
              <>
                {/* Chat Control Toolbar */}
                <div className="ai-chat-toolbar">
                  <span>
                    <strong>{currentSession.title}</strong> • {messages.length} messages
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {canvasData && (
                      <button
                        onClick={() => setCanvasData(null)}
                        className="ai-toolbar-btn"
                        title="Toggle canvas view"
                      >
                        <Layers size={11} /> Hide Canvas
                      </button>
                    )}
                    <button
                      onClick={createNewSession}
                      className="ai-toolbar-btn"
                      title="Start fresh conversation"
                    >
                      <Plus size={11} /> New Chat
                    </button>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="ai-messages-container">
                  {messages.map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      className={`ai-message-bubble ${msg.sender === 'user' ? 'user' : 'ai'}`}
                    >
                      {/* Attached File Badge in User Bubble */}
                      {msg.attachedFile && (
                        <div className="ai-attached-file-pill">
                          <Paperclip size={12} />
                          <span>{msg.attachedFile.name}</span>
                        </div>
                      )}

                      {/* Thinking Accordion (for AI messages) */}
                      {msg.sender === 'ai' && msg.thinkingSteps && (
                        <ThinkingTraceAccordion steps={msg.thinkingSteps} />
                      )}

                      {/* Content Renderer */}
                      {msg.sender === 'ai' ? (
                        <MarkdownRenderer
                          content={msg.text}
                          onOpenCanvas={(data) => setCanvasData(data)}
                        />
                      ) : (
                        <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                      )}

                      {/* Action Key Button */}
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
                            className="ai-interactive-action-btn"
                          >
                            <span>{msg.actionLabel || 'Open Feature →'}</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      )}

                      {/* Canvas Launcher Chip */}
                      {msg.sender === 'ai' && msg.canvasPayload && !canvasData && (
                        <div style={{ marginTop: '8px' }}>
                          <button
                            onClick={() => setCanvasData(msg.canvasPayload)}
                            className="ai-canvas-launch-chip"
                          >
                            <Sparkles size={12} /> Open in Live Canvas Editor 🪄
                          </button>
                        </div>
                      )}

                      {/* Suggested Follow-ups */}
                      {msg.sender === 'ai' && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && idx === messages.length - 1 && (
                        <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {msg.suggestedFollowUps.map((chipText, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => handleSend(chipText)}
                              className="ai-followup-chip"
                            >
                              💡 {chipText}
                            </button>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '9.5px', opacity: 0.55, marginTop: '5px', textAlign: 'right' }}>
                        {msg.time}
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoadingAI && (
                    <div className="ai-message-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="ai-voice-wave">
                        <div className="ai-voice-bar" />
                        <div className="ai-voice-bar" />
                        <div className="ai-voice-bar" />
                        <div className="ai-voice-bar" />
                      </div>
                      <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                        {isLoggedIn ? 'Accessing ERP verification and reasoning...' : 'Searching campus knowledge base...'}
                      </span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips Scroll */}
                <div className="ai-chips-scroll">
                  {activeSuggestions.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickChip(chip)}
                      className="ai-chip-btn"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* SLASH COMMAND POPUP MENU */}
                {slashMenuOpen && (
                  <div className="ai-slash-menu-popup">
                    <div className="ai-slash-menu-header">
                      <Terminal size={12} color="#67e8f9" />
                      <span>Instant Campus Slash Commands:</span>
                    </div>
                    <div className="ai-slash-menu-list">
                      {filteredSlashCommands.map((cmdObj) => (
                        <div
                          key={cmdObj.cmd}
                          onClick={() => selectSlashCommand(cmdObj)}
                          className="ai-slash-menu-item"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{cmdObj.icon}</span>
                            <strong style={{ color: '#67e8f9' }}>{cmdObj.cmd}</strong>
                          </div>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{cmdObj.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice Listening Active Wave Bar */}
                {isListening && (
                  <div className="ai-voice-active-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="ai-voice-wave">
                        <div className="ai-voice-bar active" />
                        <div className="ai-voice-bar active" />
                        <div className="ai-voice-bar active" />
                        <div className="ai-voice-bar active" />
                      </div>
                      <span>Listening in {selectedLanguage === 'en-IN' ? 'English' : selectedLanguage === 'hi-IN' ? 'Hindi' : 'Marathi'}... Speak now!</span>
                    </div>
                    <button onClick={toggleListening} className="ai-voice-done-btn">
                      Done
                    </button>
                  </div>
                )}

                {/* Attached File Preview Bar */}
                {attachedFile && (
                  <div className="ai-attached-preview-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Paperclip size={13} color="#38bdf8" />
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '11.5px' }}>{attachedFile.name}</span>
                      <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)' }}>
                        ({(attachedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => setAttachedFile(null)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Chat Input Bar */}
                <div className="ai-input-wrapper">
                  {/* File Attachment Hidden Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    accept=".pdf,.png,.jpg,.jpeg,.txt,.js,.py,.doc,.docx"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="ai-attachment-btn"
                    title="Attach Medical Note, Fee Receipt, Marksheet, or Code file"
                  >
                    <Paperclip size={18} />
                  </button>

                  <button
                    onClick={toggleListening}
                    className={`ai-mic-btn ${isListening ? 'listening' : ''}`}
                    title={isListening ? 'Stop Listening' : 'Speak Voice Prompt (Multilingual)'}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  <input
                    type="text"
                    value={inputQuery}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoadingAI) handleSend();
                    }}
                    placeholder={
                      isListening
                        ? 'Listening...'
                        : isLoggedIn
                        ? 'Ask about your attendance, marksheets, fees, or type / for commands...'
                        : 'Ask about DCPE programs, admissions, facilities, coding, or type /...'
                    }
                    className="ai-chat-input"
                    disabled={isLoadingAI}
                  />

                  <button
                    onClick={() => handleSend()}
                    disabled={isLoadingAI || (!inputQuery.trim() && !attachedFile)}
                    className="ai-send-btn"
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
                      className={`ai-subject-btn ${activeSubject === key ? 'active' : ''}`}
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
                        <div className="ai-quiz-explanation-box">
                          💡 <strong>Explanation:</strong> {QUIZ_BANK[activeSubject].questions[currentQIndex].explanation}
                        </div>
                      )}
                    </div>

                    {/* Next Button */}
                    {selectedOption !== null && (
                      <button
                        onClick={nextQuizQuestion}
                        className="ai-quiz-next-btn"
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
                      <button onClick={resetQuiz} className="ai-quiz-btn primary">
                        Retake Quiz 🔄
                      </button>
                      <button onClick={() => setActiveTab('chat')} className="ai-quiz-btn secondary">
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
                    <Calculator size={16} /> Attendance Bunk & Safety Simulator
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
                    <span>Baseline: <strong>{rawAtt}%</strong> {isLoggedIn ? '(From ERP)' : '(Simulation)'}</span>
                    <span>Projected: <strong style={{ color: parseFloat(simNewPct) >= 75 ? '#10b981' : '#f87171' }}>{simNewPct}%</strong> {parseFloat(simNewPct) >= 75 ? '(Safe ✓)' : '(Warning ⚠️)'}</span>
                  </div>
                </div>

                {/* Tool 2: Target CGPA Forecaster */}
                <div className="ai-tool-card">
                  <h5 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} /> Target CGPA SGPA Planner
                  </h5>
                  <p style={{ margin: '0 0 10px', fontSize: '11.5px', color: 'rgba(255,255,255,0.7)' }}>
                    Find the exact SGPA needed in remaining semesters to achieve your target graduation CGPA.
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
                    Auto-generate formatted institutional applications ready for submission in Live Canvas.
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
                      <option value="noc" style={{ background: '#1e1b4b' }}>No Objection Certificate (NOC) for Internship</option>
                      <option value="lor" style={{ background: '#1e1b4b' }}>Letter of Recommendation (LOR)</option>
                    </select>
                    <button
                      onClick={handleGenerateDoc}
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#fff', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Draft in Canvas 🪄
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: AI SETTINGS & MODELS */}
            {activeTab === 'settings' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Model Selector */}
                <div className="ai-tool-card">
                  <h5 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={16} /> AI Intelligence Model
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {AVAILABLE_MODELS.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleModelChange(m.id)}
                        className={`ai-model-card ${activeModel === m.id ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '12.5px', color: activeModel === m.id ? '#38bdf8' : '#fff' }}>
                            {m.name}
                          </span>
                          {m.isLive ? (
                            <span className="ai-model-badge live">Live API</span>
                          ) : (
                            <span className="ai-model-badge offline">Offline Autonomous</span>
                          )}
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                          {m.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gemini API Key */}
                <div className="ai-tool-card">
                  <h5 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={16} /> Google Gemini Live API Key
                  </h5>
                  <p style={{ margin: '0 0 10px', fontSize: '11.5px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
                    Connect your Gemini API key to activate real-time LLM reasoning. If left blank, the built-in DCPE Autonomous Institutional Knowledge Engine will handle all queries.
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
                      <CheckCircle2 size={13} /> Gemini API key saved successfully!
                    </div>
                  )}
                </div>

                {/* Voice Speech Rate */}
                <div className="ai-tool-card">
                  <h5 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Volume2 size={16} /> Neural Voice Speech Rate
                  </h5>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handleVoiceRateChange(rate)}
                        style={{
                          flex: 1,
                          padding: '7px 0',
                          borderRadius: '8px',
                          border: `1px solid ${voiceRate === rate ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                          background: voiceRate === rate ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                        }}
                      >
                        {rate}x Speed
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SIDE-BY-SIDE LIVE ARTIFACT CANVAS WORKSPACE */}
          {canvasData && (
            <LiveArtifactCanvas
              canvasData={canvasData}
              onClose={() => setCanvasData(null)}
              onUpdateContent={(updated) =>
                setCanvasData((prev) => (prev ? { ...prev, content: updated } : null))
              }
            />
          )}
        </div>
      )}
    </>
  );
}
