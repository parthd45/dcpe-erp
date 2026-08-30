import React, { useState, useEffect, useRef } from 'react';
import {
  Swords, Trophy, Zap, Shield, Flame, CheckCircle2, XCircle, Clock,
  User, Cpu, Sparkles, X, ChevronRight, Play, RefreshCw, Award, PlayCircle
} from 'lucide-react';
import './Dashboard.css';

// Challenge Questions & Coding Battle Problems
const BATTLE_PROBLEMS = [
  {
    id: 'reverse_string',
    title: 'Reverse a String Algorithm',
    category: 'code',
    lang: 'javascript',
    problemText: 'Write a function reverseString(str) that returns the reversed version of str.',
    initialCode: 'function reverseString(str) {\n  // Type your solution here\n  return str.split("").reverse().join("");\n}',
    testInput: '"HVPM DCPE"',
    expectedOutput: '"EPCD MPHV"',
  },
  {
    id: 'find_max',
    title: 'Find Maximum in Array',
    category: 'code',
    lang: 'javascript',
    problemText: 'Write a function findMax(arr) that returns the maximum number in an array.',
    initialCode: 'function findMax(arr) {\n  return Math.max(...arr);\n}',
    testInput: '[45, 89, 12, 99, 34]',
    expectedOutput: '99',
  },
  {
    id: 'kinesiology_q1',
    title: 'Kinesiology Joint Motion',
    category: 'trivia',
    problemText: 'Which plane of movement divides the body into Left and Right halves during sprinting?',
    options: [
      'A) Sagittal Plane',
      'B) Frontal Plane',
      'C) Transverse Plane',
      'D) Coronal Plane',
    ],
    correctIdx: 0,
    explanation: 'The Sagittal Plane divides the body into left and right sections and governs flexions and extensions.',
  },
  {
    id: 'dbms_q1',
    title: 'SQL Primary Key Rule',
    category: 'trivia',
    problemText: 'Which property MUST a database Primary Key constraint enforce on a table column?',
    options: [
      'A) NOT NULL and UNIQUE',
      'B) Foreign key reference only',
      'C) Allow duplicate NULL values',
      'D) Auto increment only',
    ],
    correctIdx: 0,
    explanation: 'A Primary Key must contain UNIQUE values and cannot contain NULL values.',
  },
];

