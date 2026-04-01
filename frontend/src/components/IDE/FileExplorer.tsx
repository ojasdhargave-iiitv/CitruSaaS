import { API_BASE_URL } from '../../services/api';
import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import './FileExplorer.css';

interface FileExplorerProps {
    onFileSelect: (filePath: string) => void;
}

interface FileEntry {
    name: string;
    type: 'file' | 'directory';
    path: string;
}

const IconFolder = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);

const IconFile = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
);

const IconPlusFile = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
);

const IconPlusFolder = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
);

const IconMore = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
);

const IconChevronRight = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

const IconChevronDown = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

const getFileIconClass = (filename: string) => {
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'icon-ts';
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'icon-js';
    if (filename.endsWith('.json')) return 'icon-json';
    if (filename.endsWith('.css')) return 'icon-css';
    if (filename.endsWith('.html')) return 'icon-html';
    return '';
};

const TreeNode: React.FC<{
    file: FileEntry;
    onFileSelect: (path: string) => void;
    onSelect: (file: FileEntry) => void;
    selectedPath: string | null;
    level: number;
    refreshTrigger: number;
}> = ({ file, onFileSelect, onSelect, selectedPath, level, refreshTrigger }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [children, setChildren] = useState<FileEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchChildren = async () => {
        if (file.type !== 'directory') return;
        setIsLoading(true);
        const projectId = localStorage.getItem('currentProjectId');
        try {
            const response = await fetch(`${API_BASE_URL}/files/list?dirPath=${encodeURIComponent(file.path)}&projectId=${projectId}`);
            const data = await response.json();
            if (response.ok) {
                setChildren(data.files);
            }
        } catch (error) {
            console.error("Error fetching files:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchChildren();
        }
    }, [isOpen, refreshTrigger]);

    const isSelected = selectedPath === file.path;

    const toggleOpen = async (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(file);
        if (file.type === 'directory') {
            setIsOpen(!isOpen);
        } else {
            onFileSelect(file.path);
        }
    };

    return (
        <div>
            <div
                className={`tree-item ${isSelected ? 'selected' : ''}`}
                onClick={toggleOpen}
                style={{ paddingLeft: `${level * 16}px` }}
            >
                <div style={{ display: 'flex', alignItems: 'center', width: '16px', justifyContent: 'center', marginRight: '4px' }}>
                    {file.type === 'directory' ? (isOpen ? <IconChevronDown /> : <IconChevronRight />) : null}
                </div>
                <span className={`item-icon ${file.type === 'directory' ? 'folder-icon' : getFileIconClass(file.name)}`}>
                    {file.type === 'directory' ? <IconFolder /> : <IconFile />}
                </span>
                <span style={{ color: file.type === 'directory' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                    {file.name}
                </span>
            </div>
            {isOpen && file.type === 'directory' && (
                <div>
                    {isLoading && children.length === 0 ? (
                        <div className="tree-item" style={{ paddingLeft: `${(level + 1) * 16 + 20}px`, color: '#666', fontSize: '12px' }}>Loading...</div>
                    ) : (
                        children.map(child => (
                            <TreeNode 
                                key={child.path} 
                                file={child} 
                                onFileSelect={onFileSelect} 
                                onSelect={onSelect}
                                selectedPath={selectedPath}
                                level={level + 1} 
                                refreshTrigger={refreshTrigger}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect }) => {
    const [width, setWidth] = useState(260);
    const [isResizing, setIsResizing] = useState(false);
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [selectedItem, setSelectedItem] = useState<FileEntry | null>(null);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const { showToast } = useToast();

    const fetchFiles = async () => {
        const projectId = localStorage.getItem('currentProjectId');
        try {
            const response = await fetch(`${API_BASE_URL}/files/list?projectId=${projectId}`);
            const data = await response.json();
            if (response.ok) {
                setFiles(data.files);
            }
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    useEffect(() => {
        fetchFiles();

        const handleRefresh = () => {
            setRefreshCounter(prev => prev + 1);
            fetchFiles();
        };

        window.addEventListener('refreshFiles', handleRefresh);
        return () => window.removeEventListener('refreshFiles', handleRefresh);
    }, []);

    const startResizing = React.useCallback((mouseDownEvent: React.MouseEvent) => {
        setIsResizing(true);
    }, []);

    const stopResizing = React.useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = React.useCallback(
        (mouseMoveEvent: MouseEvent) => {
            if (isResizing) {
                const newWidth = mouseMoveEvent.clientX;
                if (newWidth >= 200 && newWidth <= 600) {
                    setWidth(newWidth);
                }
            }
        },
        [isResizing]
    );

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    const getParentPath = (item: FileEntry | null) => {
        if (!item) return "";
        if (item.type === 'directory') return item.path;
        const parts = item.path.split('/');
        parts.pop();
        return parts.join('/');
    };

    const handleCreateFile = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (!newItemName.trim()) {
                setIsCreatingFile(false);
                return;
            }

            const parentPath = getParentPath(selectedItem);
            const filePath = parentPath ? `${parentPath}/${newItemName}` : newItemName;

            const projectId = localStorage.getItem('currentProjectId');
            try {
                const response = await fetch(`${API_BASE_URL}/files/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filePath, projectId })
                });

                if (response.ok) {
                    setRefreshCounter(prev => prev + 1); // Trigger refresh for all trees
                    await fetchFiles();
                    onFileSelect(filePath);
                    setSelectedItem({ name: newItemName, type: 'file', path: filePath });
                    setIsCreatingFile(false);
                    setNewItemName("");
                } else {
                    const data = await response.json();
                    showToast(data.error || "Failed to create file", "error");
                }
            } catch (error) {
                console.error(error);
            }
        } else if (e.key === 'Escape') {
            setIsCreatingFile(false);
            setNewItemName("");
        }
    };

    const handleCreateFolder = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (!newItemName.trim()) {
                setIsCreatingFolder(false);
                return;
            }

            const parentPath = getParentPath(selectedItem);
            const folderPath = parentPath ? `${parentPath}/${newItemName}` : newItemName;

            const projectId = localStorage.getItem('currentProjectId');
            try {
                const response = await fetch(`${API_BASE_URL}/files/create-folder`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ folderPath, projectId })
                });

                if (response.ok) {
                    setRefreshCounter(prev => prev + 1); // Trigger refresh for all trees
                    await fetchFiles();
                    setSelectedItem({ name: newItemName, type: 'directory', path: folderPath });
                    setIsCreatingFolder(false);
                    setNewItemName("");
                } else {
                    const data = await response.json();
                    showToast(data.error || "Failed to create folder", "error");
                }
            } catch (error) {
                console.error(error);
            }
        } else if (e.key === 'Escape') {
            setIsCreatingFolder(false);
            setNewItemName("");
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        
        const projectId = localStorage.getItem('currentProjectId');
        try {
            const response = await fetch(`${API_BASE_URL}/files/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemPath: selectedItem.path, projectId })
            });

            if (response.ok) {
                setRefreshCounter(prev => prev + 1);
                fetchFiles();
                showToast(`${selectedItem.name} deleted successfully`, "success");
                setSelectedItem(null);
            } else {
                const data = await response.json();
                showToast(data.error || "Failed to delete item", "error");
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' && (selectedItem as any) && document.activeElement?.tagName !== 'INPUT') {
                handleDelete();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [selectedItem]);

    return (
        <div className="file-explorer" style={{ width: width }}>
            <div
                className={`resize-handle ${isResizing ? 'resizing' : ''}`}
                onMouseDown={startResizing}
            />
            <div className="explorer-header" onClick={() => setSelectedItem(null)}>
                <span className="explorer-title">Files</span>
                <div className="explorer-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="action-icon" onClick={() => { setIsCreatingFolder(false); setIsCreatingFile(true); }} title="New File"><IconPlusFile /></div>
                    <div className="action-icon" onClick={() => { setIsCreatingFile(false); setIsCreatingFolder(true); }} title="New Folder"><IconPlusFolder /></div>
                    {/* <div className="action-icon"><IconMore /></div> */}
                </div>
            </div>

            <div className="explorer-search">
                <input type="text" placeholder="Search" />
            </div>

            <div className="file-tree-section">
                {isCreatingFile && (
                    <div className="tree-item indent-1">
                        <span className="item-icon file-icon"><IconFile /></span>
                        <input
                            autoFocus
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={handleCreateFile}
                            onBlur={() => setIsCreatingFile(false)}
                            className="new-file-input"
                            placeholder="File name"
                            title="Enter file name"
                        />
                    </div>
                )}
                {isCreatingFolder && (
                    <div className="tree-item indent-1">
                        <span className="item-icon folder-icon"><IconFolder /></span>
                        <input
                            autoFocus
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={handleCreateFolder}
                            onBlur={() => setIsCreatingFolder(false)}
                            className="new-file-input"
                            placeholder="Folder name"
                            title="Enter folder name"
                        />
                    </div>
                )}
                {files.map((file) => (
                    <TreeNode 
                        key={file.path} 
                        file={file} 
                        onFileSelect={onFileSelect} 
                        onSelect={setSelectedItem}
                        selectedPath={selectedItem?.path || null}
                        level={0} 
                        refreshTrigger={refreshCounter}
                    />
                ))}
            </div>
        </div>
    );
};

export default FileExplorer;
