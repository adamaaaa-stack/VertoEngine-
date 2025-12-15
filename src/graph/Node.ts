import { v4 as uuid } from "uuid";
import { INode, PinType, PinDirection, ExecutionResult } from "../types";
import { Pin } from "./Pin";

export abstract class Node implements INode {
  id: string;
  type: string;
  category: string;
  title: string;
  description?: string;
  x: number = 0;
  y: number = 0;
  width?: number;
  height?: number;
  pins: Pin[] = [];
  data: Record<string, any> = {};
  metadata?: Record<string, any>;

  // Whether this node requires execution flow
  isPure: boolean = false;

  // Whether this node is latent (has delayed execution)
  isLatent: boolean = false;

  constructor(
    type: string,
    category: string,
    title: string,
    options: {
      id?: string;
      x?: number;
      y?: number;
      description?: string;
      isPure?: boolean;
      isLatent?: boolean;
    } = {}
  ) {
    this.id = options.id || uuid();
    this.type = type;
    this.category = category;
    this.title = title;
    this.description = options.description;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.isPure = options.isPure || false;
    this.isLatent = options.isLatent || false;
  }

  // Get input pin by name
  getInputPin(name: string): Pin | undefined {
    return this.pins.find(
      (p) => p.direction === PinDirection.Input && p.name === name
    );
  }

  // Get output pin by name
  getOutputPin(name: string): Pin | undefined {
    return this.pins.find(
      (p) => p.direction === PinDirection.Output && p.name === name
    );
  }

  // Get all exec input pins
  getExecInputPins(): Pin[] {
    return this.pins.filter(
      (p) => p.direction === PinDirection.Input && p.type === PinType.Exec
    );
  }

  // Get all exec output pins
  getExecOutputPins(): Pin[] {
    return this.pins.filter(
      (p) => p.direction === PinDirection.Output && p.type === PinType.Exec
    );
  }

  // Add a pin to this node
  addPin(pin: Pin): void {
    this.pins.push(pin);
  }

  // Create an input pin
  createInputPin(name: string, type: PinType, defaultValue?: any): Pin {
    const pin = new Pin(name, type, PinDirection.Input, this.id, {
      defaultValue,
    });
    this.addPin(pin);
    return pin;
  }

  // Create an output pin
  createOutputPin(name: string, type: PinType): Pin {
    const pin = new Pin(name, type, PinDirection.Output, this.id);
    this.addPin(pin);
    return pin;
  }

  // Create exec input pin
  createExecInputPin(name: string = "In"): Pin {
    const pin = new Pin(name, PinType.Exec, PinDirection.Input, this.id);
    this.addPin(pin);
    return pin;
  }

  // Create exec output pin
  createExecOutputPin(name: string = "Out"): Pin {
    const pin = new Pin(name, PinType.Exec, PinDirection.Output, this.id);
    this.addPin(pin);
    return pin;
  }

  // Validate inputs - override in subclasses
  validate(): string[] {
    return [];
  }

  // Execute this node - must be implemented by subclasses
  abstract execute(inputs: Record<string, any>): ExecutionResult;

  toJSON(): INode {
    return {
      id: this.id,
      type: this.type,
      category: this.category,
      title: this.title,
      description: this.description,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      pins: this.pins.map((p) => p.toJSON()),
      data: this.data,
      metadata: this.metadata,
    };
  }

  static fromJSON(data: INode): Node {
    throw new Error("fromJSON must be implemented by subclasses");
  }
}
