/**
 * Type system for the visual scripting engine.
 * Supports all value types needed for game development.
 */

export enum PinType {
  // Execution flow
  Exec = 'Exec',

  // Primitive types
  Boolean = 'Boolean',
  Int = 'Int',
  Float = 'Float',
  String = 'String',
  Name = 'Name',
  Text = 'Text',

  // Spatial types
  Vector2 = 'Vector2',
  Vector3 = 'Vector3',
  Vector4 = 'Vector4',
  Rotator = 'Rotator',
  Transform = 'Transform',

  // Object types
  Object = 'Object',
  Actor = 'Actor',
  Component = 'Component',
  Widget = 'Widget',

  // Collection types
  Array = 'Array',
  Map = 'Map',
  Set = 'Set',

  // Special types
  Any = 'Any',
  Enum = 'Enum',
  Struct = 'Struct',

  // Asset types
  Texture = 'Texture',
  Audio = 'Audio',
  Material = 'Material',
}

export interface TypeInfo {
  type: PinType;
  subType?: PinType; // For collections: Array<String>, Map<String, Int>, etc.
  enumName?: string; // For enum types
  structName?: string; // For struct types
  className?: string; // For object types
}

export class TypeChecker {
  /**
   * Check if two types are compatible for connection.
   */
  static isCompatible(from: TypeInfo, to: TypeInfo): boolean {
    // Exec pins only connect to exec pins
    if (from.type === PinType.Exec || to.type === PinType.Exec) {
      return from.type === PinType.Exec && to.type === PinType.Exec;
    }

    // Any type accepts anything (we already checked for exec above)
    if (to.type === PinType.Any) {
      return true;
    }

    // Exact type match
    if (from.type === to.type) {
      // For collections, check subtype
      if (from.type === PinType.Array || from.type === PinType.Map || from.type === PinType.Set) {
        if (!from.subType || !to.subType) return true; // Untyped collection
        return from.subType === to.subType;
      }

      // For enums, check enum name
      if (from.type === PinType.Enum) {
        if (!from.enumName || !to.enumName) return true;
        return from.enumName === to.enumName;
      }

      // For structs, check struct name
      if (from.type === PinType.Struct) {
        if (!from.structName || !to.structName) return true;
        return from.structName === to.structName;
      }

      return true;
    }

    // Numeric conversions: Int -> Float
    if (from.type === PinType.Int && to.type === PinType.Float) {
      return true;
    }

    // Object inheritance (simplified - all objects can connect to Object)
    if (to.type === PinType.Object) {
      return from.type === PinType.Actor ||
             from.type === PinType.Component ||
             from.type === PinType.Widget ||
             from.type === PinType.Object;
    }

    return false;
  }

  /**
   * Convert value from one type to another.
   */
  static convert(value: any, from: TypeInfo, to: TypeInfo): any {
    if (from.type === to.type) return value;

    // Int to Float
    if (from.type === PinType.Int && to.type === PinType.Float) {
      return Number(value);
    }

    // Any other conversion
    return value;
  }

  /**
   * Get default value for a type.
   */
  static getDefault(type: TypeInfo): any {
    switch (type.type) {
      case PinType.Boolean: return false;
      case PinType.Int: return 0;
      case PinType.Float: return 0.0;
      case PinType.String: return '';
      case PinType.Name: return '';
      case PinType.Text: return '';
      case PinType.Vector2: return { x: 0, y: 0 };
      case PinType.Vector3: return { x: 0, y: 0, z: 0 };
      case PinType.Vector4: return { x: 0, y: 0, z: 0, w: 0 };
      case PinType.Rotator: return { pitch: 0, yaw: 0, roll: 0 };
      case PinType.Transform: return {
        position: { x: 0, y: 0, z: 0 },
        rotation: { pitch: 0, yaw: 0, roll: 0 },
        scale: { x: 1, y: 1, z: 1 }
      };
      case PinType.Array: return [];
      case PinType.Map: return new Map();
      case PinType.Set: return new Set();
      case PinType.Object:
      case PinType.Actor:
      case PinType.Component:
      case PinType.Widget:
        return null;
      default: return null;
    }
  }

  /**
   * Get color for type (for UI visualization).
   */
  static getColor(type: TypeInfo): string {
    switch (type.type) {
      case PinType.Exec: return '#ffffff';
      case PinType.Boolean: return '#cc0000';
      case PinType.Int: return '#00cc99';
      case PinType.Float: return '#99cc00';
      case PinType.String: return '#ff00cc';
      case PinType.Name: return '#cc99ff';
      case PinType.Text: return '#ff99cc';
      case PinType.Vector2:
      case PinType.Vector3:
      case PinType.Vector4: return '#ffcc00';
      case PinType.Rotator: return '#9999ff';
      case PinType.Transform: return '#ff9900';
      case PinType.Object:
      case PinType.Actor:
      case PinType.Component:
      case PinType.Widget: return '#0099ff';
      case PinType.Array: return '#00ff99';
      case PinType.Map: return '#00ffcc';
      case PinType.Set: return '#00ccff';
      default: return '#999999';
    }
  }
}

// Helper function to create TypeInfo
export function makeType(type: PinType, subType?: PinType): TypeInfo {
  return { type, subType };
}

// Common type definitions
export const Types = {
  Exec: makeType(PinType.Exec),
  Boolean: makeType(PinType.Boolean),
  Int: makeType(PinType.Int),
  Float: makeType(PinType.Float),
  String: makeType(PinType.String),
  Name: makeType(PinType.Name),
  Text: makeType(PinType.Text),
  Vector2: makeType(PinType.Vector2),
  Vector3: makeType(PinType.Vector3),
  Vector4: makeType(PinType.Vector4),
  Rotator: makeType(PinType.Rotator),
  Transform: makeType(PinType.Transform),
  Object: makeType(PinType.Object),
  Actor: makeType(PinType.Actor),
  Component: makeType(PinType.Component),
  Widget: makeType(PinType.Widget),
  Texture: makeType(PinType.Texture),
  Audio: makeType(PinType.Audio),
  Material: makeType(PinType.Material),
  Array: (subType?: PinType) => makeType(PinType.Array, subType),
  Map: (subType?: PinType) => makeType(PinType.Map, subType),
  Set: (subType?: PinType) => makeType(PinType.Set, subType),
  Any: makeType(PinType.Any),
};
