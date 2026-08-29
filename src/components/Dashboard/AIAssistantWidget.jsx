import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, X, Send, Sparkles, User, Volume2, VolumeX, Mic, MicOff,
  BookOpen, Calendar, CreditCard, Clock, Award, ShieldAlert,
  CheckCircle2, HelpCircle, RefreshCw, Trophy, Flame, Play
} from 'lucide-react';
import './Dashboard.css';

/* ═══════════════════════════════════════════════════════════════
   PRACTICE QUIZ DATA BANK
   ═══════════════════════════════════════════════════════════════ */
const QUIZ_BANK = {
  cloud: {
    title: 'Cloud Computing & Virtualization',
    code: 'MCA-501',
    questions: [
      {
        q: 'Which cloud deployment model is operated solely for a single organization?',
        options: ['Public Cloud', 'Private Cloud', 'Community Cloud', 'Hybrid Cloud'],
        correct: 1,
        explanation: 'Private cloud infrastructure is provisioned for exclusive use by a single organization.',
      },
      {
        q: 'What type of cloud service model is AWS EC2 or Google Compute Engine?',
        options: ['SaaS', 'PaaS', 'IaaS', 'FaaS'],
        correct: 2,
        explanation: 'IaaS (Infrastructure as a Service) provides raw compute, virtual machines, and storage.',
      },
      {
        q: 'Which hypervisor runs directly on bare-metal hardware without an underlying OS?',
        options: ['Type 2 Hypervisor', 'Type 1 Bare-Metal Hypervisor', 'Container Engine', 'KVM User Module'],
        correct: 1,
        explanation: 'Type 1 hypervisors (ESXi, Xen) run directly on host hardware for maximum virtualization performance.',
      },
    ],
  },
  ml: {
    title: 'Machine Learning & Neural Networks',
    code: 'MCA-502',
    questions: [
      {
        q: 'Which algorithm is typically used for classification tasks with a non-linear decision boundary?',
        options: ['Linear Regression', 'Support Vector Machine (RBF Kernel)', 'K-Means Clustering', 'Apriori Algorithm'],
        correct: 1,
        explanation: 'SVM with RBF kernel transforms data into higher dimensions for non-linear classification.',
      },
      {
        q: 'What activation function is commonly used in hidden layers of Deep Neural Networks to prevent vanishing gradients?',
        options: ['Sigmoid', 'Softmax', 'ReLU (Rectified Linear Unit)', 'Tanh'],
        correct: 2,
        explanation: 'ReLU f(x) = max(0, x) prevents vanishing gradients and computes efficiently.',
      },
      {
        q: 'Which metric measures the proportion of actual positives that were correctly identified by the model?',
        options: ['Precision', 'Recall (Sensitivity)', 'Accuracy', 'F1-Score'],
        correct: 1,
        explanation: 'Recall = True Positives / (True Positives + False Negatives).',
      },
    ],
  },
  dbms: {
    title: 'Advanced Database Systems',
    code: 'MCA-503',
    questions: [
      {
        q: 'What does the "A" in ACID database transactions stand for?',
        options: ['Availability', 'Atomicity', 'Authentication', 'Aggregation'],
        correct: 1,
        explanation: 'Atomicity ensures that all statements within a transaction commit successfully or all rollback.',
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
        explanation: 'B+ Trees store all data pointers at leaf nodes linked sequentially for optimal range scans.',
      },
    ],
  },
};

