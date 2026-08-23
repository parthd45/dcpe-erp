import React from 'react';
import { Shield, Globe, Cpu, Award, CheckCircle2, Server, FileCheck, QrCode, Lock } from 'lucide-react';
import './About.css';

const highlights = [
  { icon: Shield, color: 'purple', title: 'Autonomous Status', desc: 'UGC & Govt. of Maharashtra recognized' },
  { icon: Award, color: 'amber', title: 'NAAC \'A\' Grade', desc: 'Re-accredited by NAAC Bangalore' },
  { icon: Globe, color: 'blue', title: 'NIRF Ranked', desc: '36th rank at All India level' },
  { icon: Cpu, color: 'green', title: 'In-House Tech', desc: 'Software Development Wing' },
];

export default function About() {
  return (
    <section className="about section" id="about">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">
            <Award size={14} />
            About the Institution
          </span>
          <h2 className="section-title">A Legacy of 50+ Years in Education</h2>
          <p className="section-subtitle">
            Shaping the future through multidisciplinary education, sports excellence, and technology
          </p>
        </div>

        <div className="about-grid">
          <div className="about-content">
            <p className="about-text">
              <strong>Degree College of Physical Education</strong> is operated by the world-renowned 
              <strong> Shree Hanuman Vyayam Prasarak Mandal</strong>, established in <strong>1914</strong>. 
              The college was founded in <strong>1967</strong> as the only institution in Maharashtra 
              to offer a three-year degree course in Physical Education on a government grant basis.
            </p>
            <p className="about-text">
              Now a <strong>multidisciplinary autonomous college</strong> affiliated to 
              Sant Gadge Baba Amravati University, DCPE offers programs across 
              <strong> Computer Science, Commerce, Yoga, Physical Education, and Vocational Education</strong>. 
              The college pioneered the MCA program in the Vidarbha region in 1995, and its 
              graduates hold prestigious positions in renowned IT companies.
            </p>
            <p className="about-text">
              This <strong>ERP system</strong> unifies all academic, administrative, and financial 
              operations — from admissions to examinations, attendance to fee management — 
              into a single, modern digital platform.
            </p>

            <div className="about-highlights">
              {highlights.map((h, i) => (
                <div className="about-highlight" key={i}>
                  <div className={`about-highlight-icon ${h.color}`}>
                    <h.icon size={20} />
                  </div>
                  <div className="about-highlight-text">
                    <h4>{h.title}</h4>
                    <p>{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="about-visual">
            <div className="about-showcase-card">
              <div className="showcase-card-header">
                <div className="showcase-badge">
                  <Server size={18} color="var(--primary)" />
                  <span>DCPE ERP Cloud System</span>
                </div>
                <span className="showcase-status-live">
                  <span className="live-dot"></span> Live
                </span>
              </div>

              <div className="showcase-features-list">
                <div className="showcase-feature-item">
                  <div className="feature-icon-wrap green">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4>3-Tier Leave & Grievance Approval</h4>
                    <p>Teacher Verification ➔ HOD Endorsement ➔ Principal Sanction (10+ Days)</p>
                  </div>
                </div>

                <div className="showcase-feature-item">
                  <div className="feature-icon-wrap blue">
                    <QrCode size={18} />
                  </div>
                  <div>
                    <h4>Digital Gate Pass & QR Security</h4>
                    <p>Instant QR tokens generated upon official executive approval</p>
                  </div>
                </div>

                <div className="showcase-feature-item">
                  <div className="feature-icon-wrap purple">
                    <FileCheck size={18} />
                  </div>
                  <div>
                    <h4>Autonomous SGBAU Grading Engine</h4>
                    <p>Automated SGPA/CGPA calculation and internal marks verification</p>
                  </div>
                </div>

                <div className="showcase-feature-item">
                  <div className="feature-icon-wrap amber">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h4>Role-Based Access & Security</h4>
                    <p>Isolated student credentials & staff authentication</p>
                  </div>
                </div>
              </div>

              <div className="showcase-card-footer">
                <span>Sant Gadge Baba Amravati University Affiliated</span>
                <span className="footer-tag">Official ERP Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
