import React, { useState, useEffect } from 'react';
import {
  Briefcase, Building2, MapPin, Calendar, Clock, Award,
  CheckCircle2, AlertCircle, X, ChevronRight, Send, User,
  FileText, ExternalLink, Filter, Sparkles, ShieldCheck, Check,
  Mic, MicOff, Volume2, Sparkle, RefreshCw, BarChart2, Star, Target, Zap
} from 'lucide-react';
import { fetchPlacementDrives, applyForPlacementDrive, fetchStudentApplications } from '../../lib/placementService';
import './Dashboard.css';

// Mock Interview Question Bank per Recruiter Track
const INTERVIEW_TRACKS = {
  tcs: {
    company: 'TCS Digital / Ninja',
    title: 'Fullstack & Cloud Developer Track',
    badge: 'Tech & Systems',
    color: '#3b82f6',
    icon: '💻',
    questions: [
      {
        q: 'How would you optimize a slow database SQL query joining three large tables with 1M+ rows?',
        keywords: ['index', 'explain plan', 'b-tree', 'inner join', 'normalization', 'partition'],
        tip: 'Mention B-Tree indexing on join keys, avoiding SELECT *, and analyzing EXPLAIN plans.',
      },
      {
        q: 'Explain the difference between Monolithic and Microservices architecture in cloud applications.',
        keywords: ['decoupled', 'scalability', 'api gateway', 'containers', 'docker', 'independent deployment'],
        tip: 'Focus on independent scalability, API gateways, fault isolation, and containerized deployment.',
      },
      {
        q: 'What is the Virtual DOM in React, and how does reconciliation work?',
        keywords: ['in-memory', 'diffing', 'reconciliation', 'batching', 'reflow', 'fiber'],
        tip: 'Explain tree diffing algorithm, batching state updates, and minimizing direct DOM mutations.',
      },
    ],
  },
  sai: {
    company: 'Sports Authority of India (SAI)',
    title: 'Athletic Performance & Coaching Lead',
    badge: 'Sports Science',
    color: '#059669',
    icon: '🏅',
    questions: [
      {
        q: 'How do you design a periodization training program for a sprinter preparing for national selection?',
        keywords: ['macrocycle', 'microcycle', 'atp', 'plyometrics', 'tapering', 'recovery'],
        tip: 'Structure response around Preparatory, Competition, and Transition phases with ATP-CP energy focus.',
      },
      {
        q: 'What biomechanical corrections would you prescribe for a long jumper experiencing knee pain upon takeoff?',
        keywords: ['ground reaction force', 'kinetic chain', 'flexion', 'quadriceps', 'landing angle', 'eccentric'],
        tip: 'Address takeoff angle, ground reaction force distribution, quadriceps strengthening, and landing biomechanics.',
      },
      {
        q: 'What are the official bylaws regarding sports duty leave attendance condonation for university athletes?',
        keywords: ['15%', 'condonation', 'sgbau', 'tournament certificate', 'duty leave', 'hod approval'],
        tip: 'Cite the 15% attendance condonation allowance under SGBAU bylaws for verified tournament duty.',
      },
    ],
  },
  decathlon: {
    company: 'Decathlon Sports India',
    title: 'Sports Operations & Community Lead',
    badge: 'Sports Retail & Operations',
    color: '#d97706',
    icon: '🏃',
    questions: [
      {
        q: 'How would you organize a weekend community marathon for 500+ local athletes while managing inventory and event logistics?',
        keywords: ['community', 'logistics', 'sponsorship', 'hydration', 'volunteers', 'omnichannel'],
        tip: 'Focus on route planning, volunteer delegation, brand visibility, hydration stations, and app integration.',
      },
      {
        q: 'How do you handle a customer returning a used sports equipment item requesting a full refund?',
        keywords: ['customer satisfaction', 'policy', 'empathy', 'warranty', 'exchange', 'brand trust'],
        tip: 'Demonstrate active listening, policy adherence, offering suitable exchange alternatives, and preserving brand loyalty.',
      },
    ],
  },
  infosys: {
    company: 'Infosys Limited',
    title: 'Specialist Programmer Track',
    badge: 'Algorithms & Architecture',
    color: '#6366f1',
    icon: '⚡',
    questions: [
      {
        q: 'Explain Dijkstra\'s algorithm and how a priority queue optimizes its time complexity.',
        keywords: ['min heap', 'greedy', 'shortest path', 'log v', 'graph', 'relaxation'],
        tip: 'Mention Min-Heap reducing search time from O(V²) to O((V+E) log V).',
      },
      {
        q: 'What are ACID properties in database transactions and how is Isolation enforced?',
        keywords: ['atomicity', 'consistency', 'isolation', 'durability', 'locking', 'mvcc'],
        tip: 'Define Atomicity, Consistency, Isolation, Durability, and mention MVCC (Multi-Version Concurrency Control).',
      },
    ],
  },
};

