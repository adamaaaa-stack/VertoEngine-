import { Node } from "../graph/Node";
import { PinType, ExecutionResult } from "../types";
import { NodeRegistry } from "./NodeRegistry";

/**
 * Execution Flow Control Nodes
 */

export class SequenceNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Sequence", "Flow", "Sequence", {
      ...options,
      description: "Execute pins sequentially",
    });
    this.createExecInputPin("In");
    for (let i = 0; i < 4; i++) {
      this.createExecOutputPin(`Then ${i}`);
    }
  }

  execute(): ExecutionResult {
    // Return all output pins - they execute in order
    const outputs = this.getExecOutputPins();
    return {
      nodeId: this.id,
      nextExecPins: outputs.map((p) => p.id),
      outputs: {},
    };
  }
}

export class BranchNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Branch", "Flow", "Branch (If)", {
      ...options,
      description: "Conditional execution",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("True");
    this.createExecOutputPin("False");
    this.createInputPin("Condition", PinType.Boolean, false);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const condition = inputs["Condition"] || false;
    const outputs = this.getExecOutputPins();
    const nextPin = condition ? outputs[0] : outputs[1];

    return {
      nodeId: this.id,
      nextExecPins: nextPin ? [nextPin.id] : [],
      outputs: {},
    };
  }
}

export class FlipFlopNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("FlipFlop", "Flow", "FlipFlop", {
      ...options,
      description: "Toggle between two outputs",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("A");
    this.createExecOutputPin("B");
    this.data.state = false;
  }

  execute(): ExecutionResult {
    const outputs = this.getExecOutputPins();
    const nextPin = this.data.state ? outputs[1] : outputs[0];
    this.data.state = !this.data.state;

    return {
      nodeId: this.id,
      nextExecPins: nextPin ? [nextPin.id] : [],
      outputs: {},
    };
  }
}

export class DoOnceNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("DoOnce", "Flow", "Do Once", {
      ...options,
      description: "Execute only once",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createExecInputPin("Reset");
    this.data.hasExecuted = false;
  }

  execute(): ExecutionResult {
    if (this.data.hasExecuted) {
      return { nodeId: this.id, nextExecPins: [], outputs: {} };
    }
    this.data.hasExecuted = true;
    const outputs = this.getExecOutputPins();
    return {
      nodeId: this.id,
      nextExecPins: outputs[0] ? [outputs[0].id] : [],
      outputs: {},
    };
  }
}

export class DoNNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("DoN", "Flow", "Do N", {
      ...options,
      description: "Execute N times",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createExecInputPin("Reset");
    this.createInputPin("N", PinType.Integer, 1);
    this.data.count = 0;
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const n = inputs["N"] || 1;
    if (this.data.count >= n) {
      return { nodeId: this.id, nextExecPins: [], outputs: {} };
    }
    this.data.count++;
    const outputs = this.getExecOutputPins();
    return {
      nodeId: this.id,
      nextExecPins: outputs[0] ? [outputs[0].id] : [],
      outputs: {},
    };
  }
}

export class GateNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Gate", "Flow", "Gate", {
      ...options,
      description: "Allow or block execution",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createExecInputPin("Open");
    this.createExecInputPin("Close");
    this.createExecInputPin("Toggle");
    this.data.isOpen = false;
  }

  execute(): ExecutionResult {
    if (!this.data.isOpen) {
      return { nodeId: this.id, nextExecPins: [], outputs: {} };
    }
    const outputs = this.getExecOutputPins();
    return {
      nodeId: this.id,
      nextExecPins: outputs[0] ? [outputs[0].id] : [],
      outputs: {},
    };
  }
}

export class MultiGateNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("MultiGate", "Flow", "Multi Gate", {
      ...options,
      description: "Select from multiple outputs",
    });
    this.createExecInputPin("In");
    for (let i = 0; i < 4; i++) {
      this.createExecOutputPin(`Out ${i}`);
    }
    this.createInputPin("Index", PinType.Integer, 0);
    this.data.currentIndex = 0;
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const index = inputs["Index"] || 0;
    const outputs = this.getExecOutputPins();
    const nextPin = outputs[index] || outputs[0];

    return {
      nodeId: this.id,
      nextExecPins: nextPin ? [nextPin.id] : [],
      outputs: {},
    };
  }
}

