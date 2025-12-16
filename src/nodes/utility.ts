/**
 * Utility nodes - function/macro structures and editor-only nodes.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Comment Node - editor-only, does not execute
class CommentNode extends Node {
  commentText: string = 'Comment';

  constructor(id: string) {
    super({ id, type: 'Comment', category: NodeCategory.Utility, displayName: 'Comment', description: 'Add a comment to the graph' });
  }

  execute(): null {
    // Comments don't execute
    return null;
  }
}

// Reroute Node - passes execution through, useful for organizing wires
class RerouteNode extends Node {
  constructor(id: string) {
    super({ id, type: 'Reroute', category: NodeCategory.Utility, displayName: 'Reroute' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.execOut('Then'));
  }

  execute(): string {
    return 'Then';
  }
}

// Register utility nodes
export function registerUtilityNodes(): void {
  NodeRegistry.register({
    type: 'Comment',
    category: NodeCategory.Utility,
    displayName: 'Comment',
    description: 'Add a comment to the graph for documentation',
    factory: (id) => new CommentNode(id),
    keywords: ['comment', 'note', 'documentation'],
  });

  NodeRegistry.register({
    type: 'Reroute',
    category: NodeCategory.Utility,
    displayName: 'Reroute',
    description: 'Reroute connections for cleaner graphs',
    factory: (id) => new RerouteNode(id),
    keywords: ['reroute', 'organize', 'clean'],
  });
}
