import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Award, Briefcase, CreditCard, BookOpen, X, ArrowUp, ArrowDown, Minus } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   MOCK ANALYTICS DATA
   ═══════════════════════════════════════════════════════════════ */
function generateAnalytics(currentUser) {
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  return {
    attendance: { value: 84.2, trend: +2.1, sparkline: [72, 76, 80, 78, 82, 84] },
    passRate: { value: 91.5, trend: +1.8, sparkline: [85, 87, 89, 88, 90, 91] },
    placementRate: { value: 78.0, trend: +5.2, sparkline: [60, 65, 68, 72, 75, 78] },
    feeCollection: { value: 96.3, trend: -0.5, sparkline: [92, 94, 95, 97, 96, 96] },
    avgCGPA: { value: 7.82, trend: +0.15, sparkline: [7.4, 7.5, 7.6, 7.7, 7.8, 7.82] },
    libraryUsage: { value: 62, trend: +8, sparkline: [40, 45, 50, 55, 58, 62] },
    months,
    subjectPerformance: [
      { name: 'Cloud Computing', score: 82, color: '#3b82f6' },
      { name: 'Machine Learning', score: 76, color: '#8b5cf6' },
      { name: 'Database Systems', score: 88, color: '#059669' },
      { name: 'Software Architecture', score: 71, color: '#f97316' },
      { name: 'Data Science Lab', score: 90, color: '#ec4899' },
      { name: 'Web Engineering', score: 85, color: '#0891b2' },
    ],
    topPerformers: [
      { name: 'Priya Sharma', cgpa: 9.45, avatar: 'PS', badge: '🥇' },
      { name: 'Aarav Mehta', cgpa: 9.21, avatar: 'AM', badge: '🥈' },
      { name: 'Rohan Deshmukh', cgpa: 9.08, avatar: 'RD', badge: '🥉' },
      { name: 'Sneha Patil', cgpa: 8.95, avatar: 'SP', badge: '4' },
      { name: 'Karan Gupta', cgpa: 8.87, avatar: 'KG', badge: '5' },
    ],
    heatmapData: generateHeatmap(),
  };
}

function generateHeatmap() {
  const subjects = ['Cloud', 'ML', 'DBMS', 'SA', 'DS Lab', 'Web'];
  const metrics = ['Attendance', 'Avg Score', 'Pass Rate', 'Submissions'];
  const data = {};
  subjects.forEach(s => {
    data[s] = {};
    metrics.forEach(m => {
      data[s][m] = Math.floor(Math.random() * 40) + 60;
    });
  });
  return { subjects, metrics, data };
}

