import React, { useState } from 'react';
import { formatAnimationDelay } from '../../utils/animationUtils';

interface DebugPanelProps {
    isAnimating: boolean;
    queueLength: number;
    visitedLength: number;
    totalNodes: number;
    animationDelay: number;
}

const DebugPanel: React.FC<DebugPanelProps> = (props) => {
    const [showDebugInfo, setShowDebugInfo] = useState(true);

    const animationSpeed = formatAnimationDelay(props.animationDelay);
    const progress = props.totalNodes > 0
        ? Math.round((props.visitedLength / props.totalNodes) * 100)
        : 0;

    return (
        <div className="debug-panel">
            <div className="debug-header" onClick={() => setShowDebugInfo(!showDebugInfo)}>
                <h2>Algorithm Debug</h2>
                <span>{showDebugInfo ? '▲' : '▼'}</span>
            </div>

            {showDebugInfo && (
                <div className="debug-info">
                    <div className="status-indicator" style={{
                        backgroundColor: props.isAnimating ? '#4caf50' : '#f44336',
                        padding: '8px',
                        borderRadius: '4px',
                        color: 'white',
                        marginBottom: '10px',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <span><strong>Status:</strong> {props.isAnimating ? 'Running' : 'Stopped'}</span>
                        {props.isAnimating && <span className="pulse-dot">●</span>}
                    </div>

                    <p><strong>Queue Length:</strong> {props.queueLength}</p>
                    <p><strong>Visited Nodes:</strong> {props.visitedLength}</p>

                    <div className="progress-bar-container" style={{
                        height: '20px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        margin: '10px 0'
                    }}>
                        <div className="progress-bar" style={{
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: '#2196f3',
                            transition: 'width 0.3s ease'
                        }}></div>
                    </div>

                    <p><strong>Progress:</strong> {progress}% ({props.visitedLength}/{props.totalNodes})</p>
                    <p><strong>Animation Speed:</strong> {animationSpeed}</p>
                </div>
            )}
        </div>
    );
};

export default DebugPanel;