import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewPage from './pages/NewPage';
import BfsVisualizerPage from './pages/BfsVisualizerPage';
import EightPuzzlePage from './pages/EightPuzzlePage';
import RelationGraphPage from './pages/RelationGraphPage';
import BfsVisualizerBetaPage from "./pages/BfsVisualizerBetaPage.tsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/8-puzzle" element={<EightPuzzlePage />} />
                <Route path="/bfs-visualizer" element={<BfsVisualizerPage />} />
                <Route path="/bfs-visualizer-beta" element={<BfsVisualizerBetaPage />} />
                <Route path="/new-page" element={<NewPage />} />
                <Route path="/relation-graph" element={<RelationGraphPage />} />
            </Routes>
        </BrowserRouter>
    );
}
