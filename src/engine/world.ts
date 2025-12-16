/**
 * Game world - manages actors and game state with proper 2D rendering.
 */

export type ActorType = 'sprite' | 'rectangle' | 'circle' | 'text' | 'line';

export interface Actor {
  id: string;
  name: string;
  type: ActorType;

  // Transform
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;

  // Visibility
  visible: boolean;
  opacity: number;
  layer: number; // Z-index for rendering order

  // Visual properties
  color: string;

  // Sprite properties
  spriteImage?: HTMLImageElement;
  spriteWidth?: number;
  spriteHeight?: number;

  // Shape properties (rectangle/circle)
  width?: number;
  height?: number;
  radius?: number;
  strokeColor?: string;
  strokeWidth?: number;
  filled?: boolean;

  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';

  // Physics/collision (for future use)
  velocityX?: number;
  velocityY?: number;

  // Reference to behavior graph
  graph?: any;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
  width: number;
  height: number;
}

export class World {
  private actors: Map<string, Actor> = new Map();
  private nextActorId: number = 0;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private backgroundColor: string = '#1a1a1a';
  private backgroundImage?: HTMLImageElement;
  private assets: Map<string, { name: string; type: string; data: string | ArrayBuffer }> = new Map();
  private loadedImages: Map<string, HTMLImageElement> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Initialize camera
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1,
      width: canvas.width,
      height: canvas.height,
    };

    // Setup canvas with proper resolution
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);

    this.camera.width = rect.width;
    this.camera.height = rect.height;
  }

  /**
   * Set assets from main engine.
   */
  setAssets(assets: Map<string, { name: string; type: string; data: string | ArrayBuffer }>): void {
    this.assets = assets;

    // Preload images
    for (const [id, asset] of assets.entries()) {
      if (asset.type === 'image' && typeof asset.data === 'string') {
        const img = new Image();
        img.src = asset.data;
        img.onload = () => {
          this.loadedImages.set(id, img);
          this.loadedImages.set(asset.name, img); // Also store by name for easy access
        };
      }
    }
  }

  /**
   * Get loaded image by name or ID.
   */
  getImage(nameOrId: string): HTMLImageElement | undefined {
    return this.loadedImages.get(nameOrId);
  }

  /**
   * Spawn a new actor.
   */
  spawnActor(
    name: string,
    type: ActorType = 'rectangle',
    x: number = 0,
    y: number = 0
  ): Actor {
    const id = `actor_${this.nextActorId++}`;
    const actor: Actor = {
      id,
      name,
      type,
      x,
      y,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      visible: true,
      opacity: 1,
      layer: 0,
      color: '#4a90e2',
      filled: true,
      strokeColor: '#2d6aa7',
      strokeWidth: 2,
    };

    // Set default dimensions based on type
    if (type === 'rectangle') {
      actor.width = 50;
      actor.height = 50;
    } else if (type === 'circle') {
      actor.radius = 25;
    } else if (type === 'text') {
      actor.text = 'Text';
      actor.fontSize = 24;
      actor.fontFamily = 'sans-serif';
      actor.textAlign = 'center';
    } else if (type === 'sprite') {
      actor.spriteWidth = 50;
      actor.spriteHeight = 50;
    }

    this.actors.set(id, actor);
    return actor;
  }

  /**
   * Destroy an actor.
   */
  destroyActor(id: string): void {
    this.actors.delete(id);
  }

  /**
   * Get an actor by ID.
   */
  getActor(id: string): Actor | undefined {
    return this.actors.get(id);
  }

  /**
   * Get all actors.
   */
  getAllActors(): Actor[] {
    return Array.from(this.actors.values());
  }

  /**
   * Set camera position.
   */
  setCameraPosition(x: number, y: number): void {
    this.camera.x = x;
    this.camera.y = y;
  }

  /**
   * Set camera zoom.
   */
  setCameraZoom(zoom: number): void {
    this.camera.zoom = Math.max(0.1, Math.min(5, zoom));
  }

  /**
   * Get camera.
   */
  getCamera(): Camera {
    return { ...this.camera };
  }

  /**
   * Set background color.
   */
  setBackgroundColor(color: string): void {
    this.backgroundColor = color;
  }

  /**
   * Set background image.
   */
  setBackgroundImage(imageName: string): void {
    const img = this.getImage(imageName);
    if (img) {
      this.backgroundImage = img;
    }
  }

  /**
   * Update the world (called every frame).
   */
  update(deltaTime: number): void {
    // Update logic handled by graph executor
    // Future: Update physics, animations, etc.
  }

  /**
   * Render the world.
   */
  render(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    // Draw background image if set
    if (this.backgroundImage) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.5;
      this.ctx.drawImage(this.backgroundImage, 0, 0, width, height);
      this.ctx.restore();
    }

    // Apply camera transform
    this.ctx.save();
    this.ctx.translate(width / 2, height / 2);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // Sort actors by layer for proper rendering order
    const sortedActors = Array.from(this.actors.values()).sort((a, b) => a.layer - b.layer);

    // Draw actors
    for (const actor of sortedActors) {
      if (!actor.visible) continue;
      this.renderActor(actor);
    }

    this.ctx.restore();

    // Draw HUD/UI elements (not affected by camera)
    this.renderHUD();
  }

  private renderActor(actor: Actor): void {
    this.ctx.save();

    // Apply actor transform
    this.ctx.translate(actor.x, actor.y);
    this.ctx.rotate(actor.rotation);
    this.ctx.scale(actor.scaleX, actor.scaleY);
    this.ctx.globalAlpha = actor.opacity;

    // Render based on type
    switch (actor.type) {
      case 'sprite':
        this.renderSprite(actor);
        break;
      case 'rectangle':
        this.renderRectangle(actor);
        break;
      case 'circle':
        this.renderCircle(actor);
        break;
      case 'text':
        this.renderText(actor);
        break;
      case 'line':
        this.renderLine(actor);
        break;
    }

    this.ctx.restore();
  }

  private renderSprite(actor: Actor): void {
    if (actor.spriteImage) {
      const w = actor.spriteWidth || actor.spriteImage.width;
      const h = actor.spriteHeight || actor.spriteImage.height;
      this.ctx.drawImage(actor.spriteImage, -w / 2, -h / 2, w, h);
    } else {
      // Fallback if no sprite loaded
      this.ctx.fillStyle = '#888';
      const w = actor.spriteWidth || 50;
      const h = actor.spriteHeight || 50;
      this.ctx.fillRect(-w / 2, -h / 2, w, h);
    }
  }

  private renderRectangle(actor: Actor): void {
    const w = actor.width || 50;
    const h = actor.height || 50;
    const x = -w / 2;
    const y = -h / 2;

    // Fill
    if (actor.filled) {
      this.ctx.fillStyle = actor.color;
      this.ctx.fillRect(x, y, w, h);
    }

    // Stroke
    if (actor.strokeWidth && actor.strokeWidth > 0) {
      this.ctx.strokeStyle = actor.strokeColor || '#000';
      this.ctx.lineWidth = actor.strokeWidth;
      this.ctx.strokeRect(x, y, w, h);
    }
  }

  private renderCircle(actor: Actor): void {
    const r = actor.radius || 25;

    this.ctx.beginPath();
    this.ctx.arc(0, 0, r, 0, Math.PI * 2);

    // Fill
    if (actor.filled) {
      this.ctx.fillStyle = actor.color;
      this.ctx.fill();
    }

    // Stroke
    if (actor.strokeWidth && actor.strokeWidth > 0) {
      this.ctx.strokeStyle = actor.strokeColor || '#000';
      this.ctx.lineWidth = actor.strokeWidth;
      this.ctx.stroke();
    }
  }

  private renderText(actor: Actor): void {
    const text = actor.text || '';
    const fontSize = actor.fontSize || 24;
    const fontFamily = actor.fontFamily || 'sans-serif';

    this.ctx.font = `${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = actor.color;
    this.ctx.textAlign = actor.textAlign || 'center';
    this.ctx.textBaseline = 'middle';

    this.ctx.fillText(text, 0, 0);

    // Stroke for text outline
    if (actor.strokeWidth && actor.strokeWidth > 0) {
      this.ctx.strokeStyle = actor.strokeColor || '#000';
      this.ctx.lineWidth = actor.strokeWidth;
      this.ctx.strokeText(text, 0, 0);
    }
  }

  private renderLine(actor: Actor): void {
    const w = actor.width || 100;

    this.ctx.beginPath();
    this.ctx.moveTo(-w / 2, 0);
    this.ctx.lineTo(w / 2, 0);

    this.ctx.strokeStyle = actor.strokeColor || actor.color;
    this.ctx.lineWidth = actor.strokeWidth || 2;
    this.ctx.stroke();
  }

  private renderHUD(): void {
    // Render UI elements like FPS counter, debug info, etc.
    // These are drawn in screen space, not world space
  }

  /**
   * Clear the world.
   */
  clear(): void {
    this.actors.clear();
    this.nextActorId = 0;
  }
}
