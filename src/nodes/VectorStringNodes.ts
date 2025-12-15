import { Node } from "../graph/Node";
import { PinType, ExecutionResult } from "../types";
import { NodeRegistry } from "./NodeRegistry";

/**
 * Vector, String, and Text Nodes
 */

// Vector nodes
export class MakeVectorNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("MakeVector", "Vector", "Make Vector", { ...options, isPure: true });
    this.createInputPin("X", PinType.Float, 0);
    this.createInputPin("Y", PinType.Float, 0);
    this.createInputPin("Z", PinType.Float, 0);
    this.createOutputPin("Vector", PinType.Vector);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const vector = {
      x: inputs["X"] || 0,
      y: inputs["Y"] || 0,
      z: inputs["Z"] || 0,
    };
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Vector")?.id || ""]: vector,
      },
    };
  }
}

export class BreakVectorNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("BreakVector", "Vector", "Break Vector", { ...options, isPure: true });
    this.createInputPin("Vector", PinType.Vector);
    this.createOutputPin("X", PinType.Float);
    this.createOutputPin("Y", PinType.Float);
    this.createOutputPin("Z", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const vec = inputs["Vector"] || { x: 0, y: 0, z: 0 };
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("X")?.id || ""]: vec.x || 0,
        [this.getOutputPin("Y")?.id || ""]: vec.y || 0,
        [this.getOutputPin("Z")?.id || ""]: vec.z || 0,
      },
    };
  }
}

export class VectorAddNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("VectorAdd", "Vector", "Vector + Vector", { ...options, isPure: true });
    this.createInputPin("A", PinType.Vector);
    this.createInputPin("B", PinType.Vector);
    this.createOutputPin("Result", PinType.Vector);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const a = inputs["A"] || { x: 0, y: 0, z: 0 };
    const b = inputs["B"] || { x: 0, y: 0, z: 0 };
    const result = {
      x: (a.x || 0) + (b.x || 0),
      y: (a.y || 0) + (b.y || 0),
      z: (a.z || 0) + (b.z || 0),
    };
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class VectorSubtractNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("VectorSubtract", "Vector", "Vector - Vector", { ...options, isPure: true });
    this.createInputPin("A", PinType.Vector);
    this.createInputPin("B", PinType.Vector);
    this.createOutputPin("Result", PinType.Vector);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const a = inputs["A"] || { x: 0, y: 0, z: 0 };
    const b = inputs["B"] || { x: 0, y: 0, z: 0 };
    const result = {
      x: (a.x || 0) - (b.x || 0),
      y: (a.y || 0) - (b.y || 0),
      z: (a.z || 0) - (b.z || 0),
    };
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class VectorMultiplyNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("VectorMultiply", "Vector", "Vector * Scalar", { ...options, isPure: true });
    this.createInputPin("Vector", PinType.Vector);
    this.createInputPin("Scalar", PinType.Float, 1);
    this.createOutputPin("Result", PinType.Vector);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const vec = inputs["Vector"] || { x: 0, y: 0, z: 0 };
    const scalar = inputs["Scalar"] || 1;
    const result = {
      x: (vec.x || 0) * scalar,
      y: (vec.y || 0) * scalar,
      z: (vec.z || 0) * scalar,
    };
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class VectorLengthNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("VectorLength", "Vector", "Length", { ...options, isPure: true });
    this.createInputPin("Vector", PinType.Vector);
    this.createOutputPin("Length", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const vec = inputs["Vector"] || { x: 0, y: 0, z: 0 };
    const length = Math.sqrt((vec.x || 0) ** 2 + (vec.y || 0) ** 2 + (vec.z || 0) ** 2);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Length")?.id || ""]: length,
      },
    };
  }
}

