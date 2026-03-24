import React, { useState } from 'react';
import FileExplorer from './FileExplorer';
import TopBar from './TopBar';
import CodeEditor from './CodeEditor';
import { useToast } from '../../contexts/ToastContext';
import './IDELayout.css';

export interface ActiveFile {
    name: string;
    path: string;
    content: string;
}

const IDELayout: React.FC = () => {
    const [activeFile, setActiveFile] = useState<ActiveFile | null>(null);
    const { showToast } = useToast();

    const handleFileSelect = async (filePath: string) => {
        const projectId = localStorage.getItem('currentProjectId');
        try {
            const response = await fetch(`http://localhost:5000/api/files/content?filePath=${encodeURIComponent(filePath)}&projectId=${projectId}`);
            const data = await response.json();
            if (response.ok) {
                setActiveFile({
                    name: filePath.split('/').pop() || '',
                    path: filePath,
                    content: data.content
                });
            } else {
                console.error("Failed to load file:", data.error);
            }
        } catch (error) {
            console.error("Error fetching file:", error);
        }
    };

    const handleSave = async (content: string) => {
        if (!activeFile) return;
        const projectId = localStorage.getItem('currentProjectId');
        try {
            const response = await fetch('http://localhost:5000/api/files/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: activeFile.path, content, projectId })
            });
            if (response.ok) {
                console.log("File saved!");
                showToast("File saved successfully!", "success");
                setActiveFile({ ...activeFile, content });
            } else {
                console.error("Failed to save file");
                showToast("Failed to save file.", "error");
            }
        } catch (error) {
            console.error("Error saving file:", error);
        }
    };

    return (
        <div className="ide-layout">
            <FileExplorer onFileSelect={handleFileSelect} />
            <div className="ide-content-area">
                <TopBar />
                <CodeEditor
                    activeFile={activeFile}
                    onSave={handleSave}
                />
            </div>
        </div>
    );
};

export default IDELayout;
