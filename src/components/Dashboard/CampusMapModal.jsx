import React, { useState } from 'react';
import { MapPin, X, Search, Navigation, Clock, Users, Utensils, BookOpen, Dumbbell, Building2 } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   CAMPUS BUILDINGS DATA
   ═══════════════════════════════════════════════════════════════ */
const BUILDINGS = [
  {
    id: 'main', name: 'Main Academic Block', zone: 'academic', emoji: '🏛️',
    x: 200, y: 120, w: 140, h: 80,
    rooms: [
      { name: 'Room 204', currentClass: 'Cloud Computing', faculty: 'Prof. S. Sharma', time: '09:00-10:00 AM' },
      { name: 'Room 205', currentClass: 'Machine Learning', faculty: 'Dr. V. M. Thakare', time: '10:00-11:00 AM' },
      { name: 'Room 206', currentClass: 'Software Architecture', faculty: 'Prof. R. Deshmukh', time: '02:15-03:15 PM' },
    ],
  },
  {
    id: 'cs', name: 'CS Building (Labs)', zone: 'labs', emoji: '💻',
    x: 400, y: 100, w: 120, h: 70,
    rooms: [
      { name: 'Lab 4', currentClass: 'AI & Data Science Lab', faculty: 'Prof. S. Sharma', time: '11:30 AM-01:30 PM' },
      { name: 'Web Tech Lab', currentClass: 'Full Stack Engineering Lab', faculty: 'Dr. Ananya Roy', time: '11:30 AM-01:30 PM (Wed)' },
      { name: 'Advanced Computing Lab 2', currentClass: 'Cloud Practical', faculty: 'Prof. S. Sharma', time: '02:15-04:15 PM (Tue)' },
    ],
  },
  {
    id: 'admin', name: 'Administration Block', zone: 'admin', emoji: '🏢',
    x: 120, y: 250, w: 130, h: 60,
    rooms: [
      { name: 'Room 101', currentClass: 'HOD Office', faculty: 'Dr. Principal', time: '09:00 AM-05:00 PM' },
      { name: 'Room 105', currentClass: 'IT Help Desk', faculty: 'Tech Support', time: '09:00 AM-04:00 PM' },
      { name: 'Room 108', currentClass: 'Counseling Center', faculty: 'Dr. Psychologist', time: '10:00 AM-03:00 PM' },
    ],
  },
  {
    id: 'library', name: 'Central Library', zone: 'academic', emoji: '📚',
    x: 320, y: 240, w: 110, h: 65,
    rooms: [
      { name: 'Ground Floor', currentClass: 'Reading Hall', faculty: 'Librarian', time: '08:00 AM-08:00 PM' },
      { name: 'First Floor', currentClass: 'Digital Library', faculty: 'IT Librarian', time: '09:00 AM-06:00 PM' },
      { name: 'Reference Section', currentClass: 'Research Materials', faculty: 'Librarian', time: '09:00 AM-05:00 PM' },
    ],
  },
  {
    id: 'canteen', name: 'Campus Cafeteria', zone: 'canteen', emoji: '🍽️',
    x: 480, y: 250, w: 100, h: 55,
    rooms: [
      { name: 'Main Counter', currentClass: 'Breakfast: ₹30-60', faculty: 'Open', time: '08:00-10:00 AM' },
      { name: 'Lunch Counter', currentClass: 'Thali: ₹70-120', faculty: 'Open', time: '12:00-02:30 PM' },
      { name: 'Snack Bar', currentClass: 'Tea/Coffee: ₹10-20', faculty: 'Open', time: '08:00 AM-06:00 PM' },
    ],
  },
  {
    id: 'sports', name: 'Sports Complex', zone: 'sports', emoji: '🏟️',
    x: 150, y: 370, w: 130, h: 65,
    rooms: [
      { name: 'Cricket Ground', currentClass: 'Inter-dept Practice', faculty: 'Sports Coach', time: '04:00-06:00 PM' },
      { name: 'Indoor Badminton', currentClass: 'Open Play', faculty: '-', time: '05:00-07:00 PM' },
      { name: 'Gymnasium', currentClass: 'Open', faculty: 'Trainer', time: '06:00-08:00 AM, 04:00-07:00 PM' },
    ],
  },
  {
    id: 'seminar', name: 'Seminar Hall', zone: 'academic', emoji: '🎤',
    x: 370, y: 360, w: 110, h: 55,
    rooms: [
      { name: 'Seminar Hall 1', currentClass: 'Research Seminar', faculty: 'Prof. R. Deshmukh', time: '12:30-01:30 PM (Tue)' },
      { name: 'Auditorium', currentClass: 'Available for booking', faculty: '-', time: '-' },
    ],
  },
  {
    id: 'hostel', name: 'Student Hostel', zone: 'admin', emoji: '🏠',
    x: 520, y: 370, w: 100, h: 55,
    rooms: [
      { name: 'Boys Hostel', currentClass: '120 rooms', faculty: 'Warden', time: '24/7' },
      { name: 'Girls Hostel', currentClass: '80 rooms', faculty: 'Warden', time: '24/7' },
    ],
  },
];

