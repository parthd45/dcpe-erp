import React, { useState, useMemo } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, X, Search, Download,
  Printer, Clock, AlertTriangle, CheckCircle2, Sparkles, FileText, Share2, Filter
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   EVENT DATA ENGINE
   ═══════════════════════════════════════════════════════════════ */
const EVENT_TYPES = {
  exam:     { label: 'Exam 📋',     emoji: '📋', color: '#ef4444', bg: 'rgba(239,68,68,0.14)', border: 'rgba(239,68,68,0.3)' },
  holiday:  { label: 'Holiday 🏖️',  emoji: '🏖️', color: '#10b981', bg: 'rgba(16,185,129,0.14)', border: 'rgba(16,185,129,0.3)' },
  event:    { label: 'Event 🎉',    emoji: '🎉', color: '#8b5cf6', bg: 'rgba(139,92,246,0.14)', border: 'rgba(139,92,246,0.3)' },
  deadline: { label: 'Deadline ⏰', emoji: '⏰', color: '#f97316', bg: 'rgba(249,115,22,0.14)', border: 'rgba(249,115,22,0.3)' },
  sports:   { label: 'Sports 🏅',   emoji: '🏅', color: '#0891b2', bg: 'rgba(8,145,178,0.14)', border: 'rgba(8,145,178,0.3)' },
};

