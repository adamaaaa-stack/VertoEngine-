/**
 * Base node class for the visual scripting system.
 * All nodes inherit from this class.
 */

import { Pin, PinConfig, PinDirection } from './pin.js';
import { TypeInfo } from './types.js';

export enum NodeCategory {
  Event = 'Event',
  Flow = 'Flow Control',
  Function = 'Function',
  Variable = 'Variable',
  Value = 'Value',
  Logic = 'Logic',
  Math = 'Math',
  Vector = 'Vector',
  String = 'String',
  Array = 'Array',
  Object = 'Object',
  Physics = 'Physics',
  Time = 'Time',
  Animation = 'Animation',
  AI = 'AI',
  Audio = 'Audio',
  UI = 'UI',
  SaveLoad = 'Save/Load',
  Network = 'Network',
  Debug = 'Debug',
  Utility = 'Utility',
}

export interface NodeConfig {
  id: string;
  type: string;
  category: NodeCategory;
  displayName: string;
  description?: string;
}

export abstract class Node {
  readonly id: string;
  readonly type: string;
  readonly category: NodeCategory;
  readonly displayName: string;
  readonly description: string;

  // Pins
  protected pins: Map<string, Pin> = new Map();
  protected inputPins: Pin[] = [];
  protected outputPins: Pin[] = [];

  // Visual position
  x: number = 0;
  y: number = 0;

  // Pure nodes don't have exec pins and are evaluated lazily
  readonly isPure: boolean = false;

  // Latent nodes can pause execution (e.g., Delay)
  readonly isLatent: boolean = false;

  // Validation errors
  errors: string[] = [];

  constructor(config: NodeConfig) {
    this.id = config.id;
    this.type = config.type;
    this.category = config.category;
    this.displayName = config.displayName;
    this.description = config.description || '';
  }

  /**
   * Add a pin to this node.
   */
  protected addPin(config: PinConfig): Pin {
    const pin = new Pin(this.id, config);
    this.pins.set(pin.name, pin);

    if (config.direction === PinDirection.Input) {
      this.inputPins.push(pin);
    } else {
      this.outputPins.push(pin);
    }

    return pin;
  }

  /**
   * Get a pin by name.
   */
  getPin(name: string): Pin | undefined {
    return this.pins.get(name);
  }

  /**
   * Get all pins.
   */
  getPins(): Pin[] {
    return Array.from(this.pins.values());
  }

  /**
   * Get input pins.
   */
  getInputPins(): Pin[] {
    return this.inputPins;
  }

  /**
   * Get output pins.
   */
  getOutputPins(): Pin[] {
    return this.outputPins;
  }

  /**
   * Get execution input pins.
   */
  getExecInputPins(): Pin[] {
    return this.inputPins.filter(p => p.type.type === 'Exec');
  }

  /**
   * Get execution output pins.
   */
  getExecOutputPins(): Pin[] {
    return this.outputPins.filter(p => p.type.type === 'Exec');
  }

  /**
   * Get data input pins (non-exec).
   */
  getDataInputPins(): Pin[] {
    return this.inputPins.filter(p => p.type.type !== 'Exec');
  }

  /**
   * Get data output pins (non-exec).
   */
  getDataOutputPins(): Pin[] {
    return this.outputPins.filter(p => p.type.type !== 'Exec');
  }

  /**
   * Validate this node.
   * Returns array of error messages (empty if valid).
   */
  validate(): string[] {
    this.errors = [];

    // Override in subclasses for custom validation
    this.onValidate();

    return this.errors;
  }

  /**
   * Override this in subclasses for custom validation.
   */
  protected onValidate(): void {
    // Default: no validation
  }

  /**
   * Execute this node.
   * @param execPin The execution pin that triggered this node (null for pure nodes)
   * @param context Execution context
   * @returns The name of the output exec pin to follow (null for pure nodes)
   */
  abstract execute(execPin: Pin | null, context: ExecutionContext): string | null | Promise<string | null>;

  /**
   * Clear cached values on all output pins.
   */
  clearCache(): void {
    for (const pin of this.outputPins) {
      pin.clearCache();
    }
  }

  /**
   * Get input value from a pin.
   * Evaluates connected nodes if needed.
   */
  protected async getInputValue(pinName: string, context: ExecutionContext): Promise<any> {
    const pin = this.getPin(pinName);
    if (!pin) {
      throw new Error(`Pin ${pinName} not found on node ${this.displayName}`);
    }

    // If connected, get value from connected pin
    const connectedPin = pin.getConnectedPin();
    if (connectedPin) {
      // If already cached, return it
      if (connectedPin.hasCachedValue) {
        return connectedPin.cachedValue;
      }

      // Execute the connected node to get the value
      const connectedNode = context.graph.getNode(connectedPin.nodeId);
      if (!connectedNode) {
        throw new Error(`Connected node ${connectedPin.nodeId} not found`);
      }

      // Pure nodes are evaluated when their outputs are needed
      if (connectedNode.isPure) {
        await connectedNode.execute(null, context);
      }

      // Return the cached value
      if (connectedPin.hasCachedValue) {
        return connectedPin.cachedValue;
      }

      throw new Error(`No value produced by ${connectedNode.displayName}`);
    }

    // No connection, use default value
    return pin.defaultValue;
  }

  /**
   * Set output value on a pin.
   */
  protected setOutputValue(pinName: string, value: any): void {
    const pin = this.getPin(pinName);
    if (!pin) {
      throw new Error(`Pin ${pinName} not found on node ${this.displayName}`);
    }

    pin.cachedValue = value;
    pin.hasCachedValue = true;
  }

  /**
   * Serialize node for saving.
   */
  serialize(): any {
    return {
      id: this.id,
      type: this.type,
      category: this.category,
      displayName: this.displayName,
      x: this.x,
      y: this.y,
      pins: Array.from(this.pins.values()).map(p => p.serialize()),
    };
  }
}

/**
 * Execution context passed to nodes during execution.
 */
export interface ExecutionContext {
  graph: any; // Graph instance (avoiding circular dependency)
  world: any; // Game world instance
  deltaTime: number; // Time since last frame
  variables: Map<string, any>; // Graph-level variables
  localVariables: Map<string, any>; // Function-level local variables
  self: any; // The object this graph belongs to

  // Execution control
  shouldStop: boolean; // Set to true to stop execution

  // Latent action support
  latentActions: LatentAction[];

  // Debug support
  debugMode: boolean;
  breakpoints: Set<string>; // Node IDs
}

/**
 * Latent action that continues execution later.
 */
export interface LatentAction {
  id: string;
  node: Node;
  execPin: string; // Output exec pin to trigger when complete
  context: ExecutionContext;
  update: (deltaTime: number) => boolean; // Returns true when complete
  cancel?: () => void;
}
