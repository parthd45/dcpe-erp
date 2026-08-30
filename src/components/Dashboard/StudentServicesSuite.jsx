import React, { useState } from 'react';
import {
  FileText, Award, CreditCard, Briefcase,
  Search, Lock, ArrowUpRight, Zap, Trophy,
  Brain, Calendar, Sparkles, UserCheck, CheckCircle2, Flame, Swords
} from 'lucide-react';

export function StudentServicesSuite({
  currentUser,
  onOpenModal,
  hallTicketToast,
  setHallTicketToast
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 🏆 THE TOP 10 BEST CURATED STUDENT FEATURES (STUNNING DESIGN METADATA)
  const services = [
    // 📄 CORE DOCUMENTS & VERIFICATION (3)
    {
      id: 'id_card',
      title: 'Digital Student ID Card',
      subtitle: '3D Flip Card with Security Hologram & Barcode ID',
      category: 'docs',
      badge: '3D Smart ID',
      badgeGradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
      icon: UserCheck,
      color: '#2563eb',
      bg: '#eff6ff',
      glow: 'rgba(37, 99, 235, 0.25)',
      onClick: () => onOpenModal('idCard'),
    },
    {
      id: 'hall_ticket',
      title: currentUser.hallTicketApproved ? 'Exam Hall Ticket (Approved ✓)' : 'Exam Hall Ticket (Locked)',
      subtitle: currentUser.hallTicketApproved ? 'Official Exam Gatepass & Seating Allocation' : 'Locked until HOD attendance & fee clearance',
      category: 'docs',
      badge: currentUser.hallTicketApproved ? 'HOD Verified ✓' : 'HOD Lock 🔒',
      badgeGradient: currentUser.hallTicketApproved ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #d97706, #f59e0b)',
      icon: currentUser.hallTicketApproved ? FileText : Lock,
      color: currentUser.hallTicketApproved ? '#059669' : '#d97706',
      bg: currentUser.hallTicketApproved ? '#ecfdf5' : '#fffbeb',
      glow: currentUser.hallTicketApproved ? 'rgba(5, 150, 105, 0.25)' : 'rgba(217, 119, 6, 0.25)',
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
      subtitle: 'Official SGPA / CGPA Transcripts & Marksheet Vault',
      category: 'docs',
      badge: 'Transcripts',
      badgeGradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      icon: Award,
      color: '#7c3aed',
      bg: '#faf5ff',
      glow: 'rgba(124, 58, 237, 0.25)',
      onClick: () => onOpenModal('marksheet'),
    },
    {
      id: 'tamper_ledger',
      title: 'SHA-256 Cryptographic Ledger',
      subtitle: 'Employer Scan-to-Verify Marksheet & Hall Ticket Authenticator',
      category: 'docs',
      badge: '256-Bit Ledger 🔒',
      badgeGradient: 'linear-gradient(135deg, #059669, #047857)',
      icon: Lock,
      color: '#059669',
      bg: '#ecfdf5',
      glow: 'rgba(5, 150, 105, 0.25)',
      onClick: () => onOpenModal('tamperLedger'),
    },

    // 💼 CAREER & AI INTELLIGENCE (3)
    {
      id: 'placement',
      title: 'Training & Placement (T&P Cell)',
      subtitle: 'Live Campus Drives, Job Applications & Salary CTCs',
      category: 'career',
      badge: 'Placements 🚀',
      badgeGradient: 'linear-gradient(135deg, #1e1b4b, #312e81)',
      icon: Briefcase,
      color: '#67e8f9',
      bg: '#1e1b4b',
      isDarkBg: true,
      glow: 'rgba(30, 27, 75, 0.4)',
      onClick: () => onOpenModal('placement'),
    },
    {
      id: 'resume',
      title: 'ATS Resume Builder Studio',
      subtitle: 'Single Page A4 Physical Canvas with AI Density Scaler',
      category: 'career',
      badge: 'A4 WYSIWYG',
      badgeGradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
      icon: FileText,
      color: '#0891b2',
      bg: '#ecfeff',
      glow: 'rgba(8, 145, 178, 0.25)',
      onClick: () => onOpenModal('resume'),
    },
    {
      id: 'ats_scanner',
      title: 'Drag & Drop PDF ATS Scanner',
      subtitle: 'Upload PDF Resume & Audit Recruiter Keyword Match Score',
      category: 'career',
      badge: 'AI Scanner 🔍',
      badgeGradient: 'linear-gradient(135deg, #0284c7, #0891b2)',
      icon: Search,
      color: '#0284c7',
      bg: '#f0f9ff',
      glow: 'rgba(2, 132, 199, 0.25)',
      onClick: () => onOpenModal('atsScanner'),
    },
    {
      id: 'career_ai',
      title: 'AI Career Path Predictor',
      subtitle: 'Skill Tree Roadmap & Salary Fit Projections',
      category: 'career',
      badge: 'AI Engine 🧠',
      badgeGradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
      icon: Brain,
      color: '#8b5cf6',
      bg: '#f3e8ff',
      glow: 'rgba(139, 92, 246, 0.25)',
      onClick: () => onOpenModal('careerPath'),
    },
    {
      id: 'skill_tree',
      title: 'RPG Competency Skill Tree',
      subtitle: 'Unlock Competency Nodes & Level Up XP Rank',
      category: 'career',
      badge: 'RPG Skill Tree 🏆',
      badgeGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      icon: Trophy,
      color: '#f59e0b',
      bg: '#fffbeb',
      glow: 'rgba(245, 158, 11, 0.25)',
      onClick: () => onOpenModal('skillTree'),
    },
    {
      id: 'battle_arena',
      title: '1-on-1 Battle Arena',
      subtitle: 'Real-Time Multiplayer Code & Academic Trivia Duels',
      category: 'academic',
      badge: 'LIVE DUEL ⚔️',
      badgeGradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      icon: Swords,
      color: '#ef4444',
      bg: '#fef2f2',
      glow: 'rgba(239, 68, 68, 0.25)',
      onClick: () => onOpenModal('battleArena'),
    },
    {
      id: 'code_sandbox',
      title: 'WASM Code REPL Sandbox',
      subtitle: 'In-Browser Python, JS, SQL & HTML Code Execution Studio',
      category: 'career',
      badge: '⚡ WASM REPL',
      badgeGradient: 'linear-gradient(135deg, #10b981, #059669)',
      icon: Zap,
      color: '#10b981',
      bg: '#ecfdf5',
      glow: 'rgba(16, 185, 129, 0.25)',
      onClick: () => onOpenModal('codeSandbox'),
    },
    {
      id: 'biomechanics',
      title: 'Biomechanics Motion Capture',
      subtitle: 'Kinematic Joint Angle & Athletic Performance Vision',
      category: 'academic',
      badge: 'Sports Science 🏃',
      badgeGradient: 'linear-gradient(135deg, #059669, #10b981)',
      icon: Zap,
      color: '#059669',
      bg: '#ecfdf5',
      glow: 'rgba(5, 150, 105, 0.25)',
      onClick: () => onOpenModal('biomechanics'),
    },

    // 🎓 ACADEMICS, FINANCE & GAMIFICATION (4)
    {
      id: 'risk_radar',
      title: 'Attendance Risk Radar',
      subtitle: 'AI Bunk Calculator & Target % Safety Simulator',
      category: 'academic',
      badge: 'AI Safety 🔮',
      badgeGradient: 'linear-gradient(135deg, #047857, #10b981)',
      icon: Zap,
      color: '#047857',
      bg: '#f0fdf4',
      glow: 'rgba(4, 120, 87, 0.25)',
      onClick: () => onOpenModal('riskRadar'),
    },
    {
      id: 'fee_passbook',
      title: 'Fees Passbook & Receipt Vault',
      subtitle: 'Online Payment, Fee Receipts & Financial Ledger',
      category: 'academic',
      badge: 'Payments 💳',
      badgeGradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      icon: CreditCard,
      color: '#2563eb',
      bg: '#eff6ff',
      glow: 'rgba(37, 99, 235, 0.25)',
      onClick: () => onOpenModal('feePassbook'),
    },
    {
      id: 'leaderboard',
      title: 'Gamified XP Leaderboard',
      subtitle: 'Earn XP, Rank Badges (Bronze → Legend) & Streaks',
      category: 'academic',
      badge: 'Leaderboard 🎮',
      badgeGradient: 'linear-gradient(135deg, #b45309, #f59e0b)',
      icon: Trophy,
      color: '#b45309',
      bg: '#fffbeb',
      glow: 'rgba(180, 83, 9, 0.25)',
      onClick: () => onOpenModal('leaderboard'),
    },
    {
      id: 'calendar',
      title: 'Smart Academic Calendar',
      subtitle: 'Exam Schedules, Holidays, Events & Timetable Heatmap',
      category: 'academic',
      badge: 'Schedule 📅',
      badgeGradient: 'linear-gradient(135deg, #059669, #10b981)',
      icon: Calendar,
      color: '#059669',
      bg: '#ecfdf5',
      glow: 'rgba(5, 150, 105, 0.25)',
      onClick: () => onOpenModal('calendar'),
    },
  ];

  const categories = [
    { key: 'all', label: 'Top 10 Essential Features', count: services.length },
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
    <div style={{ marginTop: '28px' }}>
      {/* Module Title & Search Header */}
      <div className="student-services-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '18px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #d9234f, #f43f5e)',
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(217, 35, 79, 0.3)',
            }}>
              Curated Suite
            </span>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--text-heading)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.3px',
            }}>
              Top 10 Essential Student Power Features
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Hand-picked enterprise grade tools for academic success, documents, career & financial management.
          </p>
        </div>

        {/* Quick Search */}
        <div className="services-search-box" style={{ position: 'relative', width: '250px' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Quick search feature..."
            style={{
              width: '100%',
              padding: '9px 14px 9px 38px',
              fontSize: '12px',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              outline: 'none',
              background: 'var(--bg-white)',
              color: 'var(--text-heading)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease',
            }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="student-services-categories" style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
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
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-xl)',
              border: `1px solid ${activeCategory === cat.key ? 'transparent' : 'var(--border-light)'}`,
              background: activeCategory === cat.key ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' : 'var(--bg-white)',
              color: activeCategory === cat.key ? '#ffffff' : 'var(--text-body)',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.25s ease',
              boxShadow: activeCategory === cat.key ? '0 4px 14px rgba(30, 27, 75, 0.3)' : '0 2px 4px rgba(0,0,0,0.02)',
            }}
          >
            {cat.label}
            <span style={{
              fontSize: '10.5px',
              padding: '2px 7px',
              borderRadius: '10px',
              background: activeCategory === cat.key ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
              color: activeCategory === cat.key ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 800,
            }}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Clean Professional Service Grid */}
      <div className="student-services-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px',
      }}>
        {filteredServices.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="student-service-card"
              onClick={service.onClick}
              style={{
                background: service.isDarkBg ? 'linear-gradient(145deg, #1e1b4b 0%, #2e1065 100%)' : 'var(--bg-white)',
                border: `1px solid ${service.isDarkBg ? 'rgba(255,255,255,0.1)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-2xl)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '138px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 24px ${service.glow}`;
                e.currentTarget.style.borderColor = service.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                e.currentTarget.style.borderColor = service.isDarkBg ? 'rgba(255,255,255,0.1)' : 'var(--border-light)';
              }}
            >
              {/* Top Row: Icon + Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div className="service-card-icon" style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: service.isDarkBg ? 'rgba(255,255,255,0.12)' : service.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${service.glow}`,
                  flexShrink: 0,
                }}>
                  <Icon size={22} color={service.isDarkBg ? '#67e8f9' : service.color} />
                </div>

                {/* Badge Pill */}
                <span className="service-card-badge" style={{
                  background: service.badgeGradient,
                  color: '#ffffff',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  boxShadow: `0 2px 8px ${service.glow}`,
                  letterSpacing: '0.2px',
                }}>
                  {service.badge}
                </span>
              </div>

              {/* Bottom Meta & Action Arrow */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}>
                  <strong className="service-card-title" style={{
                    fontSize: '14.5px',
                    fontWeight: 800,
                    color: service.isDarkBg ? '#ffffff' : 'var(--text-heading)',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.2px',
                    lineHeight: '1.25',
                  }}>
                    {service.title}
                  </strong>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: service.isDarkBg ? 'rgba(255,255,255,0.15)' : '#f8fafc',
                    border: `1px solid ${service.isDarkBg ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <ArrowUpRight size={15} color={service.isDarkBg ? '#67e8f9' : service.color} />
                  </div>
                </div>

                <p className="service-card-subtitle" style={{
                  margin: '4px 0 0',
                  fontSize: '12px',
                  color: service.isDarkBg ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                  lineHeight: '1.35',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {service.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'var(--bg-white)',
          border: '1px dashed var(--border-light)',
          borderRadius: 'var(--radius-2xl)',
          color: 'var(--text-muted)',
          fontSize: '13px',
        }}>
          No feature found matching "{searchTerm}".
        </div>
      )}
    </div>
  );
}
