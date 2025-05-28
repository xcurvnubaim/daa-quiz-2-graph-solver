import { Edge } from '@xyflow/react';

export function performBfsStep(
    graph: Edge[],
    queue: string[],
    visited: string[]
): {
    nextNode: string | null;
    newQueue: string[];
    newVisited: string[];
    neighbors: string[]
} {
    if (queue.length === 0) {
        return { nextNode: null, newQueue: [], newVisited: visited, neighbors: [] };
    }

    const node = queue[0];
    const newQueue = queue.slice(1);

    const neighbors = graph
        .filter(edge => edge.source === node)
        .map(edge => edge.target as string)
        .filter(target => !visited.includes(target) && !newQueue.includes(target));

    const newVisited = [...visited, node];
    const updatedQueue = [...newQueue, ...neighbors];

    return {
        nextNode: node,
        newQueue: updatedQueue,
        newVisited,
        neighbors,
    };
}