export function PlacementModal({ currentUser, onClose }) {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('drives'); // 'drives' | 'my_applications' | 'mock_interview'
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Apply Modal state
  const [applyingDrive, setApplyingDrive] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccessToast, setApplySuccessToast] = useState(null);

  // AI Mock Interviewer state
  const [selectedTrack, setSelectedTrack] = useState('tcs');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    const driveList = await fetchPlacementDrives();
    setDrives(driveList);

    if (currentUser?.id) {
      const myApps = await fetchStudentApplications(currentUser.id);
      setApplications(myApps);
    }
    setLoading(false);
  };

  const rawCgpa = String(currentUser?.cgpa || '').replace(/[^0-9.]/g, '');
  const studentCgpa = rawCgpa ? parseFloat(rawCgpa) : 8.50;

  const isEligible = (drive) => {
    const meetsCgpa = studentCgpa >= (parseFloat(drive.minCgpa) || 0);
    const studentCourse = (currentUser?.course || '').toUpperCase();
    const studentDeptId = (currentUser?.department || currentUser?.departmentName || '').toLowerCase();

    let meetsCourse = true;
    if (Array.isArray(drive.eligibleCourses) && drive.eligibleCourses.length > 0) {
      meetsCourse = drive.eligibleCourses.some((c) => {
        const cUpper = c.toUpperCase().trim();
        if (!cUpper) return false;
        if (cUpper.includes('MCA') && studentCourse.includes('MCA')) return true;
        if (cUpper.includes('BCA') && studentCourse.includes('BCA')) return true;
        if (cUpper.includes('B.P.ED') && (studentCourse.includes('B.P.ED') || studentCourse.includes('BPED'))) return true;
        if (cUpper.includes('M.P.ED') && (studentCourse.includes('M.P.ED') || studentCourse.includes('MPED'))) return true;
        if (cUpper.includes('B.TECH') && (studentCourse.includes('B.TECH') || studentCourse.includes('BTECH'))) return true;
        if (cUpper.includes('M.SC') && studentCourse.includes('M.SC')) return true;
        if (cUpper.includes('B.SC') && (studentCourse.includes('B.SC') || studentCourse.includes('BSC')) && !cUpper.includes('B.P.ED')) return true;
        return false;
      });
    }

    let meetsDept = true;
    if (Array.isArray(drive.eligibleDepartments) && drive.eligibleDepartments.length > 0) {
      meetsDept = drive.eligibleDepartments.some((d) => {
        const dUpper = d.toUpperCase().trim();
        if (studentDeptId.includes('cs') || studentDeptId.includes('science')) {
          return dUpper.includes('COMPUTER') || dUpper.includes('SCIENCE & IT') || dUpper.includes('INFORMATION');
        }
        if (studentDeptId.includes('phy') || studentDeptId.includes('ed') || studentDeptId.includes('sports')) {
          return dUpper.includes('PHYSICAL') || (dUpper.includes('SPORTS') && !dUpper.includes('SCIENCE & IT'));
        }
        return true;
      });
    }

    const eligible = meetsCgpa && meetsCourse && meetsDept;
    return { eligible, meetsCgpa, meetsCourse, meetsDept };
  };

  const hasApplied = (driveId) => {
    return applications.some((a) => a.driveId === driveId);
  };

  const handleConfirmApply = async () => {
    if (!applyingDrive || !currentUser) return;
    setIsApplying(true);
    const res = await applyForPlacementDrive(applyingDrive, currentUser);
    setIsApplying(false);

    if (res.success) {
      setApplySuccessToast(`🎉 Application submitted to ${applyingDrive.companyName}!`);
      setApplyingDrive(null);
      await loadData();
      setTimeout(() => setApplySuccessToast(null), 4000);
    } else {
      alert(res.message || 'Failed to apply.');
    }
  };

  // AI Interview Handlers
  const currentTrackObj = INTERVIEW_TRACKS[selectedTrack];
  const currentQuestionObj = currentTrackObj.questions[currentQIndex % currentTrackObj.questions.length];

  const handleSpeakQuestion = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestionObj.q);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleEvaluateAnswer = () => {
    if (!candidateAnswer.trim()) return;
    setIsEvaluating(true);

    setTimeout(() => {
      const lower = candidateAnswer.toLowerCase();
      const matched = currentQuestionObj.keywords.filter((kw) => lower.includes(kw));
      const matchPct = Math.round((matched.length / currentQuestionObj.keywords.length) * 100);
      const baseScore = Math.min(100, Math.max(50, matchPct + (candidateAnswer.length > 80 ? 25 : 10)));
      
      const result = {
        score: baseScore,
        matchedKeywords: matched,
        totalKeywords: currentQuestionObj.keywords,
        feedback: baseScore >= 80
          ? '🌟 Outstanding Answer! Excellent technical articulation and keyword coverage.'
          : baseScore >= 65
          ? '👍 Solid Response! Good conceptual understanding. Consider adding deeper architecture details.'
          : '💡 Needs Improvement. Include specific industry terms like ' + currentQuestionObj.keywords.slice(0, 3).join(', '),
        recommendation: currentQuestionObj.tip,
      };

      setEvalResult(result);
      setInterviewHistory((prev) => [...prev, { q: currentQuestionObj.q, a: candidateAnswer, result }]);
      setIsEvaluating(false);
    }, 800);
  };

  const handleNextQuestion = () => {
    setCandidateAnswer('');
    setEvalResult(null);
    setCurrentQIndex((prev) => prev + 1);
  };

  const filteredDrives = drives.filter((drive) => {
    const { eligible } = isEligible(drive);
    if (selectedCategory === 'eligible') return eligible;
    if (selectedCategory === 'internship') return drive.jobType?.toLowerCase().includes('intern');
    if (selectedCategory === 'fulltime') return !drive.jobType?.toLowerCase().includes('intern');
    return true;
  });

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
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '960px',
          width: '100%',
          boxShadow: 'var(--shadow-2xl)',
          padding: '28px',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
                Training &amp; Placement (T&amp;P) Cell Hub
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Degree College of Physical Education (DCPE HVPM) • Campus Recruitment 2026
              </span>
            </div>
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Placement Metrics Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white', padding: '16px', borderRadius: '16px' }}>
            <div style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Highest Package</div>
            <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>₹9.50 LPA</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Infosys Power Prog.</div>
          </div>
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: '16px' }}>
            <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>Average CTC</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#065f46', marginTop: '4px' }}>₹7.20 LPA</div>
            <div style={{ fontSize: '11px', color: '#047857' }}>Across All Branches</div>
          </div>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '16px' }}>
            <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 600, textTransform: 'uppercase' }}>Active Drives</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e40af', marginTop: '4px' }}>{drives.length} Companies</div>
            <div style={{ fontSize: '11px', color: '#1d4ed8' }}>Open for Applications</div>
          </div>
          <div style={{ background: '#fdf4ff', border: '1px solid #f0abfc', padding: '16px', borderRadius: '16px' }}>
            <div style={{ fontSize: '11px', color: '#a21caf', fontWeight: 600, textTransform: 'uppercase' }}>My Applications</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#86198f', marginTop: '4px' }}>{applications.length} Drives</div>
            <div style={{ fontSize: '11px', color: '#a21caf' }}>Applied &amp; Tracking</div>
          </div>
        </div>

        {applySuccessToast && (
          <div className="alert-message success" style={{ marginBottom: '18px' }}>
            <CheckCircle2 size={18} />
            <div>{applySuccessToast}</div>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn btn-sm ${activeTab === 'drives' ? 'btn-primary' : 'btn-white'}`}
              onClick={() => setActiveTab('drives')}
              style={{ fontWeight: 700 }}
            >
              <Building2 size={14} /> Campus Drives ({filteredDrives.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'my_applications' ? 'btn-primary' : 'btn-white'}`}
              onClick={() => setActiveTab('my_applications')}
              style={{ fontWeight: 700 }}
            >
              <Send size={14} /> My Applications ({applications.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'mock_interview' ? 'btn-primary' : 'btn-white'}`}
              onClick={() => setActiveTab('mock_interview')}
              style={{ fontWeight: 700, background: activeTab === 'mock_interview' ? 'linear-gradient(135deg, #4f46e5, #9333ea)' : undefined }}
            >
              <Sparkles size={14} /> 🎙️ AI Mock Interviewer
            </button>
          </div>

          {activeTab === 'drives' && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-outline-primary' : 'btn-white'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              <button
                className={`btn btn-sm ${selectedCategory === 'eligible' ? 'btn-outline-primary' : 'btn-white'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setSelectedCategory('eligible')}
              >
                ✨ Eligible for Me
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: DRIVES */}
        {activeTab === 'drives' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredDrives.map((drive) => {
              const { eligible, meetsCgpa, meetsCourse, meetsDept } = isEligible(drive);
              const applied = hasApplied(drive.id);

              return (
                <div
                  key={drive.id}
                  style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    padding: '20px',
                    background: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <img
                        src={drive.companyLogo}
                        alt={drive.companyName}
                        style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border-light)' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--text-heading)', fontWeight: 700 }}>
                            {drive.companyName}
                          </h4>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: 99, background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                            {drive.jobType}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', marginTop: '2px' }}>
                          {drive.jobTitle}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                        {drive.packageCtc}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <MapPin size={12} /> {drive.location}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-body)', margin: 0, lineHeight: 1.5 }}>
                    {drive.jobDescription}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '10px', borderTop: '1px dashed var(--border-light)', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span><Calendar size={13} inline /> Drive: <strong>{drive.driveDate}</strong></span>
                      <span><Clock size={13} inline /> Deadline: <strong>{drive.deadline}</strong></span>
                      <span><Award size={13} inline /> Min CGPA: <strong>{drive.minCgpa}</strong></span>
                    </div>

                    <div>
                      {applied ? (
                        <span style={{ padding: '6px 14px', borderRadius: '8px', background: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={15} /> Application Submitted
                        </span>
                      ) : eligible ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setApplyingDrive(drive)}
                          style={{ background: '#059669' }}
                        >
                          <Send size={14} /> Apply Now 🚀
                        </button>
                      ) : (
                        <button className="btn btn-white btn-sm" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                          <AlertCircle size={14} /> Not Eligible
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: MY APPLICATIONS */}
        {activeTab === 'my_applications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Briefcase size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <h4 style={{ margin: 0, fontSize: '16px' }}>No Active Placement Applications</h4>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>Browse open campus drives and submit your application!</p>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} style={{ border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px', background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{app.companyName}</h4>
                      <span style={{ fontSize: '13px', color: 'var(--primary)' }}>{app.jobTitle}</span>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 99, background: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '12px' }}>
                      {app.status || 'Application Submitted ✓'}
                    </span>
                  </div>

                  {/* Visual Status Pipeline */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', margin: '16px 0', position: 'relative' }}>
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '8px', borderRadius: '8px', textAlign: 'center', fontSize: '11px', color: '#047857', fontWeight: 700 }}>
                      1. Applied ✓
                    </div>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '8px', borderRadius: '8px', textAlign: 'center', fontSize: '11px', color: '#1d4ed8', fontWeight: 700 }}>
                      2. CGPA Clearance ✓
                    </div>
                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '8px', borderRadius: '8px', textAlign: 'center', fontSize: '11px', color: '#b45309', fontWeight: 700 }}>
                      3. NQT / Aptitude
                    </div>
                    <div style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                      4. Interview
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Applied On: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Active Term'} • PRN Verified
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: AI MOCK INTERVIEWER STUDIO */}
        {activeTab === 'mock_interview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Recruiter Track Selection */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Select Campus Recruiter Practice Track:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {Object.entries(INTERVIEW_TRACKS).map(([key, track]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedTrack(key);
                      setCurrentQIndex(0);
                      setCandidateAnswer('');
                      setEvalResult(null);
                    }}
                    style={{
                      border: selectedTrack === key ? `2px solid ${track.color}` : '1px solid var(--border-light)',
                      background: selectedTrack === key ? '#f8fafc' : 'white',
                      borderRadius: '14px',
                      padding: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{track.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-heading)' }}>{track.company}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{track.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Card */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: '18px', padding: '24px', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Question {currentQIndex + 1} of {currentTrackObj.questions.length} • {currentTrackObj.company}
                </span>
                <button
                  type="button"
                  onClick={handleSpeakQuestion}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Volume2 size={14} /> {isSpeaking ? 'Speaking...' : 'Listen Question 🔊'}
                </button>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', lineHeight: 1.5 }}>
                "{currentQuestionObj.q}"
              </h3>

              {/* Answer Input */}
              <div style={{ marginBottom: '16px' }}>
                <textarea
                  rows={4}
                  placeholder="Type your technical answer here in detail..."
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>
                  💡 Tip: Include relevant technical terms to increase ATS score.
                </span>
                <button
                  type="button"
                  onClick={handleEvaluateAnswer}
                  disabled={!candidateAnswer.trim() || isEvaluating}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={15} /> {isEvaluating ? 'Evaluating with AI...' : 'Submit Answer & Evaluate'}
                </button>
              </div>
            </div>

            {/* AI Feedback & Score Card */}
            {evalResult && (
              <div style={{ border: '1px solid var(--border-light)', borderRadius: '18px', padding: '20px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)' }}>
                    AI Evaluation &amp; Recruiter Scorecard
                  </h4>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: evalResult.score >= 75 ? '#059669' : '#d97706' }}>
                    {evalResult.score} / 100
                  </div>
                </div>

                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-body)', marginBottom: '12px' }}>
                  {evalResult.feedback}
                </p>

                <div style={{ background: 'white', padding: '12px', borderRadius: '10px', fontSize: '12px', border: '1px solid var(--border-light)', marginBottom: '14px' }}>
                  <strong>Matched ATS Keywords:</strong>{' '}
                  {evalResult.matchedKeywords.length > 0 ? (
                    evalResult.matchedKeywords.map((kw) => (
                      <span key={kw} style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', marginRight: '6px', fontWeight: 600 }}>
                        ✓ {kw}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#dc2626' }}>No key industry terms detected in answer.</span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
                  🎯 <strong>Recruiter Tip:</strong> {evalResult.recommendation}
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleNextQuestion}
                  style={{ width: '100%' }}
                >
                  Next Interview Question <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Apply Confirmation Modal */}
        {applyingDrive && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '24px',
                maxWidth: '540px',
                width: '100%',
                boxShadow: 'var(--shadow-2xl)',
                padding: '28px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '17px', color: 'var(--text-heading)' }}>Confirm Application</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{applyingDrive.companyName}</span>
                  </div>
                </div>
                <button className="btn btn-white btn-sm" onClick={() => setApplyingDrive(null)}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ background: 'var(--bg-body)', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Candidate:</span> <strong style={{ display: 'block' }}>{currentUser?.name}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>PRN:</span> <code style={{ display: 'block' }}>{currentUser?.prn}</code></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Course:</span> <strong style={{ display: 'block' }}>{currentUser?.course}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Current CGPA:</span> <strong style={{ display: 'block', color: '#059669' }}>{studentCgpa} CGPA</strong></div>
                </div>
              </div>

              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '10px', fontSize: '11px', color: '#1d4ed8', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
                ✓ Your official academic record, marksheet grades, and verified credentials will be transmitted to {applyingDrive.companyName} T&amp;P coordination team.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setApplyingDrive(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ background: '#059669' }}
                  onClick={handleConfirmApply}
                  disabled={isApplying}
                >
                  <Send size={14} />
                  {isApplying ? 'Submitting Application...' : 'Confirm & Apply 🚀'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
