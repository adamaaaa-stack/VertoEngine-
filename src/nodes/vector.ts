/**
 * Vector and Transform nodes - spatial math operations.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { Pin, PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Make Vector3
class MakeVector3Node extends Node {
  constructor(id: string) {
    super({ id, type: 'MakeVector3', category: NodeCategory.Vector, displayName: 'Make Vector3' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('X', Types.Float, 0));
    this.addPin(PinFactory.input('Y', Types.Float, 0));
    this.addPin(PinFactory.input('Z', Types.Float, 0));
    this.addPin(PinFactory.output('Vector', Types.Vector3));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const x = await this.getInputValue('X', context);
    const y = await this.getInputValue('Y', context);
    const z = await this.getInputValue('Z', context);
    this.setOutputValue('Vector', { x, y, z });
    return null;
  }
}

// Break Vector3
class BreakVector3Node extends Node {
  constructor(id: string) {
    super({ id, type: 'BreakVector3', category: NodeCategory.Vector, displayName: 'Break Vector3' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Vector', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.output('X', Types.Float));
    this.addPin(PinFactory.output('Y', Types.Float));
    this.addPin(PinFactory.output('Z', Types.Float));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const vector = await this.getInputValue('Vector', context);
    this.setOutputValue('X', vector.x);
    this.setOutputValue('Y', vector.y);
    this.setOutputValue('Z', vector.z);
    return null;
  }
}

// Vector Add
class VectorAddNode extends Node {
  constructor(id: string) {
    super({ id, type: 'VectorAdd', category: NodeCategory.Vector, displayName: 'Vector + Vector' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.input('B', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.output('Result', Types.Vector3));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
    return null;
  }
}

// Vector Subtract
class VectorSubtractNode extends Node {
  constructor(id: string) {
    super({ id, type: 'VectorSubtract', category: NodeCategory.Vector, displayName: 'Vector - Vector' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.input('B', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.output('Result', Types.Vector3));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
    return null;
  }
}

// Vector Multiply Scalar
class VectorMultiplyScalarNode extends Node {
  constructor(id: string) {
    super({ id, type: 'VectorMultiplyScalar', category: NodeCategory.Vector, displayName: 'Vector * Scalar' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Vector', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.input('Scalar', Types.Float, 1));
    this.addPin(PinFactory.output('Result', Types.Vector3));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const vector = await this.getInputValue('Vector', context);
    const scalar = await this.getInputValue('Scalar', context);
    this.setOutputValue('Result', { x: vector.x * scalar, y: vector.y * scalar, z: vector.z * scalar });
    return null;
  }
}

// Dot Product
class DotProductNode extends Node {
  constructor(id: string) {
    super({ id, type: 'DotProduct', category: NodeCategory.Vector, displayName: 'Dot Product' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.input('B', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.output('Result', Types.Float));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', a.x * b.x + a.y * b.y + a.z * b.z);
    return null;
  }
}

// Cross Product
class CrossProductNode extends Node {
  constructor(id: string) {
    super({ id, type: 'CrossProduct', category: NodeCategory.Vector, displayName: 'Cross Product' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.input('B', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.output('Result', Types.Vector3));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    this.setOutputValue('Result', {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    });
    return null;
  }
}

// Vector Length
class VectorLengthNode extends Node {
  constructor(id: string) {
    super({ id, type: 'VectorLength', category: NodeCategory.Vector, displayName: 'Vector Length' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Vector', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.output('Length', Types.Float));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const vector = await this.getInputValue('Vector', context);
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    this.setOutputValue('Length', length);
    return null;
  }
}

// Normalize Vector
class NormalizeVectorNode extends Node {
  constructor(id: string) {
    super({ id, type: 'NormalizeVector', category: NodeCategory.Vector, displayName: 'Normalize' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Vector', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.output('Result', Types.Vector3));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const vector = await this.getInputValue('Vector', context);
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);

    if (length === 0) {
      this.setOutputValue('Result', { x: 0, y: 0, z: 0 });
    } else {
      this.setOutputValue('Result', {
        x: vector.x / length,
        y: vector.y / length,
        z: vector.z / length
      });
    }
    return null;
  }
}

// Distance
class DistanceNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Distance', category: NodeCategory.Vector, displayName: 'Distance' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('A', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.input('B', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.output('Distance', Types.Float));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const a = await this.getInputValue('A', context);
    const b = await this.getInputValue('B', context);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    this.setOutputValue('Distance', distance);
    return null;
  }
}

// Make Transform
class MakeTransformNode extends Node {
  constructor(id: string) {
    super({ id, type: 'MakeTransform', category: NodeCategory.Vector, displayName: 'Make Transform' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Position', Types.Vector3, { x: 0, y: 0, z: 0 }));
    this.addPin(PinFactory.input('Rotation', Types.Rotator, { pitch: 0, yaw: 0, roll: 0 }));
    this.addPin(PinFactory.input('Scale', Types.Vector3, { x: 1, y: 1, z: 1 }));
    this.addPin(PinFactory.output('Transform', Types.Transform));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const position = await this.getInputValue('Position', context);
    const rotation = await this.getInputValue('Rotation', context);
    const scale = await this.getInputValue('Scale', context);
    this.setOutputValue('Transform', { position, rotation, scale });
    return null;
  }
}

// Break Transform
class BreakTransformNode extends Node {
  constructor(id: string) {
    super({ id, type: 'BreakTransform', category: NodeCategory.Vector, displayName: 'Break Transform' });
    (this as any).isPure = true;
    this.addPin(PinFactory.input('Transform', Types.Transform));
    this.addPin(PinFactory.output('Position', Types.Vector3));
    this.addPin(PinFactory.output('Rotation', Types.Rotator));
    this.addPin(PinFactory.output('Scale', Types.Vector3));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<null> {
    const transform = await this.getInputValue('Transform', context);
    this.setOutputValue('Position', transform.position);
    this.setOutputValue('Rotation', transform.rotation);
    this.setOutputValue('Scale', transform.scale);
    return null;
  }
}

// Register all vector nodes
export function registerVectorNodes(): void {
  const nodes = [
    { type: 'MakeVector3', class: MakeVector3Node, keywords: ['make', 'vector', 'create'] },
    { type: 'BreakVector3', class: BreakVector3Node, keywords: ['break', 'vector', 'split'] },
    { type: 'VectorAdd', class: VectorAddNode, keywords: ['vector', 'add', '+'] },
    { type: 'VectorSubtract', class: VectorSubtractNode, keywords: ['vector', 'subtract', '-'] },
    { type: 'VectorMultiplyScalar', class: VectorMultiplyScalarNode, keywords: ['vector', 'multiply', '*', 'scale'] },
    { type: 'DotProduct', class: DotProductNode, keywords: ['dot', 'product', 'vector'] },
    { type: 'CrossProduct', class: CrossProductNode, keywords: ['cross', 'product', 'vector'] },
    { type: 'VectorLength', class: VectorLengthNode, keywords: ['length', 'magnitude', 'vector'] },
    { type: 'NormalizeVector', class: NormalizeVectorNode, keywords: ['normalize', 'vector', 'unit'] },
    { type: 'Distance', class: DistanceNode, keywords: ['distance', 'between', 'vector'] },
    { type: 'MakeTransform', class: MakeTransformNode, keywords: ['make', 'transform', 'create'] },
    { type: 'BreakTransform', class: BreakTransformNode, keywords: ['break', 'transform', 'split'] },
  ];

  for (const node of nodes) {
    const instance = new (node.class as any)('temp');
    NodeRegistry.register({
      type: node.type,
      category: NodeCategory.Vector,
      displayName: instance.displayName,
      description: `${instance.displayName} operation`,
      factory: (id) => new (node.class as any)(id),
      keywords: node.keywords,
    });
  }
}
