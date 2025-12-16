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
  private connectingFrom: Pin | null = null;

  // Touch state
  private lastTouchDistance: number = 0;
  private touchStartTime: number = 0;

  // Grid
  private gridSize: number = 20;

  constructor(canvas: HTMLCanvasElement, graph: Graph) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.graph = graph;

    this.setupCanvas();
    this.setupEventListeners();
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

    // Keyboard events
    window.addEventListener('keydown', this.onKeyDown.bind(this));

    // Prevent context menu on long press
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
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
        this.selectedNode = node.node;
        this.dragStartX = x - node.x;
        this.dragStartY = y - node.y;
        return;
      }

      // Pan canvas
      this.isDragging = true;
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
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
        // Drawing connection
        this.render();
        const fromPos = this.getPinPosition(this.connectingFrom);
        this.ctx.strokeStyle = '#4a90e2';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(fromPos.x * this.zoom + this.offsetX, fromPos.y * this.zoom + this.offsetY);
        this.ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        this.ctx.stroke();
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
      this.selectedNode = node.node;
      this.dragStartX = x - node.x;
      this.dragStartY = y - node.y;
      return;
    }

    // Pan canvas
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
  }

  private onMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
    const y = (e.clientY - rect.top - this.offsetY) / this.zoom;

    if (this.draggedNode) {
      // Drag node
      this.draggedNode.x = x - this.dragStartX;
      this.draggedNode.y = y - this.dragStartY;
      this.draggedNode.node.x = this.draggedNode.x;
      this.draggedNode.node.y = this.draggedNode.y;
      this.render();
    } else if (this.isDragging) {
      // Pan canvas
      this.offsetX += e.clientX - this.dragStartX;
      this.offsetY += e.clientY - this.dragStartY;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.render();
    } else if (this.connectingFrom) {
      // Drawing connection
      this.render();
      const fromPos = this.getPinPosition(this.connectingFrom);
      this.ctx.strokeStyle = '#4a90e2';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(fromPos.x * this.zoom + this.offsetX, fromPos.y * this.zoom + this.offsetY);
      this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      this.ctx.stroke();
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

  private onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Delete' && this.selectedNode) {
      this.graph.removeNode(this.selectedNode.id);
      this.canvasNodes.delete(this.selectedNode.id);
      this.selectedNode = null;
      this.updateConnections();
      this.render();
    }
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

    // Node background
    this.ctx.fillStyle = node === this.selectedNode ? '#3e3e3e' : '#2d2d2d';
    this.ctx.strokeStyle = '#4a4a4a';
    this.ctx.lineWidth = 2;
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

  private drawConnection(from: Pin, to: Pin): void {
    const fromPos = this.getPinPosition(from);
    const toPos = this.getPinPosition(to);

    this.ctx.strokeStyle = TypeChecker.getColor(from.type);
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(fromPos.x, fromPos.y);

    // Bezier curve for nice connections
    const midX = (fromPos.x + toPos.x) / 2;
    this.ctx.bezierCurveTo(midX, fromPos.y, midX, toPos.y, toPos.x, toPos.y);
    this.ctx.stroke();
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
