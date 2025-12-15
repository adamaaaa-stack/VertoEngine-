/**
 * Graph class that contains nodes and manages the graph structure.
 */

import { Node } from './node.js';

export interface GraphVariable {
  name: string;
  type: any; // TypeInfo
  defaultValue: any;
}

export class Graph {
  readonly id: string;
  name: string;

  private nodes: Map<string, Node> = new Map();
  private variables: Map<string, any> = new Map();
  private variableDefinitions: Map<string, GraphVariable> = new Map();

  // Event nodes (entry points)
  private eventNodes: Node[] = [];

  constructor(id: string, name: string = 'New Graph') {
    this.id = id;
    this.name = name;
  }

  /**
   * Add a node to the graph.
   */
  addNode(node: Node): void {
    if (this.nodes.has(node.id)) {
      throw new Error(`Node with id ${node.id} already exists`);
    }

    this.nodes.set(node.id, node);

    // Track event nodes
    if (node.category === 'Event' as any) {
      this.eventNodes.push(node);
    }
  }

  /**
   * Remove a node from the graph.
   */
  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Disconnect all pins
    for (const pin of node.getPins()) {
      pin.disconnectAll();
    }

    // Remove from maps
    this.nodes.delete(nodeId);
    const eventIndex = this.eventNodes.indexOf(node);
    if (eventIndex !== -1) {
      this.eventNodes.splice(eventIndex, 1);
    }
  }

  /**
   * Get a node by id.
   */
  getNode(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes.
   */
  getNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all event nodes.
   */
  getEventNodes(): Node[] {
    return this.eventNodes;
  }

  /**
   * Connect two pins.
   */
  connect(fromNodeId: string, fromPinName: string, toNodeId: string, toPinName: string): boolean {
    const fromNode = this.nodes.get(fromNodeId);
    const toNode = this.nodes.get(toNodeId);

    if (!fromNode || !toNode) return false;

    const fromPin = fromNode.getPin(fromPinName);
    const toPin = toNode.getPin(toPinName);

    if (!fromPin || !toPin) return false;

    return fromPin.connect(toPin);
  }

  /**
   * Disconnect two pins.
   */
  disconnect(fromNodeId: string, fromPinName: string, toNodeId: string, toPinName: string): void {
    const fromNode = this.nodes.get(fromNodeId);
    const toNode = this.nodes.get(toNodeId);

    if (!fromNode || !toNode) return;

    const fromPin = fromNode.getPin(fromPinName);
    const toPin = toNode.getPin(toPinName);

    if (!fromPin || !toPin) return;

    fromPin.disconnect(toPin);
  }

  /**
   * Add a variable definition.
   */
  addVariable(name: string, type: any, defaultValue: any): void {
    this.variableDefinitions.set(name, { name, type, defaultValue });
    this.variables.set(name, defaultValue);
  }

  /**
   * Get a variable value.
   */
  getVariable(name: string): any {
    return this.variables.get(name);
  }

  /**
   * Set a variable value.
   */
  setVariable(name: string, value: any): void {
    this.variables.set(name, value);
  }

  /**
   * Get all variable definitions.
   */
  getVariableDefinitions(): GraphVariable[] {
    return Array.from(this.variableDefinitions.values());
  }

  /**
   * Validate the entire graph.
   * Returns array of error messages.
   */
  validate(): string[] {
    const errors: string[] = [];

    // Validate each node
    for (const node of this.nodes.values()) {
      const nodeErrors = node.validate();
      for (const error of nodeErrors) {
        errors.push(`${node.displayName} (${node.id}): ${error}`);
      }
    }

    // Check for cycles in pure node evaluation
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (node: Node): boolean => {
      if (recursionStack.has(node.id)) {
        errors.push(`Cycle detected in pure node evaluation involving ${node.displayName}`);
        return true;
      }

      if (visited.has(node.id)) {
        return false;
      }

      visited.add(node.id);
      recursionStack.add(node.id);

      // Check data input pins
      for (const pin of node.getDataInputPins()) {
        const connectedPin = pin.getConnectedPin();
        if (connectedPin) {
          const connectedNode = this.nodes.get(connectedPin.nodeId);
          if (connectedNode && connectedNode.isPure) {
            if (detectCycle(connectedNode)) {
              return true;
            }
          }
        }
      }

      recursionStack.delete(node.id);
      return false;
    };

    for (const node of this.nodes.values()) {
      if (node.isPure) {
        detectCycle(node);
      }
    }

    // Check for disconnected event nodes
    if (this.eventNodes.length === 0) {
      errors.push('Graph has no event nodes (entry points)');
    }

    return errors;
  }

  /**
   * Clear all cached values in the graph.
   */
  clearCache(): void {
    for (const node of this.nodes.values()) {
      node.clearCache();
    }
  }

  /**
   * Serialize graph for saving.
   */
  serialize(): any {
    return {
      id: this.id,
      name: this.name,
      nodes: Array.from(this.nodes.values()).map(n => n.serialize()),
      variables: Array.from(this.variableDefinitions.values()),
      connections: this.serializeConnections(),
    };
  }

  /**
   * Serialize all connections.
   */
  private serializeConnections(): any[] {
    const connections: any[] = [];
    const processed = new Set<string>();

    for (const node of this.nodes.values()) {
      for (const pin of node.getOutputPins()) {
        for (const connectedPin of pin.connections) {
          const connectionId = `${pin.id}->${connectedPin.id}`;
          if (!processed.has(connectionId)) {
            connections.push({
              from: { nodeId: node.id, pinName: pin.name },
              to: { nodeId: connectedPin.nodeId, pinName: connectedPin.name },
            });
            processed.add(connectionId);
          }
        }
      }
    }

    return connections;
  }

  /**
   * Find all nodes connected via execution flow from a starting node.
   */
  findExecutionPath(startNode: Node): Set<Node> {
    const reachable = new Set<Node>();
    const queue: Node[] = [startNode];

    while (queue.length > 0) {
      const node = queue.shift()!;
      if (reachable.has(node)) continue;

      reachable.add(node);

      // Follow exec output pins
      for (const pin of node.getExecOutputPins()) {
        for (const connectedPin of pin.connections) {
          const connectedNode = this.nodes.get(connectedPin.nodeId);
          if (connectedNode && !reachable.has(connectedNode)) {
            queue.push(connectedNode);
          }
        }
      }
    }

    return reachable;
  }
}
