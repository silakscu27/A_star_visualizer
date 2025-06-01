import React from 'react';

export default function ControlPanel({
  gridSize,
  setGridSize,
  obstacleRatio,
  setObstacleRatio,
  animationSpeed,
  setAnimationSpeed,
  onGenerateGrid,
  onRunAlgorithm,
  onToggleAnimation,
  onClearVisualization,
  isAnimating,
  isAlgorithmRunnable
}) {
  return (
    <div className="mb-6 w-full max-w-2xl bg-white p-4 rounded shadow">
      <div className="text-sm mb-4">
        <h2 className="font-bold mb-2">A* Pathfinding Algorithm Visualization</h2>
        This visualization shows how the A* algorithm explores a grid to find the shortest path from the start node (green) to the goal node (red).
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Legend color="bg-green-500" label="Start" />
        <Legend color="bg-red-500" label="Goal" />
        <Legend color="bg-black" label="Obstacle" />
        <Legend color="bg-cyan-500" label="Open Set (to visit)" />
        <Legend color="bg-gray-500" label="Closed Set (visited)" />
        <Legend color="bg-purple-500" label="Current Node" />
        <Legend color="bg-blue-500" label="Path" />
      </div>

      <div className="flex flex-wrap gap-4 justify-between mb-4">
        <Slider label={`Grid Size: ${gridSize}x${gridSize}`} min={5} max={32} value={gridSize} onChange={e => setGridSize(parseInt(e.target.value))} />
        <Slider label={`Obstacle Ratio: ${obstacleRatio}`} min={0.1} max={0.5} step={0.05} value={obstacleRatio} onChange={e => setObstacleRatio(parseFloat(e.target.value))} />
        <Slider label={`Animation Speed: ${animationSpeed} ms`} min={100} max={900} value={animationSpeed} onChange={e => setAnimationSpeed(parseInt(e.target.value))} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onGenerateGrid} label="Generate New Grid" color="blue" />
        <Button onClick={onRunAlgorithm} label="Run Algorithm" color="green" disabled={!isAlgorithmRunnable} />
        <Button onClick={onToggleAnimation} label={isAnimating ? "Pause Animation" : "Start Animation"} color="purple" disabled={!isAlgorithmRunnable} />
        <Button onClick={onClearVisualization} label="Clear Visualization" color="red" />
      </div>
    </div>
  );
}

const Legend = ({ color, label }) => (
  <div className="flex gap-1 items-center">
    <div className={`w-4 h-4 ${color}`}></div>
    <span className="text-xs">{label}</span>
  </div>
);

const Slider = ({ label, min, max, step = 1, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full" />
  </div>
);

const Button = ({ onClick, label, color, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-${color}-500 text-white rounded hover:bg-${color}-600 disabled:opacity-50`}
  >
    {label}
  </button>
);