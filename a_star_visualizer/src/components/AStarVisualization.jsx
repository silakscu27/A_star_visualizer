import { useState, useEffect, useRef } from 'react';
import GridGraph from '../logic/GridGraph';
import AStarPathfinder from '../logic/AStarPathfinder';
import ControlPanel from './ControlPanel';
import GridDisplay from './GridDisplay';

export default function AStarVisualization() {
  const [grid, setGrid] = useState(null);
  const [pathfinder, setPathfinder] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [gridSize, setGridSize] = useState(32);
  const [obstacleRatio, setObstacleRatio] = useState(0.3);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [isAnimating, setIsAnimating] = useState(false);
  const [start, setStart] = useState(null);
  const [goal, setGoal] = useState(null);
  const animationRef = useRef(null);
  const hasRunRef = useRef(false);

  const clearVisualization = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsAnimating(false);
    pathfinder?.reset();
    hasRunRef.current = false;
  };

  const generateGrid = () => {
    const newGrid = new GridGraph(gridSize, gridSize, obstacleRatio);
    setGrid(newGrid);
    setPathfinder(new AStarPathfinder(newGrid));
    setSteps([]);
    setCurrentStep(0);
    setIsAnimating(false);
    hasRunRef.current = false;

    const validNodes = [];
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const node = `${x},${y}`;
        if (!newGrid.obstacles.has(node)) {
          validNodes.push(node);
        }
      }
    }

    if (validNodes.length < 2) {
      alert("Not enough free cells to place start and goal nodes.");
      setStart(null);
      setGoal(null);
      return;
    }

    if (validNodes.length >= 2) {
      let startNode, goalNode;
      let attempts = 0;
      const minDistance = Math.max(3, Math.floor(gridSize / 3));

      do {
        if (attempts++ > 50) break;
        const startIdx = Math.floor(Math.random() * validNodes.length);
        const goalIdx = Math.floor(Math.random() * validNodes.length);
        if (startIdx === goalIdx) continue;
        startNode = validNodes[startIdx];
        goalNode = validNodes[goalIdx];

        const [startX, startY] = startNode.split(',').map(Number);
        const [goalX, goalY] = goalNode.split(',').map(Number);
        const distance = Math.abs(startX - goalX) + Math.abs(startY - goalY);

        if (distance >= minDistance) {
          setStart(startNode);
          setGoal(goalNode);
          break;
        }
      } while (true);

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

  const runAlgorithm = () => {
    if (!grid || !pathfinder || !start || !goal) return;
    setCurrentStep(0);
    setIsAnimating(false);
    const newSteps = pathfinder.run(start, goal);
    setSteps(newSteps);
    hasRunRef.current = true;
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  useEffect(() => {
    generateGrid();
  }, []);

  useEffect(() => {
    if (isAnimating && steps.length > 0) {
      animationRef.current = setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsAnimating(false);
        }
      }, animationSpeed);
    }
    return () => clearTimeout(animationRef.current);
  }, [isAnimating, currentStep, steps, animationSpeed]);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">A* Pathfinding Visualization</h1>
      <ControlPanel
        gridSize={gridSize}
        setGridSize={setGridSize}
        obstacleRatio={obstacleRatio}
        setObstacleRatio={setObstacleRatio}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        onGenerateGrid={generateGrid}
        onRunAlgorithm={runAlgorithm}
        onToggleAnimation={toggleAnimation}
        onClearVisualization={clearVisualization}
        isAnimating={isAnimating}
        isAlgorithmRunnable={!!grid && start && goal}
      />
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
      <GridDisplay
        grid={grid}
        gridSize={gridSize}
        steps={steps}
        currentStep={currentStep}
        start={start}
        goal={goal}
      />
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
