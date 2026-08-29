import React, { useState } from 'react';
import {
  CreditCard, Printer, X, CheckCircle2, ShieldCheck, Download,
  Building2, FileText, ArrowRight, DollarSign, Calendar, Sparkles
} from 'lucide-react';
import './Dashboard.css';

export function FeePassbookModal({ currentUser, onClose }) {
  if (!currentUser) return null;

  const isPaid = (currentUser.feesStatus || '').toLowerCase().includes('paid');

  // Fee calculation matching DCPE structure
  const course = (currentUser.course || '').toUpperCase();
  let tuition = 42000;
  let lab = 8500;
  let sports = 4500;
  let exam = 3000;
  let library = 2000;

  if (course.includes('MCA') || course.includes('TECH')) {
    tuition = 52000;
    lab = 12000;
    sports = 4000;
    exam = 3500;
    library = 2500;
  } else if (course.includes('B.P.ED') || course.includes('M.P.ED')) {
    tuition = 38000;
    lab = 4000;
    sports = 12000;
    exam = 3000;
    library = 2000;
  }

  const totalFee = tuition + lab + sports + exam + library;
  const paidAmount = isPaid ? totalFee : Math.round(totalFee * 0.5);
  const remainingBalance = totalFee - paidAmount;

  const transactions = [
    {
      txnId: 'TXN-DCPE-2026-881294',
      date: '12 Jan 2026',
      desc: 'Semester I Tuition & Lab Fee (Installment 1)',
      amount: paidAmount,
      mode: 'UPI / NetBanking',
      status: 'SUCCESS ✓',
    },
  ];

  if (!isPaid) {
    transactions.push({
      txnId: 'PENDING-DUE',
      date: 'Due by 15 Mar 2026',
      desc: 'Semester I Remaining Balance',
      amount: remainingBalance,
      mode: 'Pending',
      status: 'UNPAID ⚠️',
    });
  }

  const handlePrintCertificate = () => {
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
          maxWidth: '780px',
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
            background: '#0f172a',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px' }}>
            <CreditCard size={18} color="#38bdf8" />
            Official Student Fee Passbook & Transaction Ledger
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrintCertificate}>
              <Printer size={15} /> Print Fee Certificate
            </button>
            <button className="btn btn-sm" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '28px', overflowY: 'auto' }}>
          <div id="printable-fee-passbook">
            {/* Header branding */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  DEGREE COLLEGE OF PHYSICAL EDUCATION (HVPM)
                </h2>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Autonomous Institute • Accounts & Fee Clearance Department
                </div>
                <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700, marginTop: '2px' }}>
                  STUDENT FEE STRUCTURE & SCHOLARSHIP CERTIFICATE — ACADEMIC YEAR 2026
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`status-pill ${isPaid ? 'approved' : 'pending'}`} style={{ fontSize: '12px', padding: '6px 14px' }}>
                  {isPaid ? '✓ FULLY CLEARED' : '⚠️ PARTIAL PAYMENT'}
                </span>
              </div>
            </div>

            {/* Student details */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                Candidate Name: <strong>{currentUser.name}</strong><br />
                Course: <strong>{currentUser.course}</strong>
              </div>
              <div>
                Permanent PRN: <code>{currentUser.prn}</code><br />
                Department: <strong>{currentUser.departmentName}</strong>
              </div>
            </div>

            {/* Fee Breakdown Table */}
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '8px' }}>
              📊 Approved Fee Structure Breakdown:
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '24px' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: 'white' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Fee Component</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Tuition & Academic Fee</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700 }}>₹{tuition.toLocaleString('en-IN')}</td></tr>
                <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Laboratory & Practical Facility Fee</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700 }}>₹{lab.toLocaleString('en-IN')}</td></tr>
                <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Sports & Gymnasium Development Fee</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700 }}>₹{sports.toLocaleString('en-IN')}</td></tr>
                <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Autonomy Examination Fee</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700 }}>₹{exam.toLocaleString('en-IN')}</td></tr>
                <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Library & Digital E-Resource Fee</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700 }}>₹{library.toLocaleString('en-IN')}</td></tr>
                <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                  <td style={{ padding: '10px 12px', fontSize: '13px' }}>TOTAL ANNUAL ACADEMIC FEE</td>
                  <td style={{ padding: '10px 12px', fontSize: '14px', textAlign: 'right', color: 'var(--primary)' }}>₹{totalFee.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            {/* Transaction Ledger */}
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '8px' }}>
              📜 Payment Transaction History Ledger:
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#334155' }}>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'left' }}>Transaction Ref</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={i}>
                    <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}><code>{t.txnId}</code></td>
                    <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>{t.date}</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>{t.desc}</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>₹{t.amount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700, color: t.status.includes('SUCCESS') ? '#059669' : '#dc2626' }}>{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Official seal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Computer Generated Fee Passbook • Verified by DCPE Accounts Cell
              </div>
              <div style={{ textAlign: 'center' }}>
                <ShieldCheck size={28} color="#0f172a" style={{ display: 'block', margin: '0 auto 4px' }} />
                <div style={{ fontSize: '11px', fontWeight: 800 }}>Finance & Accounts Officer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
