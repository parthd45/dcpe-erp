import React, { useState, useEffect, useRef } from 'react';
import {
  Swords, Trophy, Zap, Shield, Flame, CheckCircle2, XCircle, Clock,
  User, Cpu, Sparkles, X, ChevronRight, Play, RefreshCw, Award, Search, Users, Volume2, VolumeX, MessageSquare, ArrowLeft, ChevronDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { subscribeToGlobalOnlineUsers } from './GlobalOnlinePresenceTracker';
import './Dashboard.css';

// EXTREME BATTLE PROBLEMS ACROSS DISCIPLINES
const EXTREME_BATTLE_PROBLEMS = [
  {
    id: 'reverse_string',
    title: 'Reverse a String Algorithm',
    category: 'code',
    discipline: '💻 Cyber Code War',
    difficulty: 'Warrior',
    problemText: 'Write a function reverseString(str) that returns the reversed version of str.',
    initialCode: 'function reverseString(str) {\n  // Write your solution here...\n  \n}',
    expectedOutput: 'EPCD MPHV',
  },
  {
    id: 'fibonacci_seq',
    title: 'N-th Fibonacci Number',
    category: 'code',
    discipline: '💻 Cyber Code War',
    difficulty: 'Grandmaster',
    problemText: 'Write a function fib(n) that returns the N-th Fibonacci number.',
    initialCode: 'function fib(n) {\n  // Write your solution here...\n  \n}',
    expectedOutput: '55',
  },
  {
    id: 'kinesiology_q1',
    title: 'Kinesiology Joint Motion',
    category: 'trivia',
    discipline: '🏃 Sports Science Showdown',
    difficulty: 'Warrior',
    problemText: 'Which plane of movement divides the body into Left and Right halves during sprinting?',
    options: [
      'A) Sagittal Plane',
      'B) Frontal Plane',
      'C) Transverse Plane',
      'D) Coronal Plane',
    ],
    correctIdx: 0,
    explanation: 'The Sagittal Plane divides the body into left and right sections.',
  },
  {
    id: 'atp_energy_q2',
    title: 'ATP-PCr Energy System',
    category: 'trivia',
    discipline: '🏃 Sports Science Showdown',
    difficulty: 'Grandmaster',
    problemText: 'What is the primary energy system utilized during a 100m maximal sprint effort?',
    options: [
      'A) ATP-Phosphocreatine (Anaerobic Alactic)',
      'B) Aerobic Glycolysis',
      'C) Beta Oxidation',
      'D) Oxidative Phosphorylation',
    ],
    correctIdx: 0,
    explanation: 'The ATP-PCr system delivers maximal energy output for short efforts.',
  },
];

const EMOTES = ['🔥 On Fire!', '⚡ Combo!', '🎯 Good Luck!', '💪 Power Up!', '😎 GG!'];

export function BattleArenaModal({ currentUser, preSetOpponent, onClose }) {
  const [arenaState, setArenaState] = useState(preSetOpponent ? 'battle' : 'online_players');
  const [activeTab, setActiveTab] = useState('online'); // 'online' | 'disciplines'
  const [searchQuery, setSearchQuery] = useState('');
  const [challengeSentTo, setChallengeSentTo] = useState(null);
  const [soundMuted, setSoundMuted] = useState(false);

  const [genuineOnlineUsers, setGenuineOnlineUsers] = useState([]);
  const [opponent, setOpponent] = useState(preSetOpponent ? { name: preSetOpponent.opponentName, prn: preSetOpponent.opponentPrn } : null);
  const [currentProblem, setCurrentProblem] = useState(EXTREME_BATTLE_PROBLEMS[0]);
  const [userCode, setUserCode] = useState(EXTREME_BATTLE_PROBLEMS[0].initialCode || '');
  const [userSelectedOption, setUserSelectedOption] = useState(null);

  const [screenShake, setScreenShake] = useState(false);
  const [floatingDamage, setFloatingDamage] = useState(null);
  const [activeEmote, setActiveEmote] = useState(null);
  const [opponentEmote, setOpponentEmote] = useState(null);
  const [rejectNotice, setRejectNotice] = useState(null);

  const [timeLeft, setTimeLeft] = useState(60);
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [battleWinner, setBattleWinner] = useState(null);

  const channelRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const timerRef = useRef(null);

  // Sound Synthesizer Engine
  const playSound = (type) => {
    if (soundMuted || !window.AudioContext) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'hit') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'victory') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  // Global Online Presence Subscription
  useEffect(() => {
    const unsubscribe = subscribeToGlobalOnlineUsers((users) => {
      setGenuineOnlineUsers(users);
    });

    initGlobalBattleChannel();

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentUser]);

  useEffect(() => {
    if (preSetOpponent) {
      setOpponent({ name: preSetOpponent.opponentName, prn: preSetOpponent.opponentPrn, course: 'Genuine Online Human' });
      setArenaState('battle');
    }
  }, [preSetOpponent]);

  // Guaranteed Battle Timer Loop
  useEffect(() => {
    if (arenaState === 'battle') {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          const nextVal = prev - 1;
          sendSignal('timer_tick', { timeLeft: nextVal });
          return nextVal;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [arenaState]);

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

  const [playerAccuracy, setPlayerAccuracy] = useState(null);
  const [opponentAccuracy, setOpponentAccuracy] = useState(null);

  const evaluateAccuracyScore = (problem, code, selectedOpt, timeRemaining) => {
    let accuracy = 0;

    if (problem.category === 'trivia') {
      if (selectedOpt === problem.correctIdx) {
        accuracy = 100;
      } else if (selectedOpt !== null) {
        accuracy = 25;
      }
    } else {
      const cleanCode = code.trim();
      try {
        if (cleanCode.includes('return') || cleanCode.includes('reverse') || cleanCode.includes('Math.max') || cleanCode.includes('fib')) {
          let testFn = new Function(`return ${cleanCode}`)();
          if (typeof testFn === 'function') {
            if (problem.id === 'reverse_string') {
              const res = testFn("HVPM DCPE");
              if (res === "EPCD MPHV" || (res && res.includes("EPCD"))) accuracy = 100;
              else if (res) accuracy = 75;
              else accuracy = 40;
            } else if (problem.id === 'fibonacci_seq') {
              const res = testFn(10);
              if (res === 55) accuracy = 100;
              else if (res) accuracy = 70;
              else accuracy = 40;
            } else {
              accuracy = 90;
            }
          } else {
            accuracy = 60;
          }
        } else {
          accuracy = 30;
        }
      } catch (err) {
        accuracy = cleanCode.length > 20 ? 40 : 20;
      }
    }

    const speedBonus = Math.round((timeRemaining / 60) * 5);
    return Math.min(100, accuracy + speedBonus);
  };

  const determineWinner = (myScore, oppScore) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (myScore > oppScore) {
      playSound('victory');
      setBattleWinner('player');
    } else if (oppScore > myScore) {
      playSound('hit');
      setBattleWinner('opponent');
    } else {
      playSound('victory');
      setBattleWinner('player');
    }
    setArenaState('results');
  };

  const handleIncomingSignal = (data) => {
    if (data.targetPrn && data.targetPrn !== currentUser?.prn) return;

    if (data.type === 'challenge_accepted') {
      setOpponent({ name: data.senderName, prn: data.sender, course: 'Genuine Online Human' });
      setArenaState('battle');
    } else if (data.type === 'challenge_rejected') {
      setRejectNotice(`${data.senderName} declined the challenge.`);
      setArenaState('online_players');
    } else if (data.type === 'timer_tick' && data.timeLeft !== undefined) {
      setTimeLeft(data.timeLeft);
    } else if (data.type === 'progress_update') {
      setOpponentProgress(data.progress);
    } else if (data.type === 'emote_sent') {
      setOpponentEmote(data.emote);
      setTimeout(() => setOpponentEmote(null), 3000);
    } else if (data.type === 'player_submitted_accuracy') {
      setOpponentAccuracy(data.accuracyScore);
      setOpponentProgress(100);
      if (playerAccuracy !== null) {
        determineWinner(playerAccuracy, data.accuracyScore);
      }
    }
  };

  const handleSendEmote = (emoteStr) => {
    setActiveEmote(emoteStr);
    sendSignal('emote_sent', { emote: emoteStr });
    setTimeout(() => setActiveEmote(null), 3000);
  };

  const handleSendChallenge = (player) => {
    setChallengeSentTo(player);
    setRejectNotice(null);
    setArenaState('waiting_accept');
    sendSignal('challenge_invite', { targetPrn: player.prn });
  };

  const handleUserProgress = (val) => {
    setUserCode(val);
    const progress = Math.min(100, Math.round((val.length / currentProblem.initialCode.length) * 100));
    sendSignal('progress_update', { progress });
  };

  const [submissionError, setSubmissionError] = useState(null);

  const handleSubmitSolution = () => {
    setSubmissionError(null);

    // 1. Trivia Question Validation
    if (currentProblem.category === 'trivia') {
      if (userSelectedOption === null) {
        setSubmissionError('⚠️ Please select an answer option before submitting!');
        playSound('hit');
        return;
      }
      if (userSelectedOption !== currentProblem.correctIdx) {
        setSubmissionError('❌ Incorrect answer! -20 HP damage taken. Try again!');
        setPlayerHp((prev) => Math.max(0, prev - 20));
        playSound('hit');
        return;
      }
    } else {
      // 2. Code Challenge Validation
      const code = userCode.trim();
      const initial = (currentProblem.initialCode || '').trim();

      if (!code || code === initial) {
        setSubmissionError('⚠️ Please write your solution code before submitting!');
        playSound('hit');
        return;
      }

      if (!code.includes('return') && !code.includes('console.log') && code.length < initial.length + 5) {
        setSubmissionError('⚠️ Your code logic is incomplete! Please write the solution algorithm.');
        playSound('hit');
        return;
      }
    }

    // Compute solution accuracy score
    const score = evaluateAccuracyScore(currentProblem, userCode, userSelectedOption, timeLeft);
    setPlayerAccuracy(score);

    sendSignal('player_submitted_accuracy', { accuracyScore: score, timeUsed: 60 - timeLeft });

    if (opponentAccuracy !== null) {
      determineWinner(score, opponentAccuracy);
    } else {
      setSubmissionError(`✅ Solution submitted with ${score}% Accuracy Score! Waiting for opponent's accuracy score...`);
    }
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
        background: 'rgba(11, 15, 25, 0.92)',
        backdropFilter: 'blur(14px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: '#090d16',
          color: 'white',
          borderRadius: '24px',
          maxWidth: '960px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95)',
          padding: '20px',
          maxHeight: '94vh',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* App Bar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #ef4444, #f97316)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
              <Swords size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 900, margin: 0, color: 'white' }}>1-on-1 Battle Arena</h3>
                <span style={{ fontSize: '9.5px', padding: '2px 8px', borderRadius: 99, background: '#10b981', color: 'white', fontWeight: 800 }}>
                  🟢 {genuineOnlineUsers.length} ONLINE
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Real-time multiplayer duel app</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setSoundMuted(!soundMuted)}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {soundMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Rejection Notice */}
        {rejectNotice && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', fontSize: '12px', fontWeight: 700 }}>
            ⚠️ {rejectNotice}
          </div>
        )}

        {/* ONLINE PLAYERS LOBBY */}
        {arenaState === 'online_players' && (
          <div>
            {/* Segmented App Tabs */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '4px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('online')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'online' ? '#ef4444' : 'transparent',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                🟢 Online Players ({filteredOnlinePlayers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('disciplines')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'disciplines' ? '#ef4444' : 'transparent',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                🎯 Select Subject Mode ({currentProblem.title.slice(0, 15)}...)
              </button>
            </div>

            {/* Subject Selector Tab */}
            {activeTab === 'disciplines' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                {EXTREME_BATTLE_PROBLEMS.map((prob) => (
                  <button
                    key={prob.id}
                    type="button"
                    onClick={() => {
                      setCurrentProblem(prob);
                      setUserCode(prob.initialCode || '');
                      setActiveTab('online');
                    }}
                    style={{
                      background: currentProblem.id === prob.id ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.05)',
                      border: currentProblem.id === prob.id ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                      padding: '14px',
                      borderRadius: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 800 }}>{prob.discipline}</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, margin: '2px 0' }}>{prob.title}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Difficulty: {prob.difficulty}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search online classmate by name or PRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
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

            {/* Online Players Grid */}
            {filteredOnlinePlayers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Users size={32} color="#64748b" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>No Other Genuine Students Currently Online</div>
                <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px', maxWidth: '380px', margin: '4px auto 0' }}>
                  Open this app on another phone or browser tab to test live 1-on-1 duels in real-time!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
                {filteredOnlinePlayers.map((player) => (
                  <div
                    key={player.prn}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px' }}>
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
                        padding: '10px 18px',
                        borderRadius: '12px',
                        fontSize: '12.5px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                      }}
                    >
                      <Swords size={15} /> Challenge 🚀
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WAITING FOR ACCEPTANCE */}
        {arenaState === 'waiting_accept' && (
          <div style={{ textAlign: 'center', padding: '44px 16px' }}>
            <RefreshCw size={40} color="#10b981" style={{ animation: 'spin 1.4s linear infinite', margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: '0 0 6px 0' }}>
              Sending Live Challenge to {challengeSentTo?.name}...
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              A popup notification has appeared on {challengeSentTo?.name}'s screen. Waiting for response...
            </p>
            <button
              type="button"
              onClick={() => setArenaState('online_players')}
              style={{ marginTop: '16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* EXTREME IN-GAME COMBAT VIEWPORT */}
        {arenaState === 'battle' && (
          <div>
            {/* Top Compact Combat HUD */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '16px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, fontSize: '12.5px', color: 'white' }}>{currentUser?.name || 'You'}</span>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#3b82f6' }}>{playerHp} HP</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${playerHp}%`, height: '100%', background: '#3b82f6', borderRadius: 99 }} />
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#f59e0b', fontFamily: 'monospace' }}>⏱️ {timeLeft}s</div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#ef4444' }}>{opponentHp} HP</span>
                  <span style={{ fontWeight: 800, fontSize: '12.5px', color: 'white' }}>{opponent?.name || 'Opponent'}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${opponentHp}%`, height: '100%', background: '#ef4444', borderRadius: 99 }} />
                </div>
              </div>
            </div>

            {/* Quick Live Emotes Bar */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
              {EMOTES.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => handleSendEmote(em)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '4px 10px',
                    borderRadius: 99,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {em}
                </button>
              ))}
            </div>

            {/* Challenge Task Box */}
            <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '16px', background: 'rgba(0,0,0,0.4)', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '4px' }}>
                🎯 Task: {currentProblem.title}
              </div>
              <p style={{ fontSize: '13.5px', color: '#e2e8f0', fontWeight: 600, marginBottom: '14px', lineHeight: 1.4 }}>
                {currentProblem.problemText}
              </p>

              {currentProblem.category === 'trivia' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {currentProblem.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setUserSelectedOption(idx)}
                      style={{
                        background: userSelectedOption === idx ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)',
                        border: userSelectedOption === idx ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '12px 14px',
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
                  rows={6}
                  value={userCode}
                  onChange={(e) => handleUserProgress(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#040711',
                    color: '#38bdf8',
                    fontFamily: 'Consolas, monospace',
                    fontSize: '13px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                    marginBottom: '14px',
                  }}
                />
              )}

              {submissionError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', padding: '10px 14px', borderRadius: '12px', marginBottom: '12px', fontSize: '12px', fontWeight: 800 }}>
                  {submissionError}
                </div>
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
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                }}
              >
                ⚡ SUBMIT &amp; WIN DUEL!
              </button>
            </div>
          </div>
        )}

        {/* RESULTS STATE */}
        {arenaState === 'results' && (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: battleWinner === 'player' ? '#10b981' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Trophy size={38} color="white" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 900, color: battleWinner === 'player' ? '#34d399' : '#f87171', margin: '0 0 6px 0' }}>
              {battleWinner === 'player' ? '🏆 DUEL VICTORY (HIGHER ACCURACY)!' : 'DEFEAT IN DUEL'}
            </h3>

            {/* Accuracy Score Comparison Cards */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '16px 0' }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Your Solution Accuracy</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#38bdf8' }}>{playerAccuracy || 0}%</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>{opponent?.name || 'Opponent'} Accuracy</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#f87171' }}>{opponentAccuracy || 0}%</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setArenaState('online_players')}
              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', marginTop: '14px' }}
            >
              Back to Lobby ⚔️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
