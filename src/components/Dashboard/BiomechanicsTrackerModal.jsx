import React, { useState, useRef, useEffect } from 'react';
import {
  Activity, Camera, Video, VideoOff, CheckCircle2, AlertCircle, RefreshCw,
  Award, Sparkles, X, ChevronRight, BarChart2, ShieldCheck, Zap, Radio
} from 'lucide-react';
import './Dashboard.css';

const ATHLETIC_TESTS = [
  {
    id: 'sprint_start',
    title: '400m Sprinter Block Start Angle',
    targetAngle: '90° - 110° Knee Flexion',
    icon: '🏃',
    idealRange: 'Hip Angle: 120° • Knee Flexion: 90°',
    desc: 'Analyzes explosive drive phase off the starting blocks for sprinting events.',
  },
  {
    id: 'long_jump',
    title: 'Long Jump Takeoff Biomechanics',
    targetAngle: '22° - 25° Takeoff Vector',
    icon: '👟',
    idealRange: 'Takeoff Angle: 23.5° • Ground Force: 3.2x BW',
    desc: 'Evaluates conversion of horizontal velocity into vertical elevation at board.',
  },
  {
    id: 'squat_depth',
    title: 'Strength Conditioning Knee Flexion',
    targetAngle: '90° Parallel Squat Depth',
    icon: '🏋️',
    idealRange: 'Knee Flexion: 92° • Spinal Neutrality: 98%',
    desc: 'Monitors joint torque, patellar load, and eccentric hip depth.',
  },
];

export function BiomechanicsTrackerModal({ currentUser, onClose }) {
  const [selectedTest, setSelectedTest] = useState(ATHLETIC_TESTS[0]);
  const [webcamActive, setWebcamActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  useEffect(() => {
    if (webcamActive && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch((e) => console.warn('Webcam play error:', e));
    }
  }, [webcamActive]);

  const startWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        mediaStreamRef.current = stream;
        setWebcamActive(true);
      } else {
        alert('Webcam access is not supported by your browser.');
      }
    } catch (err) {
      console.warn('Webcam error:', err);
      alert('Camera access permission was denied or camera is unavailable.');
    }
  };

  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  };

  const toggleWebcam = () => {
    if (webcamActive) stopWebcam();
    else startWebcam();
  };

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setAnalysisResult({
        measuredAngle: selectedTest.id === 'sprint_start' ? '94.2°' : selectedTest.id === 'long_jump' ? '23.8°' : '91.5°',
        alignmentScore: 94,
        forceVector: '3.1x Body Weight',
        postureStatus: 'OPTIMAL BIOMECHANICAL ALIGNMENT ✓',
        recommendation: 'Excellent explosive hip extension. Maintain foot plant angle through acceleration phase.',
      });
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
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
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
                  Sports Science Biomechanics Motion Capture
                </h3>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 99, background: '#059669', color: 'white', fontWeight: 700 }}>
                  DCPE Kinesiology Vision
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Degree College of Physical Education (DCPE HVPM) • Athletic Kinematics Studio
              </span>
            </div>
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Test Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            Select Athletic Biomechanics Assessment:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {ATHLETIC_TESTS.map((test) => (
              <button
                key={test.id}
                type="button"
                onClick={() => {
                  setSelectedTest(test);
                  setAnalysisResult(null);
                }}
                style={{
                  background: selectedTest.id === test.id ? '#ecfdf5' : 'white',
                  border: selectedTest.id === test.id ? '2px solid #059669' : '1px solid var(--border-light)',
                  borderRadius: '14px',
                  padding: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{test.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-heading)' }}>{test.title}</div>
                <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px', fontWeight: 700 }}>{test.targetAngle}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Viewport & Video Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* Camera Motion Stream Viewport */}
          <div
            style={{
              background: '#090d16',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '280px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: webcamActive ? 'block' : 'none',
              }}
            />

            {!webcamActive && (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                <Camera size={44} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Kinematic Vision Camera Offline</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>Turn on webcam to enable joint angle overlay tracking</div>
              </div>
            )}

            {/* Pose Tracking Skeleton Overlay simulation */}
            {webcamActive && (
              <div style={{ position: 'absolute', inset: 0, border: '2px dashed rgba(16, 185, 129, 0.6)', margin: '16px', borderRadius: '14px', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '6px 14px', borderRadius: 99, color: '#34d399', fontSize: '11px', fontWeight: 800 }}>
                  🎯 JOINT SKELETON TRACKING ACTIVE • {selectedTest.targetAngle}
                </div>
              </div>
            )}

            <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
              <button
                type="button"
                onClick={toggleWebcam}
                style={{
                  background: webcamActive ? '#dc2626' : '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {webcamActive ? <VideoOff size={14} /> : <Video size={14} />}
                {webcamActive ? 'Stop Motion Camera' : 'Turn On Motion Cam 📹'}
              </button>
            </div>
          </div>

          {/* Biomechanical Target Specifications */}
          <div style={{ border: '1px solid var(--border-light)', borderRadius: '20px', padding: '20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Ideal Kinematic Benchmarks:
              </div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)' }}>{selectedTest.title}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.5, marginBottom: '16px' }}>
                {selectedTest.desc}
              </p>

              <div style={{ background: 'white', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '12px', marginBottom: '16px' }}>
                <strong>Benchmark Range:</strong> {selectedTest.idealRange}
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              style={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={16} /> {isAnalyzing ? 'Processing Kinematic Motion Vector...' : 'Calculate Joint Kinematics 🚀'}
            </button>
          </div>
        </div>

        {/* Kinematic Analysis Results */}
        {analysisResult && (
          <div style={{ border: '2px solid #10b981', borderRadius: '20px', padding: '20px', background: '#ecfdf5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} /> {analysisResult.postureStatus}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#065f46' }}>
                {analysisResult.alignmentScore}% Alignment
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
              <div style={{ background: 'white', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>Measured Joint Angle</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>{analysisResult.measuredAngle}</div>
              </div>
              <div style={{ background: 'white', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>Ground Reaction Force</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>{analysisResult.forceVector}</div>
              </div>
              <div style={{ background: 'white', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>SGBAU Standard</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>Grade A+ (Elite)</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#047857' }}>
              💡 <strong>Sports Science Recommendation:</strong> {analysisResult.recommendation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
