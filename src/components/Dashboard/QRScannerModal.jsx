import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Shield, CheckCircle2, AlertTriangle, Camera, AlertCircle } from 'lucide-react';

export default function QRScannerModal({ students = [], onClose }) {
  const [scannedResult, setScannedResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const qrRegionId = "qr-reader-element";
    
    const timeoutId = setTimeout(() => {
      const html5QrCode = new Html5Qrcode(qrRegionId);
      html5QrCodeRef.current = html5QrCode;

      setIsScanning(true);
      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleQrSuccess(decodedText);
        },
        () => {}
      ).catch((err) => {
        console.error("Camera startup error:", err);
        setCameraError("Camera Access Error: Please ensure you grant camera permissions and that no other application is using your webcam.");
        setIsScanning(false);
      });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      cleanupScanner();
    };
  }, []);

  const cleanupScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleQrSuccess = async (decodedText) => {
    await cleanupScanner();
    setIsScanning(false);

    try {
      const data = JSON.parse(decodedText);
      if (!data.prn) throw new Error("Invalid QR data format");

      const matchedStudent = students.find(s => s.prn === data.prn);
      
      const attendanceNum = parseFloat(matchedStudent?.attendance || data.attendance || '0');
      const feesPaid = matchedStudent
        ? matchedStudent.feesStatus?.toLowerCase().includes('paid') && !matchedStudent.feesStatus?.toLowerCase().includes('unpaid')
        : data.feesStatus?.toLowerCase().includes('paid');

      const isEligible = attendanceNum >= 75 && feesPaid;

      setScannedResult({
        student: matchedStudent || data,
        isEligible,
        attendance: `${attendanceNum}%`,
        feesStatus: feesPaid ? 'Paid ✓' : 'Pending',
        scanTime: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      console.error("Error parsing QR:", err);
      setScannedResult({
        student: { name: "Unknown Student / Code", prn: decodedText.slice(0, 20), course: "External Data" },
        isEligible: false,
        attendance: "N/A",
        feesStatus: "N/A",
        scanTime: new Date().toLocaleTimeString(),
        rawText: decodedText
      });
    }
  };

  const handleScanNext = () => {
    setScannedResult(null);
    setCameraError(null);
    setIsScanning(true);
    
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleQrSuccess(decodedText);
        },
        () => {}
      ).catch((err) => {
        console.error("Camera restart error:", err);
        setCameraError("Failed to restart camera stream.");
        setIsScanning(false);
      });
    }
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
        <div style={{ padding: '18px 24px', background: '#f8fafc', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-heading)', fontFamily: 'var(--font-display)' }}>Live Exam Gatepass Verification Scanner</span>
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose} style={{ padding: '4px 8px' }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          
          {/* Scanning Box View */}
          {!scannedResult && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              
              {cameraError ? (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '16px', color: '#b91c1c', fontSize: '13px', display: 'flex', gap: '10px', width: '100%' }}>
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Camera Access Blocked</strong>
                    <div style={{ marginTop: '4px', color: '#991b1b' }}>{cameraError}</div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    width: '260px',
                    height: '260px',
                    border: '3px solid var(--primary)',
                    borderRadius: '24px',
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
                  {isScanning && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: '#10b981',
                        boxShadow: '0 0 12px #10b981',
                        animation: 'scanLine 2s linear infinite',
                        zIndex: 10
                      }}
                    />
                  )}
                  
                  <style>{`
                    @keyframes scanLine {
                      0% { top: 10%; }
                      50% { top: 90%; }
                      100% { top: 10%; }
                    }
                  `}</style>

                  <div 
                    id="qr-reader-element" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      background: 'black'
                    }}
                  />
                </div>
              )}
              
              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                {isScanning ? (
                  <span style={{ color: '#10b981', fontWeight: 600 }}>🟢 Webcam stream active — Point at student hall ticket QR</span>
                ) : (
                  <span>Camera loading...</span>
                )}
              </div>

              {/* Demo Scan Help Panel */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', width: '100%', marginTop: '10px' }}>
                <h5 style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 800, color: 'var(--text-heading)', textTransform: 'uppercase' }}>
                  💡 Testing Instructions:
                </h5>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Instruct the student to open their <strong>Exam Hall Ticket Modal</strong> on their portal and show the QR code. Hold their screen up to this camera. The scanner will decode, verify eligibility, and render an admit/detain decision immediately.
                </p>
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
                      <td style={{ padding: '8px 0', fontWeight: 700, color: scannedResult.feesStatus?.toLowerCase().includes('paid') ? '#059669' : '#d97706' }}>
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
                onClick={handleScanNext}
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
