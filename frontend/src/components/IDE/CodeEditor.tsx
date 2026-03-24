import React, { useState, useEffect } from 'react';
import './CodeEditor.css';
import { ActiveFile } from './IDELayout';

interface CodeEditorProps {
    activeFile: ActiveFile | null;
    onSave: (content: string) => void;
}

const IconAI = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);

const IconBraces = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
);

const IconAlert = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e06c75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

const IconWarning = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d19a66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

const CodeEditor: React.FC<CodeEditorProps> = ({ activeFile, onSave }) => {
    const [code, setCode] = useState("");
    const [lineCount, setLineCount] = useState(1);

    useEffect(() => {
        if (activeFile) {
            setCode(activeFile.content);
        } else {
            setCode("// Select a file to view content");
        }
    }, [activeFile]);

    useEffect(() => {
        const lines = code.split('\n').length;
        setLineCount(lines);
    }, [code]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            e.stopPropagation();
            if (activeFile) {
                onSave(code);
            }
        }
    };

    return (
        <div className="code-editor-container" onKeyDown={handleKeyDown} tabIndex={0}>
            <div className="editor-canvas">
                <div className="code-wrapper">
                    <div className="line-numbers">
                        {Array.from({ length: lineCount }).map((_, i) => (
                            <div key={i} className="line-number-item">
                                {i + 1}
                            </div>
                        ))}
                    </div>
                    <textarea
                        className="code-input-area"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        disabled={!activeFile}
                        style={{ height: `${lineCount * 1.6}em`, minHeight: '100%' }}
                    />
                </div>
            </div>

            <div className="editor-footer">
                <div className="footer-item">
                    <IconAI />
                    AI
                </div>
                <div className="footer-item">
                    <IconBraces />
                    {activeFile ? activeFile.name.split('.').pop()?.toUpperCase() : 'TEXT'}
                </div>
                <div className="footer-item">
                    <IconAlert />
                    0
                </div>
                <div className="footer-item">
                    <IconWarning />
                    0
                </div>
                <div className="footer-item">
                    <span className="status-dot"></span>
                    Ln {lineCount}, Col 1
                </div>
                <div className="footer-item">
                    Spaces: 2
                </div>
                <div className="footer-item" onClick={() => activeFile && onSave(code)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    Save (Ctrl+S)
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
