/**
 * Node library panel - displays available nodes.
 */

import { NodeRegistry, NodeDefinition } from '../core/registry.js';
import { NodeCategory } from '../core/node.js';

export class NodeLibrary {
  private container: HTMLElement;
  private searchInput: HTMLInputElement;
  private onNodeSelected: (nodeType: string) => void;

  constructor(
    container: HTMLElement,
    searchInput: HTMLInputElement,
    onNodeSelected: (nodeType: string) => void
  ) {
    this.container = container;
    this.searchInput = searchInput;
    this.onNodeSelected = onNodeSelected;

    this.setupEventListeners();
    this.render();
  }

  private setupEventListeners(): void {
    this.searchInput.addEventListener('input', () => {
      this.render();
    });
  }

  private render(): void {
    const query = this.searchInput.value.trim();

    if (query) {
      // Search mode
      this.renderSearchResults(query);
    } else {
      // Category mode
      this.renderCategories();
    }
  }

  private renderSearchResults(query: string): void {
    const results = NodeRegistry.search(query);

    this.container.innerHTML = '';

    if (results.length === 0) {
      this.container.innerHTML = '<div style="padding: 15px; color: #888;">No nodes found</div>';
      return;
    }

    for (const def of results) {
      const item = this.createNodeItem(def);
      this.container.appendChild(item);
    }
  }

  private renderCategories(): void {
    const categories = NodeRegistry.getCategories();

    this.container.innerHTML = '';

    for (const category of categories) {
      const categoryEl = this.createCategoryElement(category);
      this.container.appendChild(categoryEl);
    }
  }

  private createCategoryElement(category: NodeCategory): HTMLElement {
    const categoryEl = document.createElement('div');
    categoryEl.className = 'node-category';

    const header = document.createElement('div');
    header.className = 'node-category-header';
    header.textContent = category;
    categoryEl.appendChild(header);

    const items = document.createElement('div');
    items.className = 'node-category-items';

    const nodes = NodeRegistry.getByCategory(category);
    for (const def of nodes) {
      const item = this.createNodeItem(def);
      items.appendChild(item);
    }

    categoryEl.appendChild(items);

    // Toggle category
    header.addEventListener('click', () => {
      categoryEl.classList.toggle('expanded');
    });

    return categoryEl;
  }

  private createNodeItem(def: NodeDefinition): HTMLElement {
    const item = document.createElement('div');
    item.className = 'node-item';
    item.textContent = def.displayName;
    item.title = def.description;

    item.addEventListener('click', () => {
      this.onNodeSelected(def.type);
    });

    return item;
  }
}
