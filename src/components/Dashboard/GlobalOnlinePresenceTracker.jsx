import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// Global state emitter for active online presence
let globalOnlineUsersList = [];
let presenceListeners = [];

export function subscribeToGlobalOnlineUsers(callback) {
  presenceListeners.push(callback);
  callback(globalOnlineUsersList);
  return () => {
    presenceListeners = presenceListeners.filter((cb) => cb !== callback);
  };
}

function notifyListeners(newList) {
  globalOnlineUsersList = newList;
  presenceListeners.forEach((cb) => cb(newList));
}

export function GlobalOnlinePresenceTracker({ currentUser }) {
  useEffect(() => {
    if (!currentUser?.prn) return;

    const userPrn = currentUser.prn;
    const userName = currentUser.name || 'Student';
    const userCourse = currentUser.course || 'DCPE Autonomous';

    try {
      const presenceChannel = supabase.channel('global_dcpe_presence', {
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
                  onlineAt: p.onlineAt || new Date().toISOString(),
                });
              }
            }
          });

          notifyListeners(activeList);
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

      return () => {
        supabase.removeChannel(presenceChannel);
      };
    } catch (err) {
      console.warn('Global Presence Error:', err);
    }
  }, [currentUser]);

  return null; // Invisible global presence provider
}
