import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewPage from './pages/NewPage';
import BfsVisualizerPage from './pages/BfsVisualizerPage';
import EightPuzzlePage from './pages/EightPuzzlePage';
import RelationGraphPage from './pages/RelationGraphPage';
import DijkstraVisualizerPage from "./pages/DijkstraVisualizerPage.tsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/8-puzzle" element={<EightPuzzlePage />} />
                <Route path="/bfs-visualizer" element={<BfsVisualizerPage />} />
                <Route path="/new-page" element={<NewPage />} />
                <Route path="/relation-graph" element={<RelationGraphPage />} />
                <Route path="/dijkstra-visualizer" element={<DijkstraVisualizerPage />} />
            </Routes>
        </BrowserRouter>
    );
}
