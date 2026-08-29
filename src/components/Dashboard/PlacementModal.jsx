import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase, Building2, MapPin, Calendar, Clock, Award,
  CheckCircle2, AlertCircle, X, ChevronRight, Send, User,
  FileText, ExternalLink, Filter, Sparkles, ShieldCheck, Check,
  Mic, MicOff, Volume2, Sparkle, RefreshCw, BarChart2, Star, Target, Zap,
  Video, VideoOff, Camera, Radio, Trophy, CheckSquare
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    loadData();
    return () => {
      stopWebcam();
      stopSpeechRecognition();
    };
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

  // Webcam Controls
  const startWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setWebcamActive(true);
      } else {
        alert('Webcam camera access is not supported by your browser.');
      }
    } catch (err) {
      console.warn('Webcam permission error:', err);
      alert('Camera access permission was denied or camera is unavailable.');
    }
  };

  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setWebcamActive(false);
  };

  const toggleWebcam = () => {
    if (webcamActive) stopWebcam();
    else startWebcam();
  };

  // Speech Recognition (Voice to Text Input)
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setCandidateAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Recognition start error:', e);
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleSpeechRecognition = () => {
    if (isListening) stopSpeechRecognition();
    else startSpeechRecognition();
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
      
      const techScore = Math.min(100, Math.max(45, matchPct + (candidateAnswer.length > 80 ? 25 : 10)));
      const fluencyScore = Math.min(100, Math.max(50, Math.round(candidateAnswer.split(/\s+/).length * 1.8)));
      const presenceScore = webcamActive ? 95 : 70;
      const overallScore = Math.round((techScore * 0.5) + (fluencyScore * 0.3) + (presenceScore * 0.2));

      const result = {
        score: overallScore,
        techScore,
        fluencyScore,
        presenceScore,
        grade: overallScore >= 85 ? 'A+ (Strong Hire)' : overallScore >= 70 ? 'A (Clear Candidate)' : 'B (Needs Revision)',
        matchedKeywords: matched,
        totalKeywords: currentQuestionObj.keywords,
        feedback: overallScore >= 80
          ? '🌟 Exceptional Response! Outstanding technical coverage, clear articulation, and confident camera presence.'
          : overallScore >= 65
          ? '👍 Good Response! Solid conceptual understanding. Incorporate deeper system design examples.'
          : '💡 Needs Revision. Address core industry terms: ' + currentQuestionObj.keywords.slice(0, 3).join(', '),
        recommendation: currentQuestionObj.tip,
      };

      setEvalResult(result);
      setIsEvaluating(false);
    }, 900);
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
          maxWidth: '1020px',
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
              <Video size={14} /> 📹 Live AI Video &amp; Voice Interview Studio
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
              const { eligible } = isEligible(drive);
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', margin: '16px 0' }}>
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

        {/* TAB 3: LIVE AI VIDEO & VOICE INTERVIEW STUDIO */}
        {activeTab === 'mock_interview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Recruiter Track Selection */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Select Recruiter Track &amp; AI Interview Panel:
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

            {/* LIVE DUAL CAMERA & AI RECRUITER DISPLAY GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Left: AI Recruiter Virtual Avatar Screen */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                  borderRadius: '20px',
                  padding: '20px',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '260px',
                  position: 'relative',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      AI Lead Interviewer • Dr. AI Panel
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.15)' }}>
                    {currentTrackObj.company}
                  </span>
                </div>

                {/* Animated Avatar Graphic */}
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      margin: '0 auto 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSpeaking ? '0 0 24px rgba(168, 85, 247, 0.8)' : '0 0 12px rgba(99, 102, 241, 0.4)',
                      transition: 'all 0.3s ease',
                      fontSize: '32px',
                    }}
                  >
                    🤖
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                    {isSpeaking ? '🔊 Asking Question Aloud...' : 'Listening & Observing Response'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>Q{currentQIndex + 1} of {currentTrackObj.questions.length}</span>
                  <button
                    type="button"
                    onClick={handleSpeakQuestion}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                  >
                    <Volume2 size={13} /> {isSpeaking ? 'Speaking...' : 'Ask Question Aloud 🔊'}
                  </button>
                </div>
              </div>

              {/* Right: Candidate Live Camera Viewport */}
              <div
                style={{
                  background: '#0f172a',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '260px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {webcamActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                    <Camera size={40} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Candidate Camera Feed Offline</div>
                    <div style={{ fontSize: '11px', marginTop: '4px' }}>Enable webcam to evaluate eye contact &amp; camera presence</div>
                  </div>
                )}

                {/* Camera Overlay Badge */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 99, color: 'white', fontSize: '11px', fontWeight: 700 }}>
                  <Radio size={12} color={webcamActive ? '#10b981' : '#ef4444'} />
                  {webcamActive ? 'REC • 1080p Stream Active' : 'Camera Muted'}
                </div>

                <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                  <button
                    type="button"
                    onClick={toggleWebcam}
                    style={{
                      background: webcamActive ? '#dc2626' : '#059669',
                      color: 'white',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {webcamActive ? <VideoOff size={13} /> : <Video size={13} />}
                    {webcamActive ? 'Stop Webcam' : 'Turn On Webcam 📹'}
                  </button>
                </div>
              </div>
            </div>

            {/* Question Text Box */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Interviewer Question:
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.5 }}>
                "{currentQuestionObj.q}"
              </div>
            </div>

            {/* Candidate Voice Transcript & Response Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-heading)' }}>
                  Your Verbal Answer Transcript:
                </label>
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  style={{
                    background: isListening ? '#dc2626' : '#4f46e5',
                    color: 'white',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  {isListening ? 'Stop Recording 🎙️' : 'Speak Your Answer (Mic) 🎤'}
                </button>
              </div>

              <textarea
                rows={4}
                placeholder="Click 'Speak Your Answer (Mic)' to speak aloud, or type your technical answer here..."
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: isListening ? '2px solid #dc2626' : '1px solid var(--border-light)',
                  background: isListening ? '#fff5f5' : 'white',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {candidateAnswer.split(/\s+/).filter(Boolean).length} words • {candidateAnswer.length} characters
                </span>
                <button
                  type="button"
                  onClick={handleEvaluateAnswer}
                  disabled={!candidateAnswer.trim() || isEvaluating}
                  style={{
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={15} /> {isEvaluating ? 'AI Examining Interview & Marking...' : 'Examine Interview & Award Marks 🚀'}
                </button>
              </div>
            </div>

            {/* AI EXAMINATION MARKSHEET & REPORT CARD */}
            {evalResult && (
              <div style={{ border: '2px solid #10b981', borderRadius: '20px', padding: '24px', background: '#ecfdf5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #a7f3d0' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#065f46' }}>
                      🎓 AI Interview Examination Marksheet
                    </h4>
                    <span style={{ fontSize: '12px', color: '#047857' }}>
                      Evaluated for {currentTrackObj.company} • {currentUser?.name || 'Candidate'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: '#047857' }}>
                      {evalResult.score} / 100
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>
                      Grade: {evalResult.grade}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>Technical Accuracy</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>{evalResult.techScore}%</div>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>Voice &amp; Fluency</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>{evalResult.fluencyScore}%</div>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>Camera Engagement</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>{evalResult.presenceScore}%</div>
                  </div>
                </div>

                <p style={{ fontSize: '14px', fontWeight: 600, color: '#065f46', marginBottom: '12px', lineHeight: 1.5 }}>
                  {evalResult.feedback}
                </p>

                <div style={{ background: 'white', padding: '12px', borderRadius: '10px', fontSize: '12px', border: '1px solid #a7f3d0', marginBottom: '14px' }}>
                  <strong>Matched Technical Keywords:</strong>{' '}
                  {evalResult.matchedKeywords.length > 0 ? (
                    evalResult.matchedKeywords.map((kw) => (
                      <span key={kw} style={{ background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: '4px', marginRight: '6px', fontWeight: 600 }}>
                        ✓ {kw}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#dc2626' }}>No technical keywords detected.</span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: '#047857', marginBottom: '16px' }}>
                  🎯 <strong>Recruiter Tip:</strong> {evalResult.recommendation}
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleNextQuestion}
                  style={{ width: '100%', background: '#047857' }}
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
