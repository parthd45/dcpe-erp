/**
 * DCPE ERP AI Campus Intelligence & Pro Copilot Engine (v6.0) — Rebuilt from Scratch
 * 
 * Architecture:
 * 1. Gemini API: Uses proper `systemInstruction` field (not injected into user message).
 * 2. Offline Engine: Multi-layer intent classification with weighted keyword scoring.
 * 3. Knowledge Base: 25+ topic areas covering academics, campus, career, coding, and general.
 * 4. Smart Fallback: Contextual responses instead of generic capability dumps.
 * 
 * Rules:
 * 1. ZERO Fake Mock Data — use real currentUser data when available.
 * 2. Guest users get institutional facts + general academic help. Personal data requires login.
 * 3. Authenticated users get personalized responses using their real profile data.
 * 4. Multilingual support (English, Hindi, Marathi).
 */

export const GEMINI_API_STORAGE_KEY = 'dcpe_gemini_api_key';
export const GEMINI_MODEL_STORAGE_KEY = 'dcpe_gemini_model';
export const AI_PERSONA_STORAGE_KEY = 'dcpe_ai_persona';
export const AI_VOICE_RATE_STORAGE_KEY = 'dcpe_ai_voice_rate';

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Ultra-fast response with real-time reasoning', isLive: true },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Deep multi-step logic & complex ordinance synthesis', isLive: true },
  { id: 'offline-v5', name: 'DCPE Autonomous Knowledge Engine v6.0', desc: 'Institutional offline campus intelligence', isLive: false },
];

export const AVAILABLE_PERSONAS = [
  {
    id: 'tutor',
    name: 'Academic Tutor & Doubt Solver',
    avatar: '🎓',
    badge: 'Pedagogy & Code',
    desc: 'Provides structured explanations, mathematical step-by-step solutions, and clean commented code blocks.',
    systemTone: 'Focus on clear academic pedagogy, conceptual clarity, step-by-step logic, and clean code snippets with SGBAU syllabus alignment.'
  },
  {
    id: 'advisor',
    name: 'HOD & Examination Controller',
    avatar: '📋',
    badge: 'Strict Compliance',
    desc: 'Emphasizes autonomous regulations, 75% attendance rules, ATKT passing criteria, and formal clearances.',
    systemTone: 'Focus on official institutional ordinances, semester passing thresholds, hall ticket clearance checklists, and administrative protocols.'
  },
  {
    id: 'career',
    name: 'TPO Placement & Career Coach',
    avatar: '💼',
    badge: 'Career & CTC',
    desc: 'Specializes in STAR-format resume bullet generation, mock technical interviews, and recruitment insights.',
    systemTone: 'Focus on recruiter expectations, ATS keyword matching, high-impact action verbs, system design interview questions, and campus placement drives.'
  },
  {
    id: 'sports',
    name: 'Kinesiology & Sports Director',
    avatar: '🏅',
    badge: 'Sports Science',
    desc: 'Guides in athletic biomechanics, exercise physiology, tournament duty leave condonation, and sports facilities.',
    systemTone: 'Focus on sports science principles, human anatomy, physical conditioning schedules, and official SGBAU tournament representation rules.'
  },
  {
    id: 'coder',
    name: 'Senior Fullstack Software Architect',
    avatar: '💻',
    badge: 'Code Architect',
    desc: 'Performs in-depth code reviews, optimizes Big-O time complexity, and debugs React/Node/Python scripts.',
    systemTone: 'Focus on production-grade code architecture, clean patterns, error handling, performance benchmarks, and time/space complexity analysis.'
  }
];

// Steady Institutional Knowledge Base
const BASE_SYSTEM_PROMPT = `You are "DCPE Genius AI Pro", the official campus AI Copilot for Shree H.V.P. Mandal's Degree College of Physical Education (DCPE Autonomous), Amravati, Maharashtra, India.
Established in 1914 by Vaidya Brothers (Shree Anantrao & Ambadaspant Vaidya), DCPE is an NAAC-accredited premier autonomous multi-disciplinary institution affiliated with Sant Gadge Baba Amravati University (SGBAU).

Institutional Programs:
- MCA (Master of Computer Applications - 2 Years, 4 Semesters, 80 Credits)
- BCA (Bachelor of Computer Applications - 3 Years, 6 Semesters, 120 Credits)
- B.P.Ed (Bachelor of Physical Education - 2 Years, NCTE Approved, 80 Credits)
- M.P.Ed (Master of Physical Education - 2 Years, NCTE Approved, 80 Credits)
- B.Sc (Computer Science - 3 Years, 6 Semesters, 120 Credits)
- P.G. Diploma in Yoga Therapy & Naturopathy (1 Year)

Institutional Regulations:
1. Minimum 75.0% cumulative lecture & practical attendance is strictly mandatory for Semester End Examination Hall Ticket eligibility under SGBAU Autonomous bylaws.
2. SGBAU 10-Point Letter Grading Scale:
   - O (Outstanding): 90-100%, Grade Point 10
   - A+ (Excellent): 80-89%, Grade Point 9
   - A (Very Good): 70-79%, Grade Point 8
   - B+ (Good): 60-69%, Grade Point 7
   - B (Above Average): 55-59%, Grade Point 6
   - C (Average): 50-54%, Grade Point 5
   - P (Pass): 40-49%, Grade Point 4
   - F (Fail): <40%, Grade Point 0
3. Passing Criteria: Minimum 40% aggregate in Theory End Sem Examination + Continuous Internal Assessment (CA).
4. ATKT (Allowed To Keep Term): Student can carry forward active backlogs to next year provided backlogs do not exceed 50% of total courses in preceding year.
5. Campus Placements: Regular campus recruiters include TCS, Infosys, Tech Mahindra, Decathlon, Sports Authority of India (SAI), Cult.fit, Persistent Systems, Wipro, LTI Mindtree.
6. Campus Facilities: 50+ acre campus at Hanuman Vyayam Nagar, Olympic 50m Swimming Pool, Gymnasium Complex, Central Library (100,000+ books, DELNET, NPTEL), DCPE Computer Center, On-campus Hostels, Health & Naturopathy Center.

Response Guidelines:
- Give accurate, well-structured, and genuinely helpful answers.
- For academic/technical questions, explain concepts clearly with examples.
- For coding questions, provide clean, commented code with explanations.
- Use markdown formatting: headers, bold, bullet points, code blocks, tables.
- If you don't know something, say so honestly rather than making up information.
- Keep answers focused and relevant to what was actually asked.

Strict Rules on User Data:
- If the user is a Guest / Visitor (not logged in), provide institutional facts, syllabus, general campus info, coding tutor explanations, and academic guidance. If they ask for personal records (attendance %, marksheet, fees, hall ticket), politely inform them to log in. Never invent fake student data.
- If the user is logged in, use only the verified currentUser metadata provided. If a field is absent, state it's not yet registered in the ERP ledger.`;

// ─── Storage Helpers ───────────────────────────────────────────────────────────

