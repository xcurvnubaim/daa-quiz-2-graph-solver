// src/components/BfsVisualizer/index.tsx
import React, { useState } from 'react';
import '@xyflow/react/dist/style.css';
import { useBfs } from '../../hooks/useBfs';
import { useGraph } from '../../hooks/useGraph';
import { bfsSampleGraph, DEFAULT_START_NODE } from "../../data/graphs/sampleGraphs";
import ControlPanel from './ControlPanel';
import DebugPanel from './DebugPanel';
import GraphDisplay from './GraphDisplay';
import { DEFAULT_ANIMATION_CONFIG } from '../../utils/animationUtils';
import './BfsVisualizer.css'; // Create this CSS file for styling

const BfsVisualizer: React.FC = () => {
    const [animationDelay, setAnimationDelay] = useState(DEFAULT_ANIMATION_CONFIG.delay);

    const { bfsState, startBfs, stopBfs } = useBfs(bfsSampleGraph.edges, animationDelay);
    const { visitedNodes, queue, currentNode, isAnimating } = bfsState;

    const { nodes, edges, resetGraph } = useGraph({
        initialGraph: bfsSampleGraph,
        currentNode,
        visitedNodes,
        queue
    });

    const handleReset = () => {
        stopBfs();
        resetGraph();
    };

    return (
        <div className="bfs-visualizer-container">
            <h1>BFS Algorithm Visualizer</h1>

            <div className="visualizer-layout">
                <div className="control-section">
                    <ControlPanel
                        isAnimating={isAnimating}
                        startBfs={() => startBfs(DEFAULT_START_NODE)}
                        stopBfs={stopBfs}
                        resetBfs={handleReset}
                        animationDelay={animationDelay}
                        setAnimationDelay={setAnimationDelay}
                        queue={queue}
                        visitedNodes={visitedNodes}
                        currentNode={currentNode}
                    />

                    <DebugPanel
                        isAnimating={isAnimating}
                        queueLength={queue.length}
                        visitedLength={visitedNodes.length}
                        totalNodes={nodes.length}
                        animationDelay={animationDelay}
                    />
                </div>

                <div className="graph-section">
                    <GraphDisplay nodes={nodes} edges={edges} />
                </div>
            </div>
        </div>
    );
}

export default BfsVisualizer;