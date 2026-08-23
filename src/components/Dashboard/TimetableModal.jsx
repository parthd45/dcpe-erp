import React, { useState } from 'react';
import {
  Calendar, Clock, MapPin, User, BookOpen, X, Printer,
  CheckCircle2, Sparkles, Building2, ChevronRight, Layers, Bell
} from 'lucide-react';
import './Dashboard.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_SCHEDULE = {
  Monday: [
    { time: '09:00 AM - 10:00 AM', code: 'MCA-501', subject: 'Cloud Computing & Virtualization', faculty: 'Prof. S. Sharma', room: 'Lab 4 (CS Building)', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', code: 'MCA-502', subject: 'Machine Learning & Neural Networks', faculty: 'Dr. V. M. Thakare', room: 'Room 204', type: 'Theory' },
    { time: '11:00 AM - 11:30 AM', code: 'RECESS', subject: 'Tea & Refreshment Break', faculty: '-', room: 'Campus Cafeteria', type: 'Break' },
    { time: '11:30 AM - 01:30 PM', code: 'MCA-505P', subject: 'AI & Data Science Laboratory', faculty: 'Prof. S. Sharma', room: 'Advanced Computing Lab 2', type: 'Lab' },
    { time: '01:30 PM - 02:15 PM', code: 'LUNCH', subject: 'Lunch Recess', faculty: '-', room: '-', type: 'Break' },
    { time: '02:15 PM - 03:15 PM', code: 'MCA-503', subject: 'Advanced Database Systems', faculty: 'Dr. Ananya Roy', room: 'Room 204', type: 'Theory' },
    { time: '03:15 PM - 04:15 PM', code: 'MCA-504', subject: 'Software Architecture & Design', faculty: 'Prof. R. Deshmukh', room: 'Room 204', type: 'Theory' },
  ],
  Tuesday: [
    { time: '09:00 AM - 10:00 AM', code: 'MCA-503', subject: 'Advanced Database Systems', faculty: 'Dr. Ananya Roy', room: 'Room 204', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', code: 'MCA-501', subject: 'Cloud Computing & Virtualization', faculty: 'Prof. S. Sharma', room: 'Room 204', type: 'Theory' },
    { time: '11:00 AM - 11:30 AM', code: 'RECESS', subject: 'Tea & Refreshment Break', faculty: '-', room: 'Campus Cafeteria', type: 'Break' },
    { time: '11:30 AM - 12:30 PM', code: 'MCA-502', subject: 'Machine Learning & Neural Networks', faculty: 'Dr. V. M. Thakare', room: 'Room 204', type: 'Theory' },
    { time: '12:30 PM - 01:30 PM', code: 'MCA-506S', subject: 'Research Seminar & Case Study', faculty: 'Prof. R. Deshmukh', room: 'Seminar Hall 1', type: 'Seminar' },
    { time: '01:30 PM - 02:15 PM', code: 'LUNCH', subject: 'Lunch Recess', faculty: '-', room: '-', type: 'Break' },
    { time: '02:15 PM - 04:15 PM', code: 'MCA-507P', subject: 'Cloud Computing Practical Lab', faculty: 'Prof. S. Sharma', room: 'Lab 4 (CS Building)', type: 'Lab' },
  ],
  Wednesday: [
    { time: '09:00 AM - 10:00 AM', code: 'MCA-502', subject: 'Machine Learning & Neural Networks', faculty: 'Dr. V. M. Thakare', room: 'Room 204', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', code: 'MCA-504', subject: 'Software Architecture & Design', faculty: 'Prof. R. Deshmukh', room: 'Room 204', type: 'Theory' },
    { time: '11:00 AM - 11:30 AM', code: 'RECESS', subject: 'Tea Break', faculty: '-', room: '-', type: 'Break' },
    { time: '11:30 AM - 01:30 PM', code: 'MCA-508P', subject: 'Full Stack Web Engineering Lab', faculty: 'Dr. Ananya Roy', room: 'Web Tech Lab', type: 'Lab' },
    { time: '01:30 PM - 02:15 PM', code: 'LUNCH', subject: 'Lunch Recess', faculty: '-', room: '-', type: 'Break' },
    { time: '02:15 PM - 03:15 PM', code: 'MCA-501', subject: 'Cloud Computing & Virtualization', faculty: 'Prof. S. Sharma', room: 'Room 204', type: 'Theory' },
    { time: '03:15 PM - 04:15 PM', code: 'MCA-509E', subject: 'Sports Analytics & Biometrics (Elective)', faculty: 'Prof. Kulkarni', room: 'Sports AV Room', type: 'Elective' },
  ],
  Thursday: [
    { time: '09:00 AM - 10:00 AM', code: 'MCA-504', subject: 'Software Architecture & Design', faculty: 'Prof. R. Deshmukh', room: 'Room 204', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', code: 'MCA-503', subject: 'Advanced Database Systems', faculty: 'Dr. Ananya Roy', room: 'Room 204', type: 'Theory' },
    { time: '11:00 AM - 11:30 AM', code: 'RECESS', subject: 'Tea Break', faculty: '-', room: '-', type: 'Break' },
    { time: '11:30 AM - 01:30 PM', code: 'MCA-510P', subject: 'DBMS Implementation & SQL Tuning', faculty: 'Dr. Ananya Roy', room: 'Lab 2', type: 'Lab' },
    { time: '01:30 PM - 02:15 PM', code: 'LUNCH', subject: 'Lunch Recess', faculty: '-', room: '-', type: 'Break' },
    { time: '02:15 PM - 04:15 PM', code: 'PROJECT', subject: 'Industry Major Project Mentorship', faculty: 'Dr. V. M. Thakare', room: 'Innovation Lab', type: 'Project' },
  ],
  Friday: [
    { time: '09:00 AM - 10:00 AM', code: 'MCA-501', subject: 'Cloud Computing & Virtualization', faculty: 'Prof. S. Sharma', room: 'Room 204', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', code: 'MCA-502', subject: 'Machine Learning & Neural Networks', faculty: 'Dr. V. M. Thakare', room: 'Room 204', type: 'Theory' },
    { time: '11:00 AM - 11:30 AM', code: 'RECESS', subject: 'Tea Break', faculty: '-', room: '-', type: 'Break' },
    { time: '11:30 AM - 01:00 PM', code: 'SPORTS', subject: 'Compulsory Physical Education & Yoga', faculty: 'Prof. S. Patil', room: 'Main Gymnasium Ground', type: 'Sports' },
    { time: '01:00 PM - 02:00 PM', code: 'LUNCH', subject: 'Lunch Recess', faculty: '-', room: '-', type: 'Break' },
    { time: '02:00 PM - 04:00 PM', code: 'PLACEMENT', subject: 'Placement Preparation & Mock Aptitude', faculty: 'T&P Cell Officers', room: 'Auditorium', type: 'Placement' },
  ],
  Saturday: [
    { time: '09:00 AM - 11:00 AM', code: 'MCA-511E', subject: 'Expert Guest Lecture / Tech Talk', faculty: 'Industry Guest Speaker', room: 'Main AV Hall', type: 'Seminar' },
    { time: '11:00 AM - 01:00 PM', code: 'LIBRARY', subject: 'Self-Study, Research & Library Hours', faculty: 'Librarian In-charge', room: 'Central Library', type: 'Study' },
  ],
};

export function TimetableModal({ currentUser, onClose }) {
  if (!currentUser) return null;

  // Detect current day
  const currentDayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const todayName = currentDayIndex >= 1 && currentDayIndex <= 6 ? DAYS[currentDayIndex - 1] : 'Monday';

  const [selectedDay, setSelectedDay] = useState(todayName);

  const scheduleForDay = DEFAULT_SCHEDULE[selectedDay] || [];

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
          maxWidth: '780px',
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
            <Calendar size={18} color="var(--primary)" />
            Official Academic Timetable & Lecture Schedule
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} /> Print Schedule
            </button>
            <button className="btn btn-white btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Day Selector Navigation */}
        <div
          className="no-print"
          style={{
            padding: '12px 24px',
            background: 'white',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          {DAYS.map((day) => {
            const isToday = day === todayName;
            const isSelected = day === selectedDay;
            return (
              <button
                key={day}
                type="button"
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-body)',
                  color: isSelected ? 'white' : 'var(--text-heading)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setSelectedDay(day)}
              >
                {day}
                {isToday && (
                  <span
                    style={{
                      fontSize: '10px',
                      background: isSelected ? 'rgba(255,255,255,0.25)' : '#dcfce7',
                      color: isSelected ? 'white' : '#15803d',
                      padding: '2px 6px',
                      borderRadius: '10px',
                    }}
                  >
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Timetable Body */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {/* Header Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                {selectedDay}'s Lecture Timetable
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Department of {currentUser.departmentName || 'Computer Science'} • {currentUser.course} (Semester II)
              </p>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-body)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              Campus Timing: <strong>09:00 AM – 04:15 PM</strong>
            </div>
          </div>

          {/* Schedule List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scheduleForDay.map((slot, idx) => {
              const isBreak = slot.type === 'Break';
              const isLab = slot.type === 'Lab';
              const isSports = slot.type === 'Sports';

              if (isBreak) {
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '8px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px dashed #cbd5e1',
                      fontSize: '12px',
                      color: '#64748b',
                      fontWeight: 600,
                    }}
                  >
                    <Clock size={14} />
                    <span>{slot.time}</span> • <strong>{slot.subject}</strong>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '14px',
                    border: isLab
                      ? '1px solid #bfdbfe'
                      : isSports
                      ? '1px solid #bbf7d0'
                      : '1px solid var(--border-light)',
                    background: isLab
                      ? '#eff6ff'
                      : isSports
                      ? '#f0fdf4'
                      : 'white',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: isLab ? '#dbeafe' : isSports ? '#dcfce7' : 'var(--bg-body)',
                        textAlign: 'center',
                        minWidth: '85px',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 800, color: isLab ? '#1d4ed8' : isSports ? '#15803d' : 'var(--primary)', display: 'block' }}>
                        {slot.code}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          color: '#64748b',
                        }}
                      >
                        {slot.type}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>
                        {slot.subject}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={13} color="var(--primary)" />
                          {slot.faculty}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} color="#d97706" />
                          {slot.room}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)' }}>
                      <Clock size={14} color="#64748b" />
                      {slot.time}
                    </div>
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                      Attendance Mandatory
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
