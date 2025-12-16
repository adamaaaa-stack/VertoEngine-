/**
 * Array, Map, and Set nodes - collection operations.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { Pin, PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Make Array
class MakeArrayNode extends Node {
  constructor(id: string) {
    super({ id, type: 'MakeArray', category: NodeCategory.Array, displayName: 'Make Array' });
    (this as any).isPure = true;
    this.addPin(PinFactory.output('Array', Types.Array()));
  }

  execute(): null {
    this.setOutputValue('Array', []);
    return null;
  }
}

// Array Add
class ArrayAddNode extends Node {
  constructor(id: string) {
    super({ id, type: 'ArrayAdd', category: NodeCategory.Array, displayName: 'Add' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Array', Types.Array()));
    this.addPin(PinFactory.input('Item', Types.Any));
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Array', Types.Array()));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const array = await this.getInputValue('Array', context);
    const item = await this.getInputValue('Item', context);
    array.push(item);
    this.setOutputValue('Array', array);
    return 'Then';
  }
}

// Array Insert
class ArrayInsertNode extends Node {
  constructor(id: string) {
    super({ id, type: 'ArrayInsert', category: NodeCategory.Array, displayName: 'Insert' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Array', Types.Array()));
    this.addPin(PinFactory.input('Item', Types.Any));
    this.addPin(PinFactory.input('Index', Types.Int, 0));
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Array', Types.Array()));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const array = await this.getInputValue('Array', context);
    const item = await this.getInputValue('Item', context);
    const index = await this.getInputValue('Index', context);
    array.splice(index, 0, item);
    this.setOutputValue('Array', array);
    return 'Then';
  }
}

// Array Remove
class ArrayRemoveNode extends Node {
  constructor(id: string) {
    super({ id, type: 'ArrayRemove', category: NodeCategory.Array, displayName: 'Remove' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Array', Types.Array()));
    this.addPin(PinFactory.input('Item', Types.Any));
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Array', Types.Array()));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const array = await this.getInputValue('Array', context);
    const item = await this.getInputValue('Item', context);
    const index = array.indexOf(item);
    if (index !== -1) {
      array.splice(index, 1);
    }
    this.setOutputValue('Array', array);
    return 'Then';
  }
}

// Array Remove Index
class ArrayRemoveIndexNode extends Node {
  constructor(id: string) {
    super({ id, type: 'ArrayRemoveIndex', category: NodeCategory.Array, displayName: 'Remove Index' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Array', Types.Array()));
    this.addPin(PinFactory.input('Index', Types.Int, 0));
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Array', Types.Array()));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const array = await this.getInputValue('Array', context);
    const index = await this.getInputValue('Index', context);
    if (index >= 0 && index < array.length) {
      array.splice(index, 1);
    }
    this.setOutputValue('Array', array);
    return 'Then';
  }
}

// Array Clear
class ArrayClearNode extends Node {
  constructor(id: string) {
    super({ id, type: 'ArrayClear', category: NodeCategory.Array, displayName: 'Clear' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Array', Types.Array()));
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Array', Types.Array()));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const array = await this.getInputValue('Array', context);
    array.length = 0;
    this.setOutputValue('Array', array);
    return 'Then';
  }
}

// Array Length
class ArrayLengthNode extends Node {
  constructor(id: string) {
    super({ id, type: 'ArrayLength', category: NodeCategory.Array, displayName: 'Length' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Array', Types.Array()));
    this.addPin(PinFactory.output('Length', Types.Int));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const array = await this.getInputValue('Array', context);
    this.setOutputValue('Length', array.length);
    return null;
  }
}

// Array Get
class ArrayGetNode extends Node {
  constructor(id: string) {
    super({ id, type: 'ArrayGet', category: NodeCategory.Array, displayName: 'Get' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Array', Types.Array()));
    this.addPin(PinFactory.input('Index', Types.Int, 0));
    this.addPin(PinFactory.output('Item', Types.Any));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const array = await this.getInputValue('Array', context);
    const index = await this.getInputValue('Index', context);
    this.setOutputValue('Item', array[index]);
    return null;
  }
}

// Array Set
class ArraySetNode extends Node {
  constructor(id: string) {
    super({ id, type: 'ArraySet', category: NodeCategory.Array, displayName: 'Set' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Array', Types.Array()));
    this.addPin(PinFactory.input('Index', Types.Int, 0));
    this.addPin(PinFactory.input('Item', Types.Any));
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Array', Types.Array()));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const array = await this.getInputValue('Array', context);
    const index = await this.getInputValue('Index', context);
    const item = await this.getInputValue('Item', context);
    array[index] = item;
    this.setOutputValue('Array', array);
    return 'Then';
  }
}

// Array Contains
class ArrayContainsNode extends Node {
  constructor(id: string) {
    super({ id, type: 'ArrayContains', category: NodeCategory.Array, displayName: 'Contains' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Array', Types.Array()));
    this.addPin(PinFactory.input('Item', Types.Any));
    this.addPin(PinFactory.output('Result', Types.Boolean));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const array = await this.getInputValue('Array', context);
    const item = await this.getInputValue('Item', context);
    this.setOutputValue('Result', array.includes(item));
    return null;
  }
}

// Register all array nodes
export function registerArrayNodes(): void {
  const nodes = [
    { type: 'MakeArray', class: MakeArrayNode, keywords: ['make', 'array', 'create', 'new'] },
    { type: 'ArrayAdd', class: ArrayAddNode, keywords: ['add', 'array', 'push', 'append'] },
    { type: 'ArrayInsert', class: ArrayInsertNode, keywords: ['insert', 'array'] },
    { type: 'ArrayRemove', class: ArrayRemoveNode, keywords: ['remove', 'array', 'delete'] },
    { type: 'ArrayRemoveIndex', class: ArrayRemoveIndexNode, keywords: ['remove', 'index', 'array', 'delete'] },
    { type: 'ArrayClear', class: ArrayClearNode, keywords: ['clear', 'array', 'empty'] },
    { type: 'ArrayLength', class: ArrayLengthNode, keywords: ['length', 'array', 'size', 'count'] },
    { type: 'ArrayGet', class: ArrayGetNode, keywords: ['get', 'array', 'index', 'access'] },
    { type: 'ArraySet', class: ArraySetNode, keywords: ['set', 'array', 'index'] },
    { type: 'ArrayContains', class: ArrayContainsNode, keywords: ['contains', 'array', 'has', 'includes'] },
  ];

  for (const node of nodes) {
    const instance = new (node.class as any)('temp');
    NodeRegistry.register({
      type: node.type,
      category: NodeCategory.Array,
      displayName: instance.displayName,
      description: `${instance.displayName} operation`,
      factory: (id) => new (node.class as any)(id),
      keywords: node.keywords,
    });
  }
}
