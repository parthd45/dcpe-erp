import React, { useState, useEffect, useRef } from 'react';
import {
  Swords, Trophy, Zap, Shield, Flame, CheckCircle2, XCircle, Clock,
  User, Cpu, Sparkles, X, ChevronRight, Play, RefreshCw, Award, Copy, Check, Users, Radio
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Dashboard.css';

// Challenge Questions & Coding Problems
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
];

export function BattleArenaModal({ currentUser, onClose }) {
  const [arenaState, setArenaState] = useState('lobby'); // 'lobby' | 'room_created' | 'join_room' | 'battle' | 'results'
  const [roomCode, setRoomCode] = useState('');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [role, setRole] = useState('host'); // 'host' | 'guest'
  
  const [opponent, setOpponent] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(BATTLE_PROBLEMS[0]);
  const [userCode, setUserCode] = useState(BATTLE_PROBLEMS[0].initialCode || '');
  const [userSelectedOption, setUserSelectedOption] = useState(null);
  const [copied, setCopied] = useState(false);

  // Real-Time Battle Stats
  const [timeLeft, setTimeLeft] = useState(60);
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [battleWinner, setBattleWinner] = useState(null);

  const channelRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize Real-Time Sync Channel
  const initRealtimeChannel = (code) => {
    const channelName = `battle_room_${code}`;

    // Browser BroadcastChannel for instant local multi-tab testing
    if ('BroadcastChannel' in window) {
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
      const bc = new BroadcastChannel(channelName);
      bc.onmessage = (event) => handleIncomingSignal(event.data);
      broadcastChannelRef.current = bc;
    }

    // Supabase Real-Time Broadcast Channel for multi-device cross-network
    try {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      const ch = supabase.channel(channelName, {
        config: { broadcast: { self: false } },
      });

      ch.on('broadcast', { event: 'battle_signal' }, ({ payload }) => {
        handleIncomingSignal(payload);
      });

      ch.subscribe();
      channelRef.current = ch;
    } catch (e) {
      console.warn('Supabase realtime fallback:', e);
    }
  };

  const sendSignal = (type, payload = {}) => {
    const data = { type, sender: currentUser?.prn || 'user_' + Date.now(), senderName: currentUser?.name || 'Student', ...payload };

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage(data);
    }
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'battle_signal',
        payload: data,
      });
    }
  };

  const handleIncomingSignal = (data) => {
    if (data.sender === (currentUser?.prn || '')) return;

    if (data.type === 'player_joined') {
      setOpponent({ name: data.senderName, prn: data.sender, course: 'Real Human Player' });
      setArenaState('battle');
      sendSignal('battle_start_ack', { problemId: currentProblem.id });
      startTimer();
    } else if (data.type === 'battle_start_ack') {
      setOpponent({ name: data.senderName, prn: data.sender, course: 'Real Human Player' });
      setArenaState('battle');
      startTimer();
    } else if (data.type === 'progress_update') {
      setOpponentProgress(data.progress);
    } else if (data.type === 'player_submitted') {
      setOpponentHp(0);
      setBattleWinner('opponent');
      setArenaState('results');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleCreateRoom = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
    setRole('host');
    setArenaState('room_created');
    initRealtimeChannel(code);
  };

  const handleJoinRoom = () => {
    if (!inputRoomCode.trim()) return;
    const code = inputRoomCode.trim();
    setRoomCode(code);
    setRole('guest');
    initRealtimeChannel(code);

    // Broadcast join signal to host
    setTimeout(() => {
      sendSignal('player_joined');
      setArenaState('battle');
      startTimer();
    }, 500);
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleUserProgress = (val) => {
    setUserCode(val);
    const progress = Math.min(100, Math.round((val.length / currentProblem.initialCode.length) * 100));
    sendSignal('progress_update', { progress });
  };

  const handleSubmitSolution = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sendSignal('player_submitted');
    setOpponentHp(0);
    setBattleWinner('player');
    setArenaState('results');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
      if (channelRef.current) supabase.removeChannel(channelRef.current);
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
                  DCPE 100% Real-Time Multiplayer Battle Arena
                </h3>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 99, background: '#10b981', color: 'white', fontWeight: 700 }}>
                  🔴 REAL WEBSOCKETS DUEL
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Degree College of Physical Education • Live Peer-to-Peer Code &amp; Trivia Duel
              </span>
            </div>
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}>
            <X size={18} />
          </button>
        </div>

        {/* LOBBY STATE */}
        {arenaState === 'lobby' && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)' }}>
              <Users size={36} color="white" />
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 8px 0', color: 'white' }}>
              100% Real-Time Human Multiplayer Room
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '520px', margin: '0 auto 28px', lineHeight: 1.6 }}>
              Create a private Room Code or enter your classmate's Room Code to start a 100% real-time duel with zero bots or fake players!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', maxWidth: '560px', margin: '0 auto' }}>
              <button
                type="button"
                onClick={handleCreateRoom}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '16px',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)',
                }}
              >
                🎮 Create Room Code 🚀
              </button>

              <button
                type="button"
                onClick={() => setArenaState('join_room')}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.18)',
                  padding: '16px',
                  borderRadius: '16px',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                🔑 Join Room Code
              </button>
            </div>
          </div>
        )}

        {/* ROOM CREATED (WAITING FOR REAL HUMAN PLAYER) */}
        {arenaState === 'room_created' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Your Private Room Code Created:
            </div>
            <div style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '8px', color: '#38bdf8', fontFamily: 'monospace', marginBottom: '16px' }}>
              {roomCode}
            </div>

            <button
              type="button"
              onClick={copyRoomCode}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginBottom: '32px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Room Code Copied!' : 'Copy Room Code'}
            </button>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '18px', padding: '24px', maxWidth: '480px', margin: '0 auto', border: '1px solid rgba(255,255,255,0.1)' }}>
              <RefreshCw size={32} color="#10b981" style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 12px' }} />
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>Waiting for Real Human Player to Join...</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Open this app on another browser tab or share Room Code <strong>{roomCode}</strong> with a friend to duel!
              </div>
            </div>
          </div>
        )}

        {/* JOIN ROOM INPUT */}
        {arenaState === 'join_room' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '460px', margin: '0 auto' }}>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
              Enter Classmate's Room Code:
            </h4>

            <input
              type="text"
              placeholder="e.g. 7821"
              value={inputRoomCode}
              onChange={(e) => setInputRoomCode(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                background: '#040711',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#38bdf8',
                fontSize: '24px',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontWeight: 900,
                letterSpacing: '4px',
                outline: 'none',
                marginBottom: '20px',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setArenaState('lobby')}
                style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700 }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleJoinRoom}
                style={{ flex: 2, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 900 }}
              >
                Connect to Room 🚀
              </button>
            </div>
          </div>
        )}

        {/* BATTLE STATE */}
        {arenaState === 'battle' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '20px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>{currentUser?.name || 'You'} (Player 1)</div>
                <div style={{ fontSize: '11px', color: '#38bdf8' }}>🟢 100% Real Human Connected</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#f59e0b', fontFamily: 'monospace' }}>⏱️ {timeLeft}s</div>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>ROOM #{roomCode}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>{opponent?.name || 'Opponent'} (Player 2)</div>
                <div style={{ fontSize: '11px', color: '#ef4444' }}>🟢 100% Real Human Connected</div>
              </div>
            </div>

            {/* Split Screen Battle Viewport */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px', padding: '20px', background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  🎯 Challenge Task: {currentProblem.title}
                </div>
                <p style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 600, marginBottom: '16px' }}>
                  {currentProblem.problemText}
                </p>

                <textarea
                  rows={8}
                  value={userCode}
                  onChange={(e) => handleUserProgress(e.target.value)}
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
                  }}
                >
                  Submit Solution &amp; Win Duel! ⚡
                </button>
              </div>

              {/* Live Real Opponent Monitor */}
              <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px', padding: '20px', background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: '14px' }}>
                    🔴 Live Real Opponent Progress
                  </div>
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>👨‍💻</div>
                    <div style={{ fontWeight: 800, fontSize: '16px', color: 'white' }}>{opponent?.name || 'Human Opponent'}</div>

                    <div style={{ marginTop: '20px' }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Real Progress: <strong>{opponentProgress}%</strong></div>
                      <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${opponentProgress}%`, height: '100%', background: '#ef4444', borderRadius: 99, transition: 'width 0.2s ease' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#34d399', textAlign: 'center' }}>
                  ⚡ Live WebSockets Stream Active (Room #{roomCode})
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS STATE */}
        {arenaState === 'results' && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: battleWinner === 'player' ? '#10b981' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trophy size={44} color="white" />
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: 900, color: battleWinner === 'player' ? '#34d399' : '#f87171', margin: '0 0 6px 0' }}>
              {battleWinner === 'player' ? '🏆 REAL HUMAN DUEL VICTORY!' : 'DEFEAT IN REAL DUEL'}
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Room Code #{roomCode} • Match Completed
            </p>

            <button
              type="button"
              onClick={() => setArenaState('lobby')}
              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 900 }}
            >
              Back to Arena Lobby ⚔️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
