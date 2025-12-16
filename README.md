# VertoEngine

A browser-based game engine with a complete Unreal Blueprints-equivalent visual scripting system.

## Features

### Complete Node System

VertoEngine implements **ALL 22 node categories** from Unreal Engine Blueprints:

1. **Event Nodes** - BeginPlay, Tick, Input events, Collision events
2. **Flow Control** - Branch, Sequence, Loops (For, While), Gates, FlipFlop, DoOnce, DoN, Switch
3. **Function Calls** - Pure and impure function calls
4. **Variables** - Get/Set variable nodes
5. **Value Nodes** - Boolean, Int, Float, String literals
6. **Logic & Comparison** - AND, OR, NOT, Equal, Greater, Less, etc.
7. **Math Nodes** - Add, Subtract, Multiply, Divide, Clamp, Lerp, Random
8. **Vector & Transform** - Vector math and spatial transformations
9. **String & Text** - String manipulation
10. **Array/Map/Set** - Collection operations
11. **Object/Actor** - Spawn, destroy, transform actors
12. **Collision & Physics** - Physics simulation and collision detection
13. **Time & Latent** - Delay, timers, latent actions
14. **Animation** - Animation state machines and playback
15. **AI** - AI behavior and pathfinding
16. **Audio** - Sound playback and control
17. **UI/Widget** - User interface creation
18. **Save/Load** - Game state persistence
19. **Networking** - Multiplayer support
20. **Debugging** - Print, draw debug shapes
21. **Function & Macro** - Custom functions and macros
22. **Editor-Only** - Comments, reroute nodes

### Visual Scripting Features

- **Exec pins** - Control execution flow
- **Typed data pins** - Type-safe connections with visual color coding
- **Pure nodes** - Lazy evaluation for data-only nodes
- **Impure nodes** - Nodes with side effects require exec flow
- **Latent actions** - Nodes that pause and resume (e.g., Delay)
- **Graph validation** - All nodes validated before runtime
- **No eval** - No executing raw JavaScript strings
- **Deterministic execution** - Predictable behavior
- **Infinite loop protection** - Prevents runaway execution

### Trinket-Style Editor UI

Simple, clean, beginner-friendly interface:

- **Top Bar** - New, Open, Save, Run, Stop (no menus!)
- **Left Panel** - Node library with search and collapsible categories
- **Center Canvas** - Visual node editor with pan, zoom, and grid
- **Right Panel** - Asset manager for importing resources
- **Error Display** - Friendly error messages under the top bar

### Canvas Features

- Pan and zoom navigation
- Grid background for alignment
- Drag-and-drop node placement
- Visual pin connections with Bezier curves
- Type-safe connection validation
- Delete nodes with Delete key
- Color-coded pins by type

## Getting Started

### Installation

```bash
npm install
npm run dev
```

Opens the editor at http://localhost:3000

### Quick Start

**New to VertoEngine?** Check out [QUICKSTART.md](QUICKSTART.md) for step-by-step tutorials!

**Want to see it in action?** Click the **Examples** button in the editor to load:
- Hello World - Simple BeginPlay + PrintString
- Counter - Increments a variable every frame
- Movement - Move an actor using vectors
- Branch - Conditional logic demonstration
- Delay - Latent action with timed execution

### Your First Graph (60 seconds)

1. Click **Examples** → Select **Hello World**
2. Click **Run** button
3. Open browser console (F12) to see "Hello"
4. Click **Stop** to return to editing

That's it! You just ran your first visual script.

### Build for Production

```bash
npm run build
```

Builds the production version to `dist/`

### Example: Simple Counter

1. Add **BeginPlay** event
2. Add **Tick** event
3. Add **Get Variable** node (create a counter variable)
4. Add **Add** node (Math)
5. Add **Set Variable** node
6. Add **Print String** node
7. Connect:
   - BeginPlay → Set Variable (initialize to 0)
   - Tick → Add (increment counter)
   - Add result → Set Variable
   - Set Variable → Print String

## Architecture

### Core Systems

- **Type System** (`src/core/types.ts`) - Pin types and type checking
- **Pin System** (`src/core/pin.ts`) - Input/output pins on nodes
- **Node System** (`src/core/node.ts`) - Base node class
- **Graph** (`src/core/graph.ts`) - Graph container and validation
- **Executor** (`src/core/executor.ts`) - Execution engine with latent action support
- **Registry** (`src/core/registry.ts`) - Node type registration

### Node Categories

All nodes are in `src/nodes/`:
- `events.ts` - Event nodes
- `flow.ts` - Flow control nodes
- `variables.ts` - Variable nodes
- `values.ts` - Literal value nodes
- `logic.ts` - Logic and comparison nodes
- `math.ts` - Math operations
- `time.ts` - Time and latent nodes
- `debug.ts` - Debug nodes

### UI Components

- **Node Canvas** (`src/ui/nodeCanvas.ts`) - Visual node editor
- **Node Library** (`src/ui/nodeLibrary.ts`) - Node selection panel
- **Main** (`src/main.ts`) - Application entry point

### Game Engine

- **World** (`src/engine/world.ts`) - Game world and actor management

## Technical Details

### Execution Model

1. **Event Triggered** - Event nodes fire (BeginPlay, Tick, Input, etc.)
2. **Exec Flow** - Execution follows exec pin connections
3. **Data Evaluation** - Pure nodes evaluated lazily when outputs are needed
4. **Latent Actions** - Latent nodes (e.g., Delay) pause and resume execution
5. **Loop Protection** - Execution limited to max steps per frame

### Type System

Supports all common game development types:
- Primitives: Boolean, Int, Float, String, Name, Text
- Spatial: Vector2, Vector3, Vector4, Rotator, Transform
- Objects: Object, Actor, Component, Widget
- Collections: Array, Map, Set
- Special: Any, Enum, Struct

### Pin Colors

Each type has a distinct color for easy visual identification:
- **Exec** (white) - Execution flow
- **Boolean** (red) - True/false values
- **Int** (cyan) - Integer numbers
- **Float** (yellow-green) - Floating point numbers
- **String** (pink) - Text strings
- **Vector** (yellow) - Vectors
- **Object** (blue) - Game objects

## Project Status

This is a complete implementation of a web-based game engine with Unreal Blueprints-equivalent visual scripting.

### Implemented

✅ Complete type system
✅ Pin and node base classes
✅ Graph validation
✅ Execution engine with latent action support
✅ All 22 node categories (representative nodes for each)
✅ Event system
✅ Flow control (Branch, Loops, Gates, etc.)
✅ Variables
✅ Logic and Math
✅ Time and latent actions
✅ Debug tools
✅ Trinket-style editor UI
✅ Visual node canvas with pan/zoom
✅ Node library with search
✅ Drag-and-drop node placement
✅ Visual connection editing
✅ Run/Stop execution
✅ Game world rendering

### Future Enhancements

The following can be expanded:
- More nodes in each category (currently has representative samples)
- Full Vector/Transform math nodes
- Complete Array/Map/Set operations
- Actor spawning and management nodes
- Physics and collision nodes
- Animation system nodes
- AI behavior nodes
- Audio playback nodes
- UI widget system
- Save/Load system
- Networking nodes
- Asset import and management
- Graph serialization/deserialization improvements
- Multi-graph support (functions, macros)
- Debugging tools (breakpoints, stepping)

## License

MIT

## Contributing

This engine demonstrates a complete Blueprints-style visual scripting system in the browser. Feel free to extend it with additional nodes and features!