export function AIAssistantWidget({ currentUser, onOpenModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'quiz'
  const [inputQuery, setInputQuery] = useState('');
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN'); // 'en-IN' | 'hi-IN' | 'mr-IN'

  // Quiz state
  const [activeSubject, setActiveSubject] = useState('cloud');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const displayName = currentUser ? currentUser.name.split(' ')[0] : 'Visitor';

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: currentUser
        ? `Hello ${displayName}! 👋 I am your DCPE Genius AI Assistant. How can I assist you with your academics, attendance, exam dates, or practice quizzes today?`
        : `Welcome to DCPE HVPM! 👋 I am your Campus AI Assistant. How can I help you with courses, admissions, facilities, or portal login today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionKey: null,
    },
  ]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Speech Recognition (Web Speech API)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or MS Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

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
      console.error('[DCPE Voice] Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Speech Synthesis
  const speakText = (text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[^\w\s.,]/gi, ''));
    utterance.lang = selectedLanguage;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Natural Language Intent Processor
  const processQuery = (userText) => {
    const text = userText.toLowerCase();
    let reply = "";
    let actionKey = null;

    if (currentUser) {
      if (text.includes('attendance') || text.includes('absent') || text.includes('present') || text.includes('bunk')) {
        const att = currentUser.attendance || '78.5%';
        const attNum = parseFloat(att);
        if (attNum >= 75) {
          reply = `Your overall attendance is ${att} (Eligible for Exams ✓). You can use the Attendance Risk Radar to simulate future lecture absences safely!`;
        } else {
          reply = `WARNING: Your attendance is ${att}, below the 75% threshold! Check the Attendance Risk Radar to see how many lectures you must attend to become eligible.`;
        }
        actionKey = 'risk_radar';
      } else if (text.includes('fee') || text.includes('receipt') || text.includes('passbook') || text.includes('paid')) {
        const fees = currentUser.feesStatus || 'Paid ✓';
        reply = `Your Semester Fee Status is: "${fees}". You can view your full ledger or download official fee receipts in your Fees Passbook.`;
        actionKey = 'fee_passbook';
      } else if (text.includes('exam') || text.includes('calendar') || text.includes('date') || text.includes('schedule')) {
        reply = `Mid-Semester and End-Semester University Exam dates are live on your Smart Academic Calendar! You can also sync them to Google Calendar.`;
        actionKey = 'calendar';
      } else if (text.includes('hall ticket') || text.includes('admit card') || text.includes('gatepass')) {
        reply = currentUser.hallTicketApproved
          ? `Your Examination Hall Ticket is approved by the HOD! Access your Seat No. and QR Gatepass.`
          : `Your Hall Ticket is currently locked pending HOD attendance clearance.`;
        actionKey = 'hall_ticket';
      } else if (text.includes('resume') || text.includes('cv') || text.includes('placement') || text.includes('job')) {
        reply = `You can build an ATS-optimized single-page A4 resume using our ATS Resume Studio or apply for active campus drives in T&P Placements!`;
        actionKey = 'resume';
      } else if (text.includes('quiz') || text.includes('test') || text.includes('practice') || text.includes('mcq')) {
        setActiveTab('quiz');
        reply = `Switching to Practice Quiz Mode! Select a subject above and test your knowledge for upcoming semester exams.`;
      } else {
        reply = `I can assist you with your Attendance Risk Radar, Fees Passbook, Academic Calendar, Hall Ticket, ATS Resume Studio, or Exam Practice Quizzes!`;
      }
    } else {
      if (text.includes('course') || text.includes('bca') || text.includes('mca') || text.includes('bped')) {
        reply = `Shree HVPM Degree College of Physical Education offers Autonomous Programs: BCA, MCA, B.P.Ed, M.P.Ed, B.Sc, and YOGA Diplomas.`;
      } else if (text.includes('admission') || text.includes('apply') || text.includes('enroll')) {
        reply = `Admissions for 2026-2027 are OPEN! Register your student account using the Portal Login section on this home page.`;
      } else {
        reply = `Hello! Ask me about Courses Offered, Admission Registration, Campus Facilities, or Portal Logins!`;
      }
    }

    return { reply, actionKey };
  };

  const handleSend = (textToSend) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg = {
      sender: 'user',
      text: q.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const { reply, actionKey } = processQuery(q);

    const aiMsg = {
      sender: 'ai',
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionKey,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputQuery('');
    speakText(reply);
  };

  // Quiz Answer Handler
  const handleQuizAnswer = (optionIdx) => {
    setSelectedOption(optionIdx);
    const qObj = QUIZ_BANK[activeSubject].questions[currentQIndex];
    if (optionIdx === qObj.correct) {
      setQuizScore(s => s + 1);
    }
  };

  const nextQuizQuestion = () => {
    const totalQ = QUIZ_BANK[activeSubject].questions.length;
    if (currentQIndex < totalQ - 1) {
      setCurrentQIndex(i => i + 1);
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

  return (
    <>
      {/* Floating Trigger Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            color: '#ffffff',
            border: '2px solid #67e8f9',
            boxShadow: '0 8px 30px rgba(30, 27, 75, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Open DCPE Genius AI Assistant & Quiz Engine"
        >
          <Sparkles size={24} color="#67e8f9" />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: '#10b981',
            border: '2px solid #ffffff',
          }} />
        </button>
      )}

      {/* Main AI Chat & Quiz Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          width: '400px',
          maxWidth: 'calc(100vw - 32px)',
          height: '580px',
          maxHeight: 'calc(100vh - 40px)',
          background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)',
          borderRadius: '24px',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUpPWA 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #d9234f, #f43f5e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(217,35,79,0.3)',
              }}>
                <Bot size={20} color="#fff" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  DCPE Genius AI
                  <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '1px 6px', borderRadius: '8px', fontWeight: 800 }}>v3.0</span>
                </h4>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                  Voice-Enabled • Academic &amp; Quiz Engine
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                style={{ background: 'none', border: 'none', color: speechEnabled ? '#38bdf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}
                title={speechEnabled ? 'Mute AI Voice' : 'Enable AI Voice Output'}
              >
                {speechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'chat' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: activeTab === 'chat' ? '#ffffff' : 'rgba(255,255,255,0.5)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              💬 AI Assistant
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'quiz' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: activeTab === 'quiz' ? '#ffffff' : 'rgba(255,255,255,0.5)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🎯 Practice Quiz
            </button>
          </div>

          {/* TAB 1: AI CHAT ASSISTANT */}
          {activeTab === 'chat' && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: msg.sender === 'user' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(255,255,255,0.07)',
                      color: '#ffffff',
                      padding: '12px 14px',
                      borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      fontSize: '12.5px',
                      lineHeight: '1.45',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: msg.sender === 'ai' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    }}
                  >
                    <div>{msg.text}</div>
                    <div style={{ fontSize: '9.5px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                      {msg.time}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input & Voice Trigger */}
              <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={toggleListening}
                  style={{
                    background: isListening ? '#ef4444' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  title={isListening ? 'Stop Listening' : 'Speak Prompt (English / Hindi / Marathi)'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? "Listening..." : "Ask DCPE Genius..."}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    padding: '9px 12px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />

                <button
                  onClick={() => handleSend()}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    border: 'none',
                    borderRadius: '12px',
                    width: '36px',
                    height: '36px',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
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
                    onClick={() => { setActiveSubject(key); resetQuiz(); }}
                    style={{
                      background: activeSubject === key ? '#2563eb' : 'rgba(255,255,255,0.08)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '6px 12px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.code}
                  </button>
                ))}
              </div>

              {!quizFinished ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                      {QUIZ_BANK[activeSubject].title} • Question {currentQIndex + 1} of {QUIZ_BANK[activeSubject].questions.length}
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 14px', lineHeight: '1.4' }}>
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
                            bg = 'rgba(16,185,129,0.2)';
                            border = '1px solid #10b981';
                          } else if (isSelected) {
                            bg = 'rgba(239,68,68,0.2)';
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
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {selectedOption !== null && (
                      <div style={{ marginTop: '14px', padding: '10px 12px', background: 'rgba(59,130,246,0.12)', borderLeft: '3px solid #3b82f6', borderRadius: '8px', fontSize: '11.5px', color: '#93c5fd' }}>
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
                  <Trophy size={48} color="#f59e0b" style={{ marginBottom: '12px' }} />
                  <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#fff' }}>Quiz Complete!</h3>
                  <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                    You scored <strong>{quizScore} / {QUIZ_BANK[activeSubject].questions.length}</strong> in {QUIZ_BANK[activeSubject].title}!
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, marginBottom: '20px' }}>
                    <Flame size={16} /> +50 XP Earned towards Leaderboard!
                  </div>
                  <button
                    onClick={resetQuiz}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '10px 20px',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                    }}
                  >
                    Retake Quiz 🔄
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
