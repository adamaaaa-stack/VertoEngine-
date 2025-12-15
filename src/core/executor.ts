/**
 * Execution engine for visual scripting graphs.
 * Handles execution flow, latent actions, and infinite loop protection.
 */

import { Graph } from './graph.js';
import { Node, ExecutionContext, LatentAction } from './node.js';
import { Pin } from './pin.js';

export interface ExecutorConfig {
  maxExecutionSteps?: number; // Infinite loop protection
  debugMode?: boolean;
}

export class GraphExecutor {
  private graph: Graph;
  private world: any;
  private config: ExecutorConfig;

  private isRunning: boolean = false;
  private latentActions: LatentAction[] = [];
  private executionStepCount: number = 0;

  // For event handling
  private eventQueue: { eventType: string; data: any }[] = [];

  constructor(graph: Graph, world: any, config: ExecutorConfig = {}) {
    this.graph = graph;
    this.world = world;
    this.config = {
      maxExecutionSteps: config.maxExecutionSteps ?? 100000,
      debugMode: config.debugMode ?? false,
    };
  }

  /**
   * Start execution (fires BeginPlay event).
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    // Validate graph
    const errors = this.graph.validate();
    if (errors.length > 0) {
      throw new Error(`Graph validation failed:\n${errors.join('\n')}`);
    }

    this.isRunning = true;
    this.executionStepCount = 0;

    // Fire BeginPlay event
    await this.fireEvent('BeginPlay', {});
  }

  /**
   * Stop execution.
   */
  stop(): void {
    this.isRunning = false;

    // Cancel all latent actions
    for (const action of this.latentActions) {
      if (action.cancel) {
        action.cancel();
      }
    }
    this.latentActions = [];
  }

  /**
   * Update (called every frame).
   */
  async update(deltaTime: number): Promise<void> {
    if (!this.isRunning) return;

    // Fire Tick event
    await this.fireEvent('Tick', { deltaTime });

    // Update latent actions
    const completedActions: LatentAction[] = [];

    for (const action of this.latentActions) {
      const isComplete = action.update(deltaTime);
      if (isComplete) {
        completedActions.push(action);
      }
    }

    // Remove completed actions and continue execution
    for (const action of completedActions) {
      const index = this.latentActions.indexOf(action);
      if (index !== -1) {
        this.latentActions.splice(index, 1);
      }

      // Continue execution from the latent node
      const execPin = action.node.getPin(action.execPin);
      if (execPin) {
        await this.executeFromPin(execPin, action.context);
      }
    }

    // Process event queue
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      await this.fireEvent(event.eventType, event.data);
    }
  }

  /**
   * Fire an event (finds all matching event nodes and executes them).
   */
  async fireEvent(eventType: string, data: any): Promise<void> {
    if (!this.isRunning) return;

    const eventNodes = this.graph.getEventNodes().filter(
      node => node.type === eventType || node.type === 'CustomEvent'
    );

    for (const node of eventNodes) {
      const context = this.createContext(data.deltaTime ?? 0);

      // Store event data in context for the event node to access
      (context as any).eventData = data;

      // Execute the event node
      await this.executeNode(node, null, context);
    }
  }

  /**
   * Queue an event to be processed next frame.
   */
  queueEvent(eventType: string, data: any): void {
    this.eventQueue.push({ eventType, data });
  }

  /**
   * Execute a node and follow the execution flow.
   */
  private async executeNode(node: Node, execPin: Pin | null, context: ExecutionContext): Promise<void> {
    // Infinite loop protection
    this.executionStepCount++;
    if (this.executionStepCount > this.config.maxExecutionSteps!) {
      throw new Error('Execution exceeded maximum steps (possible infinite loop)');
    }

    // Clear cached values for this execution
    node.clearCache();

    // Debug breakpoint
    if (context.debugMode && context.breakpoints.has(node.id)) {
      console.log(`Breakpoint hit at ${node.displayName}`);
      // In a real implementation, this would pause execution and notify the UI
    }

    // Execute the node
    let outputExecPinName: string | null | Promise<string | null>;

    try {
      outputExecPinName = node.execute(execPin, context);

      // Handle async execution
      if (outputExecPinName instanceof Promise) {
        outputExecPinName = await outputExecPinName;
      }
    } catch (error) {
      console.error(`Error executing node ${node.displayName}:`, error);
      context.shouldStop = true;
      return;
    }

    // Stop if requested
    if (context.shouldStop) {
      return;
    }

    // If this is a latent node, it will handle its own continuation
    if (node.isLatent) {
      return;
    }

    // Follow execution flow
    if (outputExecPinName) {
      const outputPin = node.getPin(outputExecPinName);
      if (outputPin) {
        await this.executeFromPin(outputPin, context);
      }
    }
  }

  /**
   * Execute from an output exec pin to all connected input exec pins.
   */
  private async executeFromPin(outputPin: Pin, context: ExecutionContext): Promise<void> {
    for (const connectedPin of outputPin.connections) {
      const connectedNode = this.graph.getNode(connectedPin.nodeId);
      if (connectedNode) {
        await this.executeNode(connectedNode, connectedPin, context);
      }
    }
  }

  /**
   * Create execution context.
   */
  private createContext(deltaTime: number): ExecutionContext {
    return {
      graph: this.graph,
      world: this.world,
      deltaTime,
      variables: new Map(this.graph['variables']), // Clone
      localVariables: new Map(),
      self: null,
      shouldStop: false,
      latentActions: this.latentActions,
      debugMode: this.config.debugMode ?? false,
      breakpoints: new Set(),
    };
  }

  /**
   * Add a latent action.
   */
  addLatentAction(action: LatentAction): void {
    this.latentActions.push(action);
  }

  /**
   * Check if executor is running.
   */
  isExecuting(): boolean {
    return this.isRunning;
  }

  /**
   * Get execution statistics.
   */
  getStats(): { executionSteps: number; latentActions: number } {
    return {
      executionSteps: this.executionStepCount,
      latentActions: this.latentActions.length,
    };
  }

  /**
   * Reset execution step counter (call at start of each frame).
   */
  resetStepCounter(): void {
    this.executionStepCount = 0;
  }
}
