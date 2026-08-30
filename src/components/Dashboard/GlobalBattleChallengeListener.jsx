import React, { useState, useEffect, useRef } from 'react';
import { Swords, Check, X, Flame } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Dashboard.css';

export function GlobalBattleChallengeListener({ currentUser, onAcceptChallenge }) {
  const [incomingChallenge, setIncomingChallenge] = useState(null);
  const channelRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.prn) return;

    // Local BroadcastChannel for multi-tab testing
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('global_dcpe_battle_channel');
      bc.onmessage = (event) => handleIncomingSignal(event.data);
      broadcastChannelRef.current = bc;
    }

    // Supabase Real-Time Global Channel for cross-device
    try {
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

    return () => {
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [currentUser]);

  const handleIncomingSignal = (data) => {
    if (data.targetPrn && data.targetPrn === currentUser?.prn) {
      if (data.type === 'challenge_invite') {
        setIncomingChallenge(data);
        // Play notification alert chime if supported
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(`Battle challenge received from ${data.senderName}`);
          utt.rate = 1.1;
          window.speechSynthesis.speak(utt);
        }
      }
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

  const handleAccept = () => {
    if (!incomingChallenge) return;
    sendSignal('challenge_accepted', { targetPrn: incomingChallenge.sender });
    onAcceptChallenge({
      opponentPrn: incomingChallenge.sender,
      opponentName: incomingChallenge.senderName,
      roomId: incomingChallenge.roomId,
    });
    setIncomingChallenge(null);
  };

  const handleReject = () => {
    if (!incomingChallenge) return;
    sendSignal('challenge_rejected', { targetPrn: incomingChallenge.sender });
    setIncomingChallenge(null);
  };

  if (!incomingChallenge) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1100,
        background: '#0f172a',
        color: 'white',
        borderRadius: '20px',
        padding: '20px 24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(239, 68, 68, 0.4)',
        border: '2px solid #ef4444',
        maxWidth: '420px',
        width: '90%',
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Swords size={22} color="white" />
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ef4444' }}>
            ⚔️ BATTLE DUEL CHALLENGE RECEIVED!
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'white', marginTop: '2px' }}>
            {incomingChallenge.senderName}
          </div>
        </div>
      </div>

      <p style={{ fontSize: '12.5px', color: '#cbd5e1', margin: '0 0 16px 0', lineHeight: 1.4 }}>
        Has challenged you to a 100% real-time 1-on-1 Code &amp; Academic Trivia Duel!
      </p>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="button"
          onClick={handleAccept}
          style={{
            flex: 2,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Check size={16} /> Accept Duel 🚀
        </button>

        <button
          type="button"
          onClick={handleReject}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.1)',
            color: '#f87171',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '10px 16px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <X size={16} /> Reject
        </button>
      </div>
    </div>
  );
}
