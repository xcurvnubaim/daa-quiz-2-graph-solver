// src/hooks/useDijkstraGraph.ts
import { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { CustomNodeData } from '../components/DijkstraVisualizer/DijkstraGraphDisplay';

export interface UseDijkstraGraphParams {
    initialGraph: {
        nodes: Node[];
        edges: Edge[];
    };
    currentNode: string | null;
    visitedNodes: string[];
    distances: Record<string, number>;
    previous: Record<string, string | null>;
}

export interface UseDijkstraGraphResult {
    nodes: Node<CustomNodeData>[];
    edges: Edge[];
    resetGraph: () => void;
}

export function useDijkstraGraph({
                                     initialGraph,
                                     currentNode,
                                     visitedNodes,
                                     distances,
                                     previous
                                 }: UseDijkstraGraphParams): UseDijkstraGraphResult {
    // Type assertion to handle initial state
    const [nodes, setNodes] = useState<Node<CustomNodeData>[]>(
        initialGraph.nodes as Node<CustomNodeData>[]
    );
    const [edges, setEdges] = useState<Edge[]>(initialGraph.edges);

    useEffect(() => {
        // Process nodes with Dijkstra-specific data
        const enhancedNodes = initialGraph.nodes.map(node => {
            const nodeId = node.id;
            const distance = distances[nodeId];
            const isInShortestPath = Object.values(previous).includes(nodeId);

            // Create node with proper Dijkstra state
            return {
                ...node,
                type: 'weighted',
                data: {
                    ...(node.data as any),
                    label: (node.data as any).label || `Node ${nodeId}`,
                    weight: (node.data as any).weight || 1,
                    distance: distance,
                    isVisited: visitedNodes.includes(nodeId),
                    isStart: distance === 0,
                    isCurrent: nodeId === currentNode,
                    isInPath: isInShortestPath,
                }
            } as Node<CustomNodeData>;
        });

        // Style edges based on path and current node
        const enhancedEdges = initialGraph.edges.map(edge => {
            const isInPath = previous[edge.target as string] === edge.source ||
                previous[edge.source as string] === edge.target;

            return {
                ...edge,
                style: isInPath ? { stroke: '#4caf50', strokeWidth: 3 } : {},
                animated: edge.source === currentNode
            };
        });

        setNodes(enhancedNodes);
        setEdges(enhancedEdges);
    }, [initialGraph, currentNode, visitedNodes, distances, previous]);

    const resetGraph = () => {
        setNodes(initialGraph.nodes as Node<CustomNodeData>[]);
        setEdges(initialGraph.edges);
    };

    return {
        nodes,
        edges,
        resetGraph
    };
}