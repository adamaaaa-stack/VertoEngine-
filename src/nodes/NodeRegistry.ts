import { Node } from "../graph/Node";
import { INode } from "../types";

export type NodeConstructor = new (...args: any[]) => Node;

interface NodeDefinition {
  constructor: NodeConstructor;
  category: string;
  title: string;
  description?: string;
}

export class NodeRegistry {
  private static instance: NodeRegistry;
  private nodeTypes: Map<string, NodeDefinition> = new Map();

  private constructor() {}

  static getInstance(): NodeRegistry {
    if (!NodeRegistry.instance) {
      NodeRegistry.instance = new NodeRegistry();
    }
    return NodeRegistry.instance;
  }

  // Register a node type
  register(
    type: string,
    constructor: NodeConstructor,
    category: string,
    title: string,
    description?: string
  ): void {
    this.nodeTypes.set(type, {
      constructor,
      category,
      title,
      description,
    });
  }

  // Create a node instance
  createNode(
    type: string,
    options?: {
      id?: string;
      x?: number;
      y?: number;
    }
  ): Node | null {
    const definition = this.nodeTypes.get(type);
    if (!definition) {
      return null;
    }

    try {
      return new definition.constructor(options);
    } catch (error) {
      console.error(`Failed to create node of type ${type}:`, error);
      return null;
    }
  }

  // Get all node types grouped by category
  getNodesByCategory(): Record<string, { type: string; title: string; description?: string }[]> {
    const categories: Record<
      string,
      { type: string; title: string; description?: string }[]
    > = {};

    for (const [type, def] of this.nodeTypes) {
      if (!categories[def.category]) {
        categories[def.category] = [];
      }
      categories[def.category].push({
        type,
        title: def.title,
        description: def.description,
      });
    }

    return categories;
  }

  // Get specific category nodes
  getNodesByType(category: string): { type: string; title: string; description?: string }[] {
    const result: { type: string; title: string; description?: string }[] = [];
    for (const [type, def] of this.nodeTypes) {
      if (def.category === category) {
        result.push({
          type,
          title: def.title,
          description: def.description,
        });
      }
    }
    return result;
  }

  // Get all registered types
  getAllNodeTypes(): string[] {
    return Array.from(this.nodeTypes.keys());
  }

  // Check if type is registered
  hasNodeType(type: string): boolean {
    return this.nodeTypes.has(type);
  }
}
