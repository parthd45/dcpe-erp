import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Command, Zap, CheckCircle2, Search } from 'lucide-react';
import './Dashboard.css';

// ALL 25+ COMPREHENSIVE ERP VOICE INTENT COMMAND MAPPINGS
const VOICE_COMMAND_MAP = [
  {
    key: 'riskRadar',
    aliases: ['attendance', 'bunk', 'risk radar', '75', 'absent', 'lecture count', 'check attendance'],
    label: '📊 Attendance Risk Radar',
  },
  {
    key: 'hallTicket',
    aliases: ['hall ticket', 'admit card', 'exam pass', 'gatepass', 'seat allocation', 'exam card'],
    label: '🎫 Exam Hall Ticket',
  },
  {
    key: 'marksheet',
    aliases: ['marksheet', 'grade', 'cgpa', 'sgpa', 'result', 'transcript', 'marks'],
    label: '📜 Digital Marksheet',
  },
  {
    key: 'idCard',
    aliases: ['id card', 'student id', 'identity card', 'smart id', 'barcode card', 'id'],
    label: '🪪 Digital Student ID Card',
  },
  {
    key: 'placement',
    aliases: ['placement', 'job', 'tcs', 'infosys', 'drive', 'campus recruitment', 'career', 'interview'],
    label: '💼 T&P Placement Hub',
  },
  {
    key: 'feePassbook',
    aliases: ['fee', 'fees', 'payment', 'passbook', 'receipt', 'due', 'tuition fee'],
    label: '💳 Fees Passbook & Receipts',
  },
  {
    key: 'timetable',
    aliases: ['timetable', 'time table', 'schedule', 'routine', 'class time', 'lectures'],
    label: '📅 Class Timetable',
  },
  {
    key: 'library',
    aliases: ['library', 'book', 'catalog', 'issue book', 'author', 'delnet'],
    label: '📚 Central Library',
  },
  {
    key: 'leave',
    aliases: ['leave', 'sick leave', 'application', 'duty leave', 'leave letter', 'condonation'],
    label: '📝 Leave Application',
  },
  {
    key: 'resume',
    aliases: ['resume', 'cv', 'builder', 'ats resume', 'resume editor'],
    label: '📄 ATS Resume Builder',
  },
  {
    key: 'atsScanner',
    aliases: ['scanner', 'ats scanner', 'pdf upload', 'resume audit', 'resume scan'],
    label: '🔍 PDF ATS Resume Scanner',
  },
  {
    key: 'codeSandbox',
    aliases: ['code', 'python', 'compiler', 'sandbox', 'repl', 'javascript', 'sql', 'coder'],
    label: '⚡ WASM Code REPL Sandbox',
  },
  {
    key: 'skillTree',
    aliases: ['skill', 'tree', 'rank', 'level', 'xp', 'competency', 'rpg'],
    label: '🏆 RPG Competency Skill Tree',
  },
  {
    key: 'battleArena',
    aliases: ['battle', 'arena', 'duel', 'fight', 'multiplayer', 'quiz battle', 'code battle'],
    label: '⚔️ 1-on-1 Battle Arena',
  },
  {
    key: 'biomechanics',
    aliases: ['sports', 'biomechanics', 'kinesiology', 'motion', 'sprint', 'jump', 'athletics'],
    label: '🏃 Biomechanics Motion Capture',
  },
  {
    key: 'tamperLedger',
    aliases: ['ledger', 'verify', 'hash', 'sha', 'crypto', 'authenticity'],
    label: '🔒 Cryptographic Ledger',
  },
  {
    key: 'campusMap',
    aliases: ['map', 'campus', 'building', 'pool', 'gym', 'navigation', 'location'],
    label: '🗺️ Interactive Campus Map',
  },
  {
    key: 'leaderboard',
    aliases: ['leaderboard', 'rankings', 'top students', 'xp leaderboard'],
    label: '🎮 Gamified XP Leaderboard',
  },
  {
    key: 'analytics',
    aliases: ['analytics', 'department analytics', 'stats', 'dept report'],
    label: '📈 Department Analytics',
  },
  {
    key: 'careerPath',
    aliases: ['career path', 'roadmap', 'salary fit', 'career predictor'],
    label: '🧠 AI Career Path Predictor',
  },
  {
    key: 'calendar',
    aliases: ['calendar', 'academic calendar', 'events', 'holidays', 'exam dates'],
    label: '📆 Academic Calendar',
  },
  {
    key: 'feedback',
    aliases: ['feedback', 'anonymous feedback', 'suggestion', 'complaint'],
    label: '💬 Anonymous Feedback',
  },
  {
    key: 'achievement',
    aliases: ['achievement', 'wallet', 'badges', 'trophies', 'certificates'],
    label: '🏅 Achievement Wallet',
  },
  {
    key: 'wellness',
    aliases: ['wellness', 'health', 'fitness', 'bmi', 'workout', 'tracker'],
    label: '❤️ Wellness & Health Tracker',
  },
  {
    key: 'notifCenter',
    aliases: ['notification', 'notifications', 'alerts', 'command center', 'broadcasts'],
    label: '🔔 Notification Center',
  },
  {
    key: 'kanban',
    aliases: ['kanban', 'assignment', 'tasks', 'assignments', 'todo', 'projects'],
    label: '📋 Kanban Assignment Board',
  },
  {
    key: 'predictor',
    aliases: ['predictor', 'cgpa predictor', 'calculator', 'target sgpa'],
    label: '🎯 SGPA/CGPA Predictor',
  },
  {
    key: 'docUpload',
    aliases: ['upload', 'documents', 'photo upload', 'certificate upload'],
    label: '📤 Document Upload Vault',
  },
];

