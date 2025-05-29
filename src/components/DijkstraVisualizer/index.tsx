// src/components/DijkstraVisualizer/index.tsx
import React, { useState } from 'react';
import '@xyflow/react/dist/style.css';
import { useDijkstra } from '../../hooks/useDijkstra';
import { useDijkstraGraph } from '../../hooks/useDijkstraGraph.ts';
import { dijkstraSampleGraph, DEFAULT_DIJKSTRA_START_NODE } from "../../data/graphs/weightedGraphs";
import DijkstraControlPanel from './DijkstraControlPanel';
import DebugPanel from '../BfsVisualizer/DebugPanel';
import DijkstraGraphDisplay from './DijkstraGraphDisplay';
import { DEFAULT_ANIMATION_CONFIG } from '../../utils/animationUtils';
import './DijkstraVisualizer.css';

const DijkstraVisualizer: React.FC = () => {
    const [animationDelay, setAnimationDelay] = useState(DEFAULT_ANIMATION_CONFIG.delay);

    const { dijkstraState, startDijkstra, stopDijkstra } = useDijkstra(
        dijkstraSampleGraph.nodes,
        dijkstraSampleGraph.edges,
        animationDelay
    );

    const {
        visitedNodes,
        unvisitedNodes,
        currentNode,
        distances,
        previous,
        isAnimating
    } = dijkstraState;

    // Use the new hook specifically for Dijkstra visualization
    const { nodes, edges, resetGraph } = useDijkstraGraph({
        initialGraph: dijkstraSampleGraph,
        currentNode,
        visitedNodes,
        distances,
        previous
    });

    const handleReset = () => {
        stopDijkstra();
        resetGraph();
    };

    return (
        <div className="dijkstra-visualizer-container">
            <h1>Dijkstra Algorithm Visualizer</h1>

            <div className="visualizer-layout">
                <div className="control-section">
                    <DijkstraControlPanel
                        isAnimating={isAnimating}
                        startDijkstra={() => startDijkstra(DEFAULT_DIJKSTRA_START_NODE)}
                        stopDijkstra={stopDijkstra}
                        resetDijkstra={handleReset}
                        animationDelay={animationDelay}
                        setAnimationDelay={setAnimationDelay}
                        visitedNodes={visitedNodes}
                        unvisitedNodes={unvisitedNodes}
                        currentNode={currentNode}
                        distances={distances}
                        previous={previous}
                    />

                    <DebugPanel
                        isAnimating={isAnimating}
                        queueLength={unvisitedNodes.length}
                        visitedLength={visitedNodes.length}
                        totalNodes={nodes.length}
                        animationDelay={animationDelay}
                    />
                </div>

                <div className="graph-section">
                    <DijkstraGraphDisplay
                        nodes={nodes}
                        edges={edges}
                        distances={distances}
                        previous={previous}
                        currentNode={currentNode}
                    />
                </div>
            </div>
        </div>
    );
}

export default DijkstraVisualizer;