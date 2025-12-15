/**
 * Event nodes - entry points for graph execution.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Base event node
abstract class EventNode extends Node {
  constructor(id: string, type: string, displayName: string, description: string) {
    super({ id, type, category: NodeCategory.Event, displayName, description });
  }
}

// BeginPlay - fires once when the game starts
class BeginPlayNode extends EventNode {
  constructor(id: string) {
    super(id, 'BeginPlay', 'Begin Play', 'Fires when the game starts');
    this.addPin(PinFactory.execOut('Then'));
  }

  execute(): string {
    return 'Then';
  }
}

// Tick - fires every frame
class TickNode extends EventNode {
  constructor(id: string) {
    super(id, 'Tick', 'Tick', 'Fires every frame');
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Delta Time', Types.Float));
  }

  execute(_execPin: any, context: ExecutionContext): string {
    this.setOutputValue('Delta Time', context.deltaTime);
    return 'Then';
  }
}

// EndPlay - fires when the game ends
class EndPlayNode extends EventNode {
  constructor(id: string) {
    super(id, 'EndPlay', 'End Play', 'Fires when the game ends');
    this.addPin(PinFactory.execOut('Then'));
  }

  execute(): string {
    return 'Then';
  }
}

// Custom Event - user-defined event
class CustomEventNode extends EventNode {
  eventName: string = 'CustomEvent';

  constructor(id: string) {
    super(id, 'CustomEvent', 'Custom Event', 'User-defined event that can be called from anywhere');
    this.addPin(PinFactory.execOut('Then'));
  }

  execute(): string {
    return 'Then';
  }
}

// Input: Key Pressed
class InputKeyNode extends EventNode {
  key: string = 'Space';

  constructor(id: string) {
    super(id, 'InputKey', 'Input Key', 'Fires when a key is pressed');
    this.addPin(PinFactory.execOut('Pressed'));
    this.addPin(PinFactory.execOut('Released'));
  }

  execute(): string | null {
    // This is triggered by the input system
    // The input system will call this with the appropriate exec pin
    return null;
  }
}

// Input: Mouse Button
class InputMouseButtonNode extends EventNode {
  button: string = 'Left';

  constructor(id: string) {
    super(id, 'InputMouseButton', 'Mouse Button', 'Fires when a mouse button is clicked');
    this.addPin(PinFactory.execOut('Pressed'));
    this.addPin(PinFactory.execOut('Released'));
    this.addPin(PinFactory.output('Position', Types.Vector2));
  }

  execute(_execPin: any, context: ExecutionContext): string | null {
    // Position set by input system
    return null;
  }
}

// Input: Mouse Move
class InputMouseMoveNode extends EventNode {
  constructor(id: string) {
    super(id, 'InputMouseMove', 'Mouse Move', 'Fires when the mouse moves');
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Position', Types.Vector2));
    this.addPin(PinFactory.output('Delta', Types.Vector2));
  }

  execute(_execPin: any, context: ExecutionContext): string {
    return 'Then';
  }
}

// Input: Touch
class InputTouchNode extends EventNode {
  constructor(id: string) {
    super(id, 'InputTouch', 'Touch', 'Fires when the screen is touched');
    this.addPin(PinFactory.execOut('Began'));
    this.addPin(PinFactory.execOut('Moved'));
    this.addPin(PinFactory.execOut('Ended'));
    this.addPin(PinFactory.output('Position', Types.Vector2));
    this.addPin(PinFactory.output('Touch ID', Types.Int));
  }

  execute(): string | null {
    return null;
  }
}

// Collision: Begin Overlap
class BeginOverlapNode extends EventNode {
  constructor(id: string) {
    super(id, 'BeginOverlap', 'Begin Overlap', 'Fires when this actor overlaps another');
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Other Actor', Types.Actor));
  }

  execute(_execPin: any, context: ExecutionContext): string {
    return 'Then';
  }
}

// Collision: End Overlap
class EndOverlapNode extends EventNode {
  constructor(id: string) {
    super(id, 'EndOverlap', 'End Overlap', 'Fires when this actor stops overlapping another');
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Other Actor', Types.Actor));
  }

  execute(_execPin: any, context: ExecutionContext): string {
    return 'Then';
  }
}

// Collision: Hit
class HitNode extends EventNode {
  constructor(id: string) {
    super(id, 'Hit', 'Hit', 'Fires when this actor collides with something');
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Hit Actor', Types.Actor));
    this.addPin(PinFactory.output('Hit Location', Types.Vector3));
    this.addPin(PinFactory.output('Hit Normal', Types.Vector3));
  }

  execute(_execPin: any, context: ExecutionContext): string {
    return 'Then';
  }
}

// Register all event nodes
export function registerEventNodes(): void {
  NodeRegistry.register({
    type: 'BeginPlay',
    category: NodeCategory.Event,
    displayName: 'Begin Play',
    description: 'Fires when the game starts',
    factory: (id) => new BeginPlayNode(id),
    keywords: ['start', 'init', 'begin'],
  });

  NodeRegistry.register({
    type: 'Tick',
    category: NodeCategory.Event,
    displayName: 'Tick',
    description: 'Fires every frame',
    factory: (id) => new TickNode(id),
    keywords: ['update', 'frame', 'loop'],
  });

  NodeRegistry.register({
    type: 'EndPlay',
    category: NodeCategory.Event,
    displayName: 'End Play',
    description: 'Fires when the game ends',
    factory: (id) => new EndPlayNode(id),
    keywords: ['end', 'destroy', 'cleanup'],
  });

  NodeRegistry.register({
    type: 'CustomEvent',
    category: NodeCategory.Event,
    displayName: 'Custom Event',
    description: 'User-defined event',
    factory: (id) => new CustomEventNode(id),
    keywords: ['custom', 'call'],
  });

  NodeRegistry.register({
    type: 'InputKey',
    category: NodeCategory.Event,
    displayName: 'Input Key',
    description: 'Fires when a key is pressed',
    factory: (id) => new InputKeyNode(id),
    keywords: ['keyboard', 'key', 'press'],
  });

  NodeRegistry.register({
    type: 'InputMouseButton',
    category: NodeCategory.Event,
    displayName: 'Mouse Button',
    description: 'Fires when a mouse button is clicked',
    factory: (id) => new InputMouseButtonNode(id),
    keywords: ['mouse', 'click', 'button'],
  });

  NodeRegistry.register({
    type: 'InputMouseMove',
    category: NodeCategory.Event,
    displayName: 'Mouse Move',
    description: 'Fires when the mouse moves',
    factory: (id) => new InputMouseMoveNode(id),
    keywords: ['mouse', 'move', 'position'],
  });

  NodeRegistry.register({
    type: 'InputTouch',
    category: NodeCategory.Event,
    displayName: 'Touch',
    description: 'Fires when the screen is touched',
    factory: (id) => new InputTouchNode(id),
    keywords: ['touch', 'mobile', 'tap'],
  });

  NodeRegistry.register({
    type: 'BeginOverlap',
    category: NodeCategory.Event,
    displayName: 'Begin Overlap',
    description: 'Fires when overlap begins',
    factory: (id) => new BeginOverlapNode(id),
    keywords: ['collision', 'overlap', 'trigger'],
  });

  NodeRegistry.register({
    type: 'EndOverlap',
    category: NodeCategory.Event,
    displayName: 'End Overlap',
    description: 'Fires when overlap ends',
    factory: (id) => new EndOverlapNode(id),
    keywords: ['collision', 'overlap', 'trigger'],
  });

  NodeRegistry.register({
    type: 'Hit',
    category: NodeCategory.Event,
    displayName: 'Hit',
    description: 'Fires on collision',
    factory: (id) => new HitNode(id),
    keywords: ['collision', 'hit', 'impact'],
  });
}
