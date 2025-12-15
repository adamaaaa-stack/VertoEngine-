import { Node } from "../graph/Node";
import { PinType, ExecutionResult, PinDirection } from "../types";
import { NodeRegistry } from "./NodeRegistry";

/**
 * Event Nodes - Execution entry points triggered by engine events
 */

export class BeginPlayNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("BeginPlay", "Events", "Begin Play", { ...options, isLatent: false });
    this.createExecOutputPin("Event");
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {},
    };
  }
}

export class TickNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Tick", "Events", "Tick", { ...options });
    this.createExecOutputPin("Event");
    this.createOutputPin("DeltaTime", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    const deltaTime = inputs["DeltaTime"] || 0.016; // 60 FPS default
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {
        [this.getOutputPin("DeltaTime")?.id || ""]: deltaTime,
      },
    };
  }
}

export class EndPlayNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("EndPlay", "Events", "End Play", { ...options });
    this.createExecOutputPin("Event");
    this.createOutputPin("Reason", PinType.Enum);
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {
        [this.getOutputPin("Reason")?.id || ""]: "Destroyed",
      },
    };
  }
}

export class DestroyedNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Destroyed", "Events", "Destroyed", { ...options });
    this.createExecOutputPin("Event");
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {},
    };
  }
}

export class CustomEventNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("CustomEvent", "Events", "Custom Event", { ...options });
    this.createExecOutputPin("Event");
    this.data.eventName = "MyEvent";
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {},
    };
  }
}

export class InputKeyEventNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("InputKey", "Events", "Input Key Event", { ...options });
    this.createExecOutputPin("Pressed");
    this.createExecOutputPin("Released");
    this.createInputPin("Key", PinType.Name, "Space");
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id], // Pressed by default
      outputs: {},
    };
  }
}

export class InputAxisEventNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("InputAxis", "Events", "Input Axis Event", { ...options });
    this.createExecOutputPin("Event");
    this.createInputPin("AxisName", PinType.Name, "Horizontal");
    this.createOutputPin("AxisValue", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {
        [this.getOutputPin("AxisValue")?.id || ""]: inputs["AxisValue"] || 0,
      },
    };
  }
}

export class InputActionEventNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("InputAction", "Events", "Input Action Event", { ...options });
    this.createExecOutputPin("Started");
    this.createExecOutputPin("Triggered");
    this.createExecOutputPin("Completed");
    this.createInputPin("ActionName", PinType.Name, "Jump");
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id], // Started by default
      outputs: {},
    };
  }
}

export class MouseEventNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("MouseEvent", "Events", "Mouse Event", { ...options });
    this.createExecOutputPin("Moved");
    this.createExecOutputPin("Clicked");
    this.createExecOutputPin("Released");
    this.createOutputPin("MouseX", PinType.Float);
    this.createOutputPin("MouseY", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {
        [this.getOutputPin("MouseX")?.id || ""]: inputs["MouseX"] || 0,
        [this.getOutputPin("MouseY")?.id || ""]: inputs["MouseY"] || 0,
      },
    };
  }
}

export class TouchEventNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("TouchEvent", "Events", "Touch Event", { ...options });
    this.createExecOutputPin("Started");
    this.createExecOutputPin("Moved");
    this.createExecOutputPin("Ended");
    this.createOutputPin("TouchX", PinType.Float);
    this.createOutputPin("TouchY", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {
        [this.getOutputPin("TouchX")?.id || ""]: inputs["TouchX"] || 0,
        [this.getOutputPin("TouchY")?.id || ""]: inputs["TouchY"] || 0,
      },
    };
  }
}

export class GamepadEventNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("GamepadEvent", "Events", "Gamepad Event", { ...options });
    this.createExecOutputPin("ButtonPressed");
    this.createExecOutputPin("ButtonReleased");
    this.createExecOutputPin("AxisChanged");
    this.createInputPin("PlayerIndex", PinType.Integer, 0);
    this.createOutputPin("AxisValue", PinType.Float);
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {},
    };
  }
}

export class BeginOverlapNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("BeginOverlap", "Events", "Begin Overlap", { ...options });
    this.createExecOutputPin("Event");
    this.createOutputPin("OtherActor", PinType.Object);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {
        [this.getOutputPin("OtherActor")?.id || ""]: inputs["OtherActor"],
      },
    };
  }
}

export class EndOverlapNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("EndOverlap", "Events", "End Overlap", { ...options });
    this.createExecOutputPin("Event");
    this.createOutputPin("OtherActor", PinType.Object);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {
        [this.getOutputPin("OtherActor")?.id || ""]: inputs["OtherActor"],
      },
    };
  }
}

export class HitNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Hit", "Events", "Hit", { ...options });
    this.createExecOutputPin("Event");
    this.createOutputPin("OtherActor", PinType.Object);
    this.createOutputPin("ImpactPoint", PinType.Vector);
    this.createOutputPin("ImpactNormal", PinType.Vector);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {
        [this.getOutputPin("OtherActor")?.id || ""]: inputs["OtherActor"],
        [this.getOutputPin("ImpactPoint")?.id || ""]: inputs["ImpactPoint"],
        [this.getOutputPin("ImpactNormal")?.id || ""]: inputs["ImpactNormal"],
      },
    };
  }
}

// Register all event nodes
const registry = NodeRegistry.getInstance();
registry.register("BeginPlay", BeginPlayNode, "Events", "Begin Play", "Triggered when actor spawns");
registry.register("Tick", TickNode, "Events", "Tick", "Triggered every frame");
registry.register("EndPlay", EndPlayNode, "Events", "End Play", "Triggered when actor is destroyed");
registry.register("Destroyed", DestroyedNode, "Events", "Destroyed", "Triggered when actor is destroyed");
registry.register("CustomEvent", CustomEventNode, "Events", "Custom Event", "User-defined event");
registry.register("InputKey", InputKeyEventNode, "Events", "Input Key Event", "Triggered on key input");
registry.register("InputAxis", InputAxisEventNode, "Events", "Input Axis Event", "Triggered on axis movement");
registry.register("InputAction", InputActionEventNode, "Events", "Input Action Event", "Triggered on mapped action");
registry.register("MouseEvent", MouseEventNode, "Events", "Mouse Event", "Triggered on mouse input");
registry.register("TouchEvent", TouchEventNode, "Events", "Touch Event", "Triggered on touch input");
registry.register("GamepadEvent", GamepadEventNode, "Events", "Gamepad Event", "Triggered on gamepad input");
registry.register("BeginOverlap", BeginOverlapNode, "Events", "Begin Overlap", "Triggered on collision begin");
registry.register("EndOverlap", EndOverlapNode, "Events", "End Overlap", "Triggered on collision end");
registry.register("Hit", HitNode, "Events", "Hit", "Triggered on impact");
