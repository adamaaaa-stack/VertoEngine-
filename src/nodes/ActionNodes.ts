import { Node } from "../graph/Node";
import { PinType, ExecutionResult } from "../types";
import { NodeRegistry } from "./NodeRegistry";

/**
 * Action Nodes - These require execution flow (impure)
 */

export class PrintStringNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("PrintString", "Debug", "Print String", {
      ...options,
      isPure: false,
      description: "Print a string to debug output",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createInputPin("String", PinType.String, "Debug");
    this.createInputPin("Prefix", PinType.String, "");
    this.createInputPin("Duration", PinType.Float, 2.0);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const message = `${inputs["Prefix"] || ""}${inputs["String"] || ""}`;
    console.log(message);
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {},
    };
  }
}

export class DelayNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Delay", "Time", "Delay", {
      ...options,
      isPure: false,
      isLatent: true,
      description: "Delay execution for N seconds",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createInputPin("Duration", PinType.Float, 1.0);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const duration = inputs["Duration"] || 1.0;
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {},
      isLatent: true,
      latentId: `delay_${this.id}`,
    };
  }
}

export class SpawnActorNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("SpawnActor", "Actor", "Spawn Actor", {
      ...options,
      isPure: false,
      description: "Spawn an actor at a location",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createInputPin("Class", PinType.Object);
    this.createInputPin("Location", PinType.Vector);
    this.createInputPin("Rotation", PinType.Vector);
    this.createOutputPin("Actor", PinType.Object);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const actor = {
      __isActor: true,
      __class: inputs["Class"],
      location: inputs["Location"],
      rotation: inputs["Rotation"],
    };
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {
        [this.getOutputPin("Actor")?.id || ""]: actor,
      },
    };
  }
}

export class DestroyActorNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("DestroyActor", "Actor", "Destroy Actor", {
      ...options,
      isPure: false,
      description: "Destroy an actor",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createInputPin("Target", PinType.Object);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    // In a real engine, this would mark the actor for destruction
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {},
    };
  }
}

export class SetActorLocationNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("SetActorLocation", "Actor", "Set Actor Location", {
      ...options,
      isPure: false,
      description: "Set actor world position",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createInputPin("Target", PinType.Object);
    this.createInputPin("New Location", PinType.Vector);
    this.createInputPin("Sweep", PinType.Boolean, false);
    this.createInputPin("Teleport", PinType.Boolean, false);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const target = inputs["Target"];
    if (target && target.location) {
      target.location = inputs["New Location"];
    }
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {},
    };
  }
}

export class SetActorRotationNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("SetActorRotation", "Actor", "Set Actor Rotation", {
      ...options,
      isPure: false,
      description: "Set actor rotation",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createInputPin("Target", PinType.Object);
    this.createInputPin("New Rotation", PinType.Vector);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const target = inputs["Target"];
    if (target && target.rotation !== undefined) {
      target.rotation = inputs["New Rotation"];
    }
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {},
    };
  }
}

export class GetActorLocationNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("GetActorLocation", "Actor", "Get Actor Location", {
      ...options,
      isPure: true,
      description: "Get actor world position",
    });
    this.createInputPin("Target", PinType.Object);
    this.createOutputPin("Location", PinType.Vector);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const target = inputs["Target"];
    const location = target?.location || { x: 0, y: 0, z: 0 };
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Location")?.id || ""]: location,
      },
    };
  }
}

export class GetActorRotationNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("GetActorRotation", "Actor", "Get Actor Rotation", {
      ...options,
      isPure: true,
      description: "Get actor rotation",
    });
    this.createInputPin("Target", PinType.Object);
    this.createOutputPin("Rotation", PinType.Vector);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const target = inputs["Target"];
    const rotation = target?.rotation || { x: 0, y: 0, z: 0 };
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Rotation")?.id || ""]: rotation,
      },
    };
  }
}

export class EnableTickNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("EnableTick", "Actor", "Enable Tick", {
      ...options,
      isPure: false,
      description: "Enable actor ticking",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createInputPin("Target", PinType.Object);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const target = inputs["Target"];
    if (target) {
      target.__tickEnabled = true;
    }
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {},
    };
  }
}

export class DisableTickNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("DisableTick", "Actor", "Disable Tick", {
      ...options,
      isPure: false,
      description: "Disable actor ticking",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createInputPin("Target", PinType.Object);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const target = inputs["Target"];
    if (target) {
      target.__tickEnabled = false;
    }
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {},
    };
  }
}

export class PlaySoundNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("PlaySound2D", "Audio", "Play Sound 2D", {
      ...options,
      isPure: false,
      description: "Play a 2D sound",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createInputPin("Sound", PinType.Object);
    this.createInputPin("Volume", PinType.Float, 1.0);
    this.createInputPin("Pitch", PinType.Float, 1.0);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    console.log(`Playing sound at volume ${inputs["Volume"]} pitch ${inputs["Pitch"]}`);
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {},
    };
  }
}

export class DrawDebugLineNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("DrawDebugLine", "Debug", "Draw Debug Line", {
      ...options,
      isPure: false,
      description: "Draw a debug line",
    });
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createInputPin("Start", PinType.Vector);
    this.createInputPin("End", PinType.Vector);
    this.createInputPin("Color", PinType.Object);
    this.createInputPin("Duration", PinType.Float, 1.0);
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {},
    };
  }
}

// Register all action nodes
const registry = NodeRegistry.getInstance();
registry.register("PrintString", PrintStringNode, "Debug", "Print String");
registry.register("Delay", DelayNode, "Time", "Delay");
registry.register("SpawnActor", SpawnActorNode, "Actor", "Spawn Actor");
registry.register("DestroyActor", DestroyActorNode, "Actor", "Destroy Actor");
registry.register("SetActorLocation", SetActorLocationNode, "Actor", "Set Actor Location");
registry.register("SetActorRotation", SetActorRotationNode, "Actor", "Set Actor Rotation");
registry.register("GetActorLocation", GetActorLocationNode, "Actor", "Get Actor Location");
registry.register("GetActorRotation", GetActorRotationNode, "Actor", "Get Actor Rotation");
registry.register("EnableTick", EnableTickNode, "Actor", "Enable Tick");
registry.register("DisableTick", DisableTickNode, "Actor", "Disable Tick");
registry.register("PlaySound2D", PlaySoundNode, "Audio", "Play Sound 2D");
registry.register("DrawDebugLine", DrawDebugLineNode, "Debug", "Draw Debug Line");
