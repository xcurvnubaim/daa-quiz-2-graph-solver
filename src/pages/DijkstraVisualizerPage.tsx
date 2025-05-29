import React from 'react';
import DijkstraVisualizer from '../components/DijkstraVisualizer/index';
import '../components/DijkstraVisualizer/DijkstraVisualizer.css';

const DijkstraVisualizerPage: React.FC = () => {
    return (
        <div className="visualizer-page">
            <DijkstraVisualizer />
        </div>
    );
};

export default DijkstraVisualizerPage;