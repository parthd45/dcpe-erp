import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Command, Zap, CheckCircle2 } from 'lucide-react';
import './Dashboard.css';

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

    let modalKey = null;
    let feedback = '';

    if (norm.includes('attendance') || norm.includes('bunk') || norm.includes('75')) {
      modalKey = 'riskRadar';
      feedback = 'Opening Attendance Risk Radar';
    } else if (norm.includes('hall ticket') || norm.includes('admit card') || norm.includes('exam pass')) {
      modalKey = 'hallTicket';
      feedback = 'Opening Examination Hall Ticket';
    } else if (norm.includes('marksheet') || norm.includes('grade') || norm.includes('cgpa') || norm.includes('result')) {
      modalKey = 'marksheet';
      feedback = 'Opening Digital Marksheet Vault';
    } else if (norm.includes('placement') || norm.includes('job') || norm.includes('tcs') || norm.includes('infosys') || norm.includes('drive')) {
      modalKey = 'placement';
      feedback = 'Opening Training and Placement Hub';
    } else if (norm.includes('fee') || norm.includes('payment') || norm.includes('passbook') || norm.includes('receipt')) {
      modalKey = 'feePassbook';
      feedback = 'Opening Fees Passbook and Receipts';
    } else if (norm.includes('resume') || norm.includes('ats')) {
      modalKey = 'resume';
      feedback = 'Opening ATS Resume Builder Studio';
    } else if (norm.includes('scanner') || norm.includes('ats scanner') || norm.includes('pdf')) {
      modalKey = 'atsScanner';
      feedback = 'Opening Drag and Drop PDF ATS Scanner';
    } else if (norm.includes('code') || norm.includes('python') || norm.includes('compiler') || norm.includes('sandbox')) {
      modalKey = 'codeSandbox';
      feedback = 'Opening WASM Code REPL Sandbox';
    } else if (norm.includes('skill') || norm.includes('tree') || norm.includes('rank') || norm.includes('level')) {
      modalKey = 'skillTree';
      feedback = 'Opening RPG Competency Skill Tree';
    } else if (norm.includes('sports') || norm.includes('biomechanics') || norm.includes('kinesiology') || norm.includes('motion')) {
      modalKey = 'biomechanics';
      feedback = 'Opening Biomechanics Motion Capture Studio';
    } else if (norm.includes('ledger') || norm.includes('verify') || norm.includes('hash') || norm.includes('crypto')) {
      modalKey = 'tamperLedger';
      feedback = 'Opening SHA-256 Cryptographic Ledger';
    } else if (norm.includes('map') || norm.includes('campus') || norm.includes('building')) {
      modalKey = 'campusMap';
      feedback = 'Opening Interactive Campus Map';
    } else if (norm.includes('leave') || norm.includes('application') || norm.includes('sick')) {
      modalKey = 'leave';
      feedback = 'Opening Leave Application Studio';
    }

    if (modalKey) {
      setLastAction(feedback);
      speakConfirmation(feedback);
      onOpenModal(modalKey);
      setTimeout(() => {
        setIsListening(false);
      }, 1200);
    } else {
      setLastAction(`Command not recognized: "${cmdText}"`);
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
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setLastAction('Listening for voice command...');
      };

      recognition.onresult = (e) => {
        const current = e.results[0][0].transcript;
        setTranscript(current);
        if (e.results[0].isFinal) {
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
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(12px)',
            color: 'white',
            borderRadius: '24px',
            padding: '16px 28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            minWidth: '460px',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: isListening ? '#dc2626' : 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isListening ? '0 0 20px #dc2626' : '0 0 15px #10b981',
                transition: 'all 0.2s ease',
              }}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: isListening ? '#ef4444' : '#34d399' }}>
                {isListening ? '🎙️ Listening... Speak Command' : 'DCPE Voice Control HUD'}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginTop: '2px' }}>
                {transcript ? `"${transcript}"` : lastAction || 'Try: "Open Attendance", "Check Marksheet", "TCS Placement"'}
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
      )}
    </>
  );
}
