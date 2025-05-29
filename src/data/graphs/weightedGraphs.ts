// src/data/graphs/weightedGraphs.ts
import { Edge, Node } from '@xyflow/react';

export const DEFAULT_DIJKSTRA_START_NODE = '1';

export interface WeightedNode extends Node {
    data: {
        label: string;
        weight: number;
    };
}

export const dijkstraSampleGraph = {
    nodes: [
        { id: '1', position: { x: 50, y: 100 }, data: { label: '1', weight: 0 } },
        { id: '2', position: { x: 150, y: 50 }, data: { label: '2', weight: 7 } },
        { id: '3', position: { x: 150, y: 150 }, data: { label: '3', weight: 3 } },
        { id: '4', position: { x: 250, y: 50 }, data: { label: '4', weight: 2 } },
        { id: '5', position: { x: 250, y: 150 }, data: { label: '5', weight: 4 } },
        { id: '6', position: { x: 350, y: 100 }, data: { label: '6', weight: 5 } },
    ] as WeightedNode[],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e1-3', source: '1', target: '3' },
        { id: 'e2-4', source: '2', target: '4' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e3-5', source: '3', target: '5' },
        { id: 'e4-6', source: '4', target: '6' },
        { id: 'e5-6', source: '5', target: '6' },
    ] as Edge[],
};