import { v4 as uuid } from "uuid";
import { IGraph, IConnection, IVariable, PinType } from "../types";
import { Node } from "./Node";
import { Pin } from "./Pin";

export class Connection implements IConnection {
  id: string;
  fromPinId: string;
  toPinId: string;
  fromNodeId: string;
  toNodeId: string;

  constructor(
    fromPinId: string,
    toPinId: string,
    fromNodeId: string,
    toNodeId: string,
    id?: string
  ) {
    this.id = id || uuid();
    this.fromPinId = fromPinId;
    this.toPinId = toPinId;
    this.fromNodeId = fromNodeId;
    this.toNodeId = toNodeId;
  }

  toJSON(): IConnection {
    return {
      id: this.id,
      fromPinId: this.fromPinId,
      toPinId: this.toPinId,
      fromNodeId: this.fromNodeId,
      toNodeId: this.toNodeId,
    };
  }
}

export class Variable implements IVariable {
  id: string;
  name: string;
  type: PinType;
  defaultValue?: any;
  isPublic?: boolean;
  isArray?: boolean;

  constructor(
    name: string,
    type: PinType,
    options: {
      defaultValue?: any;
      isPublic?: boolean;
      isArray?: boolean;
      id?: string;
    } = {}
  ) {
    this.id = options.id || uuid();
    this.name = name;
    this.type = type;
    this.defaultValue = options.defaultValue;
    this.isPublic = options.isPublic || false;
    this.isArray = options.isArray || false;
  }

  toJSON(): IVariable {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      defaultValue: this.defaultValue,
      isPublic: this.isPublic,
      isArray: this.isArray,
    };
  }
}

export class Graph {
  id: string;
  name: string;
  version: string = "1.0.0";
  private nodeMap: Map<string, Node> = new Map();
  private connectionMap: Map<string, Connection> = new Map();
  private variableMap: Map<string, Variable> = new Map();

  constructor(name: string, id?: string) {
    this.id = id || uuid();
    this.name = name;
  }

  // Add a node to the graph
  addNode(node: Node): void {
    this.nodeMap.set(node.id, node);
  }

  // Remove a node and all its connections
  removeNode(nodeId: string): void {
    // Remove all connections involving this node
    const connectionsToRemove = Array.from(this.connectionMap.values()).filter(
      (c) => c.fromNodeId === nodeId || c.toNodeId === nodeId
    );
    connectionsToRemove.forEach((c) => this.connectionMap.delete(c.id));

    this.nodeMap.delete(nodeId);
  }

  // Get a node by ID
  getNode(nodeId: string): Node | undefined {
    return this.nodeMap.get(nodeId);
  }

  // Get all nodes
  getAllNodes(): Node[] {
    return Array.from(this.nodeMap.values());
  }

  // Add a connection between two pins
  addConnection(
    fromNodeId: string,
    fromPinId: string,
    toNodeId: string,
    toPinId: string
  ): Connection | null {
    const fromNode = this.getNode(fromNodeId);
    const toNode = this.getNode(toNodeId);

    if (!fromNode || !toNode) {
      return null;
    }

    const fromPin = fromNode.pins.find((p) => p.id === fromPinId);
    const toPin = toNode.pins.find((p) => p.id === toPinId);

    if (!fromPin || !toPin) {
      return null;
    }

    // Validate connection
    if (!fromPin.canConnectTo(toPin)) {
      return null;
    }

    // Check for duplicate connections (only for exec pins)
    if (fromPin.type === "Exec") {
      const existingConnection = Array.from(this.connectionMap.values()).find(
        (c) => c.fromPinId === fromPinId && c.toPinId === toPinId
      );
      if (existingConnection) {
        return null;
      }
    }

    const connection = new Connection(
      fromPinId,
      toPinId,
      fromNodeId,
      toNodeId
    );
    this.connectionMap.set(connection.id, connection);
    return connection;
  }

  // Remove a connection
  removeConnection(connectionId: string): void {
    this.connectionMap.delete(connectionId);
  }

  // Get connections from a pin
  getConnectionsFromPin(pinId: string): Connection[] {
    return Array.from(this.connectionMap.values()).filter(
      (c) => c.fromPinId === pinId
    );
  }

  // Get connections to a pin
  getConnectionsToPin(pinId: string): Connection[] {
    return Array.from(this.connectionMap.values()).filter(
      (c) => c.toPinId === pinId
    );
  }

  // Get all connections from a node
  getConnectionsFromNode(nodeId: string): Connection[] {
    return Array.from(this.connectionMap.values()).filter(
      (c) => c.fromNodeId === nodeId
    );
  }

  // Get all connections to a node
  getConnectionsToNode(nodeId: string): Connection[] {
    return Array.from(this.connectionMap.values()).filter(
      (c) => c.toNodeId === nodeId
    );
  }

  // Add a variable
  addVariable(variable: Variable): void {
    this.variableMap.set(variable.id, variable);
  }

  // Remove a variable
  removeVariable(variableId: string): void {
    this.variableMap.delete(variableId);
  }

  // Get a variable
  getVariable(variableId: string): Variable | undefined {
    return this.variableMap.get(variableId);
  }

  // Get variable by name
  getVariableByName(name: string): Variable | undefined {
    return Array.from(this.variableMap.values()).find((v) => v.name === name);
  }

  // Get all variables
  getAllVariables(): Variable[] {
    return Array.from(this.variableMap.values());
  }

  // Validate the entire graph
  validate(): string[] {
    const errors: string[] = [];

    // Validate each node
    for (const node of this.nodeMap.values()) {
      const nodeErrors = node.validate();
      errors.push(
        ...nodeErrors.map((e) => `Node ${node.id} (${node.type}): ${e}`)
      );
    }

    // Validate connections
    for (const connection of this.connectionMap.values()) {
      const fromNode = this.getNode(connection.fromNodeId);
      const toNode = this.getNode(connection.toNodeId);

      if (!fromNode || !toNode) {
        errors.push(`Connection ${connection.id}: nodes not found`);
      }

      const fromPin = fromNode?.pins.find((p) => p.id === connection.fromPinId);
      const toPin = toNode?.pins.find((p) => p.id === connection.toPinId);

      if (!fromPin || !toPin) {
        errors.push(`Connection ${connection.id}: pins not found`);
      }
    }

    return errors;
  }

  toJSON(): IGraph {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      nodes: Array.from(this.nodeMap.values()).map((n) => n.toJSON()),
      connections: Array.from(this.connectionMap.values()).map((c) =>
        c.toJSON()
      ),
      variables: Array.from(this.variableMap.values()).map((v) => v.toJSON()),
    };
  }
}
