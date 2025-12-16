/**
 * Node canvas - renders and handles interaction with the node graph.
 * Optimized for iPad with touch support.
 */

import { Graph } from '../core/graph.js';
import { Node } from '../core/node.js';
import { Pin } from '../core/pin.js';
import { TypeChecker } from '../core/types.js';

interface CanvasNode {
  node: Node;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Connection {
  from: Pin;
  to: Pin;
}

export class NodeCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private graph: Graph;

  // Visual state
  private canvasNodes: Map<string, CanvasNode> = new Map();
  private connections: Connection[] = [];

  // Camera - start zoomed out for iPad
  private offsetX: number = 100;
  private offsetY: number = 100;
  private zoom: number = 0.6;

  // Interaction
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private draggedNode: CanvasNode | null = null;
  private selectedNode: Node | null = null;
  private selectedNodes: Set<Node> = new Set();
  private connectingFrom: Pin | null = null;

  // Touch state
  private lastTouchDistance: number = 0;
  private touchStartTime: number = 0;

  // Clipboard
  private clipboard: any[] = [];

  // Grid
  private gridSize: number = 20;

  // Toolbar (iPad)
  private toolbar: HTMLElement | null = null;
  private toolbarCopyBtn: HTMLButtonElement | null = null;
  private toolbarDuplicateBtn: HTMLButtonElement | null = null;
  private toolbarDeleteBtn: HTMLButtonElement | null = null;

  constructor(canvas: HTMLCanvasElement, graph: Graph) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.graph = graph;

