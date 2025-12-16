/**
 * AI nodes.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// AI Move To
class AIMoveToNode extends Node {
  constructor(id: string) {
    super({ id, type: 'AIMoveTo', category: NodeCategory.AI, displayName: 'AI Move To' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('AI Actor', Types.Actor));
    this.addPin(PinFactory.input('Target Location', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.execOut('Success'));
    this.addPin(PinFactory.execOut('Failed'));
  }

  async execute(_execPin: any, context: ExecutionContext): Promise<string> {
    const actor = await this.getInputValue('AI Actor', context);
    const targetLocation = await this.getInputValue('Target Location', context);

    if (actor) {
      // Set AI target
      (actor as any).aiTarget = targetLocation;
      return 'Success';
    }

    return 'Failed';
  }
}

// Stop Movement
class StopMovementNode extends Node {
  constructor(id: string) {
    super({ id, type: 'StopMovement', category: NodeCategory.AI, displayName: 'Stop Movement' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Actor', Types.Actor));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: any, context: ExecutionContext): Promise<string> {
    const actor = await this.getInputValue('Actor', context);

    if (actor) {
      (actor as any).aiTarget = null;
      (actor as any).velocity = { x: 0, y: 0, z: 0 };
    }

    return 'Then';
  }
}

// Register AI nodes
export function registerAINodes(): void {
  NodeRegistry.register({
    type: 'AIMoveTo',
    category: NodeCategory.AI,
    displayName: 'AI Move To',
    description: 'Move AI actor to a location',
    factory: (id) => new AIMoveToNode(id),
    keywords: ['ai', 'move', 'navigate', 'pathfinding'],
  });

  NodeRegistry.register({
    type: 'StopMovement',
    category: NodeCategory.AI,
    displayName: 'Stop Movement',
    description: 'Stop actor movement',
    factory: (id) => new StopMovementNode(id),
    keywords: ['stop', 'movement', 'ai'],
  });
}
