import { useEffect, useRef } from 'react';
import { LogIn, ArrowRight, Award, Users, BookOpen, Trophy } from 'lucide-react';
import './Hero.css';

const stats = [
  { number: '50+', label: 'Years of Excellence', color: 'primary', icon: Award },
  { number: '6', label: 'Departments', color: 'accent', icon: BookOpen },
  { number: '2000+', label: 'Alumni Network', color: 'success', icon: Users },
  { number: 'A', label: 'NAAC Grade', color: 'info', icon: Trophy },
];

export default function Hero() {
  const statsRef = useRef([]);

  useEffect(() => {
    // Simple counter animation for numeric stats
    statsRef.current.forEach((el) => {
      if (!el) return;
      const target = el.dataset.target;
      const isNumeric = /^\d+/.test(target);
      if (!isNumeric) return;

      const num = parseInt(target);
      const duration = 1800;
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(eased * num);
        el.textContent = current + (target.includes('+') ? '+' : '');
        if (progress < 1) requestAnimationFrame(animate);
      };
      
      // Start animation when element is visible
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(animate);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
    });
  }, []);

  const scrollToSection = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="home">
      {/* Animated Background */}
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>
      </div>
      <div className="hero-grid"></div>

      {/* Content */}
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          NAAC 'A' Grade — Autonomous College
        </div>

        <h1 className="hero-title">
          <span className="hero-title-line">Degree College of</span>
          <span className="hero-title-line hero-title-gradient">Physical Education</span>
          <span className="hero-title-line">
            <span className="hero-title-accent">ERP</span> Portal
          </span>
        </h1>

        <p className="hero-subtitle">
          Empowering <strong>students</strong> and <strong>staff</strong> of DCPE, 
          Shree Hanuman Vyayam Prasarak Mandal, Amravati with a unified 
          digital platform for academics, administration, and beyond.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => scrollToSection('#login-section')}>
            <LogIn size={20} />
            Login to ERP
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => scrollToSection('#features')}>
            Explore Features
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          {stats.map((stat, i) => (
            <div className="hero-stat" key={i}>
              <div
                className={`hero-stat-number ${stat.color}`}
                ref={(el) => (statsRef.current[i] = el)}
                data-target={stat.number}
              >
                {stat.number}
              </div>
              <div className="hero-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll" onClick={() => scrollToSection('#about')}>
        <div className="hero-scroll-icon"></div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}