export class ForLoopNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("ForLoop", "Flow", "For Loop", {
      ...options,
      description: "Loop from index to last index",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Loop Body");
    this.createExecOutputPin("Completed");
    this.createInputPin("First Index", PinType.Integer, 0);
    this.createInputPin("Last Index", PinType.Integer, 10);
    this.createOutputPin("Index", PinType.Integer);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const firstIndex = inputs["First Index"] || 0;
    const lastIndex = inputs["Last Index"] || 10;

    // Simplified: just execute loop body once with first index
    const outputs = this.getExecOutputPins();
    return {
      nodeId: this.id,
      nextExecPins: outputs[0] ? [outputs[0].id] : [],
      outputs: {
        [this.getOutputPin("Index")?.id || ""]: firstIndex,
      },
    };
  }
}

export class WhileLoopNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("WhileLoop", "Flow", "While Loop", {
      ...options,
      description: "Loop while condition is true",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Loop Body");
    this.createExecOutputPin("Completed");
    this.createInputPin("Condition", PinType.Boolean, false);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const condition = inputs["Condition"] || false;
    const outputs = this.getExecOutputPins();

    if (condition) {
      return {
        nodeId: this.id,
        nextExecPins: outputs[0] ? [outputs[0].id] : [],
        outputs: {},
      };
    } else {
      return {
        nodeId: this.id,
        nextExecPins: outputs[1] ? [outputs[1].id] : [],
        outputs: {},
      };
    }
  }
}

export class SwitchOnIntNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("SwitchInt", "Flow", "Switch on Int", {
      ...options,
      description: "Branch based on integer value",
    });
    this.createExecInputPin("In");
    for (let i = 0; i < 4; i++) {
      this.createExecOutputPin(`Case ${i}`);
    }
    this.createExecOutputPin("Default");
    this.createInputPin("Selection", PinType.Integer, 0);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const selection = inputs["Selection"] || 0;
    const outputs = this.getExecOutputPins();
    const nextPin =
      outputs[Math.min(selection, outputs.length - 2)] || outputs[outputs.length - 1];

    return {
      nodeId: this.id,
      nextExecPins: nextPin ? [nextPin.id] : [],
      outputs: {},
    };
  }
}

export class SwitchOnStringNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("SwitchString", "Flow", "Switch on String", {
      ...options,
      description: "Branch based on string value",
    });
    this.createExecInputPin("In");
    for (let i = 0; i < 4; i++) {
      this.createExecOutputPin(`Case ${i}`);
    }
    this.createExecOutputPin("Default");
    this.createInputPin("Selection", PinType.String, "");
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const outputs = this.getExecOutputPins();
    const nextPin = outputs[0] || outputs[outputs.length - 1];

    return {
      nodeId: this.id,
      nextExecPins: nextPin ? [nextPin.id] : [],
      outputs: {},
    };
  }
}

export class SwitchOnEnumNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("SwitchEnum", "Flow", "Switch on Enum", {
      ...options,
      description: "Branch based on enum value",
    });
    this.createExecInputPin("In");
    for (let i = 0; i < 4; i++) {
      this.createExecOutputPin(`Case ${i}`);
    }
    this.createExecOutputPin("Default");
    this.createInputPin("Selection", PinType.Enum, "");
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const outputs = this.getExecOutputPins();
    const nextPin = outputs[0] || outputs[outputs.length - 1];

    return {
      nodeId: this.id,
      nextExecPins: nextPin ? [nextPin.id] : [],
      outputs: {},
    };
  }
}

export class ReturnNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Return", "Flow", "Return", {
      ...options,
      description: "Return from function",
    });
    this.createExecInputPin("In");
    this.createInputPin("Result", PinType.Wildcard);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [], // Stop execution
      outputs: {
        Result: inputs["Result"],
      },
    };
  }
}

// Register all flow control nodes
const registry = NodeRegistry.getInstance();
registry.register("Sequence", SequenceNode, "Flow", "Sequence");
registry.register("Branch", BranchNode, "Flow", "Branch");
registry.register("FlipFlop", FlipFlopNode, "Flow", "FlipFlop");
registry.register("DoOnce", DoOnceNode, "Flow", "Do Once");
registry.register("DoN", DoNNode, "Flow", "Do N");
registry.register("Gate", GateNode, "Flow", "Gate");
registry.register("MultiGate", MultiGateNode, "Flow", "Multi Gate");
registry.register("ForLoop", ForLoopNode, "Flow", "For Loop");
registry.register("WhileLoop", WhileLoopNode, "Flow", "While Loop");
registry.register("SwitchInt", SwitchOnIntNode, "Flow", "Switch on Int");
registry.register("SwitchString", SwitchOnStringNode, "Flow", "Switch on String");
registry.register("SwitchEnum", SwitchOnEnumNode, "Flow", "Switch on Enum");
registry.register("Return", ReturnNode, "Flow", "Return");
