import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, ShieldCheck } from 'lucide-react';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      console.log('[DCPE ERP PWA] App was successfully installed!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback info toast if browser doesn't trigger prompt directly
      alert('To install DCPE ERP App on iOS or Mobile:\n1. Tap Share / Menu button\n2. Select "Add to Home Screen"');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[DCPE ERP PWA] User install choice: ${outcome}`);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      zIndex: 99990,
      maxWidth: '380px',
      width: 'calc(100vw - 48px)',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      color: '#ffffff',
      borderRadius: '20px',
      padding: '16px 20px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.15)',
      backdropFilter: 'blur(12px)',
      animation: 'slideUpPWA 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/dcpe-official-logo.png" alt="DCPE Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <div>
            <strong style={{ fontSize: '14px', fontWeight: 800, display: 'block', color: '#fff' }}>Install DCPE ERP Mobile App</strong>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Offline Access • Instant Hall Tickets & ID</span>
          </div>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 24, height: 24, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={handleInstallClick}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #d9234f 0%, #f43f5e 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '9px 14px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(217, 35, 79, 0.4)',
          }}
        >
          <Smartphone size={15} /> Add to Home Screen
        </button>
        <button
          onClick={() => setShowBanner(false)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.8)',
            border: 'none',
            borderRadius: '12px',
            padding: '9px 14px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
