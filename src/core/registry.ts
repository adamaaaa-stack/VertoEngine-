/**
 * Node registry for creating and managing node types.
 */

import { Node, NodeCategory } from './node.js';

export interface NodeDefinition {
  type: string;
  category: NodeCategory;
  displayName: string;
  description: string;
  factory: (id: string) => Node;
  keywords?: string[]; // For search
}

export class NodeRegistry {
  private static definitions = new Map<string, NodeDefinition>();

  /**
   * Register a node type.
   */
  static register(definition: NodeDefinition): void {
    if (this.definitions.has(definition.type)) {
      console.warn(`Node type ${definition.type} already registered`);
      return;
    }

    this.definitions.set(definition.type, definition);
  }

  /**
   * Create a node instance by type.
   */
  static create(type: string, id: string): Node {
    const definition = this.definitions.get(type);
    if (!definition) {
      throw new Error(`Unknown node type: ${type}`);
    }

    return definition.factory(id);
  }

  /**
   * Get node definition.
   */
  static getDefinition(type: string): NodeDefinition | undefined {
    return this.definitions.get(type);
  }

  /**
   * Get all node definitions.
   */
  static getAllDefinitions(): NodeDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Get node definitions by category.
   */
  static getByCategory(category: NodeCategory): NodeDefinition[] {
    return Array.from(this.definitions.values()).filter(d => d.category === category);
  }

  /**
   * Search nodes by keyword.
   */
  static search(query: string): NodeDefinition[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.definitions.values()).filter(d => {
      return (
        d.displayName.toLowerCase().includes(lowerQuery) ||
        d.description.toLowerCase().includes(lowerQuery) ||
        d.type.toLowerCase().includes(lowerQuery) ||
        d.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
      );
    });
  }

  /**
   * Get all categories.
   */
  static getCategories(): NodeCategory[] {
    const categories = new Set<NodeCategory>();
    for (const def of this.definitions.values()) {
      categories.add(def.category);
    }
    return Array.from(categories);
  }
}
