import { Monitor, FlaskConical, Dumbbell, Briefcase, Heart, Wrench, Users } from 'lucide-react';
import './Departments.css';

const departments = [
  {
    id: 'cs',
    icon: Monitor,
    name: 'Computer Science & Technology',
    fullName: 'P.G. Department of Computer Science & Technology',
    courses: ['MCA'],
    students: 180,
  },
  {
    id: 'science',
    icon: FlaskConical,
    name: 'Department of Science',
    fullName: 'UG & PG Programs in Computer Science',
    courses: ['BCA', 'B.Sc. (CS)', 'M.Sc. (CS)'],
    students: 320,
  },
  {
    id: 'phy-ed',
    icon: Dumbbell,
    name: 'Physical Education & Sports',
    fullName: 'Department of Physical Education & Sports',
    courses: ['B.P.Ed', 'M.P.Ed'],
    students: 240,
  },
  {
    id: 'commerce',
    icon: Briefcase,
    name: 'Commerce & Administration',
    fullName: 'Department of Commerce & Administration',
    courses: ['BBA', 'M.Com'],
    students: 200,
  },
  {
    id: 'yoga',
    icon: Heart,
    name: 'Department of Yoga',
    fullName: 'Studies in Yoga & Naturopathy',
    courses: ['B.A. Yoga', 'M.A. Yoga', 'PGDYT', 'DYNS'],
    students: 150,
  },
  {
    id: 'vocational',
    icon: Wrench,
    name: 'Vocational & Skill Education',
    fullName: 'Department of Vocational & Skill Education',
    courses: ['B.Voc'],
    students: 120,
  },
];

export default function Departments() {
  return (
    <section className="departments section" id="departments">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">
            <FlaskConical size={14} />
            Academic Wings
          </span>
          <h2 className="section-title">Our Departments</h2>
          <p className="section-subtitle">
            Six multidisciplinary departments offering undergraduate, postgraduate, and diploma programs
          </p>
        </div>

        <div className="dept-grid stagger-children">
          {departments.map((dept) => (
            <div className={`dept-card ${dept.id}`} key={dept.id}>
              <div className={`dept-icon ${dept.id}`}>
                <dept.icon size={28} />
              </div>
              <h3 className="dept-name">{dept.name}</h3>
              <p className="dept-full-name">{dept.fullName}</p>
              <div className="dept-courses">
                {dept.courses.map((c) => (
                  <span className="dept-course-tag" key={c}>{c}</span>
                ))}
              </div>
              <div className="dept-students">
                <Users size={14} />
                <span className="dept-students-count">{dept.students}</span>
                students enrolled
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
