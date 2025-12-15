/**
 * Variable nodes - get and set variables.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { Pin, PinFactory } from '../core/pin.js';
import { TypeInfo, Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// GetVariable - pure node
class GetVariableNode extends Node {
  variableName: string = '';
  variableType: TypeInfo = Types.Float;

  constructor(id: string) {
    super({ id, type: 'GetVariable', category: NodeCategory.Variable, displayName: 'Get Variable' });
    (this as any).isPure = true;
    this.addPin(PinFactory.output('Value', this.variableType));
  }

  execute(_execPin: Pin | null, context: ExecutionContext): null {
    const value = context.variables.get(this.variableName);
    this.setOutputValue('Value', value);
    return null;
  }
}

// SetVariable - impure node with exec pins
class SetVariableNode extends Node {
  variableName: string = '';
  variableType: TypeInfo = Types.Float;

  constructor(id: string) {
    super({ id, type: 'SetVariable', category: NodeCategory.Variable, displayName: 'Set Variable' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Value', this.variableType));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const value = await this.getInputValue('Value', context);
    context.variables.set(this.variableName, value);
    return 'Then';
  }
}

// Register variable nodes
export function registerVariableNodes(): void {
  NodeRegistry.register({
    type: 'GetVariable',
    category: NodeCategory.Variable,
    displayName: 'Get Variable',
    description: 'Get the value of a variable',
    factory: (id) => new GetVariableNode(id),
    keywords: ['get', 'variable', 'read'],
  });

  NodeRegistry.register({
    type: 'SetVariable',
    category: NodeCategory.Variable,
    displayName: 'Set Variable',
    description: 'Set the value of a variable',
    factory: (id) => new SetVariableNode(id),
    keywords: ['set', 'variable', 'write', 'assign'],
  });
}
