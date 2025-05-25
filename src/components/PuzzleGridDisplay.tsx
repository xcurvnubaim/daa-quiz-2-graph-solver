import React from 'react';
import { Node } from '@xyflow/react';

interface PuzzleGridProps {
  puzzle: number[][];
}

export const PuzzleGridDisplay: React.FC<PuzzleGridProps> = React.memo(
  function PuzzleGrid({ puzzle }) {
    return (
      <table style={{ borderCollapse: 'collapse', margin: '4px 0' }}>
        <tbody>
          {puzzle.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    border: '1px solid #333',
                    width: 24,
                    height: 24,
                    textAlign: 'center',
                    background: cell === 0 ? '#eee' : '#fff',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}
                >
                  {cell === 0 ? '' : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
);
