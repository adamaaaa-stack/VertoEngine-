/**
 * Audio nodes.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Play Sound 2D
class PlaySound2DNode extends Node {
  constructor(id: string) {
    super({ id, type: 'PlaySound2D', category: NodeCategory.Audio, displayName: 'Play Sound 2D' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Sound', Types.Audio));
    this.addPin(PinFactory.input('Volume', Types.Float, 1.0));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: any, context: ExecutionContext): Promise<string> {
    const sound = await this.getInputValue('Sound', context);
    const volume = await this.getInputValue('Volume', context);

    if (sound) {
      // Play sound (would integrate with audio system)
      console.log(`Playing sound: ${sound} at volume ${volume}`);
    }

    return 'Then';
  }
}

// Play Sound at Location
class PlaySoundAtLocationNode extends Node {
  constructor(id: string) {
    super({ id, type: 'PlaySoundAtLocation', category: NodeCategory.Audio, displayName: 'Play Sound at Location' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Sound', Types.Audio));
    this.addPin(PinFactory.input('Location', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.input('Volume', Types.Float, 1.0));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: any, context: ExecutionContext): Promise<string> {
    const sound = await this.getInputValue('Sound', context);
    const location = await this.getInputValue('Location', context);
    const volume = await this.getInputValue('Volume', context);

    if (sound) {
      console.log(`Playing sound: ${sound} at location (${location.x}, ${location.y}, ${location.z}) at volume ${volume}`);
    }

    return 'Then';
  }
}

// Register audio nodes
export function registerAudioNodes(): void {
  NodeRegistry.register({
    type: 'PlaySound2D',
    category: NodeCategory.Audio,
    displayName: 'Play Sound 2D',
    description: 'Play a 2D sound',
    factory: (id) => new PlaySound2DNode(id),
    keywords: ['play', 'sound', 'audio', '2d'],
  });

  NodeRegistry.register({
    type: 'PlaySoundAtLocation',
    category: NodeCategory.Audio,
    displayName: 'Play Sound at Location',
    description: 'Play a sound at a specific location',
    factory: (id) => new PlaySoundAtLocationNode(id),
    keywords: ['play', 'sound', 'audio', 'location', '3d'],
  });
}