export class VectorNormalizeNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("VectorNormalize", "Vector", "Normalize", { ...options, isPure: true });
    this.createInputPin("Vector", PinType.Vector);
    this.createOutputPin("Result", PinType.Vector);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const vec = inputs["Vector"] || { x: 0, y: 0, z: 0 };
    const length = Math.sqrt((vec.x || 0) ** 2 + (vec.y || 0) ** 2 + (vec.z || 0) ** 2);
    const result =
      length > 0
        ? {
            x: (vec.x || 0) / length,
            y: (vec.y || 0) / length,
            z: (vec.z || 0) / length,
          }
        : { x: 0, y: 0, z: 0 };
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class DotProductNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("DotProduct", "Vector", "Dot Product", { ...options, isPure: true });
    this.createInputPin("A", PinType.Vector);
    this.createInputPin("B", PinType.Vector);
    this.createOutputPin("Result", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const a = inputs["A"] || { x: 0, y: 0, z: 0 };
    const b = inputs["B"] || { x: 0, y: 0, z: 0 };
    const result = (a.x || 0) * (b.x || 0) + (a.y || 0) * (b.y || 0) + (a.z || 0) * (b.z || 0);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class DistanceNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Distance", "Vector", "Distance", { ...options, isPure: true });
    this.createInputPin("A", PinType.Vector);
    this.createInputPin("B", PinType.Vector);
    this.createOutputPin("Distance", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const a = inputs["A"] || { x: 0, y: 0, z: 0 };
    const b = inputs["B"] || { x: 0, y: 0, z: 0 };
    const dx = (a.x || 0) - (b.x || 0);
    const dy = (a.y || 0) - (b.y || 0);
    const dz = (a.z || 0) - (b.z || 0);
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Distance")?.id || ""]: distance,
      },
    };
  }
}

// String nodes
export class AppendNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Append", "String", "Append", { ...options, isPure: true });
    this.createInputPin("A", PinType.String, "");
    this.createInputPin("B", PinType.String, "");
    this.createOutputPin("Result", PinType.String);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = (inputs["A"] || "") + (inputs["B"] || "");
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class StringLengthNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("StringLength", "String", "Length", { ...options, isPure: true });
    this.createInputPin("String", PinType.String, "");
    this.createOutputPin("Length", PinType.Integer);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const length = (inputs["String"] || "").length;
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Length")?.id || ""]: length,
      },
    };
  }
}

export class ContainsNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Contains", "String", "Contains", { ...options, isPure: true });
    this.createInputPin("String", PinType.String, "");
    this.createInputPin("Substring", PinType.String, "");
    this.createOutputPin("Result", PinType.Boolean);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = (inputs["String"] || "").includes(inputs["Substring"] || "");
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class StringEqualsNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("StringEquals", "String", "Equals", { ...options, isPure: true });
    this.createInputPin("A", PinType.String, "");
    this.createInputPin("B", PinType.String, "");
    this.createInputPin("IgnoreCase", PinType.Boolean, false);
    this.createOutputPin("Result", PinType.Boolean);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const a = inputs["A"] || "";
    const b = inputs["B"] || "";
    const ignoreCase = inputs["IgnoreCase"] || false;
    const result = ignoreCase ? a.toLowerCase() === b.toLowerCase() : a === b;
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class ToUpperNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("ToUpper", "String", "To Upper", { ...options, isPure: true });
    this.createInputPin("String", PinType.String, "");
    this.createOutputPin("Result", PinType.String);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = (inputs["String"] || "").toUpperCase();
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class ToLowerNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("ToLower", "String", "To Lower", { ...options, isPure: true });
    this.createInputPin("String", PinType.String, "");
    this.createOutputPin("Result", PinType.String);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = (inputs["String"] || "").toLowerCase();
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

// Register all vector and string nodes
const registry = NodeRegistry.getInstance();
registry.register("MakeVector", MakeVectorNode, "Vector", "Make Vector");
registry.register("BreakVector", BreakVectorNode, "Vector", "Break Vector");
registry.register("VectorAdd", VectorAddNode, "Vector", "Vector + Vector");
registry.register("VectorSubtract", VectorSubtractNode, "Vector", "Vector - Vector");
registry.register("VectorMultiply", VectorMultiplyNode, "Vector", "Vector * Scalar");
registry.register("VectorLength", VectorLengthNode, "Vector", "Length");
registry.register("VectorNormalize", VectorNormalizeNode, "Vector", "Normalize");
registry.register("DotProduct", DotProductNode, "Vector", "Dot Product");
registry.register("Distance", DistanceNode, "Vector", "Distance");
registry.register("Append", AppendNode, "String", "Append");
registry.register("StringLength", StringLengthNode, "String", "Length");
registry.register("Contains", ContainsNode, "String", "Contains");
registry.register("StringEquals", StringEqualsNode, "String", "Equals");
registry.register("ToUpper", ToUpperNode, "String", "To Upper");
registry.register("ToLower", ToLowerNode, "String", "To Lower");
