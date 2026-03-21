// pathfinding.js — BFS shortest path
export function findShortestPath(graph, start, end) {
  if (start === end) return [start];
  const queue = [[start]];
  const visited = new Set([start]);
  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];
    for (const nb of graph[node] || []) {
      if (nb === end) return [...path, nb];
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push([...path, nb]);
      }
    }
  }
  return null;
}
