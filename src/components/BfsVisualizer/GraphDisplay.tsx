// src/components/BfsVisualizer/GraphDisplay.tsx
import React, { useCallback } from 'react';
import {
    Background,
    BackgroundVariant,
    Controls,
    Edge,
    Node as FlowNode,
    ReactFlow,
    ReactFlowProvider,
    ReactFlowInstance
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface GraphDisplayProps {
    nodes: FlowNode[];
    edges: Edge[];
}

const GraphDisplay: React.FC<GraphDisplayProps> = ({ nodes, edges }) => {
    const onInit = useCallback(async (reactFlowInstance: ReactFlowInstance) => {
        try {
            await reactFlowInstance.fitView({ padding: 0.2 });
        } catch (error) {
            console.error("Error fitting view:", error);
        }
    }, []);

    return (
        <div style={{ height: '70vh', width: '100%', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onInit={onInit}
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

export default GraphDisplay;