# Quick Start Guide

## Installation

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Your First Graph

### Example 1: Hello World

**Goal:** Print "Hello World" when the game starts.

**Steps:**
1. Find **BeginPlay** in the Events category (left panel)
2. Click it to add to canvas
3. Find **Print String** in the Debug category
4. Click it to add to canvas
5. Click and drag from BeginPlay's **Then** pin to Print String's **Exec** pin
6. Click **Run** button
7. Open browser console (F12) to see "Hello"

### Example 2: Counter

**Goal:** Count frames and print the count.

**Steps:**
1. Add **BeginPlay** (Events)
2. Add **Set Variable** (Variables)
3. Add **Integer** literal (Values), set value to 0
4. Connect BeginPlay → Set Variable → Integer literal
5. Add **Tick** event (Events)
6. Add **Get Variable** (Variables)
7. Add **Add** (Math)
8. Add another **Integer** literal, set to 1
9. Add **Set Variable**
10. Add **Print String** (Debug)
11. Connect: Tick → Set Variable
12. Connect: Get Variable → Add (A input)
13. Connect: Integer(1) → Add (B input)
14. Connect: Add result → Set Variable
15. Connect: Set Variable → Print String
16. Click **Run**

### Example 3: Vector Math

**Goal:** Create and manipulate a 3D vector.

**Steps:**
1. Add **BeginPlay**
2. Add **Make Vector3** (Vector category)
3. Add three **Float** literals (Values) with values 1.0, 2.0, 3.0
4. Connect Float literals to Vector's X, Y, Z inputs
5. Add **Vector Length** (Vector)
6. Connect Make Vector → Vector Length
7. Add **Print String**
8. Connect BeginPlay → Print String
9. Connect Vector Length → Print String (auto-converts to string)
10. Click **Run**

### Example 4: Spawning an Actor

**Goal:** Create an actor in the game world.

**Steps:**
1. Add **BeginPlay**
2. Add **Spawn Actor** (Object category)
3. Add **String** literal (Values), set to "Player"
4. Add **Make Vector3** for spawn position
5. Connect String → Spawn Actor name
6. Connect Vector → Spawn Actor location
7. Connect BeginPlay → Spawn Actor
8. Add **Print String** to confirm
9. Click **Run**

### Example 5: Conditional Logic

**Goal:** Check a condition and branch execution.

**Steps:**
1. Add **BeginPlay**
2. Add **Integer** literal with value 10
3. Add **Integer** literal with value 5
4. Add **Greater** (Logic)
5. Connect both integers to Greater node
6. Add **Branch** (Flow Control)
7. Connect Greater result → Branch condition
8. Connect BeginPlay → Branch
9. Add two **Print String** nodes
10. Connect Branch True → first Print String
11. Connect Branch False → second Print String
12. Click **Run**

### Example 6: Delay (Latent Action)

**Goal:** Wait 2 seconds before executing.

**Steps:**
1. Add **BeginPlay**
2. Add **Print String**, set text to "Starting..."
3. Add **Delay** (Time)
4. Add **Float** literal, set to 2.0
5. Connect Float → Delay duration
6. Add another **Print String**, set to "Done!"
7. Connect: BeginPlay → Print String → Delay → Print String
8. Click **Run**
9. Watch console - "Done!" appears 2 seconds after "Starting..."

## Node Categories Reference

### Events (Entry Points)
- **BeginPlay** - Fires once at start
- **Tick** - Fires every frame
- **Input Key** - Keyboard input
- **Mouse Button** - Mouse clicks
- **Begin Overlap** - Collision start

### Flow Control
- **Branch** - If/else logic
- **Sequence** - Execute multiple outputs in order
- **For Loop** - Iterate with counter
- **While Loop** - Loop while condition true
- **Gate** - Enable/disable execution flow

### Variables
- **Get Variable** - Read variable value
- **Set Variable** - Write variable value

### Values (Literals)
- **Boolean** - true/false
- **Integer** - Whole numbers
- **Float** - Decimal numbers
- **String** - Text

### Logic & Math
- **AND/OR/NOT** - Boolean logic
- **Equal/Greater/Less** - Comparisons
- **Add/Subtract/Multiply/Divide** - Arithmetic
- **Clamp/Lerp** - Math utilities

### Vectors
- **Make Vector3** - Create 3D vector
- **Vector Add/Subtract** - Vector math
- **Dot/Cross Product** - Vector operations
- **Normalize** - Unit vector

### Collections
- **Make Array** - Create array
- **Add/Remove/Get/Set** - Array operations
- **Length/Contains** - Array utilities

### Objects
- **Spawn Actor** - Create game object
- **Destroy Actor** - Remove object
- **Set Actor Location** - Move object

### Physics
- **Simulate Physics** - Enable physics
- **Add Force/Impulse** - Apply forces
- **Line Trace** - Raycast

### Time
- **Delay** - Wait duration
- **Set Timer** - Repeating timer

### Debug
- **Print String** - Console output

## Tips

1. **Search** - Use the search box to quickly find nodes
2. **Delete** - Select a node and press Delete key
3. **Pan** - Click and drag on empty canvas
4. **Zoom** - Mouse wheel to zoom
5. **Save** - Click Save to download your graph
6. **Validation** - Errors show when you click Run

## Common Patterns

### Initialize on Start
```
BeginPlay → Set Variable(s) → Other Setup
```

### Update Every Frame
```
Tick → Get Variables → Calculate → Set Variables
```

### Conditional Execution
```
Event → Comparison → Branch → Action A or Action B
```

### Loop Pattern
```
Event → For Loop → (Loop Body) → Completed
```

### Delayed Action
```
Event → Action 1 → Delay → Action 2
```

## Next Steps

1. Try the built-in examples (Examples menu)
2. Combine multiple node categories
3. Create variables to store state
4. Experiment with physics and actors
5. Build a simple game loop

## Need Help?

- Check the README.md for detailed documentation
- All nodes have tooltips with descriptions
- Press F12 to see console output
- Validation errors appear when running