/* ═══════════════════════════════════════════════════════════════
   SPARKLINE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function Sparkline({ data, color, width = 80, height = 28 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#grad-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RADIAL GAUGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function RadialGauge({ value, max = 100, label, color, size = 100 }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease' }}
        />
      </svg>
      <div style={{ marginTop: '-64px', position: 'relative' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
          {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}
          {max === 100 ? '%' : ''}
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function DeptAnalyticsDashboardModal({ currentUser, onClose }) {
  const [activeSection, setActiveSection] = useState('overview');
  const analytics = useMemo(() => generateAnalytics(currentUser), [currentUser]);

  const kpiCards = [
    { label: 'Attendance', value: `${analytics.attendance.value}%`, trend: analytics.attendance.trend, color: '#059669', icon: Users, sparkline: analytics.attendance.sparkline },
    { label: 'Pass Rate', value: `${analytics.passRate.value}%`, trend: analytics.passRate.trend, color: '#3b82f6', icon: Award, sparkline: analytics.passRate.sparkline },
    { label: 'Placement', value: `${analytics.placementRate.value}%`, trend: analytics.placementRate.trend, color: '#8b5cf6', icon: Briefcase, sparkline: analytics.placementRate.sparkline },
    { label: 'Fee Collection', value: `${analytics.feeCollection.value}%`, trend: analytics.feeCollection.trend, color: '#f97316', icon: CreditCard, sparkline: analytics.feeCollection.sparkline },
    { label: 'Avg CGPA', value: analytics.avgCGPA.value.toFixed(2), trend: analytics.avgCGPA.trend, color: '#ec4899', icon: BookOpen, sparkline: analytics.avgCGPA.sparkline },
    { label: 'Library Usage', value: `${analytics.libraryUsage.value}%`, trend: analytics.libraryUsage.trend, color: '#0891b2', icon: BookOpen, sparkline: analytics.libraryUsage.sparkline },
  ];

  const { subjects, metrics, data } = analytics.heatmapData;

  function getHeatColor(val) {
    if (val >= 90) return 'rgba(16,185,129,0.6)';
    if (val >= 80) return 'rgba(59,130,246,0.5)';
    if (val >= 70) return 'rgba(245,158,11,0.4)';
    return 'rgba(239,68,68,0.4)';
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 960, width: '95vw', maxHeight: '92vh', overflow: 'hidden',
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #0a0a1a 0%, #111827 40%, #1a1a2e 100%)',
          color: '#e2e8f0', position: 'relative', display: 'flex', flexDirection: 'column',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '14px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
            }}>
              <BarChart3 size={26} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>
                📊 Department Analytics
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                {currentUser?.department?.toUpperCase() || 'CS'} Department • Real-time Insights
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px',
            padding: '8px', cursor: 'pointer', color: '#94a3b8',
          }}>
            <X size={20} />
          </button>
        </div>

        {/* ── Section Tabs ── */}
        <div style={{ padding: '12px 28px 0', display: 'flex', gap: '6px' }}>
          {[
            { key: 'overview', label: '📈 Overview' },
            { key: 'subjects', label: '📚 Subjects' },
            { key: 'heatmap', label: '🔥 Heatmap' },
            { key: 'toppers', label: '🏆 Toppers' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveSection(t.key)} style={{
              background: activeSection === t.key ? 'rgba(59,130,246,0.15)' : 'transparent',
              border: `1px solid ${activeSection === t.key ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '10px', padding: '7px 14px',
              color: activeSection === t.key ? '#60a5fa' : 'rgba(255,255,255,0.5)',
              fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>

          {/* OVERVIEW */}
          {activeSection === 'overview' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {kpiCards.map((kpi, i) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '14px', padding: '18px', transition: 'all 0.3s', cursor: 'default',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${kpi.color}40`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={18} color={kpi.color} />
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '3px',
                          fontSize: '11px', fontWeight: 700,
                          color: kpi.trend > 0 ? '#10b981' : kpi.trend < 0 ? '#ef4444' : '#94a3b8',
                        }}>
                          {kpi.trend > 0 ? <ArrowUp size={12} /> : kpi.trend < 0 ? <ArrowDown size={12} /> : <Minus size={12} />}
                          {Math.abs(kpi.trend).toFixed(1)}%
                        </div>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{kpi.value}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>{kpi.label}</div>
                      <Sparkline data={kpi.sparkline} color={kpi.color} width={160} height={30} />
                    </div>
                  );
                })}
              </div>

              {/* Radial Gauges Row */}
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '24px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px',
              }}>
                <RadialGauge value={analytics.attendance.value} label="Attendance" color="#059669" />
                <RadialGauge value={analytics.passRate.value} label="Pass Rate" color="#3b82f6" />
                <RadialGauge value={analytics.placementRate.value} label="Placement" color="#8b5cf6" />
                <RadialGauge value={analytics.feeCollection.value} label="Fee Collection" color="#f97316" />
              </div>
            </>
          )}

          {/* SUBJECTS */}
          {activeSection === 'subjects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                📚 Subject-wise Performance
              </h3>
              {analytics.subjectPerformance.map((sub, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px', padding: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{sub.name}</span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: sub.color }}>{sub.score}%</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${sub.score}%`, height: '100%', borderRadius: '10px',
                      background: `linear-gradient(90deg, ${sub.color}88, ${sub.color})`,
                      transition: 'width 1.5s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* HEATMAP */}
          {activeSection === 'heatmap' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔥 Performance Heatmap
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Subject</th>
                      {metrics.map(m => (
                        <th key={m} style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(s => (
                      <tr key={s}>
                        <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 600, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{s}</td>
                        {metrics.map(m => {
                          const val = data[s][m];
                          return (
                            <td key={m} style={{ padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{
                                background: getHeatColor(val), borderRadius: '8px',
                                padding: '10px', textAlign: 'center', fontSize: '14px',
                                fontWeight: 700, color: '#fff', transition: 'all 0.3s',
                                cursor: 'default',
                              }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                {val}%
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '14px', justifyContent: 'center' }}>
                {[
                  { label: '90%+', color: 'rgba(16,185,129,0.6)' },
                  { label: '80-89%', color: 'rgba(59,130,246,0.5)' },
                  { label: '70-79%', color: 'rgba(245,158,11,0.4)' },
                  { label: '<70%', color: 'rgba(239,68,68,0.4)' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '4px', background: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOPPERS */}
          {activeSection === 'toppers' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏆 Top Performers
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analytics.topPerformers.map((tp, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: i === 0 ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '14px', padding: '14px 18px', transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{ fontSize: '22px', width: 36, textAlign: 'center' }}>{tp.badge}</div>
                    <div style={{
                      width: 44, height: 44, borderRadius: '12px',
                      background: i === 0 ? 'linear-gradient(135deg, #ffd700, #f59e0b)' : 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>
                      {tp.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{tp.name}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>Top Performer</div>
                    </div>
                    <div style={{
                      fontSize: '18px', fontWeight: 800,
                      color: i === 0 ? '#ffd700' : '#60a5fa',
                    }}>
                      {tp.cgpa}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
