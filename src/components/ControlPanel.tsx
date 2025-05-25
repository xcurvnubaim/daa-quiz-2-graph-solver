import React from 'react';

interface ControlPanelProps {
  input: string;
  onInputChange: (value: string) => void;
  onSetState: () => void;
  onStartAnimation: () => void;
  onStopAnimation: () => void;
  isAnimating: boolean;
  animationDelay: number;
  onAnimationDelayChange: (value: number) => void;
  foundSolution: boolean;
  solutionPathLength: number;
  currentBfsPathLength: number;
  finished: boolean;
  exploredNodesLength: number;
  latestQueueSnapshotLength: number;
  graphNodesLength: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  input,
  onInputChange,
  onSetState,
  onStartAnimation,
  onStopAnimation,
  isAnimating,
  animationDelay,
  onAnimationDelayChange,
  foundSolution,
  solutionPathLength,
  currentBfsPathLength,
  finished,
  exploredNodesLength,
  latestQueueSnapshotLength,
  graphNodesLength,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 10,
        left: 10,
        top: 10,
        background: '#fff',
        padding: 12,
        borderRadius: 4,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <div>
        <b>8 Puzzle State (comma separated, 0=empty):</b>
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          style={{
            width: 180,
            marginLeft: 8,
            padding: '4px',
            border: '1px solid #ccc',
            borderRadius: '3px',
          }}
        />
        <button
          onClick={onSetState}
          style={{ marginLeft: 8, padding: '5px 10px' }}
        >
          Set State
        </button>
      </div>
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={onStartAnimation}
          style={{
            marginRight: 8,
            padding: '5px 10px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
          }}
          disabled={isAnimating}
        >
          Start Animation
        </button>
        <button
          onClick={onStopAnimation}
          style={{
            padding: '5px 10px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
          }}
          disabled={!isAnimating}
        >
          Stop Animation
        </button>
        <label style={{ marginLeft: '15px', fontSize: '0.9em' }}>
          Delay (ms):
          <input
            type="number"
            value={animationDelay}
            onChange={(e) =>
              onAnimationDelayChange(Math.max(50, parseInt(e.target.value, 10)))
            }
            style={{ width: '60px', marginLeft: '5px', padding: '4px' }}
            min="50"
            step="50"
          />
        </label>
      </div>

      {foundSolution && (
        <div
          style={{
            marginTop: 12,
            color: '#ff9800',
            fontWeight: 'bold',
          }}
        >
          Solution found in{' '}
          {solutionPathLength > 0
            ? solutionPathLength - 1
            : currentBfsPathLength > 0
            ? currentBfsPathLength - 1
            : 0}{' '}
          moves!
        </div>
      )}
      {finished && !foundSolution && (
        <div
          style={{ marginTop: 12, color: 'red', fontWeight: 'bold' }}
        >
          No solution found or BFS completed.
        </div>
      )}
      <div
        style={{
          marginTop: 12,
          fontSize: '0.8em',
          borderTop: '1px solid #eee',
          paddingTop: '10px',
        }}
      >
        <p>Current BFS Path Length: {currentBfsPathLength}</p>
        <p>Explored Nodes: {exploredNodesLength}</p>
        <p>Queue Size (Planned): {latestQueueSnapshotLength}</p>
        <p>Rendered Nodes: {graphNodesLength}</p>
        <p>
          Status:{' '}
          {isAnimating
            ? 'Animating...'
            : finished
            ? 'Finished'
            : 'Idle'}
        </p>
      </div>
    </div>
  );
};
