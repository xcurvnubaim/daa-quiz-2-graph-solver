import React from 'react';
import BfsVisualizer from '../components/BfsVisualizer/index';
import '../components/BfsVisualizer/BfsVisualizer.css';

const BfsVisualizerBetaPage: React.FC = () => {
    return (
        <div className="visualizer-page">
            <BfsVisualizer />
        </div>
    );
};

export default BfsVisualizerBetaPage;