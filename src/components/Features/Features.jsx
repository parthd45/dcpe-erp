import {
  LayoutDashboard, UserCheck, CalendarCheck, FileText, CreditCard,
  BookOpen, Clock, Bell, BarChart3, Medal, Settings, Send, Sparkles
} from 'lucide-react';
import './Features.css';

const features = [
  {
    icon: LayoutDashboard,
    color: 'indigo',
    title: 'Role-Based Dashboards',
    desc: 'Personalized views for Students, Faculty, Admins, HODs, and the Principal with real-time KPIs and quick actions.',
    highlight: true,
    tags: ['Student View', 'Faculty View', 'Admin Panel', 'HOD Analytics', 'Principal KPIs'],
  },
  {
    icon: UserCheck,
    color: 'emerald',
    title: 'Attendance Tracking',
    desc: 'Subject-wise attendance with shortage alerts and calendar heatmap.',
  },
  {
    icon: FileText,
    color: 'violet',
    title: 'Examination & Results',
    desc: 'Exam schedules, hall tickets, SGPA/CGPA, and grade analytics.',
  },
  {
    icon: CreditCard,
    color: 'amber',
    title: 'Fee Management',
    desc: 'Online fee payment, receipts, scholarship tracking, and due alerts.',
  },
  {
    icon: BookOpen,
    color: 'cyan',
    title: 'Library System',
    desc: 'Book catalog, issue/return tracking, fine calculator, and e-resources.',
  },
  {
    icon: CalendarCheck,
    color: 'blue',
    title: 'Timetable & Calendar',
    desc: 'Interactive weekly timetable and academic calendar for all.',
  },
  {
    icon: Bell,
    color: 'rose',
    title: 'Notices & Circulars',
    desc: 'Department-wise notice board with event announcements and RSVP.',
  },
  {
    icon: Clock,
    color: 'orange',
    title: 'Leave Management',
    desc: 'Online leave applications with HOD/Principal approval workflow.',
  },
  {
    icon: BarChart3,
    color: 'teal',
    title: 'Reports & Analytics',
    desc: 'Performance trends, enrollment stats, and NAAC-ready dashboards.',
  },
  {
    icon: Medal,
    color: 'pink',
    title: 'Sports & Fitness',
    desc: 'Sports events, fitness assessments, and tournament tracking.',
  },
  {
    icon: Send,
    color: 'sky',
    title: 'Placement Cell',
    desc: 'Job listings, placement records, resume builder, and drive alerts.',
  },
  {
    icon: Settings,
    color: 'lime',
    title: 'Admin Configuration',
    desc: 'User management, department setup, academic year configuration.',
  },
];

export default function Features() {
  return (
    <section className="features section" id="features">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">
            <Sparkles size={14} />
            ERP Modules
          </span>
          <h2 className="section-title">Everything in One Platform</h2>
          <p className="section-subtitle">
            A comprehensive suite of 12+ modules designed specifically for DCPE's academic and administrative needs
          </p>
        </div>

        <div className="features-grid stagger-children">
          {features.map((f, i) => (
            <div className={`feature-card ${f.highlight ? 'highlight' : ''}`} key={i}>
              <div>
                <div className={`feature-icon-wrap ${f.color}`}>
                  <f.icon size={f.highlight ? 28 : 22} />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
              {f.tags && (
                <div className="feature-tags">
                  {f.tags.map((tag) => (
                    <span className="feature-tag" key={tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
