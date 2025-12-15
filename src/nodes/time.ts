/**
 * Time and Latent nodes - delayed execution.
 */

import { Node, NodeCategory, ExecutionContext, LatentAction } from '../core/node.js';
import { Pin, PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Delay - latent node that waits for a duration
class DelayNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Delay', category: NodeCategory.Time, displayName: 'Delay' });
    (this as any).isLatent = true;
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Duration', Types.Float, 1.0));
    this.addPin(PinFactory.execOut('Completed'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const duration = await this.getInputValue('Duration', context);
    let elapsed = 0;

    const latentAction: LatentAction = {
      id: `${this.id}_delay`,
      node: this,
      execPin: 'Completed',
      context,
      update: (deltaTime: number) => {
        elapsed += deltaTime;
        return elapsed >= duration;
      },
    };

    context.latentActions.push(latentAction);
    return null;
  }
}

// Register time nodes
export function registerTimeNodes(): void {
  NodeRegistry.register({
    type: 'Delay',
    category: NodeCategory.Time,
    displayName: 'Delay',
    description: 'Wait for a duration before continuing',
    factory: (id) => new DelayNode(id),
    keywords: ['delay', 'wait', 'timer', 'sleep'],
  });
}
