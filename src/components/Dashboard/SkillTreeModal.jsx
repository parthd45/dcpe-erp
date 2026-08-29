import React, { useState } from 'react';
import {
  Trophy, Award, Zap, CheckCircle2, Lock, Sparkles, X, ChevronRight,
  BookOpen, Brain, Flame, Star, Compass, Layers, ShieldCheck, Play
} from 'lucide-react';
import './Dashboard.css';

// RPG Skill Tree Data Nodes per Department / Course
const SKILL_TREES = {
  bca: {
    courseTitle: 'BCA & Computer Applications Competency Tree',
    icon: '💻',
    color: '#3b82f6',
    totalXp: 3400,
    userXp: 2450,
    rank: 'Gold Tier • Level 12 Architect',
    streakDays: 14,
    tiers: [
      {
        tierName: 'Tier 1: Programming Fundamentals',
        nodes: [
          { id: 'c_prog', name: 'C Programming & Logic', xp: 300, status: 'unlocked', icon: '⚡', desc: 'Control flow, pointers, memory allocation & recursion.' },
          { id: 'web_basics', name: 'HTML5 & CSS3 Responsive Web', xp: 300, status: 'unlocked', icon: '🌐', desc: 'Flexbox, Grid, semantic HTML, and media queries.' },
          { id: 'js_es6', name: 'JavaScript ES6+ & Async JS', xp: 450, status: 'unlocked', icon: '🟨', desc: 'Promises, Async/Await, closures, and Event Loop.' },
        ],
      },
      {
        tierName: 'Tier 2: Core Engineering & Systems',
        nodes: [
          { id: 'react_framework', name: 'React.js Frontend Architecture', xp: 500, status: 'unlocked', icon: '⚛️', desc: 'Hooks, Virtual DOM diffing, and Context API.' },
          { id: 'dbms_sql', name: 'SQL & Database Normalization', xp: 500, status: 'unlocked', icon: '🗄️', desc: 'INNER JOINs, 3NF normalization, and indexing.' },
          { id: 'os_concepts', name: 'Operating System & Threads', xp: 400, status: 'in_progress', icon: '💻', desc: 'CPU scheduling algorithms, deadlocks, and paging.' },
        ],
      },
      {
        tierName: 'Tier 3: Advanced Architect & Cloud',
        nodes: [
          { id: 'python_dsa', name: 'Data Structures & Algorithms', xp: 600, status: 'in_progress', icon: '🧠', desc: 'Dijkstra shortest path, BSTs, and Big-O analysis.' },
          { id: 'cloud_devops', name: 'Cloud Computing & Docker WASM', xp: 600, status: 'locked', icon: '☁️', desc: 'AWS EC2, Docker containerization, and CI/CD pipelines.' },
        ],
      },
    ],
  },
  bped: {
    courseTitle: 'B.P.Ed & Physical Education Skill Matrix',
    icon: '🏅',
    color: '#059669',
    totalXp: 3200,
    userXp: 2600,
    rank: 'Gold Tier • Master Sports Director',
    streakDays: 21,
    tiers: [
      {
        tierName: 'Tier 1: Human Anatomy & Physiology',
        nodes: [
          { id: 'anatomy_101', name: 'Musculoskeletal System', xp: 350, status: 'unlocked', icon: '🦴', desc: 'Skeletal anatomy, joint articulation, and muscle insertion.' },
          { id: 'kinesiology', name: 'Kinesiology & Human Movement', xp: 400, status: 'unlocked', icon: '🏃', desc: 'Kinetic chain analysis, planes of movement, and posture.' },
        ],
      },
      {
        tierName: 'Tier 2: Athletic Conditioning & Rules',
        nodes: [
          { id: 'biomechanics', name: 'Sports Biomechanics & Dynamics', xp: 550, status: 'unlocked', icon: '📐', desc: 'Ground reaction force, sprinter angles, and projectile arc.' },
          { id: 'tournament_duty', name: 'SGBAU Tournament Bylaws', xp: 500, status: 'unlocked', icon: '📜', desc: 'Official 15% duty leave condonation & referee rules.' },
        ],
      },
      {
        tierName: 'Tier 3: Elite Coaching & Sports Science',
        nodes: [
          { id: 'periodization', name: 'Athletic Periodization & Training', xp: 700, status: 'in_progress', icon: '⏱️', desc: 'Macrocycle planning, ATP energy systems, and recovery.' },
          { id: 'sports_analytics', name: 'Sports Performance Analytics', xp: 700, status: 'locked', icon: '📊', desc: 'VO2 max estimation, heart rate variability, and fatigue index.' },
        ],
      },
    ],
  },
};

