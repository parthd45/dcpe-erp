import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Lock, CheckCircle2, AlertTriangle, QrCode, Search,
  Download, Copy, Check, ExternalLink, X, Award, FileText, Key, RefreshCw
} from 'lucide-react';
import { generateDocumentSignature, verifyDocumentHash } from '../../lib/cryptoLedgerService';
import './Dashboard.css';

export function TamperProofLedgerModal({ currentUser, onClose }) {
  const [signature, setSignature] = useState(null);
  const [inputHash, setInputHash] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initSignature();
  }, [currentUser]);

  const initSignature = async () => {
    if (currentUser) {
      const sig = await generateDocumentSignature('Official Autonomous Marksheet', currentUser);
      setSignature(sig);
      setInputHash(sig.sha256Hash);
    }
  };

  const handleVerify = async () => {
    if (!inputHash.trim()) return;
    setIsVerifying(true);
    const res = await verifyDocumentHash(inputHash, currentUser || {});
    setVerifyResult(res);
    setIsVerifying(false);
  };

  const handleCopyHash = () => {
    if (signature?.sha256Hash) {
      navigator.clipboard.writeText(signature.sha256Hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          maxWidth: '860px',
          width: '100%',
          boxShadow: 'var(--shadow-2xl)',
          padding: '28px',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
                  SHA-256 Tamper-Proof Document Ledger
                </h3>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 99, background: '#059669', color: 'white', fontWeight: 700 }}>
                  256-BIT ENCRYPTED
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Degree College of Physical Education (Autonomous) • Employer Verification Portal
              </span>
            </div>
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Current Document Signature Banner */}
        {signature && (
          <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', color: 'white', borderRadius: '18px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Key size={16} /> Verified Cryptographic Signature
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 99, fontWeight: 700 }}>
                {signature.status}
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 16px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <span>{signature.sha256Hash}</span>
              <button
                type="button"
                onClick={handleCopyHash}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy Hash'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '14px', fontSize: '11px', opacity: 0.9 }}>
              <div><strong>Issuer:</strong> {signature.issuer}</div>
              <div><strong>Candidate:</strong> {currentUser?.name || 'Student'} ({currentUser?.prn})</div>
              <div><strong>Security:</strong> 256-Bit Cryptographic Ledger</div>
            </div>
          </div>
        )}

        {/* Public Employer / University Verification Lookup */}
        <div style={{ border: '1px solid var(--border-light)', borderRadius: '18px', padding: '20px', background: '#f8fafc', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)' }}>
            🔍 Verify Marksheet or Hall Ticket Hash
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
            Paste the SHA-256 hash or scan the QR code printed on the physical document to verify authentic college credentials.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <input
              type="text"
              placeholder="Paste SHA-256 Hash string here..."
              value={inputHash}
              onChange={(e) => setInputHash(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                fontSize: '13px',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying}
              style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Search size={15} /> {isVerifying ? 'Verifying Ledger...' : 'Verify Signature'}
            </button>
          </div>

          {verifyResult && (
            <div style={{ background: verifyResult.valid ? '#ecfdf5' : '#fef2f2', border: `1px solid ${verifyResult.valid ? '#a7f3d0' : '#fecaca'}`, borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontWeight: 800, fontSize: '15px', color: verifyResult.valid ? '#047857' : '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {verifyResult.valid ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  {verifyResult.status}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified against DCPE Blockchain Ledger</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Student Name:</span> <strong>{verifyResult.studentName}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>PRN:</span> <code>{verifyResult.prn}</code></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Course:</span> <strong>{verifyResult.course}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Verified CGPA:</span> <strong style={{ color: '#059669' }}>{verifyResult.cgpa}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* QR Code Verification Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
              <QrCode size={28} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e40af' }}>Employer Scan-to-Verify Ready</div>
              <div style={{ fontSize: '12px', color: '#1d4ed8', marginTop: '2px' }}>
                All generated marksheets &amp; hall tickets include an embedded SHA-256 QR code for instant employer validation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
