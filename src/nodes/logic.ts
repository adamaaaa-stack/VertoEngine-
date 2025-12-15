/**
 * Logic and Comparison nodes.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { Pin, PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// AND
class AndNode extends Node {
  constructor(id: string) {
    super({ id, type: 'AND', category: NodeCategory.Logic, displayName: 'AND' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Boolean, false));
    this.addPin(PinFactory.input('B', Types.Boolean, false));
    this.addPin(PinFactory.output('Result', Types.Boolean));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a && b);
    return null;
  }
}

// OR
class OrNode extends Node {
  constructor(id: string) {
    super({ id, type: 'OR', category: NodeCategory.Logic, displayName: 'OR' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Boolean, false));
    this.addPin(PinFactory.input('B', Types.Boolean, false));
    this.addPin(PinFactory.output('Result', Types.Boolean));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a || b);
    return null;
  }
}

// NOT
class NotNode extends Node {
  constructor(id: string) {
    super({ id, type: 'NOT', category: NodeCategory.Logic, displayName: 'NOT' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Value', Types.Boolean, false));
    this.addPin(PinFactory.output('Result', Types.Boolean));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const value = await this.getInputValue('Value', context);
    this.setOutputValue('Result', !value);
    return null;
  }
}

// Equal
class EqualNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Equal', category: NodeCategory.Logic, displayName: 'Equal' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Float, 0));
    this.addPin(PinFactory.input('B', Types.Float, 0));
    this.addPin(PinFactory.output('Result', Types.Boolean));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a === b);
    return null;
  }
}

// NotEqual
class NotEqualNode extends Node {
  constructor(id: string) {
    super({ id, type: 'NotEqual', category: NodeCategory.Logic, displayName: 'Not Equal' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Float, 0));
    this.addPin(PinFactory.input('B', Types.Float, 0));
    this.addPin(PinFactory.output('Result', Types.Boolean));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a !== b);
    return null;
  }
}

// Greater
class GreaterNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Greater', category: NodeCategory.Logic, displayName: 'Greater' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Float, 0));
    this.addPin(PinFactory.input('B', Types.Float, 0));
    this.addPin(PinFactory.output('Result', Types.Boolean));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a > b);
    return null;
  }
}

// Less
class LessNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Less', category: NodeCategory.Logic, displayName: 'Less' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Float, 0));
    this.addPin(PinFactory.input('B', Types.Float, 0));
    this.addPin(PinFactory.output('Result', Types.Boolean));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a < b);
    return null;
  }
}

// GreaterOrEqual
class GreaterOrEqualNode extends Node {
  constructor(id: string) {
    super({ id, type: 'GreaterOrEqual', category: NodeCategory.Logic, displayName: 'Greater or Equal' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Float, 0));
    this.addPin(PinFactory.input('B', Types.Float, 0));
    this.addPin(PinFactory.output('Result', Types.Boolean));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a >= b);
    return null;
  }
}

// LessOrEqual
class LessOrEqualNode extends Node {
  constructor(id: string) {
    super({ id, type: 'LessOrEqual', category: NodeCategory.Logic, displayName: 'Less or Equal' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Float, 0));
    this.addPin(PinFactory.input('B', Types.Float, 0));
    this.addPin(PinFactory.output('Result', Types.Boolean));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a <= b);
    return null;
  }
}

// Register all logic nodes
export function registerLogicNodes(): void {
  const nodes = [
    { type: 'AND', class: AndNode, keywords: ['and', 'logic', 'boolean'] },
    { type: 'OR', class: OrNode, keywords: ['or', 'logic', 'boolean'] },
    { type: 'NOT', class: NotNode, keywords: ['not', 'logic', 'boolean', 'negate'] },
    { type: 'Equal', class: EqualNode, keywords: ['equal', 'compare', '=='] },
    { type: 'NotEqual', class: NotEqualNode, keywords: ['not equal', 'compare', '!='] },
    { type: 'Greater', class: GreaterNode, keywords: ['greater', 'compare', '>'] },
    { type: 'Less', class: LessNode, keywords: ['less', 'compare', '<'] },
    { type: 'GreaterOrEqual', class: GreaterOrEqualNode, keywords: ['greater', 'equal', 'compare', '>='] },
    { type: 'LessOrEqual', class: LessOrEqualNode, keywords: ['less', 'equal', 'compare', '<='] },
  ];

  for (const node of nodes) {
    const instance = new (node.class as any)('temp');
    NodeRegistry.register({
      type: node.type,
      category: NodeCategory.Logic,
      displayName: instance.displayName,
      description: `${instance.displayName} operation`,
      factory: (id) => new (node.class as any)(id),
      keywords: node.keywords,
    });
  }
}