const ZONES = {
  academic: { label: 'Academic', color: '#3b82f6', icon: BookOpen },
  labs:     { label: 'Labs',     color: '#10b981', icon: Building2 },
  admin:    { label: 'Admin',    color: '#f59e0b', icon: Building2 },
  sports:   { label: 'Sports',   color: '#ef4444', icon: Dumbbell },
  canteen:  { label: 'Canteen',  color: '#f97316', icon: Utensils },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function CampusMapModal({ currentUser, onClose }) {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeZone, setActiveZone] = useState('all');

  const filtered = activeZone === 'all'
    ? BUILDINGS
    : BUILDINGS.filter(b => b.zone === activeZone);

  const searchResults = searchTerm.trim()
    ? BUILDINGS.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.rooms.some(r =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.currentClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.faculty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : [];

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        maxWidth: 920, width: '95vw', maxHeight: '92vh', overflow: 'hidden',
        borderRadius: '20px',
        background: 'linear-gradient(145deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%)',
        color: '#e2e8f0', display: 'flex', flexDirection: 'column',
      }}>
        {/* ── Header ── */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '14px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
            }}>
              <MapPin size={26} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>🗺️ Campus Map</h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                Interactive building map • Find rooms & classes
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search rooms, labs, faculty..."
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                padding: '12px 14px 12px 40px', color: '#fff', fontSize: '13px',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto',
              }}>
                {searchResults.map(b => (
                  <div key={b.id} onClick={() => { setSelectedBuilding(b); setSearchTerm(''); }} style={{
                    padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '18px' }}>{b.emoji}</span>
                    <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>{b.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zone Filters */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveZone('all')} style={{
              background: activeZone === 'all' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeZone === 'all' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '8px', padding: '5px 12px', fontSize: '11px', fontWeight: 600,
              color: activeZone === 'all' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer',
            }}>
              🗺️ All
            </button>
            {Object.entries(ZONES).map(([key, z]) => (
              <button key={key} onClick={() => setActiveZone(key)} style={{
                background: activeZone === key ? `${z.color}15` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeZone === key ? `${z.color}30` : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '8px', padding: '5px 12px', fontSize: '11px', fontWeight: 600,
                color: activeZone === key ? z.color : 'rgba(255,255,255,0.5)', cursor: 'pointer',
              }}>
                {z.label}
              </button>
            ))}
          </div>

          {/* SVG Campus Map */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '16px', marginBottom: '20px', overflow: 'hidden',
          }}>
            <svg viewBox="0 0 660 460" style={{ width: '100%', height: 'auto' }}>
              {/* Ground / Paths */}
              <rect x="0" y="0" width="660" height="460" rx="12" fill="#0f0c29" />
              {/* Road paths */}
              <line x1="100" y1="220" x2="560" y2="220" stroke="rgba(255,255,255,0.06)" strokeWidth="4" strokeDasharray="10,6" />
              <line x1="330" y1="60" x2="330" y2="440" stroke="rgba(255,255,255,0.06)" strokeWidth="4" strokeDasharray="10,6" />
              {/* Trees/Green */}
              {[80, 560, 300, 580, 60].map((tx, i) => (
                <circle key={i} cx={tx} cy={[80, 160, 440, 400, 380][i]} r={12} fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.2)" strokeWidth="1" />
              ))}
              {/* Campus Gate */}
              <rect x="290" y="440" width="80" height="16" rx="4" fill="rgba(245,158,11,0.2)" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
              <text x="330" y="453" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="700">MAIN GATE</text>

              {/* Buildings */}
              {filtered.map(bld => {
                const zone = ZONES[bld.zone];
                const isSelected = selectedBuilding?.id === bld.id;
                return (
                  <g key={bld.id} onClick={() => setSelectedBuilding(bld)} style={{ cursor: 'pointer' }}>
                    <rect
                      x={bld.x} y={bld.y} width={bld.w} height={bld.h}
                      rx="8" ry="8"
                      fill={isSelected ? `${zone.color}25` : `${zone.color}10`}
                      stroke={isSelected ? zone.color : `${zone.color}40`}
                      strokeWidth={isSelected ? 2 : 1}
                      style={{ transition: 'all 0.3s' }}
                    />
                    {/* Glow for selected */}
                    {isSelected && (
                      <rect x={bld.x - 3} y={bld.y - 3} width={bld.w + 6} height={bld.h + 6}
                        rx="10" ry="10" fill="none" stroke={zone.color} strokeWidth="1" opacity="0.3" />
                    )}
                    <text x={bld.x + bld.w / 2} y={bld.y + bld.h / 2 - 6} textAnchor="middle" fill="#fff" fontSize="16">
                      {bld.emoji}
                    </text>
                    <text x={bld.x + bld.w / 2} y={bld.y + bld.h / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9" fontWeight="600">
                      {bld.name.length > 18 ? bld.name.slice(0, 16) + '…' : bld.name}
                    </text>
                    {/* Zone color dot */}
                    <circle cx={bld.x + bld.w - 8} cy={bld.y + 8} r="4" fill={zone.color} opacity="0.7" />
                  </g>
                );
              })}

              {/* Compass */}
              <g transform="translate(610, 40)">
                <circle cx="0" cy="0" r="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x="0" y="-5" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="800">N</text>
                <text x="0" y="12" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8">S</text>
              </g>
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Object.entries(ZONES).map(([key, z]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '3px', background: z.color }} />
                {z.label}
              </div>
            ))}
          </div>

          {/* Building Detail */}
          {selectedBuilding && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${ZONES[selectedBuilding.zone]?.color || '#3b82f6'}25`,
              borderRadius: '14px', padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <span style={{ fontSize: '32px' }}>{selectedBuilding.emoji}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>{selectedBuilding.name}</h3>
                  <span style={{
                    fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                    background: `${ZONES[selectedBuilding.zone]?.color}15`,
                    color: ZONES[selectedBuilding.zone]?.color,
                  }}>
                    {ZONES[selectedBuilding.zone]?.label} Zone
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedBuilding.rooms.map((room, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px',
                    borderLeft: `3px solid ${ZONES[selectedBuilding.zone]?.color || '#3b82f6'}`,
                  }}>
                    <MapPin size={14} color={ZONES[selectedBuilding.zone]?.color} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{room.name}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{room.currentClass}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{room.faculty}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                        <Clock size={10} /> {room.time}
                      </div>
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
