import { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ControlPanel } from '../components/ControlPanel';
import { PuzzleGridDisplay } from '../components/PuzzleGridDisplay';

// --- 8 Puzzle Logic ---
const initialPuzzle = [
  [1, 2, 3],
  [4, 0, 6],
  [7, 5, 8],
];

const goalPuzzle = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0],
];

function clonePuzzle(puzzle: number[][]) {
  return puzzle.map((row) => [...row]);
}

function puzzleToString(puzzle: number[][]) {
  return puzzle.flat().join(',');
}

function findZero(puzzle: number[][]) {
  for (let i = 0; i < 3; ++i)
    for (let j = 0; j < 3; ++j)
      if (puzzle[i][j] === 0) return [i, j];
  return [-1, -1];
}

function getNeighbors(puzzle: number[][]) {
  const [i, j] = findZero(puzzle);
  const moves = [
    [i - 1, j],
    [i + 1, j],
    [i, j - 1],
    [i, j + 1],
  ];
  const neighbors: number[][][] = [];
  for (const [ni, nj] of moves) {
    if (ni >= 0 && ni < 3 && nj >= 0 && nj < 3) {
      const newPuzzle = clonePuzzle(puzzle);
      newPuzzle[i][j] = newPuzzle[ni][nj];
      newPuzzle[ni][nj] = 0;
      neighbors.push(newPuzzle);
    }
  }
  return neighbors;
}

// --- Step-by-step BFS Generator ---
function* bfsStepGenerator(
  start: number[][],
  goal: number[][],
  maxDepth = 30
) {
  const visited = new Set<string>();
  const parent: Record<string, string | null> = {};
  const queue: { puzzle: number[][]; depth: number; from: string | null }[] = [
    { puzzle: clonePuzzle(start), depth: 0, from: null },
  ];
  const explored: string[] = [];
  let foundKey: string | null = null;

  while (queue.length > 0) {
    yield {
      explored: [...explored],
      currentPath: [],
      found: !!foundKey,
      parent: { ...parent },
      foundKey,
      queueSnapshot: queue.map(s => ({ key: puzzleToString(s.puzzle), depth: s.depth, from: s.from })),
      processing: false, 
    };

    const { puzzle, depth, from } = queue.shift()!;
    const key = puzzleToString(puzzle);

    if (visited.has(key) || depth > maxDepth) {
      yield {
        explored: [...explored],
        currentPath: [],
        found: !!foundKey,
        parent: { ...parent },
        foundKey,
        queueSnapshot: queue.map(s => ({ key: puzzleToString(s.puzzle), depth: s.depth, from: s.from })),
        processing: false, 
      };
      continue;
    }

    visited.add(key);
    parent[key] = from;
    if (!explored.includes(key)) {
        explored.push(key);
    }

    let currentProcessingPath: string[] = [];
    let k: string | null = key;
    while (k) {
      currentProcessingPath.unshift(k);
      k = parent[k];
    }

    const isGoal = key === puzzleToString(goal);
    if (isGoal) foundKey = key;

    yield {
      explored: [...explored],
      currentPath: currentProcessingPath,
      found: isGoal,
      parent: { ...parent },
      foundKey,
      queueSnapshot: queue.map(s => ({ key: puzzleToString(s.puzzle), depth: s.depth, from: s.from })),
      processing: true, 
      processedNodeKey: key,
    };

    if (isGoal) return;

    const neighbors = getNeighbors(puzzle);
    for (const neighborPuzzle of neighbors) {
      const neighborKey = puzzleToString(neighborPuzzle);
      if (!visited.has(neighborKey) && !queue.find(s => puzzleToString(s.puzzle) === neighborKey)) {
        queue.push({ puzzle: neighborPuzzle, depth: depth + 1, from: key });
      }
    }
  }
  yield {
    explored: [...explored],
    currentPath: [],
    found: !!foundKey,
    parent: { ...parent },
    foundKey,
    queueSnapshot: [],
    processing: false,
  };
}

// --- Puzzle Grid Component ---
const PuzzleGrid = memo(function PuzzleGrid({ puzzle }: { puzzle: number[][] }) {
  return <PuzzleGridDisplay puzzle={puzzle} />;
});

