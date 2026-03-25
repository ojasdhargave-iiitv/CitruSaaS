import { API_BASE_URL } from '../../services/api';
import React, { useState, useEffect } from 'react';
import './CreateProjectModal.css';
import { Framework, Module } from '../../types/config';
import { useNavigate } from 'react-router-dom';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    framework: Framework | null;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, framework }) => {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
    const [pendingModule, setPendingModule] = useState<Module | null>(null);
    const [selectedModuleTypes, setSelectedModuleTypes] = useState<Record<string, 'js' | 'ts'>>({});
    const [isCreating, setIsCreating] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (framework) {
            setModules(framework.modules);
            setSelectedModules([]);
            setPrivacy('public');
        }
    }, [framework]);

    const toggleModule = (module: Module) => {
        const moduleId = module.id;
        setSelectedModules(prev => {
            if (prev.includes(moduleId)) {
                setSelectedModuleTypes(types => {
                    const newTypes = { ...types };
                    delete newTypes[moduleId];
                    return newTypes;
                });
                return prev.filter(id => id !== moduleId);
            } else {
                if (module.requiresFileType) {
                    setPendingModule(module);
                    return prev;
                }
                return [...prev, moduleId];
            }
        });
    };

    const handleFileTypeSelect = (type: 'js' | 'ts') => {
        if (pendingModule) {
            setSelectedModuleTypes(prev => ({ ...prev, [pendingModule.id]: type }));
            setSelectedModules(prev => [...prev, pendingModule.id]);
            setPendingModule(null);
        }
    };

    const handleCreate = async () => {
        setIsCreating(true);
        const userId = localStorage.getItem('userId');
        // Create the project in the DB
        try {
            const res = await fetch(`${API_BASE_URL}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: projectName,
                    description,
                    framework: framework?.name,
                    privacy,
                    userId: userId || null
                })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('currentProjectId', data.id);
                // Dispatch custom event so the current window updates immediately
                window.dispatchEvent(new Event('projectChange'));

                // Initialize the virtual workspace folders
                try {
                    await fetch(`${API_BASE_URL}/files/init`, { 
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ projectId: data.id })
                    });
                } catch (err) {
                    console.error("Failed to init workspace", err);
                }

                // Request backend to copy template files to correct location
                for (const moduleId of selectedModules) {
                    const moduleDef = modules.find(m => m.id === moduleId);
                    if (moduleDef?.requiresFileType) {
                        const ftype = selectedModuleTypes[moduleId];
                        try {
                            await fetch(`${API_BASE_URL}/files/template`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    moduleId,
                                    fileType: ftype,
                                    projectId: data.id
                                })
                            });
                        } catch (err) {
                            console.error("Failed to copy template", err);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Failed to create project in DB", err);
        }

        setIsCreating(false);
        onClose();
        navigate('/builder');
    };

    if (!isOpen || !framework) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Create with {framework.name}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="modal-content">
                    <p style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '24px', lineHeight: '1.5' }}>
                        Developer frameworks are advanced coding stacks that can be used to start your next project.
                    </p>

                    <div className="form-group">
                        <label className="form-label">Name the Project</label>
                        <input
                            type="text"
                            className="form-input"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="my-awesome-project"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your project"
                        />
                    </div>

                    <div className="modules-section">
                        <label className="form-label">Select Modules</label>
                        {modules.length > 0 ? (
                            <div className="modules-grid">
                                {modules.map(module => (
                                    <div
                                        key={module.id}
                                        className={`module-card ${selectedModules.includes(module.id) ? 'selected' : ''}`}
                                        onClick={() => toggleModule(module)}
                                    >
                                        <div className="checkbox">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <span className="module-name">{module.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: '13px', color: '#666', fontStyle: 'italic' }}>No modules available for this framework yet.</p>
                        )}
                    </div>

                    <div className="privacy-section">
                        <label className="form-label">Privacy</label>
                        <div className="privacy-options-grid">
                            <div
                                className={`privacy-option ${privacy === 'public' ? 'active' : ''}`}
                                onClick={() => setPrivacy('public')}
                            >
                                <div style={{ background: '#333', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>TH</div>
                                <div className="privacy-content">
                                    <h4>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                        Public
                                    </h4>
                                    <p>Anyone can fork and make changes</p>
                                </div>
                            </div>
                            <div
                                className={`privacy-option ${privacy === 'private' ? 'active' : ''}`}
                                onClick={() => setPrivacy('private')}
                            >
                                <div style={{ background: '#333', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>TH</div>
                                <div className="privacy-content">
                                    <h4>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        Private
                                    </h4>
                                    <p>Only you can edit and see the app</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="owner-info">
                        Owner :
                        <div className="owner-avatar">TH</div>
                        <span>thenameisojas</span>
                    </div>

                    <div className="footer-actions">
                        <div className="tips-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 12a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        </div>
                        <button className="btn-create-project" onClick={handleCreate} disabled={isCreating}>
                            {isCreating ? (
                                <div className="loader-spinner"></div>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                {pendingModule && (
                    <div className="filetype-popup-overlay" onClick={() => setPendingModule(null)}>
                        <div className="filetype-popup" onClick={e => e.stopPropagation()}>
                            <h3>Select File Type for {pendingModule.name}</h3>
                            <div className="filetype-options">
                                <button className="filetype-btn js-btn" onClick={() => handleFileTypeSelect('js')}>JavaScript (.js)</button>
                                <button className="filetype-btn ts-btn" onClick={() => handleFileTypeSelect('ts')}>TypeScript (.ts)</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateProjectModal;
