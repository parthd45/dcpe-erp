import React, { useState } from 'react';
import {
  ShieldAlert, AlertTriangle, CheckCircle2, Calculator,
  TrendingDown, TrendingUp, Calendar, ArrowRight, X, Sparkles, AlertCircle
} from 'lucide-react';
import './Dashboard.css';

export function AttendanceRiskRadarModal({ currentUser, attendanceStats, onClose, onOpenLeaveModal }) {
  if (!currentUser) return null;

  // Total and attended classes from stats or estimation
  const currentPct = parseFloat(attendanceStats?.overallPercentage || currentUser.attendance || '78.5');
  const estimatedTotalClasses = 60; // Standard semester lectures so far
  const initialAttended = Math.round((currentPct / 100) * estimatedTotalClasses);

  const [missedCount, setMissedCount] = useState(0);
  const [targetGoalPct, setTargetGoalPct] = useState(80);

  // Dynamic calculations
  const projectedTotal = estimatedTotalClasses + missedCount;
  const projectedPct = ((initialAttended / projectedTotal) * 100).toFixed(1);
  const projectedPctNum = parseFloat(projectedPct);

  // Classes needed to reach target goal (e.g., 80% or 85%)
  // target = (initialAttended + X) / (estimatedTotalClasses + X)
  // X * (1 - target) = target * total - attended
  const calculateClassesNeeded = (targetPct) => {
    const targetRatio = targetPct / 100;
    if (currentPct >= targetPct) return 0;
    const needed = Math.ceil((targetRatio * estimatedTotalClasses - initialAttended) / (1 - targetRatio));
    return Math.max(0, needed);
  };

  const classesNeededForTarget = calculateClassesNeeded(targetGoalPct);

  // Determine Risk Category
  let riskStatus = {
    label: 'SAFE ZONE',
    color: '#059669',
    bg: '#ecfdf5',
    borderColor: '#a7f3d0',
    icon: <CheckCircle2 size={22} color="#059669" />,
    message: 'Your attendance is above the 75% mandate. You are eligible for Hall Tickets, Gatepasses, and Campus Drives.',
  };

  if (projectedPctNum < 70) {
    riskStatus = {
      label: 'CRITICAL DANGER (DETAINED RISK)',
      color: '#dc2626',
      bg: '#fef2f2',
      borderColor: '#fecaca',
      icon: <ShieldAlert size={22} color="#dc2626" />,
      message: 'CRITICAL: Attendance will drop below 70%! An official Attendance Warning Letter will be generated for your guardian, and Hall Ticket will be locked.',
    };
  } else if (projectedPctNum < 75) {
    riskStatus = {
      label: 'WARNING ZONE (CAUTION)',
      color: '#d97706',
      bg: '#fffbeb',
      borderColor: '#fde68a',
      icon: <AlertTriangle size={22} color="#d97706" />,
      message: 'CAUTION: Your projected attendance is falling below 75%. You will be marked ineligible for upcoming examination hall tickets unless excused by medical leave.',
    };
  }

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
          maxWidth: '650px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            background: '#1e1b4b',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '15px' }}>
            <Calculator size={20} color="#818cf8" />
            Smart Attendance Risk Radar & Absence Simulator
          </div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {/* Current Stats Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Verified Attendance</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-heading)', marginTop: '2px' }}>
                {currentPct}%
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Attended ~{initialAttended} of {estimatedTotalClasses} lectures
              </div>
            </div>

            <div style={{ background: riskStatus.bg, padding: '16px', borderRadius: '16px', border: `1px solid ${riskStatus.borderColor}` }}>
              <div style={{ fontSize: '12px', color: riskStatus.color, fontWeight: 700 }}>Projected Status</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: riskStatus.color, marginTop: '2px' }}>
                {projectedPct}%
              </div>
              <div style={{ fontSize: '11px', color: riskStatus.color, fontWeight: 700, marginTop: '4px' }}>
                {riskStatus.label}
              </div>
            </div>
          </div>

          {/* Risk Alert Box */}
          <div
            style={{
              background: riskStatus.bg,
              border: `1px solid ${riskStatus.borderColor}`,
              borderRadius: '16px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            {riskStatus.icon}
            <div style={{ fontSize: '13px', color: riskStatus.color, fontWeight: 600, lineHeight: 1.4 }}>
              {riskStatus.message}
            </div>
          </div>

          {/* Interactive Absence Simulator Slider */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid var(--border-light)',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)' }}>
                🔮 Simulate Future Class Absences:
              </label>
              <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 12px', borderRadius: '20px', fontWeight: 800, fontSize: '13px' }}>
                {missedCount} {missedCount === 1 ? 'Lecture' : 'Lectures'} Missed
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={missedCount}
              onChange={(e) => setMissedCount(parseInt(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--primary)',
                height: '8px',
                cursor: 'pointer',
                marginBottom: '12px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>0 Missed (Optimal)</span>
              <span>10 Missed</span>
              <span>25 Missed (Extreme Danger)</span>
            </div>
          </div>

          {/* Attendance Target Calculator */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="var(--primary)" /> Attendance Target Calculator
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Set Desired Goal:</span>
              {[75, 80, 85, 90].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  className={`btn btn-sm ${targetGoalPct === pct ? 'btn-primary' : 'btn-white'}`}
                  style={{ borderRadius: '20px', padding: '4px 14px', fontSize: '12px' }}
                  onClick={() => setTargetGoalPct(pct)}
                >
                  {pct}% Goal
                </button>
              ))}
            </div>

            <div style={{ background: '#f1f5f9', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Classes needed to reach <strong>{targetGoalPct}%</strong>:</span>
              <span style={{ fontWeight: 800, fontSize: '16px', color: classesNeededForTarget === 0 ? '#059669' : 'var(--primary)' }}>
                {classesNeededForTarget === 0 ? 'Goal Achieved ✓' : `+${classesNeededForTarget} Consecutive Lectures`}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            background: '#f8fafc',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Min. required attendance for hall ticket: <strong>75.0%</strong>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {onOpenLeaveModal && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onClose();
                  onOpenLeaveModal();
                }}
              >
                Apply Medical / Duty Leave <ArrowRight size={14} />
              </button>
            )}
            <button type="button" className="btn btn-white btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
