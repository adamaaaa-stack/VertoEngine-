/**
 * Flow Control nodes - control execution flow.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { Pin, PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Branch (If/Else)
class BranchNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Branch', category: NodeCategory.Flow, displayName: 'Branch' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Condition', Types.Boolean, false));
    this.addPin(PinFactory.execOut('True'));
    this.addPin(PinFactory.execOut('False'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const condition = await this.getInputValue('Condition', context);
    return condition ? 'True' : 'False';
  }
}

// Sequence - execute multiple outputs in order
class SequenceNode extends Node {
  outputCount: number = 2;

  constructor(id: string) {
    super({ id, type: 'Sequence', category: NodeCategory.Flow, displayName: 'Sequence' });
    this.addPin(PinFactory.execIn());

    // Add default outputs
    for (let i = 0; i < this.outputCount; i++) {
      this.addPin(PinFactory.execOut(`Then ${i}`));
    }
  }

  async execute(execPin: Pin | null, context: ExecutionContext): Promise<string> {
    // Execute all outputs in sequence
    const outputs = this.getExecOutputPins();

    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i];

      // Execute connected nodes
      for (const connectedPin of output.connections) {
        const connectedNode = context.graph.getNode(connectedPin.nodeId);
        if (connectedNode) {
          // @ts-ignore - accessing private method
          await context.graph.executor?.executeNode(connectedNode, connectedPin, context);
        }
      }
    }

    return null!; // We handled execution manually
  }
}

// FlipFlop - alternates between two outputs
class FlipFlopNode extends Node {
  private isA: boolean = true;

  constructor(id: string) {
    super({ id, type: 'FlipFlop', category: NodeCategory.Flow, displayName: 'FlipFlop' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.execOut('A'));
    this.addPin(PinFactory.execOut('B'));
    this.addPin(PinFactory.output('Is A', Types.Boolean));
  }

  execute(): string {
    const result = this.isA ? 'A' : 'B';
    this.setOutputValue('Is A', this.isA);
    this.isA = !this.isA;
    return result;
  }
}

// DoOnce - executes only once until reset
class DoOnceNode extends Node {
  private hasExecuted: boolean = false;

  constructor(id: string) {
    super({ id, type: 'DoOnce', category: NodeCategory.Flow, displayName: 'Do Once' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.execIn('Reset'));
    this.addPin(PinFactory.execOut('Then'));
  }

  execute(execPin: Pin | null): string | null {
    if (execPin?.name === 'Reset') {
      this.hasExecuted = false;
      return null;
    }

    if (!this.hasExecuted) {
      this.hasExecuted = true;
      return 'Then';
    }

    return null;
  }
}

// DoN - executes N times
class DoNNode extends Node {
  private counter: number = 0;

  constructor(id: string) {
    super({ id, type: 'DoN', category: NodeCategory.Flow, displayName: 'Do N' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('N', Types.Int, 3));
    this.addPin(PinFactory.execIn('Reset'));
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Counter', Types.Int));
  }

  async execute(execPin: Pin | null, context: ExecutionContext): Promise<string | null> {
    if (execPin?.name === 'Reset') {
      this.counter = 0;
      return null;
    }

    const n = await this.getInputValue('N', context);

    if (this.counter < n) {
      this.counter++;
      this.setOutputValue('Counter', this.counter);
      return 'Then';
    }

    return null;
  }
}

// Gate - can be opened/closed/toggled
class GateNode extends Node {
  private isOpen: boolean = false;

  constructor(id: string) {
    super({ id, type: 'Gate', category: NodeCategory.Flow, displayName: 'Gate' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.execIn('Open'));
    this.addPin(PinFactory.execIn('Close'));
    this.addPin(PinFactory.execIn('Toggle'));
    this.addPin(PinFactory.input('Start Closed', Types.Boolean, true));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(execPin: Pin | null, context: ExecutionContext): Promise<string | null> {
    const pinName = execPin?.name;

    if (pinName === 'Open') {
      this.isOpen = true;
      return null;
    } else if (pinName === 'Close') {
      this.isOpen = false;
      return null;
    } else if (pinName === 'Toggle') {
      this.isOpen = !this.isOpen;
      return null;
    }

    // Main exec pin
    return this.isOpen ? 'Then' : null;
  }
}

// ForLoop - standard for loop
class ForLoopNode extends Node {
  constructor(id: string) {
    super({ id, type: 'ForLoop', category: NodeCategory.Flow, displayName: 'For Loop' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('First Index', Types.Int, 0));
    this.addPin(PinFactory.input('Last Index', Types.Int, 10));
    this.addPin(PinFactory.execOut('Loop Body'));
    this.addPin(PinFactory.execOut('Completed'));
    this.addPin(PinFactory.output('Index', Types.Int));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string | null> {
    const firstIndex = await this.getInputValue('First Index', context);
    const lastIndex = await this.getInputValue('Last Index', context);

    const loopBodyPin = this.getPin('Loop Body');
    if (!loopBodyPin) return 'Completed';

    for (let i = firstIndex; i <= lastIndex; i++) {
      this.setOutputValue('Index', i);

      // Execute loop body
      for (const connectedPin of loopBodyPin.connections) {
        const connectedNode = context.graph.getNode(connectedPin.nodeId);
        if (connectedNode) {
          // @ts-ignore
          await context.graph.executor?.executeNode(connectedNode, connectedPin, context);
        }
      }

      if (context.shouldStop) break;
    }

    return 'Completed';
  }
}

// WhileLoop
class WhileLoopNode extends Node {
  constructor(id: string) {
    super({ id, type: 'WhileLoop', category: NodeCategory.Flow, displayName: 'While Loop' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Condition', Types.Boolean, true));
    this.addPin(PinFactory.execOut('Loop Body'));
    this.addPin(PinFactory.execOut('Completed'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const loopBodyPin = this.getPin('Loop Body');
    if (!loopBodyPin) return 'Completed';

    let iterations = 0;
    const maxIterations = 10000; // Safety limit

    while (iterations < maxIterations) {
      const condition = await this.getInputValue('Condition', context);
      if (!condition) break;

      // Execute loop body
      for (const connectedPin of loopBodyPin.connections) {
        const connectedNode = context.graph.getNode(connectedPin.nodeId);
        if (connectedNode) {
          // @ts-ignore
          await context.graph.executor?.executeNode(connectedNode, connectedPin, context);
        }
      }

      if (context.shouldStop) break;
      iterations++;
    }

    if (iterations >= maxIterations) {
      console.warn('WhileLoop hit max iterations limit');
    }

    return 'Completed';
  }
}

// SwitchOnInt
class SwitchOnIntNode extends Node {
  caseCount: number = 3;

  constructor(id: string) {
    super({ id, type: 'SwitchOnInt', category: NodeCategory.Flow, displayName: 'Switch on Int' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Selection', Types.Int, 0));

    for (let i = 0; i < this.caseCount; i++) {
      this.addPin(PinFactory.execOut(`Case ${i}`));
    }

    this.addPin(PinFactory.execOut('Default'));
  }

  async execute(_execPin: Pin | null, context: ExecutionContext): Promise<string> {
    const selection = await this.getInputValue('Selection', context);
    const caseName = `Case ${selection}`;

    if (this.getPin(caseName)) {
      return caseName;
    }

    return 'Default';
  }
}

// Register all flow control nodes
export function registerFlowNodes(): void {
  NodeRegistry.register({
    type: 'Branch',
    category: NodeCategory.Flow,
    displayName: 'Branch',
    description: 'Branch execution based on a condition',
    factory: (id) => new BranchNode(id),
    keywords: ['if', 'else', 'condition'],
  });

  NodeRegistry.register({
    type: 'Sequence',
    category: NodeCategory.Flow,
    displayName: 'Sequence',
    description: 'Execute multiple outputs in order',
    factory: (id) => new SequenceNode(id),
    keywords: ['then', 'order'],
  });

  NodeRegistry.register({
    type: 'FlipFlop',
    category: NodeCategory.Flow,
    displayName: 'FlipFlop',
    description: 'Alternate between two outputs',
    factory: (id) => new FlipFlopNode(id),
    keywords: ['alternate', 'toggle'],
  });

  NodeRegistry.register({
    type: 'DoOnce',
    category: NodeCategory.Flow,
    displayName: 'Do Once',
    description: 'Execute only once',
    factory: (id) => new DoOnceNode(id),
    keywords: ['once', 'single'],
  });

  NodeRegistry.register({
    type: 'DoN',
    category: NodeCategory.Flow,
    displayName: 'Do N',
    description: 'Execute N times',
    factory: (id) => new DoNNode(id),
    keywords: ['count', 'limit'],
  });

  NodeRegistry.register({
    type: 'Gate',
    category: NodeCategory.Flow,
    displayName: 'Gate',
    description: 'Control execution flow with a gate',
    factory: (id) => new GateNode(id),
    keywords: ['gate', 'control', 'enable'],
  });

  NodeRegistry.register({
    type: 'ForLoop',
    category: NodeCategory.Flow,
    displayName: 'For Loop',
    description: 'Standard for loop',
    factory: (id) => new ForLoopNode(id),
    keywords: ['loop', 'for', 'iterate'],
  });

  NodeRegistry.register({
    type: 'WhileLoop',
    category: NodeCategory.Flow,
    displayName: 'While Loop',
    description: 'Loop while condition is true',
    factory: (id) => new WhileLoopNode(id),
    keywords: ['loop', 'while', 'condition'],
  });

  NodeRegistry.register({
    type: 'SwitchOnInt',
    category: NodeCategory.Flow,
    displayName: 'Switch on Int',
    description: 'Switch execution based on integer value',
    factory: (id) => new SwitchOnIntNode(id),
    keywords: ['switch', 'case', 'select'],
  });
}