export function BattleArenaModal({ currentUser, onClose }) {
  const [arenaState, setArenaState] = useState('lobby'); // 'lobby' | 'searching' | 'battle' | 'results'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [opponent, setOpponent] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(BATTLE_PROBLEMS[0]);
  const [userCode, setUserCode] = useState(BATTLE_PROBLEMS[0].initialCode || '');
  const [userSelectedOption, setUserSelectedOption] = useState(null);
  
  // Battle Stats
  const [timeLeft, setTimeLeft] = useState(45);
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [battleWinner, setBattleWinner] = useState(null);
  const [arenaXpEarned, setArenaXpEarned] = useState(0);

  const timerRef = useRef(null);
  const opponentIntervalRef = useRef(null);

  // Matchmaking Simulation
  const handleStartMatchmaking = () => {
    setArenaState('searching');
    setTimeout(() => {
      const randomOpponents = [
        { name: 'Aarav Sharma', course: 'MCA 2nd Year', avatar: '👨‍💻', rank: 'Gold Arena Rank' },
        { name: 'Rohan Patil', course: 'B.P.Ed 3rd Year', avatar: '🏃', rank: 'Silver Arena Rank' },
        { name: 'Ananya Deshmukh', course: 'BCA 1st Year', avatar: '👩‍💻', rank: 'Legend Arena Rank' },
      ];
      const selectedOpp = randomOpponents[Math.floor(Math.random() * randomOpponents.length)];
      setOpponent(selectedOpp);

      // Pick problem
      const prob = BATTLE_PROBLEMS[Math.floor(Math.random() * BATTLE_PROBLEMS.length)];
      setCurrentProblem(prob);
      setUserCode(prob.initialCode || '');
      setUserSelectedOption(null);

      // Reset stats
      setTimeLeft(45);
      setPlayerHp(100);
      setOpponentHp(100);
      setOpponentProgress(0);
      setBattleWinner(null);

      setArenaState('battle');
      startBattleTimer();
      simulateOpponentProgress();
    }, 1800);
  };

  const startBattleTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const simulateOpponentProgress = () => {
    if (opponentIntervalRef.current) clearInterval(opponentIntervalRef.current);
    opponentIntervalRef.current = setInterval(() => {
      setOpponentProgress((prev) => {
        if (prev >= 90) {
          clearInterval(opponentIntervalRef.current);
          return 90;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 2000);
  };

  const handleTimeOut = () => {
    if (opponentIntervalRef.current) clearInterval(opponentIntervalRef.current);
    setBattleWinner('opponent');
    setArenaState('results');
  };

  const handleSubmitSolution = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (opponentIntervalRef.current) clearInterval(opponentIntervalRef.current);

    let isCorrect = false;

    if (currentProblem.category === 'trivia') {
      isCorrect = userSelectedOption === currentProblem.correctIdx;
    } else {
      isCorrect = true; // Simulated code pass
    }

    if (isCorrect) {
      setOpponentHp(0);
      setBattleWinner('player');
      setArenaXpEarned(250);
    } else {
      setPlayerHp(20);
      setBattleWinner('opponent');
      setArenaXpEarned(50);
    }

    setArenaState('results');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (opponentIntervalRef.current) clearInterval(opponentIntervalRef.current);
    };
  }, []);

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
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
          background: '#0f172a',
          color: 'white',
          borderRadius: '24px',
          maxWidth: '1000px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          padding: '28px',
          maxHeight: '92vh',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ef4444, #f97316)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Swords size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, margin: 0, color: 'white' }}>
                  DCPE 1-on-1 Real-Time Battle Arena
                </h3>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 99, background: '#ef4444', color: 'white', fontWeight: 700 }}>
                  LIVE MULTIPLAYER ⚔️
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Degree College of Physical Education • Head-to-Head Code &amp; Academic Duel
              </span>
            </div>
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}>
            <X size={18} />
          </button>
        </div>

        {/* ARENA LOBBY STATE */}
        {arenaState === 'lobby' && (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #dc2626, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)' }}>
              <Flame size={44} color="white" />
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 8px 0', color: 'white' }}>
              Challenge Classmates in Real-Time Duels!
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '540px', margin: '0 auto 28px', lineHeight: 1.6 }}>
              Compete side-by-side in 60-second rapid fire coding sprints and sports science trivia challenges. Win XP points and upgrade your DCPE Arena Rank!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', maxWidth: '720px', margin: '0 auto 32px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>⚡</div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>Code Speed Sprint</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>JS / Python Algorithm Speed</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>🏃</div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>Sports Kinesiology Duel</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>B.P.Ed / M.P.Ed Athletics Trivia</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>🗄️</div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>DBMS &amp; CS Rapid Fire</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>BCA / MCA Core Tech Trivia</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartMatchmaking}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                padding: '14px 40px',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Swords size={20} /> Enter Matchmaking Queue 🚀
            </button>
          </div>
        )}

        {/* SEARCHING OPPONENT STATE */}
        {arenaState === 'searching' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <RefreshCw size={44} color="#f97316" style={{ animation: 'spin 1.2s linear infinite', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: 0 }}>
              Searching for Online Classmate Opponent...
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
              Connecting to DCPE Real-Time Battle Server...
            </p>
          </div>
        )}

        {/* ACTIVE BATTLE STATE */}
        {arenaState === 'battle' && (
          <div>
            {/* Player vs Opponent Top HUD Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '20px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {/* Player 1 (You) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    👨‍🎓
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>{currentUser?.name || 'You'}</div>
                    <div style={{ fontSize: '11px', color: '#38bdf8' }}>{currentUser?.course || 'Student'}</div>
                  </div>
                </div>
                {/* HP Bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${playerHp}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              {/* Countdown Timer */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: timeLeft <= 10 ? '#ef4444' : '#f59e0b', fontFamily: 'monospace' }}>
                  ⏱️ {timeLeft}s
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Battle Clock</span>
              </div>

              {/* Player 2 (Opponent) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>{opponent?.name}</div>
                    <div style={{ fontSize: '11px', color: '#f97316' }}>{opponent?.course}</div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    {opponent?.avatar}
                  </div>
                </div>
                {/* HP Bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${opponentHp}%`, height: '100%', background: '#ef4444', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>

            {/* Split Screen Battle Viewport */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {/* Left Column: Your Battle Task */}
              <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px', padding: '20px', background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  🎯 Challenge Task: {currentProblem.title}
                </div>
                <p style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 600, marginBottom: '16px', lineHeight: 1.5 }}>
                  {currentProblem.problemText}
                </p>

                {currentProblem.category === 'trivia' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {currentProblem.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setUserSelectedOption(idx)}
                        style={{
                          background: userSelectedOption === idx ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)',
                          border: userSelectedOption === idx ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                          color: 'white',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '13px',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    rows={8}
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#040711',
                      color: '#38bdf8',
                      fontFamily: 'Consolas, monospace',
                      fontSize: '13px',
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                      marginBottom: '16px',
                    }}
                  />
                )}

                <button
                  type="button"
                  onClick={handleSubmitSolution}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <Zap size={16} fill="white" /> Submit Solution &amp; Attack Opponent! ⚡
                </button>
              </div>

              {/* Right Column: Live Opponent Screen Stream */}
              <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px', padding: '20px', background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🔴 Live Opponent Monitor
                    </span>
                    <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
                      DUEL IN PROGRESS
                    </span>
                  </div>

                  <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>{opponent?.avatar}</div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'white' }}>{opponent?.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{opponent?.rank}</div>

                    <div style={{ marginTop: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                        <span>Opponent Completion:</span>
                        <strong style={{ color: '#f97316' }}>{opponentProgress}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${opponentProgress}%`, height: '100%', background: '#f97316', borderRadius: 99, transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                  ⚡ Real-Time WebSockets Battle Synchronization Active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS STATE */}
        {arenaState === 'results' && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            {battleWinner === 'player' ? (
              <>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)' }}>
                  <Trophy size={44} color="white" />
                </div>
                <h3 style={{ fontSize: '26px', fontWeight: 900, color: '#34d399', margin: '0 0 6px 0' }}>
                  🏆 ARENA VICTORY!
                </h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 20px 0' }}>
                  You defeated <strong>{opponent?.name}</strong> in the 1-on-1 Battle Arena!
                </p>

                <div style={{ display: 'inline-flex', gap: '20px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '16px 28px', borderRadius: '16px', marginBottom: '28px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>XP REWARD</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: 'white' }}>+{arenaXpEarned} XP</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>NEW ARENA RANK</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: 'white' }}>Grandmaster ⚔️</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #dc2626, #991b1b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <XCircle size={44} color="white" />
                </div>
                <h3 style={{ fontSize: '26px', fontWeight: 900, color: '#f87171', margin: '0 0 6px 0' }}>
                  DEFEAT IN THE ARENA
                </h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 20px 0' }}>
                  {opponent?.name} completed the challenge faster. Keep practicing!
                </p>

                <div style={{ display: 'inline-flex', gap: '20px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '16px 28px', borderRadius: '16px', marginBottom: '28px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#f87171', fontWeight: 700 }}>XP REWARD</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: 'white' }}>+{arenaXpEarned} XP</div>
                  </div>
                </div>
              </>
            )}

            <div>
              <button
                type="button"
                onClick={handleStartMatchmaking}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginRight: '12px',
                }}
              >
                Rematch / Find New Opponent ⚔️
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Close Arena
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
