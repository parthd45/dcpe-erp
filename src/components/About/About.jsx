import { Shield, Globe, Cpu, Award } from 'lucide-react';
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
            <div className="about-card-stack">
              {/* Card 1: Student Profile Preview */}
              <div className="about-card about-card-1">
                <div className="about-card-header">
                  <div className="about-card-avatar indigo">SP</div>
                  <div className="about-card-info">
                    <h3>Student Profile</h3>
                    <span>BCA — 3rd Year • Roll: 2024031</span>
                  </div>
                </div>
                <div className="about-card-body">
                  <div className="about-card-row">
                    <span className="about-card-row-label">Attendance</span>
                    <span className="about-card-row-value success">87.5%</span>
                  </div>
                  <div className="about-card-row">
                    <span className="about-card-row-label">Current CGPA</span>
                    <span className="about-card-row-value primary">8.42</span>
                  </div>
                  <div className="about-card-row">
                    <span className="about-card-row-label">Fees Status</span>
                    <span className="about-card-row-value success">✓ Paid</span>
                  </div>
                  <div className="about-card-row">
                    <span className="about-card-row-label">Library Books</span>
                    <span className="about-card-row-value warning">2 Issued</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Faculty Profile */}
              <div className="about-card about-card-2">
                <div className="about-card-header">
                  <div className="about-card-avatar amber">FK</div>
                  <div className="about-card-info">
                    <h3>Faculty Dashboard</h3>
                    <span>Dept. of Computer Science</span>
                  </div>
                </div>
                <div className="about-card-body">
                  <div className="about-card-row">
                    <span className="about-card-row-label">Today's Classes</span>
                    <span className="about-card-row-value primary">4 Lectures</span>
                  </div>
                  <div className="about-card-row">
                    <span className="about-card-row-label">Pending Reviews</span>
                    <span className="about-card-row-value warning">12</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Admin */}
              <div className="about-card about-card-3">
                <div className="about-card-header">
                  <div className="about-card-avatar emerald">AD</div>
                  <div className="about-card-info">
                    <h3>Admin Overview</h3>
                    <span>College Administration</span>
                  </div>
                </div>
                <div className="about-card-body">
                  <div className="about-card-row">
                    <span className="about-card-row-label">Total Students</span>
                    <span className="about-card-row-value primary">1,248</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
