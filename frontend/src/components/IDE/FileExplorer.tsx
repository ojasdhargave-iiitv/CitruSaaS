import React from 'react';
import './FileExplorer.css';

const IconFolder = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);

const IconFile = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
);

const IconPlusFile = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
);

const IconPlusFolder = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
);

const IconMore = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
);

const FileExplorer: React.FC = () => {
    const [width, setWidth] = React.useState(260);
    const [isResizing, setIsResizing] = React.useState(false);

    const startResizing = React.useCallback((mouseDownEvent: React.MouseEvent) => {
        setIsResizing(true);
    }, []);

    const stopResizing = React.useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = React.useCallback(
        (mouseMoveEvent: MouseEvent) => {
            if (isResizing) {
                const newWidth = mouseMoveEvent.clientX; // Assuming FileExplorer is anchored at left 0
                if (newWidth >= 200 && newWidth <= 600) { // Min/Max constraints
                    setWidth(newWidth);
                }
            }
        },
        [isResizing]
    );

    React.useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    return (
        <div className="file-explorer" style={{ width: width }}>
            <div
                className={`resize-handle ${isResizing ? 'resizing' : ''}`}
                onMouseDown={startResizing}
            />
            <div className="explorer-header">
                <span className="explorer-title">Files</span>
                <div className="explorer-actions">
                    <div className="action-icon"><IconPlusFile /></div>
                    <div className="action-icon"><IconPlusFolder /></div>
                    <div className="action-icon"><IconMore /></div>
                </div>
            </div>

            <div className="explorer-search">
                <input type="text" placeholder="Search" />
            </div>

            <div className="file-tree-section">
                <div className="tree-item indent-1">
                    <span className="item-icon folder-icon"><IconFolder /></span>
                    .git
                </div>
                <div className="tree-item indent-1">
                    <span className="item-icon folder-icon"><IconFolder /></span>
                    client
                </div>
                <div className="tree-item indent-1">
                    <span className="item-icon folder-icon"><IconFolder /></span>
                    script
                </div>
                <div className="tree-item indent-1">
                    <span className="item-icon folder-icon"><IconFolder /></span>
                    server
                </div>
                <div className="tree-item indent-1">
                    <span className="item-icon folder-icon"><IconFolder /></span>
                    shared
                </div>
                <div className="tree-item indent-1">
                    <span className="item-icon file-icon"><IconFile /></span>
                    .gitignore
                </div>
                <div className="tree-item indent-1">
                    <span className="item-icon file-icon icon-json"><IconFile /></span>
                    components.json
                </div>
                <div className="tree-item indent-1">
                    <span className="item-icon file-icon icon-ts"><IconFile /></span>
                    drizzle.config.ts
                </div>
                <div className="tree-item indent-1">
                    <span className="item-icon file-icon icon-js"><IconFile /></span>
                    postcss.config.js
                </div>
                <div className="tree-item indent-1">
                    <span className="item-icon file-icon icon-ts"><IconFile /></span>
                    tailwind.config.ts
                </div>
                <div className="tree-item indent-1">
                    <span className="item-icon file-icon icon-json"><IconFile /></span>
                    tsconfig.json
                </div>
                <div className="tree-item indent-1">
                    <span className="item-icon file-icon icon-ts"><IconFile /></span>
                    vite.config.ts
                </div>
            </div>

            <div className="file-tree-section">
                <div className="section-label">Packager files</div>
                <div className="tree-item indent-1">
                    <span className="item-icon folder-icon"><IconFolder /></span>
                    node_modules
                </div>
                <div className="tree-item indent-1">
                    <span className="item-icon file-icon icon-json"><IconFile /></span>
                    package-lock.json
                </div>
                <div className="tree-item indent-1">
                    <span className="item-icon file-icon icon-json"><IconFile /></span>
                    package.json
                </div>
            </div>

            <div className="file-tree-section">
                <div className="section-label">Config files</div>
                <div className="tree-item indent-1">
                    <span className="item-icon file-icon"><IconFile /></span>
                    .replit
                </div>
            </div>

        </div>
    );
};

export default FileExplorer;
