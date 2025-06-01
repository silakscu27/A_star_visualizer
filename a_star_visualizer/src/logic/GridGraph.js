// Grid based graph for the visualization
export default class GridGraph {
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