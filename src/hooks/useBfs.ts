import { useState, useCallback, useEffect } from 'react';
import { Edge } from '@xyflow/react';
import { performBfsStep } from '../algorithms/bfs/bfsAlgorithm';
import {
    useAnimationTimeout,
    constrainAnimationDelay
} from '../utils/animationUtils';

export interface BfsState {
    visitedNodes: string[];
    queue: string[];
    currentNode: string | null;
    isAnimating: boolean;
}

export interface UseBfsResult {
    bfsState: BfsState;
    startBfs: (startNode: string) => void;
    stopBfs: () => void;
}

export function useBfs(edges: Edge[], animationDelay: number, initialNode = 'A'): UseBfsResult {
    const [isAnimating, setIsAnimating] = useState(false);
    const [visitedNodes, setVisitedNodes] = useState<string[]>([]);

    const [queue, setQueue] = useState<string[]>([initialNode]);
    const [currentNode, setCurrentNode] = useState<string | null>(null);

    const { setAnimationTimeout, clearAnimationTimeout } = useAnimationTimeout();

    const runBfsStep = useCallback(() => {
        if (!isAnimating || queue.length === 0) {
            setIsAnimating(false);
            return;
        }

        const {nextNode, newQueue, newVisited } = performBfsStep(edges, queue, visitedNodes);

        if (nextNode) {
            setCurrentNode(nextNode);
            setVisitedNodes(newVisited);
            setQueue(newQueue);

            if (newQueue.length === 0) {
                setIsAnimating(false);
                return;
            }

            setAnimationTimeout(() => {
                runBfsStep();
            }, constrainAnimationDelay(animationDelay));
        }
    }, [isAnimating, queue, visitedNodes, edges, animationDelay, setAnimationTimeout]);

    useEffect(() => {
        if (isAnimating && queue.length > 0) {
            setAnimationTimeout(() => {
                runBfsStep();
            }, constrainAnimationDelay(animationDelay));
        }
    }, [isAnimating, queue.length, runBfsStep, animationDelay, setAnimationTimeout]);

    const startBfs = useCallback((startNode: string) => {
        clearAnimationTimeout();
        setVisitedNodes([]);
        setQueue([startNode]);
        setCurrentNode(null);
        setIsAnimating(true);
    }, [clearAnimationTimeout]);

    const stopBfs = useCallback(() => {
        setIsAnimating(false);
        clearAnimationTimeout();
    }, [clearAnimationTimeout]);

    return {
        bfsState: { visitedNodes, queue, currentNode, isAnimating },
        startBfs,
        stopBfs,
    };
}