// --- 8 Puzzle Page Component ---
const EightPuzzlePage: React.FC = () => {
  const [puzzle, setPuzzle] = useState<number[][]>(clonePuzzle(initialPuzzle));
  const [input, setInput] = useState(puzzleToString(initialPuzzle));
  const [graphNodes, setGraphNodes] = useState<Node[]>([]);
  const [graphEdges, setGraphEdges] = useState<Edge[]>([]);
  
  const [currentBfsPath, setCurrentBfsPath] = useState<string[]>([]);
  const [parentMap, setParentMap] = useState<Record<string, string | null>>({});
  const [finished, setFinished] = useState(false);
  const [foundSolution, setFoundSolution] = useState(false);
  const [exploredNodes, setExploredNodes] = useState<string[]>([]);
  const [solutionPath, setSolutionPath] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDelay, setAnimationDelay] = useState(300); // ms

  const [expandedByUser, setExpandedByUser] = useState<Set<string>>(() => new Set([puzzleToString(initialPuzzle)]));
  const [latestQueueSnapshot, setLatestQueueSnapshot] = useState<Array<{ key: string; depth: number; from: string | null }>>([]);

  const bfsGenRef = useRef<Generator<any, void, unknown> | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const resetVisualization = useCallback(() => {
    setGraphNodes([]);
    setGraphEdges([]);
    setCurrentBfsPath([]);
    setParentMap({});
    setFinished(false);
    setFoundSolution(false);
    setExploredNodes([]);
    setSolutionPath([]);
    setExpandedByUser(new Set([puzzleToString(puzzle)])); 
    setLatestQueueSnapshot([]);
    bfsGenRef.current = null;
    if (animationFrameId.current) {
      clearTimeout(animationFrameId.current);
      animationFrameId.current = null;
    }
    setIsAnimating(false);
  }, [puzzle]);

  const handleEdit = () => {
    const nums = input.split(',').map(Number);
    if (nums.length === 9 && nums.every((n) => n >= 0 && n <= 8)) {
      const newPuzzleData = [
        nums.slice(0, 3),
        nums.slice(3, 6),
        nums.slice(6, 9),
      ];
      setPuzzle(newPuzzleData); 
      resetVisualization(); 
    } else {
      alert('Invalid input. Enter 9 numbers (0-8) separated by commas.');
    }
  };
  
  const processBfsStep = useCallback(() => {
    if (!bfsGenRef.current) return true;

    const result = bfsGenRef.current.next();

    if (result.done) {
      setFinished(true);
      setIsAnimating(false);
      if (foundSolution && solutionPath.length === 0 && Object.keys(parentMap).length > 0 && currentBfsPath.length > 0) {
        let finalSolutionPath: string[] = [];
        const lastKey = currentBfsPath[currentBfsPath.length - 1];
        if (lastKey) {
          let k: string | null = lastKey;
          while (k && parentMap[k] !== undefined) { 
            finalSolutionPath.unshift(k);
            k = parentMap[k];
          }
          if (k) finalSolutionPath.unshift(k); 
          setSolutionPath(finalSolutionPath);
          // Expand all nodes along the solution path
          setExpandedByUser(prev => {
            const newSet = new Set(prev);
            finalSolutionPath.forEach(key => newSet.add(key));
            return newSet;
          });
        }
      }
      return true; 
    }

    const { explored, currentPath, found, parent, foundKey, queueSnapshot } = result.value;
    
    setExploredNodes(explored);
    setCurrentBfsPath(currentPath);
    setParentMap(parent);
    setFoundSolution(found);
    setLatestQueueSnapshot(queueSnapshot || []);

    if (foundKey) {
      let currentSolution: string[] = [];
      let k: string | null = foundKey;
      while (k && parent[k] !== undefined) {
        currentSolution.unshift(k);
        k = parent[k];
      }
      if (k) currentSolution.unshift(k);
      setSolutionPath(currentSolution);
      // Expand all nodes along the solution path
      setExpandedByUser(prev => {
        const newSet = new Set(prev);
        currentSolution.forEach(key => newSet.add(key));
        return newSet;
      });
    }
    
    if (found) {
      setFinished(true);
      setIsAnimating(false);
    }
    return false; 
  }, [foundSolution, solutionPath, parentMap, currentBfsPath]);

  useEffect(() => {
    const initialKey = puzzleToString(puzzle);
    const currentContextExpanded = new Set(expandedByUser);
    if (!currentContextExpanded.has(initialKey) && exploredNodes.length === 0) { 
        currentContextExpanded.add(initialKey);
    }

    const nodesToRender: Node[] = [];
    const edgesToRender: Edge[] = [];
    
    const nodePositions: Record<string, {x: number, y: number, depth: number}> = {};
    const yCountsAtDepth: Record<number, number> = {};
    const nodeBaseY = 50;
    const nodeYSpacing = 150;
    const nodeXSpacing = 180;

    const allNodesForLayout = new Set([...exploredNodes, ...latestQueueSnapshot.map(item => item.key)]);
    if (exploredNodes.length === 0 && latestQueueSnapshot.length === 0) {
        allNodesForLayout.add(initialKey);
    }

    const getDepth = (key: string, pMap: Record<string, string | null>, frontier: typeof latestQueueSnapshot): number => {
        const frontierItem = frontier.find(s => s.key === key);
        if (frontierItem) return frontierItem.depth;

        let d = 0;
        let tempKey: string | null = key;
        const visitedInPath = new Set<string>();
        while(pMap[tempKey!] && tempKey !== pMap[tempKey!] && d < 100) {
            if(visitedInPath.has(tempKey!)) break;
            visitedInPath.add(tempKey!);
            tempKey = pMap[tempKey!];
            d++;
        }
        return d;
    };
    
    const sortedNodesForLayout = Array.from(allNodesForLayout).sort((a,b) => {
        const depthA = getDepth(a, parentMap, latestQueueSnapshot);
        const depthB = getDepth(b, parentMap, latestQueueSnapshot);
        if (depthA !== depthB) return depthA - depthB;
        const indexA = exploredNodes.indexOf(a);
        const indexB = exploredNodes.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        return a.localeCompare(b);
    });

    sortedNodesForLayout.forEach(key => {
        const depth = getDepth(key, parentMap, latestQueueSnapshot);
        yCountsAtDepth[depth] = (yCountsAtDepth[depth] || 0) + 1;
        nodePositions[key] = { x: depth * nodeXSpacing, y: nodeBaseY + (yCountsAtDepth[depth] -1) * nodeYSpacing, depth };
    });
    
    const renderableKeys = new Set<string>();
    if (allNodesForLayout.size > 0) {
        renderableKeys.add(initialKey); 

        currentContextExpanded.forEach(expandedKey => {
            renderableKeys.add(expandedKey); 
            exploredNodes.forEach(childKey => {
                if (parentMap[childKey] === expandedKey) {
                    renderableKeys.add(childKey);
                }
            });
            latestQueueSnapshot.forEach(stackItem => {
                if (stackItem.from === expandedKey && !exploredNodes.includes(stackItem.key)) {
                    renderableKeys.add(stackItem.key);
                }
            });
        });
    }

    renderableKeys.forEach(key => {
        const pos = nodePositions[key];
        if (!pos) { 
            if (key === initialKey && !nodePositions[key]) { 
                 nodePositions[initialKey] = { x: 0, y: nodeBaseY, depth: 0 };
            } else {
                return;
            }
        }

        const puzzleArr = key.split(',').map(Number);
        const pz: number[][] = [puzzleArr.slice(0,3), puzzleArr.slice(3,6), puzzleArr.slice(6,9)];
        
        let border = '1px solid #bbb'; 
        let background = '#f0f0f0';
        let zIndex = 2;

        const isExploredNode = exploredNodes.includes(key);
        const isPlannedNode = latestQueueSnapshot.some(item => item.key === key && !isExploredNode);
        const isActuallyExpanded = expandedByUser.has(key);

        let labelSuffix = "";
        if (isPlannedNode) {
            border = '1px dashed #ccc'; background = '#fdfdfd'; zIndex = 1;
        }
        
        const parentNodeKey = parentMap[key] || latestQueueSnapshot.find(item => item.key === key)?.from;
        const isExpandableChild = parentNodeKey && expandedByUser.has(parentNodeKey) && !isActuallyExpanded && key !== initialKey;

        if (isExpandableChild) {
            background = '#e6f7ff'; 
            border = '1px solid #91d5ff';
            labelSuffix = " (+)";
        }

        if (currentBfsPath.includes(key)) {
            const isProcessingNode = currentBfsPath.length > 0 && key === currentBfsPath[currentBfsPath.length -1] && isAnimating;
            border = `2px solid ${isProcessingNode ? '#007bff' : '#6c757d'}`; 
            background = isProcessingNode ? '#cce5ff' : '#e9ecef';
            zIndex = 3;
        }
        if (solutionPath.length && solutionPath.includes(key)) {
            border = '2px solid #ff9800'; background = '#fff3cd'; zIndex = 4;
        }
        
        nodesToRender.push({
            id: key,
            data: { label: ( <div> <PuzzleGrid puzzle={pz} /> <div style={{ fontSize: 10, color: '#888' }}>D:{pos.depth}{labelSuffix}</div> </div> ) },
            position: {x: pos.x, y: pos.y},
            style: { width: 110, padding: 4, border, background, zIndex },
            type: 'default',
        });
    });
    
    exploredNodes.forEach(key => {
        const from = parentMap[key];
        if (from && renderableKeys.has(from) && renderableKeys.has(key)) { 
            let stroke = '#bbb'; let strokeWidth = 1.5; let animated = false; let edgeZIndex = 1;
            if (solutionPath.length && solutionPath.includes(from) && solutionPath.includes(key)) {
                stroke = '#ff9800'; strokeWidth = 2.5; animated = true; edgeZIndex = 3;
            } else if (currentBfsPath.includes(from) && currentBfsPath.includes(key)) {
                stroke = '#6c757d'; strokeWidth = 2; edgeZIndex = 2;
            }
            edgesToRender.push({ id: `real-${from}->${key}`, source: from, target: key, animated, style: { stroke, strokeWidth, zIndex: edgeZIndex }, type: 'smoothstep'});
        }
    });

    latestQueueSnapshot.forEach(item => {
        if (item.from && renderableKeys.has(item.from) && renderableKeys.has(item.key) && !exploredNodes.includes(item.key)) {
             edgesToRender.push({
                id: `planned-${item.from}->${item.key}`, source: item.from, target: item.key, animated: false,
                style: { stroke: '#adb5bd', strokeWidth: 1, strokeDasharray: '5 5', zIndex: 0 }, type: 'smoothstep'
            });
        }
    });

    setGraphNodes(nodesToRender);
    setGraphEdges(edgesToRender);

  }, [
    exploredNodes, parentMap, currentBfsPath, solutionPath, expandedByUser, latestQueueSnapshot,
    puzzle, isAnimating 
  ]);


  const runAnimation = useCallback(() => {
    if (!isAnimating) return;
    
    const isDone = processBfsStep();
    if (isDone || finished) {
      setIsAnimating(false);
      if (animationFrameId.current) clearTimeout(animationFrameId.current);
      return;
    }
    animationFrameId.current = window.setTimeout(runAnimation, animationDelay);
  }, [isAnimating, processBfsStep, animationDelay, finished]);


  const handleStartAnimation = () => {
    resetVisualization(); 
    bfsGenRef.current = bfsStepGenerator(puzzle, goalPuzzle, 30);
    setLatestQueueSnapshot([]);
    setIsAnimating(true);
  };
  
  const handleStopAnimation = () => {
      setIsAnimating(false);
      if(animationFrameId.current) {
          clearTimeout(animationFrameId.current);
          animationFrameId.current = null;
      }
  };

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (finished && !isAnimating) { 
         setExpandedByUser(prev => {
            const newSet = new Set(prev);
            if (newSet.has(node.id)) {
            } else {
                newSet.add(node.id);
            }
            return newSet;
        });
    } else if (!isAnimating) { 
        setExpandedByUser(prev => {
            const newSet = new Set(prev);
            if (newSet.has(node.id)) {
            } else {
                newSet.add(node.id);
            }
            return newSet;
        });
    }
  }, [isAnimating, finished]);


  useEffect(() => {
    if (isAnimating) {
      runAnimation();
    } else {
      if (animationFrameId.current) {
        clearTimeout(animationFrameId.current);
        animationFrameId.current = null;
      }
    }
    return () => { 
      if (animationFrameId.current) {
        clearTimeout(animationFrameId.current);
      }
    };
  }, [isAnimating, runAnimation]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ControlPanel
        input={input}
        onInputChange={setInput}
        onSetState={handleEdit}
        onStartAnimation={handleStartAnimation}
        onStopAnimation={handleStopAnimation}
        isAnimating={isAnimating}
        animationDelay={animationDelay}
        onAnimationDelayChange={setAnimationDelay}
        foundSolution={foundSolution}
        solutionPathLength={solutionPath.length}
        currentBfsPathLength={currentBfsPath.length}
        finished={finished}
        exploredNodesLength={exploredNodes.length}
        latestQueueSnapshotLength={latestQueueSnapshot.length}
        graphNodesLength={graphNodes.length}
      />
      <ReactFlow
        nodes={graphNodes}
        edges={graphEdges}
        onNodeClick={handleNodeClick} 
        fitView
        fitViewOptions={{ padding: 0.3, duration: 300 }}
        style={{ background: '#e9ecef' }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnScroll={true}
      >
        <Background gap={20} color="#ced4da"/>
        <MiniMap nodeColor={n => {
            if (solutionPath.includes(n.id)) return '#ffc107';
            if (currentBfsPath.includes(n.id)) return '#007bff';
            const nodeData = graphNodes.find(gn => gn.id === n.id);
            if (typeof nodeData?.style?.border === 'string' && nodeData.style.border.includes('dashed')) return '#adb5bd'; 
            if (expandedByUser.has(n.id) && n.id !== puzzleToString(puzzle)) return '#52c41a'; 
            return '#6c757d'; 
        }}/>
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default EightPuzzlePage;