import React from 'react';
import FileExplorer from './FileExplorer';
import TopBar from './TopBar';
import CodeEditor from './CodeEditor';
import './IDELayout.css';

const IDELayout: React.FC = () => {
    return (
        <div className="ide-layout">
            <FileExplorer />
            <div className="ide-content-area">
                <TopBar />
                <CodeEditor />
            </div>
        </div>
    );
};

export default IDELayout;