export function VoiceNavigationHUD({ onOpenModal }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState(null);
  const [hudOpen, setHudOpen] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Keyboard shortcut: Press Ctrl+Shift+V to toggle Voice HUD
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setHudOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-start speech recognition when Voice HUD opens
  useEffect(() => {
    if (hudOpen) {
      startListening();
    } else {
      stopListening();
    }
  }, [hudOpen]);

  const speakConfirmation = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const processVoiceCommand = (cmdText) => {
    const norm = cmdText.toLowerCase().trim();
    setTranscript(cmdText);

    let matchedCmd = null;

    for (const cmd of VOICE_COMMAND_MAP) {
      if (cmd.aliases.some((alias) => norm.includes(alias))) {
        matchedCmd = cmd;
        break;
      }
    }

    if (matchedCmd) {
      const feedback = `Opening ${matchedCmd.label}`;
      setLastAction(feedback);
      speakConfirmation(feedback);
      onOpenModal(matchedCmd.key);
      setTimeout(() => {
        setIsListening(false);
      }, 1000);
    } else {
      setLastAction(`Unrecognized phrase: "${cmdText}". Try speaking "Attendance", "Marksheet", "Placement", etc.`);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setLastAction('Listening for voice command...');
      };

      recognition.onresult = (e) => {
        let current = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          current += e.results[i][0].transcript;
        }
        if (current) {
          setTranscript(current);
          processVoiceCommand(current);
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech error:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <>
      {/* Floating Launcher Trigger */}
      <button
        type="button"
        onClick={() => setHudOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 990,
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: 99,
          boxShadow: '0 8px 25px rgba(124, 58, 237, 0.4)',
          fontWeight: 800,
          fontSize: '13px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'transform 0.2s ease',
        }}
      >
        <Zap size={16} fill="white" />
        🎙️ Voice HUD (Ctrl+Shift+V)
      </button>

      {/* Futuristic Voice HUD Overlay */}
      {hudOpen && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001,
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(16px)',
            color: 'white',
            borderRadius: '24px',
            padding: '20px 28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            maxWidth: '680px',
            width: '90%',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: isListening ? '#dc2626' : 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isListening ? '0 0 24px #dc2626' : '0 0 16px #10b981',
                  transition: 'all 0.2s ease',
                }}
              >
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              </button>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: isListening ? '#ef4444' : '#34d399' }}>
                  {isListening ? '🎙️ Listening... Speak Any Feature Name' : 'DCPE Voice Control HUD'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginTop: '2px' }}>
                  {transcript ? `"${transcript}"` : lastAction || 'Speak any feature name: "Attendance", "Hall Ticket", "Marksheet", "Placement", "Compiler"...'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHudOpen(false)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Command Suggestion Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', pt: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {VOICE_COMMAND_MAP.slice(0, 10).map((cmd) => (
              <button
                key={cmd.key}
                type="button"
                onClick={() => {
                  setLastAction(`Opening ${cmd.label}`);
                  speakConfirmation(`Opening ${cmd.label}`);
                  onOpenModal(cmd.key);
                }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '4px 10px',
                  borderRadius: 99,
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {cmd.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
