import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Menu, X, LogIn, ChevronRight, User, LogOut, LayoutDashboard } from 'lucide-react';
import './Navbar.css';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Departments', href: '#departments' },
  { label: 'Features', href: '#features' },
  { label: 'Notices', href: '#notices' },
  { label: 'Contact', href: '#contact' },
];

import { OfficialHVPMLogo } from '../Common/OfficialHVPMLogo';

export default function Navbar({ onOpenDashboard, isDashboardActive }) {
  const { currentUser, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    if (isDashboardActive && href === '#home') {
      if (onOpenDashboard) onOpenDashboard(false);
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`navbar ${scrolled || isDashboardActive ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <a
            className="navbar-brand"
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#home');
            }}
          >
            <OfficialHVPMLogo size={42} showTitle={true} />
          </a>

          {!isDashboardActive && (
            <div className="navbar-links">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  className="navbar-link"
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <div className="navbar-actions">
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onOpenDashboard && onOpenDashboard(true)}
                >
                  <LayoutDashboard size={15} />
                  {currentUser.userType === 'student' ? 'My Dashboard' : `${currentUser.userType.toUpperCase()} Portal`}
                </button>
                <button
                  className="btn btn-outline-dark btn-sm"
                  onClick={logout}
                  title="Logout"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleNavClick('#login-section')}
              >
                <LogIn size={15} />
                Login / Register
                <ChevronRight size={14} />
              </button>
            )}

            <button
              className="navbar-mobile-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`navbar-mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <button
          className="navbar-mobile-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={28} />
        </button>
        {navLinks.map((link) => (
          <a
            key={link.href}
            className="navbar-link"
            href={link.href}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(link.href);
            }}
          >
            {link.label}
          </a>
        ))}
        {currentUser ? (
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              setMobileOpen(false);
              if (onOpenDashboard) onOpenDashboard(true);
            }}
          >
            <LayoutDashboard size={18} />
            Open Portal ({currentUser.name})
          </button>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              setMobileOpen(false);
              handleNavClick('#login-section');
            }}
          >
            <LogIn size={18} />
            Login to ERP
          </button>
        )}
      </div>
    </>
  );
}