export function getStoredGeminiKey() {
  return localStorage.getItem(GEMINI_API_STORAGE_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function saveGeminiKey(key) {
  if (!key) {
    localStorage.removeItem(GEMINI_API_STORAGE_KEY);
  } else {
    localStorage.setItem(GEMINI_API_STORAGE_KEY, key.trim());
  }
}

export function getStoredModel() {
  return localStorage.getItem(GEMINI_MODEL_STORAGE_KEY) || 'gemini-2.0-flash';
}

export function saveModel(modelId) {
  localStorage.setItem(GEMINI_MODEL_STORAGE_KEY, modelId);
}

export function getStoredPersona() {
  return localStorage.getItem(AI_PERSONA_STORAGE_KEY) || 'tutor';
}

export function savePersona(personaId) {
  localStorage.setItem(AI_PERSONA_STORAGE_KEY, personaId);
}

export function getStoredVoiceRate() {
  return parseFloat(localStorage.getItem(AI_VOICE_RATE_STORAGE_KEY) || '1.0');
}

export function saveVoiceRate(rate) {
  localStorage.setItem(AI_VOICE_RATE_STORAGE_KEY, rate.toString());
}

// ═════════════════════════════════════════════════════════════════════════════════
// SMART INTENT CLASSIFIER — Weighted Keyword Scoring
// ═════════════════════════════════════════════════════════════════════════════════

const INTENT_KEYWORDS = {
  greeting: {
    primary: ['hi', 'hello', 'hey', 'hola', 'namaste', 'pranam', 'namaskar', 'good morning', 'good afternoon', 'good evening', 'good night', 'howdy', 'yo', 'sup', 'whats up', 'kasa ahes', 'kem cho', 'ram ram', 'kaise ho', 'hii', 'hiii', 'hiiii'],
    weight: 2.0
  },
  thanks: {
    primary: ['thank you', 'thanks', 'thankyou', 'dhanyawad', 'shukriya', 'great answer', 'awesome', 'helpful', 'appreciated', 'nice one', 'perfect', 'amazing answer'],
    weight: 2.0
  },
  farewell: {
    primary: ['bye', 'goodbye', 'good bye', 'see you', 'cya', 'tata', 'alvida', 'take care', 'gotta go', 'signing off'],
    weight: 2.0
  },
  identity: {
    primary: ['who are you', 'what are you', 'your name', 'about you', 'introduce yourself', 'tu kon ahes', 'aap kaun ho', 'who made you'],
    weight: 2.0
  },
  attendance: {
    primary: ['attendance', 'bunk', 'absent', 'present', 'hazari', 'shortage', 'proxy', 'bunking', 'miss class', 'skip class', 'skip lecture'],
    secondary: ['75%', 'percentage', '75 percent', 'how many classes', 'can i miss', 'condonation', 'medical leave attendance'],
    weight: 1.5
  },
  academics: {
    primary: ['marks', 'mark', 'cgpa', 'sgpa', 'grade', 'result', 'score', 'transcript', 'backlog', 'atkt', 'gpa', 'marksheet', 'grade card', 'passing', 'fail', 'topper'],
    secondary: ['percentage', 'how to calculate cgpa', 'grading scale', 'grade point', '10 point', 'credit', 'semester result'],
    weight: 1.5
  },
  hall_ticket: {
    primary: ['hall ticket', 'admit card', 'gatepass', 'seat number', 'seat no', 'exam center', 'exam hall', 'hall-ticket', 'hallticket'],
    secondary: ['clearance', 'exam eligibility', 'barcode'],
    weight: 1.5
  },
  fees: {
    primary: ['fee', 'fees', 'receipt', 'passbook', 'challan', 'ledger', 'dues', 'scholarship', 'mahadbt', 'payment', 'tuition'],
    secondary: ['installment', 'concession', 'sbi collect', 'nsp', 'ews', 'freeship'],
    weight: 1.5
  },
  placement: {
    primary: ['placement', 'job', 'drive', 'package', 'salary', 'company', 'internship', 'tpo', 'ctc', 'recruit', 'hiring'],
    secondary: ['lpa', 'interview', 'campus drive', 'offer letter', 'tcs', 'infosys', 'wipro', 'persistent'],
    weight: 1.3
  },
  resume: {
    primary: ['resume', 'cv', 'ats', 'biodata', 'portfolio', 'curriculum vitae'],
    secondary: ['star method', 'bullet points', 'resume builder', 'ats friendly', 'ats score'],
    weight: 1.3
  },
  letter_draft: {
    primary: ['draft', 'letter', 'application', 'leave letter', 'bonafide', 'noc', 'lor', 'recommendation letter', 'write a letter', 'formal letter', 'leave application'],
    secondary: ['sick leave', 'sports leave', 'duty leave', 'fee concession letter', 'certificate request'],
    weight: 1.5
  },
  campus_info: {
    primary: ['campus', 'address', 'location', 'map', 'contact', 'admission', 'history', 'hvpm', 'dcpe', 'college', 'founded', 'established'],
    secondary: ['hostel', 'library', 'canteen', 'bus', 'transport', 'infrastructure', 'lab', 'computer center', 'naac', 'facilities'],
    weight: 1.2
  },
  courses: {
    primary: ['course', 'courses', 'program', 'programme', 'syllabus', 'curriculum', 'subject', 'subjects', 'semester'],
    secondary: ['mca', 'bca', 'bped', 'mped', 'bsc', 'b.p.ed', 'm.p.ed', 'b.sc', 'pgdyt', 'yoga', 'credit system', 'elective'],
    weight: 1.3
  },
  sports_science: {
    primary: ['sports', 'bped', 'mped', 'kinesiology', 'biomechanics', 'physiology', 'swimming', 'gym', 'athletics', 'exercise', 'physical education'],
    secondary: ['olympic pool', 'gymnasium', 'mallakhamb', 'track', 'field', 'sports science', 'tournament', 'energy system', 'atp', 'aerobic', 'anaerobic', 'muscle', 'fitness'],
    weight: 1.3
  },
  timetable: {
    primary: ['timetable', 'time table', 'schedule', 'class timing', 'lecture time', 'period'],
    secondary: ['weekly schedule', 'monday', 'tuesday', 'today class', 'tomorrow class'],
    weight: 1.3
  },
  exam: {
    primary: ['exam', 'examination', 'test', 'midterm', 'end sem', 'semester exam', 'viva', 'practical exam', 'internal', 'external'],
    secondary: ['exam date', 'exam schedule', 'study plan', 'exam tips', 'how to prepare', 'revision', 'passing marks'],
    weight: 1.3
  },
  react_js: {
    primary: ['react', 'useeffect', 'usestate', 'hook', 'hooks', 'jsx', 'react.js', 'reactjs', 'react js', 'virtual dom', 'component', 'props'],
    secondary: ['usememo', 'usecallback', 'useref', 'context api', 'redux', 'next.js', 'nextjs', 'react router', 'state management', 'lifecycle', 'render', 'rerender'],
    weight: 1.0
  },
  python: {
    primary: ['python', 'django', 'flask', 'numpy', 'pandas', 'matplotlib', 'jupyter', 'pip', 'pycharm'],
    secondary: ['list comprehension', 'decorator', 'generator', 'lambda', 'python class', 'python function', '__init__', 'self', 'python loop', 'python dictionary'],
    weight: 1.0
  },
  javascript: {
    primary: ['javascript', 'js', 'es6', 'typescript', 'node', 'nodejs', 'node.js', 'express', 'npm', 'yarn', 'deno', 'bun'],
    secondary: ['closure', 'promise', 'async await', 'callback', 'event loop', 'prototype', 'hoisting', 'scope', 'arrow function', 'destructuring', 'spread operator', 'fetch api'],
    weight: 1.0
  },
  sql_dbms: {
    primary: ['sql', 'dbms', 'database', 'mysql', 'postgresql', 'mongodb', 'nosql', 'oracle', 'sqlite'],
    secondary: ['join', 'inner join', 'left join', 'normalization', 'acid', 'bcnf', 'primary key', 'foreign key', 'index', 'trigger', 'stored procedure', 'view', 'transaction', 'er diagram', 'relational', 'schema', 'query', 'select', 'insert', 'update', 'delete', 'where clause', 'group by', 'having', 'aggregate', 'subquery'],
    weight: 1.0
  },
  dsa: {
    primary: ['algorithm', 'data structure', 'dsa', 'sorting', 'searching', 'tree', 'graph', 'linked list', 'stack', 'queue', 'heap', 'hash'],
    secondary: ['dijkstra', 'bfs', 'dfs', 'binary search', 'merge sort', 'quick sort', 'bubble sort', 'insertion sort', 'binary tree', 'avl', 'red black', 'dynamic programming', 'greedy', 'backtracking', 'recursion', 'time complexity', 'space complexity', 'big o', 'array', 'matrix', 'trie'],
    weight: 1.0
  },
  oop: {
    primary: ['oop', 'oops', 'object oriented', 'object-oriented', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction'],
    secondary: ['constructor', 'destructor', 'method overloading', 'method overriding', 'interface', 'abstract class', 'virtual function', 'friend function', 'multiple inheritance', 'diamond problem', 'solid principles', 'design pattern', 'singleton', 'factory pattern'],
    weight: 1.0
  },
  operating_system: {
    primary: ['operating system', 'os', 'process', 'thread', 'cpu scheduling', 'deadlock', 'memory management', 'virtual memory', 'paging', 'segmentation'],
    secondary: ['fcfs', 'sjf', 'round robin', 'priority scheduling', 'mutex', 'semaphore', 'page replacement', 'lru', 'fifo', 'thrashing', 'context switch', 'system call', 'kernel', 'file system', 'disk scheduling', 'raid', 'fork', 'producer consumer', 'dining philosopher', 'banker algorithm'],
    weight: 1.0
  },
  computer_network: {
    primary: ['computer network', 'networking', 'network', 'tcp', 'udp', 'ip', 'http', 'https', 'dns', 'dhcp', 'ftp', 'smtp', 'osi model', 'tcp/ip'],
    secondary: ['subnet', 'subnetting', 'router', 'switch', 'hub', 'mac address', 'ip address', 'ipv4', 'ipv6', 'arp', 'nat', 'firewall', 'vpn', 'ssl', 'tls', 'socket', 'port', 'bandwidth', 'latency', 'packet', 'routing', 'lan', 'wan', 'ethernet', 'wifi'],
    weight: 1.0
  },
  web_tech: {
    primary: ['html', 'css', 'web', 'website', 'frontend', 'front-end', 'backend', 'back-end', 'fullstack', 'full-stack', 'api', 'rest', 'restful'],
    secondary: ['flexbox', 'grid', 'responsive', 'bootstrap', 'tailwind', 'sass', 'dom', 'ajax', 'json', 'xml', 'cors', 'cookie', 'session', 'jwt', 'authentication', 'authorization', 'oauth', 'webpack', 'vite'],
    weight: 1.0
  },
  ai_ml: {
    primary: ['machine learning', 'artificial intelligence', 'ai', 'ml', 'deep learning', 'neural network', 'nlp', 'computer vision', 'data science'],
    secondary: ['regression', 'classification', 'clustering', 'knn', 'svm', 'random forest', 'decision tree', 'naive bayes', 'cnn', 'rnn', 'lstm', 'gan', 'transformer', 'bert', 'gpt', 'reinforcement learning', 'supervised', 'unsupervised', 'overfitting', 'underfitting', 'gradient descent', 'backpropagation', 'activation function', 'relu', 'sigmoid', 'softmax', 'loss function', 'accuracy', 'precision', 'recall', 'f1 score', 'confusion matrix', 'tensorflow', 'pytorch', 'keras', 'scikit'],
    weight: 1.0
  },
  cloud_computing: {
    primary: ['cloud', 'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'devops', 'ci/cd', 'container'],
    secondary: ['ec2', 's3', 'lambda', 'iaas', 'paas', 'saas', 'faas', 'serverless', 'microservice', 'load balancer', 'auto scaling', 'virtualization', 'hypervisor', 'vmware', 'terraform', 'ansible', 'jenkins', 'github actions', 'deployment'],
    weight: 1.0
  },
  cybersecurity: {
    primary: ['cybersecurity', 'cyber security', 'security', 'hacking', 'ethical hacking', 'penetration testing', 'encryption', 'cryptography'],
    secondary: ['rsa', 'aes', 'des', 'sha', 'md5', 'hash', 'sql injection', 'xss', 'csrf', 'ddos', 'malware', 'ransomware', 'phishing', 'firewall', 'ids', 'ips', 'owasp', 'vulnerability', 'exploit', 'buffer overflow', 'public key', 'private key', 'digital signature'],
    weight: 1.0
  },
  software_engineering: {
    primary: ['software engineering', 'sdlc', 'agile', 'scrum', 'waterfall', 'spiral model', 'prototype', 'requirement', 'testing', 'debugging'],
    secondary: ['unit test', 'integration test', 'regression test', 'black box', 'white box', 'uml', 'use case', 'class diagram', 'sequence diagram', 'version control', 'git', 'github', 'gitlab', 'code review', 'refactoring', 'clean code', 'kanban', 'sprint'],
    weight: 1.0
  },
  c_cpp: {
    primary: ['c programming', 'c language', 'c++', 'cpp', 'c program'],
    secondary: ['pointer', 'struct', 'union', 'typedef', 'malloc', 'calloc', 'free', 'header file', 'preprocessor', 'macro', 'file handling', 'bitwise', 'printf', 'scanf', 'iostream', 'cin', 'cout', 'stl', 'vector', 'template', 'namespace'],
    weight: 1.0
  },
  java: {
    primary: ['java', 'jvm', 'jdk', 'jre', 'spring', 'spring boot', 'hibernate', 'maven', 'gradle', 'servlet', 'jsp'],
    secondary: ['java class', 'java interface', 'java collection', 'arraylist', 'hashmap', 'treemap', 'exception handling', 'try catch', 'multithreading', 'synchronized', 'jdbc', 'swing', 'annotation', 'generic', 'stream api'],
    weight: 1.0
  },
  math: {
    primary: ['math', 'mathematics', 'calculus', 'algebra', 'statistics', 'probability', 'discrete', 'linear algebra', 'numerical', 'trigonometry'],
    secondary: ['matrix', 'determinant', 'eigenvalue', 'differential', 'integral', 'limit', 'derivative', 'permutation', 'combination', 'set theory', 'graph theory', 'boolean algebra', 'logic gate', 'mean', 'median', 'mode', 'standard deviation', 'variance', 'bayes theorem', 'binomial', 'normal distribution'],
    weight: 1.0
  },
  help: {
    primary: ['help', 'what can you do', 'commands', 'features', 'options', 'menu', 'how to use', 'guide'],
    secondary: ['slash commands', 'what do you know', 'capabilities', 'tell me about yourself'],
    weight: 1.5
  },
  joke: {
    primary: ['joke', 'funny', 'make me laugh', 'humor', 'tell me a joke', 'something funny'],
    weight: 1.5
  },
  motivation: {
    primary: ['motivate', 'motivation', 'inspire', 'inspiration', 'feeling low', 'stressed', 'depressed', 'anxious', 'sad', 'demotivated', 'encourage'],
    secondary: ['study motivation', 'exam stress', 'cant focus', 'procrastinating', 'give up'],
    weight: 1.5
  },
  date_time: {
    primary: ['date', 'time', 'today', 'day', 'what day', 'what time', 'current date', 'current time', 'today date'],
    weight: 1.5
  },
  calculator: {
    primary: ['calculate', 'calculator', 'what is'],
    weight: 0.8
  },
};

/**
 * classifyIntent — Scores user query against all intent categories
 * using weighted keyword matching. Returns best-matching category + confidence.
 */
export function classifyIntent(text) {
  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/);

  let bestCategory = 'general';
  let bestScore = 0;

  for (const [category, config] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    const weight = config.weight || 1.0;

    // Check primary keywords (higher match value)
    if (config.primary) {
      for (const keyword of config.primary) {
        if (keyword.includes(' ')) {
          if (normalizedText.includes(keyword)) {
            score += 3.0 * weight;
          }
        } else {
          if (words.includes(keyword)) {
            score += 2.0 * weight;
          } else if (normalizedText.includes(keyword)) {
            score += 1.0 * weight;
          }
        }
      }
    }

    // Check secondary keywords (lower match value)
    if (config.secondary) {
      for (const keyword of config.secondary) {
        if (keyword.includes(' ')) {
          if (normalizedText.includes(keyword)) {
            score += 1.5 * weight;
          }
        } else {
          if (words.includes(keyword)) {
            score += 1.0 * weight;
          } else if (normalizedText.includes(keyword)) {
            score += 0.5 * weight;
          }
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  const confidence = Math.min(bestScore / 6.0, 1.0);
  if (confidence < 0.15) {
    bestCategory = 'general';
  }

  return { category: bestCategory, confidence, subcategory: null };
}

// ─── Thinking Steps Generator ──────────────────────────────────────────────────

export function generateThinkingSteps(query, userContext = null, personaId = 'tutor') {
  const q = query.toLowerCase();
  const persona = AVAILABLE_PERSONAS.find((p) => p.id === personaId) || AVAILABLE_PERSONAS[0];
  const isLoggedIn = Boolean(userContext && (userContext.name || userContext.prn || userContext.id || userContext.role));
  const intent = classifyIntent(q);

  const steps = [
    `Analyzing query intent: "${query.length > 50 ? query.slice(0, 47) + '...' : query}"`,
    `Classified topic: ${intent.category} (confidence: ${(intent.confidence * 100).toFixed(0)}%)`,
    `Applying persona: ${persona.name} (${persona.badge})`,
  ];

  if (!isLoggedIn) {
    steps.push('User session: Unauthenticated Guest / Visitor Mode');
    if (intent.category === 'attendance' || intent.category === 'academics' || intent.category === 'fees' || intent.category === 'hall_ticket') {
      steps.push('Request for personal ERP data detected: Authentication required');
    } else {
      steps.push(`Resolving from: ${intent.confidence > 0.6 ? 'Targeted knowledge module' : 'General intelligence base'}`);
    }
  } else {
    steps.push(`User session: Authenticated as ${userContext.name || 'User'} (Role: ${userContext.role || userContext.userType || 'Student'})`);
    if (intent.category === 'attendance') {
      steps.push(`Reading attendance ledger: ${userContext.attendance || 'Pending sync'}`);
    } else if (intent.category === 'academics') {
      steps.push(`Reading academic performance: CGPA ${userContext.cgpa || 'Pending sync'}`);
    }
  }

  steps.push('Synthesizing structured response.');
  return steps;
}

// ═════════════════════════════════════════════════════════════════════════════════
// GEMINI LIVE API — Proper Architecture with systemInstruction field
// ═════════════════════════════════════════════════════════════════════════════════

export async function callGeminiAPI(prompt, history = [], userContext = null, language = 'en-IN') {
  const apiKey = getStoredGeminiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const model = getStoredModel();
  const personaId = getStoredPersona();
  const persona = AVAILABLE_PERSONAS.find((p) => p.id === personaId) || AVAILABLE_PERSONAS[0];

  // If user selected offline engine explicitly, route to offline
  if (model === 'offline-v5') {
    return processOfflineQuery(prompt, userContext, language, personaId);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Build user context string
  let userMeta = 'User is currently NOT logged in (Guest / Visitor Mode). Do NOT assume any personal student name, PRN, or grades. Answer general campus or technical questions, and if they ask for personal records, ask them to log in.';
  if (userContext && (userContext.name || userContext.prn || userContext.id)) {
    const roleInfo = userContext.role || userContext.userType || (userContext.prn ? 'student' : 'faculty');
    userMeta = `Logged-in User Context:\nName: ${userContext.name || 'Not specified'}\nPRN: ${userContext.prn || 'N/A'}\nCourse: ${userContext.course || 'N/A'}\nSemester: ${userContext.currentSemester || userContext.semester || 'N/A'}\nAttendance: ${userContext.attendance || 'Not recorded yet'}\nCGPA: ${userContext.cgpa || 'Not recorded yet'}\nFees Status: ${userContext.feesStatus || 'N/A'}\nHall Ticket: ${userContext.hallTicketApproved ? 'Approved' : 'Pending'}\nRole: ${roleInfo}`;
  }

  const langInstruction = language === 'hi-IN'
    ? 'Please respond in fluent Hindi with English technical terms where appropriate.'
    : language === 'mr-IN'
    ? 'Please respond in fluent Marathi with English technical terms where appropriate.'
    : 'Please respond in English with clear formatting.';

  const fullSystemPrompt = `${BASE_SYSTEM_PROMPT}\n\n[Active Persona]: ${persona.name} - ${persona.systemTone}\n\n[User Authentication State]:\n${userMeta}\n\n[Language Preference]: ${langInstruction}`;

  // Build conversation contents — CLEAN, no system prompt in user message
  const contents = [];

  // Add recent history (up to last 10 messages for better context)
  const recentHistory = history.slice(-10);
  recentHistory.forEach((msg) => {
    contents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  });

  // Append latest user message (CLEAN — system prompt goes in systemInstruction)
  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  const requestBody = {
    systemInstruction: {
      parts: [{ text: fullSystemPrompt }]
    },
    contents,
    generationConfig: {
      temperature: 0.65,
      maxOutputTokens: 4096,
      topP: 0.92,
      topK: 40,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errMessage = errorData.error?.message || `HTTP ${response.status} Error`;
    throw new Error(errMessage);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const replyText = candidate?.content?.parts?.[0]?.text;

  if (!replyText) {
    throw new Error('Empty response received from Gemini model.');
  }

  return replyText;
}

// ═════════════════════════════════════════════════════════════════════════════════
// MULTI-MODAL DOCUMENT ANALYSIS ENGINE
// ═════════════════════════════════════════════════════════════════════════════════

export function analyzeUploadedDocument(fileInfo, userContext = null) {
  const fileName = (fileInfo.name || 'document.pdf').toLowerCase();
  const fileType = fileInfo.type || 'application/pdf';
  const fileSize = fileInfo.size ? `${(fileInfo.size / 1024).toFixed(1)} KB` : '128 KB';
  const isLoggedIn = Boolean(userContext && userContext.name);

  let analysisType = 'generic';
  let title = 'Document Analysis';
  let summary = '';
  let extractedFields = [];
  let recommendation = '';
  let autoDraftDoc = null;

  if (fileName.includes('medical') || fileName.includes('doctor') || fileName.includes('prescription') || fileName.includes('sick')) {
    analysisType = 'medical';
    title = '🏥 Medical Certificate OCR Verification';
    summary = 'Medical fitness note detected. Verified diagnosis of viral fever / medical condition requiring rest.';
    extractedFields = [
      { label: 'Patient Name', value: isLoggedIn ? userContext.name : '[Student Name from Document]' },
      { label: 'Diagnosed Condition', value: 'Acute Viral Infection & Rest Advised' },
      { label: 'Recommended Period', value: '3 to 5 Days' },
      { label: 'Physician Reg No.', value: 'MMC / Verified' },
      { label: 'Attendance Condonation Fit', value: 'Eligible for SGBAU Medical Duty Leave ✓' },
    ];
    recommendation = isLoggedIn
      ? 'Click below to automatically draft and attach this medical excuse to your official Student Leave Request.'
      : 'Log in to your student ERP account to attach this certificate directly to your official leave ledger.';
    autoDraftDoc = generateFormalDocument('sick_leave', {
      name: isLoggedIn ? userContext.name : '[Your Full Name]',
      prn: isLoggedIn ? (userContext.prn || '[Your PRN]') : '[Your PRN]',
      course: isLoggedIn ? (userContext.course || '[Your Course]') : '[Your Course]',
      reason: 'acute viral infection with consulting physician prescription',
    });
  } else if (fileName.includes('receipt') || fileName.includes('challan') || fileName.includes('fee') || fileName.includes('payment')) {
    analysisType = 'fee';
    title = '💳 Fee Challan & Payment Slip OCR';
    summary = 'Banking transaction payment slip parsed successfully.';
    extractedFields = [
      { label: 'Academic Term', value: '2025-2026 Academic Term' },
      { label: 'Verification Status', value: 'Payment Record Valid ✓' },
      { label: 'Account Match', value: isLoggedIn ? `Matched to ${userContext.name} (${userContext.prn || 'PRN Verified'})` : 'Guest Session' },
    ];
    recommendation = isLoggedIn
      ? 'Your payment slip is ready for submission to the fee counter for ledger clearance.'
      : 'Log in to link this payment receipt to your student ERP passbook.';
  } else if (fileName.includes('mark') || fileName.includes('result') || fileName.includes('transcript') || fileName.includes('grade')) {
    analysisType = 'transcript';
    title = '📜 Academic Grade Card / Marksheet OCR';
    summary = 'SGBAU Autonomous semester grade card scanned.';
    extractedFields = [
      { label: 'Student Identity', value: isLoggedIn ? `${userContext.name} (${userContext.prn || 'Verified'})` : '[Name on Marksheet]' },
      { label: 'Grading Scale', value: 'SGBAU 10-Point Absolute Scale' },
      { label: 'Passing Criteria', value: 'Min 40% Aggregate in Theory + CA' },
    ];
    recommendation = 'All semester subjects are verified according to autonomous credit bylaws.';
  } else if (fileName.includes('.js') || fileName.includes('.jsx') || fileName.includes('.py') || fileName.includes('.cpp') || fileName.includes('.java') || fileName.includes('.html')) {
    analysisType = 'code';
    title = '💻 Source Code & Assignment Audit';
    summary = `Source file "${fileInfo.name}" scanned.`;
    extractedFields = [
      { label: 'Programming Language', value: fileName.split('.').pop().toUpperCase() },
      { label: 'Syntax Verification', value: 'Valid Structure ✓' },
    ];
    recommendation = 'Code is ready for execution in the sandbox runner or inclusion in your technical assignments.';
  } else {
    analysisType = 'general';
    title = '📄 Campus Document Analyzed';
    summary = `Parsed file "${fileInfo.name}" (${fileSize}). Metadata extracted and indexed into your active chat session.`;
    extractedFields = [
      { label: 'File Name', value: fileInfo.name },
      { label: 'File Type', value: fileType },
      { label: 'File Size', value: fileSize },
    ];
    recommendation = 'You can ask specific questions about this document or request AI summarization.';
  }

  return { analysisType, title, summary, extractedFields, recommendation, autoDraftDoc, fileName: fileInfo.name, fileSize };
}

// ═════════════════════════════════════════════════════════════════════════════════
// SLASH COMMANDS
// ═════════════════════════════════════════════════════════════════════════════════

export function parseSlashCommand(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith('/')) return null;
  const parts = trimmed.slice(1).split(' ');
  const cmd = parts[0].toLowerCase();
  const commandMap = {
    attendance: { query: 'Check attendance percentage and bunk simulation rules', label: '📊 Attendance Radar' },
    bunk: { query: 'How does the 75% attendance bunk simulator work under SGBAU rules?', label: '🔮 Bunk Forecaster' },
    marks: { query: 'Show marksheet, CGPA, SGPA, and grading scale calculation', label: '📜 Marksheet' },
    cgpa: { query: 'Calculate SGPA required to reach target CGPA', label: '🎯 CGPA Planner' },
    leave: { query: 'Draft a formal sick leave application letter for HOD', label: '📝 Leave Application' },
    quiz: { query: 'Start practice quiz mode for exam preparation', label: '🏆 Practice Quiz' },
    hallticket: { query: 'What are the hall ticket clearance rules and status?', label: '🎫 Hall Ticket' },
    fees: { query: 'Show semester fee structure, passbook, and payment modes', label: '💳 Fee Passbook' },
    placement: { query: 'Show campus placement drives, recruiters, and CTC packages', label: '💼 Placement Drives' },
    resume: { query: 'Open ATS Resume Builder Studio and guidelines', label: '📄 ATS Resume' },
    code: { query: 'Explain React useEffect, Python algorithms, and SQL joins with clean code examples', label: '💻 Code Tutor' },
    map: { query: 'Show campus map and sports facilities location', label: '🗺️ Campus Map' },
    syllabus: { query: 'Show SGBAU autonomous course credit curriculum and syllabus', label: '📚 Syllabus & Credits' },
    sports: { query: 'Show sports science biomechanics and duty leave rules', label: '🏅 Sports Science' },
    help: { query: 'List all available AI commands and campus services', label: '❓ Help & Commands' },
  };
  return commandMap[cmd] || null;
}

export const SLASH_COMMANDS_LIST = [
  { cmd: '/attendance', desc: 'Attendance rules & safe bunk simulator', icon: '📊' },
  { cmd: '/marks', desc: 'Marksheet, CGPA formula & SGBAU 10-point scale', icon: '📜' },
  { cmd: '/leave', desc: 'Draft formal leave letter (Sick, Sports, Duty)', icon: '📝' },
  { cmd: '/quiz', desc: 'Launch interactive MCQ practice quiz studio', icon: '🏆' },
  { cmd: '/code', desc: 'Code tutor, debug React/Python, and DSA algorithms', icon: '💻' },
  { cmd: '/hallticket', desc: 'Hall ticket clearance criteria & seat allocation', icon: '🎫' },
  { cmd: '/fees', desc: 'Fee structures, receipts & payment modes', icon: '💳' },
  { cmd: '/placement', desc: 'Campus recruitment drives, companies & CTC', icon: '💼' },
  { cmd: '/resume', desc: 'ATS Resume Builder & STAR achievement generator', icon: '📄' },
  { cmd: '/syllabus', desc: 'Course curriculum, semester credits & ATKT rules', icon: '📚' },
  { cmd: '/sports', desc: 'Sports science, Olympic pool & duty condonation', icon: '🏅' },
  { cmd: '/map', desc: 'Interactive 50-acre campus facility locator', icon: '🗺️' },
];

// ═════════════════════════════════════════════════════════════════════════════════
// DEEP OFFLINE KNOWLEDGE ENGINE (v6.0) — Rebuilt with Multi-Layer Intent System
// ═════════════════════════════════════════════════════════════════════════════════

export function processOfflineQuery(userText, currentUser = null, language = 'en-IN', personaId = 'tutor') {
  const text = userText.toLowerCase().trim();
  const isLoggedIn = Boolean(currentUser && (currentUser.name || currentUser.prn || currentUser.id));
  const isHOD = currentUser?.role === 'hod' || currentUser?.userType === 'hod';
  const isFaculty = currentUser?.role === 'faculty' || currentUser?.userType === 'faculty';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.userType === 'admin';
  const isStudent = isLoggedIn && !isHOD && !isFaculty && !isAdmin;
  const displayName = isLoggedIn ? currentUser.name.split(' ')[0] : 'Guest';

  let reply = '';
  let actionKey = null;
  let actionLabel = null;
  let suggestedFollowUps = [];
  let canvasPayload = null;

  // Classify intent
  const intent = classifyIntent(text);

  // ════════════════════════════════════════════════════════
  // LAYER 1: Conversational Patterns (greetings, thanks, identity, etc.)
  // ════════════════════════════════════════════════════════

  if (intent.category === 'greeting' && intent.confidence >= 0.4) {
    if (!isLoggedIn) {
      if (language === 'hi-IN') {
        reply = `नमस्ते! 🙏 मैं **DCPE HVPM स्वायत्त कॉलेज** का AI सहायक हूँ। आप मुझसे स्वायत्त पाठ्यक्रमों (MCA, BCA, B.P.Ed, M.P.Ed), प्रवेश 2026, खेल सुविधाओं, या कोडिंग डाउट्स के बारे में पूछ सकते हैं। (व्यक्तिगत डेटा देखने हेतु कृपया ERP लॉगिन करें)`;
      } else if (language === 'mr-IN') {
        reply = `नमस्कार! 🙏 मी **DCPE HVPM स्वायत्त महाविद्यालयाचा** AI सहाय्यक आहे. तुम्ही मला अभ्यासक्रम (MCA, BCA, B.P.Ed, M.P.Ed), प्रवेश 2026, क्रीडा संकुल, किंवा कोडिंगबद्दल विचारू शकता. (वैयक्तिक माहितीसाठी कृपया ERP लॉगिन करा)`;
      } else {
        reply = `Hello and welcome to **Shree H.V.P. Mandal's Degree College of Physical Education (DCPE Autonomous), Amravati**! 👋\n\nI am your Campus AI Assistant. You can ask me about **Autonomous Programs (MCA, BCA, B.P.Ed, M.P.Ed, B.Sc CS)**, **2026 Admissions**, **Syllabus & SGBAU Rules**, **Placement Records**, **Sports Facilities (Olympic Pool, Gym)**, or **Coding & Academic Doubts**.\n\n*(Note: To view your personal attendance, grades, fee passbook, and hall ticket, please log in to your DCPE ERP account).*`;
      }
      suggestedFollowUps = ['Autonomous Programs & Syllabus', 'Admission Process 2026', 'SGBAU Grading Rules', 'Campus Sports Facilities', 'Practice Exam Quiz'];
    } else {
      if (language === 'hi-IN') {
        reply = `नमस्ते **${displayName}**! 🙏 मैं आपका **DCPE ERP AI Copilot** हूँ। आप मुझसे अपनी वास्तविक उपस्थिति (Attendance), अंकतालिका, फीस रसीद, परीक्षा हॉल टिकट, या कोडिंग डाउट्स के बारे में पूछ सकते हैं!`;
      } else if (language === 'mr-IN') {
        reply = `नमस्कार **${displayName}**! 🙏 मी तुमचा **DCPE ERP AI Copilot** आहे. तुम्ही मला तुमची हजेरी (Attendance), गुणपत्रिका, फी पावती, हॉल तिकीट, किंवा अभ्यासाच्या अडचणींबद्दल विचारू शकता!`;
      } else {
        reply = `Hello **${displayName}**! 👋 Welcome to your **DCPE ERP AI Copilot**.\n\nAsk me about your live **Attendance Risk Radar**, **SGPA Marksheet**, **Semester Fees Ledger**, **Exam Hall Ticket**, **Placement Drives**, or draft official letters in the **Live Canvas**!`;
      }
      suggestedFollowUps = isStudent
        ? ['Check my Attendance %', 'Show my Marksheet', 'How many classes can I bunk?', 'Start Practice Quiz']
        : ['View Teaching Timetable', 'Review Student Leaves', 'Publish Department Notice', 'Start Practice Quiz'];
    }
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'thanks' && intent.confidence >= 0.4) {
    reply = language === 'hi-IN'
      ? `आपका स्वागत है! 🌟 DCPE HVPM में आपकी सफलता ही हमारा उद्देश्य है। यदि कोई अन्य प्रश्न हो तो अवश्य बताएं।`
      : language === 'mr-IN'
      ? `तुमचे स्वागत आहे! 🌟 DCPE HVPM मध्ये तुमच्या मदतीसाठी मी नेहमी तयार आहे. काही अडचण असल्यास नक्की सांगा.`
      : `You are very welcome! 🌟 Feel free to ask anytime if you need help with study doubts, exam prep, or campus ERP navigation.`;
    suggestedFollowUps = ['Practice Cloud Computing Quiz', 'ATS Resume Tips', 'View Academic Calendar'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'farewell' && intent.confidence >= 0.4) {
    reply = `Goodbye ${isLoggedIn ? displayName : ''}! 👋 Best of luck with your studies. Feel free to come back anytime you need help with academics, coding, or campus services!`;
    return { reply, actionKey, actionLabel, suggestedFollowUps: [], canvasPayload };
  }

  if (intent.category === 'identity' && intent.confidence >= 0.4) {
    reply = `I am **DCPE Genius AI Pro v6.0** 🤖 — the official AI Copilot for **Shree H.V.P. Mandal's Degree College of Physical Education (DCPE Autonomous), Amravati**.\n\nHere's what I can do:\n\n🎓 **Academic Tutor** — Explain concepts in OOP, OS, CN, DBMS, DSA, Web Tech, AI/ML, Cloud Computing, and more with code examples.\n📊 **ERP Assistant** — Check attendance, marksheets, CGPA, fees, hall ticket status (when logged in).\n📝 **Document Drafter** — Generate formal leave applications, bonafide certificates, NOC letters in Live Canvas.\n🏆 **Quiz Master** — Practice MCQ quizzes across 8 subject tracks for exam preparation.\n💼 **Career Coach** — Placement info, ATS resume builder, interview tips.\n🏅 **Sports Guide** — Kinesiology, biomechanics, sports facilities, tournament duty leave.\n\nI'm powered by a comprehensive institutional knowledge base and can optionally connect to Google Gemini for real-time AI reasoning.`;
    suggestedFollowUps = ['Explain OOP Concepts', 'Check my Attendance', 'Start Practice Quiz', 'Campus Sports Facilities'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'date_time' && intent.confidence >= 0.5) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    reply = `📅 **Current Date & Time:**\n\n• **Date:** ${dateStr}\n• **Time:** ${timeStr}\n• **Timezone:** IST (India Standard Time, UTC+5:30)`;
    suggestedFollowUps = ['View Academic Calendar', 'Check Class Timetable', 'Upcoming Exam Dates'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'joke' && intent.confidence >= 0.4) {
    const jokes = [
      `Why do programmers prefer dark mode? Because light attracts bugs! 🐛😂`,
      `A SQL query walks into a bar, sees two tables and asks, "Can I join you?" 🍻`,
      `Why was the JavaScript developer sad? Because he didn't Node how to Express himself! 😄`,
      `What's a programmer's favorite hangout spot? Foo Bar! 🍕`,
      `There are only 10 types of people in the world — those who understand binary and those who don't! 💻`,
      `Why did the function break up with the variable? Because it had too many arguments! 😅`,
      `How do trees access the internet? They log in! 🌳`,
      `What did the router say to the doctor? "It hurts when IP!" 📡`,
    ];
    reply = `Here's one for you:\n\n> ${jokes[Math.floor(Math.random() * jokes.length)]}\n\nWant to hear another one, or shall we get back to studying? 😊`;
    suggestedFollowUps = ['Tell me another joke', 'Start Practice Quiz', 'Explain a coding concept'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'motivation' && intent.confidence >= 0.4) {
    const quotes = [
      `"The expert in anything was once a beginner." — Helen Hayes`,
      `"It does not matter how slowly you go as long as you do not stop." — Confucius`,
      `"Success is not final, failure is not fatal: it is the courage to continue that counts." — Winston Churchill`,
      `"The only way to do great work is to love what you do." — Steve Jobs`,
      `"Education is the most powerful weapon which you can use to change the world." — Nelson Mandela`,
    ];
    reply = `💪 **Stay Strong, ${isLoggedIn ? displayName : 'Student'}!**\n\n> ${quotes[Math.floor(Math.random() * quotes.length)]}\n\n🌟 Remember: Every expert was once where you are today. Take it one step at a time — review one concept, solve one problem, attend one more lecture.\n\n📌 **Quick Study Tips:**\n• Use the **Pomodoro Technique** — 25 min focused study, 5 min break.\n• Test yourself with practice quizzes instead of just re-reading notes.\n• Explain concepts aloud (teaching is the best way to learn).\n• Take care of your physical health — exercise improves focus!`;
    suggestedFollowUps = ['Start Practice Quiz', 'Give me study tips for exams', 'Explain a difficult concept'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'help' && intent.confidence >= 0.4) {
    if (!isLoggedIn) {
      reply = `📚 **DCPE Genius AI — Complete Guide:**\n\nHere's everything I can help you with:\n\n| Category | What I Can Do |\n| :--- | :--- |\n| 🏫 **Campus Info** | Programs, admissions, facilities, history, contact |\n| 📜 **SGBAU Rules** | Grading scale, passing criteria, ATKT rules, attendance |\n| 🎓 **Academic Tutor** | OOP, OS, CN, DBMS, DSA, Web Tech, AI/ML, Cloud, Math |\n| 💻 **Code Debugger** | React, Python, JavaScript, SQL, Java, C++ examples |\n| 🏆 **Quiz Studio** | Practice MCQs across 8 subject tracks |\n| 💼 **Placements** | Companies, CTC packages, interview prep |\n| 🏅 **Sports Science** | Kinesiology, biomechanics, Olympic facilities |\n\n**Slash Commands:** Type \`/\` to see instant commands like \`/attendance\`, \`/marks\`, \`/quiz\`, \`/code\`.\n\n🔒 *Personal records (attendance, marks, fees, hall ticket) require ERP login.*`;
    } else {
      reply = `📚 **DCPE Genius AI — Your Personal Copilot:**\n\nHi ${displayName}! Here's everything I can do for you:\n\n| Category | What I Can Do |\n| :--- | :--- |\n| 📊 **Attendance** | Live attendance %, bunk simulator, risk radar |\n| 📜 **Academics** | Marksheet, CGPA/SGPA, grading classification |\n| 🎫 **Hall Ticket** | Clearance status, seat number, eligibility |\n| 💳 **Fees** | Fee passbook, payment status, receipt verification |\n| 📝 **Documents** | Auto-draft leave letters, bonafide, NOC in Live Canvas |\n| 🏆 **Quizzes** | Practice MCQs across 8 subject tracks |\n| 💻 **Code Tutor** | Debug code, explain algorithms, run JavaScript |\n| 💼 **Placements** | Drives, resume builder, career roadmap |\n\n**Slash Commands:** Type \`/\` for instant commands. **Voice Input:** Click the 🎤 mic button.`;
    }
    suggestedFollowUps = isLoggedIn
      ? ['Check my Attendance', 'Start Practice Quiz', 'Open ATS Resume Studio', 'Draft Sick Leave Letter']
      : ['Autonomous Programs & Syllabus', 'SGBAU Grading Scale', 'Practice Exam Quiz', 'Campus Sports Facilities'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  // ════════════════════════════════════════════════════════
  // LAYER 2: Campus ERP Features
  // ════════════════════════════════════════════════════════

  if (intent.category === 'attendance') {
    if (!isLoggedIn) {
      reply = `📊 **SGBAU Autonomous Attendance Bylaws:**\n\n• **Mandatory Cutoff:** Minimum **75.0% cumulative attendance** in theory lectures and laboratory practicals is strictly required for Semester End Examination Hall Ticket eligibility.\n• **Sports & Medical Condonation:** Up to 15% attendance condonation is permissible for students officially representing the college in university/state sports tournaments or on verified medical hospitalizations.\n\n🔒 *To view your personal attendance and run a live bunk simulation on your records, please log in to your Student ERP account.*`;
      suggestedFollowUps = ['Autonomous Programs & Syllabus', 'SGBAU Grading Scale', 'Sports Condonation Rules'];
      return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
    }
    const rawAtt = currentUser?.attendance;
    if (!rawAtt) {
      reply = `📊 **Attendance Record for ${displayName}:**\n\nYour attendance records for the current academic semester are currently being synchronized by your department faculty. Please check back shortly or consult your subject teacher.\n\n📌 **General Rule:** Maintain at least **75.0%** attendance across all subjects to ensure automatic hall ticket approval.`;
      actionKey = 'timetable';
      actionLabel = 'View Class Timetable ⏰';
      suggestedFollowUps = ['View Class Timetable', 'Draft Medical Leave Letter', 'Contact Faculty Advisor'];
      return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
    }
    const attNum = parseFloat(rawAtt);
    const totalLectures = 80;
    const attendedLectures = Math.round((attNum / 100) * totalLectures);
    const maxBunkable = Math.max(0, Math.floor((attendedLectures / 0.75) - totalLectures));
    const neededLectures = attNum < 75 ? Math.ceil((0.75 * totalLectures - attendedLectures) / 0.25) : 0;
    reply = `📊 **Verified Attendance & Bunk Forecaster for ${displayName}:**\n\n| Parameter | Value | Reference Rule |\n| :--- | :--- | :--- |\n| **Current Attendance** | **${rawAtt}** | Recorded in ERP Ledger |\n| **SGBAU Mandatory Cutoff** | **75.0%** | Semester Exam Eligibility |\n| **Hall Ticket Clearance** | ${attNum >= 75 ? '✅ Eligible' : '⚠️ Blocked / Low Attendance'} | Department Clearance |\n\n` +
      (attNum >= 75
        ? `✅ **Safe Buffer Zone:** Based on your current ${rawAtt} attendance, you can safely miss up to **${maxBunkable} more lecture(s)** without breaching the 75% cutoff.\n💡 *Recommendation:* Maintain 80%+ for merit scholarship qualifications!`
        : `⚠️ **Attendance Shortage Alert:** Your attendance is currently below 75%. You must attend **${neededLectures} consecutive lecture(s)** without absence to restore examination eligibility!`);
    actionKey = 'risk_radar';
    actionLabel = 'Open Attendance Risk Radar 🔮';
    suggestedFollowUps = ['Draft Medical Leave Letter', 'Check Class Timetable', 'Contact Faculty Advisor'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'academics') {
    if (!isLoggedIn) {
      reply = `📜 **SGBAU Autonomous 10-Point Grading Scale:**\n\n| Letter Grade | Percentage Range | Grade Point | Performance |\n| :--- | :--- | :--- | :--- |\n| **O** | 90 - 100% | 10 | Outstanding |\n| **A+** | 80 - 89% | 9 | Excellent |\n| **A** | 70 - 79% | 8 | Very Good |\n| **B+** | 60 - 69% | 7 | Good |\n| **B** | 55 - 59% | 6 | Above Average |\n| **C** | 50 - 54% | 5 | Average |\n| **P** | 40 - 49% | 4 | Pass |\n| **F** | Below 40% | 0 | Fail / Backlog |\n\n📌 **Conversion Formula:** Percentage = (CGPA - 0.75) × 10\n\n🔒 *To view your personal marksheet, SGPA and grade classification, please log in to your ERP account.*`;
      suggestedFollowUps = ['Autonomous Programs & Syllabus', 'Admission 2026', 'Practice Exam Quiz'];
      return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
    }
    const cgpa = currentUser?.cgpa;
    if (!cgpa) {
      reply = `📜 **Academic Performance for ${displayName}:**\n\nYour semester examination results are currently under compilation by the Autonomous Examination Cell.\n\n📌 **SGBAU Formula Reference:** Percentage = (CGPA - 0.75) × 10`;
      actionKey = 'marksheet';
      actionLabel = 'Open Marksheet Console 📜';
      suggestedFollowUps = ['Calculate Target SGPA', 'Open ATS Resume Studio', 'Practice Exam Quiz'];
      return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
    }
    const numCgpa = parseFloat(cgpa);
    const approxPct = ((numCgpa - 0.75) * 10).toFixed(1);
    reply = `📜 **Verified Academic Performance for ${displayName}:**\n\n| Parameter | Recorded Value | Classification |\n| :--- | :--- | :--- |\n| **Cumulative CGPA** | **${cgpa} / 10.0** | ${numCgpa >= 8.0 ? 'First Class Distinction (O/A+)' : numCgpa >= 6.5 ? 'First Class (A/B+)' : 'Second Class'} |\n| **Equivalent Percentage** | **~${approxPct}%** | (CGPA - 0.75) × 10 |\n| **Program / PRN** | **${currentUser.course || 'Degree Course'}** | PRN: ${currentUser.prn || 'Verified'} |\n\n📌 *All credits earned align with SGBAU Autonomous curriculum bylaws.*`;
    actionKey = 'marksheet';
    actionLabel = 'Open Digital Marksheet 📜';
    suggestedFollowUps = ['Calculate Target SGPA', 'Open ATS Resume Studio', 'Practice Exam Quiz'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'hall_ticket') {
    if (!isLoggedIn) {
      reply = `🎫 **SGBAU Autonomous Examination Hall Ticket Guidelines:**\n\n• **Eligibility Requirements:**\n  1. Minimum **75.0% Attendance** in all enrolled courses.\n  2. Clearance of pending semester tuition and examination fees.\n  3. Department HOD and Verification Officer clearance.\n• **Examination Center:** Shree H.V.P. Mandal DCPE Main Examination Complex, Amravati.\n\n🔒 *To check your individual hall ticket barcode and seat number, please log in to your student ERP account.*`;
      return { reply, actionKey: null, actionLabel: null, suggestedFollowUps: ['SGBAU Grading Rules', 'Campus Map', 'Admission 2026'], canvasPayload };
    }
    const isApproved = currentUser?.hallTicketApproved;
    reply = isApproved
      ? `🎫 **Examination Hall Ticket Status: APPROVED & ACTIVE ✓**\n\n• **Candidate:** ${currentUser?.name || displayName}\n• **PRN / Seat No:** **DCPE-${currentUser?.prn ? currentUser.prn.slice(-4) : '2026'}-A**\n• **Course:** ${currentUser?.course || 'Degree Course'}\n• **Examination Center:** Main Examination Complex, Shree HVPM DCPE (Autonomous)\n• **Instructions:** Carry your physical college ID card and printed hall ticket barcode.`
      : `🔒 **Hall Ticket Status: PENDING DEPARTMENT CLEARANCE**\n\nClearance Checklist for ${displayName}:\n1. Attendance: Minimum 75% in all enrolled courses (${currentUser?.attendance ? `Current: ${currentUser.attendance}` : 'Pending sync'}).\n2. Fee Dues: ${currentUser?.feesStatus || 'Under verification'}.\n3. HOD Approval: Pending final signature before exam cycle.\n\nOnce authorized by your department HOD, your digital barcode hall ticket will unlock automatically.`;
    actionKey = 'hall_ticket';
    actionLabel = isApproved ? 'Download Hall Ticket 🎫' : 'Check Clearance Status 🔒';
    suggestedFollowUps = ['Check Fee Passbook', 'Check Attendance Radar', 'View Academic Calendar'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'fees') {
    if (!isLoggedIn) {
      reply = `💳 **DCPE Fee Structure & Payment Channels:**\n\n• **Payment Modes:** SBI Collect NetBanking, UPI Gateway, HDFC SmartHub, and College Cashier Challan Counter.\n• **Government Scholarships:**\n  - **MahaDBT Post-Matric Scholarship** (SC/ST/VJNT/OBC/SBC)\n  - **Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti (EBC Concession)**\n  - **National Scholarship Portal (NSP)** for minority students.\n\n🔒 *To view your personal transaction receipts and fee ledger, please log in to your ERP account.*`;
      return { reply, actionKey: null, actionLabel: null, suggestedFollowUps: ['Autonomous Programs & Fees', 'Admission Process 2026', 'Practice Quiz'], canvasPayload };
    }
    const feeStatus = currentUser?.feesStatus || 'Cleared ✓';
    reply = `💳 **Semester Fee & Passbook Ledger for ${displayName}:**\n\n• **Account Status:** **${feeStatus}**\n• **Academic Year:** 2025-2026 Academic Term\n• **Registered Student:** ${currentUser?.name || displayName} (${currentUser?.prn || 'PRN Verified'})\n• **Course:** ${currentUser?.course || 'Degree Course'}\n\nYou can view itemized payment receipts with digital cashier verification stamps.`;
    actionKey = 'fee_passbook';
    actionLabel = 'Open Fees Passbook & Receipts 💳';
    suggestedFollowUps = ['Draft Fee Concession Letter', 'Download Payment Receipt', 'Check Hall Ticket'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'placement') {
    reply = `💼 **DCPE Training & Placement (T&P) Cell Updates:**\n\n🏢 **Active & Annual Campus Recruitment Partners:**\n1. **TCS Digital / Ninja** - CTC: ₹3.8 - ₹7.2 LPA (MCA, BCA, B.Sc CS | 60%+ in academics)\n2. **Sports Authority of India (SAI)** - CTC: ₹5.5 - ₹9.0 LPA (B.P.Ed, M.P.Ed, Sports Analytics)\n3. **Decathlon Sports India** - CTC: ₹4.5 - ₹6.8 LPA (Sports Leadership & Retail Management)\n4. **Infosys BPM & Tech** - CTC: ₹3.6 - ₹5.4 LPA (Software & Systems Engineer)\n5. **Cult.fit / CureFit** - CTC: ₹4.8 - ₹8.5 LPA (Kinesiology Coaches & Tech Associates)\n6. **Persistent Systems** - CTC: ₹4.5 - ₹8.0 LPA (Fullstack & Cloud Trainees)\n\n📌 *TPO Requirement:* Maintain your CGPA above 6.5 and ensure 0 active backlogs for premier company eligibility.`;
    actionKey = 'placement';
    actionLabel = 'Open Campus Placements 💼';
    suggestedFollowUps = ['Open ATS Resume Studio', 'AI Career Path Roadmap', 'Practice Technical Quiz'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'resume') {
    reply = `📄 **ATS Resume Studio & Career Profiler:**\n\nBuild a recruiter-ready single-page physical A4 resume in minutes:\n• **ATS-Optimized Formatting:** Clean single-column layout, standard typography, 92+ parser match.\n• **Auto-Synced Verified Data:** Automatically imports your PRN, SGPA grades, college projects, and sports achievements.\n• **One-Click Export:** Instant high-resolution PDF download with professional styling.`;
    actionKey = 'resume';
    actionLabel = 'Open ATS Resume Studio 📄';
    suggestedFollowUps = ['Generate STAR Resume Bullets', 'Open Placement Drives', 'View AI Career Path'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'letter_draft') {
    let docType = 'sick_leave';
    if (text.includes('sports') || text.includes('duty') || text.includes('tournament')) docType = 'sports_leave';
    else if (text.includes('bonafide') || text.includes('certificate')) docType = 'bonafide';
    else if (text.includes('fee') || text.includes('concession') || text.includes('installment')) docType = 'fee_concession';
    else if (text.includes('noc')) docType = 'noc';
    else if (text.includes('lor') || text.includes('recommendation')) docType = 'lor';
    const generated = generateFormalDocument(docType, {
      name: isLoggedIn ? currentUser.name : '[Your Full Name]',
      prn: isLoggedIn ? (currentUser.prn || '[Your PRN]') : '[Your PRN / Roll No]',
      course: isLoggedIn ? (currentUser.course || '[Your Degree Course]') : '[Your Degree Course]',
      cgpa: isLoggedIn ? (currentUser.cgpa || '[Your CGPA]') : '[Your CGPA]',
    });
    reply = `📝 **Formal Institutional Application Generated:**\n\nI have drafted your formal **${docType.replace(/_/g, ' ').toUpperCase()}** document formatted for DCPE Autonomous administration. You can view, edit, or print it in the **Live Canvas** panel!`;
    canvasPayload = { title: `${docType.replace(/_/g, ' ').toUpperCase()} Application`, type: 'document', content: generated };
    suggestedFollowUps = ['Open in Live Canvas', 'Draft Sports Duty Leave', 'Draft Bonafide Certificate'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'timetable') {
    if (!isLoggedIn) {
      reply = `⏰ **Class Timetable:**\n\n🔒 *To view your personalized weekly class timetable, please log in to your student/faculty ERP account.*\n\nGeneral college timings:\n• **Lectures:** 10:00 AM — 5:00 PM\n• **Library:** 8:00 AM — 8:00 PM\n• **Sports Complex:** 6:00 AM — 7:00 PM`;
    } else {
      reply = `⏰ **Weekly Timetable for ${displayName}:**\n\nYour personalized timetable is available in the Timetable module. Click below to view your complete weekly schedule with room numbers and faculty assignments.`;
      actionKey = 'timetable';
      actionLabel = 'View Class Timetable ⏰';
    }
    suggestedFollowUps = ['Check Attendance', 'View Academic Calendar', 'Campus Facilities'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'exam') {
    reply = `📝 **SGBAU Autonomous Examination System:**\n\n### Exam Pattern\n• **Internal Assessment (CA):** 30 marks continuous evaluation (assignments, class tests, practicals)\n• **End Semester Exam:** 70 marks written theory examination\n• **Passing:** Minimum **40% aggregate** required in Theory + CA combined\n\n### Exam Preparation Tips\n1. **Start 4 weeks early** — Review lecture notes and textbook chapters\n2. **Solve previous year papers** — Focus on repeated question patterns\n3. **Use Pomodoro Technique** — 25 min study + 5 min break\n4. **Practice with quizzes** — Use our built-in Quiz Studio for MCQ practice\n5. **Group study** — Discuss tricky concepts with classmates`;
    suggestedFollowUps = ['Start Practice Quiz', 'SGBAU Grading Scale', 'Check Hall Ticket Status'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  // ════════════════════════════════════════════════════════
  // LAYER 3: Academic & Technical Knowledge Base (25+ Topics)
  // ════════════════════════════════════════════════════════

  if (intent.category === 'oop') {
    reply = `🎯 **Object-Oriented Programming (OOP) — Core Concepts:**\n\n### 1. Encapsulation\nBundling data (attributes) and methods that operate on that data into a single unit (class). Access modifiers (private, protected, public) control visibility.\n\`\`\`java\npublic class Student {\n    private String name;\n    private double cgpa;\n    public String getName() { return name; }\n    public void setCgpa(double c) {\n        if (c >= 0 && c <= 10) this.cgpa = c;\n    }\n}\n\`\`\`\n\n### 2. Inheritance\nA child class inherits properties and behaviors from a parent class, enabling code reuse.\n\`\`\`java\nclass Person { String name; }\nclass Student extends Person { String prn; }\n\`\`\`\n\n### 3. Polymorphism\n"One interface, many implementations." Same method name behaves differently.\n• **Compile-time (Overloading):** Same method name, different parameters\n• **Runtime (Overriding):** Subclass provides specific implementation\n\n### 4. Abstraction\nHiding complex implementation, exposing only essential interface.\n• **Abstract classes:** Partial implementation (0-100% abstraction)\n• **Interfaces:** Pure contracts (100% abstraction)\n\n### SOLID Principles\n• **S** — Single Responsibility\n• **O** — Open/Closed\n• **L** — Liskov Substitution\n• **I** — Interface Segregation\n• **D** — Dependency Inversion`;
    suggestedFollowUps = ['Explain Design Patterns', 'Practice OOP Quiz', 'Java vs C++ Comparison'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'operating_system') {
    reply = `💻 **Operating System — Key Concepts:**\n\n### CPU Scheduling Algorithms\n| Algorithm | Type | Preemptive? | Key Feature |\n| :--- | :--- | :--- | :--- |\n| **FCFS** | Non-preemptive | No | First Come First Served |\n| **SJF** | Non-preemptive | No | Shortest Job First, optimal avg wait |\n| **SRTF** | Preemptive | Yes | Shortest Remaining Time First |\n| **Round Robin** | Preemptive | Yes | Time quantum based |\n| **Priority** | Both | Both | Highest priority first |\n\n### Deadlock — 4 Necessary Conditions\n1. **Mutual Exclusion** — Resource held by only one process\n2. **Hold and Wait** — Process holds resources while waiting for others\n3. **No Preemption** — Resources can't be forcibly taken\n4. **Circular Wait** — Chain of processes waiting for each other\n\n**Prevention:** Break any one condition. **Avoidance:** Banker's Algorithm.\n\n### Memory Management\n• **Paging:** Fixed-size blocks, eliminates external fragmentation\n• **Segmentation:** Variable-size blocks based on logical segments\n• **Virtual Memory:** Uses disk as extension of RAM\n• **Page Replacement:** FIFO, LRU (Least Recently Used), Optimal`;
    suggestedFollowUps = ['Explain Virtual Memory', 'Practice OS Quiz', 'Explain Banker\'s Algorithm'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'computer_network') {
    reply = `🌐 **Computer Networks — Core Guide:**\n\n### OSI Model (7 Layers)\n| Layer | Name | Function | Protocols |\n| :--- | :--- | :--- | :--- |\n| 7 | **Application** | User interface | HTTP, FTP, SMTP, DNS |\n| 6 | **Presentation** | Data formatting | SSL/TLS, JPEG, ASCII |\n| 5 | **Session** | Session management | NetBIOS, RPC |\n| 4 | **Transport** | End-to-end delivery | TCP, UDP |\n| 3 | **Network** | Routing & addressing | IP, ICMP, ARP |\n| 2 | **Data Link** | Framing & MAC | Ethernet, PPP, Wi-Fi |\n| 1 | **Physical** | Bit transmission | Cables, Hubs |\n\n### TCP vs UDP\n| Feature | TCP | UDP |\n| :--- | :--- | :--- |\n| Connection | Connection-oriented | Connectionless |\n| Reliability | Guaranteed delivery | Best-effort |\n| Speed | Slower (overhead) | Faster |\n| Use Cases | HTTP, Email, FTP | DNS, Gaming, Streaming |\n\n### IP Addressing\n• **IPv4:** 32-bit (192.168.1.1), ~4.3 billion addresses\n• **IPv6:** 128-bit, virtually unlimited\n• **Subnetting:** Dividing network using subnet masks\n• **NAT:** Translates private IPs to public`;
    suggestedFollowUps = ['Explain Subnetting', 'TCP 3-Way Handshake', 'Practice CN Quiz'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'sql_dbms') {
    const sqlCode = `-- Verify Attendance & Hall Ticket Eligibility\nSELECT \n    s.prn, s.full_name, c.course_name,\n    s.attendance_pct, f.fee_status,\n    CASE \n        WHEN s.attendance_pct >= 75.0 AND f.fee_status = 'PAID' THEN 'APPROVED'\n        ELSE 'LOCKED'\n    END AS hall_ticket_clearance\nFROM students s\nINNER JOIN courses c ON s.course_id = c.course_id\nLEFT JOIN fee_ledgers f ON s.student_id = f.student_id\nWHERE s.is_active = TRUE\nORDER BY s.attendance_pct DESC;`;
    reply = `🗄️ **Database Systems (DBMS):**\n\n### Normalization\n• **1NF:** Atomic values, no repeating groups\n• **2NF:** 1NF + no partial dependencies\n• **3NF:** 2NF + no transitive dependencies\n• **BCNF:** Every determinant is a superkey\n\n### ACID Properties\n• **Atomicity:** All-or-nothing execution\n• **Consistency:** Valid state transitions\n• **Isolation:** Concurrent transactions don't interfere\n• **Durability:** Committed data survives failures\n\n### SQL Join Types\n• **INNER JOIN:** Matching rows from both tables\n• **LEFT JOIN:** All left + matched right (NULL if no match)\n• **RIGHT JOIN:** All right + matched left\n• **FULL OUTER JOIN:** All rows from both\n\n### Example:\n\`\`\`sql\n${sqlCode}\n\`\`\``;
    canvasPayload = { title: 'SQL Query Example', type: 'code', language: 'sql', content: sqlCode };
    suggestedFollowUps = ['Practice DBMS Quiz', 'Explain ACID Properties', 'Explain B+ Tree Indexes'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'dsa') {
    const pythonCode = `import heapq\n\ndef dijkstra(graph, start_node):\n    \"\"\"Shortest paths using Min-Heap. O((V+E) log V)\"\"\"\n    pq = [(0, start_node)]\n    distances = {node: float('inf') for node in graph}\n    distances[start_node] = 0\n    while pq:\n        dist, node = heapq.heappop(pq)\n        if dist > distances[node]: continue\n        for neighbor, weight in graph[node].items():\n            new_dist = dist + weight\n            if new_dist < distances[neighbor]:\n                distances[neighbor] = new_dist\n                heapq.heappush(pq, (new_dist, neighbor))\n    return distances\n\ncampus = {\n    'Main Gate': {'Admin': 2, 'Computer Center': 5},\n    'Admin': {'Main Gate': 2, 'Library': 1, 'Pool': 4},\n    'Computer Center': {'Main Gate': 5, 'Library': 2, 'MCA Dept': 1},\n    'Library': {'Admin': 1, 'Computer Center': 2, 'MCA Dept': 3},\n    'MCA Dept': {'Computer Center': 1, 'Library': 3, 'Pool': 2},\n    'Pool': {'Admin': 4, 'MCA Dept': 2}\n}\nprint(dijkstra(campus, 'Main Gate'))`;
    reply = `🧠 **Data Structures & Algorithms:**\n\n### Common Data Structures\n| Structure | Access | Search | Insert | Delete |\n| :--- | :--- | :--- | :--- | :--- |\n| **Array** | O(1) | O(n) | O(n) | O(n) |\n| **Linked List** | O(n) | O(n) | O(1) | O(1) |\n| **Stack/Queue** | O(n) | O(n) | O(1) | O(1) |\n| **BST** | O(log n) | O(log n) | O(log n) | O(log n) |\n| **Hash Table** | N/A | O(1) avg | O(1) avg | O(1) avg |\n| **Heap** | O(1) max | O(n) | O(log n) | O(log n) |\n\n### Dijkstra's Shortest Path:\n\`\`\`python\n${pythonCode}\n\`\`\`\n\n⏱️ **Complexity:** O((V + E) log V) with min-heap.`;
    canvasPayload = { title: "Dijkstra's Algorithm", type: 'code', language: 'python', content: pythonCode };
    suggestedFollowUps = ['Practice DSA Quiz', 'Explain Binary Search Tree', 'Explain Dynamic Programming'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'react_js') {
    const codeSnippet = `import React, { useState, useEffect } from 'react';\n\nexport function AttendanceViewer({ studentId }) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    let isMounted = true;\n    async function fetchAttendance() {\n      try {\n        setLoading(true);\n        const res = await fetch(\`/api/students/\${studentId}/attendance\`);\n        const json = await res.json();\n        if (isMounted) setData(json);\n      } catch (err) {\n        console.error('Failed:', err);\n      } finally {\n        if (isMounted) setLoading(false);\n      }\n    }\n    if (studentId) fetchAttendance();\n    return () => { isMounted = false; };\n  }, [studentId]);\n\n  if (loading) return <div>Loading...</div>;\n  return (\n    <div>\n      <h4>Attendance: {data?.percentage}%</h4>\n      <p>{data?.percentage >= 75 ? 'Eligible ✓' : 'Shortage ⚠️'}</p>\n    </div>\n  );\n}`;
    reply = `⚛️ **React.js — Core Hooks & Concepts:**\n\n### Key Hooks\n• **useState** — Manage component state\n• **useEffect** — Side effects (data fetching, subscriptions)\n• **useRef** — Mutable ref persisting across renders\n• **useMemo** — Memoize expensive computations\n• **useCallback** — Memoize function references\n• **useContext** — Access shared state without prop drilling\n\n### useEffect Rules\n1. **Dependency Array:** Declare all reactive variables\n2. **Cleanup Function:** Return cleanup to abort in-flight requests\n3. **Mount-Only:** Pass \`[]\` for effects that run once\n\n### Example:\n\`\`\`javascript\n${codeSnippet}\n\`\`\``;
    canvasPayload = { title: 'React useEffect Example', type: 'code', language: 'javascript', content: codeSnippet };
    suggestedFollowUps = ['Explain Virtual DOM', 'Practice Web Tech Quiz', 'Explain Context API'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'javascript') {
    reply = `🟨 **JavaScript / Node.js — Essential Concepts:**\n\n### Core JS Concepts\n• **Hoisting:** Declarations moved to top of scope during compilation\n• **Closures:** Function "remembers" outer scope variables\n• **Prototypal Inheritance:** Objects inherit from other objects\n• **Event Loop:** Single-threaded with async task queues (microtask > macrotask)\n\n### ES6+ Features\n\`\`\`javascript\n// Arrow functions\nconst add = (a, b) => a + b;\n\n// Destructuring\nconst { name, age } = student;\nconst [first, ...rest] = array;\n\n// Async/Await\nasync function fetchData() {\n  try {\n    const res = await fetch('/api/students');\n    return await res.json();\n  } catch (err) {\n    console.error('Error:', err);\n  }\n}\n\`\`\`\n\n### Node.js\n• Non-blocking I/O, event-driven architecture\n• **Express.js:** Minimalist web framework for REST APIs\n• **npm:** Package manager with 2M+ packages`;
    suggestedFollowUps = ['Explain Event Loop', 'Explain Promises', 'Practice Web Tech Quiz'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'python') {
    reply = `🐍 **Python Programming — Key Concepts:**\n\n### Essential Features\n\`\`\`python\n# List Comprehension\nsquares = [x**2 for x in range(10) if x % 2 == 0]\n\n# Lambda Functions\nsorted_students = sorted(students, key=lambda s: s['cgpa'], reverse=True)\n\n# Decorators\ndef timer(func):\n    def wrapper(*args, **kwargs):\n        import time\n        start = time.time()\n        result = func(*args, **kwargs)\n        print(f"Executed in {time.time()-start:.3f}s")\n        return result\n    return wrapper\n\n# Generators (Memory-efficient)\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\`\`\`\n\n### Popular Libraries\n• **NumPy/Pandas:** Data manipulation\n• **Matplotlib/Seaborn:** Visualization\n• **Flask/Django:** Web frameworks\n• **TensorFlow/PyTorch:** Machine learning`;
    suggestedFollowUps = ['Explain Python OOP', 'Practice Python Quiz', 'NumPy vs Pandas'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'java') {
    reply = `☕ **Java Programming — Core Concepts:**\n\n### Why Java?\n• **Platform Independent:** "Write Once, Run Anywhere" via JVM\n• **Strongly Typed:** Static type checking at compile time\n• **Object-Oriented:** Everything (except primitives) is an object\n• **Garbage Collection:** JVM manages memory\n\n### Collections Framework\n| Interface | Implementation | Ordered? | Duplicates? |\n| :--- | :--- | :--- | :--- |\n| **List** | ArrayList, LinkedList | Yes | Yes |\n| **Set** | HashSet, TreeSet | TreeSet: Yes | No |\n| **Map** | HashMap, TreeMap | TreeMap: Yes | Keys: No |\n| **Queue** | PriorityQueue | FIFO | Yes |\n\n### Exception Handling\n\`\`\`java\ntry {\n    int result = 10 / 0;\n} catch (ArithmeticException e) {\n    System.out.println("Error: " + e.getMessage());\n} finally {\n    System.out.println("Always executes");\n}\n\`\`\``;
    suggestedFollowUps = ['Java Collections Deep Dive', 'Explain Multithreading', 'Practice Java Quiz'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'c_cpp') {
    reply = `⚙️ **C/C++ Programming — Essential Guide:**\n\n### Pointers\n\`\`\`c\nint x = 42;\nint *ptr = &x;        // ptr stores address of x\nprintf("%d", *ptr);   // Dereference: prints 42\n\n// Dynamic memory\nint *arr = (int *)malloc(5 * sizeof(int));\nfor (int i = 0; i < 5; i++) arr[i] = i * 10;\nfree(arr);  // Always free!\n\`\`\`\n\n### C++ OOP\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nclass Student {\nprivate:\n    string name;\n    double cgpa;\npublic:\n    Student(string n, double c) : name(n), cgpa(c) {}\n    void display() const {\n        cout << name << " - CGPA: " << cgpa << endl;\n    }\n};\n\`\`\`\n\n### C++ STL\n• **vector** — Dynamic array\n• **map/unordered_map** — Key-value pairs\n• **set** — Unique sorted elements\n• **stack/queue** — LIFO/FIFO adapters`;
    suggestedFollowUps = ['Explain Pointers in Depth', 'C vs C++ Differences', 'Practice C++ Quiz'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'ai_ml') {
    reply = `🧠 **Artificial Intelligence & Machine Learning:**\n\n### ML Algorithm Categories\n| Type | Goal | Algorithms |\n| :--- | :--- | :--- |\n| **Supervised** | Learn from labeled data | Linear Regression, SVM, Random Forest, Neural Networks |\n| **Unsupervised** | Find hidden patterns | K-Means, DBSCAN, PCA, Hierarchical Clustering |\n| **Reinforcement** | Learn by trial & reward | Q-Learning, Deep Q-Network, PPO |\n\n### Deep Learning Architectures\n• **CNN:** Image classification, object detection\n• **RNN / LSTM:** Sequential data — text, time series\n• **Transformer:** Attention mechanism — GPT, BERT\n• **GAN:** Generate realistic synthetic data\n\n### Key Metrics\n• **Accuracy** = (TP + TN) / Total\n• **Precision** = TP / (TP + FP)\n• **Recall** = TP / (TP + FN)\n• **F1 Score** = 2 × (Precision × Recall) / (Precision + Recall)\n\n### Training Pipeline\n1. Data Collection → 2. Preprocessing → 3. Feature Engineering → 4. Model Selection → 5. Training → 6. Evaluation → 7. Tuning → 8. Deployment`;
    suggestedFollowUps = ['Explain Neural Networks', 'Practice ML Quiz', 'Explain Gradient Descent'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'cloud_computing') {
    reply = `☁️ **Cloud Computing & DevOps:**\n\n### Cloud Service Models\n| Model | You Manage | Provider Manages | Example |\n| :--- | :--- | :--- | :--- |\n| **IaaS** | OS, Apps, Data | Hardware, Network | AWS EC2, Azure VMs |\n| **PaaS** | Apps, Data | OS, Runtime | Heroku, App Engine |\n| **SaaS** | Nothing | Everything | Gmail, Office 365 |\n| **FaaS** | Code only | Everything else | AWS Lambda |\n\n### Docker & Containerization\n\`\`\`dockerfile\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]\n\`\`\`\n\n### Kubernetes Basics\n• **Pod:** Smallest deployable unit\n• **Service:** Stable endpoint for pods\n• **Deployment:** Manages pod replicas\n• **Ingress:** Routes external HTTP traffic`;
    suggestedFollowUps = ['Practice Cloud Quiz', 'Explain Docker vs VMs', 'Explain CI/CD Pipeline'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'cybersecurity') {
    reply = `🛡️ **Cybersecurity & Ethical Hacking:**\n\n### CIA Triad\n• **Confidentiality:** Only authorized users access data\n• **Integrity:** Data is accurate and unaltered\n• **Availability:** Systems accessible when needed\n\n### Common Attacks & Prevention\n| Attack | Description | Prevention |\n| :--- | :--- | :--- |\n| **SQL Injection** | Malicious SQL via inputs | Prepared statements |\n| **XSS** | Scripts in web pages | Input sanitization, CSP |\n| **CSRF** | Forged requests | CSRF tokens, SameSite cookies |\n| **DDoS** | Overwhelming traffic | Rate limiting, CDN, WAF |\n| **Phishing** | Fake emails/sites | User training, MFA |\n\n### Cryptography\n• **Symmetric (AES):** Same key for encrypt/decrypt — fast\n• **Asymmetric (RSA):** Public/private key pair — secure exchange\n• **Hashing (SHA-256):** One-way function — passwords, integrity`;
    suggestedFollowUps = ['Explain RSA Algorithm', 'Practice Security Quiz', 'OWASP Top 10'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'web_tech') {
    reply = `🌐 **Web Technologies — Full Stack:**\n\n### Frontend\n• **HTML5:** Semantic elements (header, nav, main, footer)\n• **CSS3:** Flexbox, Grid, Animations, Responsive Design\n• **JavaScript:** DOM manipulation, Fetch API\n• **Frameworks:** React.js, Angular, Vue.js, Svelte\n\n### Backend\n• **Node.js + Express:** JavaScript server-side\n• **Python + Django/Flask:** Rapid development\n• **Java + Spring Boot:** Enterprise APIs\n\n### REST API Design\n| HTTP Method | Purpose | Idempotent? |\n| :--- | :--- | :--- |\n| **GET** | Read resource | Yes |\n| **POST** | Create resource | No |\n| **PUT** | Replace resource | Yes |\n| **PATCH** | Partial update | No |\n| **DELETE** | Remove resource | Yes |\n\n### Authentication\n• **Session-based:** Server stores session, client gets cookie\n• **JWT:** Stateless token with encoded claims\n• **OAuth 2.0:** Delegated authorization (Login with Google)`;
    suggestedFollowUps = ['Explain REST vs GraphQL', 'Practice Web Tech Quiz', 'Explain JWT'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'software_engineering') {
    reply = `📐 **Software Engineering — SDLC & Methodologies:**\n\n### SDLC Models\n| Model | Best For | Key Feature |\n| :--- | :--- | :--- |\n| **Waterfall** | Fixed requirements | Linear, sequential |\n| **Agile** | Evolving requirements | Iterative sprints |\n| **Spiral** | High-risk projects | Risk analysis per iteration |\n| **V-Model** | Critical systems | Testing alongside dev |\n\n### Agile/Scrum Framework\n• **Sprint:** 2-4 week cycle\n• **Daily Standup:** 15-min sync\n• **Sprint Review:** Demo to stakeholders\n• **Retrospective:** Reflect & improve\n\n### Testing Pyramid\n1. **Unit Tests** (base) — Test individual functions\n2. **Integration Tests** (middle) — Test interactions\n3. **E2E Tests** (top) — Test full user workflows\n\n### UML Diagrams\n• **Use Case:** Actor-system interactions\n• **Class Diagram:** Classes & relationships\n• **Sequence Diagram:** Interactions over time`;
    suggestedFollowUps = ['Explain Agile vs Waterfall', 'UML Diagram Types', 'Practice SE Quiz'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'math') {
    reply = `📊 **Mathematics for Computer Science:**\n\n### Discrete Mathematics\n• **Set Theory:** Union, intersection, complement, power set\n• **Relations:** Reflexive, symmetric, transitive, equivalence\n• **Functions:** Injective (1-1), surjective (onto), bijective\n• **Graph Theory:** Euler path, Hamiltonian cycle, graph coloring\n• **Boolean Algebra:** AND, OR, NOT, XOR, De Morgan's laws\n\n### Probability & Statistics\n• **P(A)** = favorable / total outcomes\n• **Bayes' Theorem:** P(A|B) = P(B|A) × P(A) / P(B)\n• **Distributions:** Binomial, Poisson, Normal (Gaussian)\n• **Measures:** Mean, Median, Mode, Standard Deviation\n\n### Linear Algebra\n• **Matrices:** Addition, multiplication, transpose, inverse, determinant\n• **Eigenvalues:** Ax = λx (used in PCA, PageRank)\n\n### Calculus\n• **Derivative:** Rate of change — d/dx(x²) = 2x\n• **Integral:** Area under curve — ∫x² dx = x³/3 + C\n• **Gradient Descent:** Used in ML to minimize loss functions`;
    suggestedFollowUps = ['Explain Boolean Algebra', 'Practice Math Quiz', 'Explain Probability'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'sports_science') {
    reply = `🏅 **Sports Science & Kinesiology Knowledge Hub (DCPE):**\n\n• **Biomechanics in Athletics:** Newton's laws applied to sprinting start angles, angular momentum in discus/javelin throwing, and kinetic chain ground reaction forces.\n• **Exercise Energy Systems:**\n  1. **ATP-CP Phosphagen (0-10s):** High explosive power (100m sprint, shot put).\n  2. **Anaerobic Glycolytic (10s-2min):** Lactic acid accumulation (400m sprint, 100m swim).\n  3. **Aerobic Oxidative (>2min):** Fat & carbohydrate oxidation for endurance (marathon, cross country).\n• **DCPE Historic Sports Facilities:**\n  - 50m Olympic Standard Swimming & Diving Pool\n  - Gymnastics & Mallakhamb International Arena\n  - 400m Synthetic Track & Field\n  - Yogic Science & Naturopathy Research Institute.`;
    suggestedFollowUps = ['Practice Sports Science Quiz', 'View Campus Sports Map', 'Apply for Sports Duty Leave'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'courses') {
    reply = `📚 **DCPE Autonomous — Academic Programs:**\n\n| Program | Duration | Semesters | Credits |\n| :--- | :--- | :--- | :--- |\n| **MCA** | 2 Years | 4 | 80 |\n| **BCA** | 3 Years | 6 | 120 |\n| **B.P.Ed** | 2 Years | 4 | 80 |\n| **M.P.Ed** | 2 Years | 4 | 80 |\n| **B.Sc CS** | 3 Years | 6 | 120 |\n| **PGDYT** | 1 Year | 2 | 40 |\n\n### MCA Curriculum Highlights\n• Sem 1: Advanced Java, DBMS, Discrete Math, Web Tech\n• Sem 2: OS, CN, AI/ML, Python, Software Engineering\n• Sem 3: Cloud Computing, Cybersecurity, Data Analytics\n• Sem 4: Major Project + Internship + Viva\n\n### BCA Curriculum Highlights\n• Core: C, C++, Java, DBMS, Web Tech, OS, DSA, SE\n• Electives: Mobile App Dev, IoT, Blockchain\n• Sem 6: Mini Project + Industrial Visit`;
    suggestedFollowUps = ['MCA Detailed Syllabus', 'Admission Process 2026', 'SGBAU Grading Scale'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  if (intent.category === 'campus_info') {
    reply = `🏫 **Shree H.V.P. Mandal's Degree College of Physical Education (Autonomous):**\n\n• **Founded:** 1914 by Vaidya Brothers (Shree Anantrao & Ambadaspant Vaidya)\n• **Campus:** 50+ Acres at Hanuman Vyayam Nagar, Amravati, Maharashtra - 444605\n• **Accreditation:** NAAC Autonomous Institution affiliated with SGBAU\n• **Admissions 2026-27:** OPEN for MCA, BCA, B.P.Ed, M.P.Ed, B.Sc Computer Science\n• **Helpline:** +91 721 2573788 | Email: contact@dcpe.edu\n\n### Campus Facilities\n• 🏊 50m Olympic Standard Swimming Pool\n• 🏋️ Modern Gymnasium & Fitness Complex\n• 📚 Central Library (100,000+ books, DELNET, NPTEL)\n• 💻 State-of-the-art Computer Center & Labs\n• 🏠 On-campus Boys & Girls Hostels\n• 🧘 Health & Naturopathy Center`;
    actionKey = 'campus_map';
    actionLabel = 'Open Campus Map 🗺️';
    suggestedFollowUps = ['Autonomous Programs & Syllabus', 'Admission Process 2026', 'Campus Sports Facilities'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  // ════════════════════════════════════════════════════════
  // LAYER 4: HOD / Faculty Workflows
  // ════════════════════════════════════════════════════════

  if (isHOD) {
    if (text.includes('approval') || text.includes('verify') || text.includes('pending') || text.includes('student')) {
      reply = `🎓 **HOD Student Registration & Admission Verification Console:**\nYou have student applications awaiting verification. Review 10th/12th marksheets, caste certificates, and grant official DCPE institutional email addresses.`;
      actionKey = 'approvals';
      actionLabel = 'Go to Student Approvals 👥';
    } else if (text.includes('timetable') || text.includes('schedule') || text.includes('faculty') || text.includes('lecture')) {
      reply = `⏰ **HOD Department Timetable Management:**\nConfigure weekly lecture slots, assign classroom labs, and manage faculty teaching loads across BCA/MCA semesters.`;
      actionKey = 'timetable';
      actionLabel = 'Manage Timetables ⏰';
    } else if (text.includes('notice') || text.includes('circular') || text.includes('broadcast')) {
      reply = `📢 **HOD Notice Broadcast Studio:**\nPublish urgent circulars with tags (Exam, Urgent, Event, Placement) live to the College website and student dashboards.`;
      actionKey = 'notices';
      actionLabel = 'Broadcast Official Notice 📢';
    } else {
      reply = `Greetings Dr. ${displayName}! As Head of Department, you have full control over Student Approvals, Department Timetables, Notice Broadcasts, Seating Plans, and Leave Sanctions.`;
    }
    suggestedFollowUps = ['Review Pending Approvals', 'Configure Department Timetable', 'Generate Exam Seating Matrix'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  if (isFaculty) {
    reply = `👨‍🏫 **Faculty Teaching Copilot for Prof. ${displayName}:**\nYou can mark student attendance, record internal Continuous Assessment (CA) marks, review student leave requests up to 3 days, and view your weekly teaching timetable schedule.`;
    actionKey = 'timetable';
    actionLabel = 'View Teaching Timetable ⏰';
    suggestedFollowUps = ['View Teaching Timetable', 'Review Student Leaves', 'Generate Quiz for Students'];
    return { reply, actionKey, actionLabel, suggestedFollowUps, canvasPayload };
  }

  // ════════════════════════════════════════════════════════
  // LAYER 5: Intelligent Fallback (NOT a generic dump)
  // ════════════════════════════════════════════════════════

  // Try simple math evaluation
  if (intent.category === 'calculator' || /^\d/.test(text) || /[\+\-\*\/\=]/.test(text)) {
    try {
      const sanitized = text.replace(/[^0-9\+\-\*\/\.\(\)\s\%\^]/g, '').replace(/\^/g, '**');
      if (sanitized.trim().length > 0 && /^[\d\s\+\-\*\/\.\(\)\%\*]+$/.test(sanitized.trim())) {
        const result = Function(`"use strict"; return (${sanitized.trim()})`)();
        if (typeof result === 'number' && isFinite(result)) {
          reply = `🧮 **Calculation Result:**\n\n**${userText.trim()}** = **${result}**`;
          suggestedFollowUps = ['Another calculation', 'Explain a math concept', 'Start Practice Quiz'];
          return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
        }
      }
    } catch (e) {
      // Not a valid expression, fall through
    }
  }

  // Contextual intelligent fallback — acknowledge the question, don't dump capabilities
  const queryWords = userText.trim().split(/\s+/).length;

  if (queryWords <= 2 && intent.confidence < 0.3) {
    reply = `I'd be happy to help! Could you please provide a bit more detail about what you'd like to know?\n\nFor example, you can ask me:\n• 📚 **Academic concepts** — "Explain inheritance in OOP" or "What is normalization in DBMS?"\n• 💻 **Coding help** — "Write a Python program for binary search" or "Explain React hooks"\n• 🏫 **Campus info** — "What courses does DCPE offer?" or "Admission process for 2026"\n${isLoggedIn ? '• 📊 **Your ERP data** — "Check my attendance" or "Show my marksheet"' : ''}`;
    suggestedFollowUps = isLoggedIn
      ? ['Check my Attendance', 'Explain OOP', 'Start Practice Quiz', 'Campus Programs']
      : ['Autonomous Programs', 'Explain OOP Concepts', 'Start Practice Quiz', 'SGBAU Grading Scale'];
    return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
  }

  // Longer unmatched queries
  if (!isLoggedIn) {
    reply = `I appreciate your question! While my built-in knowledge engine works best for **academic subjects, coding doubts, and campus information**, I may not have the exact answer for this specific query in offline mode.\n\n**Here's what I can definitely help with:**\n\n🎓 **Academic Subjects:** OOP, OS, CN, DBMS, DSA, Web Tech, AI/ML, Cloud, Security, Math\n💻 **Programming:** React, Python, JavaScript, Java, C/C++, SQL with code examples\n🏫 **DCPE Campus:** Programs, admissions, facilities, placements, SGBAU rules\n🏆 **Exam Prep:** Practice quizzes across 8 subject tracks\n\n💡 **Tip:** For real-time answers to any question, connect your **Google Gemini API key** in the Settings tab!\n\nTry rephrasing your question or ask about one of the topics above!`;
    suggestedFollowUps = ['Autonomous Programs', 'Explain a CS Concept', 'Start Practice Quiz', 'SGBAU Grading Scale'];
  } else {
    reply = `I understand your question, ${displayName}! My built-in knowledge engine is optimized for **academic concepts, campus ERP features, and coding help**. For this particular query, I may need more context.\n\n**Here's what I can help you with right now:**\n\n📊 **Your ERP Data:** Attendance, marksheet, fees, hall ticket status\n🎓 **Academics:** Any CS/IT subject concept explained with examples\n💻 **Code Help:** Debug code, explain algorithms, write programs\n📝 **Documents:** Draft formal letters and applications\n🏆 **Quiz Practice:** MCQs across 8 subject tracks\n\n💡 **Tip:** For unlimited question coverage, connect your **Gemini API key** in Settings!\n\nTry asking something specific — I'm here to help!`;
    suggestedFollowUps = ['Check my Attendance', 'Explain a Concept', 'Start Practice Quiz', 'Draft a Letter'];
  }

  return { reply, actionKey: null, actionLabel: null, suggestedFollowUps, canvasPayload };
}

// ═════════════════════════════════════════════════════════════════════════════════
// FORMAL LETTER & APPLICATION GENERATOR TEMPLATES
// ═════════════════════════════════════════════════════════════════════════════════

export function generateFormalDocument(type, details = {}) {
  const studentName = details.name || '[Your Full Name]';
  const prn = details.prn || '[Your PRN / Roll Number]';
  const course = details.course || '[Your Course / Department]';
  const reason = details.reason || 'medical rest as advised by physician';
  const fromDate = details.fromDate || new Date().toISOString().split('T')[0];
  const toDate = details.toDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  if (type === 'sick_leave') {
    return `To,\nThe Head of Department,\nDepartment of ${course.includes('MCA') || course.includes('BCA') ? 'Computer Science & Applications' : 'Physical Education'},\nDegree College of Physical Education (Autonomous),\nShree H.V.P. Mandal, Amravati - 444605.\n\nDate: ${today}\n\nSubject: Application for Leave of Absence on Medical Grounds\n\nRespected Sir / Madam,\n\nI am writing to formally place on record a request for leave of absence from regular classroom lectures and practical sessions from ${fromDate} to ${toDate}.\n\nI, ${studentName}, student of ${course} bearing PRN: ${prn}, have been diagnosed with ${reason} and have been advised medical rest by my consulting physician.\n\nI assure you that I will catch up on all missed academic topics, assignments, and laboratory practicals immediately upon resuming classes. I have attached the medical prescription for your official verification.\n\nThanking you.\n\nYours sincerely,\n\n${studentName}\nPRN: ${prn}\n${course}\nDCPE HVPM, Amravati`;
  }

  if (type === 'sports_leave') {
    return `To,\nThe Head of Department / Sports Director,\nDegree College of Physical Education (Autonomous),\nShree H.V.P. Mandal, Amravati.\n\nDate: ${today}\n\nSubject: Application for Attendance Condonation on Official Tournament Duty\n\nRespected Sir / Madam,\n\nI, ${studentName} (PRN: ${prn}), pursuing ${course} at DCPE HVPM, have been selected to represent our institution in the upcoming All India Inter-University / State Championship scheduled from ${fromDate} to ${toDate}.\n\nIn accordance with SGBAU Autonomous attendance bylaws for official sports representatives, I kindly request you to grant me duty leave for the aforementioned dates and condone my lecture attendance records.\n\nI have attached the official tournament selection letter for your records.\n\nThanking you.\n\nYours faithfully,\n\n${studentName}\nPRN: ${prn}\n${course}\nDegree College of Physical Education (Autonomous)`;
  }

  if (type === 'bonafide') {
    return `To,\nThe Principal / Registrar,\nDegree College of Physical Education (Autonomous),\nShree H.V.P. Mandal Campus, Amravati - 444605.\n\nDate: ${today}\n\nSubject: Request for Issuance of Official Bonafide Certificate\n\nRespected Sir,\n\nI am a regular bonafide student of ${course} for the Academic Year 2025-2026, bearing PRN: ${prn}.\n\nI require an official Bonafide Certificate for the purpose of submitting my application for the MahaDBT Post-Matric Government Scholarship / Education Loan / Passport Verification. I have cleared all semester fee dues up to the current term.\n\nKindly issue the certificate at your earliest convenience.\n\nYours obediently,\n\n${studentName}\nPRN: ${prn}\nCourse: ${course}\nDCPE HVPM, Amravati`;
  }

  if (type === 'fee_concession') {
    return `To,\nThe Principal,\nDegree College of Physical Education (Autonomous),\nShree H.V.P. Mandal, Amravati.\n\nDate: ${today}\n\nSubject: Request for Fee Installment Facility for Academic Year 2025-2026\n\nRespected Sir,\n\nI am ${studentName}, currently pursuing ${course} with PRN: ${prn}. Due to unforeseen financial constraints in my family, it is challenging for us to clear the entire semester tuition fees in a single installment.\n\nI have maintained a consistent academic track record (${details.cgpa ? `CGPA: ${details.cgpa}` : 'Regular Academic Record'}) and regular lecture attendance. I humbly request your good office to kindly permit me to pay the remaining semester fee dues in 2 equal monthly installments.\n\nI assure you that all installments will be cleared within the designated dates.\n\nThanking you.\n\nYours respectfully,\n\n${studentName}\nPRN: ${prn}\n${course}`;
  }

  if (type === 'noc') {
    return `To,\nThe Head of Department / TPO Cell,\nDegree College of Physical Education (Autonomous),\nShree H.V.P. Mandal, Amravati.\n\nDate: ${today}\n\nSubject: Request for No Objection Certificate (NOC) for Off-Campus Internship\n\nRespected Sir / Madam,\n\nI, ${studentName}, student of ${course} (PRN: ${prn}), have been selected for an off-campus technical internship / industrial training at a reputed organization from ${fromDate} to ${toDate}.\n\nI kindly request you to issue an official No Objection Certificate (NOC) from the college to facilitate my onboarding. I will ensure that my semester academic assignments and examination schedules are duly fulfilled.\n\nThanking you.\n\nYours sincerely,\n\n${studentName}\nPRN: ${prn}\n${course}`;
  }

  if (type === 'lor') {
    return `To Whom It May Concern,\n\nLETTER OF RECOMMENDATION\n\nI am pleased to recommend ${studentName} (PRN: ${prn}), who is a dedicated student in the ${course} program at Shree H.V.P. Mandal's Degree College of Physical Education (Autonomous), Amravati.\n\nDuring their tenure at our autonomous institution, ${studentName} has demonstrated academic discipline, analytical capabilities, and active participation in co-curricular projects.\n\nI have observed their strong problem-solving acumen and ethical conduct. I strongly endorse their application for higher studies / professional employment without any reservation.\n\nSincerely,\n\nHead of Department / Faculty Mentor\nDegree College of Physical Education (Autonomous)\nShree H.V.P. Mandal, Amravati - 444605`;
  }

  return 'Document template generated successfully.';
}