    this.setupCanvas();
    this.setupEventListeners();
    this.setupToolbar();
  }

  private setupCanvas(): void {
    // Set canvas size
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = this.canvas.clientWidth * dpr;
      this.canvas.height = this.canvas.clientHeight * dpr;
      this.ctx.scale(dpr, dpr);
      this.render();
    };

    resize();
    window.addEventListener('resize', resize);
  }

  private setupEventListeners(): void {
    // Touch events (primary for iPad)
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });

    // Mouse events (fallback for desktop)
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    this.canvas.addEventListener('contextmenu', this.onContextMenu.bind(this));

    // Keyboard events
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  private setupToolbar(): void {
    this.toolbar = document.getElementById('node-toolbar');
    this.toolbarCopyBtn = document.getElementById('toolbar-copy') as HTMLButtonElement;
    this.toolbarDuplicateBtn = document.getElementById('toolbar-duplicate') as HTMLButtonElement;
    this.toolbarDeleteBtn = document.getElementById('toolbar-delete') as HTMLButtonElement;

    if (this.toolbarCopyBtn) {
      this.toolbarCopyBtn.addEventListener('click', () => {
        this.copySelectedNodes();
        this.updateToolbar();
      });
    }

    if (this.toolbarDuplicateBtn) {
      this.toolbarDuplicateBtn.addEventListener('click', () => {
        this.duplicateSelectedNodes();
        this.updateToolbar();
      });
    }

    if (this.toolbarDeleteBtn) {
      this.toolbarDeleteBtn.addEventListener('click', () => {
        this.deleteSelectedNodes();
        this.updateToolbar();
      });
    }
  }

  private updateToolbar(): void {
    if (!this.toolbar) return;

    // Show toolbar only if nodes are selected
    if (this.selectedNodes.size > 0) {
      this.toolbar.classList.remove('hidden');
    } else {
      this.toolbar.classList.add('hidden');
    }
  }

  // Touch event handlers
  private onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    this.touchStartTime = Date.now();

    if (e.touches.length === 2) {
      // Two-finger pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left - this.offsetX) / this.zoom;
      const y = (touch.clientY - rect.top - this.offsetY) / this.zoom;

      // Check if touching a pin (larger hit area for touch)
      const pin = this.getPinAt(x, y, 20);
      if (pin) {
        this.connectingFrom = pin;
        return;
      }

      // Check if touching a node
      const node = this.getNodeAt(x, y);
      if (node) {
        this.draggedNode = node;

        // Select node
        if (!this.selectedNodes.has(node.node)) {
          this.selectedNodes.clear();
          this.selectedNodes.add(node.node);
        }
        this.selectedNode = node.node;

        this.dragStartX = x - node.x;
        this.dragStartY = y - node.y;
        this.render();
        this.updateToolbar();
        return;
      }

      // Clear selection and pan canvas
      this.selectedNodes.clear();
      this.selectedNode = null;
      this.isDragging = true;
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.render();
      this.updateToolbar();
    }
  }

  private onTouchMove(e: TouchEvent): void {
    e.preventDefault();

    if (e.touches.length === 2) {
      // Pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (this.lastTouchDistance > 0) {
        const delta = distance / this.lastTouchDistance;
        this.zoom = Math.max(0.3, Math.min(2, this.zoom * delta));
        this.render();
      }

      this.lastTouchDistance = distance;
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left - this.offsetX) / this.zoom;
      const y = (touch.clientY - rect.top - this.offsetY) / this.zoom;

      if (this.draggedNode) {
        // Drag node
        this.draggedNode.x = x - this.dragStartX;
        this.draggedNode.y = y - this.dragStartY;
        this.draggedNode.node.x = this.draggedNode.x;
        this.draggedNode.node.y = this.draggedNode.y;
        this.render();
      } else if (this.isDragging) {
        // Pan canvas
        this.offsetX += touch.clientX - this.dragStartX;
        this.offsetY += touch.clientY - this.dragStartY;
        this.dragStartX = touch.clientX;
        this.dragStartY = touch.clientY;
        this.render();
      } else if (this.connectingFrom) {
        // Drawing connection preview
        this.render();
        const fromPos = this.getPinPosition(this.connectingFrom);
        const toX = (touch.clientX - rect.left - this.offsetX) / this.zoom;
        const toY = (touch.clientY - rect.top - this.offsetY) / this.zoom;
        this.drawConnectionPreview(fromPos, { x: toX, y: toY });
      }
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    e.preventDefault();

    if (this.connectingFrom && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left - this.offsetX) / this.zoom;
      const y = (touch.clientY - rect.top - this.offsetY) / this.zoom;

      const toPin = this.getPinAt(x, y, 20);
      if (toPin && this.connectingFrom.canConnectTo(toPin)) {
        this.connectingFrom.connect(toPin);
        this.updateConnections();
      }

      this.connectingFrom = null;
    }

    this.isDragging = false;
    this.draggedNode = null;
    this.lastTouchDistance = 0;
    this.render();
  }

  // Mouse event handlers (desktop fallback)
  private onMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
    const y = (e.clientY - rect.top - this.offsetY) / this.zoom;

    // Check if clicking on a pin
    const pin = this.getPinAt(x, y);
    if (pin) {
      this.connectingFrom = pin;
      return;
    }

    // Check if clicking on a node
    const node = this.getNodeAt(x, y);
    if (node) {
      this.draggedNode = node;

      // Multi-select with Shift key
      if (e.shiftKey) {
        if (this.selectedNodes.has(node.node)) {
          this.selectedNodes.delete(node.node);
        } else {
          this.selectedNodes.add(node.node);
        }
        this.selectedNode = node.node;
      } else {
        // Single select
        if (!this.selectedNodes.has(node.node)) {
          this.selectedNodes.clear();
          this.selectedNodes.add(node.node);
        }
        this.selectedNode = node.node;
      }

      this.dragStartX = x - node.x;
      this.dragStartY = y - node.y;
      this.render();
      this.updateToolbar();
      return;
    }

    // Clear selection and pan canvas
    if (!e.shiftKey) {
      this.selectedNodes.clear();
      this.selectedNode = null;
      this.updateToolbar();
    }
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.render();
  }

  private onMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
    const y = (e.clientY - rect.top - this.offsetY) / this.zoom;

    if (this.draggedNode) {
      // Drag node(s)
      const deltaX = (x - this.dragStartX) - this.draggedNode.x;
      const deltaY = (y - this.dragStartY) - this.draggedNode.y;

      // Move all selected nodes together
      for (const selectedNode of this.selectedNodes) {
        const canvasNode = this.canvasNodes.get(selectedNode.id);
        if (canvasNode) {
          canvasNode.x += deltaX;
          canvasNode.y += deltaY;
          canvasNode.node.x = canvasNode.x;
          canvasNode.node.y = canvasNode.y;
        }
      }

      this.render();
    } else if (this.isDragging) {
      // Pan canvas
      this.offsetX += e.clientX - this.dragStartX;
      this.offsetY += e.clientY - this.dragStartY;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.render();
    } else if (this.connectingFrom) {
      // Drawing connection preview
      this.render();
      const fromPos = this.getPinPosition(this.connectingFrom);
      const toX = (e.clientX - rect.left - this.offsetX) / this.zoom;
      const toY = (e.clientY - rect.top - this.offsetY) / this.zoom;
      this.drawConnectionPreview(fromPos, { x: toX, y: toY });
    }
  }

  private onMouseUp(e: MouseEvent): void {
    if (this.connectingFrom) {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
      const y = (e.clientY - rect.top - this.offsetY) / this.zoom;

      const toPin = this.getPinAt(x, y);
      if (toPin && this.connectingFrom.canConnectTo(toPin)) {
        this.connectingFrom.connect(toPin);
        this.updateConnections();
      }

      this.connectingFrom = null;
    }

    this.isDragging = false;
    this.draggedNode = null;
    this.render();
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.zoom = Math.max(0.3, Math.min(2, this.zoom * delta));
    this.render();
  }

  private onContextMenu(e: MouseEvent): void {
    e.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
    const y = (e.clientY - rect.top - this.offsetY) / this.zoom;

    // Check if right-clicking on a node
    const node = this.getNodeAt(x, y);
    if (node && !this.selectedNodes.has(node.node)) {
      this.selectedNodes.clear();
      this.selectedNodes.add(node.node);
      this.selectedNode = node.node;
      this.render();
      this.updateToolbar();
    }

    // Show context menu
    if (this.selectedNodes.size > 0) {
      this.showContextMenu(e.clientX, e.clientY);
    }
  }

  private showContextMenu(x: number, y: number): void {
    // Remove existing context menu if any
    const existingMenu = document.getElementById('node-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    // Create context menu
    const menu = document.createElement('div');
    menu.id = 'node-context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.background = '#2d2d2d';
    menu.style.border = '1px solid #4a4a4a';
    menu.style.borderRadius = '4px';
    menu.style.padding = '4px 0';
    menu.style.zIndex = '10000';
    menu.style.minWidth = '150px';
    menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

    const items = [
      { label: 'Copy', action: () => this.copySelectedNodes() },
      { label: 'Duplicate', action: () => this.duplicateSelectedNodes() },
      { label: 'Delete', action: () => this.deleteSelectedNodes() },
    ];

    if (this.clipboard.length > 0) {
      items.splice(1, 0, { label: 'Paste', action: () => this.pasteNodes() });
    }

    for (const item of items) {
      const menuItem = document.createElement('div');
      menuItem.textContent = item.label;
      menuItem.style.padding = '8px 16px';
      menuItem.style.cursor = 'pointer';
      menuItem.style.color = '#d4d4d4';
      menuItem.style.fontSize = '14px';

      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.background = '#3e3e3e';
      });

      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.background = 'transparent';
      });

      menuItem.addEventListener('click', () => {
        item.action();
        menu.remove();
      });

      menu.appendChild(menuItem);
    }

    // Remove menu when clicking outside
    const removeMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as HTMLElement)) {
        menu.remove();
        document.removeEventListener('click', removeMenu);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', removeMenu);
    }, 0);

    document.body.appendChild(menu);
  }

  private deleteSelectedNodes(): void {
    for (const node of this.selectedNodes) {
      this.graph.removeNode(node.id);
      this.canvasNodes.delete(node.id);
    }
    this.selectedNodes.clear();
    this.selectedNode = null;
    this.updateConnections();
    this.render();
    this.updateToolbar();
  }

  private onKeyDown(e: KeyboardEvent): void {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    // Delete selected nodes
    if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedNodes.size > 0) {
      for (const node of this.selectedNodes) {
        this.graph.removeNode(node.id);
        this.canvasNodes.delete(node.id);
      }
      this.selectedNodes.clear();
      this.selectedNode = null;
      this.updateConnections();
      this.render();
      this.updateToolbar();
      e.preventDefault();
      return;
    }

    // Copy (Ctrl+C / Cmd+C)
    if (ctrlKey && e.key === 'c' && this.selectedNodes.size > 0) {
      this.copySelectedNodes();
      e.preventDefault();
      return;
    }

    // Paste (Ctrl+V / Cmd+V)
    if (ctrlKey && e.key === 'v' && this.clipboard.length > 0) {
      this.pasteNodes();
      e.preventDefault();
      return;
    }

    // Duplicate (Ctrl+D / Cmd+D)
    if (ctrlKey && e.key === 'd' && this.selectedNodes.size > 0) {
      this.duplicateSelectedNodes();
      e.preventDefault();
      return;
    }

    // Select All (Ctrl+A / Cmd+A)
    if (ctrlKey && e.key === 'a') {
      this.selectAll();
      e.preventDefault();
      return;
    }

    // Deselect (Escape)
    if (e.key === 'Escape') {
      this.selectedNodes.clear();
      this.selectedNode = null;
      this.connectingFrom = null;
      this.render();
      this.updateToolbar();
      e.preventDefault();
      return;
    }
  }

  private copySelectedNodes(): void {
    this.clipboard = [];

    for (const node of this.selectedNodes) {
      this.clipboard.push({
        type: node.type,
        x: node.x,
        y: node.y,
        data: node.serialize(),
      });
    }
  }

  private pasteNodes(): void {
    if (this.clipboard.length === 0) return;

    // Import NodeRegistry
    const { NodeRegistry } = require('../core/registry.js');

    this.selectedNodes.clear();

    // Calculate offset for pasted nodes
    const offset = 50;

    for (const clipboardNode of this.clipboard) {
      const newId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newNode = NodeRegistry.create(clipboardNode.type, newId);

      // Set position with offset
      newNode.x = clipboardNode.x + offset;
      newNode.y = clipboardNode.y + offset;

      // Restore pin default values if any
      if (clipboardNode.data.pins) {
        for (const pinData of clipboardNode.data.pins) {
          const pin = newNode.getPin(pinData.name);
          if (pin && pinData.defaultValue !== undefined) {
            pin.defaultValue = pinData.defaultValue;
          }
        }
      }

      this.addNode(newNode, newNode.x, newNode.y);
      this.selectedNodes.add(newNode);
    }

    this.selectedNode = Array.from(this.selectedNodes)[0] || null;
    this.render();
    this.updateToolbar();
  }

  private duplicateSelectedNodes(): void {
    this.copySelectedNodes();
    this.pasteNodes();
  }

  private selectAll(): void {
    this.selectedNodes.clear();

    for (const canvasNode of this.canvasNodes.values()) {
      this.selectedNodes.add(canvasNode.node);
    }

    this.selectedNode = Array.from(this.selectedNodes)[0] || null;
    this.render();
    this.updateToolbar();
  }

  /**
   * Add a node to the canvas.
   */
  addNode(node: Node, x: number = 100, y: number = 100): void {
    node.x = x;
    node.y = y;

    const canvasNode: CanvasNode = {
      node,
      x,
      y,
      width: 200,
      height: 60 + node.getPins().length * 20,
    };

    this.canvasNodes.set(node.id, canvasNode);
    this.graph.addNode(node);
    this.updateConnections();
    this.render();
  }

  /**
   * Update connections list from graph.
   */
  private updateConnections(): void {
    this.connections = [];

    for (const node of this.graph.getNodes()) {
      for (const pin of node.getOutputPins()) {
        for (const connectedPin of pin.connections) {
          this.connections.push({ from: pin, to: connectedPin });
        }
      }
    }
  }

  /**
   * Render the canvas.
   */
  render(): void {
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    // Clear
    this.ctx.fillStyle = '#1e1e1e';
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.zoom, this.zoom);

    // Draw grid
    this.drawGrid();

    // Draw connections
    for (const conn of this.connections) {
      this.drawConnection(conn.from, conn.to);
    }

    // Draw nodes
    for (const canvasNode of this.canvasNodes.values()) {
      this.drawNode(canvasNode);
    }

    this.ctx.restore();
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = '#2a2a2a';
    this.ctx.lineWidth = 1;

    const startX = Math.floor(-this.offsetX / this.zoom / this.gridSize) * this.gridSize;
    const startY = Math.floor(-this.offsetY / this.zoom / this.gridSize) * this.gridSize;
    const endX = startX + this.canvas.clientWidth / this.zoom + this.gridSize;
    const endY = startY + this.canvas.clientHeight / this.zoom + this.gridSize;

    for (let x = startX; x < endX; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
      this.ctx.stroke();
    }

    for (let y = startY; y < endY; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
      this.ctx.stroke();
    }
  }

  private drawNode(canvasNode: CanvasNode): void {
    const { node, x, y, width, height } = canvasNode;
    const isSelected = this.selectedNodes.has(node);

    // Node background
    this.ctx.fillStyle = isSelected ? '#3e3e3e' : '#2d2d2d';
    this.ctx.strokeStyle = isSelected ? '#4a90e2' : '#4a4a4a';
    this.ctx.lineWidth = isSelected ? 3 : 2;
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeRect(x, y, width, height);

    // Node title
    this.ctx.fillStyle = '#d4d4d4';
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.fillText(node.displayName, x + 10, y + 22);

    // Pins
    const inputPins = node.getInputPins();
    const outputPins = node.getOutputPins();

    let pinY = y + 45;

    for (const pin of inputPins) {
      this.drawPin(pin, x, pinY, 'input');
      pinY += 22;
    }

    pinY = y + 45;
    for (const pin of outputPins) {
      this.drawPin(pin, x + width, pinY, 'output');
      pinY += 22;
    }
  }

  private drawPin(pin: Pin, x: number, y: number, side: 'input' | 'output'): void {
    const pinX = side === 'input' ? x : x;
    const pinY = y;

    // Pin circle (larger for touch)
    this.ctx.fillStyle = TypeChecker.getColor(pin.type);
    this.ctx.strokeStyle = '#1e1e1e';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(pinX, pinY, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Pin label
    this.ctx.fillStyle = '#d4d4d4';
    this.ctx.font = '13px sans-serif';
    const textX = side === 'input' ? pinX + 14 : pinX - 14;
    const align = side === 'input' ? 'left' : 'right';
    this.ctx.textAlign = align as CanvasTextAlign;
    this.ctx.fillText(pin.name, textX, pinY + 5);
    this.ctx.textAlign = 'left';
  }

  private drawConnectionPreview(fromPos: { x: number; y: number }, toPos: { x: number; y: number }): void {
    // Calculate distance for curve tension
    const dx = Math.abs(toPos.x - fromPos.x);
    const dy = Math.abs(toPos.y - fromPos.y);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Control point offset - scales with distance
    const controlPointOffset = Math.min(distance * 0.5, 200);

    // Control points extend horizontally from pins
    const cp1x = fromPos.x + controlPointOffset;
    const cp1y = fromPos.y;
    const cp2x = toPos.x - controlPointOffset;
    const cp2y = toPos.y;

    // Apply transforms for preview drawing
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.zoom, this.zoom);

    // Draw preview shadow
    this.ctx.strokeStyle = 'rgba(74, 144, 226, 0.2)';
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(fromPos.x, fromPos.y);
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toPos.x, toPos.y);
    this.ctx.stroke();

    // Draw preview connection
    this.ctx.strokeStyle = '#4a90e2';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([8, 4]);
    this.ctx.beginPath();
    this.ctx.moveTo(fromPos.x, fromPos.y);
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toPos.x, toPos.y);
    this.ctx.stroke();

    // Reset
    this.ctx.setLineDash([]);
    this.ctx.lineCap = 'butt';
    this.ctx.restore();
  }

  private drawConnection(from: Pin, to: Pin): void {
    const fromPos = this.getPinPosition(from);
    const toPos = this.getPinPosition(to);

    // Calculate distance for curve tension
    const dx = Math.abs(toPos.x - fromPos.x);
    const dy = Math.abs(toPos.y - fromPos.y);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Control point offset - makes the curve more "windy"
    // Scales with distance for natural looking curves
    const controlPointOffset = Math.min(distance * 0.5, 200);

    // Control points extend horizontally from pins for flowing curves
    const cp1x = fromPos.x + controlPointOffset;
    const cp1y = fromPos.y;
    const cp2x = toPos.x - controlPointOffset;
    const cp2y = toPos.y;

    // Draw shadow for depth
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.moveTo(fromPos.x + 1, fromPos.y + 2);
    this.ctx.bezierCurveTo(cp1x + 1, cp1y + 2, cp2x + 1, cp2y + 2, toPos.x + 1, toPos.y + 2);
    this.ctx.stroke();

    // Draw main connection with color
    this.ctx.strokeStyle = TypeChecker.getColor(from.type);
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(fromPos.x, fromPos.y);
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toPos.x, toPos.y);
    this.ctx.stroke();

    // Add subtle highlight on top
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(fromPos.x, fromPos.y - 1);
    this.ctx.bezierCurveTo(cp1x, cp1y - 1, cp2x, cp2y - 1, toPos.x, toPos.y - 1);
    this.ctx.stroke();

    // Reset line cap
    this.ctx.lineCap = 'butt';
  }

  private getPinPosition(pin: Pin): { x: number; y: number } {
    const canvasNode = this.canvasNodes.get(pin.nodeId);
    if (!canvasNode) return { x: 0, y: 0 };

    const node = canvasNode.node;
    const inputPins = node.getInputPins();
    const outputPins = node.getOutputPins();

    let pinIndex = inputPins.indexOf(pin);
    if (pinIndex !== -1) {
      return {
        x: canvasNode.x,
        y: canvasNode.y + 45 + pinIndex * 22,
      };
    }

    pinIndex = outputPins.indexOf(pin);
    if (pinIndex !== -1) {
      return {
        x: canvasNode.x + canvasNode.width,
        y: canvasNode.y + 45 + pinIndex * 22,
      };
    }

    return { x: 0, y: 0 };
  }

  private getNodeAt(x: number, y: number): CanvasNode | null {
    for (const canvasNode of this.canvasNodes.values()) {
      if (
        x >= canvasNode.x &&
        x <= canvasNode.x + canvasNode.width &&
        y >= canvasNode.y &&
        y <= canvasNode.y + canvasNode.height
      ) {
        return canvasNode;
      }
    }
    return null;
  }

  private getPinAt(x: number, y: number, touchRadius: number = 10): Pin | null {
    for (const canvasNode of this.canvasNodes.values()) {
      const allPins = [...canvasNode.node.getInputPins(), ...canvasNode.node.getOutputPins()];

      for (const pin of allPins) {
        const pos = this.getPinPosition(pin);
        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist < touchRadius) {
          return pin;
        }
      }
    }

    return null;
  }

  /**
   * Clear the canvas.
   */
  clear(): void {
    this.canvasNodes.clear();
    this.connections = [];
    this.selectedNode = null;
    // Reset camera to default position
    this.offsetX = 100;
    this.offsetY = 100;
    this.zoom = 0.6;
    this.render();
  }
}
