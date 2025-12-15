import { Node } from "../graph/Node";
import { PinType, ExecutionResult } from "../types";
import { NodeRegistry } from "./NodeRegistry";

/**
 * Math and Logic Nodes - Pure computation
 */

// Logic operators
export class AndNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("And", "Logic", "AND", { ...options, isPure: true });
    this.createInputPin("A", PinType.Boolean, false);
    this.createInputPin("B", PinType.Boolean, false);
    this.createOutputPin("Result", PinType.Boolean);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = (inputs["A"] || false) && (inputs["B"] || false);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class OrNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Or", "Logic", "OR", { ...options, isPure: true });
    this.createInputPin("A", PinType.Boolean, false);
    this.createInputPin("B", PinType.Boolean, false);
    this.createOutputPin("Result", PinType.Boolean);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = (inputs["A"] || false) || (inputs["B"] || false);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class NotNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Not", "Logic", "NOT", { ...options, isPure: true });
    this.createInputPin("Value", PinType.Boolean, false);
    this.createOutputPin("Result", PinType.Boolean);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = !(inputs["Value"] || false);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

// Comparison operators
export class EqualNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Equal", "Comparison", "Equal", { ...options, isPure: true });
    this.createInputPin("A", PinType.Wildcard);
    this.createInputPin("B", PinType.Wildcard);
    this.createOutputPin("Result", PinType.Boolean);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = inputs["A"] === inputs["B"];
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class NotEqualNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("NotEqual", "Comparison", "Not Equal", { ...options, isPure: true });
    this.createInputPin("A", PinType.Wildcard);
    this.createInputPin("B", PinType.Wildcard);
    this.createOutputPin("Result", PinType.Boolean);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = inputs["A"] !== inputs["B"];
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class GreaterThanNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("GreaterThan", "Comparison", "Greater Than", { ...options, isPure: true });
    this.createInputPin("A", PinType.Float, 0);
    this.createInputPin("B", PinType.Float, 0);
    this.createOutputPin("Result", PinType.Boolean);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = (inputs["A"] || 0) > (inputs["B"] || 0);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class LessThanNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("LessThan", "Comparison", "Less Than", { ...options, isPure: true });
    this.createInputPin("A", PinType.Float, 0);
    this.createInputPin("B", PinType.Float, 0);
    this.createOutputPin("Result", PinType.Boolean);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = (inputs["A"] || 0) < (inputs["B"] || 0);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class GreaterEqualNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("GreaterEqual", "Comparison", "Greater or Equal", { ...options, isPure: true });
    this.createInputPin("A", PinType.Float, 0);
    this.createInputPin("B", PinType.Float, 0);
    this.createOutputPin("Result", PinType.Boolean);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = (inputs["A"] || 0) >= (inputs["B"] || 0);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class LessEqualNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("LessEqual", "Comparison", "Less or Equal", { ...options, isPure: true });
    this.createInputPin("A", PinType.Float, 0);
    this.createInputPin("B", PinType.Float, 0);
    this.createOutputPin("Result", PinType.Boolean);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = (inputs["A"] || 0) <= (inputs["B"] || 0);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class NearlyEqualNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("NearlyEqual", "Comparison", "Nearly Equal", { ...options, isPure: true });
    this.createInputPin("A", PinType.Float, 0);
    this.createInputPin("B", PinType.Float, 0);
    this.createInputPin("Tolerance", PinType.Float, 0.01);
    this.createOutputPin("Result", PinType.Boolean);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const a = inputs["A"] || 0;
    const b = inputs["B"] || 0;
    const tolerance = inputs["Tolerance"] || 0.01;
    const result = Math.abs(a - b) <= tolerance;
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class InRangeNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("InRange", "Comparison", "In Range", { ...options, isPure: true });
    this.createInputPin("Value", PinType.Float, 0);
    this.createInputPin("Min", PinType.Float, 0);
    this.createInputPin("Max", PinType.Float, 10);
    this.createOutputPin("Result", PinType.Boolean);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const value = inputs["Value"] || 0;
    const min = inputs["Min"] || 0;
    const max = inputs["Max"] || 10;
    const result = value >= min && value <= max;
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

