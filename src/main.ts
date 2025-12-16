/**
 * Main entry point for VertoEngine.
 */

import { Graph } from './core/graph.js';
import { GraphExecutor } from './core/executor.js';
import { NodeRegistry } from './core/registry.js';
import { registerAllNodes } from './nodes/index.js';
import { NodeCanvas } from './ui/nodeCanvas.js';
import { NodeLibrary } from './ui/nodeLibrary.js';
import { World } from './engine/world.js';
import { getAllExamples } from './examples/graphs.js';

class VertoEngine {
  private graph: Graph;
  private executor: GraphExecutor | null = null;
  private world: World;
  private nodeCanvas: NodeCanvas;
  private nodeLibrary: NodeLibrary;

  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // UI Elements
  private btnNew: HTMLButtonElement;
  private btnOpen: HTMLButtonElement;
  private btnSave: HTMLButtonElement;
  private btnExamples: HTMLButtonElement;
  private btnRun: HTMLButtonElement;
  private btnStop: HTMLButtonElement;
  private statusText: HTMLElement;
  private errorBar: HTMLElement;
  private errorText: HTMLElement;
  private canvasContainer: HTMLElement;
  private gameViewContainer: HTMLElement;
  private gameCanvas: HTMLCanvasElement;
  private examplesModal: HTMLElement;
  private examplesList: HTMLElement;
  private btnImportAsset: HTMLButtonElement;
  private assetList: HTMLElement;

  // Assets
  private assets: Map<string, { name: string; type: string; data: string | ArrayBuffer }> = new Map();

  constructor() {
    // Initialize core
    registerAllNodes();
    this.graph = new Graph('main', 'Main Graph');

    // Get UI elements
    this.btnNew = document.getElementById('btn-new') as HTMLButtonElement;
    this.btnOpen = document.getElementById('btn-open') as HTMLButtonElement;
    this.btnSave = document.getElementById('btn-save') as HTMLButtonElement;
    this.btnExamples = document.getElementById('btn-examples') as HTMLButtonElement;
    this.btnRun = document.getElementById('btn-run') as HTMLButtonElement;
    this.btnStop = document.getElementById('btn-stop') as HTMLButtonElement;
    this.statusText = document.getElementById('status-text')!;
    this.errorBar = document.getElementById('errorbar')!;
    this.errorText = document.getElementById('error-text')!;
    this.canvasContainer = document.getElementById('canvas-container')!;
    this.gameViewContainer = document.getElementById('game-view-container')!;
    this.gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.examplesModal = document.getElementById('examples-modal')!;
    this.examplesList = document.getElementById('examples-list')!;
    this.btnImportAsset = document.getElementById('btn-import-asset') as HTMLButtonElement;
    this.assetList = document.getElementById('asset-list')!;

    // Initialize canvas
    const nodeCanvasEl = document.getElementById('node-canvas') as HTMLCanvasElement;
    this.nodeCanvas = new NodeCanvas(nodeCanvasEl, this.graph);

    // Initialize node library
    const nodeLibraryContainer = document.getElementById('node-categories')!;
    const nodeSearchInput = document.getElementById('node-search') as HTMLInputElement;
    this.nodeLibrary = new NodeLibrary(
      nodeLibraryContainer,
      nodeSearchInput,
      this.onNodeSelected.bind(this)
    );

    // Initialize world
    this.world = new World(this.gameCanvas);
    this.world.setAssets(this.assets);

    // Setup event listeners
    this.setupEventListeners();

    this.setStatus('Ready');
  }

  private setupEventListeners(): void {
    this.btnNew.addEventListener('click', () => this.onNew());
    this.btnOpen.addEventListener('click', () => this.onOpen());
    this.btnSave.addEventListener('click', () => this.onSave());
    this.btnExamples.addEventListener('click', () => this.onExamples());
    this.btnRun.addEventListener('click', () => this.onRun());
    this.btnStop.addEventListener('click', () => this.onStop());
    this.btnImportAsset.addEventListener('click', () => this.onImportAsset());

    document.getElementById('btn-clear-error')?.addEventListener('click', () => {
      this.hideError();
    });

    document.getElementById('btn-close-examples')?.addEventListener('click', () => {
      this.examplesModal.classList.add('hidden');
    });

    // Populate examples list
    this.populateExamples();
  }

  private onNodeSelected(nodeType: string): void {
    try {
      const nodeId = `node_${Date.now()}`;
      const node = NodeRegistry.create(nodeType, nodeId);

      // Add to canvas at center
      this.nodeCanvas.addNode(node, 100, 100);
      this.setStatus(`Added ${node.displayName}`);
    } catch (error) {
      this.showError(`Failed to create node: ${error}`);
    }
  }

  private populateExamples(): void {
    const examples = getAllExamples();

    this.examplesList.innerHTML = '';

    for (const example of examples) {
      const item = document.createElement('div');
      item.className = 'example-item';

      const title = document.createElement('h3');
      title.textContent = example.name;

      const desc = document.createElement('p');
      desc.textContent = example.description;

      item.appendChild(title);
      item.appendChild(desc);

      item.addEventListener('click', () => {
        this.loadExample(example.factory);
        this.examplesModal.classList.add('hidden');
      });

      this.examplesList.appendChild(item);
    }
  }

  private loadExample(factory: () => Graph): void {
    if (this.isRunning) {
      this.showError('Stop execution before loading an example');
      return;
    }

    this.graph = factory();
    this.nodeCanvas.clear();

    // Add all nodes to canvas
    for (const node of this.graph.getNodes()) {
      this.nodeCanvas.addNode(node, node.x, node.y);
    }

    this.setStatus(`Loaded example: ${this.graph.name}`);
  }

