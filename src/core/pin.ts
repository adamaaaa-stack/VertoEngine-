/**
 * Pin system for nodes.
 * Pins represent inputs and outputs on nodes.
 */

import { TypeInfo, TypeChecker } from './types.js';

export enum PinDirection {
  Input = 'Input',
  Output = 'Output',
}

export interface PinConfig {
  name: string;
  type: TypeInfo;
  direction: PinDirection;
  defaultValue?: any;
  isArray?: boolean; // For variadic pins
}

export class Pin {
  readonly id: string;
  readonly name: string;
  readonly type: TypeInfo;
  readonly direction: PinDirection;
  readonly nodeId: string;

  // For input pins: default value when not connected
  defaultValue: any;

  // Connections
  connections: Pin[] = [];

  // For output pins: cached value during execution
  cachedValue: any = undefined;
  hasCachedValue: boolean = false;

  constructor(nodeId: string, config: PinConfig) {
    this.id = `${nodeId}_${config.name}`;
    this.name = config.name;
    this.type = config.type;
    this.direction = config.direction;
    this.nodeId = nodeId;
    this.defaultValue = config.defaultValue ?? TypeChecker.getDefault(config.type);
  }

  /**
   * Check if this pin can connect to another pin.
   */
  canConnectTo(other: Pin): boolean {
    // Can't connect to self
    if (this.id === other.id) return false;

    // Can't connect to same node
    if (this.nodeId === other.nodeId) return false;

    // Must be different directions
    if (this.direction === other.direction) return false;

    // Type compatibility
    const [from, to] = this.direction === PinDirection.Output
      ? [this, other]
      : [other, this];

    return TypeChecker.isCompatible(from.type, to.type);
  }

  /**
   * Connect this pin to another pin.
   */
  connect(other: Pin): boolean {
    if (!this.canConnectTo(other)) return false;

    // Add connection
    if (!this.connections.includes(other)) {
      this.connections.push(other);
    }
    if (!other.connections.includes(this)) {
      other.connections.push(this);
    }

    return true;
  }

  /**
   * Disconnect from another pin.
   */
  disconnect(other: Pin): void {
    const index = this.connections.indexOf(other);
    if (index !== -1) {
      this.connections.splice(index, 1);
    }

    const otherIndex = other.connections.indexOf(this);
    if (otherIndex !== -1) {
      other.connections.splice(otherIndex, 1);
    }
  }

  /**
   * Disconnect all connections.
   */
  disconnectAll(): void {
    const connections = [...this.connections];
    for (const other of connections) {
      this.disconnect(other);
    }
  }

  /**
   * Check if this pin is connected.
   */
  isConnected(): boolean {
    return this.connections.length > 0;
  }

  /**
   * Get the connected pin (for input pins, returns the first connection).
   */
  getConnectedPin(): Pin | null {
    return this.connections[0] ?? null;
  }

  /**
   * Clear cached value (used during execution).
   */
  clearCache(): void {
    this.cachedValue = undefined;
    this.hasCachedValue = false;
  }

  /**
   * Serialize pin for saving.
   */
  serialize(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      direction: this.direction,
      defaultValue: this.defaultValue,
      connections: this.connections.map(c => c.id),
    };
  }
}

export class PinFactory {
  /**
   * Create an execution input pin.
   */
  static execIn(name: string = 'Exec'): PinConfig {
    return {
      name,
      type: { type: 'Exec' as any },
      direction: PinDirection.Input,
    };
  }

  /**
   * Create an execution output pin.
   */
  static execOut(name: string = 'Then'): PinConfig {
    return {
      name,
      type: { type: 'Exec' as any },
      direction: PinDirection.Output,
    };
  }

  /**
   * Create an input pin.
   */
  static input(name: string, type: TypeInfo, defaultValue?: any): PinConfig {
    return {
      name,
      type,
      direction: PinDirection.Input,
      defaultValue,
    };
  }

  /**
   * Create an output pin.
   */
  static output(name: string, type: TypeInfo): PinConfig {
    return {
      name,
      type,
      direction: PinDirection.Output,
    };
  }
}
