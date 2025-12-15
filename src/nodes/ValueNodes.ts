import { Node } from "../graph/Node";
import { PinType, ExecutionResult } from "../types";
import { NodeRegistry } from "./NodeRegistry";

/**
 * Pure Value and Literal Nodes - These have no execution pins
 */

export class BooleanLiteralNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("BoolLiteral", "Values", "Boolean", {
      ...options,
      isPure: true,
      description: "Boolean value",
    });
    this.createOutputPin("Value", PinType.Boolean);
    this.data.value = false;
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Value")?.id || ""]: this.data.value,
      },
    };
  }
}

export class IntegerLiteralNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("IntLiteral", "Values", "Integer", {
      ...options,
      isPure: true,
      description: "Integer value",
    });
    this.createOutputPin("Value", PinType.Integer);
    this.data.value = 0;
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Value")?.id || ""]: this.data.value,
      },
    };
  }
}

export class FloatLiteralNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("FloatLiteral", "Values", "Float", {
      ...options,
      isPure: true,
      description: "Float value",
    });
    this.createOutputPin("Value", PinType.Float);
    this.data.value = 0.0;
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Value")?.id || ""]: this.data.value,
      },
    };
  }
}

export class StringLiteralNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("StringLiteral", "Values", "String", {
      ...options,
      isPure: true,
      description: "String value",
    });
    this.createOutputPin("Value", PinType.String);
    this.data.value = "";
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Value")?.id || ""]: this.data.value,
      },
    };
  }
}

export class NameLiteralNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("NameLiteral", "Values", "Name", {
      ...options,
      isPure: true,
      description: "Name value",
    });
    this.createOutputPin("Value", PinType.Name);
    this.data.value = "";
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Value")?.id || ""]: this.data.value,
      },
    };
  }
}

export class TextLiteralNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("TextLiteral", "Values", "Text", {
      ...options,
      isPure: true,
      description: "Text value",
    });
    this.createOutputPin("Value", PinType.Text);
    this.data.value = "";
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Value")?.id || ""]: this.data.value,
      },
    };
  }
}

export class EnumLiteralNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("EnumLiteral", "Values", "Enum", {
      ...options,
      isPure: true,
      description: "Enum value",
    });
    this.createOutputPin("Value", PinType.Enum);
    this.data.value = "Default";
    this.data.enumType = "Custom";
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Value")?.id || ""]: this.data.value,
      },
    };
  }
}

export class SelfNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("Self", "Values", "Self", {
      ...options,
      isPure: true,
      description: "Reference to self",
    });
    this.createOutputPin("Self", PinType.Object);
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Self")?.id || ""]: { __self: true },
      },
    };
  }
}

export class GetOwnerNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("GetOwner", "Values", "Get Owner", {
      ...options,
      isPure: true,
      description: "Get owner actor",
    });
    this.createInputPin("Target", PinType.Object);
    this.createOutputPin("Owner", PinType.Object);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Owner")?.id || ""]: inputs["Target"]?.owner || null,
      },
    };
  }
}

export class GetPlayerCharacterNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("GetPlayerCharacter", "Values", "Get Player Character", {
      ...options,
      isPure: true,
      description: "Get player character reference",
    });
    this.createInputPin("Player Index", PinType.Integer, 0);
    this.createOutputPin("Character", PinType.Object);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Character")?.id || ""]: { __playerCharacter: true, index: inputs["Player Index"] },
      },
    };
  }
}

export class GetPlayerControllerNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("GetPlayerController", "Values", "Get Player Controller", {
      ...options,
      isPure: true,
      description: "Get player controller reference",
    });
    this.createInputPin("Player Index", PinType.Integer, 0);
    this.createOutputPin("Controller", PinType.Object);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Controller")?.id || ""]: { __playerController: true, index: inputs["Player Index"] },
      },
    };
  }
}

export class GetGameModeNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("GetGameMode", "Values", "Get Game Mode", {
      ...options,
      isPure: true,
      description: "Get game mode reference",
    });
    this.createOutputPin("Game Mode", PinType.Object);
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Game Mode")?.id || ""]: { __gameMode: true },
      },
    };
  }
}

export class GetGameStateNode extends Node {
  constructor(options: { id?: string; x?: number; y?: number } = {}) {
    super("GetGameState", "Values", "Get Game State", {
      ...options,
      isPure: true,
      description: "Get game state reference",
    });
    this.createOutputPin("Game State", PinType.Object);
  }

  execute(): ExecutionResult {
    return {
      nodeId: this.id,
      outputs: {
        [this.getOutputPin("Game State")?.id || ""]: { __gameState: true },
      },
    };
  }
}

// Register all value nodes
const registry = NodeRegistry.getInstance();
registry.register("BoolLiteral", BooleanLiteralNode, "Values", "Boolean");
registry.register("IntLiteral", IntegerLiteralNode, "Values", "Integer");
registry.register("FloatLiteral", FloatLiteralNode, "Values", "Float");
registry.register("StringLiteral", StringLiteralNode, "Values", "String");
registry.register("NameLiteral", NameLiteralNode, "Values", "Name");
registry.register("TextLiteral", TextLiteralNode, "Values", "Text");
registry.register("EnumLiteral", EnumLiteralNode, "Values", "Enum");
registry.register("Self", SelfNode, "Values", "Self");
registry.register("GetOwner", GetOwnerNode, "Values", "Get Owner");
registry.register("GetPlayerCharacter", GetPlayerCharacterNode, "Values", "Get Player Character");
registry.register("GetPlayerController", GetPlayerControllerNode, "Values", "Get Player Controller");
registry.register("GetGameMode", GetGameModeNode, "Values", "Get Game Mode");
registry.register("GetGameState", GetGameStateNode, "Values", "Get Game State");
