import PriorityQueue from './PriorityQueue.js';

export default class AStarPathfinder {
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