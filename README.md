# Verto Engine - Web-Based Visual Scripting Game Engine

A browser-based game engine featuring a complete visual scripting system equivalent to Unreal Engine Blueprints, with a clean Trinket-style editor UI.

## Features

### Core Architecture
- **Graph-Based Execution**: Exec pins control execution flow, data pins carry typed values
- **Type System**: Strongly-typed pins (Boolean, Integer, Float, String, Vector, Object, etc.)
- **Pure vs Impure Nodes**: Data nodes execute lazily, action nodes require execution flow
- **Validation System**: All graphs validated before runtime execution
- **Latent Actions**: Support for asynchronous operations (delays, animations, etc.)
- **Infinite Loop Protection**: Configurable maximum execution steps

### Node Categories (100+ nodes)

1. **Events** - BeginPlay, Tick, Input (keyboard, mouse, gamepad, touch), Collisions
2. **Flow Control** - Sequence, Branch, FlipFlop, Loops, Gates, Switches
3. **Values** - Literals, Self, GetOwner, GetPlayerCharacter, etc.
4. **Logic & Math** - AND, OR, NOT, Comparisons, Math operations, Trigonometry
5. **Vectors** - Make/Break, Add/Subtract, Dot/Cross product, Normalize, Distance
6. **Strings** - Append, Length, Contains, ToUpper, ToLower, Format
7. **Arrays** - Make, Add, Get, Set, Contains, ForEach (with basic support)
8. **Actors** - Spawn, Destroy, GetLocation, SetLocation, SetRotation
9. **Time** - Delay, Timer management
10. **Audio** - PlaySound2D, PlaySoundAtLocation, SetVolume, SetPitch
11. **Debug** - PrintString, DrawDebugLine, DrawDebugSphere
12. **Networking** - Has Authority, Switch Has Authority (stubs for future implementation)
13. **UI** - Create Widget, Add to Viewport (framework in place)
14. **Save/Load** - Save game slots, load game state (framework in place)

### Editor Features
- **Trinket-Style UI**: Simple, beginner-friendly design
- **Node Library**: Searchable, collapsible categories
- **Canvas Editing**: Pan, zoom, drag-and-drop nodes
- **Visual Feedback**: Color-coded pins, exec pins (red/dashed), data pins (blue/solid)
- **Connection Validation**: Only compatible pins can connect
- **Graph Persistence**: Save and load graphs as JSON
- **Error Display**: User-friendly error messages

## Project Structure

```
verto-engine/
├── src/
│   ├── graph/               # Graph data structures
│   │   ├── Node.ts         # Base node class
│   │   ├── Pin.ts          # Pin (port) system
│   │   └── Graph.ts        # Graph container
│   ├── execution/           # Execution engine
│   │   └── ExecutionEngine.ts
│   ├── nodes/               # Node implementations
│   │   ├── EventNodes.ts
│   │   ├── FlowControlNodes.ts
│   │   ├── ValueNodes.ts
│   │   ├── MathNodes.ts
│   │   ├── VectorStringNodes.ts
│   │   ├── ActionNodes.ts
│   │   ├── NodeRegistry.ts
│   │   └── index.ts
│   ├── types/               # TypeScript interfaces
│   │   └── index.ts
│   ├── public/              # Web UI
│   │   ├── index.html
│   │   ├── style.css
│   │   └── ui.js
│   └── index.ts             # Main entry point
├── dist/                    # Compiled JavaScript (generated)
├── package.json
└── tsconfig.json
```

## Getting Started

### Installation
```bash
npm install
```

### Build
```bash
npm run build
```

### Development (watch mode)
```bash
npm run dev
```

### Run Server
```bash
npm start
```

This starts an HTTP server on port 8080. Open http://localhost:8080 in your browser.

## Usage

1. **Create Nodes**: Click on nodes in the left panel to add them to the canvas
2. **Connect Pins**: Drag from an output pin to an input pin
3. **Configure**: Click on a node to edit its properties
4. **Run**: Click the "Run" button to execute the graph
5. **Save**: Click "Save" to download the graph as JSON
6. **Load**: Click "Open" to load a previously saved graph

## Architecture Details

### Execution Model
- Execution starts at **Event** nodes (BeginPlay, Tick, Input events, etc.)
- **Exec pins** (red) determine execution order
- **Data pins** (blue) carry typed values between nodes
- **Pure nodes** (blue highlight) evaluate lazily on demand
- **Impure nodes** (white) execute sequentially along the exec path
- **Latent nodes** pause execution and resume later

### Node Typing
Each pin has a **type** (Boolean, Integer, Float, String, Vector, Object, etc.) and optional modifiers:
- `isArray`: Array of that type
- `isMap`: Dictionary/map with that type as value
- `isSet`: Set of unique values of that type
- `isWildcard`: Accepts any type (for generic functions)

### Connection Rules
- **Exec pins** can only connect to exec pins
- **Data pins** can connect if types match
- **Opposite directions**: Input pins accept from output pins
- **Wildcard pins** bypass type checking
- **No self-connections**: A node cannot connect to itself

### Validation
Before running, the engine validates:
- All connections have compatible types
- No missing required inputs
- No circular dependencies (infinite loops)
- All referenced nodes exist

## Implementation Notes

### Node Registration
New nodes are automatically registered via the NodeRegistry when imported:
```typescript
// In a node file
registry.register("MyNode", MyNodeClass, "Category", "Display Name", "Description");
```

### Extending the System

#### Add a New Node
1. Create class extending `Node`
2. Create pins in constructor
3. Implement `execute()` method
4. Register in NodeRegistry

```typescript
export class MyNode extends Node {
  constructor(options = {}) {
    super("MyNode", "MyCategory", "My Node", options);
    this.createExecInputPin("In");
    this.createExecOutputPin("Out");
    this.createInputPin("Value", PinType.Float, 0);
    this.createOutputPin("Result", PinType.Float);
  }

  execute(inputs: Record<string, any>): ExecutionResult {
    return {
      nodeId: this.id,
      nextExecPins: [this.getExecOutputPins()[0].id],
      outputs: {
        [this.getOutputPin("Result")?.id || ""]: inputs["Value"] * 2,
      },
    };
  }
}

NodeRegistry.getInstance().register(
  "MyNode", MyNodeClass, "MyCategory", "My Node", "Description"
);
```

## Future Enhancements

- [ ] **Variables Panel**: UI for creating/editing graph variables
- [ ] **Function/Macro Support**: Custom reusable subgraphs
- [ ] **Blueprint Classes**: Object-oriented graph system with inheritance
- [ ] **Animation System**: Montages, blend spaces, state machines
- [ ] **AI Behavior Trees**: Behavior tree visual editor
- [ ] **Networking**: Replicated variables, RPC calls
- [ ] **Scripting Console**: Runtime debugging and variable inspection
- [ ] **Graph Breakpoints**: Step through execution
- [ ] **Asset Manager**: Drag assets into canvas
- [ ] **Plugin System**: Load custom node types at runtime

## Performance Considerations

- **Execution Limit**: Max 10,000 node executions per graph run (prevents infinite loops)
- **Lazy Evaluation**: Pure nodes only execute when their outputs are used
- **Connection Caching**: Pins cache their connections for faster traversal
- **Efficient Graph Layout**: Canvas uses spatial indexing for hit detection

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (except some older versions)
- Mobile browsers: Basic support (touch events enabled)

## License

MIT - Feel free to use, modify, and distribute

## Contributing

To contribute:
1. Create a feature branch
2. Implement your changes
3. Test thoroughly
4. Submit a pull request

## Support

For issues, questions, or feature requests, open an issue on the repository.
