// src/algorithms/dijkstra/dijkstraAlgorithm.ts
import { Edge, Node } from '@xyflow/react';

interface WeightedNode extends Node {
    data: {
        label: string;
        weight: number;
    };
}

export function performDijkstraStep(
    edges: Edge[],
    nodes: WeightedNode[],
    unvisited: string[],
    visited: string[],
    distances: Record<string, number>,
    previous: Record<string, string | null>
): {
    nextNode: string | null;
    newUnvisited: string[];
    newVisited: string[];
    newDistances: Record<string, number>;
    newPrevious: Record<string, string | null>;
    currentNeighbors: string[];
} {
    if (unvisited.length === 0) {
        return {
            nextNode: null,
            newUnvisited: [],
            newVisited: visited,
            newDistances: distances,
            newPrevious: previous,
            currentNeighbors: []
        };
    }

    // Find node with minimum distance
    let minDistance = Infinity;
    let nextNode = unvisited[0];

    for (const node of unvisited) {
        if (distances[node] < minDistance) {
            minDistance = distances[node];
            nextNode = node;
        }
    }

    // Get all neighbors of the current node
    const neighbors = edges
        .filter(edge => edge.source === nextNode && !visited.includes(edge.target as string))
        .map(edge => edge.target as string);

    const currentNeighbors: string[] = [];
    const newDistances = { ...distances };
    const newPrevious = { ...previous };

    // Update distances to neighbors
    for (const neighbor of neighbors) {
        currentNeighbors.push(neighbor);

        // Get the weight of the neighbor node
        const neighborNodeData = nodes.find(node => node.id === neighbor)?.data;
        const neighborWeight = neighborNodeData?.weight || 1;

        const newDistance = distances[nextNode] + neighborWeight;

        if (newDistance < (distances[neighbor] || Infinity)) {
            newDistances[neighbor] = newDistance;
            newPrevious[neighbor] = nextNode;
        }
    }

    // Update visited and unvisited sets
    const newVisited = [...visited, nextNode];
    const newUnvisited = unvisited.filter(node => node !== nextNode);

    return {
        nextNode,
        newUnvisited,
        newVisited,
        newDistances,
        newPrevious,
        currentNeighbors
    };
}