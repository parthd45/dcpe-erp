import React, { useState } from 'react';
import {
  ShieldAlert, Clock, CheckCircle2, FileText, AlertCircle,
  MessageSquare, User, X, ChevronRight, Sparkles, Send
} from 'lucide-react';
import './Dashboard.css';

export function GrievanceTimelineModal({ currentUser, onClose }) {
  if (!currentUser) return null;

  const [activeTicket, setActiveTicket] = useState({
    ticketId: 'GRV-2026-9941',
    category: 'Academic / Examination Retotaling Request',
    submittedAt: '24 Aug 2026, 11:30 AM',
    subject: 'Request for internal assessment score re-verification in Cloud Computing',
    stage: 'hod_review', // 'submitted' | 'hod_review' | 'committee' | 'resolved'
    status: 'In Progress (HOD Review)',
    responseNotes: [
      {
        author: 'System Auto-Ack',
        role: 'Central Grievance Cell',
        time: '24 Aug 2026, 11:30 AM',
        text: 'Grievance ticket registered successfully. Sent to HOD Department of Computer Science.'
      },
      {
        author: 'Dr. A. R. Sharma',
        role: 'HOD Computer Science',
        time: '26 Aug 2026, 02:15 PM',
        text: 'Retotaling sheet requested from course instructor. Verification in progress.'
      }
    ]
  });

  const [newNote, setNewNote] = useState('');

  const handleAddComment = () => {
    if (!newNote.trim()) return;
    setActiveTicket({
      ...activeTicket,
      responseNotes: [
        ...activeTicket.responseNotes,
        {
          author: currentUser.name,
          role: 'Student Candidate',
          time: 'Just Now',
          text: newNote.trim()
        }
      ]
    });
    setNewNote('');
  };

  const timelineSteps = [
    { key: 'submitted', label: '1. Registered', desc: 'Ticket Filed & Logged' },
    { key: 'hod_review', label: '2. Under HOD Review', desc: 'Assigned to Dept Head' },
    { key: 'committee', label: '3. Committee Review', desc: 'Fact Finding & Verification' },
    { key: 'resolved', label: '4. Resolution Issued', desc: 'Official Closing Note' },
  ];

  const currentStepIndex = timelineSteps.findIndex(s => s.key === activeTicket.stage);

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="printable-document-container"
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '750px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            background: '#881337',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px' }}>
            <ShieldAlert size={18} color="#fda4af" />
            Confidential Grievance Redressal Portal & Timeline Tracker
          </div>
          <button className="btn btn-sm" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {/* Ticket Header Meta */}
          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '16px 20px', borderRadius: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, background: '#be123c', color: 'white', padding: '2px 8px', borderRadius: '6px' }}>
                TICKET #{activeTicket.ticketId}
              </span>
              <span style={{ fontSize: '12px', color: '#9f1239', fontWeight: 700 }}>
                Category: {activeTicket.category}
              </span>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#881337', margin: '4px 0 2px' }}>
              {activeTicket.subject}
            </h3>
            <div style={{ fontSize: '12px', color: '#be123c' }}>
              Submitted by <strong>{currentUser.name}</strong> ({currentUser.prn}) on {activeTicket.submittedAt}
            </div>
          </div>

          {/* Timeline Tracker */}
          <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-heading)', marginBottom: '14px' }}>
            📌 Resolution Timeline & Status Progress:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '24px' }}>
            {timelineSteps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={step.key}
                  style={{
                    background: isCurrent ? '#fff1f2' : isPast ? '#ecfdf5' : '#f8fafc',
                    border: `1px solid ${isCurrent ? '#fecdd3' : isPast ? '#a7f3d0' : '#e2e8f0'}`,
                    padding: '12px',
                    borderRadius: '12px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, color: isCurrent ? '#be123c' : isPast ? '#059669' : '#64748b' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Response Logs & Discussion */}
          <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-heading)', marginBottom: '12px' }}>
            💬 Official Response Logs & Actions:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {activeTicket.responseNotes.map((note, i) => (
              <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  <span>{note.author} ({note.role})</span>
                  <span style={{ color: '#64748b' }}>{note.time}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#1e293b', margin: 0, lineHeight: 1.4 }}>
                  {note.text}
                </p>
              </div>
            ))}
          </div>

          {/* Add Student Reply */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Type additional details or response..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              style={{ fontSize: '12px' }}
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAddComment}>
              <Send size={14} /> Send Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
