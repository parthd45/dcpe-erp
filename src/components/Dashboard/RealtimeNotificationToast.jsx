import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Bell, X, Megaphone, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RealtimeNotificationToast() {
  const { currentUser } = useAuth();
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => removeToast(id), 6000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!currentUser) return;

    // 1. Subscribe to Notices
    const noticesChannel = supabase
      .channel('notices_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notices' },
        (payload) => {
          const newNotice = payload.new;
          if (!newNotice) return;
          // Check scope: college-wide or matches student department
          const matchesDept = !newNotice.department_id || newNotice.department_id === currentUser.department;
          const isNotAuthor = newNotice.posted_by !== currentUser.id;

          if (matchesDept && isNotAuthor) {
            addToast({
              title: '📢 New Notice Posted',
              message: `${newNotice.title} — by ${newNotice.publisher_name || 'Administration'}`,
              type: 'notice',
            });
          }
        }
      )
      .subscribe();

    // 2. Subscribe to Leaves/Grievances
    const leavesChannel = supabase
      .channel('leaves_notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_leaves' },
        (payload) => {
          const app = payload.new;
          if (!app) return;

          // For HOD:
          if (currentUser.role === 'hod') {
            const isMyDept = app.department === currentUser.department;
            const isInsert = payload.eventType === 'INSERT';
            const isPendingHOD = app.status === 'pending_hod';

            if (isMyDept && (isInsert || isPendingHOD)) {
              if (app.type === 'leave') {
                addToast({
                  title: '🏖️ New Leave Request',
                  message: `${app.student_name} (${app.course}) requested ${app.total_days} day(s) of leave.`,
                  type: 'leave_request',
                });
              } else {
                addToast({
                  title: '📢 New Grievance Submitted',
                  message: `${app.student_name} (${app.course}) submitted a grievance.`,
                  type: 'grievance',
                });
              }
            }
          }

          // For Student:
          if (!currentUser.role && currentUser.prn) {
            const isMyApplication = app.prn === currentUser.prn;
            const isUpdate = payload.eventType === 'UPDATE';

            if (isMyApplication && isUpdate) {
              const statusLabel = app.status === 'approved' ? 'Sanctioned ✓' : app.status === 'rejected' ? 'Rejected ✕' : app.status;
              addToast({
                title: app.type === 'leave' ? '🏖️ Leave Request Update' : '📢 Grievance Resolution Update',
                message: `Your application has been updated to: ${statusLabel}`,
                type: app.status === 'approved' ? 'success' : 'warning',
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(noticesChannel);
      supabase.removeChannel(leavesChannel);
    };
  }, [currentUser]);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none', // Allow clicking behind container
        maxWidth: '380px',
        width: '100%',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto', // Re-enable pointer events for toast card
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            color: 'white',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.2)',
            display: 'flex',
            gap: '12px',
            transform: 'translateX(0)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Custom style animation */}
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(120%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>

          {/* Icon indicator */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background:
                toast.type === 'notice' ? 'rgba(59, 130, 246, 0.2)' :
                toast.type === 'leave_request' ? 'rgba(245, 158, 11, 0.2)' :
                toast.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color:
                toast.type === 'notice' ? '#60a5fa' :
                toast.type === 'leave_request' ? '#fbbf24' :
                toast.type === 'success' ? '#34d399' : '#f87171',
            }}
          >
            {toast.type === 'notice' && <Megaphone size={20} />}
            {toast.type === 'leave_request' && <Calendar size={20} />}
            {toast.type === 'success' && <CheckCircle2 size={20} />}
            {toast.type === 'warning' && <AlertCircle size={20} />}
            {toast.type === 'grievance' && <Bell size={20} />}
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 3px', color: '#f8fafc' }}>
              {toast.title}
            </h4>
            <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: '1.4' }}>
              {toast.message}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              alignSelf: 'flex-start',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
