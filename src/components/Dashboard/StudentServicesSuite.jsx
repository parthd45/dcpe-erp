import React, { useState } from 'react';
import {
  FileText, Award, Camera, CreditCard, Library, Clock, Briefcase,
  Search, Lock, Download, ChevronRight, Zap, Trophy, BarChart3,
  Brain, Calendar, MessageCircle, Heart, Bell, ClipboardList, MapPin, Sparkles, UserCheck
} from 'lucide-react';

export function StudentServicesSuite({
  currentUser,
  onOpenModal,
  hallTicketToast,
  setHallTicketToast
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const services = [
    // 📄 DOCUMENTS
    {
      id: 'id_card',
      title: 'Student ID Card',
      subtitle: '3D Flip Digital Smart ID',
      category: 'docs',
      badge: 'Official',
      badgeColor: '#2563eb',
      icon: UserCheck,
      color: '#2563eb',
      bg: '#eff6ff',
      onClick: () => onOpenModal('idCard'),
    },
    {
      id: 'hall_ticket',
      title: currentUser.hallTicketApproved ? 'Hall Ticket (Approved ✓)' : 'Hall Ticket (Locked)',
      subtitle: currentUser.hallTicketApproved ? 'Official Exam Gatepass' : 'Awaiting HOD verification',
      category: 'docs',
      badge: currentUser.hallTicketApproved ? 'Approved ✓' : 'Locked 🔒',
      badgeColor: currentUser.hallTicketApproved ? '#059669' : '#d97706',
      icon: currentUser.hallTicketApproved ? FileText : Lock,
      color: currentUser.hallTicketApproved ? '#059669' : '#d97706',
      bg: currentUser.hallTicketApproved ? '#ecfdf5' : '#fffbeb',
      onClick: () => {
        if (currentUser.hallTicketApproved) {
          onOpenModal('hallTicket');
        } else {
          setHallTicketToast(
            'Your Examination Hall Ticket is currently locked pending HOD approval. Once your attendance (min 75%) and semester fees are verified, HOD will grant Hall Ticket approval.'
          );
          setTimeout(() => setHallTicketToast(null), 7000);
        }
      },
    },
    {
      id: 'marksheet',
      title: 'Digital Marksheet',
      subtitle: 'SGPA / CGPA Grade Report',
      category: 'docs',
      badge: 'Grade Card',
      badgeColor: '#7c3aed',
      icon: Award,
      color: '#7c3aed',
      bg: '#faf5ff',
      onClick: () => onOpenModal('marksheet'),
    },
    {
      id: 'doc_upload',
      title: 'Photo & Documents',
      subtitle: 'Document Verification Vault',
      category: 'docs',
      badge: 'Vault',
      badgeColor: '#059669',
      icon: Camera,
      color: '#059669',
      bg: '#f0fdf4',
      onClick: () => onOpenModal('docUpload'),
    },
    {
      id: 'resume',
      title: 'ATS Resume Builder',
      subtitle: 'Single Page A4 WYSIWYG Studio',
      category: 'docs',
      badge: 'AI Studio',
      badgeColor: '#0891b2',
      icon: FileText,
      color: '#0891b2',
      bg: '#ecfeff',
      onClick: () => onOpenModal('resume'),
    },

    // 💼 CAREER & PLACEMENT
    {
      id: 'placement',
      title: 'T&P Campus Placements',
      subtitle: 'Jobs, Internships & Drives',
      category: 'career',
      badge: 'Campus Drive',
      badgeColor: '#4f46e5',
      icon: Briefcase,
      color: '#4f46e5',
      bg: '#eef2ff',
      onClick: () => onOpenModal('placement'),
    },
    {
      id: 'career_ai',
      title: 'AI Career Path Predictor',
      subtitle: 'Skill Tree & Salary Trajectory',
      category: 'career',
      badge: 'AI Powered',
      badgeColor: '#8b5cf6',
      icon: Brain,
      color: '#8b5cf6',
      bg: '#f3e8ff',
      onClick: () => onOpenModal('careerPath'),
    },
    {
      id: 'leaderboard',
      title: 'XP Leaderboard',
      subtitle: 'Gamified Ranks & Streak Flames',
      category: 'career',
      badge: 'Gamified',
      badgeColor: '#b45309',
      icon: Trophy,
      color: '#b45309',
      bg: '#fffbeb',
      onClick: () => onOpenModal('leaderboard'),
    },
    {
      id: 'analytics',
      title: 'Dept Analytics',
      subtitle: 'Pass Rate & Performance Heatmap',
      category: 'career',
      badge: 'Analytics',
      badgeColor: '#1d4ed8',
      icon: BarChart3,
      color: '#1d4ed8',
      bg: '#eff6ff',
      onClick: () => onOpenModal('analytics'),
    },
    {
      id: 'kanban',
      title: 'Assignment Board',
      subtitle: 'Kanban Drag & Drop Tracker',
      category: 'career',
      badge: 'Kanban',
      badgeColor: '#0e7490',
      icon: ClipboardList,
      color: '#0e7490',
      bg: '#ecfeff',
      onClick: () => onOpenModal('kanban'),
    },

    // 🏛️ CAMPUS LIFE
    {
      id: 'fee_passbook',
      title: 'Fees Passbook',
      subtitle: 'Ledger & Transaction Receipts',
      category: 'campus',
      badge: 'Finance',
      badgeColor: '#2563eb',
      icon: CreditCard,
      color: '#2563eb',
      bg: '#eff6ff',
      onClick: () => onOpenModal('feePassbook'),
    },
    {
      id: 'library',
      title: 'Library Portal',
      subtitle: 'Catalog & Issued Books Tracker',
      category: 'campus',
      badge: 'Library',
      badgeColor: '#be185d',
      icon: Library,
      color: '#be185d',
      bg: '#fdf2f8',
      onClick: () => onOpenModal('library'),
    },
    {
      id: 'calendar',
      title: 'Academic Calendar',
      subtitle: 'Exams, Events & Heatmap',
      category: 'campus',
      badge: 'Schedule',
      badgeColor: '#047857',
      icon: Calendar,
      color: '#047857',
      bg: '#ecfdf5',
      onClick: () => onOpenModal('calendar'),
    },
    {
      id: 'campus_map',
      title: 'Interactive Campus Map',
      subtitle: 'SVG Navigation & Room Locator',
      category: 'campus',
      badge: 'Navigation',
      badgeColor: '#166534',
      icon: MapPin,
      color: '#166534',
      bg: '#f0fdf4',
      onClick: () => onOpenModal('campusMap'),
    },
    {
      id: 'grievance',
      title: 'Grievance Tracker',
      subtitle: 'Anonymous Complaint Timeline',
      category: 'campus',
      badge: 'Support',
      badgeColor: '#c2410c',
      icon: Clock,
      color: '#c2410c',
      bg: '#fff7ed',
      onClick: () => onOpenModal('grievance'),
    },

    // ⚡ AI & SMART SERVICES
    {
      id: 'risk_radar',
      title: 'Attendance Risk Radar',
      subtitle: 'Predictive Absence Calculator',
      category: 'ai',
      badge: 'Risk Engine',
      badgeColor: '#047857',
      icon: Zap,
      color: '#047857',
      bg: '#f0fdf4',
      onClick: () => onOpenModal('riskRadar'),
    },
    {
      id: 'cgpa_predictor',
      title: 'CGPA Predictor',
      subtitle: 'Semester Grade Simulator',
      category: 'ai',
      badge: 'Simulator',
      badgeColor: '#7c3aed',
      icon: Sparkles,
      color: '#7c3aed',
      bg: '#faf5ff',
      onClick: () => onOpenModal('predictor'),
    },
    {
      id: 'feedback',
      title: 'Anonymous Feedback',
      subtitle: 'Faculty Rating & Live Polls',
      category: 'ai',
      badge: 'Anonymous',
      badgeColor: '#be185d',
      icon: MessageCircle,
      color: '#be185d',
      bg: '#fdf2f8',
      onClick: () => onOpenModal('feedback'),
    },
    {
      id: 'achievements',
      title: 'Achievement Wallet',
      subtitle: 'Digital Badges & Certificate Gallery',
      category: 'ai',
      badge: 'Badges',
      badgeColor: '#92400e',
      icon: Trophy,
      color: '#92400e',
      bg: '#fffbeb',
      onClick: () => onOpenModal('achievement'),
    },
    {
      id: 'wellness',
      title: 'Wellness Tracker',
      subtitle: 'Private Mood & Stress Analytics',
      category: 'ai',
      badge: 'Health',
      badgeColor: '#b91c1c',
      icon: Heart,
      color: '#b91c1c',
      bg: '#fef2f2',
      onClick: () => onOpenModal('wellness'),
    },
    {
      id: 'notif_center',
      title: 'Command Center',
      subtitle: 'AI Daily Briefing & Alerts',
      category: 'ai',
      badge: 'Alerts',
      badgeColor: '#c2410c',
      icon: Bell,
      color: '#c2410c',
      bg: '#fff7ed',
      onClick: () => onOpenModal('notifCenter'),
    },
  ];

  const categories = [
    { key: 'all', label: 'All Services', count: services.length },
    { key: 'docs', label: '📄 Documents', count: services.filter(s => s.category === 'docs').length },
    { key: 'career', label: '💼 Career & AI', count: services.filter(s => s.category === 'career').length },
    { key: 'campus', label: '🏛️ Campus Life', count: services.filter(s => s.category === 'campus').length },
    { key: 'ai', label: '⚡ Smart Tools', count: services.filter(s => s.category === 'ai').length },
  ];

  const filteredServices = services.filter(service => {
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ marginTop: '24px' }}>
      {/* Module Title & Search Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '16px',
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: 800,
            color: 'var(--text-heading)',
            fontFamily: 'var(--font-display)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={18} color="var(--primary)" />
            Student Enterprise Services Hub
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Access official documents, AI career tools, campus services & academic features
          </p>
        </div>

        {/* Quick Search */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search service..."
            style={{
              width: '100%',
              padding: '7px 12px 7px 34px',
              fontSize: '12px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              outline: 'none',
              background: 'var(--bg-white)',
              color: 'var(--text-heading)',
            }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '18px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${activeCategory === cat.key ? 'var(--primary)' : 'var(--border-light)'}`,
              background: activeCategory === cat.key ? 'var(--primary)' : 'var(--bg-white)',
              color: activeCategory === cat.key ? '#ffffff' : 'var(--text-body)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: activeCategory === cat.key ? '0 4px 12px rgba(217, 35, 79, 0.2)' : 'none',
            }}
          >
            {cat.label}
            <span style={{
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '10px',
              background: activeCategory === cat.key ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
              color: activeCategory === cat.key ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
            }}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Clean Professional Service Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: '12px',
      }}>
        {filteredServices.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              onClick={service.onClick}
              style={{
                background: 'var(--bg-white)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-xl)',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: 'var(--shadow-xs)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = service.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              {/* Icon Container */}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-lg)',
                background: service.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={20} color={service.color} />
              </div>

              {/* Text Meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '2px',
                }}>
                  <strong style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-heading)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {service.title}
                  </strong>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.3',
                }}>
                  {service.subtitle}
                </p>
              </div>

              {/* Arrow Indicator */}
              <ChevronRight size={14} color="var(--text-muted)" style={{ opacity: 0.6, flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '30px',
          background: 'var(--bg-white)',
          border: '1px dashed var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          color: 'var(--text-muted)',
          fontSize: '13px',
        }}>
          No service found matching "{searchTerm}". Try clearing your search term.
        </div>
      )}
    </div>
  );
}
