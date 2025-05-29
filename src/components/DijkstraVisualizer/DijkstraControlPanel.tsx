// src/components/DijkstraVisualizer/DijkstraControlPanel.tsx
import React from 'react';
import {
    getSpeedPresets,
    formatAnimationDelay,
    constrainAnimationDelay,
    DEFAULT_ANIMATION_CONFIG
} from '../../utils/animationUtils';
import { DEFAULT_DIJKSTRA_START_NODE } from '../../data/graphs/weightedGraphs';

interface DijkstraControlPanelProps {
    isAnimating: boolean;
    startDijkstra: (startNode: string) => void;
    stopDijkstra: () => void;
    resetDijkstra: () => void;
    animationDelay: number;
    setAnimationDelay: (delay: number) => void;
    visitedNodes: string[];
    unvisitedNodes: string[];
    currentNode: string | null;
    distances: Record<string, number>;
    previous: Record<string, string | null>;
}

const DijkstraControlPanel: React.FC<DijkstraControlPanelProps> = ({
                                                                       isAnimating,
                                                                       startDijkstra,
                                                                       stopDijkstra,
                                                                       resetDijkstra,
                                                                       animationDelay,
                                                                       setAnimationDelay,
                                                                       visitedNodes,
                                                                       unvisitedNodes,
                                                                       currentNode,
                                                                       distances,
                                                                       previous
                                                                   }) => {
    const speedPresets = getSpeedPresets();

    const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setAnimationDelay(constrainAnimationDelay(value));
    };

    return (
        <div className="control-panel">
            <h2>Dijkstra's Algorithm Control Panel</h2>
            <div className="controls">
                <button
                    onClick={() => startDijkstra(DEFAULT_DIJKSTRA_START_NODE)}
                    disabled={isAnimating}
                >
                    Start Dijkstra
                </button>
                <button onClick={stopDijkstra} disabled={!isAnimating}>
                    Stop Dijkstra
                </button>
                <button onClick={resetDijkstra} disabled={isAnimating}>
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
                <p>Remaining Nodes: {unvisitedNodes.join(', ')}</p>
            </div>

            <div className="distances">
                <h3>Shortest Distances</h3>
                <ul>
                    {Object.entries(distances).map(([node, distance]) => (
                        <li key={node}>
                            Node {node}: {distance === Infinity ? '∞' : distance}
                            {previous[node] ? ` (via ${previous[node]})` : ''}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DijkstraControlPanel;