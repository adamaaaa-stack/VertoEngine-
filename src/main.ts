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
  private btnRun: HTMLButtonElement;
  private btnStop: HTMLButtonElement;
  private statusText: HTMLElement;
  private errorBar: HTMLElement;
  private errorText: HTMLElement;
  private canvasContainer: HTMLElement;
  private gameViewContainer: HTMLElement;
  private gameCanvas: HTMLCanvasElement;

  constructor() {
    // Initialize core
    registerAllNodes();
    this.graph = new Graph('main', 'Main Graph');

    // Get UI elements
    this.btnNew = document.getElementById('btn-new') as HTMLButtonElement;
    this.btnOpen = document.getElementById('btn-open') as HTMLButtonElement;
    this.btnSave = document.getElementById('btn-save') as HTMLButtonElement;
    this.btnRun = document.getElementById('btn-run') as HTMLButtonElement;
    this.btnStop = document.getElementById('btn-stop') as HTMLButtonElement;
    this.statusText = document.getElementById('status-text')!;
    this.errorBar = document.getElementById('errorbar')!;
    this.errorText = document.getElementById('error-text')!;
    this.canvasContainer = document.getElementById('canvas-container')!;
    this.gameViewContainer = document.getElementById('game-view-container')!;
    this.gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;

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

    // Setup event listeners
    this.setupEventListeners();

    this.setStatus('Ready');
  }

  private setupEventListeners(): void {
    this.btnNew.addEventListener('click', () => this.onNew());
    this.btnOpen.addEventListener('click', () => this.onOpen());
    this.btnSave.addEventListener('click', () => this.onSave());
    this.btnRun.addEventListener('click', () => this.onRun());
    this.btnStop.addEventListener('click', () => this.onStop());

    document.getElementById('btn-clear-error')?.addEventListener('click', () => {
      this.hideError();
    });
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

    // TODO: Implement file loading
    this.showError('Open not yet implemented');
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
