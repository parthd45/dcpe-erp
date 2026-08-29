import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Departments from './components/Departments/Departments';
import Features from './components/Features/Features';
import Notices from './components/Notices/Notices';
import LoginSection from './components/LoginSection/LoginSection';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import HODDashboard from './components/Dashboard/HODDashboard';
import FacultyDashboard from './components/Dashboard/FacultyDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import RealtimeNotificationToast from './components/Dashboard/RealtimeNotificationToast';
import Footer from './components/Footer/Footer';

import { AIAssistantWidget } from './components/Dashboard/AIAssistantWidget';

function MainApp() {
  const { currentUser } = useAuth();
  const [viewDashboard, setViewDashboard] = useState(true);

  // If a user is logged in and wants to see dashboard
  const showDashboard = currentUser && viewDashboard;

  return (
    <>
      <Navbar
        onOpenDashboard={(val) => setViewDashboard(val)}
        isDashboardActive={showDashboard}
      />

      {showDashboard ? (
        <main>
          {(currentUser.userType === 'student' || currentUser.prn || (!currentUser.role && currentUser.course)) ? (
            <StudentDashboard onBackToHome={() => setViewDashboard(false)} />
          ) : (currentUser.userType === 'faculty' || currentUser.role === 'faculty') ? (
            <FacultyDashboard onBackToHome={() => setViewDashboard(false)} />
          ) : (currentUser.userType === 'admin' || currentUser.role === 'admin') ? (
            <AdminDashboard onBackToHome={() => setViewDashboard(false)} />
          ) : (currentUser.userType === 'hod' || currentUser.role === 'hod') ? (
            <HODDashboard onBackToHome={() => setViewDashboard(false)} />
          ) : (
            <StudentDashboard onBackToHome={() => setViewDashboard(false)} />
          )}
        </main>
      ) : (
        <main>
          <Hero />
          <About />
          <Departments />
          <Features />
          <Notices />
          <LoginSection />
        </main>
      )}

      {/* Global DCPE AI Genius Assistant (Available on Home Page & Dashboards) */}
      <AIAssistantWidget currentUser={currentUser} />

      <Footer />
    </>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DCPE ERP App Crash]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: '500px', width: '100%', background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ color: '#1e293b', margin: '0 0 8px', fontSize: '20px', fontWeight: 700 }}>Something went wrong</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px' }}>
              {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  localStorage.removeItem('dcpe_current_user_v4');
                  window.location.href = '/';
                }}
                style={{ padding: '10px 18px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Go to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '10px 18px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
        <RealtimeNotificationToast />
      </AuthProvider>
    </ErrorBoundary>
  );
}