  private onExamples(): void {
    this.examplesModal.classList.remove('hidden');
  }

  private onNew(): void {
    if (this.isRunning) {
      this.showError('Stop execution before creating a new graph');
      return;
    }

    if (confirm('Create new graph? Current graph will be lost.')) {
      this.graph = new Graph('main', 'Main Graph');
      this.nodeCanvas.clear();
      this.world.clear();
      this.setStatus('New graph created');
    }
  }

  private onOpen(): void {
    if (this.isRunning) {
      this.showError('Stop execution before opening a graph');
      return;
    }

    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Deserialize graph
        this.graph = Graph.deserialize(data, NodeRegistry);
        this.nodeCanvas.clear();

        // Add all nodes to canvas
        for (const node of this.graph.getNodes()) {
          this.nodeCanvas.addNode(node, node.x, node.y);
        }

        this.setStatus(`Loaded: ${this.graph.name}`);
      } catch (error) {
        this.showError(`Failed to load graph: ${error}`);
      }
    };

    input.click();
  }

  private onSave(): void {
    try {
      const data = JSON.stringify(this.graph.serialize(), null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.graph.name}.json`;
      a.click();

      URL.revokeObjectURL(url);
      this.setStatus('Graph saved');
    } catch (error) {
      this.showError(`Failed to save: ${error}`);
    }
  }

  private onImportAsset(): void {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,audio/*,.mp3,.wav,.ogg,.glb,.gltf';
    input.multiple = true;

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;

      if (!files || files.length === 0) return;

      for (const file of Array.from(files)) {
        try {
          // Determine asset type
          let type = 'unknown';
          if (file.type.startsWith('image/')) {
            type = 'image';
          } else if (file.type.startsWith('audio/')) {
            type = 'audio';
          } else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
            type = 'model';
          }

          // Read file as data URL for images/audio
          const reader = new FileReader();

          reader.onload = (event) => {
            const data = event.target?.result;
            if (data) {
              const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              this.assets.set(assetId, {
                name: file.name,
                type,
                data,
              });

              this.updateAssetList();
              this.world.setAssets(this.assets);
              this.setStatus(`Imported: ${file.name}`);
            }
          };

          reader.readAsDataURL(file);
        } catch (error) {
          this.showError(`Failed to import ${file.name}: ${error}`);
        }
      }
    };

    input.click();
  }

  private updateAssetList(): void {
    this.assetList.innerHTML = '';

    for (const [id, asset] of this.assets.entries()) {
      const item = document.createElement('div');
      item.className = 'asset-item';

      // Preview (for images)
      if (asset.type === 'image' && typeof asset.data === 'string') {
        const preview = document.createElement('img');
        preview.src = asset.data;
        preview.className = 'asset-preview';
        item.appendChild(preview);
      } else {
        const icon = document.createElement('div');
        icon.className = 'asset-icon';
        icon.textContent = asset.type === 'audio' ? '🔊' : asset.type === 'model' ? '📦' : '📄';
        item.appendChild(icon);
      }

      // Name
      const name = document.createElement('div');
      name.className = 'asset-name';
      name.textContent = asset.name;
      name.title = asset.name;
      item.appendChild(name);

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-icon asset-delete';
      deleteBtn.textContent = '×';
      deleteBtn.onclick = () => {
        this.assets.delete(id);
        this.updateAssetList();
        this.world.setAssets(this.assets);
        this.setStatus(`Deleted: ${asset.name}`);
      };
      item.appendChild(deleteBtn);

      this.assetList.appendChild(item);
    }
  }

  private async onRun(): Promise<void> {
    if (this.isRunning) return;

    try {
      // Validate graph
      const errors = this.graph.validate();
      if (errors.length > 0) {
        this.showError(`Validation failed:\n${errors.join('\n')}`);
        return;
      }

      // Create executor
      this.executor = new GraphExecutor(this.graph, this.world, {
        maxExecutionSteps: 100000,
        debugMode: false,
      });

      // Start execution
      await this.executor.start();

      this.isRunning = true;
      this.btnRun.disabled = true;
      this.btnStop.disabled = false;

      // Switch to game view
      this.canvasContainer.classList.add('hidden');
      this.gameViewContainer.classList.remove('hidden');

      // Start game loop
      this.lastTime = performance.now();
      this.gameLoop();

      this.setStatus('Running');
    } catch (error) {
      this.showError(`Failed to start: ${error}`);
      this.isRunning = false;
      this.btnRun.disabled = false;
      this.btnStop.disabled = true;
    }
  }

  private onStop(): void {
    if (!this.isRunning) return;

    if (this.executor) {
      this.executor.stop();
      this.executor = null;
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.isRunning = false;
    this.btnRun.disabled = false;
    this.btnStop.disabled = true;

    // Switch back to node canvas
    this.canvasContainer.classList.remove('hidden');
    this.gameViewContainer.classList.add('hidden');

    this.setStatus('Stopped');
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    try {
      // Update executor
      if (this.executor) {
        this.executor.resetStepCounter();
        this.executor.update(deltaTime);
      }

      // Update world
      this.world.update(deltaTime);

      // Render world
      this.world.render();

      // Continue loop
      this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    } catch (error) {
      this.showError(`Runtime error: ${error}`);
      this.onStop();
    }
  }

  private setStatus(message: string): void {
    this.statusText.textContent = message;
  }

  private showError(message: string): void {
    this.errorText.textContent = message;
    this.errorBar.classList.remove('hidden');
    console.error(message);
  }

  private hideError(): void {
    this.errorBar.classList.add('hidden');
  }
}

// Initialize the engine when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new VertoEngine();
});