function generateYearEvents(year) {
  const eventsMap = {};
  const sampleEvents = [
    { month: 0, day: 1,  type: 'holiday', title: "New Year's Day 🎆", desc: 'College closed for New Year' },
    { month: 0, day: 26, type: 'holiday', title: 'Republic Day 🇮🇳', desc: 'Flag hoisting ceremony at Main Sports Ground (08:00 AM)' },
    { month: 1, day: 10, type: 'exam', title: 'Unit Test I — Cloud Computing (MCA-501)', desc: 'Room 204 • 10:00 AM - 11:30 AM' },
    { month: 1, day: 12, type: 'exam', title: 'Unit Test I — Machine Learning (MCA-502)', desc: 'Room 204 • 10:00 AM - 11:30 AM' },
    { month: 1, day: 14, type: 'deadline', title: 'Assignment 1 Submission (Cloud)', desc: 'Submit hardcopy to Prof. S. Sharma' },
    { month: 1, day: 20, type: 'event', title: 'Tech Fest — HackMatrix 2026 💻', desc: '48-hour national hackathon in Central Auditorium' },
    { month: 1, day: 21, type: 'event', title: 'Tech Fest Day 2 — Prize Ceremony 🏆', desc: 'Valedictory session with industry chief guests' },
    { month: 2, day: 5,  type: 'sports', title: 'Inter-Department Cricket Championship 🏏', desc: 'Main Sports Complex Ground' },
    { month: 2, day: 8,  type: 'holiday', title: 'Maha Shivaratri 🕉️', desc: 'College holiday' },
    { month: 2, day: 15, type: 'exam', title: 'Mid-Semester Examinations Begin 📋', desc: 'Hall tickets mandatory for hall entry' },
    { month: 2, day: 16, type: 'exam', title: 'Mid-Sem: Advanced Database Systems', desc: 'Room 204 • 10:00 AM - 01:00 PM' },
    { month: 2, day: 17, type: 'exam', title: 'Mid-Sem: Software Architecture & Design', desc: 'Room 204 • 10:00 AM - 01:00 PM' },
    { month: 2, day: 18, type: 'exam', title: 'Mid-Sem: Machine Learning & Neural Nets', desc: 'Room 204 • 10:00 AM - 01:00 PM' },
    { month: 2, day: 19, type: 'exam', title: 'Mid-Sem: Cloud Computing & Virtualization', desc: 'Room 204 • 10:00 AM - 01:00 PM' },
    { month: 2, day: 25, type: 'deadline', title: 'Mini Project Phase 1 Review', desc: 'Presentation before Department Committee' },
    { month: 3, day: 1,  type: 'event', title: 'Annual Cultural Fest — Utsav 🎭', desc: 'Music, Dance & Drama competitions' },
    { month: 3, day: 2,  type: 'event', title: 'Cultural Fest Gala Night 🎶', desc: 'Live concert performance' },
    { month: 3, day: 10, type: 'holiday', title: 'Ugadi / Gudi Padwa 🌸', desc: 'Festival holiday' },
    { month: 3, day: 14, type: 'holiday', title: 'Dr. B.R. Ambedkar Jayanti 🏛️', desc: 'College holiday' },
    { month: 3, day: 20, type: 'deadline', title: 'Assignment 2 Submission (DBMS)', desc: 'Submit via Student Portal' },
    { month: 4, day: 1,  type: 'holiday', title: 'Maharashtra Day 🚩', desc: 'State official holiday' },
    { month: 4, day: 5,  type: 'exam', title: 'Unit Test II Begins', desc: 'Pre-End Semester evaluation' },
    { month: 4, day: 6,  type: 'exam', title: 'UT-II: Cloud Computing & Virtualization', desc: 'Room 204 • 10:00 AM - 11:30 AM' },
    { month: 4, day: 7,  type: 'exam', title: 'UT-II: ML & Neural Networks', desc: 'Room 204 • 10:00 AM - 11:30 AM' },
    { month: 4, day: 15, type: 'sports', title: 'Annual Athletics Meet 🏃', desc: 'Track & field events at Sports Ground' },
    { month: 4, day: 25, type: 'deadline', title: 'Final Project Submission & Viva', desc: 'External examiner evaluation' },
    { month: 5, day: 1,  type: 'exam', title: 'End Semester University Exams (ESE)', desc: 'Official University Examination Hall' },
    { month: 5, day: 2,  type: 'exam', title: 'ESE: Advanced Database Systems', desc: '02:00 PM - 05:00 PM' },
    { month: 5, day: 4,  type: 'exam', title: 'ESE: Software Architecture', desc: '02:00 PM - 05:00 PM' },
    { month: 5, day: 6,  type: 'exam', title: 'ESE: Machine Learning', desc: '02:00 PM - 05:00 PM' },
    { month: 5, day: 8,  type: 'exam', title: 'ESE: Cloud Computing', desc: '02:00 PM - 05:00 PM' },
    { month: 5, day: 10, type: 'exam', title: 'ESE: Practical Viva (Data Science)', desc: 'Lab 4 • 09:00 AM onwards' },
    { month: 5, day: 15, type: 'event', title: 'Official Semester Result Declaration 🎓', desc: 'Check SGPA on Digital Marksheet portal' },
    { month: 5, day: 20, type: 'holiday', title: 'Summer Break Vacation Begins 🌴', desc: 'College reopens in August' },
    { month: 7, day: 1,  type: 'event', title: 'New Academic Session 2026-27 Begins 🔔', desc: 'Commencement of classes' },
    { month: 7, day: 15, type: 'holiday', title: 'Independence Day 🇮🇳', desc: 'Celebrations at Central Lawn' },
    { month: 8, day: 5,  type: 'event', title: 'Teachers Day Celebration 💐', desc: 'Organized by Student Council' },
    { month: 8, day: 10, type: 'event', title: 'Freshers Welcome Gala ✨', desc: 'Auditorium • 04:00 PM' },
    { month: 9, day: 2,  type: 'holiday', title: 'Mahatma Gandhi Jayanti 🕊️', desc: 'National holiday' },
    { month: 9, day: 15, type: 'exam', title: 'Unit Test I (Sem II)', desc: 'Room 204' },
    { month: 10, day: 1, type: 'holiday', title: 'Diwali Festival Break 🪔', desc: 'Vacation till Nov 10' },
    { month: 10, day: 14, type: 'event', title: 'Campus Placement Drive — TCS 💼', desc: 'T&P Cell Hall' },
    { month: 10, day: 20, type: 'event', title: 'Campus Placement Drive — Infosys 💼', desc: 'T&P Cell Hall' },
    { month: 11, day: 1,  type: 'exam', title: 'Pre-End Semester Evaluation', desc: 'Room 204' },
    { month: 11, day: 15, type: 'exam', title: 'End Semester Exams (Sem II)', desc: 'University Examination Center' },
    { month: 11, day: 25, type: 'holiday', title: 'Christmas Day 🎄', desc: 'Winter holiday' },
    { month: 11, day: 31, type: 'holiday', title: "New Year's Eve 🎆", desc: 'College closed' },
  ];

  sampleEvents.forEach(evt => {
    const key = `${year}-${String(evt.month + 1).padStart(2, '0')}-${String(evt.day).padStart(2, '0')}`;
    if (!eventsMap[key]) eventsMap[key] = [];
    eventsMap[key].push({ ...evt });
  });

  return { eventsMap, rawList: sampleEvents };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function AcademicCalendarModal({ currentUser, onClose, onOpenHallTicket }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Performance optimized year data lookup
  const { eventsMap, rawList } = useMemo(() => generateYearEvents(currentYear), [currentYear]);

  // Calendar math precomputations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDayOfMonth, daysInMonth]);

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
    if (!day) return [];
    const key = getDateKey(day);
    const dayEvts = eventsMap[key] || [];
    let res = dayEvts;
    if (activeFilter !== 'all') {
      res = res.filter(e => e.type === activeFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      res = res.filter(e => e.title.toLowerCase().includes(q) || (e.desc && e.desc.toLowerCase().includes(q)));
    }
    return res;
  }

  function getHeatIntensity(day) {
    const evts = getDayEvents(day);
    if (evts.length === 0) return 'rgba(255,255,255,0.02)';
    if (evts.some(e => e.type === 'exam')) return 'rgba(239,68,68,0.2)';
    if (evts.some(e => e.type === 'holiday')) return 'rgba(16,185,129,0.18)';
    if (evts.some(e => e.type === 'deadline')) return 'rgba(249,115,22,0.2)';
    return 'rgba(139,92,246,0.2)';
  }

  const isToday = (day) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const selectedEvents = selectedDate ? getDayEvents(selectedDate) : [];

  // Countdown logic for next major exam
  const upcomingExams = useMemo(() => {
    return rawList.filter(e => e.type === 'exam' && e.month >= today.getMonth()).sort((a,b) => a.month - b.month || a.day - b.day);
  }, [rawList, today]);

  const nextExam = upcomingExams[0];

  // Export iCal (.ics) file handler
  const handleExportiCal = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DCPE ERP//Academic Calendar//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:DCPE ERP Academic Calendar ${currentYear}\n`;

    rawList.forEach((evt) => {
      const m = String(evt.month + 1).padStart(2, '0');
      const d = String(evt.day).padStart(2, '0');
      const dateStr = `${currentYear}${m}${d}`;
      icsContent += `BEGIN:VEVENT\nSUMMARY:${evt.title}\nDESCRIPTION:${evt.desc || 'DCPE ERP Academic Event'}\nDTSTART;VALUE=DATE:${dateStr}\nDTEND;VALUE=DATE:${dateStr}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `DCPE_Academic_Calendar_${currentYear}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintSchedule = () => {
    window.print();
  };

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
          maxWidth: 900,
          width: '95vw',
          maxHeight: '92vh',
          overflow: 'hidden',
          borderRadius: '24px',
          background: 'linear-gradient(145deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%)',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '24px 28px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: 50, height: 50, borderRadius: '16px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
            }}>
              <Calendar size={26} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                  📅 Academic &amp; Exam Calendar Hub
                </h2>
                <span style={{
                  background: 'rgba(16,185,129,0.15)', color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.3)', padding: '2px 8px',
                  borderRadius: '12px', fontSize: '10px', fontWeight: 700
                }}>
                  Live Sync
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'rgba(255,255,255,0.45)' }}>
                Official Examination Timetables, ESE Dates, Holidays &amp; Project Deadlines
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleExportiCal}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '8px 14px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
              title="Download .ics file to add to Google Calendar or Apple Calendar"
            >
              <Download size={14} color="#60a5fa" /> Sync iCal
            </button>

            <button
              onClick={handlePrintSchedule}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '8px 14px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
            >
              <Printer size={14} color="#34d399" /> Print Sheet
            </button>

            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '10px',
              padding: '8px',
              cursor: 'pointer',
              color: '#94a3b8'
            }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>

          {/* Countdown & Alert Banner */}
          {nextExam && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(249,115,22,0.12) 100%)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '16px',
              padding: '14px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '10px',
                  background: 'rgba(239,68,68,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertTriangle size={18} color="#ef4444" />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#fff' }}>
                    🚨 Next Major Exam: {nextExam.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>
                    {MONTH_NAMES[nextExam.month]} {nextExam.day}, {currentYear} • {nextExam.desc}
                  </div>
                </div>
              </div>

              {onOpenHallTicket && (
                <button
                  onClick={onOpenHallTicket}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
                  }}
                >
                  <FileText size={13} /> View Hall Ticket 🎟️
                </button>
              )}
            </div>
          )}

          {/* Controls Bar: Search & Category Filter Tags */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            marginBottom: '18px',
            flexWrap: 'wrap',
          }}>
            {/* Filter Tags */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveFilter('all')} style={{
                background: activeFilter === 'all' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeFilter === 'all' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px', padding: '6px 14px', fontSize: '11.5px', fontWeight: 700,
                color: activeFilter === 'all' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                🗓️ All ({rawList.length})
              </button>
              {Object.entries(EVENT_TYPES).map(([key, val]) => {
                const count = rawList.filter(e => e.type === key).length;
                return (
                  <button key={key} onClick={() => setActiveFilter(key)} style={{
                    background: activeFilter === key ? val.bg : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeFilter === key ? val.border : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '10px', padding: '6px 14px', fontSize: '11.5px', fontWeight: 700,
                    color: activeFilter === key ? val.color : 'rgba(255,255,255,0.5)', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}>
                    {val.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Quick Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search subject / exam..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '7px 12px 7px 34px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Month Navigation & Quick Picker */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            background: 'rgba(255,255,255,0.03)',
            padding: '10px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <button onClick={prevMonth} style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none', borderRadius: '8px',
              padding: '8px 12px', cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600
            }}>
              <ChevronLeft size={16} /> Prev Month
            </button>

            {/* Month Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={currentMonth}
                onChange={(e) => { setCurrentMonth(parseInt(e.target.value, 10)); setSelectedDate(null); }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 800,
                  padding: '6px 12px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx} style={{ background: '#1a1a3e', color: '#fff' }}>
                    {m}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>{currentYear}</span>
            </div>

            <button onClick={nextMonth} style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none', borderRadius: '8px',
              padding: '8px 12px', cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600
            }}>
              Next Month <ChevronRight size={16} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', padding: '16px', marginBottom: '20px',
          }}>
            {/* Day headers */}
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11.5px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', padding: '6px 0' }}>
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
                    aspectRatio: '1',
                    borderRadius: '12px',
                    background: isSelected ? 'rgba(59,130,246,0.25)' : isToday(day) ? 'rgba(16,185,129,0.2)' : getHeatIntensity(day),
                    border: isSelected ? '2px solid #60a5fa' : isToday(day) ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    boxShadow: isSelected ? '0 4px 14px rgba(59,130,246,0.3)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday(day) ? 'rgba(16,185,129,0.2)' : getHeatIntensity(day); }}
                >
                  <span style={{
                    fontSize: '13.5px',
                    fontWeight: isToday(day) || isSelected ? 800 : 600,
                    color: isToday(day) ? '#10b981' : isSelected ? '#60a5fa' : '#fff',
                  }}>
                    {day}
                  </span>

                  {dayEvts.length > 0 && (
                    <div style={{ display: 'flex', gap: '3px', marginTop: '3px' }}>
                      {dayEvts.slice(0, 3).map((e, j) => (
                        <div key={j} style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: EVENT_TYPES[e.type]?.color || '#3b82f6',
                        }} />
                      ))}
                    </div>
                  )}

                  {isToday(day) && (
                    <div style={{
                      position: 'absolute', top: 3, right: 5, fontSize: '7.5px', color: '#10b981', fontWeight: 800,
                    }}>
                      TODAY
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Date Events Panel */}
          {selectedDate && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                  📌 Schedule for {MONTH_NAMES[currentMonth]} {selectedDate}, {currentYear}
                  {isToday(selectedDate) && <span style={{ color: '#10b981', marginLeft: '8px', fontSize: '12px' }}>(Today ✓)</span>}
                </h4>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                  {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} listed
                </span>
              </div>

              {selectedEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
                  No scheduled academic events or exams on this day.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedEvents.map((evt, i) => {
                    const typeInfo = EVENT_TYPES[evt.type] || EVENT_TYPES.event;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px',
                        background: typeInfo.bg, borderRadius: '12px', padding: '14px 16px',
                        borderLeft: `4px solid ${typeInfo.color}`,
                        border: `1px solid ${typeInfo.border}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ fontSize: '24px' }}>{typeInfo.emoji}</span>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{evt.title}</div>
                            {evt.desc && (
                              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>
                                {evt.desc}
                              </div>
                            )}
                          </div>
                        </div>

                        <span style={{
                          background: `${typeInfo.color}25`,
                          color: typeInfo.color,
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          border: `1px solid ${typeInfo.color}40`,
                        }}>
                          {typeInfo.label}
                        </span>
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
