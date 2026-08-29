import React, { useState } from 'react';
import { Search, X, CheckCircle2, ShieldCheck, Printer, AlertCircle } from 'lucide-react';
import { OfficialHVPMLogo } from '../Common/OfficialHVPMLogo';

export function QuickHallTicketSearchModal({ onClose, allStudents = [] }) {
  const [query, setQuery] = useState('');
  const [matchedStudent, setMatchedStudent] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const q = query.trim().toLowerCase();
    setSearched(true);

    // Search by PRN, Name, Email, or Enrollment No
    const found = allStudents.find((s) =>
      (s.prn && s.prn.toLowerCase().includes(q)) ||
      (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.name && s.name.toLowerCase().includes(q))
    );

    setMatchedStudent(found || null);
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ maxWidth: '580px', width: '100%', background: '#ffffff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', animation: 'slideUpPWA 0.3s ease' }}>
        
        {/* Modal Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '20px 24px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <OfficialHVPMLogo size={42} showTitle={false} />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>Quick Offline Hall Ticket Lookup</h3>
              <span style={{ fontSize: '11px', color: '#93c5fd' }}>Instant Exam Gatepass Search by PRN Number</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Search Form */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter PRN (e.g. DCPE/MCA/2026/0001) or Name..."
                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <button type="submit" style={{ background: 'linear-gradient(135deg, #d9234f, #f43f5e)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0 20px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
              Search Gatepass
            </button>
          </form>

          {/* Results Area */}
          {searched && (
            <div>
              {matchedStudent ? (
                <div style={{ border: '2px solid #10b981', borderRadius: '16px', padding: '20px', background: '#f0fdf4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #bbf7d0', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 800, fontSize: '14px' }}>
                      <CheckCircle2 size={20} /> Hall Ticket Verified &amp; Cleared
                    </div>
                    <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      Gatepass #EXAM-2026
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px', color: '#1e293b' }}>
                    <div><strong>Student Name:</strong> {matchedStudent.name}</div>
                    <div><strong>PRN:</strong> <code>{matchedStudent.prn}</code></div>
                    <div><strong>Course:</strong> {matchedStudent.course} ({matchedStudent.year})</div>
                    <div><strong>Attendance:</strong> <span style={{ color: '#15803d', fontWeight: 800 }}>{matchedStudent.attendance} ✓</span></div>
                    <div><strong>Exam Seat No:</strong> <code>SEAT-CS-{matchedStudent.rollNo?.slice(-3) || '042'}</code></div>
                    <div><strong>Exam Center:</strong> Main Exam Hall, DCPE Building</div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => window.print()}
                      style={{ flex: 1, background: '#1e1b4b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Printer size={16} /> Print Gatepass
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', background: '#fff1f2', borderRadius: '16px', border: '1px solid #fecdd3', color: '#be123c' }}>
                  <AlertCircle size={32} style={{ marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800 }}>No Hall Ticket Found</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9f1239' }}>
                    Check your PRN number or contact the Department HOD Office for authorization.
                  </p>
                </div>
              )}
            </div>
          )}

          {!searched && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12.5px' }}>
              💡 Enter your PRN number above to instantly view and print your SGBAU Exam Hall Ticket without logging in.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
