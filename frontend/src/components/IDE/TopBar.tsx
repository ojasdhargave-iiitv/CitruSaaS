import React, { useState, useEffect } from 'react';
import './TopBar.css';
import { frameworks, Framework } from '../../types/config';
import AddModulesModal from '../AddModulesModal/AddModulesModal';

const IconLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
);

const IconEye = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const IconTerminal = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
);

const IconCode = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
);

const IconX = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const IconPlus = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const IconLock = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

const IconRefresh = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
);

const IconBug = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="6" x2="23" y2="18"></line><line x1="6" y1="18" x2="6" y2="21"></line><line x1="14" y1="18" x2="14" y2="21"></line></svg>
); // Using similar icon for settings/debug as placeholder

const TopBar: React.FC = () => {
    const [projectName, setProjectName] = useState("User's App");
    const [currentFramework, setCurrentFramework] = useState<Framework | null>(null);
    const [isAddModulesModalOpen, setIsAddModulesModalOpen] = useState(false);

    useEffect(() => {
        const fetchProjectInfo = async () => {
            const currentProjectId = localStorage.getItem('currentProjectId');
            if (currentProjectId) {
                try {
                    const res = await fetch(`http://localhost:5000/api/projects/${currentProjectId}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.name) setProjectName(data.name);
                        if (data.framework) {
                            const fw = frameworks.find(f => f.name === data.framework) || null;
                            setCurrentFramework(fw);
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch project info", err);
                }
            }
        };

        fetchProjectInfo();

        const handleProjectChange = () => fetchProjectInfo();
        window.addEventListener('projectChange', handleProjectChange);

        return () => window.removeEventListener('projectChange', handleProjectChange);
    }, []);

    const handleDownloadZip = () => {
        const currentProjectId = localStorage.getItem('currentProjectId');
        if (currentProjectId) {
            window.open(`http://localhost:5000/api/files/download?projectId=${currentProjectId}`, '_blank');
        } else {
            alert('No project is currently loaded.');
        }
    };

    return (
        <div className="ide-top-bar">
            {/* Left: Breadcrumbs */}
            <div className="top-bar-left" onClick={() => window.location.href = '/'}>
                <IconLogo />
                <div className="app-breadcrumb">
                    <span>/</span>
                    <span className="app-name" >{projectName}</span>
                    <IconLock />
                </div>
            </div>

            {/* Center: Tabs */}
            <div className="top-bar-center">
                <div className="tabs-row">
                    {/* <button className="tab-btn">
                        <IconEye />
                        Preview
                        <span className="tab-close"><IconX /></span>
                    </button> */}
                    <button className="tab-btn">
                        <IconTerminal />
                        Console
                        <span className="tab-close"><IconX /></span>
                    </button>
                    <button className="tab-btn active">
                        <IconCode />
                        Code Editor
                        <span className="tab-close"><IconX /></span>
                    </button>
                    <button className="new-tab-btn" title="New Tab" aria-label="New Tab">
                        <IconPlus />
                    </button>
                </div>
            </div>

            {/* Right: Controls */}
            <div className="top-bar-right">
                <div className="path-input-group">
                    <input type="text" className="path-input" defaultValue="/" placeholder="Path" aria-label="Path input" />
                    <button className="refresh-btn" title="Refresh" aria-label="Refresh">
                        <IconRefresh />
                    </button>
                </div>
                <button className="icon-btn" title="Settings" aria-label="Settings">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </button>
                <button className="publish-btn" title="Add Modules" aria-label="Add Modules" onClick={() => setIsAddModulesModalOpen(true)}>Add Modules</button>
                <button className="publish-btn" title="zip" aria-label="zip" onClick={handleDownloadZip}>Download ZIP</button>
            </div>
            
            <AddModulesModal 
                isOpen={isAddModulesModalOpen} 
                onClose={() => setIsAddModulesModalOpen(false)} 
                framework={currentFramework} 
            />
        </div>
    );
};

export default TopBar;
