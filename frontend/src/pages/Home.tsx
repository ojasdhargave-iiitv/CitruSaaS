import { API_BASE_URL } from '../services/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import CreateProjectModal from '../components/CreateProjectModal/CreateProjectModal';
import PremiumOverlay from '../components/PremiumOverlay/PremiumOverlay';
import AuthModal from '../components/AuthModal/AuthModal';
import { DodoPayments } from "dodopayments-checkout";
import { frameworks, Framework } from '../types/config';
import './Home.css';

// Simple Icons for frameworks (Moved to separate file in real app, but keeping here for simplicity as requested)
const IconPython = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#3776AB" />
        <path d="M12 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="#FFD43B" />
    </svg>
);

const IconHtml = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E34F26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 2l2 18 8 4 8-4 2-18H2z"></path>
        <path d="M12 18l-5-1.5-.5-6h11"></path>
    </svg>
);

const IconNode = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#339933" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2"></polygon>
        <path d="M12 22V12"></path>
        <path d="M12 12L2 7"></path>
        <path d="M12 12l10-5"></path>
    </svg>
);

const IconCpp = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00599C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
    </svg>
);

const IconJava = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007396" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
);

const IconC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A8B9CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M14 8h-4v8h4"></path>
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

// Helper to get icon by ID
const getIcon = (id: string) => {
    switch (id) {
        case 'python': return <IconPython />;
        case 'html': return <IconHtml />;
        case 'node': return <IconNode />;
        case 'cpp': return <IconCpp />;
        case 'java': return <IconJava />;
        case 'c': return <IconC />;
        default: return <IconNode />;
    }
};

const Home: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPremiumOverlayOpen, setIsPremiumOverlayOpen] = useState(false);
    const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const navigate = useNavigate();

    const fetchProjects = async () => {
        setIsLoadingProjects(true);
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setProjects([]);
                setIsLoadingProjects(false);
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
            setIsLoadingProjects(false);
        }
    };

    useEffect(() => {
        fetchProjects();

        // Check if returning from Dodo Payments checkout
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.has('session_id') || queryParams.has('payment_id')) {
            // Webhook handler in the backend will automatically upgrade the user asynchronously.
            // Just clear the URL params for a clean UI.
            window.history.replaceState({}, document.title, "/");
        }
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

    const openAuth = (mode: 'login' | 'signup') => {
        setAuthMode(mode);
        setIsAuthOpen(true);
    };

    const handleFrameworkClick = (framework: Framework) => {
        if (framework.isPremium && localStorage.getItem('isPremium') !== 'true') {
            setIsPremiumOverlayOpen(true);
            return;
        }
        setSelectedFramework(framework);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedFramework(null), 300);
    };

    const handleSubscriptionClick = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/dodo/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_cart: [
                        { product_id: import.meta.env.VITE_DODO_PRODUCT_ID, quantity: 1 }
                    ],
                    billing: {
                        city: "San Francisco",
                        country: "US",
                        state: "CA",
                        street: "123 Main St",
                        zipcode: "94105"
                    },
                    customer: {
                        identifier: localStorage.getItem('userId') || 'guest'
                    }
                })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.checkout_url) {
                    DodoPayments.Initialize({
                        mode: import.meta.env.MODE === "development" ? "test" : "live", 
                        displayType: "overlay",
                        onEvent: (event: any) => {
                            console.log("Checkout event:", event);
                        },
                    });
                    DodoPayments.Checkout.open({ checkoutUrl: data.checkout_url });
                }
            } else {
                console.error("Error from checkout endpoint:", await response.text());
            }
        } catch (error) {
            console.error("Failed to start checkout", error);
        }
    };

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('token'));
    }, [isAuthOpen]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('currentProjectId');
        localStorage.removeItem('isPremium');
        setIsLoggedIn(false);
        window.location.reload();
    };

    return (
        <div className="home-container">
            <Sidebar />

            <main className="main-content">
                <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div className="top-bar-left">
                        <button className="btn btn-ghost" onClick={handleSubscriptionClick} style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontWeight: 'bold' }}>Subscriptions</button>
                    </div>

                    <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isLoggedIn ? (
                            <>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>
                                </div>
                                <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn-ghost" onClick={() => openAuth('login')}>Sign In</button>
                                <button className="btn btn-ghost" onClick={() => openAuth('signup')}>Get Started</button>
                            </>
                        )}
                    </div>
                </div>

                <div className="hero-section">
                    <h1 className="hero-title">
                        What will you <span className="highlight-green">Build</span> today?
                    </h1>
                </div>

                {projects.length > 0 && (
                    <div className="recent-projects-section">
                        <h2 className="section-title">Recent Projects</h2>
                        <div className="projects-grid">
                            {projects.map((project) => (
                                <div key={project.id} className="project-card" onClick={() => handleProjectClick(project.id)}>
                                    <div className="project-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                    </div>
                                    <div className="project-info">
                                        <h3>{project.name}</h3>
                                        <p>{new Date(project.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="section-header">
                    <div className="section-title-row">
                        <div>
                            <h2 className="section-title">Developer Frameworks</h2>
                            <p className="section-subtitle">
                                Developer frameworks are advanced coding stacks that can be used to start your next project.
                            </p>
                            <a href="#" className="link-blue">How to publish a Framework</a>
                        </div>

                        <div className="action-row">
                            <button className="btn-create">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Create
                            </button>
                            <div className="search-input-wrapper">
                                <input type="text" placeholder="Search Frameworks" />
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="frameworks-grid">
                    {frameworks.map((fw) => (
                        <div key={fw.id} className="framework-card" onClick={() => handleFrameworkClick(fw)}>
                            <div className="card-header">
                                <div className="framework-icon-wrapper">
                                    {getIcon(fw.id)}
                                </div>
                                <button className="btn-use-framework">
                                    <IconBranch />
                                    Use Framework
                                </button>
                            </div>

                            <div className="card-title">
                                {fw.name}
                                <span className="verified-badge">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                                    </svg>
                                </span>
                                {fw.isPremium && (
                                    <span style={{marginLeft: 8, fontSize: '10px', backgroundColor: '#fbbf24', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>
                                        PREMIUM
                                    </span>
                                )}
                            </div>

                            <p className="card-description">{fw.description}</p>

                            <div className="card-footer">
                                <div className="footer-left">
                                    <div className="citrusaas-icon"></div>
                                    <span>CitruSaaS</span>
                                </div>
                                <div>{fw.installs}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <PremiumOverlay
                isOpen={isPremiumOverlayOpen}
                onClose={() => setIsPremiumOverlayOpen(false)}
                onSubscribe={handleSubscriptionClick}
            />

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                framework={selectedFramework}
            />

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialMode={authMode}
            />
        </div>
    );
};

export default Home;
