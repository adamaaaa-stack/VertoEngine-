/**
 * Value nodes - literals and value getters.
 */

import { Node, NodeCategory } from '../core/node.js';
import { PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Boolean literal
class BooleanLiteralNode extends Node {
  value: boolean = false;

  constructor(id: string) {
    super({ id, type: 'BooleanLiteral', category: NodeCategory.Value, displayName: 'Boolean' });
    (this as any).isPure = true;
    this.addPin(PinFactory.output('Value', Types.Boolean));
  }

  execute(): null {
    this.setOutputValue('Value', this.value);
    return null;
  }
}

// Integer literal
class IntLiteralNode extends Node {
  value: number = 0;

  constructor(id: string) {
    super({ id, type: 'IntLiteral', category: NodeCategory.Value, displayName: 'Integer' });
    (this as any).isPure = true;
    this.addPin(PinFactory.output('Value', Types.Int));
  }

  execute(): null {
    this.setOutputValue('Value', this.value);
    return null;
  }
}

// Float literal
class FloatLiteralNode extends Node {
  value: number = 0.0;

  constructor(id: string) {
    super({ id, type: 'FloatLiteral', category: NodeCategory.Value, displayName: 'Float' });
    (this as any).isPure = true;
    this.addPin(PinFactory.output('Value', Types.Float));
  }

  execute(): null {
    this.setOutputValue('Value', this.value);
    return null;
  }
}

// String literal
class StringLiteralNode extends Node {
  value: string = '';

  constructor(id: string) {
    super({ id, type: 'StringLiteral', category: NodeCategory.Value, displayName: 'String' });
    (this as any).isPure = true;
    this.addPin(PinFactory.output('Value', Types.String));
  }

  execute(): null {
    this.setOutputValue('Value', this.value);
    return null;
  }
}

// Register all value nodes
export function registerValueNodes(): void {
  NodeRegistry.register({
    type: 'BooleanLiteral',
    category: NodeCategory.Value,
    displayName: 'Boolean',
    description: 'Boolean literal value',
    factory: (id) => new BooleanLiteralNode(id),
    keywords: ['bool', 'true', 'false', 'literal'],
  });

  NodeRegistry.register({
    type: 'IntLiteral',
    category: NodeCategory.Value,
    displayName: 'Integer',
    description: 'Integer literal value',
    factory: (id) => new IntLiteralNode(id),
    keywords: ['int', 'number', 'literal'],
  });

  NodeRegistry.register({
    type: 'FloatLiteral',
    category: NodeCategory.Value,
    displayName: 'Float',
    description: 'Float literal value',
    factory: (id) => new FloatLiteralNode(id),
    keywords: ['float', 'number', 'decimal', 'literal'],
  });

  NodeRegistry.register({
    type: 'StringLiteral',
    category: NodeCategory.Value,
    displayName: 'String',
    description: 'String literal value',
    factory: (id) => new StringLiteralNode(id),
    keywords: ['string', 'text', 'literal'],
  });
}
