import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, X, Send, Sparkles, User, Volume2, VolumeX,
  BookOpen, Calendar, CreditCard, Clock, Award, ShieldAlert, CheckCircle2
} from 'lucide-react';
import './Dashboard.css';

export function AIAssistantWidget({ currentUser, onOpenModal }) {
  if (!currentUser) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${currentUser.name.split(' ')[0]}! 👋 I am your DCPE ERP AI Assistant. How can I assist you with your academics, attendance, fees, or library today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionKey: null,
    },
  ]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Speech synthesis helper
  const speakText = (text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[^\w\s.,]/gi, ''));
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Intent Parsing & Natural Language Query Processor
  const processQuery = (userText) => {
    const text = userText.toLowerCase();
    let reply = "";
    let actionKey = null;

    if (text.includes('attendance') || text.includes('absent') || text.includes('present') || text.includes('eligible')) {
      const att = currentUser.attendance || '78.5%';
      const attNum = parseFloat(att);
      if (attNum >= 75) {
        reply = `Your overall verified attendance is currently ${att} (Eligible for Exams ✓). You can use the Attendance Risk Radar to simulate future absences!`;
      } else {
        reply = `WARNING: Your attendance is currently ${att}, which is below the mandatory 75% threshold! Please open the Risk Radar to check required classes or submit medical leave.`;
      }
      actionKey = 'risk_radar';
    } else if (text.includes('fee') || text.includes('paid') || text.includes('receipt') || text.includes('scholarship') || text.includes('dues')) {
      const fees = currentUser.feesStatus || 'Paid ✓';
      reply = `Your Semester Fee Status is marked as: "${fees}". You can view your complete transaction history ledger or print your Official Scholarship Fee Certificate.`;
      actionKey = 'fee_passbook';
    } else if (text.includes('library') || text.includes('book') || text.includes('isbn') || text.includes('borrow')) {
      reply = `DCPE Central Library allows you to borrow up to 4 books simultaneously for 14 days. Check out available titles in the digital catalog or renew active borrowings!`;
      actionKey = 'library';
    } else if (text.includes('timetable') || text.includes('schedule') || text.includes('class') || text.includes('lecture')) {
      reply = `Your daily timetable for ${currentUser.course} (${currentUser.departmentName}) is live-synced from the HOD portal. Click below to view today's schedule.`;
      actionKey = 'timetable';
    } else if (text.includes('hall ticket') || text.includes('admit card') || text.includes('exam') || text.includes('seat')) {
      const approved = currentUser.hallTicketApproved;
      if (approved) {
        reply = `Your End Semester Examination Hall Ticket has been authorized by the HOD! It includes your Seat Number and verification QR code.`;
      } else {
        reply = `Your Hall Ticket is currently locked pending final HOD attendance & fee clearance verification.`;
      }
      actionKey = 'hall_ticket';
    } else if (text.includes('resume') || text.includes('cv') || text.includes('job') || text.includes('placement')) {
      reply = `You can generate an ATS-optimized, single-page A4 resume using our WYSIWYG Resume Studio or apply for active T&P Campus Drives!`;
      actionKey = 'resume';
    } else if (text.includes('grievance') || text.includes('complain') || text.includes('leave')) {
      reply = `You can submit formal leave requests or track active grievances through our Confidential Grievance Timeline Tracker.`;
      actionKey = 'grievance';
    } else {
      reply = `I can help you with your Attendance Risk Radar, Timetable, Fee Passbook, Library Catalog, Hall Ticket, or ATS Resume Studio! Click one of the quick options below or ask a specific question.`;
    }

    return { reply, actionKey };
  };

  const handleSend = (queryText = null) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user', text: textToSend.trim(), time: timeStr };

    const { reply, actionKey } = processQuery(textToSend);

    const aiMsg = { sender: 'ai', text: reply, time: timeStr, actionKey };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    if (!queryText) setInputQuery('');
    speakText(reply);
  };

  return (
    <>
      {/* Floating Launcher Button (Bottom Right) */}
      <button
        type="button"
        className="no-print"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
          color: 'white',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 10px 25px rgba(30, 27, 75, 0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
        }}
        title="DCPE AI Genius Assistant"
      >
        {isOpen ? <X size={26} /> : <Bot size={28} color="#67e8f9" />}
      </button>

      {/* Floating Chatbot Window */}
      {isOpen && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 120px)',
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.3)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid var(--border-light)',
          }}
        >
          {/* Assistant Header */}
          <div
            style={{
              padding: '14px 18px',
              background: '#1e1b4b',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '12px' }}>
                <Bot size={20} color="#67e8f9" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px' }}>DCPE Genius AI</div>
                <div style={{ fontSize: '10px', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                  Online • Voice Enabled
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setSpeechEnabled(!speechEnabled)}
                style={{ background: 'transparent', color: speechEnabled ? '#38bdf8' : '#94a3b8', border: 'none', padding: '4px' }}
                title={speechEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech'}
              >
                {speechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', color: 'white', border: 'none', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div style={{ padding: '16px', flex: 1, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    background: msg.sender === 'user' ? '#312e81' : 'white',
                    color: msg.sender === 'user' ? 'white' : '#1e293b',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    fontSize: '12.5px',
                    lineHeight: 1.45,
                    boxShadow: msg.sender === 'ai' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                    border: msg.sender === 'ai' ? '1px solid #e2e8f0' : 'none',
                  }}
                >
                  {msg.text}

                  {/* Action Shortcut Buttons */}
                  {msg.actionKey && onOpenModal && (
                    <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                      {msg.actionKey === 'risk_radar' && (
                        <button className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '11px' }} onClick={() => onOpenModal('risk_radar')}>
                          🔮 Open Attendance Risk Radar
                        </button>
                      )}
                      {msg.actionKey === 'fee_passbook' && (
                        <button className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '11px' }} onClick={() => onOpenModal('fee_passbook')}>
                          📜 View Fee Passbook Ledger
                        </button>
                      )}
                      {msg.actionKey === 'library' && (
                        <button className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '11px' }} onClick={() => onOpenModal('library')}>
                          📚 Open Central Library Portal
                        </button>
                      )}
                      {msg.actionKey === 'timetable' && (
                        <button className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '11px' }} onClick={() => onOpenModal('timetable')}>
                          📅 View Daily Timetable
                        </button>
                      )}
                      {msg.actionKey === 'resume' && (
                        <button className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '11px' }} onClick={() => onOpenModal('resume')}>
                          📄 Open ATS Resume Studio
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px', padding: '0 4px' }}>
                  {msg.time}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div style={{ padding: '8px 12px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {[
              'Check Attendance',
              'Fee Status',
              'Library Catalog',
              'My Timetable',
              'ATS Resume',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                className="btn btn-white btn-sm"
                style={{ borderRadius: '14px', fontSize: '10px', whiteSpace: 'nowrap', border: '1px solid #cbd5e1' }}
                onClick={() => handleSend(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Text Input Footer */}
          <div style={{ padding: '10px 14px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Ask AI Assistant anything..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ fontSize: '12px', height: '38px', borderRadius: '12px' }}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleSend()}
              style={{ height: '38px', width: '38px', padding: 0, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
