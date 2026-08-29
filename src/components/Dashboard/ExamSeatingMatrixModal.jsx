import React, { useState } from 'react';
import {
  Building2, Printer, X, CheckCircle2, Shield, Users,
  Sparkles, Grid, ArrowRight, Layers, FileText
} from 'lucide-react';
import './Dashboard.css';

export function ExamSeatingMatrixModal({ currentUser, onClose }) {
  if (!currentUser) return null;

  const [selectedHall, setSelectedHall] = useState('Main Exam Hall (Complex A)');
  const [totalBenches, setTotalBenches] = useState(30); // 30 seats
  const [colsPerRow, setColsPerRow] = useState(6); // 5 rows x 6 cols

  // Sample candidate pool
  const candidates = [
    { seatNo: 'SEAT-101', name: 'PARTH PRAVIN DESHMUKH', prn: 'DCPE/BCA/2026/0001', course: 'BCA', dept: 'Science' },
    { seatNo: 'SEAT-102', name: 'AARAV SUNIL SHARMA', prn: 'DCPE/MCA/2026/0014', course: 'MCA', dept: 'Comp Science' },
    { seatNo: 'SEAT-103', name: 'ANANYA RISHI VERMA', prn: 'DCPE/BPED/2026/0088', course: 'B.P.Ed', dept: 'Physical Edu' },
    { seatNo: 'SEAT-104', name: 'ROHAN VIKRAM PATIL', prn: 'DCPE/BCA/2026/0005', course: 'BCA', dept: 'Science' },
    { seatNo: 'SEAT-105', name: 'SNEHA MANOJ KULKARNI', prn: 'DCPE/MCA/2026/0022', course: 'MCA', dept: 'Comp Science' },
    { seatNo: 'SEAT-106', name: 'ADITYA RAJESH DESHMUKH', prn: 'DCPE/MPED/2026/0010', course: 'M.P.Ed', dept: 'Physical Edu' },
    { seatNo: 'SEAT-107', name: 'PRIYA SANJAY MORE', prn: 'DCPE/BCA/2026/0012', course: 'BCA', dept: 'Science' },
    { seatNo: 'SEAT-108', name: 'VIKRAM AMIT CHAVAN', prn: 'DCPE/MCA/2026/0034', course: 'MCA', dept: 'Comp Science' },
    { seatNo: 'SEAT-109', name: 'DIVYA VINOD JOSH', prn: 'DCPE/BPED/2026/0045', course: 'B.P.Ed', dept: 'Physical Edu' },
    { seatNo: 'SEAT-110', name: 'KUNAL PRAKASH PAWAR', prn: 'DCPE/BCA/2026/0019', course: 'BCA', dept: 'Science' },
    { seatNo: 'SEAT-111', name: 'MEERA ANAND THORAT', prn: 'DCPE/MCA/2026/0040', course: 'MCA', dept: 'Comp Science' },
    { seatNo: 'SEAT-112', name: 'YASH GAJANAN WAGH', prn: 'DCPE/BPED/2026/0052', course: 'B.P.Ed', dept: 'Physical Edu' },
  ];

  const handlePrint = () => {
    window.print();
  };

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
          maxWidth: '920px',
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
          className="no-print"
          style={{
            padding: '16px 24px',
            background: '#1e1b4b',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px' }}>
            <Grid size={18} color="#818cf8" />
            Autonomy Examination Hall Seating Matrix Generator
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} /> Print Door Seating Chart
            </button>
            <button className="btn btn-sm" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Control bar */}
        <div
          className="no-print"
          style={{
            padding: '12px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontWeight: 700 }}>Select Exam Complex:</label>
            <select
              className="form-control"
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              style={{ width: '220px', fontSize: '12px' }}
            >
              <option value="Main Exam Hall (Complex A)">Main Exam Hall (Complex A)</option>
              <option value="Computer Science Lab 3">Computer Science Lab 3</option>
              <option value="Physical Science Building 204">Physical Science Building 204</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontWeight: 700 }}>Benches Matrix:</label>
            <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '12px', fontWeight: 800 }}>
              5 Rows × 6 Columns (30 Seats)
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={14} /> Staggered Anti-Malpractice Checkerboard Pattern Active
          </div>
        </div>

        {/* Printable Content */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
          <div id="printable-seating-chart">
            <div style={{ textAlign: 'center', borderBottom: '2px solid #1e1b4b', paddingBottom: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e1b4b', letterSpacing: '0.08em' }}>
                SHREE HANUMAN VYAYAM PRASARAK MANDAL'S
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#d9234f', margin: '4px 0 2px' }}>
                DEGREE COLLEGE OF PHYSICAL EDUCATION (AUTONOMOUS), AMRAVATI
              </h2>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e1b4b' }}>
                OFFICIAL EXAMINATION HALL SEATING ARRANGEMENT — {selectedHall.toUpperCase()}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                End Semester Examinations 2026 • Date: <strong>29-AUG-2026</strong> • Session: <strong>Morning (10:00 AM)</strong>
              </div>
            </div>

            {/* Seating Grid Canvas */}
            <div style={{ fontWeight: 800, fontSize: '13px', color: '#1e1b4b', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🪑 Invigilator's Desk &amp; Stage (Front of Hall)</span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Staggered Allocation by Branch</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '10px',
                marginBottom: '24px',
              }}
            >
              {candidates.map((cand, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1.5px solid #1e1b4b',
                    borderRadius: '8px',
                    padding: '8px',
                    background: idx % 2 === 0 ? '#f0fdf4' : '#eff6ff',
                    fontSize: '10.5px',
                  }}
                >
                  <div style={{ background: '#1e1b4b', color: 'white', fontWeight: 800, fontSize: '10px', padding: '2px 4px', borderRadius: '4px', textAlign: 'center', marginBottom: '4px' }}>
                    {cand.seatNo}
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cand.name.split(' ')[0]} {cand.name.split(' ')[1]?.[0]}.
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#475569' }}>
                    {cand.course} ({cand.dept})
                  </div>
                  <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                    {cand.prn.slice(-9)}
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                Note: Candidates must sit strictly on their assigned seat number.<br />
                Report any discrepancies to the Controller of Examinations immediately.
              </div>
              <div style={{ textAlign: 'center' }}>
                <Shield size={24} color="#1e1b4b" style={{ display: 'block', margin: '0 auto 2px' }} />
                <div style={{ fontSize: '11px', fontWeight: 800 }}>Chief Superintendent</div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>Exam Cell DCPE HVPM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
