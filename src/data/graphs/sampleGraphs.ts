export const bfsSampleGraph = {
    nodes: [
        { id: 'A', data: { label: 'A' }, position: { x: 250, y: 50 } },
        { id: 'B', data: { label: 'B' }, position: { x: 100, y: 150 } },
        { id: 'C', data: { label: 'C' }, position: { x: 400, y: 150 } },
        { id: 'D', data: { label: 'D' }, position: { x: 50, y: 250 } },
        { id: 'E', data: { label: 'E' }, position: { x: 150, y: 250 } },
        { id: 'F', data: { label: 'F' }, position: { x: 350, y: 250 } },
        { id: 'G', data: { label: 'G' }, position: { x: 450, y: 250 } },
    ],
    edges: [
        { id: 'A-B', source: 'A', target: 'B' },
        { id: 'A-C', source: 'A', target: 'C' },
        { id: 'B-D', source: 'B', target: 'D' },
        { id: 'B-E', source: 'B', target: 'E' },
        { id: 'C-F', source: 'C', target: 'F' },
        { id: 'C-G', source: 'C', target: 'G' },
    ],
}

export const DEFAULT_START_NODE = 'A';

