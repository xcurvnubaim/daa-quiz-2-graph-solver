import React, { useCallback } from 'react';
import {
    Background,
    BackgroundVariant,
    Controls,
    Edge,
    Node,
    ReactFlow,
    ReactFlowProvider,
    Handle,
    Position,
    NodeTypes,
    NodeProps,
    ReactFlowInstance
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Define the node data interface for Dijkstra's algorithm
export interface CustomNodeData {
    label: string;
    weight: number;
    distance?: number;
    isVisited?: boolean;
    isStart?: boolean;
    isInPath?: boolean;
    isCurrent?: boolean;
    [key: string]: unknown;
}

// Ensure nodes and edges are typed correctly
interface DijkstraGraphDisplayProps {
    nodes: Node<CustomNodeData>[]; // Explicitly type nodes with CustomNodeData
    edges: Edge[];
    distances: Record<string, number>;
    previous: Record<string, string | null>;
    currentNode: string | null;
}

// Custom node implementation
const WeightedNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
    const distance = data.distance !== undefined ? data.distance : Infinity;
    const isVisited = data.isVisited || false;
    const isStart = data.isStart || false;
    const isInPath = data.isInPath || false;
    const isCurrent = data.isCurrent || false;

    let backgroundColor = '#fff';
    let borderColor = '#555';

    if (isCurrent) {
        backgroundColor = '#ff9800';
        borderColor = '#e65100';
    } else if (isInPath) {
        backgroundColor = '#4caf50';
        borderColor = '#2e7d32';
    } else if (isVisited) {
        backgroundColor = '#bbdefb';
        borderColor = '#1976d2';
    } else if (isStart) {
        backgroundColor = '#c8e6c9';
        borderColor = '#388e3c';
    }

    return (
        <div style={{
            background: backgroundColor,
            borderRadius: '50%',
            border: `2px solid ${borderColor}`,
            padding: '10px',
            width: '80px',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '12px',
        }}>
            <div style={{ fontWeight: 'bold' }}>{data.label}</div>
            <div>Weight: {data.weight}</div>
            {distance !== Infinity && (
                <div>Dist: {distance}</div>
            )}
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

// Define node types
const nodeTypes: NodeTypes = {
    weighted: WeightedNode
};

const DijkstraGraphDisplay: React.FC<DijkstraGraphDisplayProps> = ({
                                                                       nodes,
                                                                       edges,
                                                                       distances,
                                                                       previous,
                                                                       currentNode
                                                                   }) => {
    // Properly type the instance parameter
    const handleInit = useCallback((instance: ReactFlowInstance) => {
        void instance.fitView({ padding: 0.2 });
    }, []);

    // Enhance nodes with Dijkstra-specific data
    const enhancedNodes = nodes.map(node => {
        const nodeId = node.id;
        const distance = distances[nodeId];
        const isInShortestPath = Object.values(previous).includes(nodeId);

        return {
            ...node,
            type: 'weighted',
            data: {
                ...node.data,
                distance: distance,
                isVisited: distance !== undefined && distance !== Infinity,
                isStart: distance === 0,
                isCurrent: nodeId === currentNode,
                isInPath: isInShortestPath,
            }
        };
    });

    // Highlight edges in the shortest path
    const enhancedEdges = edges.map(edge => {
        const isInPath = previous[edge.target as string] === edge.source ||
            previous[edge.source as string] === edge.target;

        return {
            ...edge,
            style: isInPath ? { stroke: '#4caf50', strokeWidth: 3 } : {},
            animated: edge.source === currentNode
        };
    });

    return (
        <div style={{ height: '70vh', width: '100%', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <ReactFlowProvider>
                <ReactFlow
                    nodes={enhancedNodes}
                    edges={enhancedEdges}
                    nodeTypes={nodeTypes}
                    onInit={handleInit}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    style={{ background: '#f7f7f7' }}
                >
                    <Background color="#f0f0f0" variant={BackgroundVariant.Dots} />
                    <Controls />
                </ReactFlow>
            </ReactFlowProvider>
        </div>
    );
};

export default DijkstraGraphDisplay;