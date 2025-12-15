/**
 * Verto Engine - Main Entry Point
 * Exports all core systems for the visual scripting engine
 */

// Graph system
export { Graph, Connection, Variable } from "./graph/Graph";
export { Node } from "./graph/Node";
export { Pin } from "./graph/Pin";

// Execution system
export { ExecutionEngine } from "./execution/ExecutionEngine";

// Node registry
export { NodeRegistry } from "./nodes/NodeRegistry";

// Node implementations (all registered)
export {
  getAvailableNodeTypes,
  createNode,
} from "./nodes/index";

// Types
export {
  PinType,
  PinDirection,
  NodeExecutionState,
  IPin,
  IConnection,
  INode,
  IGraph,
  IVariable,
  ExecutionResult,
  PinValue,
  NodeExecutionContext,
} from "./types/index";

/**
 * Create and initialize a new graph
 */
export function createNewGraph(name: string = "Untitled") {
  const { Graph } = require("./graph/Graph");
  return new Graph(name);
}

/**
 * Create execution engine for a graph
 */
export function createExecutionEngine(graph: any) {
  const { ExecutionEngine } = require("./execution/ExecutionEngine");
  return new ExecutionEngine(graph);
}

/**
 * Get all available node categories
 */
export function getNodeCategories() {
  const { getAvailableNodeTypes } = require("./nodes/index");
  return getAvailableNodeTypes();
}
