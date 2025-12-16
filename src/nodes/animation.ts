/**
 * Animation nodes.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Play Animation
class PlayAnimationNode extends Node {
  constructor(id: string) {
    super({ id, type: 'PlayAnimation', category: NodeCategory.Animation, displayName: 'Play Animation' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Actor', Types.Actor));
    this.addPin(PinFactory.input('Animation Name', Types.String, 'Idle'));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: any, context: ExecutionContext): Promise<string> {
    const actor = await this.getInputValue('Actor', context);
    const animName = await this.getInputValue('Animation Name', context);

    if (actor) {
      (actor as any).currentAnimation = animName;
    }

    return 'Then';
  }
}

// Stop Animation
class StopAnimationNode extends Node {
  constructor(id: string) {
    super({ id, type: 'StopAnimation', category: NodeCategory.Animation, displayName: 'Stop Animation' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Actor', Types.Actor));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: any, context: ExecutionContext): Promise<string> {
    const actor = await this.getInputValue('Actor', context);

    if (actor) {
      (actor as any).currentAnimation = null;
    }

    return 'Then';
  }
}

// Register animation nodes
export function registerAnimationNodes(): void {
  NodeRegistry.register({
    type: 'PlayAnimation',
    category: NodeCategory.Animation,
    displayName: 'Play Animation',
    description: 'Play an animation on an actor',
    factory: (id) => new PlayAnimationNode(id),
    keywords: ['play', 'animation', 'anim'],
  });

  NodeRegistry.register({
    type: 'StopAnimation',
    category: NodeCategory.Animation,
    displayName: 'Stop Animation',
    description: 'Stop animation playback',
    factory: (id) => new StopAnimationNode(id),
    keywords: ['stop', 'animation', 'anim'],
  });
}
