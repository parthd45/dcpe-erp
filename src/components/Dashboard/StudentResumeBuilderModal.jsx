import React, { useState } from 'react';
import {
  FileText, Printer, X, Sparkles, CheckCircle2, User,
  Mail, Phone, GraduationCap, Award, Briefcase, Code, Plus, Trash2, Globe, Palette, Layout, Sliders, Edit3, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import './Dashboard.css';

export function StudentResumeBuilderModal({ currentUser, onClose }) {
  if (!currentUser) return null;

  // Selected Resume Template & Styling
  const [template, setTemplate] = useState('modern'); // 'modern' | 'classic' | 'twocolumn' | 'minimal'
  const [accentColor, setAccentColor] = useState('#1e1b4b'); // '#1e1b4b' | '#0284c7' | '#059669' | '#9f1239' | '#0f172a'
  const [densityOverride, setDensityOverride] = useState('auto'); // 'auto' | 'normal' | 'compact' | 'ultra'
  const [zoomLevel, setZoomLevel] = useState(0.88); // Zoom scale for A4 paper canvas preview

  // Candidate Contact & Profile State (Directly Editable)
  const [name, setName] = useState(currentUser.name || 'PARTH PRAVIN DESHMUKH');
  const [email, setEmail] = useState(currentUser.email || 'parth.deshmukh.bca@dcpehvm.org');
  const [phone, setPhone] = useState(currentUser.phone || '+917028030836');
  const [location, setLocation] = useState('DCPE Amravati');

  // Editable resume content
  const [summary, setSummary] = useState(
    `Dedicated ${currentUser.course || 'BCA (Bachelor of Computer Applications)'} candidate at Degree College of Physical Education (HVPM Autonomous Institute). Strong academic background (CGPA: ${currentUser.cgpa || '8.5'}) with hands-on technical skills and proven leadership in campus sports & technology initiatives.`
  );

  const [skills, setSkills] = useState([
    'JavaScript (ES6+)', 'React.js', 'Python', 'SQL & Databases',
    'Sports Biomechanics', 'Event Management', 'Git & GitHub'
  ]);

  const [projects, setProjects] = useState([
    {
      title: 'DCPE ERP & Campus Management System',
      duration: '2026',
      description: 'Built full-stack React ERP module featuring QR gatepass verifications, real-time Supabase toast notifications, and automated academic predictor tools.'
    },
    {
      title: 'Sports Performance Analytics Dashboard',
      duration: '2025',
      description: 'Analyzed athlete physiological metrics using data visualization tools to track stamina recovery curves.'
    }
  ]);

  const [certifications, setCertifications] = useState([
    'National Sports & Fitness Training Certification (HVPM)',
    'Full Stack Web Development Professional — Udemy (2025)'
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // DIRECT INLINE EDIT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const updateSkill = (index, value) => {
    const next = [...skills];
    next[index] = value;
    setSkills(next);
  };

  const handleAddSkillInline = () => {
    setSkills([...skills, 'New Skill']);
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateProjectTitle = (index, value) => {
    const next = [...projects];
    next[index].title = value;
    setProjects(next);
  };

  const updateProjectDuration = (index, value) => {
    const next = [...projects];
    next[index].duration = value;
    setProjects(next);
  };

  const updateProjectDesc = (index, value) => {
    const next = [...projects];
    next[index].description = value;
    setProjects(next);
  };

  const handleAddProjectInline = () => {
    setProjects([...projects, { title: 'New Project Title', duration: '2026', description: 'Enter project details and achievements here...' }]);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateCert = (index, value) => {
    const next = [...certifications];
    next[index] = value;
    setCertifications(next);
  };

  const handleAddCertInline = () => {
    setCertifications([...certifications, 'New Certification Name']);
  };

  const handleRemoveCert = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  // AI Single-Page Fitting Calculation
  const totalCharCount =
    (name || '').length +
    (summary || '').length +
    skills.join('').length +
    projects.reduce((acc, p) => acc + (p.title || '').length + (p.description || '').length, 0) +
    certifications.join('').length;

  let activeDensity = 'normal';
  if (densityOverride !== 'auto') {
    activeDensity = densityOverride;
  } else if (totalCharCount > 850) {
    activeDensity = 'ultra';
  } else if (totalCharCount > 550) {
    activeDensity = 'compact';
  }

  const capacityPct = Math.min(100, Math.round((totalCharCount / 1000) * 100));

  const styles = {
    titleSize: activeDensity === 'ultra' ? '18px' : activeDensity === 'compact' ? '20px' : '23px',
    sectionTitleSize: activeDensity === 'ultra' ? '10px' : activeDensity === 'compact' ? '11px' : '12.5px',
    bodySize: activeDensity === 'ultra' ? '9.5px' : activeDensity === 'compact' ? '10.5px' : '11.5px',
    smallSize: activeDensity === 'ultra' ? '9px' : activeDensity === 'compact' ? '9.5px' : '10.5px',
    sectionMargin: activeDensity === 'ultra' ? '8px' : activeDensity === 'compact' ? '12px' : '16px',
    itemMargin: activeDensity === 'ultra' ? '4px' : activeDensity === 'compact' ? '6px' : '9px',
    lineHeight: activeDensity === 'ultra' ? 1.2 : activeDensity === 'compact' ? 1.32 : 1.45,
    badgePadding: activeDensity === 'ultra' ? '1px 5px' : activeDensity === 'compact' ? '2px 7px' : '3px 9px',
    headerPadding: activeDensity === 'ultra' ? '12px 16px' : activeDensity === 'compact' ? '16px 20px' : '20px 24px',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Strict A4 Print CSS & True Paper Viewport Rules */}
      <style>{`
        .inline-resume-input {
          background: transparent;
          border: 1px solid transparent;
          border-radius: 3px;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          color: inherit;
          line-height: inherit;
          width: 100%;
          padding: 1px 3px;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }
        .inline-resume-input:hover {
          background: rgba(241, 245, 249, 0.8);
          border: 1px dashed #94a3b8;
        }
        .inline-resume-input:focus {
          background: #ffffff;
          border: 1px solid var(--primary);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
          outline: none;
        }
        .inline-resume-textarea {
          background: transparent;
          border: 1px solid transparent;
          border-radius: 3px;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          color: inherit;
          line-height: inherit;
          width: 100%;
          padding: 1px 3px;
          box-sizing: border-box;
          resize: vertical;
          transition: all 0.15s ease;
        }
        .inline-resume-textarea:hover {
          background: rgba(241, 245, 249, 0.8);
          border: 1px dashed #94a3b8;
        }
        .inline-resume-textarea:focus {
          background: #ffffff;
          border: 1px solid var(--primary);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
          outline: none;
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            height: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-ats-resume,
          #printable-ats-resume * {
            visibility: visible !important;
          }
          #printable-ats-resume {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            border: none !important;
            background: white !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            transform: scale(1) !important;
            transform-origin: top left !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          .inline-resume-input,
          .inline-resume-textarea {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            resize: none !important;
            box-shadow: none !important;
          }
          .no-print,
          .inline-action-btn,
          .a4-page-end-line {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="printable-document-container"
        style={{
          background: '#0f172a',
          borderRadius: '24px',
          maxWidth: '1100px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Control Bar */}
        <div
          className="no-print"
          style={{
            padding: '14px 24px',
            background: '#090d16',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px' }}>
            <FileText size={18} color="#38bdf8" />
            True A4 Sheet Viewport — WYSIWYG Resume Studio
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Canvas Zoom Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#1e293b', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', color: '#94a3b8' }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.08))}
                style={{ padding: '2px 6px', color: 'white', background: 'transparent', border: 'none' }}
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span>{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setZoomLevel(Math.min(1.2, zoomLevel + 0.08))}
                style={{ padding: '2px 6px', color: 'white', background: 'transparent', border: 'none' }}
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setZoomLevel(0.88)}
                style={{ padding: '2px 6px', color: '#38bdf8', background: 'transparent', border: 'none', fontSize: '10px' }}
                title="Fit A4 to Screen"
              >
                Fit
              </button>
            </div>

            <button className="btn btn-primary btn-sm" onClick={handlePrint} style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
              <Printer size={15} /> Print / Save Single-Page PDF
            </button>
            <button className="btn btn-sm" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Template & Styling Control Bar */}
        <div
          className="no-print"
          style={{
            padding: '12px 24px',
            background: '#1e293b',
            color: '#f8fafc',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Template Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layout size={14} color="#38bdf8" /> Layout:
            </span>
            {[
              { id: 'modern', label: 'Modern Executive' },
              { id: 'classic', label: 'Classic Academic' },
              { id: 'twocolumn', label: 'Two-Column Compact' },
              { id: 'minimal', label: 'Minimalist ATS' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`btn btn-sm ${template === t.id ? 'btn-primary' : 'btn-white'}`}
                style={{ borderRadius: '20px', fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setTemplate(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Color Theme Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginRight: '4px' }}>Theme:</span>
            {[
              { color: '#1e1b4b', label: 'Navy' },
              { color: '#0284c7', label: 'Sky' },
              { color: '#059669', label: 'Emerald' },
              { color: '#9f1239', label: 'Rose' },
              { color: '#0f172a', label: 'Slate' },
            ].map((c) => (
              <div
                key={c.color}
                onClick={() => setAccentColor(c.color)}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: c.color,
                  cursor: 'pointer',
                  border: accentColor === c.color ? '2px solid white' : 'none',
                  boxShadow: accentColor === c.color ? '0 0 0 2px #38bdf8' : 'none',
                }}
                title={c.label}
              />
            ))}
          </div>

          {/* Density Control Override */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sliders size={13} color="#38bdf8" /> Density:
            </span>
            {[
              { id: 'auto', label: `🤖 Auto (${activeDensity})` },
              { id: 'normal', label: 'Normal' },
              { id: 'compact', label: 'Compact' },
              { id: 'ultra', label: 'Micro fit' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                className={`btn btn-sm ${densityOverride === d.id ? 'btn-primary' : 'btn-white'}`}
                style={{ borderRadius: '20px', fontSize: '10px', padding: '3px 8px' }}
                onClick={() => setDensityOverride(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Helper Notification Ribbon */}
        <div
          className="no-print"
          style={{
            background: '#0284c7',
            color: 'white',
            padding: '6px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <Sparkles size={14} />
            <span>📐 <strong>True A4 Physical Sheet Viewport:</strong> You are editing on an exact 210mm x 297mm A4 page canvas. What you see is 100% what prints!</span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(0,0,0,0.2)', padding: '2px 10px', borderRadius: '12px' }}>
            1-Page A4 Capacity: {capacityPct}%
          </div>
        </div>

        {/* Studio Desktop Background Container */}
        <div
          style={{
            padding: '40px 20px',
            overflowY: 'auto',
            background: 'radial-gradient(circle at center, #334155 0%, #0f172a 100%)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Scalable Container wrapper */}
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              marginBottom: `${(1 - zoomLevel) * -200}px`,
            }}
          >
            {/* ── REAL PHYSICAL A4 PAPER CANVAS (210mm x 297mm) ── */}
            <div
              id="printable-ats-resume"
              style={{
                width: '210mm',
                minHeight: '297mm',
                height: '297mm',
                background: 'white',
                padding: '12mm 15mm',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                borderRadius: '0px', // Exact sharp paper edge
                lineHeight: styles.lineHeight,
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* ─────────────────────────────────────────────────────────────
                  TEMPLATE 1: MODERN EXECUTIVE (DIRECT ON-PAPER EDITABLE)
                 ───────────────────────────────────────────────────────────── */}
              {template === 'modern' && (
                <div style={{ fontFamily: `'Inter', system-ui, sans-serif`, color: '#1e293b' }}>
                  {/* Header Card */}
                  <div style={{ background: accentColor, color: 'white', padding: styles.headerPadding, borderRadius: '8px', marginBottom: styles.sectionMargin }}>
                    <input
                      type="text"
                      className="inline-resume-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ fontSize: styles.titleSize, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'white' }}
                    />
                    <div style={{ fontSize: styles.bodySize, fontWeight: 700, color: '#e0e7ff', marginTop: '2px' }}>
                      {currentUser.course} — {currentUser.departmentName}
                    </div>
                    <div style={{ fontSize: styles.smallSize, marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '12px', color: '#f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📧 <input type="text" className="inline-resume-input" value={email} onChange={(e) => setEmail(e.target.value)} style={{ color: 'white', width: 'auto' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📱 <input type="text" className="inline-resume-input" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ color: 'white', width: '130px' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📍 <input type="text" className="inline-resume-input" value={location} onChange={(e) => setLocation(e.target.value)} style={{ color: 'white', width: '120px' }} />
                      </div>
                      <div>PRN: <code>{currentUser.prn}</code></div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{ marginBottom: styles.sectionMargin }}>
                    <h3 style={{ fontSize: styles.sectionTitleSize, fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '2px', marginBottom: styles.itemMargin }}>
                      Professional Summary
                    </h3>
                    <textarea
                      className="inline-resume-textarea"
                      rows={3}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      style={{ fontSize: styles.bodySize, color: '#334155' }}
                    />
                  </div>

                  {/* Education */}
                  <div style={{ marginBottom: styles.sectionMargin }}>
                    <h3 style={{ fontSize: styles.sectionTitleSize, fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '2px', marginBottom: styles.itemMargin }}>
                      Education & Academic Record
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: styles.bodySize, fontWeight: 700 }}>
                      <span>Degree College of Physical Education (HVPM Autonomous), Amravati</span>
                      <span>2024 – 2026</span>
                    </div>
                    <div style={{ fontSize: styles.smallSize, color: '#475569', display: 'flex', justifyContent: 'space-between', marginTop: '1px' }}>
                      <span>{currentUser.course} ({currentUser.departmentName})</span>
                      <span>CGPA: <strong>{currentUser.cgpa || '8.5'} / 10.0</strong> • Attendance: <strong>{currentUser.attendance || '90%'}</strong></span>
                    </div>
                  </div>

                  {/* Technical Skills */}
                  <div style={{ marginBottom: styles.sectionMargin }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${accentColor}`, paddingBottom: '2px', marginBottom: styles.itemMargin }}>
                      <h3 style={{ fontSize: styles.sectionTitleSize, fontWeight: 800, textTransform: 'uppercase', color: accentColor, margin: 0 }}>
                        Technical & Core Competencies
                      </h3>
                      <button type="button" className="inline-action-btn btn btn-white btn-sm" onClick={handleAddSkillInline} style={{ fontSize: '10px', padding: '1px 8px' }}>
                        + Add Skill
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {skills.map((skill, index) => (
                        <span
                          key={index}
                          style={{
                            background: '#f1f5f9',
                            color: accentColor,
                            fontSize: styles.smallSize,
                            fontWeight: 700,
                            padding: styles.badgePadding,
                            borderRadius: '4px',
                            border: `1px solid ${accentColor}33`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <input
                            type="text"
                            className="inline-resume-input"
                            value={skill}
                            onChange={(e) => updateSkill(index, e.target.value)}
                            style={{ width: `${Math.max(50, skill.length * 7.5)}px`, color: accentColor }}
                          />
                          <X size={11} className="no-print" style={{ cursor: 'pointer' }} onClick={() => handleRemoveSkill(index)} />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Projects */}
                  <div style={{ marginBottom: styles.sectionMargin }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${accentColor}`, paddingBottom: '2px', marginBottom: styles.itemMargin }}>
                      <h3 style={{ fontSize: styles.sectionTitleSize, fontWeight: 800, textTransform: 'uppercase', color: accentColor, margin: 0 }}>
                        Key Projects & Implementations
                      </h3>
                      <button type="button" className="inline-action-btn btn btn-white btn-sm" onClick={handleAddProjectInline} style={{ fontSize: '10px', padding: '1px 8px' }}>
                        + Add Project
                      </button>
                    </div>

                    {projects.map((proj, i) => (
                      <div key={i} style={{ marginBottom: styles.itemMargin }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: styles.bodySize, fontWeight: 700, gap: '10px' }}>
                          <input
                            type="text"
                            className="inline-resume-input"
                            value={proj.title}
                            onChange={(e) => updateProjectTitle(i, e.target.value)}
                            style={{ fontWeight: 700 }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="text"
                              className="inline-resume-input"
                              value={proj.duration}
                              onChange={(e) => updateProjectDuration(i, e.target.value)}
                              style={{ width: '60px', textAlign: 'right', color: '#64748b' }}
                            />
                            <X size={12} className="no-print" style={{ cursor: 'pointer' }} onClick={() => handleRemoveProject(i)} />
                          </div>
                        </div>
                        <textarea
                          className="inline-resume-textarea"
                          rows={2}
                          value={proj.description}
                          onChange={(e) => updateProjectDesc(i, e.target.value)}
                          style={{ fontSize: styles.smallSize, color: '#334155' }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Certifications */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${accentColor}`, paddingBottom: '2px', marginBottom: styles.itemMargin }}>
                      <h3 style={{ fontSize: styles.sectionTitleSize, fontWeight: 800, textTransform: 'uppercase', color: accentColor, margin: 0 }}>
                        Certifications & Accreditations
                      </h3>
                      <button type="button" className="inline-action-btn btn btn-white btn-sm" onClick={handleAddCertInline} style={{ fontSize: '10px', padding: '1px 8px' }}>
                        + Add Certification
                      </button>
                    </div>

                    <ul style={{ margin: 0, paddingLeft: '14px', fontSize: styles.smallSize, color: '#334155' }}>
                      {certifications.map((cert, i) => (
                        <li key={i} style={{ marginBottom: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="text"
                              className="inline-resume-input"
                              value={cert}
                              onChange={(e) => updateCert(i, e.target.value)}
                            />
                            <X size={11} className="no-print" style={{ cursor: 'pointer' }} onClick={() => handleRemoveCert(i)} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TEMPLATE 2: CLASSIC ACADEMIC
                 ───────────────────────────────────────────────────────────── */}
              {template === 'classic' && (
                <div style={{ fontFamily: `'Georgia', serif`, color: '#111827' }}>
                  <div style={{ textAlign: 'center', borderBottom: '2px double #111827', paddingBottom: styles.itemMargin, marginBottom: styles.sectionMargin }}>
                    <input
                      type="text"
                      className="inline-resume-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ fontSize: styles.titleSize, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', color: accentColor }}
                    />
                    <div style={{ fontSize: styles.bodySize, fontStyle: 'italic', marginTop: '2px' }}>
                      {currentUser.course} • {currentUser.departmentName}
                    </div>
                    <div style={{ fontSize: styles.smallSize, marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <span>Email: <input type="text" className="inline-resume-input" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: 'auto' }} /></span>
                      <span>Phone: <input type="text" className="inline-resume-input" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '120px' }} /></span>
                    </div>
                  </div>

                  <div style={{ marginBottom: styles.sectionMargin }}>
                    <h3 style={{ fontSize: styles.sectionTitleSize, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: styles.itemMargin, color: accentColor }}>
                      Academic Summary
                    </h3>
                    <textarea
                      className="inline-resume-textarea"
                      rows={3}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      style={{ fontSize: styles.bodySize }}
                    />
                  </div>

                  <div style={{ marginBottom: styles.sectionMargin }}>
                    <h3 style={{ fontSize: styles.sectionTitleSize, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: styles.itemMargin, color: accentColor }}>
                      Education & Autonomy Qualifications
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: styles.bodySize, fontWeight: 700 }}>
                      <span>Shree HVPM Degree College of Physical Education, Amravati</span>
                      <span>2024 – 2026</span>
                    </div>
                    <div style={{ fontSize: styles.smallSize, fontStyle: 'italic' }}>
                      {currentUser.course} — CGPA: {currentUser.cgpa || '8.5'} (Attendance: {currentUser.attendance || '90%'})
                    </div>
                  </div>

                  <div style={{ marginBottom: styles.sectionMargin }}>
                    <h3 style={{ fontSize: styles.sectionTitleSize, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: styles.itemMargin, color: accentColor }}>
                      Technical & Subject Skills
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {skills.map((s, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <input type="text" className="inline-resume-input" value={s} onChange={(e) => updateSkill(i, e.target.value)} style={{ width: `${Math.max(50, s.length * 8)}px` }} /> •
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: styles.sectionMargin }}>
                    <h3 style={{ fontSize: styles.sectionTitleSize, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: styles.itemMargin, color: accentColor }}>
                      Project Work & Research
                    </h3>
                    {projects.map((proj, i) => (
                      <div key={i} style={{ marginBottom: styles.itemMargin }}>
                        <input type="text" className="inline-resume-input" value={proj.title} onChange={(e) => updateProjectTitle(i, e.target.value)} style={{ fontWeight: 700 }} />
                        <textarea className="inline-resume-textarea" rows={2} value={proj.description} onChange={(e) => updateProjectDesc(i, e.target.value)} style={{ fontSize: styles.smallSize }} />
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 style={{ fontSize: styles.sectionTitleSize, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: styles.itemMargin, color: accentColor }}>
                      Honors & Certifications
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: styles.smallSize }}>
                      {certifications.map((cert, i) => (
                        <li key={i}>
                          <input type="text" className="inline-resume-input" value={cert} onChange={(e) => updateCert(i, e.target.value)} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TEMPLATE 3: TWO-COLUMN COMPACT
                 ───────────────────────────────────────────────────────────── */}
              {template === 'twocolumn' && (
                <div style={{ fontFamily: `'Inter', sans-serif`, display: 'grid', gridTemplateColumns: '180px 1fr', gap: '14px' }}>
                  {/* Left Sidebar Column */}
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: styles.sectionTitleSize, fontWeight: 800, color: accentColor, textTransform: 'uppercase', marginBottom: '4px', borderBottom: `2px solid ${accentColor}`, paddingBottom: '2px' }}>
                      Contact
                    </div>
                    <div style={{ fontSize: styles.smallSize, color: '#334155', display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: styles.sectionMargin }}>
                      <input type="text" className="inline-resume-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <input type="text" className="inline-resume-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      <input type="text" className="inline-resume-input" value={location} onChange={(e) => setLocation(e.target.value)} />
                      <span>PRN: {currentUser.prn}</span>
                    </div>

                    <div style={{ fontSize: styles.sectionTitleSize, fontWeight: 800, color: accentColor, textTransform: 'uppercase', marginBottom: '4px', borderBottom: `2px solid ${accentColor}`, paddingBottom: '2px' }}>
                      Skills
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: styles.sectionMargin }}>
                      {skills.map((skill, index) => (
                        <input key={index} type="text" className="inline-resume-input" value={skill} onChange={(e) => updateSkill(index, e.target.value)} />
                      ))}
                    </div>

                    <div style={{ fontSize: styles.sectionTitleSize, fontWeight: 800, color: accentColor, textTransform: 'uppercase', marginBottom: '4px', borderBottom: `2px solid ${accentColor}`, paddingBottom: '2px' }}>
                      Certifications
                    </div>
                    <div style={{ fontSize: styles.smallSize, color: '#334155', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {certifications.map((cert, i) => (
                        <input key={i} type="text" className="inline-resume-input" value={cert} onChange={(e) => updateCert(i, e.target.value)} />
                      ))}
                    </div>
                  </div>

                  {/* Right Main Column */}
                  <div>
                    <div style={{ borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px', marginBottom: styles.sectionMargin }}>
                      <input type="text" className="inline-resume-input" value={name} onChange={(e) => setName(e.target.value)} style={{ fontSize: styles.titleSize, fontWeight: 900, color: accentColor }} />
                      <div style={{ fontSize: styles.bodySize, color: '#475569', fontWeight: 700 }}>
                        {currentUser.course} — {currentUser.departmentName}
                      </div>
                    </div>

                    <div style={{ marginBottom: styles.sectionMargin }}>
                      <h3 style={{ fontSize: styles.sectionTitleSize, fontWeight: 800, textTransform: 'uppercase', color: accentColor, margin: '0 0 2px' }}>
                        Executive Summary
                      </h3>
                      <textarea className="inline-resume-textarea" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} style={{ fontSize: styles.bodySize }} />
                    </div>

                    <div style={{ marginBottom: styles.sectionMargin }}>
                      <h3 style={{ fontSize: styles.sectionTitleSize, fontWeight: 800, textTransform: 'uppercase', color: accentColor, margin: '0 0 2px' }}>
                        Education
                      </h3>
                      <div style={{ fontSize: styles.bodySize, fontWeight: 700 }}>
                        Degree College of Physical Education (HVPM), Amravati
                      </div>
                      <div style={{ fontSize: styles.smallSize, color: '#475569' }}>
                        {currentUser.course} | CGPA: {currentUser.cgpa || '8.5'} | Attendance: {currentUser.attendance || '90%'}
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: styles.sectionTitleSize, fontWeight: 800, textTransform: 'uppercase', color: accentColor, margin: '0 0 2px' }}>
                        Projects
                      </h3>
                      {projects.map((proj, i) => (
                        <div key={i} style={{ marginBottom: styles.itemMargin }}>
                          <input type="text" className="inline-resume-input" value={proj.title} onChange={(e) => updateProjectTitle(i, e.target.value)} style={{ fontWeight: 700 }} />
                          <textarea className="inline-resume-textarea" rows={2} value={proj.description} onChange={(e) => updateProjectDesc(i, e.target.value)} style={{ fontSize: styles.smallSize }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TEMPLATE 4: MINIMALIST ATS (HIGH CONTRAST MONOCHROME)
                 ───────────────────────────────────────────────────────────── */}
              {template === 'minimal' && (
                <div style={{ fontFamily: `'Courier New', monospace, sans-serif`, color: '#000000' }}>
                  <div style={{ borderBottom: '1px solid #000000', paddingBottom: '4px', marginBottom: styles.sectionMargin }}>
                    <input type="text" className="inline-resume-input" value={name} onChange={(e) => setName(e.target.value)} style={{ fontSize: styles.titleSize, fontWeight: 'bold' }} />
                    <div style={{ fontSize: styles.smallSize, marginTop: '2px' }}>
                      EMAIL: <input type="text" className="inline-resume-input" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: 'auto' }} /> | PHONE: <input type="text" className="inline-resume-input" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '130px' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: styles.sectionMargin }}>
                    <div style={{ fontWeight: 'bold', fontSize: styles.sectionTitleSize, textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '2px' }}>
                      [ SUMMARY ]
                    </div>
                    <textarea className="inline-resume-textarea" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} style={{ fontSize: styles.bodySize }} />
                  </div>

                  <div style={{ marginBottom: styles.sectionMargin }}>
                    <div style={{ fontWeight: 'bold', fontSize: styles.sectionTitleSize, textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '2px' }}>
                      [ EDUCATION ]
                    </div>
                    <div style={{ fontSize: styles.bodySize }}>
                      INSTITUTION: Degree College of Physical Education (HVPM Autonomous), Amravati<br />
                      PROGRAM: {currentUser.course} ({currentUser.departmentName})<br />
                      GRADE: CGPA {currentUser.cgpa || '8.5'} / 10.0 | ATTENDANCE: {currentUser.attendance || '90%'}
                    </div>
                  </div>

                  <div style={{ marginBottom: styles.sectionMargin }}>
                    <div style={{ fontWeight: 'bold', fontSize: styles.sectionTitleSize, textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '2px' }}>
                      [ TECHNICAL SKILLS ]
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {skills.map((s, i) => (
                        <input key={i} type="text" className="inline-resume-input" value={s} onChange={(e) => updateSkill(i, e.target.value)} style={{ width: `${Math.max(50, s.length * 9)}px` }} />
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: styles.sectionMargin }}>
                    <div style={{ fontWeight: 'bold', fontSize: styles.sectionTitleSize, textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '2px' }}>
                      [ PROJECTS ]
                    </div>
                    {projects.map((proj, i) => (
                      <div key={i} style={{ marginBottom: '4px' }}>
                        <input type="text" className="inline-resume-input" value={proj.title} onChange={(e) => updateProjectTitle(i, e.target.value)} style={{ fontWeight: 'bold' }} />
                        <textarea className="inline-resume-textarea" rows={2} value={proj.description} onChange={(e) => updateProjectDesc(i, e.target.value)} style={{ fontSize: styles.bodySize }} />
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: styles.sectionTitleSize, textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '2px' }}>
                      [ CERTIFICATIONS ]
                    </div>
                    {certifications.map((c, i) => (
                      <input key={i} type="text" className="inline-resume-input" value={c} onChange={(e) => updateCert(i, e.target.value)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Page Boundary Line (Hidden during print) */}
              <div
                className="a4-page-end-line"
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '15mm',
                  right: '15mm',
                  borderTop: '1px dashed #cbd5e1',
                  textAlign: 'center',
                  fontSize: '9px',
                  color: '#94a3b8',
                  fontWeight: 700,
                  paddingTop: '2px',
                  pointerEvents: 'none',
                }}
              >
                📄 EXACT A4 PAGE 1 BOUNDARY (PRINT CUT-OFF)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
