import React, { useState, useEffect, useRef } from 'react';
import {
  Swords, Trophy, Zap, Shield, Flame, CheckCircle2, XCircle, Clock,
  User, Cpu, Sparkles, X, ChevronRight, Play, RefreshCw, Award, Search, Users, Check
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

export function BattleArenaModal({ currentUser, preSetOpponent, onClose }) {
  const [arenaState, setArenaState] = useState(preSetOpponent ? 'battle' : 'online_players'); // 'online_players' | 'waiting_accept' | 'battle' | 'results'
  const [searchQuery, setSearchQuery] = useState('');
  const [challengeSentTo, setChallengeSentTo] = useState(null);
  
  // 100% Genuine Supabase Realtime Online Presence List
  const [genuineOnlineUsers, setGenuineOnlineUsers] = useState([]);
  
  const [opponent, setOpponent] = useState(preSetOpponent ? { name: preSetOpponent.opponentName, prn: preSetOpponent.opponentPrn } : null);
  const [currentProblem, setCurrentProblem] = useState(BATTLE_PROBLEMS[0]);
  const [userCode, setUserCode] = useState(BATTLE_PROBLEMS[0].initialCode || '');
  const [rejectNotice, setRejectNotice] = useState(null);

  // Real-Time Battle Stats
  const [timeLeft, setTimeLeft] = useState(60);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [battleWinner, setBattleWinner] = useState(null);

  const channelRef = useRef(null);
  const presenceChannelRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const timerRef = useRef(null);

  // 100% Genuine Supabase Presence Subscription
  useEffect(() => {
    const userPrn = currentUser?.prn || 'guest_' + Math.floor(Math.random() * 10000);
    const userName = currentUser?.name || 'Student';
    const userCourse = currentUser?.course || 'DCPE Student';

    try {
      const presenceChannel = supabase.channel('dcpe_realtime_presence_room', {
        config: { presence: { key: userPrn } },
      });

      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const activeList = [];

          Object.keys(state).forEach((key) => {
            const presences = state[key];
            if (presences && presences.length > 0) {
              const p = presences[0];
              if (p.prn !== userPrn) {
                activeList.push({
                  prn: p.prn || key,
                  name: p.name || 'Active Student',
                  course: p.course || 'DCPE Autonomous',
                });
              }
            }
          });

          setGenuineOnlineUsers(activeList);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannel.track({
              prn: userPrn,
              name: userName,
              course: userCourse,
              onlineAt: new Date().toISOString(),
            });
          }
        });

      presenceChannelRef.current = presenceChannel;
    } catch (err) {
      console.warn('Supabase Presence Error:', err);
    }

    // Global battle channel listener
    initGlobalBattleChannel();

    return () => {
      if (presenceChannelRef.current) supabase.removeChannel(presenceChannelRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentUser]);

  const initGlobalBattleChannel = () => {
    if ('BroadcastChannel' in window) {
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
      const bc = new BroadcastChannel('global_dcpe_battle_channel');
      bc.onmessage = (event) => handleIncomingSignal(event.data);
      broadcastChannelRef.current = bc;
    }

    try {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      const ch = supabase.channel('global_dcpe_battle_channel', {
        config: { broadcast: { self: false } },
      });

      ch.on('broadcast', { event: 'battle_signal' }, ({ payload }) => {
        handleIncomingSignal(payload);
      });

      ch.subscribe();
      channelRef.current = ch;
    } catch (e) {
      console.warn('Global battle channel error:', e);
    }
  };

  const sendSignal = (type, payload = {}) => {
    const data = { type, sender: currentUser?.prn, senderName: currentUser?.name, ...payload };
    if (broadcastChannelRef.current) broadcastChannelRef.current.postMessage(data);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'battle_signal',
        payload: data,
      });
    }
  };

  const handleIncomingSignal = (data) => {
    if (data.targetPrn && data.targetPrn !== currentUser?.prn) return;

    if (data.type === 'challenge_accepted') {
      setOpponent({ name: data.senderName, prn: data.sender, course: 'Genuine Online Human' });
      setArenaState('battle');
      startTimer();
    } else if (data.type === 'challenge_rejected') {
      setRejectNotice(`${data.senderName} declined the challenge.`);
      setArenaState('online_players');
    } else if (data.type === 'progress_update') {
      setOpponentProgress(data.progress);
    } else if (data.type === 'player_submitted') {
      setBattleWinner('opponent');
      setArenaState('results');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSendChallenge = (player) => {
    setChallengeSentTo(player);
    setRejectNotice(null);
    setArenaState('waiting_accept');

    sendSignal('challenge_invite', { targetPrn: player.prn });
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
    setBattleWinner('player');
    setArenaState('results');
  };

  const filteredOnlinePlayers = genuineOnlineUsers.filter((std) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return std.name.toLowerCase().includes(q) || std.course.toLowerCase().includes(q) || std.prn.toLowerCase().includes(q);
  });

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
                  DCPE Direct Online Battle Arena
                </h3>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 99, background: '#10b981', color: 'white', fontWeight: 700 }}>
                  🟢 {genuineOnlineUsers.length} ONLINE NOW
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Instant Challenge &amp; Accept Flow • Zero Room Codes Needed
              </span>
            </div>
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}>
            <X size={18} />
          </button>
        </div>

        {/* REJECT NOTICE BANNER */}
        {rejectNotice && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', fontWeight: 700 }}>
            ⚠️ {rejectNotice}
          </div>
        )}

        {/* ONLINE PLAYERS LOBBY */}
        {arenaState === 'online_players' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'white' }}>
                  🟢 Genuine Online Students ({filteredOnlinePlayers.length})
                </h4>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Click "⚔️ Challenge" on any student to send a live pop-up request</span>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search online student by name, PRN, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 46px',
                  borderRadius: '14px',
                  background: '#040711',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Genuine Online Players Grid */}
            {filteredOnlinePlayers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Users size={36} color="#64748b" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>No Other Genuine Students Currently Online</div>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', maxWidth: '420px', margin: '6px auto 0' }}>
                  Open this app on another browser tab, phone, or laptop to see your second session appear live in 100% real-time!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxHeight: '340px', overflowY: 'auto' }}>
                {filteredOnlinePlayers.map((player) => (
                  <div
                    key={player.prn}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                          {player.name.charAt(0)}
                        </div>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', position: 'absolute', bottom: 0, right: 0, border: '2px solid #0f172a' }} />
                      </div>

                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>{player.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{player.course} • <code>{player.prn}</code></div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendChallenge(player)}
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                      }}
                    >
                      <Swords size={14} /> Challenge 🚀
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WAITING FOR ACCEPTANCE */}
        {arenaState === 'waiting_accept' && (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <RefreshCw size={40} color="#10b981" style={{ animation: 'spin 1.4s linear infinite', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: '0 0 6px 0' }}>
              Sending Live Challenge to {challengeSentTo?.name}...
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              A popup notification has appeared on {challengeSentTo?.name}'s screen. Waiting for them to Accept or Reject...
            </p>
            <button
              type="button"
              onClick={() => setArenaState('online_players')}
              style={{ marginTop: '20px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel Challenge
            </button>
          </div>
        )}

        {/* BATTLE STATE */}
        {arenaState === 'battle' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '20px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>{currentUser?.name || 'You'}</div>
                <div style={{ fontSize: '11px', color: '#38bdf8' }}>🟢 Real Human Connected</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#f59e0b', fontFamily: 'monospace' }}>⏱️ {timeLeft}s</div>
                <span style={{ fontSize: '10px', color: '#34d399' }}>LIVE WEBSOCKETS DUEL</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>{opponent?.name || 'Online Opponent'}</div>
                <div style={{ fontSize: '11px', color: '#ef4444' }}>🟢 Real Human Connected</div>
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
                  ⚡ Real-Time WebSockets Synchronization Active
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

            <button
              type="button"
              onClick={() => setArenaState('online_players')}
              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer' }}
            >
              Back to Online Players Lobby ⚔️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
