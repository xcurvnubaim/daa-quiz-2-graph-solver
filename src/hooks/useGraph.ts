import { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { styleNodesByBfsState, styleEdgesByBfsState } from '../utils/graphUtils';
import { bfsSampleGraph } from '../data/graphs/sampleGraphs';

export interface UseGraphParams {
    initialGraph?: {
        nodes: Node[];
        edges: Edge[];
    };
    currentNode: string | null;
    visitedNodes: string[];
    queue: string[];
}

export interface UseGraphResult {
    nodes: Node[];
    edges: Edge[];
    resetGraph: () => void;
}

export function useGraph({
                             initialGraph = bfsSampleGraph,
                             currentNode,
                             visitedNodes,
                             queue
                         }: UseGraphParams): UseGraphResult {
    const [nodes, setNodes] = useState<Node[]>(initialGraph.nodes);
    const [edges, setEdges] = useState<Edge[]>(initialGraph.edges);

    useEffect(() => {
        const styledNodes = styleNodesByBfsState(
            initialGraph.nodes,
            currentNode,
            visitedNodes,
            queue
        );

        const styledEdges = styleEdgesByBfsState(
            initialGraph.edges,
            visitedNodes,
            queue
        );

        setNodes(styledNodes);
        setEdges(styledEdges);
    }, [initialGraph, currentNode, visitedNodes, queue]);

    const resetGraph = () => {
        setNodes([...initialGraph.nodes]);
        setEdges([...initialGraph.edges]);
    };

    return {
        nodes,
        edges,
        resetGraph
    };
}