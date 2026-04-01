import { API_BASE_URL } from '../services/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import './Home.css'; // Reuse common styles
import './Dashboard.css';

const IconNode = () => (
    <div className="framework-icon-bg">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="12 2 2 7 12 12 22 7 12 2"></polyline>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
    </div>
);

const IconCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
    </svg>
);

const IconBranch = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="15" width="6" height="6" rx="1"></rect>
      <line x1="6" y1="15" x2="6" y2="9"></line>
      <circle cx="6" cy="6" r="3"></circle>
      <circle cx="18" cy="18" r="3"></circle>
      <path d="M18 15v-3a3 3 0 0 0-3-3h-6"></path>
  </svg>
);

const Dashboard = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setProjects([]);
                setIsLoading(false);
                return;
            }
            const response = await fetch(`${API_BASE_URL}/projects?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
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
        <div className="home-container">
            <Sidebar />
            <main className="main-content">
                <div className="section-header" style={{ marginTop: '40px' }}>
                    <div className="section-title-row">
                        <div>
                            <h2 className="section-title">All Projects</h2>
                            <p className="section-subtitle">
                                Manage and edit all your created projects here.
                            </p>
                        </div>
                        <div className="search-input-wrapper">
                            <input type="text" placeholder="Search Projects" />
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading-projects">Loading your projects...</div>
                ) : (
                    <div className="projects-grid-container">
                        {projects.length > 0 ? (
                            <div className="dashboard-projects-grid">
                                {projects.map((project) => (
                                    <div key={project.id} className="premium-project-card" onClick={() => handleProjectClick(project.id)}>
                                        <div className="card-top">
                                            <IconNode />
                                            <button className="btn-open-project">
                                                <IconBranch />
                                                Open Project
                                            </button>
                                        </div>
                                        
                                        <div className="card-body">
                                            <div className="project-title-row">
                                                <h3 className="project-name">{project.name}</h3>
                                                <IconCheck />
                                            </div>
                                            <p className="project-desc">
                                                {project.description || "A custom CitruSaaS project built with " + (project.framework || "the builder") + "."}
                                            </p>
                                        </div>

                                        <div className="card-divider"></div>

                                        <div className="card-bottom-info">
                                            <div className="author-info">
                                                <div className="orange-dot"></div>
                                                <span>CitruSaaS</span>
                                            </div>
                                            <div className="stat-info">
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-projects">
                                <p>You haven't created any projects yet.</p>
                                <button className="btn-create" onClick={() => navigate('/')}>Create Your First Project</button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
