import { useState, useEffect, useRef } from 'react';

// Priority Queue implementation for A* algorithm
class PriorityQueue {
  constructor() {
    this.elements = [];
  }
  
  empty() {
    return this.elements.length === 0;
  }
  
  put(item, priority) {
    this.elements.push({ item, priority });
    this._sort();
  }
  
  get() {
    if (this.empty()) throw new Error("Priority queue is empty");
    return this.elements.shift().item;
  }
  
  _sort() {
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  
  contains(item) {
    return this.elements.some(element => element.item === item);
  }
  
  update_priority(item, newPriority) {
    const index = this.elements.findIndex(element => element.item === item);
    if (index !== -1 && this.elements[index].priority > newPriority) {
      this.elements[index].priority = newPriority;
      this._sort();
      return true;
    }
    return false;
  }
}

// Grid based graph for the visualization
class GridGraph {
  constructor(width, height, obstacleRatio = 0.3) {
    this.width = width;
    this.height = height;
    this.obstacles = new Set();
    this.nodes = {};
    this.edges = {};
    this.weights = {};
    
    // Create grid nodes
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const node = `${x},${y}`;
        this.nodes[node] = [x, y];
        this.edges[node] = [];
      }
    }
    
    // Add obstacles randomly
    this._addRandomObstacles(obstacleRatio);
    
    // Connect non-obstacle nodes
    this._connectNodes();
  }
  
  _addRandomObstacles(ratio) {
    const totalCells = this.width * this.height;
    const numObstacles = Math.floor(totalCells * ratio);
    
    let count = 0;
    while (count < numObstacles) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      const node = `${x},${y}`;
      
      if (!this.obstacles.has(node)) {
        this.obstacles.add(node);
        count++;
      }
    }
  }
  
  _connectNodes() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const node = `${x},${y}`;
        if (this.obstacles.has(node)) continue;
        
        // Connect to adjacent nodes (up, down, left, right)
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dx, dy] of directions) {
          const nx = x + dx;
          const ny = y + dy;
          const neighbor = `${nx},${ny}`;
          
          if (nx >= 0 && nx < this.width && 
              ny >= 0 && ny < this.height && 
              !this.obstacles.has(neighbor)) {
            this.edges[node].push(neighbor);
            this.weights[`${node}-${neighbor}`] = 1.0;
          }
        }
        
        // Connect to diagonal nodes
        const diagonals = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dx, dy] of diagonals) {
          const nx = x + dx;
          const ny = y + dy;
          const neighbor = `${nx},${ny}`;
          
          if (nx >= 0 && nx < this.width && 
              ny >= 0 && ny < this.height && 
              !this.obstacles.has(neighbor)) {
            this.edges[node].push(neighbor);
            this.weights[`${node}-${neighbor}`] = 1.414; // sqrt(2)
          }
        }
      }
    }
  }
  
  getNeighbors(node) {
    return this.edges[node] || [];
  }
  
  cost(fromNode, toNode) {
    return this.weights[`${fromNode}-${toNode}`] || Infinity;
  }
  
  heuristic(node, goal) {
    const [x1, y1] = node.split(',').map(Number);
    const [x2, y2] = goal.split(',').map(Number);
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
}

// A* Pathfinding algorithm implementation
class AStarPathfinder {
  constructor(graph) {
    this.graph = graph;
    this.reset();
  }
  
  reset() {
    this.cameFrom = {};
    this.costSoFar = {};
    this.openSet = new PriorityQueue();
    this.closedSet = new Set();
    this.current = null;
    this.path = [];
    this.searchCompleted = false;
    this.steps = [];
  }
  
  run(start, goal) {
    this.reset();
    this.start = start;
    this.goal = goal;
    
    // Initialize with start node
    this.openSet.put(start, 0);
    this.cameFrom[start] = null;
    this.costSoFar[start] = 0;
    
    let stepCounter = 0;
    const maxSteps = 1000; // Safety limit to prevent infinite loops
    
    // Step through algorithm and record states
    while (!this.openSet.empty() && stepCounter < maxSteps) {
      stepCounter++;
      this.current = this.openSet.get();
      
      // If we reached the goal, we can finish
      if (this.current === this.goal) {
        this.searchCompleted = true;
        this.path = this._reconstructPathToGoal();
        
        // Save the final state with the complete path
        this.steps.push({
          current: this.current,
          openSet: [...this.openSet.elements.map(el => el.item)],
          closedSet: [...this.closedSet],
          path: this.path
        });
        
        break;
      }
      
      // Add current node to closed set
      this.closedSet.add(this.current);
      
      // Save current state for visualization before exploring neighbors
      this.steps.push({
        current: this.current,
        openSet: [...this.openSet.elements.map(el => el.item)],
        closedSet: [...this.closedSet],
        path: this._reconstructPathToNode(this.current)
      });
      
      // Check all neighbors
      for (const nextNode of this.graph.getNeighbors(this.current)) {
        // Skip if already evaluated
        if (this.closedSet.has(nextNode)) continue;
        
        // Calculate new cost
        const newCost = this.costSoFar[this.current] + this.graph.cost(this.current, nextNode);
        
        // If we found a better path to nextNode
        if (!(nextNode in this.costSoFar) || newCost < this.costSoFar[nextNode]) {
          this.costSoFar[nextNode] = newCost;
          const priority = newCost + this.graph.heuristic(nextNode, goal);
          
          if (this.openSet.contains(nextNode)) {
            this.openSet.update_priority(nextNode, priority);
          } else {
            this.openSet.put(nextNode, priority);
          }
          
          this.cameFrom[nextNode] = this.current;
        }
      }
    }
    
    // If we didn't find a path but exhausted our options
    if (!this.searchCompleted && this.openSet.empty()) {
      // Final state showing we couldn't find a path
      this.steps.push({
        current: this.current,
        openSet: [],
        closedSet: [...this.closedSet],
        path: []
      });
    }
    
    return this.steps;
  }
  
