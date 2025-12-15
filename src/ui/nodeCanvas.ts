/**
 * Node canvas - renders and handles interaction with the node graph.
 */

import { Graph } from '../core/graph.js';
import { Node } from '../core/node.js';
import { Pin, PinDirection } from '../core/pin.js';
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

  // Camera
  private offsetX: number = 0;
  private offsetY: number = 0;
  private zoom: number = 1;

  // Interaction
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private draggedNode: CanvasNode | null = null;
  private selectedNode: Node | null = null;
  private connectingFrom: Pin | null = null;

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
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
      this.render();
    };

    resize();
    window.addEventListener('resize', resize);
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.onWheel.bind(this));

    // Keyboard events
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }

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
      // Draw temporary connection line
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
    this.zoom = Math.max(0.1, Math.min(2, this.zoom * delta));
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
    // Clear
    this.ctx.fillStyle = '#1e1e1e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
    const endX = startX + this.canvas.width / this.zoom + this.gridSize;
    const endY = startY + this.canvas.height / this.zoom + this.gridSize;

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
    this.ctx.font = '14px sans-serif';
    this.ctx.fillText(node.displayName, x + 10, y + 20);

    // Pins
    const inputPins = node.getInputPins();
    const outputPins = node.getOutputPins();

    let pinY = y + 40;

    for (const pin of inputPins) {
      this.drawPin(pin, x, pinY, 'input');
      pinY += 20;
    }

    pinY = y + 40;
    for (const pin of outputPins) {
      this.drawPin(pin, x + width, pinY, 'output');
      pinY += 20;
    }
  }

  private drawPin(pin: Pin, x: number, y: number, side: 'input' | 'output'): void {
    const pinX = side === 'input' ? x : x;
    const pinY = y;

    // Pin circle
    this.ctx.fillStyle = TypeChecker.getColor(pin.type);
    this.ctx.beginPath();
    this.ctx.arc(pinX, pinY, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Pin label
    this.ctx.fillStyle = '#d4d4d4';
    this.ctx.font = '12px sans-serif';
    const textX = side === 'input' ? pinX + 10 : pinX - 10;
    const align = side === 'input' ? 'left' : 'right';
    this.ctx.textAlign = align as CanvasTextAlign;
    this.ctx.fillText(pin.name, textX, pinY + 4);
    this.ctx.textAlign = 'left';
  }

  private drawConnection(from: Pin, to: Pin): void {
    const fromPos = this.getPinPosition(from);
    const toPos = this.getPinPosition(to);

    this.ctx.strokeStyle = TypeChecker.getColor(from.type);
    this.ctx.lineWidth = 2;
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
        y: canvasNode.y + 40 + pinIndex * 20,
      };
    }

    pinIndex = outputPins.indexOf(pin);
    if (pinIndex !== -1) {
      return {
        x: canvasNode.x + canvasNode.width,
        y: canvasNode.y + 40 + pinIndex * 20,
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

  private getPinAt(x: number, y: number): Pin | null {
    for (const canvasNode of this.canvasNodes.values()) {
      const allPins = [...canvasNode.node.getInputPins(), ...canvasNode.node.getOutputPins()];

      for (const pin of allPins) {
        const pos = this.getPinPosition(pin);
        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist < 10) {
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
    this.render();
  }
}
