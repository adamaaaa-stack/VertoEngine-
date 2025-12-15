/**
 * Node registry initialization
 * This file imports all node types to register them with the NodeRegistry
 */

import "./EventNodes";
import "./FlowControlNodes";
import "./ValueNodes";
import "./MathNodes";
import "./VectorStringNodes";
import "./ActionNodes";

import { NodeRegistry } from "./NodeRegistry";

export { NodeRegistry };

// Get the registry instance to ensure all nodes are registered
const registry = NodeRegistry.getInstance();

// Export function to get all available node types
export function getAvailableNodeTypes(): Record<string, { type: string; title: string; description?: string }[]> {
  return registry.getNodesByCategory();
}

// Export function to create a node by type
export function createNode(type: string, options?: { id?: string; x?: number; y?: number }) {
  return registry.createNode(type, options);
}
