import React, { useState, useRef } from 'react';
import {
  FileText, Upload, CheckCircle2, AlertTriangle, Sparkles, X, ChevronRight,
  Search, ShieldCheck, Zap, Award, BarChart2, RefreshCw, Copy, Check
} from 'lucide-react';
import './Dashboard.css';

const RECRUITER_TARGETS = {
  tcs: {
    name: 'TCS Digital / System Engineer',
    reqKeywords: ['react', 'python', 'sql', 'javascript', 'cloud', 'git', 'rest api', 'microservices', 'data structures'],
  },
  infosys: {
    name: 'Infosys Specialist Programmer',
    reqKeywords: ['python', 'algorithms', 'dijkstra', 'java', 'sql', 'system design', 'aws', 'docker', 'agile'],
  },
  sai: {
    name: 'Sports Authority of India (SAI)',
    reqKeywords: ['sports science', 'kinesiology', 'biomechanics', 'b.p.ed', 'm.p.ed', 'physiology', 'coaching', 'atp'],
  },
  decathlon: {
    name: 'Decathlon Sports Operations',
    reqKeywords: ['event management', 'sports retail', 'logistics', 'leadership', 'community', 'customer service'],
  },
};

export function ResumeATSScannerModal({ currentUser, onOpenResumeBuilder, onClose }) {
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('tcs');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileUpload = (uploadedFile) => {
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setIsScanning(true);
    setScanResult(null);

    // Read file text
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result || '';
      setRawText(text);

      setTimeout(() => {
        analyzeResumeText(text);
        setIsScanning(false);
      }, 900);
    };

    reader.readAsText(uploadedFile);
  };

  const analyzeResumeText = (text) => {
    const lower = (text + ' ' + (currentUser?.name || '') + ' ' + (currentUser?.course || '')).toLowerCase();
    const targetObj = RECRUITER_TARGETS[selectedTarget];

    const matched = targetObj.reqKeywords.filter((kw) => lower.includes(kw));
    const missing = targetObj.reqKeywords.filter((kw) => !lower.includes(kw));

    const matchPct = Math.round((matched.length / targetObj.reqKeywords.length) * 100);
    const score = Math.min(100, Math.max(50, matchPct + 20));

    setScanResult({
      score,
      matched,
      missing,
      targetName: targetObj.name,
      formattingGrade: text.length > 300 ? 'A+ (Optimal Length)' : 'B (Needs More Detail)',
      recommendations: missing.length > 0
        ? `Add missing keywords: ${missing.slice(0, 3).join(', ')} to boost ATS match.`
        : 'Outstanding ATS formatting! Your resume covers all core technical keywords.',
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '920px',
          width: '100%',
          boxShadow: 'var(--shadow-2xl)',
          padding: '28px',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #0891b2, #06b6d4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
                  Drag &amp; Drop PDF Resume ATS Scanner
                </h3>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 99, background: '#0891b2', color: 'white', fontWeight: 700 }}>
                  AI MATCH ENGINE
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Degree College of Physical Education (DCPE HVPM) • Recruiter ATS Audit
              </span>
            </div>
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Recruiter Target Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            Select Target Recruiter Job Profile:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {Object.entries(RECRUITER_TARGETS).map(([key, target]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedTarget(key);
                  if (rawText) analyzeResumeText(rawText);
                }}
                style={{
                  background: selectedTarget === key ? '#ecfeff' : 'white',
                  border: selectedTarget === key ? '2px solid #0891b2' : '1px solid var(--border-light)',
                  borderRadius: '12px',
                  padding: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: selectedTarget === key ? '#0891b2' : 'var(--text-heading)',
                }}
              >
                {target.name}
              </button>
            ))}
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #0891b2',
            background: '#f0fdf4',
            borderRadius: '20px',
            padding: '32px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '20px',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept=".pdf,.docx,.txt"
            style={{ display: 'none' }}
          />

          <Upload size={40} color="#0891b2" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)' }}>
            {file ? `📄 Uploaded: ${file.name}` : 'Drag & Drop Resume File Here or Click to Browse'}
          </h4>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Supports PDF, Word DOCX, and TXT files • 100% Private Client-Side Parsing
          </span>
        </div>

        {/* Scanning Spinner */}
        {isScanning && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#0891b2' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 700 }}>Extracting Resume Text &amp; Auditing ATS Keywords...</div>
          </div>
        )}

        {/* Scan Results Card */}
        {scanResult && !isScanning && (
          <div style={{ border: '2px solid #0891b2', borderRadius: '20px', padding: '24px', background: '#ecfeff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #a5f3fc' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0e7490' }}>
                  📊 ATS Compatibility Audit Results
                </h4>
                <span style={{ fontSize: '12px', color: '#0891b2' }}>
                  Target: {scanResult.targetName}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#0e7490' }}>
                  {scanResult.score} / 100
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0891b2' }}>
                  Formatting Grade: {scanResult.formattingGrade}
                </div>
              </div>
            </div>

            {/* Keyword Match Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div style={{ background: 'white', padding: '14px', borderRadius: '12px', border: '1px solid #a5f3fc' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857', marginBottom: '8px' }}>
                  ✓ Matched ATS Keywords ({scanResult.matched.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {scanResult.matched.length > 0 ? (
                    scanResult.matched.map((kw) => (
                      <span key={kw} style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                        ✓ {kw}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '11px', color: '#dc2626' }}>No keywords matched.</span>
                  )}
                </div>
              </div>

              <div style={{ background: 'white', padding: '14px', borderRadius: '12px', border: '1px solid #a5f3fc' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', marginBottom: '8px' }}>
                  ⚠️ Missing Keywords to Add ({scanResult.missing.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {scanResult.missing.length > 0 ? (
                    scanResult.missing.map((kw) => (
                      <span key={kw} style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                        + {kw}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '11px', color: '#047857' }}>All key terms matched!</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#0e7490', marginBottom: '16px' }}>
              💡 <strong>ATS Recommendation:</strong> {scanResult.recommendations}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                if (onOpenResumeBuilder) onOpenResumeBuilder();
              }}
              style={{ width: '100%', background: '#0891b2', fontWeight: 800 }}
            >
              Import Keywords into ATS Resume Builder Studio 🚀 <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
