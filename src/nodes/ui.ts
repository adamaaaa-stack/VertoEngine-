/**
 * UI and Widget nodes.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Create Widget
class CreateWidgetNode extends Node {
  constructor(id: string) {
    super({ id, type: 'CreateWidget', category: NodeCategory.UI, displayName: 'Create Widget' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Widget Class', Types.String, 'Button'));
    this.addPin(PinFactory.execOut('Then'));
    this.addPin(PinFactory.output('Widget', Types.Widget));
  }

  async execute(_execPin: any, context: ExecutionContext): Promise<string> {
    const widgetClass = await this.getInputValue('Widget Class', context);

    const widget = {
      id: `widget_${Date.now()}`,
      class: widgetClass,
      visible: false,
    };

    this.setOutputValue('Widget', widget);
    return 'Then';
  }
}

// Add to Viewport
class AddToViewportNode extends Node {
  constructor(id: string) {
    super({ id, type: 'AddToViewport', category: NodeCategory.UI, displayName: 'Add to Viewport' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Widget', Types.Widget));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: any, context: ExecutionContext): Promise<string> {
    const widget = await this.getInputValue('Widget', context);

    if (widget) {
      widget.visible = true;
      console.log(`Added widget to viewport: ${widget.class}`);
    }

    return 'Then';
  }
}

// Remove from Parent
class RemoveFromParentNode extends Node {
  constructor(id: string) {
    super({ id, type: 'RemoveFromParent', category: NodeCategory.UI, displayName: 'Remove from Parent' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Widget', Types.Widget));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: any, context: ExecutionContext): Promise<string> {
    const widget = await this.getInputValue('Widget', context);

    if (widget) {
      widget.visible = false;
      console.log(`Removed widget from viewport: ${widget.class}`);
    }

    return 'Then';
  }
}

// Register UI nodes
export function registerUINodes(): void {
  NodeRegistry.register({
    type: 'CreateWidget',
    category: NodeCategory.UI,
    displayName: 'Create Widget',
    description: 'Create a UI widget',
    factory: (id) => new CreateWidgetNode(id),
    keywords: ['create', 'widget', 'ui', 'interface'],
  });

  NodeRegistry.register({
    type: 'AddToViewport',
    category: NodeCategory.UI,
    displayName: 'Add to Viewport',
    description: 'Add widget to viewport',
    factory: (id) => new AddToViewportNode(id),
    keywords: ['add', 'viewport', 'widget', 'ui', 'show'],
  });

  NodeRegistry.register({
    type: 'RemoveFromParent',
    category: NodeCategory.UI,
    displayName: 'Remove from Parent',
    description: 'Remove widget from its parent',
    factory: (id) => new RemoveFromParentNode(id),
    keywords: ['remove', 'widget', 'ui', 'hide'],
  });
}
