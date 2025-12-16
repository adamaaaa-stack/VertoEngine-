/**
 * Physics and Collision nodes.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { Pin, PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Simulate Physics
class SimulatePhysicsNode extends Node {
  constructor(id: string) {
    super({ id, type: 'SimulatePhysics', category: NodeCategory.Physics, displayName: 'Simulate Physics' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Actor', Types.Actor));
    this.addPin(PinFactory.input('Simulate', Types.Boolean, true));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const actor = await this.getInputValue('Actor', context);
    const simulate = await this.getInputValue('Simulate', context);

    if (actor) {
      (actor as any).simulatePhysics = simulate;
    }

    return 'Then';
  }
}

// Add Force
class AddForceNode extends Node {
  constructor(id: string) {
    super({ id, type: 'AddForce', category: NodeCategory.Physics, displayName: 'Add Force' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Actor', Types.Actor));
    this.addPin(PinFactory.input('Force', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const actor = await this.getInputValue('Actor', context);
    const force = await this.getInputValue('Force', context);

    if (actor && (actor as any).simulatePhysics) {
      // Apply force (simplified - would integrate with physics engine)
      if (!(actor as any).velocity) {
        (actor as any).velocity = { x: 0, y: 0, z: 0 };
      }
      (actor as any).velocity.x += force.x * 0.01;
      (actor as any).velocity.y += force.y * 0.01;
      (actor as any).velocity.z += force.z * 0.01;
    }

    return 'Then';
  }
}

// Add Impulse
class AddImpulseNode extends Node {
  constructor(id: string) {
    super({ id, type: 'AddImpulse', category: NodeCategory.Physics, displayName: 'Add Impulse' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Actor', Types.Actor));
    this.addPin(PinFactory.input('Impulse', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const actor = await this.getInputValue('Actor', context);
    const impulse = await this.getInputValue('Impulse', context);

    if (actor && (actor as any).simulatePhysics) {
      if (!(actor as any).velocity) {
        (actor as any).velocity = { x: 0, y: 0, z: 0 };
      }
      (actor as any).velocity.x += impulse.x;
      (actor as any).velocity.y += impulse.y;
      (actor as any).velocity.z += impulse.z;
    }

    return 'Then';
  }
}

// Set Velocity
class SetVelocityNode extends Node {
  constructor(id: string) {
    super({ id, type: 'SetVelocity', category: NodeCategory.Physics, displayName: 'Set Velocity' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Actor', Types.Actor));
    this.addPin(PinFactory.input('Velocity', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const actor = await this.getInputValue('Actor', context);
    const velocity = await this.getInputValue('Velocity', context);

    if (actor) {
      (actor as any).velocity = { x: velocity.x, y: velocity.y, z: velocity.z };
    }

    return 'Then';
  }
}

// Line Trace
class LineTraceNode extends Node {
  constructor(id: string) {
    super({ id, type: 'LineTrace', category: NodeCategory.Physics, displayName: 'Line Trace' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Start', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.input('End', Types.Vector3, { x: 100, y: 0, z: 0 }));
    this.addPin(PinFactory.execOut('Hit'));
    this.addPin(PinFactory.execOut('No Hit'));
    this.addPin(PinFactory.output('Hit Actor', Types.Actor));
    this.addPin(PinFactory.output('Hit Location', Types.Vector3));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const start = await this.getInputValue('Start', context);
    const end = await this.getInputValue('End', context);

    // Simplified ray trace - check all actors
    const actors = context.world.getAllActors();
    for (const actor of actors) {
      // Simple AABB collision check
      const dist = Math.sqrt(
        (actor.x - start.x) ** 2 +
        (actor.y - start.y) ** 2
      );

      if (dist < 50) {
        this.setOutputValue('Hit Actor', actor);
        this.setOutputValue('Hit Location', { x: actor.x, y: actor.y, z: 0 });
        return 'Hit';
      }
    }

    this.setOutputValue('Hit Actor', null);
    this.setOutputValue('Hit Location', { x: 0, y: 0, z: 0 });
    return 'No Hit';
  }
}

// Register all physics nodes
export function registerPhysicsNodes(): void {
  const nodes = [
    { type: 'SimulatePhysics', class: SimulatePhysicsNode, keywords: ['physics', 'simulate', 'enable'] },
    { type: 'AddForce', class: AddForceNode, keywords: ['force', 'physics', 'apply'] },
    { type: 'AddImpulse', class: AddImpulseNode, keywords: ['impulse', 'physics', 'apply'] },
    { type: 'SetVelocity', class: SetVelocityNode, keywords: ['velocity', 'physics', 'speed'] },
    { type: 'LineTrace', class: LineTraceNode, keywords: ['trace', 'raycast', 'line', 'collision'] },
  ];

  for (const node of nodes) {
    const instance = new (node.class as any)('temp');
    NodeRegistry.register({
      type: node.type,
      category: NodeCategory.Physics,
      displayName: instance.displayName,
      description: `${instance.displayName} operation`,
      factory: (id) => new (node.class as any)(id),
      keywords: node.keywords,
    });
  }
}