// Math operations
export class AddNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Add", "Math", "Add", { ...options, isPure: true });
    this.createInputPin("A", PinType.Float, 0);
    this.createInputPin("B", PinType.Float, 0);
    this.createOutputPin("Result", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = (inputs["A"] || 0) + (inputs["B"] || 0);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class SubtractNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Subtract", "Math", "Subtract", { ...options, isPure: true });
    this.createInputPin("A", PinType.Float, 0);
    this.createInputPin("B", PinType.Float, 0);
    this.createOutputPin("Result", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = (inputs["A"] || 0) - (inputs["B"] || 0);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class MultiplyNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Multiply", "Math", "Multiply", { ...options, isPure: true });
    this.createInputPin("A", PinType.Float, 1);
    this.createInputPin("B", PinType.Float, 1);
    this.createOutputPin("Result", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = (inputs["A"] || 1) * (inputs["B"] || 1);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class DivideNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Divide", "Math", "Divide", { ...options, isPure: true });
    this.createInputPin("A", PinType.Float, 1);
    this.createInputPin("B", PinType.Float, 1);
    this.createOutputPin("Result", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const b = inputs["B"] || 1;
    const result = b !== 0 ? (inputs["A"] || 0) / b : 0;
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class ClampNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Clamp", "Math", "Clamp", { ...options, isPure: true });
    this.createInputPin("Value", PinType.Float, 0);
    this.createInputPin("Min", PinType.Float, 0);
    this.createInputPin("Max", PinType.Float, 1);
    this.createOutputPin("Result", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const value = inputs["Value"] || 0;
    const min = inputs["Min"] || 0;
    const max = inputs["Max"] || 1;
    const result = Math.max(min, Math.min(max, value));
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class LerpNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Lerp", "Math", "Lerp", { ...options, isPure: true });
    this.createInputPin("A", PinType.Float, 0);
    this.createInputPin("B", PinType.Float, 1);
    this.createInputPin("Alpha", PinType.Float, 0.5);
    this.createOutputPin("Result", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const a = inputs["A"] || 0;
    const b = inputs["B"] || 1;
    const alpha = inputs["Alpha"] || 0.5;
    const result = a + (b - a) * alpha;
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class AbsNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Abs", "Math", "Abs", { ...options, isPure: true });
    this.createInputPin("Value", PinType.Float, 0);
    this.createOutputPin("Result", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = Math.abs(inputs["Value"] || 0);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class MinNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Min", "Math", "Min", { ...options, isPure: true });
    this.createInputPin("A", PinType.Float, 0);
    this.createInputPin("B", PinType.Float, 0);
    this.createOutputPin("Result", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = Math.min(inputs["A"] || 0, inputs["B"] || 0);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class MaxNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Max", "Math", "Max", { ...options, isPure: true });
    this.createInputPin("A", PinType.Float, 0);
    this.createInputPin("B", PinType.Float, 0);
    this.createOutputPin("Result", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = Math.max(inputs["A"] || 0, inputs["B"] || 0);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class FloorNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Floor", "Math", "Floor", { ...options, isPure: true });
    this.createInputPin("Value", PinType.Float, 0);
    this.createOutputPin("Result", PinType.Integer);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = Math.floor(inputs["Value"] || 0);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class CeilNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Ceil", "Math", "Ceil", { ...options, isPure: true });
    this.createInputPin("Value", PinType.Float, 0);
    this.createOutputPin("Result", PinType.Integer);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = Math.ceil(inputs["Value"] || 0);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class RoundNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Round", "Math", "Round", { ...options, isPure: true });
    this.createInputPin("Value", PinType.Float, 0);
    this.createOutputPin("Result", PinType.Integer);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const result = Math.round(inputs["Value"] || 0);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

export class RandomInRangeNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("RandomInRange", "Math", "Random in Range", { ...options, isPure: true });
    this.createInputPin("Min", PinType.Float, 0);
    this.createInputPin("Max", PinType.Float, 1);
    this.createOutputPin("Result", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const min = inputs["Min"] || 0;
    const max = inputs["Max"] || 1;
    const result = min + Math.random() * (max - min);
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: result,
      },
    };
  }
}

// Register all math nodes
const registry = NodeRegistry.getInstance();
registry.register("And", AndNode, "Logic", "AND");
registry.register("Or", OrNode, "Logic", "OR");
registry.register("Not", NotNode, "Logic", "NOT");
registry.register("Equal", EqualNode, "Comparison", "Equal");
registry.register("NotEqual", NotEqualNode, "Comparison", "Not Equal");
registry.register("GreaterThan", GreaterThanNode, "Comparison", "Greater Than");
registry.register("LessThan", LessThanNode, "Comparison", "Less Than");
registry.register("GreaterEqual", GreaterEqualNode, "Comparison", "Greater or Equal");
registry.register("LessEqual", LessEqualNode, "Comparison", "Less or Equal");
registry.register("NearlyEqual", NearlyEqualNode, "Comparison", "Nearly Equal");
registry.register("InRange", InRangeNode, "Comparison", "In Range");
registry.register("Add", AddNode, "Math", "Add");
registry.register("Subtract", SubtractNode, "Math", "Subtract");
registry.register("Multiply", MultiplyNode, "Math", "Multiply");
registry.register("Divide", DivideNode, "Math", "Divide");
registry.register("Clamp", ClampNode, "Math", "Clamp");
registry.register("Lerp", LerpNode, "Math", "Lerp");
registry.register("Abs", AbsNode, "Math", "Abs");
registry.register("Min", MinNode, "Math", "Min");
registry.register("Max", MaxNode, "Math", "Max");
registry.register("Floor", FloorNode, "Math", "Floor");
registry.register("Ceil", CeilNode, "Math", "Ceil");
registry.register("Round", RoundNode, "Math", "Round");
registry.register("RandomInRange", RandomInRangeNode, "Math", "Random in Range");
