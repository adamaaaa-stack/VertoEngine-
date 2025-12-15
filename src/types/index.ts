/**
 * Core type definitions for the Verto Engine graph system
 */

// Pin types
export enum PinType {
  Exec = "Exec",
  Boolean = "Boolean",
  Integer = "Integer",
  Float = "Float",
  String = "String",
  Name = "Name",
  Text = "Text",
  Vector = "Vector",
  Transform = "Transform",
  Object = "Object",
  Enum = "Enum",
  Array = "Array",
  Map = "Map",
  Set = "Set",
  Wildcard = "Wildcard", // For connections that accept any type
}

// Pin direction
export enum PinDirection {
  Input = "Input",
  Output = "Output",
}

// Node execution state
export enum NodeExecutionState {
  Pending = "Pending",
  Running = "Running",
  Completed = "Completed",
  Failed = "Failed",
  Waiting = "Waiting", // For latent nodes
}

// Pin interface
export interface IPin {
  id: string;
  name: string;
  type: PinType;
  direction: PinDirection;
  nodeId: string;
  defaultValue?: any;
  isArray?: boolean;
  isMap?: boolean;
  isSet?: boolean;
  isWildcard?: boolean;
}

// Connection between pins
export interface IConnection {
  id: string;
  fromPinId: string;
  toPinId: string;
  fromNodeId: string;
  toNodeId: string;
}

// Node definition
export interface INode {
  id: string;
  type: string;
  category: string;
  title: string;
  description?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  pins: IPin[];
  data?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Graph definition
export interface IGraph {
  id: string;
  name: string;
  version: string;
  nodes: INode[];
  connections: IConnection[];
  variables?: IVariable[];
}

// Variable definition
export interface IVariable {
  id: string;
  name: string;
  type: PinType;
  defaultValue?: any;
  isPublic?: boolean;
  isArray?: boolean;
}

// Execution result
export interface ExecutionResult {
  nodeId: string;
  nextExecPins?: string[]; // IDs of pins to execute next
  outputs?: Record<string, any>;
  error?: string;
  isLatent?: boolean;
  latentId?: string;
}

// Pin value during execution
export interface PinValue {
  pinId: string;
  value: any;
}

// Node context during execution
export interface NodeExecutionContext {
  nodeId: string;
  inputs: Record<string, any>;
  variables: Record<string, any>;
  actors: Record<string, any>;
}
