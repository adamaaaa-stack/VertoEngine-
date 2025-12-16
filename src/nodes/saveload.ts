/**
 * Save and Load nodes.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Create Save Game Object
class CreateSaveGameObjectNode extends Node {
  constructor(id: string) {
    super({ id, type: 'CreateSaveGameObject', category: NodeCategory.SaveLoad, displayName: 'Create Save Game Object' });
    (this as any).isPure = true;
    this.addPin(PinFactory.output('Save Game', Types.Object));
  }

  execute(): null {
    const saveGame = {
      data: {},
      timestamp: Date.now(),
    };

    this.setOutputValue('Save Game', saveGame);
    return null;
  }
}

// Save Game to Slot
class SaveGameToSlotNode extends Node {
  constructor(id: string) {
    super({ id, type: 'SaveGameToSlot', category: NodeCategory.SaveLoad, displayName: 'Save Game to Slot' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Save Game', Types.Object));
    this.addPin(PinFactory.input('Slot Name', Types.String, 'SaveSlot1'));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: any, context: ExecutionContext): Promise<string> {
    const saveGame = await this.getInputValue('Save Game', context);
    const slotName = await this.getInputValue('Slot Name', context);

    if (saveGame) {
      localStorage.setItem(`savegame_${slotName}`, JSON.stringify(saveGame));
      console.log(`Saved game to slot: ${slotName}`);
    }

    return 'Then';
  }
}

// Load Game from Slot
class LoadGameFromSlotNode extends Node {
  constructor(id: string) {
    super({ id, type: 'LoadGameFromSlot', category: NodeCategory.SaveLoad, displayName: 'Load Game from Slot' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Slot Name', Types.String, 'SaveSlot1'));
    this.addPin(PinFactory.execOut('Success'));
    this.addPin(PinFactory.execOut('Failed'));
    this.addPin(PinFactory.output('Save Game', Types.Object));
  }

  async execute(_execPin: any, context: ExecutionContext): Promise<string> {
    const slotName = await this.getInputValue('Slot Name', context);

    const data = localStorage.getItem(`savegame_${slotName}`);
    if (data) {
      const saveGame = JSON.parse(data);
      this.setOutputValue('Save Game', saveGame);
      console.log(`Loaded game from slot: ${slotName}`);
      return 'Success';
    }

    this.setOutputValue('Save Game', null);
    return 'Failed';
  }
}

// Delete Save Slot
class DeleteSaveSlotNode extends Node {
  constructor(id: string) {
    super({ id, type: 'DeleteSaveSlot', category: NodeCategory.SaveLoad, displayName: 'Delete Save Slot' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.input('Slot Name', Types.String, 'SaveSlot1'));
    this.addPin(PinFactory.execOut('Then'));
  }

  async execute(_execPin: any, context: ExecutionContext): Promise<string> {
    const slotName = await this.getInputValue('Slot Name', context);

    localStorage.removeItem(`savegame_${slotName}`);
    console.log(`Deleted save slot: ${slotName}`);

    return 'Then';
  }
}

// Register save/load nodes
export function registerSaveLoadNodes(): void {
  NodeRegistry.register({
    type: 'CreateSaveGameObject',
    category: NodeCategory.SaveLoad,
    displayName: 'Create Save Game Object',
    description: 'Create a new save game object',
    factory: (id) => new CreateSaveGameObjectNode(id),
    keywords: ['create', 'save', 'game', 'object'],
  });

  NodeRegistry.register({
    type: 'SaveGameToSlot',
    category: NodeCategory.SaveLoad,
    displayName: 'Save Game to Slot',
    description: 'Save game data to a slot',
    factory: (id) => new SaveGameToSlotNode(id),
    keywords: ['save', 'game', 'slot', 'persist'],
  });

  NodeRegistry.register({
    type: 'LoadGameFromSlot',
    category: NodeCategory.SaveLoad,
    displayName: 'Load Game from Slot',
    description: 'Load game data from a slot',
    factory: (id) => new LoadGameFromSlotNode(id),
    keywords: ['load', 'game', 'slot', 'restore'],
  });

  NodeRegistry.register({
    type: 'DeleteSaveSlot',
    category: NodeCategory.SaveLoad,
    displayName: 'Delete Save Slot',
    description: 'Delete a save game slot',
    factory: (id) => new DeleteSaveSlotNode(id),
    keywords: ['delete', 'save', 'slot', 'remove'],
  });
}
