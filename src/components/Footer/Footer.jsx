import {
  GraduationCap, MapPin, Phone, Mail, Globe, ChevronRight,
  ExternalLink, MessageCircle, Camera, Play
} from 'lucide-react';
import './Footer.css';

const quickLinks = [
  'Student Dashboard',
  'Faculty Portal',
  'Examination',
  'Fee Payment',
  'Library',
  'Placement Cell',
];

const resources = [
  'Academic Calendar',
  'Timetable',
  'Syllabus',
  'Notices & Circulars',
  'Anti-Ragging Cell',
  'Grievance Portal',
];

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-main">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-brand-header">
              <div className="footer-logo">
                <GraduationCap size={22} />
              </div>
              <span className="footer-brand-name">DCPE HVPM ERP</span>
            </div>
            <p className="footer-brand-text">
              Degree College of Physical Education, Shree Hanuman Vyayam Prasarak Mandal, Amravati.
              An Autonomous, NAAC 'A' Grade Multidisciplinary College affiliated to 
              Sant Gadge Baba Amravati University.
            </p>
            <div className="footer-socials">
              <a className="footer-social-btn" href="#" aria-label="Facebook"><ExternalLink size={16} /></a>
              <a className="footer-social-btn" href="#" aria-label="Twitter"><MessageCircle size={16} /></a>
              <a className="footer-social-btn" href="#" aria-label="Instagram"><Camera size={16} /></a>
              <a className="footer-social-btn" href="#" aria-label="YouTube"><Play size={16} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h4>Quick Links</h4>
            <div className="footer-links">
              {quickLinks.map((link) => (
                <a className="footer-link" href="#" key={link}>
                  <ChevronRight size={14} />
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="footer-column">
            <h4>Resources</h4>
            <div className="footer-links">
              {resources.map((link) => (
                <a className="footer-link" href="#" key={link}>
                  <ChevronRight size={14} />
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="footer-column">
            <h4>Contact Us</h4>
            <div className="footer-contact-item">
              <div className="footer-contact-icon"><MapPin size={16} /></div>
              <div className="footer-contact-text">
                <strong>Address</strong>
                HVPM Campus, Amravati, Maharashtra 444605, India
              </div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon"><Phone size={16} /></div>
              <div className="footer-contact-text">
                <strong>Phone</strong>
                +91-721-2662739
              </div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon"><Mail size={16} /></div>
              <div className="footer-contact-text">
                <strong>Email</strong>
                info@dcpehvpm.org
              </div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon"><Globe size={16} /></div>
              <div className="footer-contact-text">
                <strong>Website</strong>
                www.dcpehvpm.org
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} DCPE HVPM Amravati — ERP Portal. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
