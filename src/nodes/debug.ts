/**
 * Debug nodes - development tools.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { Pin, PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// PrintString - logs a message
class PrintStringNode extends Node {
  constructor(id: string) {
    super({ id, type: 'PrintString', category: NodeCategory.Debug, displayName: 'Print String' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('String', Types.String, 'Hello'));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const str = await this.getInputValue('String', context);
    console.log('[PrintString]', str);
    return 'Then';
  }
}

// Register debug nodes
export function registerDebugNodes(): void {
  NodeRegistry.register({
    type: 'PrintString',
    category: NodeCategory.Debug,
    displayName: 'Print String',
    description: 'Print a string to the console',
    factory: (id) => new PrintStringNode(id),
    keywords: ['print', 'log', 'console', 'debug'],
  });
}
