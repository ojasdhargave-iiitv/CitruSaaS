import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../services/api';

const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const IconGlobe = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const IconBook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const IconBox = () => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const IconLogo = () => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchSidebarProjects = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/projects?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch sidebar projects", error);
      }
    };
    fetchSidebarProjects();
  }, []);

  const handleProjectClick = async (projectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      if (response.ok) {
        localStorage.setItem('currentProjectId', projectId);
        navigate('/builder');
      }
    } catch (error) {
      console.error("Failed to load project", error);
    }
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <div className="logo-container">
            <IconLogo />
            <div style={{ marginLeft: 'auto', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
            </div>
        </div>
        
        <div className="user-account">
          <div className="user-avatar">
            <IconUsers />
          </div>
          <div className="user-name">User's Account</div>
        </div>

        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="nav-icon"><IconHome /></span>
          Home
        </Link>

        <div className="search-bar">
          <IconSearch />
          <span>Search</span>
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-title">Projects</div>
        <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="nav-icon"><IconGrid /></span>
          All Projects
        </Link>
        {projects.map(p => (
          <div key={p.id} className="nav-item" style={{ paddingLeft: '40px', fontSize: '13px', cursor: 'pointer' }} onClick={() => handleProjectClick(p.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
          </div>
        ))}
        <div className="nav-item">
          <span className="nav-icon"><IconUsers /></span>
          Shared with me
        </div>
        <div className="nav-item">
          <span className="nav-icon"><IconStar /></span>
          Starred
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-title">Resources</div>
        <div className="nav-item">
          <span className="nav-icon"><IconGlobe /></span>
          Explore
        </div>
        <div className="nav-item">
          <span className="nav-icon"><IconBook /></span>
          Learn
        </div>
        <div className="nav-item">
          <span className="nav-icon"><IconBox /></span>
          Template
        </div>
      </div>

      <div className="bottom-card">
        <div className="card-icon-row">
            <h4>Share</h4>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
        </div>
        <p>Get 10 credits for each share</p>
      </div>

      <div className="bottom-card" style={{ background: '#1e1f24' }}>
        <div className="card-icon-row">
            <div>
                <h4>100 credit left only</h4>
                <p>Upgrade to Pro noww</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        </div>
      </div>

      <div className="copyright">
        © 2025 IIITV - All rights reserved.
      </div>
    </div>
  );
};

export default Sidebar;
