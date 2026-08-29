import React, { useState } from 'react';
import { Brain, Cpu, Globe, Shield, Database, BarChart3, X, ChevronRight, Star, Zap, Target, TrendingUp } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   CAREER TRACKS
   ═══════════════════════════════════════════════════════════════ */
const CAREER_TRACKS = [
  {
    id: 'webdev',
    title: 'Full-Stack Web Development',
    emoji: '🌐',
    icon: Globe,
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    color: '#3b82f6',
    matchPct: 87,
    salary: '₹8-25 LPA',
    companies: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Razorpay'],
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    currentSkills: 4,
    totalSkills: 5,
    recommendations: [
      'Complete a full-stack capstone project with CI/CD pipeline',
      'Learn TypeScript to boost your match by 8%',
      'Contribute to 2+ open-source React projects',
    ],
    nodes: [
      { label: 'HTML/CSS', done: true },
      { label: 'JavaScript', done: true },
      { label: 'React', done: true },
      { label: 'Node.js', done: true },
      { label: 'TypeScript', done: false },
      { label: 'System Design', done: false },
    ],
  },
  {
    id: 'datascience',
    title: 'Data Science & AI/ML',
    emoji: '🧠',
    icon: Brain,
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    color: '#8b5cf6',
    matchPct: 72,
    salary: '₹10-30 LPA',
    companies: ['DeepMind', 'OpenAI', 'Meta AI', 'TCS Research', 'Infosys BPM'],
    skills: ['Python', 'TensorFlow', 'Statistics', 'NLP', 'MLOps'],
    currentSkills: 3,
    totalSkills: 5,
    recommendations: [
      'Complete ML specialization on Coursera',
      'Build 2 end-to-end ML projects with deployment',
      'Learn MLOps (Docker + Kubernetes) to improve match by 12%',
    ],
    nodes: [
      { label: 'Python', done: true },
      { label: 'Statistics', done: true },
      { label: 'ML Basics', done: true },
      { label: 'Deep Learning', done: false },
      { label: 'NLP', done: false },
      { label: 'MLOps', done: false },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud & DevOps Engineering',
    emoji: '☁️',
    icon: Cpu,
    gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    color: '#f97316',
    matchPct: 65,
    salary: '₹12-35 LPA',
    companies: ['AWS', 'Azure', 'GCP', 'HashiCorp', 'RedHat'],
    skills: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
    currentSkills: 2,
    totalSkills: 5,
    recommendations: [
      'Get AWS Cloud Practitioner certification',
      'Learn Docker & Kubernetes hands-on',
      'Set up a CI/CD pipeline for your college project',
    ],
    nodes: [
      { label: 'Linux', done: true },
      { label: 'Networking', done: true },
      { label: 'Docker', done: false },
      { label: 'Kubernetes', done: false },
      { label: 'Terraform', done: false },
      { label: 'AWS/GCP', done: false },
    ],
  },
  {
    id: 'cybersec',
    title: 'Cybersecurity & Ethical Hacking',
    emoji: '🛡️',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    color: '#059669',
    matchPct: 58,
    salary: '₹8-28 LPA',
    companies: ['Palo Alto', 'CrowdStrike', 'Fortinet', 'Wipro Cyber', 'Quick Heal'],
    skills: ['Pentesting', 'SIEM', 'Network Security', 'Cryptography', 'OSCP'],
    currentSkills: 2,
    totalSkills: 5,
    recommendations: [
      'Complete TryHackMe or HackTheBox beginner path',
      'Learn network scanning with Nmap & Wireshark',
      'Study OWASP Top 10 vulnerabilities',
    ],
    nodes: [
      { label: 'Networking', done: true },
      { label: 'Linux Admin', done: true },
      { label: 'Pentesting', done: false },
      { label: 'SIEM', done: false },
      { label: 'Cryptography', done: false },
      { label: 'OSCP Cert', done: false },
    ],
  },
  {
    id: 'database',
    title: 'Database & Backend Engineering',
    emoji: '🗃️',
    icon: Database,
    gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
    color: '#0891b2',
    matchPct: 80,
    salary: '₹7-22 LPA',
    companies: ['Oracle', 'MongoDB', 'Snowflake', 'Cockroach Labs', 'Supabase'],
    skills: ['SQL', 'NoSQL', 'Redis', 'System Design', 'API Design'],
    currentSkills: 3,
    totalSkills: 5,
    recommendations: [
      'Master advanced SQL (CTEs, window functions, query optimization)',
      'Build a REST + GraphQL API from scratch',
      'Learn Redis caching patterns for production systems',
    ],
    nodes: [
      { label: 'SQL', done: true },
      { label: 'NoSQL', done: true },
      { label: 'ORM', done: true },
      { label: 'Redis', done: false },
      { label: 'System Design', done: false },
      { label: 'Distributed DB', done: false },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   SKILL TREE NODE
   ═══════════════════════════════════════════════════════════════ */
function SkillTreeNode({ node, index, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
      {index > 0 && (
        <div style={{
          width: 24, height: 2,
          background: node.done ? color : 'rgba(255,255,255,0.1)',
          transition: 'background 0.3s',
        }} />
      )}
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: node.done ? `${color}25` : 'rgba(255,255,255,0.04)',
        border: `2px solid ${node.done ? color : 'rgba(255,255,255,0.1)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', flexShrink: 0, transition: 'all 0.3s',
        boxShadow: node.done ? `0 0 16px ${color}30` : 'none',
      }}>
        {node.done ? (
          <Star size={16} color={color} fill={color} />
        ) : (
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
        )}
        <div style={{
          position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)',
          fontSize: '9px', fontWeight: 600, whiteSpace: 'nowrap',
          color: node.done ? '#fff' : 'rgba(255,255,255,0.35)',
        }}>
          {node.label}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function AICareerPathModal({ currentUser, onClose }) {
  const [selectedTrack, setSelectedTrack] = useState(null);

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 920, width: '95vw', maxHeight: '92vh', overflow: 'hidden',
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%)',
          color: '#e2e8f0', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '14px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
            }}>
              <Brain size={26} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>
                🧠 AI Career Path Predictor
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                Personalized career guidance based on your skills & performance
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

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>

          {!selectedTrack ? (
            <>
              {/* AI Summary */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.08))',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: '14px', padding: '16px 20px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <Zap size={20} color="#a855f7" />
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  Based on your <strong style={{ color: '#fff' }}>marks, course, and skills</strong>, AI predicts your
                  strongest career fit is <strong style={{ color: '#3b82f6' }}>Full-Stack Web Development (87%)</strong>.
                  Explore all tracks below and see what you need to improve.
                </div>
              </div>

              {/* Career Track Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {CAREER_TRACKS.map(track => {
                  const Icon = track.icon;
                  return (
                    <div
                      key={track.id}
                      onClick={() => setSelectedTrack(track)}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px', padding: '20px', cursor: 'pointer',
                        transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = `${track.color}40`;
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = `0 8px 30px ${track.color}15`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Glow */}
                      <div style={{
                        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                        borderRadius: '50%', background: `${track.color}10`, filter: 'blur(30px)',
                      }} />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: '12px',
                          background: track.gradient,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: `0 4px 16px ${track.color}30`,
                        }}>
                          <Icon size={22} color="#fff" />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{track.emoji} {track.title}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{track.salary}</div>
                        </div>
                      </div>

                      {/* Match % ring */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ position: 'relative', width: 50, height: 50 }}>
                          <svg width={50} height={50} style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx={25} cy={25} r={20} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                            <circle
                              cx={25} cy={25} r={20} fill="none"
                              stroke={track.color} strokeWidth="5" strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 20}
                              strokeDashoffset={2 * Math.PI * 20 * (1 - track.matchPct / 100)}
                              style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                            />
                          </svg>
                          <div style={{
                            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 800, color: track.color,
                          }}>
                            {track.matchPct}%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Career Match</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                            {track.currentSkills}/{track.totalSkills} skills mastered
                          </div>
                        </div>
                      </div>

                      {/* Companies */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {track.companies.slice(0, 3).map(c => (
                          <span key={c} style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '6px', padding: '2px 8px', fontSize: '10px', color: 'rgba(255,255,255,0.5)',
                          }}>
                            {c}
                          </span>
                        ))}
                        {track.companies.length > 3 && (
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', padding: '2px 4px' }}>
                            +{track.companies.length - 3} more
                          </span>
                        )}
                      </div>

                      <div style={{
                        marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '12px', fontWeight: 600, color: track.color,
                      }}>
                        Explore Path <ChevronRight size={14} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* ── DETAILED TRACK VIEW ── */
            <>
              <button
                onClick={() => setSelectedTrack(null)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '8px 16px', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '12px', marginBottom: '16px',
                }}
              >
                ← Back to All Tracks
              </button>

              {/* Track Header */}
              <div style={{
                background: `linear-gradient(135deg, ${selectedTrack.color}12, ${selectedTrack.color}06)`,
                border: `1px solid ${selectedTrack.color}25`,
                borderRadius: '16px', padding: '24px', marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '16px',
                    background: selectedTrack.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 24px ${selectedTrack.color}30`,
                  }}>
                    {React.createElement(selectedTrack.icon, { size: 28, color: '#fff' })}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                      {selectedTrack.emoji} {selectedTrack.title}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                      Salary Range: {selectedTrack.salary} • Match: {selectedTrack.matchPct}%
                    </p>
                  </div>
                </div>

                {/* Big match gauge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Your Career Match</span>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: selectedTrack.color }}>{selectedTrack.matchPct}%</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 10, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${selectedTrack.matchPct}%`, height: '100%', borderRadius: 10,
                        background: selectedTrack.gradient,
                        transition: 'width 1.5s ease',
                        boxShadow: `0 0 16px ${selectedTrack.color}40`,
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Tree */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '20px', marginBottom: '20px',
              }}>
                <h4 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={16} color={selectedTrack.color} /> Skill Tree Progress
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0', paddingBottom: '20px' }}>
                  {selectedTrack.nodes.map((node, i) => (
                    <SkillTreeNode key={i} node={node} index={i} color={selectedTrack.color} />
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '20px', marginBottom: '20px',
              }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={16} color="#10b981" /> AI Recommendations
                </h4>
                {selectedTrack.recommendations.map((rec, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '10px 0', borderBottom: i < selectedTrack.recommendations.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '6px',
                      background: `${selectedTrack.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700, color: selectedTrack.color, flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{rec}</span>
                  </div>
                ))}
              </div>

              {/* Top Hiring Companies */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '20px',
              }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                  🏢 Top Hiring Companies
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedTrack.companies.map(c => (
                    <span key={c} style={{
                      background: `${selectedTrack.color}10`, border: `1px solid ${selectedTrack.color}25`,
                      borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: '#fff',
                    }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
