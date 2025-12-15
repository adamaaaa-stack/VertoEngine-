/**
 * Math nodes - mathematical operations.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { Pin, PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Helper to create a simple math node
function createMathNode(
  id: string,
  type: string,
  displayName: string,
  operation: (a: number, b: number) => number
): Node {
  const node = new (class extends Node {
    constructor() {
      super({ id, type, category: NodeCategory.Math, displayName });
      (this as any).isPure = true;
      this.addPin(PinFactory.input('A', Types.Float, 0));
      this.addPin(PinFactory.input('B', Types.Float, 0));
      this.addPin(PinFactory.output('Result', Types.Float));
    }

    async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
      const a = await this.getInputValue('A', context);
      const b = await this.getInputValue('B', context);
      this.setOutputValue('Result', operation(a, b));
      return null;
    }
  })();

  return node;
}

// Add
class AddNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Add', category: NodeCategory.Math, displayName: 'Add' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Float, 0));
    this.addPin(PinFactory.input('B', Types.Float, 0));
    this.addPin(PinFactory.output('Result', Types.Float));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a + b);
    return null;
  }
}

// Subtract
class SubtractNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Subtract', category: NodeCategory.Math, displayName: 'Subtract' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Float, 0));
    this.addPin(PinFactory.input('B', Types.Float, 0));
    this.addPin(PinFactory.output('Result', Types.Float));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a - b);
    return null;
  }
}

// Multiply
class MultiplyNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Multiply', category: NodeCategory.Math, displayName: 'Multiply' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Float, 0));
    this.addPin(PinFactory.input('B', Types.Float, 0));
    this.addPin(PinFactory.output('Result', Types.Float));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a * b);
    return null;
  }
}

// Divide
class DivideNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Divide', category: NodeCategory.Math, displayName: 'Divide' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Float, 0));
    this.addPin(PinFactory.input('B', Types.Float, 1));
    this.addPin(PinFactory.output('Result', Types.Float));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', b !== 0 ? a / b : 0);
    return null;
  }
}

// Clamp
class ClampNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Clamp', category: NodeCategory.Math, displayName: 'Clamp' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Value', Types.Float, 0));
    this.addPin(PinFactory.input('Min', Types.Float, 0));
    this.addPin(PinFactory.input('Max', Types.Float, 1));
    this.addPin(PinFactory.output('Result', Types.Float));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const value = await this.getInputValue('Value', context);
    const min = await this.getInputValue('Min', context);
    const max = await this.getInputValue('Max', context);
    this.setOutputValue('Result', Math.max(min, Math.min(max, value)));
    return null;
  }
}

// Lerp
class LerpNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Lerp', category: NodeCategory.Math, displayName: 'Lerp' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Float, 0));
    this.addPin(PinFactory.input('B', Types.Float, 1));
    this.addPin(PinFactory.input('Alpha', Types.Float, 0.5));
    this.addPin(PinFactory.output('Result', Types.Float));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    const alpha = await this.getInputValue('Alpha', context);
    this.setOutputValue('Result', a + (b - a) * alpha);
    return null;
  }
}

// Random Range
class RandomRangeNode extends Node {
  constructor(id: string) {
    super({ id, type: 'RandomRange', category: NodeCategory.Math, displayName: 'Random in Range' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Min', Types.Float, 0));
    this.addPin(PinFactory.input('Max', Types.Float, 1));
    this.addPin(PinFactory.output('Result', Types.Float));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const min = await this.getInputValue('Min', context);
    const max = await this.getInputValue('Max', context);
    this.setOutputValue('Result', min + Math.random() * (max - min));
    return null;
  }
}

// Register all math nodes
export function registerMathNodes(): void {
  const nodes = [
    { type: 'Add', class: AddNode, keywords: ['add', 'plus', '+', 'sum'] },
    { type: 'Subtract', class: SubtractNode, keywords: ['subtract', 'minus', '-', 'difference'] },
    { type: 'Multiply', class: MultiplyNode, keywords: ['multiply', 'times', '*', 'product'] },
    { type: 'Divide', class: DivideNode, keywords: ['divide', '/', 'quotient'] },
    { type: 'Clamp', class: ClampNode, keywords: ['clamp', 'limit', 'constrain'] },
    { type: 'Lerp', class: LerpNode, keywords: ['lerp', 'interpolate', 'blend'] },
    { type: 'RandomRange', class: RandomRangeNode, keywords: ['random', 'range'] },
  ];

  for (const node of nodes) {
    const instance = new (node.class as any)('temp');
    NodeRegistry.register({
      type: node.type,
      category: NodeCategory.Math,
      displayName: instance.displayName,
      description: `${instance.displayName} operation`,
      factory: (id) => new (node.class as any)(id),
      keywords: node.keywords,
    });
  }
}