  _reconstructPathToGoal() {
    return this._reconstructPathToNode(this.goal);
  }
  
  _reconstructPathToNode(targetNode) {
    if (targetNode === null || !(targetNode in this.cameFrom)) return [];
    
    const path = [];
    let current = targetNode;
    
    // Trace back from the target node to the start
    while (current !== null) {
      path.push(current);
      current = this.cameFrom[current];
    }
    
    return path.reverse();
  }
}

export default function AStarVisualization() {
  const [grid, setGrid] = useState(null);
  const [pathfinder, setPathfinder] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [gridSize, setGridSize] = useState(32); // 32 × 32 = 1024 nodes
  const [obstacleRatio, setObstacleRatio] = useState(0.3);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [isAnimating, setIsAnimating] = useState(false);
  const [start, setStart] = useState(null);
  const [goal, setGoal] = useState(null);
  const animationRef = useRef(null);
  const hasRunRef = useRef(false);

  // Clear Visualization
  const clearVisualization = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsAnimating(false);
    pathfinder?.reset();
    hasRunRef.current = false;
};

  // Create a new grid
  const generateGrid = () => {
    const newGrid = new GridGraph(gridSize, gridSize, obstacleRatio);
    setGrid(newGrid);
    setPathfinder(new AStarPathfinder(newGrid));
    setSteps([]);
    setCurrentStep(0);
    setIsAnimating(false);
    hasRunRef.current = false;
    
    // Find valid start and goal positions that aren't too close
    const validNodes = [];
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const node = `${x},${y}`;
        if (!newGrid.obstacles.has(node)) {
          validNodes.push(node);
        }
      }
    }
    
    // Choose random start and goal, ensuring they're far enough apart
    if (validNodes.length >= 2) {
      // Try to find points that are reasonably far apart
      let startNode, goalNode;
      let attempts = 0;
      const minDistance = Math.max(3, Math.floor(gridSize / 3)); // Minimum Manhattan distance
      
      do {
        if (attempts++ > 50) break; // Prevent infinite loop
        
        const startIdx = Math.floor(Math.random() * validNodes.length);
        const goalIdx = Math.floor(Math.random() * validNodes.length);
        
        if (startIdx === goalIdx) continue;
        
        startNode = validNodes[startIdx];
        goalNode = validNodes[goalIdx];
        
        // Calculate Manhattan distance
        const [startX, startY] = startNode.split(',').map(Number);
        const [goalX, goalY] = goalNode.split(',').map(Number);
        const distance = Math.abs(startX - goalX) + Math.abs(startY - goalY);
        
        if (distance >= minDistance) {
          setStart(startNode);
          setGoal(goalNode);
          break;
        }
      } while (true);
      
      // If we failed to find good points, just pick any two
      if (attempts > 50) {
        const startIdx = Math.floor(Math.random() * validNodes.length);
        let goalIdx;
        do {
          goalIdx = Math.floor(Math.random() * validNodes.length);
        } while (startIdx === goalIdx);
        
        setStart(validNodes[startIdx]);
        setGoal(validNodes[goalIdx]);
      }
    }
  };
  
  // Run the A* algorithm
  const runAlgorithm = () => {
    if (!grid || !pathfinder || !start || !goal) return;
    
    // Reset any previous run
    setCurrentStep(0);
    setIsAnimating(false);
    
    const newSteps = pathfinder.run(start, goal);
    setSteps(newSteps);
    hasRunRef.current = true;
  };
  
  // Toggle animation
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };
  
  // Initialize on component mount
  useEffect(() => {
    generateGrid();
  }, []);
  
  // Handle animation steps
  useEffect(() => {
    if (isAnimating && steps.length > 0) {
      animationRef.current = setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(prevStep => prevStep + 1);
        } else {
          setIsAnimating(false);
        }
      }, animationSpeed);
    }
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isAnimating, currentStep, steps, animationSpeed]);
  
  // Handle grid cell rendering
  const renderCell = (x, y) => {
    const node = `${x},${y}`;
    
    let cellClass = "w-6 h-6 border border-gray-700";
    
    if (!grid) {
      return <div key={`${x},${y}`} className={`${cellClass} bg-gray-500`} />;
    }
    
    // Check if it's an obstacle
    if (grid.obstacles.has(node)) {
      return <div key={`${x},${y}`} className={`${cellClass} bg-black`} />;
    }
    
    // If we have steps and are currently showing a step
    if (steps.length > 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      
      // Start node
      if (node === start) {
        return <div key={`${x},${y}`} className={`${cellClass} bg-green-500`} />;
      }
      
      // Goal node
      if (node === goal) {
        return <div key={`${x},${y}`} className={`${cellClass} bg-red-500`} />;
      }
      
      // Current node being examined
      if (node === step.current) {
        return <div key={`${x},${y}`} className={`${cellClass} bg-purple-500`} />;
      }
      
      // Path nodes
      if (step.path.includes(node)) {
        return <div key={`${x},${y}`} className={`${cellClass} bg-blue-500`} />;
      }
      
      // Closed set (examined nodes)
      if (step.closedSet.includes(node)) {
        return <div key={`${x},${y}`} className={`${cellClass} bg-gray-500`} />;
      }
      
      // Open set (frontier nodes)
      if (step.openSet.some(item => item === node)) {
        return <div key={`${x},${y}`} className={`${cellClass} bg-cyan-500`} />;
      }
    } else {
      // Special highlighting for start and goal even before algorithm runs
      if (node === start) {
        return <div key={`${x},${y}`} className={`${cellClass} bg-green-500`} />;
      }
      
      if (node === goal) {
        return <div key={`${x},${y}`} className={`${cellClass} bg-red-500`} />;
      }
    }
    
    // Default empty cell
    return <div key={`${x},${y}`} className={`${cellClass} bg-white`} />;
  };
  
  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">A* Pathfinding Visualization</h1>
      
      <div className="mb-6 w-full max-w-2xl bg-white p-4 rounded shadow">
        <div className="text-sm mb-4">
          <h2 className="font-bold mb-2">A* Pathfinding Algorithm Visualization</h2>
          This visualization shows how the A* algorithm explores a grid to find the shortest path from the start node (green) to the goal node (red). 
          The algorithm uses a combination of actual distance traveled (g-cost) and estimated distance to the goal (h-cost) to determine which nodes to explore next.
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex gap-1 items-center">
            <div className="w-4 h-4 bg-green-500"></div>
            <span className="text-xs">Start</span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-4 h-4 bg-red-500"></div>
            <span className="text-xs">Goal</span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-4 h-4 bg-black"></div>
            <span className="text-xs">Obstacle</span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-4 h-4 bg-cyan-500"></div>
            <span className="text-xs">Open Set (to visit)</span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-4 h-4 bg-gray-500"></div>
            <span className="text-xs">Closed Set (visited)</span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-4 h-4 bg-purple-500"></div>
            <span className="text-xs">Current Node</span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-4 h-4 bg-blue-500"></div>
            <span className="text-xs">Path</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-between mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Grid Size: {gridSize}x{gridSize}</label>
            <input
              type="range"
              min="5"
              max="50"
              value={gridSize}
              onChange={(e) => setGridSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Obstacle Ratio: {obstacleRatio}</label>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={obstacleRatio}
              onChange={(e) => setObstacleRatio(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Animation Speed: {animationSpeed} ms</label>
            <input
              type="range"
              min="100"
              max="900"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={generateGrid} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate New Grid
          </button>
          <button 
            onClick={runAlgorithm} 
            disabled={!grid || !start || !goal}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Run Algorithm
          </button>
          <button 
            onClick={toggleAnimation} 
            disabled={!hasRunRef.current || steps.length === 0}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {isAnimating ? "Pause Animation" : "Start Animation"}
          </button>
          <button 
            onClick={clearVisualization} 
            disabled={!grid}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            Clear Visualization
          </button>
        </div>
      </div>
     
      <div className="mb-4">
        {steps.length > 0 && (
          <div className="text-sm mb-2">
            Step {currentStep + 1} of {steps.length}
            <div className="w-full mt-1">
              <input
                type="range"
                min="0"
                max={steps.length - 1}
                value={currentStep}
                onChange={(e) => setCurrentStep(parseInt(e.target.value))}
                className="w-64"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="grid gap-0 bg-gray-800 p-1 rounded">
        {grid && Array.from({ length: gridSize }).map((_, y) => (
          <div key={`row-${y}`} className="flex">
            {Array.from({ length: gridSize }).map((_, x) => renderCell(x, y))}
          </div>
        ))}
      </div>
      
      {steps.length > 0 && steps[currentStep].path.length > 0 && (
        <div className="mt-4 text-sm">
          {steps[currentStep].path.length > 1 ? (
            <p>Current path length: {steps[currentStep].path.length - 1} steps</p>
          ) : (
            <p>Exploring from start...</p>
          )}
        </div>
      )}
      
      {steps.length > 0 && currentStep === steps.length - 1 && (
        <div className="mt-4 p-2 bg-green-100 border border-green-300 rounded">
          {pathfinder.searchCompleted ? (
            <p className="font-medium">Path found! Length: {steps[currentStep].path.length - 1} steps</p>
          ) : (
            <p className="font-medium text-red-600">No path found between start and goal!</p>
          )}
        </div>
      )}
    </div>
  );
}