/**
 * Object and Actor nodes - world interaction.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { Pin, PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Spawn Actor
class SpawnActorNode extends Node {
  constructor(id: string) {
    super({ id, type: 'SpawnActor', category: NodeCategory.Object, displayName: 'Spawn Actor' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Name', Types.String, 'Actor'));
    this.addPin(PinFactory.input('Location', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Actor', Types.Actor));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const name = await this.getInputValue('Name', context);
    const location = await this.getInputValue('Location', context);

    const actor = context.world.spawnActor(name, location.x, location.y);
    this.setOutputValue('Actor', actor);

    return 'Then';
  }
}

// Destroy Actor
class DestroyActorNode extends Node {
  constructor(id: string) {
    super({ id, type: 'DestroyActor', category: NodeCategory.Object, displayName: 'Destroy Actor' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Actor', Types.Actor));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const actor = await this.getInputValue('Actor', context);
    if (actor) {
      context.world.destroyActor(actor.id);
    }
    return 'Then';
  }
}

// Set Actor Location
class SetActorLocationNode extends Node {
  constructor(id: string) {
    super({ id, type: 'SetActorLocation', category: NodeCategory.Object, displayName: 'Set Actor Location' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Actor', Types.Actor));
    this.addPin(PinFactory.input('Location', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const actor = await this.getInputValue('Actor', context);
    const location = await this.getInputValue('Location', context);

    if (actor) {
      actor.x = location.x;
      actor.y = location.y;
    }

    return 'Then';
  }
}

// Get Actor Location
class GetActorLocationNode extends Node {
  constructor(id: string) {
    super({ id, type: 'GetActorLocation', category: NodeCategory.Object, displayName: 'Get Actor Location' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Actor', Types.Actor));
    this.addPin(PinFactory.output('Location', Types.Vector3));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const actor = await this.getInputValue('Actor', context);
    if (actor) {
      this.setOutputValue('Location', { x: actor.x, y: actor.y, z: 0 });
    } else {
      this.setOutputValue('Location', { x: 0, y: 0, z: 0 });
    }
    return null;
  }
}

// Set Actor Rotation
class SetActorRotationNode extends Node {
  constructor(id: string) {
    super({ id, type: 'SetActorRotation', category: NodeCategory.Object, displayName: 'Set Actor Rotation' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Actor', Types.Actor));
    this.addPin(PinFactory.input('Rotation', Types.Float, 0));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const actor = await this.getInputValue('Actor', context);
    const rotation = await this.getInputValue('Rotation', context);

    if (actor) {
      actor.rotation = rotation;
    }

    return 'Then';
  }
}

// Set Visibility
class SetVisibilityNode extends Node {
  constructor(id: string) {
    super({ id, type: 'SetVisibility', category: NodeCategory.Object, displayName: 'Set Visibility' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Actor', Types.Actor));
    this.addPin(PinFactory.input('Visible', Types.Boolean, true));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const actor = await this.getInputValue('Actor', context);
    const visible = await this.getInputValue('Visible', context);

    if (actor) {
      actor.visible = visible;
    }

    return 'Then';
  }
}

// Register all object nodes
export function registerObjectNodes(): void {
  const nodes = [
    { type: 'SpawnActor', class: SpawnActorNode, keywords: ['spawn', 'actor', 'create', 'instantiate'] },
    { type: 'DestroyActor', class: DestroyActorNode, keywords: ['destroy', 'actor', 'delete', 'remove'] },
    { type: 'SetActorLocation', class: SetActorLocationNode, keywords: ['set', 'location', 'position', 'actor'] },
    { type: 'GetActorLocation', class: GetActorLocationNode, keywords: ['get', 'location', 'position', 'actor'] },
    { type: 'SetActorRotation', class: SetActorRotationNode, keywords: ['set', 'rotation', 'actor'] },
    { type: 'SetVisibility', class: SetVisibilityNode, keywords: ['set', 'visibility', 'visible', 'hidden', 'actor'] },
  ];

  for (const node of nodes) {
    const instance = new (node.class as any)('temp');
    NodeRegistry.register({
      type: node.type,
      category: NodeCategory.Object,
      displayName: instance.displayName,
      description: `${instance.displayName} operation`,
      factory: (id) => new (node.class as any)(id),
      keywords: node.keywords,
    });
  }
}
