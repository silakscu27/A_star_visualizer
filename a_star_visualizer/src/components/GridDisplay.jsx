import React from 'react';

export default function GridDisplay({ grid, gridSize, steps, currentStep, start, goal }) {
  const renderCell = (x, y) => {
    const node = `${x},${y}`;
    let cellClass = "w-6 h-6 border border-gray-700";

    if (!grid) return <div key={node} className={`${cellClass} bg-gray-500`} />;
    if (grid.obstacles.has(node)) return <div key={node} className={`${cellClass} bg-black`} />;

    if (steps.length > 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      if (node === start) return <div key={node} className={`${cellClass} bg-green-500`} />;
      if (node === goal) return <div key={node} className={`${cellClass} bg-red-500`} />;
      if (node === step.current) return <div key={node} className={`${cellClass} bg-purple-500`} />;
      if (step.path.includes(node)) return <div key={node} className={`${cellClass} bg-blue-500`} />;
      if (step.closedSet.includes(node)) return <div key={node} className={`${cellClass} bg-gray-500`} />;
      if (step.openSet.includes(node)) return <div key={node} className={`${cellClass} bg-cyan-500`} />;
    } else {
      if (node === start) return <div key={node} className={`${cellClass} bg-green-500`} />;
      if (node === goal) return <div key={node} className={`${cellClass} bg-red-500`} />;
    }

    return <div key={node} className={`${cellClass} bg-white`} />;
  };

  return (
    <div className="grid gap-0 bg-gray-800 p-1 rounded">
      {grid && Array.from({ length: gridSize }).map((_, y) => (
        <div key={`row-${y}`} className="flex">
          {Array.from({ length: gridSize }).map((_, x) => renderCell(x, y))}
        </div>
      ))}
    </div>
  );
}
