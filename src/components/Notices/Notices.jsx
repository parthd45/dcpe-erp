import { useState, useEffect } from 'react';
import { Megaphone, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { fetchNotices, subscribeToNotices } from '../../lib/noticesService';
import './Notices.css';

// Fallback static notices shown while DB loads or if DB is empty
const FALLBACK_NOTICES = [
  {
    id: 'static-1',
    day: '25', month: 'Aug',
    title: 'Internal Assessment — Semester IV Timetable Released',
    body: 'All BCA, B.Sc. (CS) and MCA students are advised to check the updated internal assessment schedule.',
    tag: 'exam', tagLabel: 'Examination',
  },
  {
    id: 'static-2',
    day: '22', month: 'Aug',
    title: 'Independence Day Cultural Program Highlights',
    body: 'The cultural event committee thanks all participants. Certificates can be collected from the office.',
    tag: 'event', tagLabel: 'Event',
  },
  {
    id: 'static-3',
    day: '20', month: 'Aug',
    title: 'Last Date for Fee Payment — Odd Semester 2026-27',
    body: 'Students are reminded to pay their fees by 31st August to avoid late payment surcharges.',
    tag: 'urgent', tagLabel: 'Urgent',
  },
  {
    id: 'static-4',
    day: '18', month: 'Aug',
    title: 'Campus Placement Drive — TCS & Infosys',
    body: 'Final year MCA and BCA students eligible. Register on the placement portal by 25th August.',
    tag: 'placement', tagLabel: 'Placement',
  },
  {
    id: 'static-5',
    day: '15', month: 'Aug',
    title: 'Inter-College Sports Meet Registration Open',
    body: 'Athletics, Kabaddi, Volleyball and Cricket events. Register through your department HOD.',
    tag: 'sports', tagLabel: 'Sports',
  },
];

const STATIC_EVENTS = [
  {
    color: 'purple',
    title: 'Annual Sports Meet 2026',
    desc: 'Track & field, team sports, and cultural events',
    date: 'Sep 5-7, 2026',
    location: 'HVPM Sports Complex',
  },
  {
    color: 'amber',
    title: 'MCA Project Exhibition',
    desc: 'Final year project showcases & industry judging',
    date: 'Sep 15, 2026',
    location: 'Computer Lab Complex',
  },
  {
    color: 'green',
    title: 'Campus Placement Week',
    desc: 'Multiple companies visiting for recruitment',
    date: 'Oct 1-5, 2026',
    location: 'Seminar Hall',
  },
  {
    color: 'blue',
    title: 'NAAC Peer Team Visit',
    desc: 'Re-accreditation assessment visit',
    date: 'Nov 12-14, 2026',
    location: 'Main Campus',
  },
];

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotices = async () => {
    const data = await fetchNotices(5);
    setNotices(data.length > 0 ? data : FALLBACK_NOTICES);
    setIsLoading(false);
  };

  useEffect(() => {
    loadNotices();

    // Real-time: reload notices when HOD posts a new one
    const unsubscribe = subscribeToNotices(() => {
      loadNotices();
    });

    return unsubscribe;
  }, []);

  return (
    <section className="notices section" id="notices">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">
            <Megaphone size={14} />
            Latest Updates
          </span>
          <h2 className="section-title">Notices &amp; Events</h2>
          <p className="section-subtitle">
            Stay updated with the latest announcements, circulars, and upcoming events
          </p>
        </div>

        <div className="notices-layout">
          {/* Notice List */}
          <div className="notices-list">
            {isLoading ? (
              // Skeleton loader
              Array.from({ length: 4 }).map((_, i) => (
                <div className="notice-item notice-skeleton" key={i}>
                  <div className="notice-date skeleton-box" style={{ width: 56, height: 56, borderRadius: 10 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skeleton-box" style={{ height: 16, width: '70%', borderRadius: 6 }} />
                    <div className="skeleton-box" style={{ height: 12, width: '90%', borderRadius: 6 }} />
                    <div className="skeleton-box" style={{ height: 10, width: '30%', borderRadius: 6 }} />
                  </div>
                </div>
              ))
            ) : (
              notices.map((notice) => (
                <div className="notice-item" key={notice.id}>
                  <div className="notice-date">
                    <span className="notice-date-day">{notice.day}</span>
                    <span className="notice-date-month">{notice.month}</span>
                  </div>
                  <div className="notice-content">
                    <h4>{notice.title}</h4>
                    <p>{notice.body}</p>
                    <div className="notice-meta">
                      <span className={`notice-tag ${notice.tag}`}>{notice.tagLabel}</span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {!isLoading && notices.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <Megaphone size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p>No notices posted yet.</p>
              </div>
            )}
          </div>

          {/* Events Sidebar — stays static (event calendar, not DB-driven) */}
          <div className="events-sidebar">
            <h3 className="events-sidebar-title">
              <Calendar size={18} />
              Upcoming Events
            </h3>
            {STATIC_EVENTS.map((event, i) => (
              <div className={`event-card ${event.color}`} key={i}>
                <h4>{event.title}</h4>
                <p>{event.desc}</p>
                <div className="event-date-line">
                  <Clock size={12} />
                  {event.date}
                </div>
                <div className="event-date-line">
                  <MapPin size={12} />
                  {event.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
