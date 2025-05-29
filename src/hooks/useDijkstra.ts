// src/hooks/useDijkstra.ts
import { useState, useCallback, useRef } from 'react';
import { Edge, Node } from '@xyflow/react';
import { performDijkstraStep } from '../algorithms/dijkstra/dijkstraAlgorithm';

interface WeightedNode extends Node {
    data: {
        label: string;
        weight: number;
    };
}

interface DijkstraState {
    visitedNodes: string[];
    unvisitedNodes: string[];
    currentNode: string | null;
    distances: Record<string, number>;
    previous: Record<string, string | null>;
    currentNeighbors: string[];
    isAnimating: boolean;
}

export const useDijkstra = (nodes: WeightedNode[], edges: Edge[], animationDelay: number) => {
    const [dijkstraState, setDijkstraState] = useState<DijkstraState>({
        visitedNodes: [],
        unvisitedNodes: [],
        currentNode: null,
        distances: {},
        previous: {},
        currentNeighbors: [],
        isAnimating: false
    });

    const animationRef = useRef<number | null>(null);

    const stopDijkstra = useCallback(() => {
        if (animationRef.current) {
            clearTimeout(animationRef.current);
            animationRef.current = null;
        }
        setDijkstraState(prev => ({ ...prev, isAnimating: false }));
    }, []);

    const startDijkstra = useCallback((startNode: string) => {
        // Get all nodes from edges
        const allNodes = Array.from(new Set([
            ...edges.map(edge => edge.source),
            ...edges.map(edge => edge.target)
        ]));

        // Initialize distances and previous
        const initialDistances: Record<string, number> = {};
        const initialPrevious: Record<string, string | null> = {};

        allNodes.forEach(node => {
            initialDistances[node] = node === startNode ? 0 : Infinity;
            initialPrevious[node] = null;
        });

        setDijkstraState({
            visitedNodes: [],
            unvisitedNodes: allNodes as string[],
            currentNode: null,
            distances: initialDistances,
            previous: initialPrevious,
            currentNeighbors: [],
            isAnimating: true
        });

        const runStep = () => {
            setDijkstraState(prevState => {
                if (!prevState.isAnimating || prevState.unvisitedNodes.length === 0) {
                    return { ...prevState, isAnimating: false };
                }

                const result = performDijkstraStep(
                    edges,
                    nodes,
                    prevState.unvisitedNodes,
                    prevState.visitedNodes,
                    prevState.distances,
                    prevState.previous
                );

                if (result.nextNode === null) {
                    return { ...prevState, isAnimating: false };
                }

                return {
                    visitedNodes: result.newVisited,
                    unvisitedNodes: result.newUnvisited,
                    currentNode: result.nextNode,
                    distances: result.newDistances,
                    previous: result.newPrevious,
                    currentNeighbors: result.currentNeighbors,
                    isAnimating: true
                };
            });

            animationRef.current = setTimeout(runStep, animationDelay);
        };

        animationRef.current = setTimeout(runStep, animationDelay);
    }, [nodes, edges, animationDelay]);

    return {
        dijkstraState,
        startDijkstra,
        stopDijkstra
    };
};