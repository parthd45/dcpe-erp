import React, { useState } from 'react';
import {
  FileText, Award, CreditCard, Briefcase,
  Search, Lock, ChevronRight, Zap, Trophy,
  Brain, Calendar, Sparkles, UserCheck
} from 'lucide-react';

export function StudentServicesSuite({
  currentUser,
  onOpenModal,
  hallTicketToast,
  setHallTicketToast
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 🏆 THE TOP 10 BEST CURATED STUDENT FEATURES
  const services = [
    // 📄 CORE DOCUMENTS & VERIFICATION (3)
    {
      id: 'id_card',
      title: 'Digital Student ID Card',
      subtitle: '3D Flip Card with Security Hologram & Barcode',
      category: 'docs',
      badge: '3D Smart ID',
      badgeColor: '#2563eb',
      icon: UserCheck,
      color: '#2563eb',
      bg: '#eff6ff',
      onClick: () => onOpenModal('idCard'),
    },
    {
      id: 'hall_ticket',
      title: currentUser.hallTicketApproved ? 'Exam Hall Ticket (Approved ✓)' : 'Exam Hall Ticket (Locked)',
      subtitle: currentUser.hallTicketApproved ? 'Official Examination Gatepass & Seat No.' : 'Locked until HOD attendance & fee clearance',
      category: 'docs',
      badge: currentUser.hallTicketApproved ? 'Verified ✓' : 'HOD Lock 🔒',
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
      title: 'Digital Marksheet & Grade Card',
      subtitle: 'Official SGPA / CGPA Breakdown & Transcripts',
      category: 'docs',
      badge: 'Grade Report',
      badgeColor: '#7c3aed',
      icon: Award,
      color: '#7c3aed',
      bg: '#faf5ff',
      onClick: () => onOpenModal('marksheet'),
    },

    // 💼 CAREER & AI INTELLIGENCE (3)
    {
      id: 'placement',
      title: 'Training & Placement (T&P Cell)',
      subtitle: 'Live Campus Drives, Job Applications & Salary Packages',
      category: 'career',
      badge: 'Placements 🚀',
      badgeColor: '#4f46e5',
      icon: Briefcase,
      color: '#4f46e5',
      bg: '#eef2ff',
      onClick: () => onOpenModal('placement'),
    },
    {
      id: 'resume',
      title: 'ATS Resume Builder Studio',
      subtitle: 'Single Page A4 Physical Canvas with AI Density Scaler',
      category: 'career',
      badge: 'A4 WYSIWYG',
      badgeColor: '#0891b2',
      icon: FileText,
      color: '#0891b2',
      bg: '#ecfeff',
      onClick: () => onOpenModal('resume'),
    },
    {
      id: 'career_ai',
      title: 'AI Career Path Predictor',
      subtitle: 'Skill Tree Tree & Salary Fit Projection',
      category: 'career',
      badge: 'AI Engine',
      badgeColor: '#8b5cf6',
      icon: Brain,
      color: '#8b5cf6',
      bg: '#f3e8ff',
      onClick: () => onOpenModal('careerPath'),
    },

    // 🎓 ACADEMICS, FINANCE & GAMIFICATION (4)
    {
      id: 'risk_radar',
      title: 'Attendance Risk Radar',
      subtitle: 'AI Bunk Calculator & Target % Safety Simulator',
      category: 'academic',
      badge: 'AI Safety 🔮',
      badgeColor: '#047857',
      icon: Zap,
      color: '#047857',
      bg: '#f0fdf4',
      onClick: () => onOpenModal('riskRadar'),
    },
    {
      id: 'fee_passbook',
      title: 'Fees Passbook & Receipt Vault',
      subtitle: 'Online Payment, Ledger & Official Fee Receipts',
      category: 'academic',
      badge: 'Payments 💳',
      badgeColor: '#2563eb',
      icon: CreditCard,
      color: '#2563eb',
      bg: '#eff6ff',
      onClick: () => onOpenModal('feePassbook'),
    },
    {
      id: 'leaderboard',
      title: 'Gamified XP Leaderboard',
      subtitle: 'Earn XP, Rank Badges & Maintain Daily Streaks',
      category: 'academic',
      badge: 'Leaderboard 🎮',
      badgeColor: '#b45309',
      icon: Trophy,
      color: '#b45309',
      bg: '#fffbeb',
      onClick: () => onOpenModal('leaderboard'),
    },
    {
      id: 'calendar',
      title: 'Smart Academic Calendar',
      subtitle: 'Exam Dates, Holidays, Events & Timetables',
      category: 'academic',
      badge: 'Schedule 📅',
      badgeColor: '#047857',
      icon: Calendar,
      color: '#047857',
      bg: '#ecfdf5',
      onClick: () => onOpenModal('calendar'),
    },
  ];

  const categories = [
    { key: 'all', label: 'Top 10 Features', count: services.length },
    { key: 'docs', label: '📄 Core Documents', count: services.filter(s => s.category === 'docs').length },
    { key: 'career', label: '💼 Career & AI', count: services.filter(s => s.category === 'career').length },
    { key: 'academic', label: '🎓 Academics & Finance', count: services.filter(s => s.category === 'academic').length },
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
            Top 10 Essential Student Power Features
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Curated high-value tools for academics, documents, career & finance
          </p>
        </div>

        {/* Quick Search */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search feature..."
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: '14px',
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
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: 'var(--shadow-xs)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
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
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-xl)',
                background: service.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={22} color={service.color} />
              </div>

              {/* Text Meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '3px',
                }}>
                  <strong style={{
                    fontSize: '13.5px',
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
                  fontSize: '11.5px',
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
              <ChevronRight size={16} color="var(--text-muted)" style={{ opacity: 0.6, flexShrink: 0 }} />
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
          No feature found matching "{searchTerm}".
        </div>
      )}
    </div>
  );
}
