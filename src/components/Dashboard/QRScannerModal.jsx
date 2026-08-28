import React, { useState } from 'react';
import { Shield, CheckCircle2, AlertTriangle, Camera } from 'lucide-react';

export default function QRScannerModal({ students = [], onClose }) {
  const [scannedResult, setScannedResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = (student) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const attendanceNum = parseFloat(student.attendance || '0');
      const feesPaid = student.feesStatus?.toLowerCase().includes('paid') && !student.feesStatus?.toLowerCase().includes('unpaid');
      const isEligible = attendanceNum >= 75 && feesPaid;
      
      setScannedResult({
        student,
        isEligible,
        attendance: student.attendance || '0%',
        feesStatus: student.feesStatus || 'Pending',
        scanTime: new Date().toLocaleTimeString(),
      });
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 24px', background: '#f8fafc', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyGroup: 'space-between', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-heading)', fontFamily: 'var(--font-display)' }}>Exam Gatepass Verification Scanner</span>
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose} style={{ padding: '4px 8px' }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          
          {/* Scanning Box View */}
          {!scannedResult && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '240px',
                  height: '240px',
                  border: '3px solid var(--primary)',
                  borderRadius: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
                }}
              >
                {/* Neon Laser Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: '#10b981',
                    boxShadow: '0 0 12px #10b981',
                    top: isScanning ? '80%' : '10%',
                    animation: 'scanLine 2s linear infinite'
                  }}
                />
                
                <style>{`
                  @keyframes scanLine {
                    0% { top: 10%; }
                    50% { top: 90%; }
                    100% { top: 10%; }
                  }
                `}</style>

                {isScanning ? (
                  <div style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>
                    🔍 DECODING QR DATA...
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Camera size={32} />
                    <span>Live Camera Feed Active</span>
                  </div>
                )}
              </div>
              
              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                Position student's hall ticket QR code inside the frame to scan
              </div>

              {/* Simulation Helper */}
              <div style={{ width: '100%', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '10px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '10px', textTransform: 'uppercase' }}>
                  🎯 Simulate QR Code Scan (Demo Panel)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {students.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No student records in database for this department.</div>
                  ) : (
                    students.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        className="btn btn-white btn-sm"
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', width: '100%', border: '1px solid var(--border-light)' }}
                        onClick={() => handleSimulateScan(s)}
                      >
                        <div style={{ textAlign: 'left' }}>
                          <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-heading)' }}>{s.name}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PRN: {s.prn} • Attendance: {s.attendance}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>Scan QR →</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Scanned Result View */}
          {scannedResult && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '18px' }}>
              
              {/* Verdict Icon */}
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: scannedResult.isEligible ? '#d1fae5' : '#fee2e2',
                  color: scannedResult.isEligible ? '#065f46' : '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {scannedResult.isEligible ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
              </div>

              {/* Verdict Header */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: scannedResult.isEligible ? '#065f46' : '#991b1b', margin: 0 }}>
                  {scannedResult.isEligible ? 'ADMIT DECISION: GRANTED ✓' : 'ADMIT DECISION: DETAINED ✕'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified at {scannedResult.scanTime}</span>
              </div>

              {/* Student details card */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '18px', width: '100%', textAlign: 'left' }}>
                <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Candidate Name:</td>
                      <td style={{ padding: '8px 0', fontWeight: 700, color: 'var(--text-heading)' }}>{scannedResult.student.name}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>PRN / Roll No:</td>
                      <td style={{ padding: '8px 0', fontWeight: 700 }}><code>{scannedResult.student.prn}</code> / {scannedResult.student.rollNo || 'Pending'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Overall Attendance:</td>
                      <td style={{ padding: '8px 0', fontWeight: 700, color: parseFloat(scannedResult.attendance) >= 75 ? '#059669' : '#dc2626' }}>
                        {scannedResult.attendance} (Req. 75%)
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Semester Fee Status:</td>
                      <td style={{ padding: '8px 0', fontWeight: 700, color: scannedResult.feesStatus?.toLowerCase().includes('paid') && !scannedResult.feesStatus?.toLowerCase().includes('unpaid') ? '#059669' : '#d97706' }}>
                        {scannedResult.feesStatus}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* QR Scanner Footer Action */}
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                onClick={() => setScannedResult(null)}
              >
                Scan Next Gatepass QR Code
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
