/**
 * String and Text nodes - text manipulation.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { Pin, PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Append
class AppendNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Append', category: NodeCategory.String, displayName: 'Append' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.String, ''));
    this.addPin(PinFactory.input('B', Types.String, ''));
    this.addPin(PinFactory.output('Result', Types.String));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a + b);
    return null;
  }
}

// Length
class StringLengthNode extends Node {
  constructor(id: string) {
    super({ id, type: 'StringLength', category: NodeCategory.String, displayName: 'Length' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('String', Types.String, ''));
    this.addPin(PinFactory.output('Length', Types.Int));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const str = await this.getInputValue('String', context);
    this.setOutputValue('Length', str.length);
    return null;
  }
}

// Contains
class ContainsNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Contains', category: NodeCategory.String, displayName: 'Contains' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('String', Types.String, ''));
    this.addPin(PinFactory.input('Substring', Types.String, ''));
    this.addPin(PinFactory.output('Result', Types.Boolean));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const str = await this.getInputValue('String', context);
    const substring = await this.getInputValue('Substring', context);
    this.setOutputValue('Result', str.includes(substring));
    return null;
  }
}

// Equals
class StringEqualsNode extends Node {
  constructor(id: string) {
    super({ id, type: 'StringEquals', category: NodeCategory.String, displayName: 'Equals' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.String, ''));
    this.addPin(PinFactory.input('B', Types.String, ''));
    this.addPin(PinFactory.output('Result', Types.Boolean));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a === b);
    return null;
  }
}

// To Upper
class ToUpperNode extends Node {
  constructor(id: string) {
    super({ id, type: 'ToUpper', category: NodeCategory.String, displayName: 'To Upper' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('String', Types.String, ''));
    this.addPin(PinFactory.output('Result', Types.String));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const str = await this.getInputValue('String', context);
    this.setOutputValue('Result', str.toUpperCase());
    return null;
  }
}

// To Lower
class ToLowerNode extends Node {
  constructor(id: string) {
    super({ id, type: 'ToLower', category: NodeCategory.String, displayName: 'To Lower' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('String', Types.String, ''));
    this.addPin(PinFactory.output('Result', Types.String));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const str = await this.getInputValue('String', context);
    this.setOutputValue('Result', str.toLowerCase());
    return null;
  }
}

// Format Text
class FormatTextNode extends Node {
  constructor(id: string) {
    super({ id, type: 'FormatText', category: NodeCategory.String, displayName: 'Format Text' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Format', Types.String, 'Value: {0}'));
    this.addPin(PinFactory.input('Arg0', Types.String, ''));
    this.addPin(PinFactory.output('Result', Types.String));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const format = await this.getInputValue('Format', context);
    const arg0 = await this.getInputValue('Arg0', context);
    const result = format.replace('{0}', arg0.toString());
    this.setOutputValue('Result', result);
    return null;
  }
}

// Register all string nodes
export function registerStringNodes(): void {
  const nodes = [
    { type: 'Append', class: AppendNode, keywords: ['append', 'concat', 'string', 'join'] },
    { type: 'StringLength', class: StringLengthNode, keywords: ['length', 'string', 'size'] },
    { type: 'Contains', class: ContainsNode, keywords: ['contains', 'string', 'search', 'find'] },
    { type: 'StringEquals', class: StringEqualsNode, keywords: ['equals', 'string', 'compare'] },
    { type: 'ToUpper', class: ToUpperNode, keywords: ['upper', 'uppercase', 'string'] },
    { type: 'ToLower', class: ToLowerNode, keywords: ['lower', 'lowercase', 'string'] },
    { type: 'FormatText', class: FormatTextNode, keywords: ['format', 'text', 'string', 'template'] },
  ];

  for (const node of nodes) {
    const instance = new (node.class as any)('temp');
    NodeRegistry.register({
      type: node.type,
      category: NodeCategory.String,
      displayName: instance.displayName,
      description: `${instance.displayName} operation`,
      factory: (id) => new (node.class as any)(id),
      keywords: node.keywords,
    });
  }
}
