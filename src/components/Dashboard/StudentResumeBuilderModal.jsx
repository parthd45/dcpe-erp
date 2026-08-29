import React, { useState } from 'react';
import {
  FileText, Printer, X, Sparkles, CheckCircle2, User,
  Mail, Phone, GraduationCap, Award, Briefcase, Code, Plus, Trash2, Globe, Palette, Layout
} from 'lucide-react';
import './Dashboard.css';

export function StudentResumeBuilderModal({ currentUser, onClose }) {
  if (!currentUser) return null;

  // Selected Resume Template & Styling
  const [template, setTemplate] = useState('modern'); // 'modern' | 'classic' | 'twocolumn' | 'minimal'
  const [accentColor, setAccentColor] = useState('#1e1b4b'); // '#1e1b4b' | '#0284c7' | '#059669' | '#9f1239' | '#0f172a'

  // Editable resume data
  const [skills, setSkills] = useState([
    'JavaScript (ES6+)', 'React.js', 'Python', 'SQL & Databases',
    'Sports Biomechanics', 'Event Management', 'Git & GitHub'
  ]);
  const [newSkill, setNewSkill] = useState('');

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
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  const [certifications, setCertifications] = useState([
    'National Sports & Fitness Training Certification (HVPM)',
    'Full Stack Web Development Professional — Udemy (2025)'
  ]);
  const [newCert, setNewCert] = useState('');

  const [summary, setSummary] = useState(
    `Dedicated ${currentUser.course || 'Student'} candidate at Degree College of Physical Education (HVPM Autonomous Institute). Strong academic background (CGPA: ${currentUser.cgpa || '8.5'}) with hands-on technical skills and proven leadership in campus sports & technology initiatives.`
  );

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddProject = () => {
    if (!newProjTitle.trim() || !newProjDesc.trim()) return;
    setProjects([...projects, { title: newProjTitle.trim(), duration: '2026', description: newProjDesc.trim() }]);
    setNewProjTitle('');
    setNewProjDesc('');
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleAddCert = () => {
    if (!newCert.trim()) return;
    setCertifications([...certifications, newCert.trim()]);
    setNewCert('');
  };

  const handleRemoveCert = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
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
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Dynamic Print CSS override specifically for the resume element */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
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
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="printable-document-container"
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '960px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Control Bar (Hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: '14px 24px',
            background: '#0f172a',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px' }}>
            <FileText size={18} color="#38bdf8" />
            Resume Designer & Multi-Format PDF Studio
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} /> Print / Save PDF Resume
            </button>
            <button className="btn btn-sm" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Template & Theme Selector Ribbon (Hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: '12px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Template Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layout size={14} color="var(--primary)" /> Select Layout:
            </span>
            {[
              { id: 'modern', label: '1. Modern Executive' },
              { id: 'classic', label: '2. Classic Academic' },
              { id: 'twocolumn', label: '3. Two-Column Compact' },
              { id: 'minimal', label: '4. Minimalist ATS' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`btn btn-sm ${template === t.id ? 'btn-primary' : 'btn-white'}`}
                style={{ borderRadius: '20px', fontSize: '11px', padding: '4px 12px' }}
                onClick={() => setTemplate(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Color Theme Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Palette size={14} color="var(--primary)" /> Theme Color:
            </span>
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
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: c.color,
                  cursor: 'pointer',
                  border: accentColor === c.color ? '2px solid white' : 'none',
                  boxShadow: accentColor === c.color ? '0 0 0 2px var(--primary)' : 'none',
                }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Scrollable Split Pane */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, overflow: 'hidden' }}>
          {/* Left Control Panel (Hidden during print) */}
          <div
            className="no-print"
            style={{
              padding: '20px',
              background: '#f8fafc',
              borderRight: '1px solid var(--border-light)',
              overflowY: 'auto',
              fontSize: '12px',
            }}
          >
            <h4 style={{ fontWeight: 800, color: 'var(--text-heading)', marginBottom: '12px' }}>
              ⚙️ Customize Details
            </h4>

            {/* Executive Summary */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Professional Summary:</label>
              <textarea
                className="form-control"
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                style={{ fontSize: '11px', width: '100%', resize: 'vertical' }}
              />
            </div>

            {/* Add Skill */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Add Technical Skill:</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Skill name..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  style={{ fontSize: '11px', flex: 1 }}
                />
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAddSkill}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add Project */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Add Key Project:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Project title..."
                value={newProjTitle}
                onChange={(e) => setNewProjTitle(e.target.value)}
                style={{ fontSize: '11px', marginBottom: '4px' }}
              />
              <textarea
                className="form-control"
                rows={2}
                placeholder="Brief project description..."
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                style={{ fontSize: '11px', marginBottom: '4px', resize: 'none' }}
              />
              <button type="button" className="btn btn-outline-dark btn-sm" style={{ width: '100%' }} onClick={handleAddProject}>
                + Add Project
              </button>
            </div>

            {/* Add Certification */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Add Certification:</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Certification title..."
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  style={{ fontSize: '11px', flex: 1 }}
                />
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAddCert}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right ATS Resume Live Preview (Printed Document) */}
          <div style={{ padding: '32px', overflowY: 'auto', background: 'white' }}>
            <div
              id="printable-ats-resume"
              style={{
                background: 'white',
                lineHeight: 1.5,
              }}
            >
              {/* ─────────────────────────────────────────────────────────────
                  TEMPLATE 1: MODERN EXECUTIVE
                 ───────────────────────────────────────────────────────────── */}
              {template === 'modern' && (
                <div style={{ fontFamily: `'Inter', system-ui, sans-serif`, color: '#1e293b' }}>
                  <div style={{ background: accentColor, color: 'white', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {currentUser.name}
                    </h1>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#e0e7ff', marginTop: '4px' }}>
                      {currentUser.course} — {currentUser.departmentName}
                    </div>
                    <div style={{ fontSize: '11.5px', marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '14px', color: '#f1f5f9' }}>
                      <span>📧 {currentUser.email}</span>
                      <span>📱 {currentUser.phone || '+91 9876543210'}</span>
                      <span>📍 DCPE Amravati</span>
                      <span>PRN: <code>{currentUser.prn}</code></span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px', marginBottom: '8px' }}>
                      Professional Summary
                    </h3>
                    <p style={{ fontSize: '12px', color: '#334155', margin: 0 }}>
                      {summary}
                    </p>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px', marginBottom: '8px' }}>
                      Education & Academic Record
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                      <span>Degree College of Physical Education (HVPM Autonomous), Amravati</span>
                      <span>2024 – 2026</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#475569', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                      <span>{currentUser.course} ({currentUser.departmentName})</span>
                      <span>Cumulative CGPA: <strong>{currentUser.cgpa || '8.5'} / 10.0</strong> • Attendance: <strong>{currentUser.attendance || '90%'}</strong></span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px', marginBottom: '8px' }}>
                      Technical & Core Competencies
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {skills.map((skill, index) => (
                        <span
                          key={index}
                          style={{
                            background: '#f1f5f9',
                            color: accentColor,
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${accentColor}33`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {skill}
                          <X size={12} className="no-print" style={{ cursor: 'pointer' }} onClick={() => handleRemoveSkill(index)} />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px', marginBottom: '8px' }}>
                      Key Projects & Implementations
                    </h3>
                    {projects.map((proj, i) => (
                      <div key={i} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                          <span>{proj.title}</span>
                          <span style={{ color: '#64748b' }}>{proj.duration} <X size={12} className="no-print" style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => handleRemoveProject(i)} /></span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: '#334155', margin: '2px 0 0' }}>
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px', marginBottom: '8px' }}>
                      Certifications & Accreditations
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px', color: '#334155' }}>
                      {certifications.map((cert, i) => (
                        <li key={i} style={{ marginBottom: '4px' }}>
                          {cert} <X size={12} className="no-print" style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => handleRemoveCert(i)} />
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
                  <div style={{ textAlign: 'center', borderBottom: '2px double #111827', paddingBottom: '12px', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, textTransform: 'uppercase', color: accentColor }}>
                      {currentUser.name}
                    </h1>
                    <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}>
                      {currentUser.course} • {currentUser.departmentName}
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '6px' }}>
                      Email: {currentUser.email} | Phone: {currentUser.phone || '+91 9876543210'} | PRN: {currentUser.prn}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', color: accentColor }}>
                      Academic Summary
                    </h3>
                    <p style={{ fontSize: '12px', margin: 0, textAlign: 'justify' }}>
                      {summary}
                    </p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', color: accentColor }}>
                      Education & Autonomy Qualifications
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                      <span>Shree HVPM Degree College of Physical Education, Amravati</span>
                      <span>2024 – 2026</span>
                    </div>
                    <div style={{ fontSize: '11.5px', fontStyle: 'italic' }}>
                      {currentUser.course} — CGPA: {currentUser.cgpa || '8.5'} (Attendance: {currentUser.attendance || '90%'})
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', color: accentColor }}>
                      Technical & Subject Skills
                    </h3>
                    <div style={{ fontSize: '11.5px' }}>
                      <strong>Areas of Expertise:</strong> {skills.join(' • ')}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', color: accentColor }}>
                      Project Work & Research
                    </h3>
                    {projects.map((proj, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, fontSize: '12px' }}>{proj.title} ({proj.duration})</div>
                        <div style={{ fontSize: '11.5px' }}>{proj.description}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', color: accentColor }}>
                      Honors & Certifications
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px' }}>
                      {certifications.map((cert, i) => (
                        <li key={i}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TEMPLATE 3: TWO-COLUMN COMPACT
                 ───────────────────────────────────────────────────────────── */}
              {template === 'twocolumn' && (
                <div style={{ fontFamily: `'Inter', sans-serif`, display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }}>
                  {/* Left Sidebar Column */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: accentColor, textTransform: 'uppercase', marginBottom: '8px', borderBottom: `2px solid ${accentColor}`, paddingBottom: '2px' }}>
                      Contact
                    </div>
                    <div style={{ fontSize: '11px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                      <span>📧 {currentUser.email}</span>
                      <span>📱 {currentUser.phone || '+91 9876543210'}</span>
                      <span>📍 DCPE Amravati</span>
                      <span>PRN: {currentUser.prn}</span>
                    </div>

                    <div style={{ fontSize: '12px', fontWeight: 800, color: accentColor, textTransform: 'uppercase', marginBottom: '8px', borderBottom: `2px solid ${accentColor}`, paddingBottom: '2px' }}>
                      Skills
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                      {skills.map((skill, index) => (
                        <span key={index} style={{ fontSize: '11px', fontWeight: 600, background: 'white', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px' }}>
                          • {skill}
                        </span>
                      ))}
                    </div>

                    <div style={{ fontSize: '12px', fontWeight: 800, color: accentColor, textTransform: 'uppercase', marginBottom: '8px', borderBottom: `2px solid ${accentColor}`, paddingBottom: '2px' }}>
                      Certifications
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {certifications.map((cert, i) => (
                        <span key={i}>✓ {cert}</span>
                      ))}
                    </div>
                  </div>

                  {/* Right Main Column */}
                  <div>
                    <div style={{ borderBottom: `2px solid ${accentColor}`, paddingBottom: '8px', marginBottom: '14px' }}>
                      <h1 style={{ fontSize: '22px', fontWeight: 900, color: accentColor, margin: 0 }}>
                        {currentUser.name}
                      </h1>
                      <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>
                        {currentUser.course} — {currentUser.departmentName}
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: accentColor, margin: '0 0 4px' }}>
                        Executive Summary
                      </h3>
                      <p style={{ fontSize: '11.5px', color: '#334155', margin: 0 }}>
                        {summary}
                      </p>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: accentColor, margin: '0 0 4px' }}>
                        Education
                      </h3>
                      <div style={{ fontSize: '11.5px', fontWeight: 700 }}>
                        Degree College of Physical Education (HVPM), Amravati
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>
                        {currentUser.course} | CGPA: {currentUser.cgpa || '8.5'} | Attendance: {currentUser.attendance || '90%'}
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: accentColor, margin: '0 0 4px' }}>
                        Projects
                      </h3>
                      {projects.map((proj, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>
                          <div style={{ fontSize: '11.5px', fontWeight: 700 }}>{proj.title}</div>
                          <div style={{ fontSize: '11px', color: '#334155' }}>{proj.description}</div>
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
                  <div style={{ borderBottom: '1px solid #000000', paddingBottom: '8px', marginBottom: '14px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>
                      {currentUser.name}
                    </h1>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>
                      EMAIL: {currentUser.email} | PHONE: {currentUser.phone || '+91 9876543210'} | PRN: {currentUser.prn}
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '4px' }}>
                      [ SUMMARY ]
                    </div>
                    <div style={{ fontSize: '11px' }}>{summary}</div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '4px' }}>
                      [ EDUCATION ]
                    </div>
                    <div style={{ fontSize: '11px' }}>
                      INSTITUTION: Degree College of Physical Education (HVPM Autonomous), Amravati<br />
                      PROGRAM: {currentUser.course} ({currentUser.departmentName})<br />
                      GRADE: CGPA {currentUser.cgpa || '8.5'} / 10.0 | ATTENDANCE: {currentUser.attendance || '90%'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '4px' }}>
                      [ TECHNICAL SKILLS ]
                    </div>
                    <div style={{ fontSize: '11px' }}>
                      {skills.join(', ')}
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '4px' }}>
                      [ PROJECTS ]
                    </div>
                    {projects.map((proj, i) => (
                      <div key={i} style={{ fontSize: '11px', marginBottom: '6px' }}>
                        * {proj.title} ({proj.duration}): {proj.description}
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #000', marginBottom: '4px' }}>
                      [ CERTIFICATIONS ]
                    </div>
                    <div style={{ fontSize: '11px' }}>
                      {certifications.map((c, i) => (
                        <div key={i}>* {c}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
