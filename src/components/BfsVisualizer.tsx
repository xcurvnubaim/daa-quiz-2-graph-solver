// src/components/BfsVisualizer.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const BfsVisualizer: React.FC = () => {
    // State for graph nodes and edges
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    // State for BFS visualization
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationDelay, setAnimationDelay] = useState(500);
    const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
    const [queue, setQueue] = useState<string[]>([]);
    const [currentNode, setCurrentNode] = useState<string | null>(null);

    // State for Debug information
    const [showDebugInfo, setShowDebugInfo] = useState(false);

    // Reference for animation control
    const animationFrameId = useRef<number | null>(null);

    // Generate a sample graph for BFS visualization
    const generateSampleGraph = useCallback(() => {
        const newNodes: Node[] = [
            { id: 'A', data: { label: 'A' }, position: { x: 250, y: 50 } },
            { id: 'B', data: { label: 'B' }, position: { x: 100, y: 150 } },
            { id: 'C', data: { label: 'C' }, position: { x: 400, y: 150 } },
            { id: 'D', data: { label: 'D' }, position: { x: 50, y: 250 } },
            { id: 'E', data: { label: 'E' }, position: { x: 150, y: 250 } },
            { id: 'F', data: { label: 'F' }, position: { x: 350, y: 250 } },
            { id: 'G', data: { label: 'G' }, position: { x: 450, y: 250 } },
        ];

        const newEdges: Edge[] = [
            { id: 'A-B', source: 'A', target: 'B' },
            { id: 'A-C', source: 'A', target: 'C' },
            { id: 'B-D', source: 'B', target: 'D' },
            { id: 'B-E', source: 'B', target: 'E' },
            { id: 'C-F', source: 'C', target: 'F' },
            { id: 'C-G', source: 'C', target: 'G' },
        ];

        setNodes(newNodes);
        setEdges(newEdges);
    }, []);

    // Implement a single BFS step
    const runBfsStep = useCallback(() => {
        if (!isAnimating || queue.length === 0) {
            setIsAnimating(false);
            return;
        }

        // Get the next node from the queue
        const node = queue[0];
        const newQueue = queue.slice(1);

        if (node) {
            // Find unvisited neighbors
            const neighbors = edges
                .filter(edge => edge.source === node)
                .map(edge => edge.target as string)
                .filter(target => !visitedNodes.includes(target) && !newQueue.includes(target));

            // Update state
            setCurrentNode(node);
            setVisitedNodes(prev => [...prev, node]);

            // Check if this will be the last step (no more nodes to visit)
            const updatedQueue = [...newQueue, ...neighbors];
            setQueue(updatedQueue);

            // Check if BFS is complete after this step
            if (updatedQueue.length === 0) {
                setIsAnimating(false);
                return;
            }

            // Clear any existing timeout
            if (animationFrameId.current) {
                clearTimeout(animationFrameId.current);
            }

            // Schedule next step
            animationFrameId.current = window.setTimeout(() => {
                runBfsStep();
            }, animationDelay);
        }
    }, [isAnimating, queue, visitedNodes, edges, animationDelay]);

    // Single animation controller
    useEffect(() => {
        if (isAnimating && queue.length > 0) {
            // Clear any existing timeout to avoid conflicts
            if (animationFrameId.current) {
                clearTimeout(animationFrameId.current);
            }

            // Schedule the next step with a clean timeout
            animationFrameId.current = window.setTimeout(() => {
                runBfsStep();
            }, animationDelay);
        }

        return () => {
            if (animationFrameId.current) {
                clearTimeout(animationFrameId.current);
                animationFrameId.current = null;
            }
        };
    }, [isAnimating, queue.length, runBfsStep, animationDelay]);

    // Start BFS animation
    const startBfs = useCallback(() => {
        // Stop any existing animation
        if (animationFrameId.current) {
            clearTimeout(animationFrameId.current);
            animationFrameId.current = null;
        }

        // Reset all states
        setVisitedNodes([]);
        setQueue(['A']); // Start from node A
        setCurrentNode(null);
        setIsAnimating(true);
    }, []);

    // Stop BFS animation
    const stopBfs = useCallback(() => {
        setIsAnimating(false);
        if (animationFrameId.current) {
            clearTimeout(animationFrameId.current);
            animationFrameId.current = null;
        }
    }, []);

    // Initialize the graph
    useEffect(() => {
        generateSampleGraph();
    }, [generateSampleGraph]);

    // Update node and edge styles based on BFS state
    useEffect(() => {
        setNodes(prevNodes =>
            prevNodes.map(node => {
                let style = { ...node.style };

                if (node.id === currentNode) {
                    style = { ...style, backgroundColor: '#ff9800', borderColor: '#ff9800' };
                } else if (visitedNodes.includes(node.id)) {
                    style = { ...style, backgroundColor: '#4caf50', borderColor: '#4caf50' };
                } else if (queue.includes(node.id)) {
                    style = { ...style, backgroundColor: '#2196f3', borderColor: '#2196f3' };
                } else {
                    style = { ...style, backgroundColor: '#f0f0f0', borderColor: '#ccc' };
                }

                return {
                    ...node,
                    style,
                };
            })
        );

        setEdges(prevEdges =>
            prevEdges.map(edge => {
                let style = { ...edge.style };
                const sourceVisited = visitedNodes.includes(edge.source);
                const targetVisited = visitedNodes.includes(edge.target);

                if (sourceVisited && targetVisited) {
                    style = { ...style, stroke: '#4caf50', strokeWidth: 2 };
                } else if (sourceVisited && queue.includes(edge.target)) {
                    style = { ...style, stroke: '#2196f3', strokeWidth: 2 };
                } else {
                    style = { ...style, stroke: '#ccc', strokeWidth: 1 };
                }

                return { ...edge, style, animated: sourceVisited && queue.includes(edge.target) };
            })
        );
    }, [visitedNodes, queue, currentNode]);

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <div
                style={{
                    position: 'absolute',
                    zIndex: 10,
                    left: 10,
                    top: 10,
                    background: '#fff',
                    padding: 12,
                    borderRadius: 4,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                }}
            >
                <h3>BFS Visualizer</h3>
                <div>
                    <button
                        onClick={startBfs}
                        disabled={isAnimating}
                        style={{
                            marginRight: 8,
                            padding: '5px 10px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                        }}
                    >
                        Start BFS
                    </button>
                    <button
                        onClick={stopBfs}
                        disabled={!isAnimating}
                        style={{
                            padding: '5px 10px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                        }}
                    >
                        Stop BFS
                    </button>
                </div>
                <div style={{marginTop: 10}}>
                    <label>
                        Animation Delay (ms):
                        <input
                            type="number"
                            value={animationDelay}
                            onChange={(e) => setAnimationDelay(Math.max(100, parseInt(e.target.value)))}
                            style={{width: 80, marginLeft: 8}}
                            min="100"
                        />
                    </label>
                </div>
                <div style={{marginTop: 10}}>
                    <p><span style={{color: '#2196f3'}}>■</span> In Queue: {queue.join(', ')}</p>
                    <p><span style={{color: '#4caf50'}}>■</span> Visited: {visitedNodes.join(', ')}</p>
                    <p><span style={{color: '#ff9800'}}>■</span> Current: {currentNode || 'None'}</p>
                </div>
                <div style={{ marginTop: 10, border: '1px solid #e0e0e0', borderRadius: 4 }}>
                    <div
                        onClick={() => setShowDebugInfo(!showDebugInfo)}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#f5f5f5',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            userSelect: 'none'
                        }}
                    >
                        <span style={{ fontWeight: 500 }}>Debug Information</span>
                        <span>{showDebugInfo ? '▲' : '▼'}</span>
                    </div>

                    {showDebugInfo && (
                        <div style={{ padding: '5px 10px' }}>
                            <p>Animation Status: {isAnimating ? 'Running' : 'Stopped'}</p>
                            <p>Queue Length: {queue.length}</p>
                            <p>Visited Nodes: {visitedNodes.length}/{nodes.length}</p>
                            <p>Animation Delay: {animationDelay}ms</p>
                        </div>
                    )}
                </div>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
            >
                <Background/>
                <Controls/>
                <MiniMap/>
            </ReactFlow>
        </div>
    );
};

export default BfsVisualizer;