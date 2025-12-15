# Getting Started with Verto Engine

Welcome to Verto Engine! This guide will help you get up and running in minutes.

## Quick Start (2 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

The server will compile TypeScript and start listening on `http://localhost:8080`

### 3. Open in Browser
Navigate to `http://localhost:8080` in your web browser.

You should see:
- **Top Bar**: New, Open, Save, Run, Stop buttons
- **Left Panel**: Node library organized by category
- **Center**: Empty canvas ready for nodes
- **Right Panel**: Asset manager (for future use)

## Creating Your First Graph

### Step 1: Add a BeginPlay Event
1. Find "Begin Play" in the left panel under "Events"
2. Drag it onto the center canvas
3. It appears as a node with an "Event" output pin

### Step 2: Add a Debug Node
1. Find "Print String" in the left panel under "Debug"
2. Drag it onto the canvas to the right of BeginPlay
3. The node has three pins: "In" (exec input), "Out" (exec output), "String" (data input)

### Step 3: Connect Nodes
1. Click and drag from BeginPlay's "Event" pin (red, right side)
2. Drag to PrintString's "In" pin (red, left side)
3. A line connects them showing the execution flow

### Step 4: Configure the Node
The PrintString node has a default "Hello World" message. To change it:
- Click on the node to select it
- Edit the String value in the properties panel (coming soon in UI)
- Or accept the default

### Step 5: Run the Graph
1. Click the "Run" button in the top bar
2. Check the browser console (F12) to see the output
3. The graph executes: BeginPlay → PrintString → "Hello World" appears in console

## Understanding the Interface

### Node Types

**Event Nodes** (orange in description)
- Entry points for execution
- BeginPlay, Tick, Input events, Collisions, etc.
- Connect to other nodes via exec pins

**Flow Control Nodes** (blue)
- Control execution order
- Sequence, Branch (If/Else), Loops, Switches
- Have both input and output exec pins

**Value Nodes** (light blue)
- Pure computations with no side effects
- Math, Logic, String operations
- Lazy evaluation - only compute when needed
- No exec pins, only data pins

**Action Nodes** (white)
- Perform side effects
- Print, Spawn, Destroy, Animation, etc.
- Require execution flow
- Have both exec and data pins

### Pin Colors and Types

- **Red**: Execution pins (exec flow)
- **Blue**: Data pins (values)
- **Left side**: Input pins (receive values)
- **Right side**: Output pins (send values)

### Working with Pins

**Connect Pins**:
1. Click on an output pin (right side)
2. Drag to an input pin (left side)
3. Release to create connection
4. Types must match (or be Wildcard)

**Types**:
- Boolean: true/false
- Integer: whole numbers
- Float: decimals
- String: text
- Vector: 3D point (x, y, z)
- Object: references to actors/objects
- Array, Map, Set: collections

## Common Patterns

### Hello World with Input
```
Input Key Event → Branch → PrintString (if true)
```

### Counter Loop
```
BeginPlay → ForLoop (0 to 10) → PrintString + Index
```

### Math Calculation
```
BeginPlay → Add (5 + 3) → Multiply (8 * 2) → PrintString
```

### Spawn and Configure Actor
```
BeginPlay → Spawn Actor → SetActorLocation → SetActorRotation
```

## Tips & Tricks

1. **Search Nodes**: Type in the search box to filter categories
2. **Pan Canvas**: Hold space and drag to move around
3. **Zoom Canvas**: Ctrl + Mouse Wheel to zoom in/out
4. **Delete Node**: Select node and press Delete
5. **Save Progress**: Click Save to download as JSON
6. **Load Graph**: Click Open to load a previously saved JSON

## Example: Simple Game Logic

Create a simple movement system:

1. **Add nodes**:
   - Input Axis Event (Axis: "Horizontal")
   - Get Player Character (get the actor to move)
   - Set Actor Location
   - Get Actor Location (current position)
   - Vector + Vector (add movement)

2. **Connect**:
   - Input → Get Player Character
   - Get Player Character → Get Location
   - Get Location + Axis Value → Set Location

3. **Run** to see it work (in a real game, this would move the character)

## Next Steps

### Explore Node Categories
- Browse the left panel to see all 100+ available nodes
- Each category has nodes for specific functionality
- Hover over nodes to see descriptions

### Create Complex Graphs
- Combine multiple nodes to create game logic
- Use branches for conditional execution
- Use loops for repeated actions
- Use variables for state management

### Save and Share
- Save your graphs as JSON files
- Load them later to continue editing
- Share graph files with others

### Advanced Features (Coming Soon)
- Variables panel for creating persistent data
- Function definitions for reusable logic
- Debugging tools (breakpoints, step execution)
- Animation and state machine editors
- Networking for multiplayer

## Troubleshooting

### "Failed to load node library"
- Make sure the server is running (`npm start`)
- Check browser console for error messages
- Try refreshing the page

### Nodes won't connect
- Check pin types match (e.g., Integer to Integer)
- Remember: Output pins (right) → Input pins (left)
- Exec pins (red) only connect to exec pins

### Graph runs but nothing happens
- Check that you connected exec pins (not just data pins)
- Make sure you have an Event node as entry point
- Look for error messages under the top bar

### Can't see all nodes
- Collapse other categories to make room
- Use the search box to filter
- Scroll in the left panel

## Getting Help

- Read the [README.md](README.md) for architecture details
- Check code comments for implementation details
- Look at [examples/basic-example.json](examples/basic-example.json) for a working graph

## Next Exercise

Try creating this graph:
```
Event (BeginPlay)
  → Integer Literal (5)
  → Integer Literal (3)
  → Add
  → Print String (shows "8")
```

Once you understand this flow, you can build much more complex systems!

Happy scripting! 🎮
