import { Graph, Connection } from "../graph/Graph";
import { Node } from "../graph/Node";
import { Pin } from "../graph/Pin";
import { PinType, PinDirection, NodeExecutionState, ExecutionResult } from "../types";

interface ExecutionNode {
  node: Node;
  inputs: Record<string, any>;
  state: NodeExecutionState;
  outputs: Record<string, any>;
  error?: string;
}

interface LatentExecution {
  id: string;
  nodeId: string;
  resumePin: string;
}

export class ExecutionEngine {
  private graph: Graph;
  private executionNodes: Map<string, ExecutionNode> = new Map();
  private executionStack: string[] = []; // Stack of node IDs to execute
  private variables: Record<string, any> = {};
  private latentExecutions: Map<string, LatentExecution> = new Map();
  private executedNodeCount: number = 0;
  private maxExecutions: number = 10000; // Prevent infinite loops
  private isRunning: boolean = false;
  private onNodeExecuted?: (nodeId: string, result: ExecutionResult) => void;
  private onError?: (error: string) => void;
  private onCompleted?: () => void;

  constructor(graph: Graph) {
    this.graph = graph;
    this.initializeVariables();
  }

  // Initialize graph variables
  private initializeVariables(): void {
    for (const variable of this.graph.getAllVariables()) {
      this.variables[variable.name] = variable.defaultValue;
    }
  }

  // Set callbacks
  setCallbacks(
    onNodeExecuted?: (nodeId: string, result: ExecutionResult) => void,
    onError?: (error: string) => void,
    onCompleted?: () => void
  ): void {
    this.onNodeExecuted = onNodeExecuted;
    this.onError = onError;
    this.onCompleted = onCompleted;
  }

  // Find event entry nodes (BeginPlay, etc.)
  private findEventEntryNodes(): string[] {
    return this.graph
      .getAllNodes()
      .filter((n) => n.type === "BeginPlay" || n.type === "Tick")
      .map((n) => n.id);
  }

  // Evaluate a pure data pin to get its value
  private evaluatePin(pinId: string): any {
    const pin = this.findPin(pinId);
    if (!pin) return undefined;

    // If this pin is connected, evaluate the connected output pin
    const incomingConnections = this.graph.getConnectionsToPin(pinId);
    if (incomingConnections.length > 0) {
      const connection = incomingConnections[0];
      const sourceNode = this.graph.getNode(connection.fromNodeId);
      if (sourceNode) {
        return this.evaluateDataPin(connection.fromPinId, sourceNode);
      }
    }

    // Otherwise return default value
    return pin.defaultValue;
  }

  // Evaluate a data pin from a pure node
  private evaluateDataPin(pinId: string, node: Node): any {
    // Check if node is already evaluated in this execution
    const execNode = this.executionNodes.get(node.id);
    if (execNode && execNode.state === NodeExecutionState.Completed) {
      return execNode.outputs[pinId];
    }

    // Evaluate pure nodes recursively
    if (node.isPure) {
      const inputValues: Record<string, any> = {};
      for (const inputPin of node.pins.filter(
        (p) => p.direction === PinDirection.Input && p.type !== PinType.Exec
      )) {
        inputValues[inputPin.name] = this.evaluatePin(inputPin.id);
      }

      const result = node.execute(inputValues);
      const execNode: ExecutionNode = {
        node,
        inputs: inputValues,
        state: NodeExecutionState.Completed,
        outputs: result.outputs || {},
      };
      this.executionNodes.set(node.id, execNode);

      return result.outputs?.[pinId];
    }

    return undefined;
  }

  // Find a pin by ID in the graph
  private findPin(pinId: string): Pin | undefined {
    for (const node of this.graph.getAllNodes()) {
      const pin = node.pins.find((p) => p.id === pinId);
      if (pin) return pin;
    }
    return undefined;
  }

  // Get next exec pins to execute after this node
  private getNextExecPins(
    nodeId: string,
    executedPin?: string
  ): { pin: Pin; connection: Connection }[] {
    const node = this.graph.getNode(nodeId);
    if (!node) return [];

    // Get outgoing exec connections
    const outConnections = this.graph
      .getConnectionsFromNode(nodeId)
      .filter((c) => {
        const fromPin = node.pins.find((p) => p.id === c.fromPinId);
        return fromPin && fromPin.type === PinType.Exec;
      });

    return outConnections
      .map((conn) => {
        const fromPin = node.pins.find((p) => p.id === conn.fromPinId);
        return fromPin ? { pin: fromPin, connection: conn } : null;
      })
      .filter((x) => x !== null) as { pin: Pin; connection: Connection }[];
  }

