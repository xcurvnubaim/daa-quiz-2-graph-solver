import { Node, Edge } from '@xyflow/react';
import { CSSProperties } from 'react';

export function styleNodesByBfsState(
    nodes: Node[],
    currentNode: string | null,
    visitedNodes: string[],
    queue: string[] = []
): Node[] {
    return nodes.map(node => {
        const id = node.id.toString();
        // Use CSSProperties type to include backgroundColor
        let style: CSSProperties = {
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '10px',
            width: '50px',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        };

        // Default state
        style = {...style, backgroundColor: '#f0f0f0', color: '#333'};

        // In queue but not visited
        if (queue.includes(id) && !visitedNodes.includes(id)) {
            style = {...style, backgroundColor: '#2196f3', color: 'white'};
        }

        // Visited
        if (visitedNodes.includes(id)) {
            style = {...style, backgroundColor: '#4caf50', color: 'white'};
        }

        // Current node
        if (currentNode === id) {
            style = {...style,
                backgroundColor: '#ff9800',
                color: 'white',
                boxShadow: '0 0 10px rgba(255, 152, 0, 0.7)'
            };
        }

        return {
            ...node,
            style
        };
    });
}

export function styleEdgesByBfsState(
    edges: Edge[],
    visitedNodes: string[],
    queue: string[] = []
): Edge[] {
    return edges.map(edge => {
        let style: CSSProperties = {
            strokeWidth: 2,
            stroke: '#ccc'
        };

        const sourceId = edge.source.toString();
        const targetId = edge.target.toString();

        // Edge from visited to visited
        if (visitedNodes.includes(sourceId) && visitedNodes.includes(targetId)) {
            style = {...style, stroke: '#4caf50', strokeWidth: 3};
        }

        // Edge from visited to queue
        else if (visitedNodes.includes(sourceId) && queue.includes(targetId)) {
            style = {...style, stroke: '#2196f3', strokeWidth: 3};
        }

        return {
            ...edge,
            style,
            animated: visitedNodes.includes(sourceId) && queue.includes(targetId)
        };
    });
}