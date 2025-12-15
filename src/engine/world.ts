/**
 * Game world - manages actors and game state.
 */

export interface Actor {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  visible: boolean;
  graph?: any; // Reference to the actor's behavior graph
}

export class World {
  private actors: Map<string, Actor> = new Map();
  private nextActorId: number = 0;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  /**
   * Spawn a new actor.
   */
  spawnActor(name: string, x: number = 0, y: number = 0): Actor {
    const id = `actor_${this.nextActorId++}`;
    const actor: Actor = {
      id,
      name,
      x,
      y,
      rotation: 0,
      visible: true,
    };

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
   * Update the world (called every frame).
   */
  update(deltaTime: number): void {
    // Update logic handled by graph executor
  }

  /**
   * Render the world.
   */
  render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#2a2a2a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw actors
    for (const actor of this.actors.values()) {
      if (!actor.visible) continue;

      this.ctx.save();
      this.ctx.translate(actor.x, actor.y);
      this.ctx.rotate(actor.rotation);

      // Draw a simple square for now
      this.ctx.fillStyle = '#4a90e2';
      this.ctx.fillRect(-25, -25, 50, 50);

      this.ctx.restore();
    }
  }

  /**
   * Clear the world.
   */
  clear(): void {
    this.actors.clear();
    this.nextActorId = 0;
  }
}