export function SkillTreeModal({ currentUser, onClose }) {
  const courseKey = (currentUser?.course || '').toLowerCase().includes('bped') || (currentUser?.course || '').toLowerCase().includes('mped') ? 'bped' : 'bca';
  const treeData = SKILL_TREES[courseKey] || SKILL_TREES.bca;

  const [selectedNode, setSelectedNode] = useState(treeData.tiers[0].nodes[0]);

  const progressPct = Math.round((treeData.userXp / treeData.totalXp) * 100);

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
          maxWidth: '980px',
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
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
                  RPG Student Skill Tree &amp; Competency Matrix
                </h3>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 99, background: '#f59e0b', color: 'white', fontWeight: 700 }}>
                  {treeData.rank}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Degree College of Physical Education (DCPE Autonomous) • Competency Mastery Map
              </span>
            </div>
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* XP Progress Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Course Competency XP Progress
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, marginTop: '2px' }}>
                {treeData.userXp} / {treeData.totalXp} XP ({progressPct}%)
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 99, fontSize: '12px', fontWeight: 800 }}>
              <Flame size={16} color="#f59e0b" fill="#f59e0b" /> {treeData.streakDays} Day Learning Streak!
            </div>
          </div>

          <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 99, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Interactive Skill Tree Node Graph Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          {/* Left: Tiers & Nodes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {treeData.tiers.map((tier, tIdx) => (
              <div key={tIdx} style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  {tier.tierName}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tier.nodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const isUnlocked = node.status === 'unlocked';
                    const isInProgress = node.status === 'in_progress';

                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedNode(node)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: isSelected ? '#eff6ff' : 'white',
                          border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-light)',
                          borderRadius: '14px',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ fontSize: '20px' }}>{node.icon}</div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-heading)' }}>{node.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>+{node.xp} XP Points</div>
                          </div>
                        </div>

                        <div>
                          {isUnlocked ? (
                            <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: 99, background: '#ecfdf5', color: '#047857', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={13} /> Unlocked
                            </span>
                          ) : isInProgress ? (
                            <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: 99, background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Zap size={13} /> Active
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: 99, background: '#f1f5f9', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Lock size={13} /> Locked
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Selected Node Competency Detail */}
          {selectedNode && (
            <div style={{ border: '1px solid var(--border-light)', borderRadius: '20px', padding: '24px', background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    {selectedNode.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-heading)' }}>{selectedNode.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>+{selectedNode.xp} XP Mastery Award</span>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '20px' }}>
                  {selectedNode.desc}
                </p>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '20px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-heading)', marginBottom: '6px' }}>Mastery Prerequisites:</div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-muted)' }}>
                    <li>80%+ Lecture attendance in active semester</li>
                    <li>Pass subject MCQ quiz with 70%+ score</li>
                    <li>Submit lab assignment on Kanban board</li>
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedNode.status === 'unlocked' ? (
                  <div style={{ background: '#ecfdf5', color: '#047857', padding: '12px', borderRadius: '12px', textAlign: 'center', fontWeight: 800, fontSize: '13px', border: '1px solid #a7f3d0' }}>
                    ✅ Competency Fully Unlocked &amp; Verified in Ledger
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => alert(`Launching practice quiz module for ${selectedNode.name}...`)}
                    style={{ width: '100%', fontWeight: 800 }}
                  >
                    Start Competency Quiz &amp; Unlock Node <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
