import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, BookOpen, Trophy, PartyPopper, Clock, Palmtree } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   EVENT DATA GENERATOR
   ═══════════════════════════════════════════════════════════════ */
const EVENT_TYPES = {
  exam:     { label: 'Exam',     emoji: '📋', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  holiday:  { label: 'Holiday',  emoji: '🏖️', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  event:    { label: 'Event',    emoji: '🎉', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  deadline: { label: 'Deadline', emoji: '⏰', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  sports:   { label: 'Sports',   emoji: '🏅', color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
};

function generateYearEvents(year) {
  const events = {};
  const sampleEvents = [
    { month: 0, day: 1,  type: 'holiday', title: "New Year's Day" },
    { month: 0, day: 26, type: 'holiday', title: 'Republic Day' },
    { month: 1, day: 10, type: 'exam', title: 'Unit Test I - Cloud Computing' },
    { month: 1, day: 12, type: 'exam', title: 'Unit Test I - Machine Learning' },
    { month: 1, day: 14, type: 'deadline', title: 'Assignment 1 Submission' },
    { month: 1, day: 20, type: 'event', title: 'Tech Fest - HackMatrix 2026' },
    { month: 1, day: 21, type: 'event', title: 'Tech Fest - Day 2' },
    { month: 2, day: 5,  type: 'sports', title: 'Inter-Department Cricket Match' },
    { month: 2, day: 8,  type: 'holiday', title: 'Maha Shivaratri' },
    { month: 2, day: 15, type: 'exam', title: 'Mid-Semester Examinations Begin' },
    { month: 2, day: 16, type: 'exam', title: 'Mid-Sem: Database Systems' },
    { month: 2, day: 17, type: 'exam', title: 'Mid-Sem: Software Architecture' },
    { month: 2, day: 18, type: 'exam', title: 'Mid-Sem: ML & Neural Networks' },
    { month: 2, day: 19, type: 'exam', title: 'Mid-Sem: Cloud Computing' },
    { month: 2, day: 25, type: 'deadline', title: 'Mini Project Phase 1 Review' },
    { month: 3, day: 1,  type: 'event', title: 'Annual Cultural Fest - Utsav' },
    { month: 3, day: 2,  type: 'event', title: 'Cultural Fest Day 2' },
    { month: 3, day: 10, type: 'holiday', title: 'Ugadi / Gudi Padwa' },
    { month: 3, day: 14, type: 'holiday', title: 'Ambedkar Jayanti' },
    { month: 3, day: 20, type: 'deadline', title: 'Assignment 2 Submission' },
    { month: 4, day: 1,  type: 'holiday', title: 'Maharashtra Day' },
    { month: 4, day: 5,  type: 'exam', title: 'Unit Test II Begins' },
    { month: 4, day: 6,  type: 'exam', title: 'UT-II: Cloud Computing' },
    { month: 4, day: 7,  type: 'exam', title: 'UT-II: ML & Neural Networks' },
    { month: 4, day: 15, type: 'sports', title: 'Annual Sports Day' },
    { month: 4, day: 16, type: 'sports', title: 'Sports Day - Finals' },
    { month: 4, day: 25, type: 'deadline', title: 'Mini Project Final Submission' },
    { month: 5, day: 1,  type: 'exam', title: 'End Semester Exams Begin' },
    { month: 5, day: 2,  type: 'exam', title: 'ESE: Database Systems' },
    { month: 5, day: 4,  type: 'exam', title: 'ESE: Software Architecture' },
    { month: 5, day: 6,  type: 'exam', title: 'ESE: ML & Neural Networks' },
    { month: 5, day: 8,  type: 'exam', title: 'ESE: Cloud Computing' },
    { month: 5, day: 10, type: 'exam', title: 'ESE: Data Science Lab (Practical)' },
    { month: 5, day: 15, type: 'event', title: 'Result Declaration' },
    { month: 5, day: 20, type: 'holiday', title: 'Summer Vacation Begins' },
    { month: 7, day: 1,  type: 'event', title: 'New Academic Session Begins' },
    { month: 7, day: 15, type: 'holiday', title: 'Independence Day' },
    { month: 8, day: 5,  type: 'holiday', title: 'Teachers Day' },
    { month: 8, day: 10, type: 'event', title: 'Freshers Welcome Party' },
    { month: 9, day: 2,  type: 'holiday', title: 'Gandhi Jayanti' },
    { month: 9, day: 15, type: 'exam', title: 'Unit Test I (Sem II)' },
    { month: 10, day: 1, type: 'holiday', title: 'Diwali Vacation' },
    { month: 10, day: 14, type: 'event', title: 'Campus Placement Drive - TCS' },
    { month: 10, day: 20, type: 'event', title: 'Campus Placement Drive - Infosys' },
    { month: 11, day: 1,  type: 'exam', title: 'Pre-End Semester Tests' },
    { month: 11, day: 15, type: 'exam', title: 'End Semester Exams (Sem II)' },
    { month: 11, day: 25, type: 'holiday', title: 'Christmas' },
    { month: 11, day: 31, type: 'holiday', title: "New Year's Eve" },
  ];

  sampleEvents.forEach(evt => {
    const key = `${year}-${String(evt.month + 1).padStart(2, '0')}-${String(evt.day).padStart(2, '0')}`;
    if (!events[key]) events[key] = [];
    events[key].push({ type: evt.type, title: evt.title });
  });

  return events;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function AcademicCalendarModal({ currentUser, onClose }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const yearEvents = useMemo(() => generateYearEvents(currentYear), [currentYear]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDate(null);
  };

  function getDateKey(day) {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function getDayEvents(day) {
    const key = getDateKey(day);
    const dayEvts = yearEvents[key] || [];
    if (activeFilter === 'all') return dayEvts;
    return dayEvts.filter(e => e.type === activeFilter);
  }

  function getHeatIntensity(day) {
    const evts = getDayEvents(day);
    if (evts.length === 0) return 'rgba(255,255,255,0.02)';
    if (evts.length === 1) return 'rgba(59,130,246,0.15)';
    if (evts.length === 2) return 'rgba(59,130,246,0.3)';
    return 'rgba(139,92,246,0.4)';
  }

  const isToday = (day) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const selectedEvents = selectedDate ? getDayEvents(selectedDate) : [];

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 800, width: '95vw', maxHeight: '92vh', overflow: 'hidden',
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
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
            }}>
              <Calendar size={26} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>📅 Academic Calendar</h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                Exams, Events, Holidays & Deadlines
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>

          {/* Filter Tags */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveFilter('all')} style={{
              background: activeFilter === 'all' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeFilter === 'all' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '8px', padding: '5px 12px', fontSize: '11px', fontWeight: 600,
              color: activeFilter === 'all' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer',
            }}>
              🗓️ All
            </button>
            {Object.entries(EVENT_TYPES).map(([key, val]) => (
              <button key={key} onClick={() => setActiveFilter(key)} style={{
                background: activeFilter === key ? `${val.color}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeFilter === key ? `${val.color}40` : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '8px', padding: '5px 12px', fontSize: '11px', fontWeight: 600,
                color: activeFilter === key ? val.color : 'rgba(255,255,255,0.5)', cursor: 'pointer',
              }}>
                {val.emoji} {val.label}
              </button>
            ))}
          </div>

          {/* Month Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#fff' }}>
              <ChevronLeft size={18} />
            </button>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#fff' }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '12px', marginBottom: '16px',
          }}>
            {/* Day headers */}
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', padding: '6px 0' }}>
                {d}
              </div>
            ))}
            {/* Day cells */}
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dayEvts = getDayEvents(day);
              const isSelected = selectedDate === day;
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  style={{
                    aspectRatio: '1', borderRadius: '10px',
                    background: isSelected ? 'rgba(59,130,246,0.2)' : isToday(day) ? 'rgba(16,185,129,0.15)' : getHeatIntensity(day),
                    border: isSelected ? '2px solid #3b82f6' : isToday(day) ? '2px solid #10b981' : '1px solid transparent',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday(day) ? 'rgba(16,185,129,0.15)' : getHeatIntensity(day); }}
                >
                  <span style={{
                    fontSize: '13px', fontWeight: isToday(day) ? 800 : 600,
                    color: isToday(day) ? '#10b981' : isSelected ? '#60a5fa' : '#fff',
                  }}>
                    {day}
                  </span>
                  {dayEvts.length > 0 && (
                    <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                      {dayEvts.slice(0, 3).map((e, j) => (
                        <div key={j} style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: EVENT_TYPES[e.type]?.color || '#3b82f6',
                        }} />
                      ))}
                    </div>
                  )}
                  {isToday(day) && (
                    <div style={{
                      position: 'absolute', top: 2, right: 4, fontSize: '8px', color: '#10b981', fontWeight: 700,
                    }}>
                      TODAY
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '16px',
            }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                📌 {MONTH_NAMES[currentMonth]} {selectedDate}, {currentYear}
                {isToday(selectedDate) && <span style={{ color: '#10b981', marginLeft: '8px', fontSize: '12px' }}>(Today)</span>}
              </h4>
              {selectedEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
                  No events on this day
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedEvents.map((evt, i) => {
                    const typeInfo = EVENT_TYPES[evt.type] || EVENT_TYPES.event;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: typeInfo.bg, borderRadius: '10px', padding: '12px 14px',
                        borderLeft: `3px solid ${typeInfo.color}`,
                      }}>
                        <span style={{ fontSize: '18px' }}>{typeInfo.emoji}</span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{evt.title}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                            <span style={{
                              background: `${typeInfo.color}20`, color: typeInfo.color,
                              padding: '1px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                            }}>
                              {typeInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
