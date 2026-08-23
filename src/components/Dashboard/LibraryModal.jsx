import React, { useState } from 'react';
import {
  Library, BookOpen, Search, Clock, Calendar, CheckCircle2,
  AlertCircle, X, Bookmark, ExternalLink, Sparkles, Filter,
  ShieldCheck, ArrowRight, Hash, BookmarkCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Dashboard.css';

export function LibraryModal({ currentUser, onClose }) {
  if (!currentUser) return null;

  const [activeTab, setActiveTab] = useState('issued'); // 'issued' | 'catalog' | 'eresources'
  const [issuedBooks, setIssuedBooks] = useState([
    {
      id: 'b1',
      accessionNo: 'DCPE-LIB-8842',
      title: 'The C Programming Language (2nd Edition)',
      author: 'Brian W. Kernighan, Dennis M. Ritchie',
      issuedDate: '10 Feb 2026',
      dueDate: '28 Feb 2026',
      shelfLocation: 'Rack 2A (CS Section)',
      status: 'active',
      fine: 0,
    },
    {
      id: 'b2',
      accessionNo: 'DCPE-LIB-9120',
      title: 'Physiology of Sport and Exercise',
      author: 'W. Larry Kenney, Jack H. Wilmore',
      issuedDate: '14 Feb 2026',
      dueDate: '02 Mar 2026',
      shelfLocation: 'Rack 1C (Sports Science)',
      status: 'active',
      fine: 0,
    },
  ]);
  const [catalog, setCatalog] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [reservedIds, setReservedIds] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const { data, error } = await supabase.from('library_books').select('*');
        if (data && data.length > 0) {
          const mapped = data.map((b) => ({
            id: b.id,
            isbn: b.isbn,
            title: b.title,
            author: b.author,
            category: b.category,
            copiesAvailable: b.copies_available,
            totalCopies: b.total_copies,
            shelf: b.shelf,
          }));
          setCatalog(mapped);
        }
      } catch (err) {
        console.error('Error fetching library books:', err);
      }
    };
    loadBooks();
  }, []);

  const handleRenew = (bookId) => {
    setIssuedBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, dueDate: '15 Mar 2026' } : b))
    );
    setToastMessage('✅ Book renewed successfully! New due date: 15 Mar 2026');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReserve = (book) => {
    if (reservedIds.includes(book.id)) return;
    setReservedIds((prev) => [...prev, book.id]);
    setToastMessage(`🎉 Reserved "${book.title}". Pick it up at Central Library Counter within 24 hours.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredCatalog = catalog.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);
    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="printable-document-container"
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '750px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Top Control Bar */}
        <div
          style={{
            padding: '16px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)' }}>
            <Library size={18} color="var(--primary)" />
            DCPE Central Library & E-Knowledge Center
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            padding: '12px 24px',
            background: 'white',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            gap: '8px',
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'issued' ? 'btn-primary' : 'btn-white'}`}
            style={{ borderRadius: '20px' }}
            onClick={() => setActiveTab('issued')}
          >
            <BookOpen size={14} /> My Issued Books ({issuedBooks.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'catalog' ? 'btn-primary' : 'btn-white'}`}
            style={{ borderRadius: '20px' }}
            onClick={() => setActiveTab('catalog')}
          >
            <Search size={14} /> Search Library Catalog
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'eresources' ? 'btn-primary' : 'btn-white'}`}
            style={{ borderRadius: '20px' }}
            onClick={() => setActiveTab('eresources')}
          >
            <ExternalLink size={14} /> E-Journals & DELNET
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div style={{ background: '#ecfdf5', color: '#065f46', padding: '10px 24px', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #a7f3d0' }}>
            {toastMessage}
          </div>
        )}

        {/* Scrollable Content */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {/* ─────────────────────────────────────────────────────────────
              TAB 1: MY ISSUED BOOKS
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'issued' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                    Active Borrowed Books
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Borrowing Limit: <strong>{issuedBooks.length} / 4 Books</strong> • Student Card: <strong>{currentUser.prn}</strong>
                  </p>
                </div>
                <div style={{ background: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Outstanding Fine: ₹0.00
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {issuedBooks.map((book) => (
                  <div
                    key={book.id}
                    style={{
                      background: 'var(--bg-body)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                          {book.accessionNo}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          📍 {book.shelfLocation}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>
                        {book.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                        Author(s): <strong>{book.author}</strong>
                      </p>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px' }}>
                        <span>Issued: <strong>{book.issuedDate}</strong></span>
                        <span style={{ color: '#d97706', fontWeight: 700 }}>
                          ⏰ Due Date: <strong>{book.dueDate}</strong>
                        </span>
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        className="btn btn-outline-dark btn-sm"
                        onClick={() => handleRenew(book.id)}
                      >
                        Renew (+14 Days)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: SEARCH CATALOG
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'catalog' && (
            <div>
              {/* Search Box */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by book title, author, or ISBN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '38px', height: '42px', fontSize: '13px' }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                </div>
                <select
                  className="form-control"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ width: '180px', height: '42px', fontSize: '13px' }}
                >
                  <option value="all">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Physical Education">Physical Education</option>
                </select>
              </div>

              {/* Books List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredCatalog.map((book) => {
                  const isReserved = reservedIds.includes(book.id);
                  return (
                    <div
                      key={book.id}
                      style={{
                        padding: '16px',
                        borderRadius: '14px',
                        border: '1px solid var(--border-light)',
                        background: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', background: 'rgba(79, 70, 229, 0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                          {book.category}
                        </span>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '6px 0 2px' }}>
                          {book.title}
                        </h4>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          By {book.author} • ISBN: {book.isbn}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                          📍 Location: <strong>{book.shelf}</strong> • Available: <strong>{book.copiesAvailable} of {book.totalCopies} copies</strong>
                        </div>
                      </div>

                      <div>
                        {isReserved ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#15803d', fontSize: '12px', fontWeight: 700, background: '#dcfce7', padding: '6px 12px', borderRadius: '10px' }}>
                            <BookmarkCheck size={14} /> Reserved
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleReserve(book)}
                          >
                            <Bookmark size={13} /> Reserve Book
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: E-RESOURCES & DIGITAL REPOSITORIES
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'eresources' && (
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '12px' }}>
                Institutional Digital Databases & E-Journals
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                DCPE HVPM students enjoy campus-wide licensed access to premier national & international research databases.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { name: 'DELNET Digital Library Network', desc: 'Over 3.5 crore catalogue records and full text articles.', tag: 'National Access' },
                  { name: 'IEEE Xplore Digital Library', desc: 'Leading repository in Computer Science & Information Tech.', tag: 'CS & AI Journals' },
                  { name: 'Shodhganga (INFLIBNET)', desc: 'Indian electronic theses and dissertation repository.', tag: 'Doctoral Theses' },
                  { name: 'International Journal of Physical Education', desc: 'Peer-reviewed research in sports kinesiology & biomechanics.', tag: 'Sports Science' },
                ].map((res, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-body)',
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                      {res.tag}
                    </span>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '8px 0 4px', color: 'var(--text-heading)' }}>
                      {res.name}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px' }}>
                      {res.desc}
                    </p>
                    <a
                      href="#eresources"
                      onClick={(e) => { e.preventDefault(); alert(`Opening authenticated DCPE institutional portal for ${res.name}...`); }}
                      style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      Launch Portal <ArrowRight size={13} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
