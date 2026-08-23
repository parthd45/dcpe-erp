import React, { useState } from 'react';
import {
  CreditCard, Printer, X, CheckCircle2, ShieldCheck, QrCode,
  Building2, GraduationCap, Calendar, Clock, DollarSign, Download,
  ArrowRight, Shield, Smartphone, Lock, AlertCircle, Sparkles
} from 'lucide-react';
import './Dashboard.css';

export function FeePaymentModal({ currentUser, onClose, onPaymentSuccess }) {
  if (!currentUser) return null;

  const isAlreadyPaid = (currentUser.feesStatus || '').toLowerCase().includes('paid');

  // Determine fee amounts based on course
  const course = (currentUser.course || '').toUpperCase();
  let tuitionFee = 42000;
  let labFee = 8500;
  let sportsFee = 4500;
  let examFee = 3000;
  let libraryFee = 2000;

  if (course.includes('MCA') || course.includes('TECH')) {
    tuitionFee = 52000;
    labFee = 12000;
    sportsFee = 4000;
    examFee = 3500;
    libraryFee = 2500;
  } else if (course.includes('B.P.ED') || course.includes('M.P.ED') || course.includes('PHYSICAL')) {
    tuitionFee = 38000;
    labFee = 4000;
    sportsFee = 12000; // Special physical education facility
    examFee = 3000;
    libraryFee = 2000;
  } else if (course.includes('BCA') || course.includes('B.SC')) {
    tuitionFee = 28000;
    labFee = 6000;
    sportsFee = 3500;
    examFee = 2500;
    libraryFee = 2000;
  }

  const totalFee = tuitionFee + labFee + sportsFee + examFee + libraryFee;

  const [viewState, setViewState] = useState(isAlreadyPaid ? 'receipt' : 'breakdown'); // 'breakdown' | 'checkout' | 'receipt'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [isProcessing, setIsProcessing] = useState(false);
  const [txnId, setTxnId] = useState(`TXN-DCPE-2026-${Math.floor(100000 + Math.random() * 900000)}`);
  const [paymentDate, setPaymentDate] = useState(new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }));

  // Card input states
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');
  const [upiId, setUpiId] = useState(`${currentUser.email.split('@')[0]}@okaxis`);

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newTxn = `TXN-DCPE-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setTxnId(newTxn);
      setPaymentDate(new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }));
      setViewState('receipt');
      if (onPaymentSuccess) {
        onPaymentSuccess('Paid ✓');
      }
    }, 1500);
  };

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
          maxWidth: viewState === 'receipt' ? '680px' : '580px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Top Control Bar (Hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: '16px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)' }}>
            <CreditCard size={18} color="var(--primary)" />
            {viewState === 'receipt'
              ? 'Official Institutional Fee Receipt'
              : viewState === 'checkout'
              ? 'Secure Online Fee Payment Gateway'
              : 'Semester Fee Breakdown & Payment'}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {viewState === 'receipt' && (
              <button className="btn btn-primary btn-sm" onClick={handlePrint}>
                <Printer size={15} /> Print / Save PDF
              </button>
            )}
            <button className="btn btn-white btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {/* ─────────────────────────────────────────────────────────────
              VIEW 1: FEE BREAKDOWN
             ───────────────────────────────────────────────────────────── */}
          {viewState === 'breakdown' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <DollarSign size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                  Semester Fee Summary
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Academic Year 2025–2026 • {currentUser.course} ({currentUser.year || '1st Year'})
                </p>
              </div>

              {/* Fee Breakdown Table */}
              <div
                style={{
                  background: 'var(--bg-body)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-light)',
                  padding: '16px 20px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tuition & Academic Fee</span>
                  <strong>₹{tuitionFee.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Computer Lab & High-Speed Internet</span>
                  <strong>₹{labFee.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Gymkhana, Sports & Fitness Complex</span>
                  <strong>₹{sportsFee.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>University Examination & Assessment</span>
                  <strong>₹{examFee.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Central Library & Digital Journals</span>
                  <strong>₹{libraryFee.toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', marginTop: '6px', fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)' }}>
                  <span>Total Payable Amount</span>
                  <span style={{ color: '#059669', fontSize: '1.2rem' }}>₹{totalFee.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Info Banner */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#166534',
                }}
              >
                <ShieldCheck size={20} color="#16a34a" style={{ flexShrink: 0 }} />
                <span>
                  All payments made via the DCPE HVPM ERP Portal are instant and generate an official verifiable GST/College tax invoice receipt.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  style={{ flex: 1 }}
                  onClick={onClose}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => setViewState('checkout')}
                >
                  Pay ₹{totalFee.toLocaleString('en-IN')} Online
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW 2: CHECKOUT PAYMENT GATEWAY
             ───────────────────────────────────────────────────────────── */}
          {viewState === 'checkout' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                    Payment Checkout
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Amount: <strong style={{ color: '#059669' }}>₹{totalFee.toLocaleString('en-IN')}</strong> • Ref: {currentUser.prn}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '20px' }}>
                  <Lock size={12} /> 256-bit Encrypted
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: paymentMethod === 'upi' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    background: paymentMethod === 'upi' ? 'rgba(79, 70, 229, 0.05)' : 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: paymentMethod === 'upi' ? 'var(--primary)' : 'var(--text-body)',
                  }}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <Smartphone size={20} />
                  UPI / QR Code
                </button>

                <button
                  type="button"
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: paymentMethod === 'card' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    background: paymentMethod === 'card' ? 'rgba(79, 70, 229, 0.05)' : 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: paymentMethod === 'card' ? 'var(--primary)' : 'var(--text-body)',
                  }}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={20} />
                  Card Payment
                </button>

                <button
                  type="button"
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: paymentMethod === 'netbanking' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    background: paymentMethod === 'netbanking' ? 'rgba(79, 70, 229, 0.05)' : 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: paymentMethod === 'netbanking' ? 'var(--primary)' : 'var(--text-body)',
                  }}
                  onClick={() => setPaymentMethod('netbanking')}
                >
                  <Building2 size={20} />
                  Net Banking
                </button>
              </div>

              {/* Method Tab Content */}
              {paymentMethod === 'upi' && (
                <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-body)', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
                  <div style={{ display: 'inline-block', padding: '12px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                    <QrCode size={140} color="#1e1b4b" />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Scan with Google Pay, PhonePe, Paytm, or BHIM UPI
                  </p>
                  <div style={{ display: 'inline-block', background: '#e0e7ff', color: '#3730a3', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                    VPA: dcpe.fees@sbi
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div style={{ padding: '16px', background: 'var(--bg-body)', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Card Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{ fontSize: '14px', letterSpacing: '1px' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Expiry MM/YY</label>
                      <input
                        type="text"
                        className="form-control"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        style={{ fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>CVV Code</label>
                      <input
                        type="password"
                        className="form-control"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={4}
                        style={{ fontSize: '14px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div style={{ padding: '16px', background: 'var(--bg-body)', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Select Preferred Bank:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Bank of Maharashtra'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        className="btn btn-white btn-sm"
                        style={{ textAlign: 'left', padding: '10px', fontSize: '12px', fontWeight: 600 }}
                      >
                        🏛️ {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-white"
                  style={{ flex: 1 }}
                  onClick={() => setViewState('breakdown')}
                  disabled={isProcessing}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      Authorizing Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Complete Payment of ₹{totalFee.toLocaleString('en-IN')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW 3: OFFICIAL PRINTABLE RECEIPT
             ───────────────────────────────────────────────────────────── */}
          {viewState === 'receipt' && (
            <div
              id="printable-fee-receipt"
              style={{
                background: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                position: 'relative',
              }}
            >
              {/* Official Watermark */}
              <div
                style={{
                  position: 'absolute',
                  right: '15px',
                  bottom: '15px',
                  opacity: 0.04,
                  pointerEvents: 'none',
                }}
              >
                <ShieldCheck size={300} color="#1e1b4b" />
              </div>

              {/* Institution Header Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '2px solid #1e1b4b', paddingBottom: '16px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '12px',
                    background: '#1e1b4b',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '18px',
                    letterSpacing: '1px',
                    flexShrink: 0,
                  }}
                >
                  DCPE
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 800 }}>
                    Shree H.V.P. Mandal’s
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#1e1b4b', margin: 0 }}>
                    DEGREE COLLEGE OF PHYSICAL EDUCATION
                  </h2>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    Autonomous College • Multi-Faculty Post-Graduate & Degree Institution • Amravati (M.S.)
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> PAID IN FULL
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#1e1b4b', background: '#f1f5f9', padding: '6px', borderRadius: '6px' }}>
                  ACADEMIC SEMESTER FEE RECEIPT (ORIGINAL)
                </h3>
              </div>

              {/* Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '13px', marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Receipt No:</span> <strong>{txnId}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Payment Date:</span> <strong>{paymentDate}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Student Name:</span> <strong>{currentUser.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>PRN / Enrollment:</span> <strong>{currentUser.prn}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Course & Branch:</span> <strong>{currentUser.course}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Department:</span> <strong>{currentUser.departmentName}</strong>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ background: '#1e1b4b', color: 'white', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', borderRadius: '6px 0 0 6px' }}>#</th>
                    <th style={{ padding: '8px 10px' }}>Fee Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px' }}>1</td>
                    <td style={{ padding: '8px 10px' }}>Tuition & Academic Instruction Fee</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>₹{tuitionFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px' }}>2</td>
                    <td style={{ padding: '8px 10px' }}>Computer Lab, Cloud & Campus Wi-Fi Facilities</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>₹{labFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px' }}>3</td>
                    <td style={{ padding: '8px 10px' }}>Gymkhana, Swimming Pool & Sports Fund</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>₹{sportsFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px' }}>4</td>
                    <td style={{ padding: '8px 10px' }}>Semester End University Assessment & Exam Fee</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>₹{examFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px' }}>5</td>
                    <td style={{ padding: '8px 10px' }}>Central Library & Digital Journal Database Access</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>₹{libraryFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ background: '#f8fafc', fontWeight: 800, fontSize: '14px' }}>
                    <td colSpan={2} style={{ padding: '10px', textAlign: 'right' }}>Grand Total Paid:</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#1e1b4b' }}>₹{totalFee.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures & Stamp Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', marginTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '280px' }}>
                  * This is a computer-generated digital receipt and is valid across DCPE HVPM departments. No signature required.
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '130px', borderBottom: '1px solid #334155', marginBottom: '4px' }}></div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e1b4b' }}>
                    Finance Officer / Registrar
                  </span>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>DCPE HVPM Amravati</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
