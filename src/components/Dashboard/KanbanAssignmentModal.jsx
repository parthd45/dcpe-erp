import React, { useState } from 'react';
import { ClipboardList, X, Plus, Clock, AlertTriangle, CheckCircle2, GripVertical, Calendar, BookOpen } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   KANBAN COLUMNS
   ═══════════════════════════════════════════════════════════════ */
const COLUMNS = [
  { key: 'todo',       label: '📋 To Do',        color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  { key: 'inprogress', label: '🔨 In Progress',  color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  { key: 'submitted',  label: '📤 Submitted',    color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { key: 'graded',     label: '✅ Graded',       color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
];

const PRIORITY_COLORS = {
  high:   { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  low:    { label: 'Low',    color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};

/* ═══════════════════════════════════════════════════════════════
   INITIAL ASSIGNMENTS DATA
   ═══════════════════════════════════════════════════════════════ */
const INITIAL_ASSIGNMENTS = [
  { id: 'a1', title: 'Cloud Computing Lab Report #3', subject: 'Cloud Computing', deadline: '2026-03-15', priority: 'high', status: 'todo', grade: null },
  { id: 'a2', title: 'ML Neural Network Implementation', subject: 'Machine Learning', deadline: '2026-03-18', priority: 'high', status: 'todo', grade: null },
  { id: 'a3', title: 'ER Diagram - Library System', subject: 'Database Systems', deadline: '2026-03-20', priority: 'medium', status: 'inprogress', grade: null },
  { id: 'a4', title: 'Design Patterns Case Study', subject: 'Software Architecture', deadline: '2026-03-12', priority: 'medium', status: 'inprogress', grade: null },
  { id: 'a5', title: 'Data Visualization Dashboard', subject: 'Data Science Lab', deadline: '2026-03-10', priority: 'low', status: 'submitted', grade: null },
  { id: 'a6', title: 'REST API Development', subject: 'Web Engineering', deadline: '2026-03-05', priority: 'medium', status: 'submitted', grade: null },
  { id: 'a7', title: 'Cloud Security Research Paper', subject: 'Cloud Computing', deadline: '2026-02-28', priority: 'high', status: 'graded', grade: 'A+' },
  { id: 'a8', title: 'SQL Query Optimization', subject: 'Database Systems', deadline: '2026-02-25', priority: 'low', status: 'graded', grade: 'A' },
  { id: 'a9', title: 'K-Means Clustering Lab', subject: 'Machine Learning', deadline: '2026-02-20', priority: 'medium', status: 'graded', grade: 'B+' },
];

function isOverdue(deadline) {
  return new Date(deadline) < new Date();
}

function daysUntil(deadline) {
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function KanbanAssignmentModal({ currentUser, onClose }) {
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [draggedId, setDraggedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', subject: '', deadline: '', priority: 'medium' });

  const moveTask = (taskId, newStatus) => {
    setAssignments(prev => prev.map(a => a.id === taskId ? { ...a, status: newStatus } : a));
  };

  const handleDragStart = (id) => setDraggedId(id);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (colKey) => {
    if (draggedId) {
      moveTask(draggedId, colKey);
      setDraggedId(null);
    }
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task = {
      id: `a_${Date.now()}`,
      title: newTask.title,
      subject: newTask.subject || 'General',
      deadline: newTask.deadline || new Date().toISOString().slice(0, 10),
      priority: newTask.priority,
      status: 'todo',
      grade: null,
    };
    setAssignments(prev => [task, ...prev]);
    setNewTask({ title: '', subject: '', deadline: '', priority: 'medium' });
    setShowAddForm(false);
  };

  const totalTasks = assignments.length;
  const completedTasks = assignments.filter(a => a.status === 'graded').length;
  const progressPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        maxWidth: 1100, width: '96vw', maxHeight: '92vh', overflow: 'hidden',
        borderRadius: '20px',
        background: 'linear-gradient(145deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%)',
        color: '#e2e8f0', display: 'flex', flexDirection: 'column',
      }}>
        {/* ── Header ── */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '14px',
              background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(8,145,178,0.3)',
            }}>
              <ClipboardList size={26} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>📋 Assignment Tracker</h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                Drag & drop to update progress
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setShowAddForm(true)} style={{
              background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
              border: 'none', borderRadius: '10px', padding: '8px 16px',
              color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Plus size={14} /> Add Task
            </button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Progress Bar ── */}
        <div style={{ padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            Progress: {completedTasks}/{totalTasks} completed
          </span>
          <div style={{ flex: 1, height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPct}%`, height: '100%', borderRadius: 6,
              background: 'linear-gradient(90deg, #0891b2, #10b981)',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>{progressPct.toFixed(0)}%</span>
        </div>

        {/* ── Kanban Board ── */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '8px 28px 28px' }}>
          <div style={{ display: 'flex', gap: '14px', minWidth: 'max-content', height: '100%' }}>
            {COLUMNS.map(col => {
              const colTasks = assignments.filter(a => a.status === col.key);
              return (
                <div
                  key={col.key}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(col.key)}
                  style={{
                    width: 260, minWidth: 260, flexShrink: 0,
                    background: col.bg, border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px', display: 'flex', flexDirection: 'column',
                    maxHeight: 'calc(92vh - 180px)',
                  }}
                >
                  {/* Column Header */}
                  <div style={{
                    padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{col.label}</span>
                    <span style={{
                      background: `${col.color}20`, color: col.color,
                      borderRadius: '8px', padding: '2px 8px', fontSize: '11px', fontWeight: 700,
                    }}>
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {colTasks.map(task => {
                      const prio = PRIORITY_COLORS[task.priority];
                      const overdue = isOverdue(task.deadline) && task.status !== 'graded';
                      const days = daysUntil(task.deadline);
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(task.id)}
                          style={{
                            background: overdue ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${overdue ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '10px', padding: '12px',
                            cursor: 'grab', transition: 'all 0.2s',
                            boxShadow: overdue ? '0 0 12px rgba(239,68,68,0.1)' : 'none',
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <GripVertical size={12} color="rgba(255,255,255,0.2)" />
                            <span style={{
                              fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px',
                              background: prio.bg, color: prio.color,
                            }}>
                              {prio.label}
                            </span>
                            {overdue && (
                              <span style={{ fontSize: '10px', fontWeight: 600, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <AlertTriangle size={10} /> Overdue
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px', lineHeight: 1.3 }}>
                            {task.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                            <BookOpen size={10} /> {task.subject}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '10px', color: overdue ? '#ef4444' : days <= 3 ? '#f59e0b' : 'rgba(255,255,255,0.35)',
                              display: 'flex', alignItems: 'center', gap: '3px',
                            }}>
                              <Calendar size={10} />
                              {task.status === 'graded' ? 'Completed' : overdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                            </span>
                            {task.grade && (
                              <span style={{
                                fontSize: '12px', fontWeight: 800,
                                color: task.grade.startsWith('A') ? '#10b981' : task.grade.startsWith('B') ? '#3b82f6' : '#f59e0b',
                              }}>
                                {task.grade}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {colTasks.length === 0 && (
                      <div style={{
                        textAlign: 'center', padding: '30px 10px', color: 'rgba(255,255,255,0.2)',
                        fontSize: '12px', border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '10px',
                      }}>
                        Drop tasks here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Add Task Modal ── */}
        {showAddForm && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} onClick={() => setShowAddForm(false)}>
            <div onClick={e => e.stopPropagation()} style={{
              maxWidth: 420, width: '90vw', borderRadius: '16px',
              background: 'linear-gradient(145deg, #1a1a3e, #24243e)',
              border: '1px solid rgba(255,255,255,0.1)', padding: '24px',
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#fff' }}>➕ New Assignment</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  placeholder="Assignment title..."
                  value={newTask.title}
                  onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <input
                  placeholder="Subject..."
                  value={newTask.subject}
                  onChange={e => setNewTask(p => ({ ...p, subject: e.target.value }))}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={e => setNewTask(p => ({ ...p, deadline: e.target.value }))}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <select
                  value={newTask.priority}
                  onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                >
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🟢 Low Priority</option>
                </select>
                <button onClick={addTask} style={{
                  background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                  border: 'none', borderRadius: '10px', padding: '12px', cursor: 'pointer',
                  color: '#fff', fontWeight: 700, fontSize: '13px',
                }}>
                  Add to Board
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
