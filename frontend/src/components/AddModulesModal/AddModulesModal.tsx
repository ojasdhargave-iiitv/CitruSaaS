import React, { useState, useEffect } from 'react';
import '../CreateProjectModal/CreateProjectModal.css';
import { Framework, Module } from '../../types/config';

interface AddModulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    framework: Framework | null;
}

const AddModulesModal: React.FC<AddModulesModalProps> = ({ isOpen, onClose, framework }) => {
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [pendingModule, setPendingModule] = useState<Module | null>(null);
    const [selectedModuleTypes, setSelectedModuleTypes] = useState<Record<string, 'js' | 'ts'>>({});
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (framework) {
            setModules(framework.modules);
            setSelectedModules([]);
        }
    }, [framework, isOpen]);

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

    const handleAdd = async () => {
        setIsAdding(true);
        const currentProjectId = localStorage.getItem('currentProjectId');
        
        if (!currentProjectId) {
            setIsAdding(false);
            return;
        }

        try {
            for (const moduleId of selectedModules) {
                const moduleDef = modules.find(m => m.id === moduleId);
                if (moduleDef?.requiresFileType) {
                    const ftype = selectedModuleTypes[moduleId];
                    await fetch('http://localhost:5000/api/files/template', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            moduleId,
                            fileType: ftype,
                            projectId: currentProjectId
                        })
                    });
                }
            }
            
            // Dispatch custom event to refresh file explorer (we will add this listener in FileExplorer later)
            window.dispatchEvent(new Event('refreshFiles'));
        } catch (err) {
            console.error("Failed to add modules", err);
        }

        setIsAdding(false);
        onClose();
    };

    if (!isOpen || !framework) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Add Modules for {framework.name}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="modal-content">
                    <p style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '24px', lineHeight: '1.5' }}>
                        Select additional modules to add to your existing project.
                    </p>

                    <div className="modules-section">
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
                </div>

                <div className="modal-footer" style={{ justifyContent: 'flex-end', borderTop: 'none', paddingTop: 0 }}>
                    <div className="footer-actions">
                        <button className="btn-create-project" onClick={handleAdd} disabled={isAdding || selectedModules.length === 0}>
                            {isAdding ? (
                                <div className="loader-spinner"></div>
                            ) : (
                                <>
                                    <span style={{ marginRight: '8px' }}>Add Modules</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </>
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

export default AddModulesModal;
