// src/components/BfsVisualizer/ControlPanel.tsx
import React from 'react';
import {
    getSpeedPresets,
    formatAnimationDelay,
    constrainAnimationDelay,
    DEFAULT_ANIMATION_CONFIG
} from '../../utils/animationUtils';
import { DEFAULT_START_NODE } from '../../data/graphs/sampleGraphs';

interface ControlPanelProps {
    isAnimating: boolean;
    startBfs: (startNode: string) => void;
    stopBfs: () => void;
    resetBfs: () => void;
    animationDelay: number;
    setAnimationDelay: (delay: number) => void;
    queue: string[];
    visitedNodes: string[];
    currentNode: string | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
        isAnimating,
        startBfs,
        stopBfs,
        resetBfs,
        animationDelay,
        setAnimationDelay,
        queue,
        visitedNodes,
        currentNode,
    }) => {
    const speedPresets = getSpeedPresets();

    const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setAnimationDelay(constrainAnimationDelay(value));
    };

    return (
        <div className="control-panel">
            <h2>BFS Visualizer Control Panel</h2>
            <div className="controls">
                <button
                    onClick={() => startBfs(DEFAULT_START_NODE)}
                    disabled={isAnimating}
                >
                    Start BFS
                </button>
                <button onClick={stopBfs} disabled={!isAnimating}>
                    Stop BFS
                </button>
                <button onClick={resetBfs} disabled={isAnimating}>
                    Reset
                </button>
            </div>

            <div className="settings">
                <label>
                    Animation Delay: {formatAnimationDelay(animationDelay)}
                    <input
                        type="range"
                        value={animationDelay}
                        onChange={handleDelayChange}
                        min={DEFAULT_ANIMATION_CONFIG.minDelay}
                        max={DEFAULT_ANIMATION_CONFIG.maxDelay}
                        step={DEFAULT_ANIMATION_CONFIG.stepSize}
                    />
                </label>
                <div className="presets">
                    {speedPresets.map(preset => (
                        <button
                            key={preset.label}
                            onClick={() => setAnimationDelay(preset.value)}
                            className={animationDelay === preset.value ? 'active' : ''}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="status">
                <p>Current Node: {currentNode}</p>
                <p>Visited Nodes: {visitedNodes.join(', ')}</p>
                <p>Queue: {queue.join(', ')}</p>
            </div>
        </div>
    );
};

export default ControlPanel;