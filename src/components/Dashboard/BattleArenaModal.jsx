import React, { useState, useEffect, useRef } from 'react';
import {
  Swords, Trophy, Zap, Shield, Flame, CheckCircle2, XCircle, Clock,
  User, Cpu, Sparkles, X, ChevronRight, Play, RefreshCw, Award, Copy, Check, Users, Radio, Search, Send, Volume2, VolumeX, MessageSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { subscribeToGlobalOnlineUsers } from './GlobalOnlinePresenceTracker';
import './Dashboard.css';

// AAA-LEVEL BATTLE PROBLEMS ACROSS DISCIPLINES
const EXTREME_BATTLE_PROBLEMS = [
  {
    id: 'reverse_string',
    title: 'Reverse a String Algorithm',
    category: 'code',
    discipline: '💻 Cyber Code War',
    difficulty: 'Warrior',
    problemText: 'Write a function reverseString(str) that returns the reversed version of str.',
    initialCode: 'function reverseString(str) {\n  // Type your solution here\n  return str.split("").reverse().join("");\n}',
    expectedOutput: 'EPCD MPHV',
  },
  {
    id: 'fibonacci_seq',
    title: 'N-th Fibonacci Number',
    category: 'code',
    discipline: '💻 Cyber Code War',
    difficulty: 'Grandmaster',
    problemText: 'Write a function fib(n) that returns the N-th Fibonacci number.',
    initialCode: 'function fib(n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);\n}',
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
    explanation: 'The Sagittal Plane divides the body into left and right sections and governs flexions and extensions.',
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
    explanation: 'The ATP-PCr system delivers maximal energy output for short explosive efforts up to 10 seconds.',
  },
];

const EMOTES = ['🔥 On Fire!', '⚡ Critical Hit!', '🎯 Good Luck!', '💪 Feel the Power!', '😎 Too Fast!'];

export function BattleArenaModal({ currentUser, preSetOpponent, onClose }) {
  const [arenaState, setArenaState] = useState(preSetOpponent ? 'battle' : 'online_players');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [challengeSentTo, setChallengeSentTo] = useState(null);
  const [soundMuted, setSoundMuted] = useState(false);

  // 100% Genuine Supabase Realtime Online Presence List
  const [genuineOnlineUsers, setGenuineOnlineUsers] = useState([]);
  
  const [opponent, setOpponent] = useState(preSetOpponent ? { name: preSetOpponent.opponentName, prn: preSetOpponent.opponentPrn } : null);
  const [currentProblem, setCurrentProblem] = useState(EXTREME_BATTLE_PROBLEMS[0]);
  const [userCode, setUserCode] = useState(EXTREME_BATTLE_PROBLEMS[0].initialCode || '');
  const [userSelectedOption, setUserSelectedOption] = useState(null);

  // Combat Visual Effects State
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [screenShake, setScreenShake] = useState(false);
  const [floatingDamage, setFloatingDamage] = useState(null);
  const [activeEmote, setActiveEmote] = useState(null);
  const [opponentEmote, setOpponentEmote] = useState(null);
  const [rejectNotice, setRejectNotice] = useState(null);

  // Real-Time Battle Stats
  const [timeLeft, setTimeLeft] = useState(60);
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [battleWinner, setBattleWinner] = useState(null);
  const [eloGained, setEloGained] = useState(0);

  const channelRef = useRef(null);
  const presenceChannelRef = useRef(null);
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

  // 100% Genuine Global Supabase Online Users Subscription
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
    } else if (data.type === 'emote_sent') {
      setOpponentEmote(data.emote);
      setTimeout(() => setOpponentEmote(null), 3000);
    } else if (data.type === 'player_submitted') {
      triggerScreenShake();
      playSound('hit');
      setPlayerHp(0);
      setBattleWinner('opponent');
      setArenaState('results');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 500);
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
    playSound('victory');
    setFloatingDamage('CRITICAL HIT! -100 HP ⚡');
    sendSignal('player_submitted');
    setOpponentHp(0);
    setBattleWinner('player');
    setEloGained(45);
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
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(12px)',
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
          background: '#090d16',
          color: 'white',
          borderRadius: '24px',
          maxWidth: '1020px',
          width: '100%',
          boxShadow: screenShake ? '0 0 50px rgba(239, 68, 68, 0.8)' : '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          transform: screenShake ? 'translate(4px, -4px)' : 'none',
          transition: 'transform 0.05s ease, box-shadow 0.2s ease',
          padding: '28px',
          maxHeight: '92vh',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* AAA Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg, #ef4444, #f97316)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}>
              <Swords size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900, margin: 0, color: 'white', letterSpacing: '0.02em' }}>
                  DCPE EXTREME 1-on-1 BATTLE LEAGUE
                </h3>
                <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: 99, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontWeight: 800 }}>
                  ⚡ EXTREME MULTIPLAYER
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Real-Time WebSockets Combat • Critical Hits • Live Emotes • ELO Ratings
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setSoundMuted(!soundMuted)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {soundMuted ? 'Muted' : 'Sound ON'}
            </button>
            <button className="btn btn-white btn-sm" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* REJECT NOTICE */}
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
                  🟢 Genuine Online Competitors ({filteredOnlinePlayers.length})
                </h4>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Select any active player to send a live challenge request</span>
              </div>
            </div>

            {/* Discipline Category Selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['💻 Cyber Code War', '🏃 Sports Science Showdown', '🧠 DSA Apex League'].map((disc) => (
                <button
                  key={disc}
                  type="button"
                  onClick={() => {
                    const prob = EXTREME_BATTLE_PROBLEMS.find((p) => p.discipline.includes(disc.slice(0, 4))) || EXTREME_BATTLE_PROBLEMS[0];
                    setCurrentProblem(prob);
                    setUserCode(prob.initialCode || '');
                  }}
                  style={{
                    background: currentProblem.discipline.includes(disc.slice(0, 4)) ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'rgba(255,255,255,0.06)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.12)',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {disc}
                </button>
              ))}
            </div>

            {/* Search Input */}
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
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                          {player.name.charAt(0)}
                        </div>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981', position: 'absolute', bottom: 0, right: 0, border: '2px solid #0f172a' }} />
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
                        fontSize: '12px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
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
            <RefreshCw size={44} color="#10b981" style={{ animation: 'spin 1.4s linear infinite', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'white', margin: '0 0 6px 0' }}>
              Sending Live Battle Invitation to {challengeSentTo?.name}...
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              A glowing popup alert has appeared on {challengeSentTo?.name}'s screen. Waiting for them to accept...
            </p>
            <button
              type="button"
              onClick={() => setArenaState('online_players')}
              style={{ marginTop: '20px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
            >
              Cancel Challenge
            </button>
          </div>
        )}

        {/* EXTREME BATTLE STATE */}
        {arenaState === 'battle' && (
          <div>
            {/* Player vs Opponent Combat Health Bar HUD */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '16px 24px', borderRadius: '20px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {/* Player 1 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>{currentUser?.name || 'You'}</div>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#3b82f6' }}>{playerHp} / 100 HP</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${playerHp}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: 99, transition: 'width 0.3s ease' }} />
                </div>
                {activeEmote && (
                  <div style={{ background: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: 99, fontSize: '11px', fontWeight: 800, marginTop: '8px', display: 'inline-block' }}>
                    {activeEmote}
                  </div>
                )}
              </div>

              {/* Timer & Combo Badge */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: timeLeft <= 10 ? '#ef4444' : '#f59e0b', fontFamily: 'monospace' }}>
                  ⏱️ {timeLeft}s
                </div>
                <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>
                  {currentProblem.discipline}
                </span>
              </div>

              {/* Player 2 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#ef4444' }}>{opponentHp} / 100 HP</span>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>{opponent?.name || 'Online Opponent'}</div>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${opponentHp}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444, #f87171)', borderRadius: 99, transition: 'width 0.3s ease' }} />
                </div>
                {opponentEmote && (
                  <div style={{ background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: 99, fontSize: '11px', fontWeight: 800, marginTop: '8px', display: 'inline-block', float: 'right' }}>
                    {opponentEmote}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Live Combat Emotes Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', alignSelf: 'center', fontWeight: 700 }}>Send Live Emote:</span>
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
                  }}
                >
                  {em}
                </button>
              ))}
            </div>

            {/* Split Screen Battle Viewport */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {/* Left Column: Your Battle Task */}
              <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px', padding: '20px', background: 'rgba(0,0,0,0.4)', position: 'relative' }}>
                {floatingDamage && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '8px', fontWeight: 900, fontSize: '13px', animation: 'bounce 0.4s ease' }}>
                    {floatingDamage}
                  </div>
                )}

                <div style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  🎯 Challenge Task: {currentProblem.title} ({currentProblem.difficulty})
                </div>
                <p style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 600, marginBottom: '16px' }}>
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
                )}

                <button
                  type="button"
                  onClick={handleSubmitSolution}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <Zap size={18} fill="white" /> CRITICAL STRIKE &amp; WIN DUEL! ⚡
                </button>
              </div>

              {/* Live Real Opponent Monitor */}
              <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px', padding: '20px', background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: '14px' }}>
                    🔴 Live Real Opponent Monitor
                  </div>
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>👨‍💻</div>
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
                  ⚡ Real-Time WebSockets Combat Stream Active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS & LOOT CHEST STATE */}
        {arenaState === 'results' && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: battleWinner === 'player' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: battleWinner === 'player' ? '0 0 35px rgba(16, 185, 129, 0.6)' : 'none' }}>
              <Trophy size={46} color="white" />
            </div>

            <h3 style={{ fontSize: '28px', fontWeight: 900, color: battleWinner === 'player' ? '#34d399' : '#f87171', margin: '0 0 6px 0' }}>
              {battleWinner === 'player' ? '🏆 EXTREME DUEL VICTORY!' : 'DEFEAT IN THE ARENA'}
            </h3>

            {battleWinner === 'player' && (
              <div style={{ display: 'inline-flex', gap: '24px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '16px 32px', borderRadius: '18px', margin: '16px 0 28px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 800 }}>XP LOOT DROP</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: 'white' }}>+350 XP 💎</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 800 }}>ELO RATING BOOST</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#34d399' }}>+{eloGained} ELO 📈</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 800 }}>NEW TITLE UNLOCKED</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#f59e0b' }}>Grandmaster ⚔️</div>
                </div>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={() => setArenaState('online_players')}
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: 900, fontSize: '14px', cursor: 'pointer' }}
              >
                Challenge Next Player ⚔️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
