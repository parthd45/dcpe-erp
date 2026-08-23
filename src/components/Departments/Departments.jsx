import React, { useState, useEffect } from 'react';
import { Monitor, FlaskConical, Dumbbell, Briefcase, Heart, Wrench, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Departments.css';

const DEPT_DEFINITIONS = [
  {
    id: 'cs',
    icon: Monitor,
    name: 'Computer Science & Technology',
    fullName: 'P.G. Department of Computer Science & Technology',
    courses: ['MCA'],
  },
  {
    id: 'science',
    icon: FlaskConical,
    name: 'Department of Science',
    fullName: 'UG & PG Programs in Computer Science',
    courses: ['BCA', 'B.Sc. (CS)', 'M.Sc. (CS)'],
  },
  {
    id: 'phy-ed',
    icon: Dumbbell,
    name: 'Physical Education & Sports',
    fullName: 'Department of Physical Education & Sports',
    courses: ['B.P.Ed', 'M.P.Ed'],
  },
  {
    id: 'commerce',
    icon: Briefcase,
    name: 'Commerce & Administration',
    fullName: 'Department of Commerce & Administration',
    courses: ['BBA', 'M.Com'],
  },
  {
    id: 'yoga',
    icon: Heart,
    name: 'Department of Yoga',
    fullName: 'Studies in Yoga & Naturopathy',
    courses: ['B.A. Yoga', 'M.A. Yoga', 'PGDYT', 'DYNS'],
  },
  {
    id: 'vocational',
    icon: Wrench,
    name: 'Vocational & Skill Education',
    fullName: 'Department of Vocational & Skill Education',
    courses: ['B.Voc'],
  },
];

export default function Departments() {
  const [deptCounts, setDeptCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRealCounts() {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('department_id, status');

        if (!error && data) {
          const counts = {};
          data.forEach((s) => {
            // Count all registered students in each department
            if (s.department_id) {
              counts[s.department_id] = (counts[s.department_id] || 0) + 1;
            }
          });
          setDeptCounts(counts);
        }
      } catch (err) {
        console.error('Error fetching department student counts:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRealCounts();
  }, []);

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
          {DEPT_DEFINITIONS.map((dept) => {
            const count = deptCounts[dept.id] || 0;
            return (
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
                  <span className="dept-students-count">{isLoading ? '...' : count}</span>
                  {count === 1 ? 'registered student' : 'registered students'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
