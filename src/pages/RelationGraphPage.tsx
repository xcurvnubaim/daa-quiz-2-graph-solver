import React, { useState, useMemo, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function parseRelations(input: string): [string, string][] {
  return input
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [a, b] = line.split(/\s+/);
      return [a, b] as [string, string];
    })
    .filter(([a, b]) => a && b);
}

function buildGraph(relations: [string, string][]) {
  const adj: Record<string, Set<string>> = {};
  relations.forEach(([a, b]) => {
    if (!adj[a]) adj[a] = new Set();
    if (!adj[b]) adj[b] = new Set();
    adj[a].add(b);
    adj[b].add(a);
  });
  return adj;
}

function dfs(adj: Record<string, Set<string>>, start: string, target: string): string[] | null {
  const visited = new Set<string>();
  const path: string[] = [];
  let found = false;
  function visit(node: string) {
    if (found) return;
    visited.add(node);
    path.push(node);
    if (node === target) {
      found = true;
      return;
    }
    for (const neighbor of adj[node] || []) {
      if (!visited.has(neighbor)) visit(neighbor);
      if (found) return;
    }
    path.pop();
  }
  visit(start);
  return found ? [...path] : null;
}

const nodeColors = [
  '#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#c2185b', '#afb42b'
];

const RelationGraphPage: React.FC = () => {
  const [relationsInput, setRelationsInput] = useState('A B\nB C\nC D\nE F');
  const [personX, setPersonX] = useState('A');
  const [personY, setPersonY] = useState('D');
  const [result, setResult] = useState<string | null>(null);
  const [path, setPath] = useState<string[] | null>(null);
  
  // Animation control states
  const [animationSteps, setAnimationSteps] = useState<{path: string[], current: string | null}[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoPlayActive, setAutoPlayActive] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500); // ms

  const relations = useMemo(() => parseRelations(relationsInput), [relationsInput]);
  const adj = useMemo(() => buildGraph(relations), [relations]);
  const people = useMemo(() => Array.from(new Set(relations.flat())), [relations]);
  
  // Get the current animation state for rendering
  const currentAnimation = useMemo(() => 
    animationSteps.length > 0 && currentStep < animationSteps.length 
      ? animationSteps[currentStep] 
      : { path: [], current: null },
    [animationSteps, currentStep]
  );

  const nodes: Node[] = people.map((id, idx) => {
    // Calculate a dynamic radius based on number of nodes
    const radius = Math.max(200, people.length * 25);
    
    return {
      id,
      data: { label: id },
      position: { 
        x: radius * Math.cos((2 * Math.PI * idx) / people.length), 
        y: radius * Math.sin((2 * Math.PI * idx) / people.length) 
      },
      style: {
        width: 50,
        height: 50,
        borderRadius: 25,
        border: '2px solid #333',
        background: 
          isAnimating && id === currentAnimation.current 
            ? '#ff9800' // Current node being processed
            : isAnimating && currentAnimation.path.includes(id)
              ? '#ffe082' // Nodes in current path
              : path && path.includes(id)
                ? '#ffeb3b' // Final path
                : nodeColors[idx % nodeColors.length], // Default
        color: '#fff',
        fontWeight: 600,
        fontSize: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        transition: 'background 0.2s'
      }
    };
  });

  // Highlight edges in both directions (since our graph is undirected)
  const edges: Edge[] = relations.map(([a, b], idx) => {
    // Check if edge is in the current animation path (consecutive nodes in either direction)
    let animHighlight = false;
    if (isAnimating && currentAnimation.path.length > 1) {
      for (let i = 0; i < currentAnimation.path.length - 1; i++) {
        if ((currentAnimation.path[i] === a && currentAnimation.path[i + 1] === b) ||
            (currentAnimation.path[i] === b && currentAnimation.path[i + 1] === a)) {
          animHighlight = true;
          break;
        }
      }
    }
    
    // Check if edge is in the final path (consecutive nodes in either direction)
    let finalPathHighlight = false;
    if (path && path.length > 1) {
      for (let i = 0; i < path.length - 1; i++) {
        if ((path[i] === a && path[i + 1] === b) ||
            (path[i] === b && path[i + 1] === a)) {
          finalPathHighlight = true;
          break;
        }
      }
    }
    
    return {
      id: `${a}-${b}-${idx}`,
      source: a,
      target: b,
      animated: animHighlight || finalPathHighlight,
      style: {
        stroke: animHighlight 
          ? '#ff9800' 
          : finalPathHighlight 
            ? '#ff9800' 
            : '#888',
        strokeWidth: animHighlight || finalPathHighlight ? 3 : 1.5
      }
    };
  });

  // Generate all DFS animation steps
  const generateDfsSteps = () => {
    if (!personX || !personY || !adj[personX] || !adj[personY]) {
      return [];
    }

    const visited = new Set<string>();
    const path: string[] = [];
    const steps: {path: string[], current: string | null}[] = [];
    let found = false;

    function visit(node: string) {
      if (found) return;
      
      visited.add(node);
      path.push(node);
      steps.push({path: [...path], current: node});
      
      if (node === personY) {
        found = true;
        // Make sure to add one more step to show the final path
        steps.push({path: [...path], current: node});
        return;
      }
      
      const neighbors = Array.from(adj[node] || []);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visit(neighbor);
          if (found) return;
        }
      }
      
      // If this node doesn't lead to a solution, backtrack
      if (!found) {
        path.pop();
        steps.push({path: [...path], current: path.length > 0 ? path[path.length - 1] : null});
      }
    }
    
    visit(personX);
    return steps;
  };

  const handleCheckRelation = () => {
    if (!personX || !personY) {
      setResult('Please enter both names.');
      setPath(null);
      return;
    }
    
    if (!adj[personX] || !adj[personY]) {
      setResult('One or both people not found.');
      setPath(null);
      return;
    }
    
    if (personX === personY) {
      setResult('Same person.');
      setPath([personX]);
      return;
    }

    // Generate all steps
    const steps = generateDfsSteps();
    setAnimationSteps(steps);
    setCurrentStep(0);
    setIsAnimating(true);
    setPath(null);
    setResult(null);
    
    // Don't set the path or result immediately - let the animation control handle it
  };

  // Step controls
  const handleStepForward = () => {
    if (currentStep < animationSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Animation complete
      completeAnimation();
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAutoPlay = () => {
    setAutoPlayActive(true);
  };

  const handleStopAutoPlay = () => {
    setAutoPlayActive(false);
  };

  const completeAnimation = () => {
    setIsAnimating(false);
    setAutoPlayActive(false);
    
    // Check if the target person is in the final path
    const finalAnimationStep = animationSteps[animationSteps.length - 1];
    
    // For related nodes, personY should be in the path of the last step
    if (finalAnimationStep && finalAnimationStep.path.includes(personY)) {
      // Find the step where we first found the target
      const foundIndex = animationSteps.findIndex(step => 
        step.current === personY && step.path.includes(personY)
      );
      
      if (foundIndex !== -1) {
        const finalPath = animationSteps[foundIndex].path;
        setResult(`Related: Path is ${finalPath.join(' → ')}`);
        setPath(finalPath);
      } else {
        // Fallback to the last path that contains personY
        const finalPath = finalAnimationStep.path;
        setResult(`Related: Path is ${finalPath.join(' → ')}`);
        setPath(finalPath);
      }
    } else {
      setResult('Not related.');
      setPath(null);
    }
  };

  // Auto play effect
  useEffect(() => {
    let timerId: number | null = null;
    
    if (autoPlayActive && isAnimating) {
      timerId = window.setTimeout(() => {
        if (currentStep < animationSteps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          completeAnimation();
        }
      }, animationSpeed);
    }
    
    return () => {
      if (timerId !== null) {
        clearTimeout(timerId);
      }
    };
  }, [autoPlayActive, currentStep, animationSteps.length, animationSpeed, isAnimating]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{
        position: 'absolute', left: 10, top: 10, zIndex: 10, background: '#fff',
        padding: 16, borderRadius: 6, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', minWidth: 320
      }}>
        <h3>Relation Graph</h3>
        <div>
          <b>Input relations (one per line, e.g. <code>A B</code>):</b>
          <textarea
            value={relationsInput}
            onChange={e => setRelationsInput(e.target.value)}
            rows={6}
            style={{ width: '100%', marginTop: 6, marginBottom: 10, fontFamily: 'monospace' }}
            disabled={isAnimating}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            Person X:{' '}
            <input
              type="text"
              value={personX}
              onChange={e => setPersonX(e.target.value.trim())}
              style={{ width: 60, marginRight: 10 }}
              disabled={isAnimating}
            />
          </label>
          <label>
            Person Y:{' '}
            <input
              type="text"
              value={personY}
              onChange={e => setPersonY(e.target.value.trim())}
              style={{ width: 60, marginRight: 10 }}
              disabled={isAnimating}
            />
          </label>
          <button 
            onClick={handleCheckRelation} 
            style={{
              padding: '5px 12px', 
              background: '#1976d2', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 3
            }} 
            disabled={isAnimating}
          >
            Check Relation
          </button>
        </div>
        
        {/* Animation Controls */}
        {isAnimating && (
          <div style={{ marginTop: 10, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={handleStepBackward}
                disabled={currentStep <= 0 || autoPlayActive}
                style={{
                  padding: '5px 10px',
                  background: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: 3
                }}
              >
                ◀ Back
              </button>
              
              <div style={{ flex: 1, textAlign: 'center' }}>
                Step {currentStep + 1} of {animationSteps.length}
              </div>
              
              <button
                onClick={handleStepForward}
                disabled={currentStep >= animationSteps.length - 1 || autoPlayActive}
                style={{
                  padding: '5px 10px',
                  background: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: 3
                }}
              >
                Next ▶
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, gap: 8 }}>
              {!autoPlayActive ? (
                <button
                  onClick={handleAutoPlay}
                  style={{
                    padding: '5px 10px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: 3,
                    flex: 1
                  }}
                >
                  ▶ Auto Play
                </button>
              ) : (
                <button
                  onClick={handleStopAutoPlay}
                  style={{
                    padding: '5px 10px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: 3,
                    flex: 1
                  }}
                >
                  ⏹ Stop
                </button>
              )}
              
              <label>
                Speed:
                <select
                  value={animationSpeed}
                  onChange={e => setAnimationSpeed(Number(e.target.value))}
                  disabled={autoPlayActive}
                  style={{ marginLeft: 8 }}
                >
                  <option value="1000">Slow</option>
                  <option value="500">Medium</option>
                  <option value="200">Fast</option>
                </select>
              </label>
            </div>
          </div>
        )}
        
        {result && (
          <div style={{ marginTop: 8, color: path ? '#ff9800' : '#d32f2f', fontWeight: 500 }}>
            {result}
          </div>
        )}
        
        {isAnimating && (
          <div style={{ marginTop: 8, color: '#1976d2', fontWeight: 500 }}>
            Current: {currentAnimation.current || 'None'} - Exploring path: {currentAnimation.path.join(' → ')}
          </div>
        )}
        
        <div style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
          <div>People: {people.join(', ') || '(none)'}</div>
          <div>Relations: {relations.map(([a, b]) => `${a}-${b}`).join(', ') || '(none)'}</div>
        </div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        style={{ background: '#f5f7fa' }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={true}
        panOnScroll={true}
      >
        <Background gap={18} color="#e0e0e0" />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default RelationGraphPage;