  // Execute a single node
  private executeNode(nodeId: string): void {
    const node = this.graph.getNode(nodeId);
    if (!node || this.executedNodeCount >= this.maxExecutions) {
      if (this.executedNodeCount >= this.maxExecutions) {
        const error = "Execution limit exceeded - possible infinite loop";
        this.onError?.(error);
      }
      return;
    }

    this.executedNodeCount++;

    // Gather inputs
    const inputValues: Record<string, any> = {};
    for (const pin of node.pins.filter(
      (p) => p.direction === PinDirection.Input
    )) {
      if (pin.type === PinType.Exec) continue; // Skip exec pins

      const incomingConnections = this.graph.getConnectionsToPin(pin.id);
      if (incomingConnections.length > 0) {
        const connection = incomingConnections[0];
        const sourceNode = this.graph.getNode(connection.fromNodeId);
        if (sourceNode) {
          inputValues[pin.name] = this.evaluateDataPin(
            connection.fromPinId,
            sourceNode
          );
        }
      } else {
        inputValues[pin.name] = pin.defaultValue;
      }
    }

    // Execute the node
    const execNode: ExecutionNode = {
      node,
      inputs: inputValues,
      state: NodeExecutionState.Running,
      outputs: {},
    };
    this.executionNodes.set(nodeId, execNode);

    try {
      const result = node.execute(inputValues);

      // Update execution node
      execNode.state = result.isLatent
        ? NodeExecutionState.Waiting
        : NodeExecutionState.Completed;
      execNode.outputs = result.outputs || {};

      if (result.error) {
        execNode.state = NodeExecutionState.Failed;
        execNode.error = result.error;
        this.onError?.(`Node ${nodeId}: ${result.error}`);
      }

      // Call callback
      this.onNodeExecuted?.(nodeId, result);

      // Add next nodes to execution stack
      if (!result.isLatent && result.nextExecPins) {
        for (const execPinId of result.nextExecPins) {
          const connections = this.graph.getConnectionsFromPin(execPinId);
          for (const conn of connections) {
            this.executionStack.push(conn.toNodeId);
          }
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      execNode.state = NodeExecutionState.Failed;
      execNode.error = errorMsg;
      this.onError?.(errorMsg);
    }
  }

  // Run the entire graph from event entry points
  public async run(): Promise<void> {
    if (this.isRunning) return;

    const errors = this.graph.validate();
    if (errors.length > 0) {
      this.onError?.(`Graph validation failed: ${errors.join(", ")}`);
      return;
    }

    this.isRunning = true;
    this.executionNodes.clear();
    this.executionStack = [];
    this.executedNodeCount = 0;

    // Start with event entry nodes
    const entryNodes = this.findEventEntryNodes();
    this.executionStack.push(...entryNodes);

    // Execute until stack is empty
    while (this.executionStack.length > 0 && this.isRunning) {
      const nodeId = this.executionStack.shift();
      if (nodeId) {
        this.executeNode(nodeId);
      }
    }

    this.isRunning = false;
    this.onCompleted?.();
  }

  // Stop execution
  public stop(): void {
    this.isRunning = false;
  }

  // Resume a latent execution
  public resumeLatent(latentId: string): void {
    const latent = this.latentExecutions.get(latentId);
    if (latent) {
      this.executionStack.push(latent.nodeId);
      this.latentExecutions.delete(latentId);
      // Continue execution from here
    }
  }

  // Get variable value
  public getVariable(name: string): any {
    return this.variables[name];
  }

  // Set variable value
  public setVariable(name: string, value: any): void {
    this.variables[name] = value;
  }

  // Get execution state
  public getExecutionState(): {
    isRunning: boolean;
    nodeStates: Record<string, NodeExecutionState>;
    variables: Record<string, any>;
  } {
    const nodeStates: Record<string, NodeExecutionState> = {};
    for (const [nodeId, execNode] of this.executionNodes) {
      nodeStates[nodeId] = execNode.state;
    }

    return {
      isRunning: this.isRunning,
      nodeStates,
      variables: this.variables,
    };
  }
}
