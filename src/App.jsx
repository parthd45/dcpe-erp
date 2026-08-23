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
import Footer from './components/Footer/Footer';

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
          {currentUser.userType === 'student' ? (
            <StudentDashboard onBackToHome={() => setViewDashboard(false)} />
          ) : currentUser.userType === 'faculty' ? (
            <FacultyDashboard onBackToHome={() => setViewDashboard(false)} />
          ) : currentUser.userType === 'admin' ? (
            <AdminDashboard onBackToHome={() => setViewDashboard(false)} />
          ) : (
            <HODDashboard onBackToHome={() => setViewDashboard(false)} />
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

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
