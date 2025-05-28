// src/utils/animationUtils.ts
import { useRef, useEffect } from 'react';

/**
 * Default animation configuration
 */
export interface AnimationConfig {
    delay: number;
    minDelay?: number;
    maxDelay?: number;
    stepSize?: number;
}

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
    delay: 1000,
    minDelay: 100,
    maxDelay: 3000,
    stepSize: 100
};

/**
 * Validates and constrains an animation delay value
 */
export function constrainAnimationDelay(
    delay: number,
    minDelay: number = DEFAULT_ANIMATION_CONFIG.minDelay!,
    maxDelay: number = DEFAULT_ANIMATION_CONFIG.maxDelay!
): number {
    return Math.max(minDelay, Math.min(maxDelay, delay));
}

/**
 * Format milliseconds into a readable format
 */
export function formatAnimationDelay(ms: number): string {
    return ms < 1000 ? `${ms}ms` : `${ms / 1000}s`;
}

/**
 * Creates animation speed presets
 */
export function getSpeedPresets(): { label: string; value: number }[] {
    return [
        { label: 'Slow', value: 2000 },
        { label: 'Normal', value: 1000 },
        { label: 'Fast', value: 500 },
        { label: 'Very Fast', value: 200 }
    ];
}

/**
 * Custom hook for safely managing animation timeouts
 */
export function useAnimationTimeout() {
    const timeoutRef = useRef<number | null>(null);

    const setAnimationTimeout = (callback: () => void, delay: number) => {
        clearAnimationTimeout();
        timeoutRef.current = window.setTimeout(callback, delay);
        return timeoutRef.current;
    };

    const clearAnimationTimeout = () => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    // Clean up on unmount
    useEffect(() => {
        return () => clearAnimationTimeout();
    }, []);

    return { setAnimationTimeout, clearAnimationTimeout, timeoutRef };
}

/**
 * Calculates a dynamic delay based on the number of elements
 */
export function calculateDynamicDelay(
    itemCount: number,
    baseDelay: number = DEFAULT_ANIMATION_CONFIG.delay
): number {
    // Reduce delay for larger datasets to keep visualization responsive
    if (itemCount > 20) {
        return Math.max(baseDelay / 2, DEFAULT_ANIMATION_CONFIG.minDelay!);
    }

    return baseDelay;
}

/**
 * Animation state type for tracking animation progress
 */
export interface AnimationState {
    isAnimating: boolean;
    isPaused: boolean;
    step: number;
    totalSteps: number | null;
    startTime: number | null;
    elapsedTime: number;
}

/**
 * Creates initial animation state
 */
export function createInitialAnimationState(): AnimationState {
    return {
        isAnimating: false,
        isPaused: false,
        step: 0,
        totalSteps: null,
        startTime: null,
        elapsedTime: 0
    };
}