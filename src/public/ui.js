/**
 * Verto Engine UI Controller
 * Handles graph editing, rendering, and interaction
 */

// Global state
let canvas = null;
let ctx = null;
let graph = null;
let selectedNode = null;
let selectedConnection = null;
let draggedNode = null;
let connectingFrom = null;
let panX = 0;
let panY = 0;
let zoom = 1;
let nodes = [];
let connections = [];

// UI state
let isRunning = false;
let executionEngine = null;

/**
 * Initialize the editor
 */
async function initializeEditor() {
  canvas = document.getElementById("graphCanvas");
  ctx = canvas.getContext("2d");

  // Set canvas size
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Initialize graph from backend
  initializeGraph();

  // Load and display node library
  loadNodeLibrary();

  // Setup event listeners
  setupEventListeners();

  // Initial render
  render();
}

/**
 * Resize canvas to fit container
 */
function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  render();
}

/**
 * Initialize empty graph
 */
function initializeGraph() {
  // This will be replaced with actual graph creation from backend
  nodes = [];
  connections = [];
}

/**
 * Load node library from API
 */
async function loadNodeLibrary() {
  try {
    // Fetch node types from API
    const response = await fetch("/api/nodes");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const categories = await response.json();

    const categoriesContainer = document.getElementById("nodeCategories");
    categoriesContainer.innerHTML = "";

    // Create category elements
    for (const [category, nodeTypes] of Object.entries(categories)) {
      const categoryEl = document.createElement("div");
      categoryEl.className = "node-category";

      const headerEl = document.createElement("div");
      headerEl.className = "category-header";
      headerEl.textContent = category;

      const nodesEl = document.createElement("div");
      nodesEl.className = "category-nodes";

      // Add nodes to category
      for (const node of nodeTypes) {
        const nodeEl = document.createElement("div");
        nodeEl.className = "node-item";
        nodeEl.textContent = node.title;
        nodeEl.title = node.description || "";
        nodeEl.draggable = true;
        nodeEl.dataset.nodeType = node.type;

        nodeEl.addEventListener("dragstart", (e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("nodeType", node.type);
        });

        nodesEl.appendChild(nodeEl);
      }

      // Toggle category
      headerEl.addEventListener("click", () => {
        headerEl.classList.toggle("collapsed");
        nodesEl.classList.toggle("collapsed");
      });

      categoryEl.appendChild(headerEl);
      categoryEl.appendChild(nodesEl);
      categoriesContainer.appendChild(categoryEl);
    }
  } catch (error) {
    console.error("Failed to load node library:", error);
    showError("Failed to load node library");
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Top bar buttons
  document.getElementById("btnNew").addEventListener("click", newGraph);
  document.getElementById("btnOpen").addEventListener("click", openGraph);
  document.getElementById("btnSave").addEventListener("click", saveGraph);
  document.getElementById("btnRun").addEventListener("click", runGraph);
  document.getElementById("btnStop").addEventListener("click", stopGraph);

  // Canvas events
  canvas.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });

  canvas.addEventListener("drop", (e) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData("nodeType");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;
    createNode(nodeType, x, y);
  });

  canvas.addEventListener("mousedown", onCanvasMouseDown);
  canvas.addEventListener("mousemove", onCanvasMouseMove);
  canvas.addEventListener("mouseup", onCanvasMouseUp);
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    // Could show context menu here
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Delete" && selectedNode) {
      deleteNode(selectedNode);
    }
  });

  // Zoom and pan
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoom *= delta;
    zoom = Math.max(0.1, Math.min(3, zoom));
    render();
  });
}

/**
 * Create a new node
 */
async function createNode(nodeType, x, y) {
  try {
    // Fetch node from API
    const response = await fetch(`/api/create-node/${encodeURIComponent(nodeType)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const nodeData = await response.json();

    if (nodeData && !nodeData.error) {
      nodes.push({
        id: nodeData.id,
        type: nodeType,
        title: nodeData.title,
        x: x,
        y: y,
        pins: nodeData.pins || [],
        data: nodeData.data || {},
        width: 150,
        height: 100,
      });
      render();
    } else {
      showError(`Failed to create node: ${nodeData?.error || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Failed to create node:", error);
    showError(`Failed to create node: ${error.message}`);
  }
}

/**
 * Delete a node
 */
function deleteNode(nodeData) {
  nodes = nodes.filter((n) => n.id !== nodeData.id);
  connections = connections.filter((c) => c.fromNodeId !== nodeData.id && c.toNodeId !== nodeData.id);
  selectedNode = null;
  render();
}

/**
 * Canvas mouse down handler
 */
function onCanvasMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left - panX) / zoom;
  const y = (e.clientY - rect.top - panY) / zoom;

  // Check if clicking on a pin
  for (const node of nodes) {
    for (const pin of node.pins) {
      const pinPos = getPinPosition(node, pin);
      const dist = Math.hypot(pinPos.x - x, pinPos.y - y);
      if (dist < 8) {
        connectingFrom = { nodeId: node.id, pinId: pin.id, pin };
        return;
      }
    }
  }

  // Check if clicking on a node
  for (const node of nodes) {
    if (x >= node.x && x <= node.x + node.width && y >= node.y && y <= node.y + node.height) {
      selectedNode = node;
      draggedNode = node;
      render();
      return;
    }
  }

  // Pan with space
  if (e.button === 1) {
    // Middle click or space+click would be here
  }

  selectedNode = null;
  render();
}

/**
 * Canvas mouse move handler
 */
function onCanvasMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left - panX) / zoom;
  const y = (e.clientY - rect.top - panY) / zoom;

  if (draggedNode) {
    draggedNode.x = x - draggedNode.width / 2;
    draggedNode.y = y - draggedNode.height / 2;
    render();
  }

  if (connectingFrom) {
    // Render preview line
    render();
    const fromPos = getPinPosition(
      nodes.find((n) => n.id === connectingFrom.nodeId),
      connectingFrom.pin
    );
    ctx.save();
    ctx.strokeStyle = "#3498db";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fromPos.x * zoom + panX, fromPos.y * zoom + panY);
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Canvas mouse up handler
 */
function onCanvasMouseUp(e) {
  if (connectingFrom && !draggedNode) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;

    // Check if clicking on a pin
    for (const node of nodes) {
      for (const pin of node.pins) {
        const pinPos = getPinPosition(node, pin);
        const dist = Math.hypot(pinPos.x - x, pinPos.y - y);
        if (dist < 8 && pin.direction !== connectingFrom.pin.direction) {
          // Create connection
          connections.push({
            id: Math.random().toString(36),
            fromNodeId: connectingFrom.nodeId,
            fromPinId: connectingFrom.pinId,
            toNodeId: node.id,
            toPinId: pin.id,
          });
          connectingFrom = null;
          draggedNode = null;
          render();
          return;
        }
      }
    }
  }

  connectingFrom = null;
  draggedNode = null;
  render();
}

/**
 * Get position of a pin on the canvas
 */
function getPinPosition(node, pin) {
  // Simple layout: inputs on left, outputs on right
  const isInput = pin.direction === "Input";
  const inputPins = node.pins.filter((p) => p.direction === "Input");
  const outputPins = node.pins.filter((p) => p.direction === "Output");
  const pinList = isInput ? inputPins : outputPins;
  const index = pinList.indexOf(pin);

  const x = isInput ? node.x : node.x + node.width;
  const y = node.y + 30 + index * 20;

  return { x, y };
}

/**
 * Render the graph
 */
function render() {
  // Clear canvas
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid
  drawGrid();

  // Save context
  ctx.save();
  ctx.translate(panX, panY);
  ctx.scale(zoom, zoom);

  // Draw connections
  for (const conn of connections) {
    const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
    const toNode = nodes.find((n) => n.id === conn.toNodeId);
    if (fromNode && toNode) {
      const fromPin = fromNode.pins.find((p) => p.id === conn.fromPinId);
      const toPin = toNode.pins.find((p) => p.id === conn.toPinId);
      if (fromPin && toPin) {
        drawConnection(getPinPosition(fromNode, fromPin), getPinPosition(toNode, toPin), fromPin.type === "Exec");
      }
    }
  }

  // Draw nodes
  for (const node of nodes) {
    drawNode(node, node === selectedNode);
  }

  ctx.restore();
}

/**
 * Draw grid background
 */
function drawGrid() {
  const gridSize = 20;
  ctx.strokeStyle = "#f0f0f0";
  ctx.lineWidth = 1;

  for (let x = panX % gridSize; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = panY % gridSize; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

/**
 * Draw a node
 */
function drawNode(node, isSelected) {
  // Node background
  ctx.fillStyle = isSelected ? "#ecf0f1" : "white";
  ctx.strokeStyle = isSelected ? "#e74c3c" : "#3498db";
  ctx.lineWidth = isSelected ? 3 : 2;

  ctx.beginPath();
  ctx.roundRect(node.x, node.y, node.width, node.height, [6, 6, 6, 6]);
  ctx.fill();
  ctx.stroke();

  // Title bar
  ctx.fillStyle = "#ecf0f1";
  ctx.fillRect(node.x, node.y, node.width, 25);

  // Title text
  ctx.fillStyle = "#2c3e50";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(node.title, node.x + node.width / 2, node.y + 16);

  // Draw pins
  const inputPins = node.pins.filter((p) => p.direction === "Input");
  const outputPins = node.pins.filter((p) => p.direction === "Output");

  // Input pins (left side)
  inputPins.forEach((pin, i) => {
    const x = node.x;
    const y = node.y + 30 + i * 20;
    drawPin(x, y, pin, true);
  });

  // Output pins (right side)
  outputPins.forEach((pin, i) => {
    const x = node.x + node.width;
    const y = node.y + 30 + i * 20;
    drawPin(x, y, pin, false);
  });
}

/**
 * Draw a pin
 */
function drawPin(x, y, pin, isInput) {
  const radius = 4;

  // Pin color
  ctx.fillStyle = pin.type === "Exec" ? "#e74c3c" : "#3498db";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(x + (isInput ? 0 : 0), y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pin label
  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.textAlign = isInput ? "left" : "right";
  ctx.fillText(pin.name, x + (isInput ? 12 : -12), y + 3);
}

/**
 * Draw a connection
 */
function drawConnection(fromPos, toPos, isExec) {
  ctx.strokeStyle = isExec ? "#e74c3c" : "#3498db";
  ctx.lineWidth = 2;

  if (isExec) {
    ctx.setLineDash([5, 5]);
  }

  // Bezier curve
  const mx = (fromPos.x + toPos.x) / 2;
  ctx.beginPath();
  ctx.moveTo(fromPos.x, fromPos.y);
  ctx.bezierCurveTo(mx, fromPos.y, mx, toPos.y, toPos.x, toPos.y);
  ctx.stroke();

  ctx.setLineDash([]);
}

/**
 * Run the graph
 */
async function runGraph() {
  try {
    const { ExecutionEngine } = await import("../execution/ExecutionEngine.js");
    const { Graph } = await import("../graph/Graph.js");

    // Create graph from editor state
    const g = new Graph("Editor Graph");

    // Add nodes and connections
    // This is simplified - a real implementation would reconstruct nodes properly

    document.getElementById("btnRun").disabled = true;
    document.getElementById("btnStop").disabled = false;
    isRunning = true;

    // Run with callbacks
    executionEngine = new ExecutionEngine(g);
    executionEngine.setCallbacks(
      (nodeId, result) => {
        console.log(`Node ${nodeId} executed:`, result);
      },
      (error) => {
        showError(error);
      },
      () => {
        stopGraph();
      }
    );

    await executionEngine.run();
  } catch (error) {
    showError(`Execution failed: ${error.message}`);
    stopGraph();
  }
}

/**
 * Stop the graph
 */
function stopGraph() {
  if (executionEngine) {
    executionEngine.stop();
  }
  document.getElementById("btnRun").disabled = false;
  document.getElementById("btnStop").disabled = true;
  isRunning = false;
}

/**
 * Save graph
 */
function saveGraph() {
  const graphData = {
    nodes,
    connections,
  };
  const json = JSON.stringify(graphData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "graph.json";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Load graph
 */
async function openGraph() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        nodes = data.nodes || [];
        connections = data.connections || [];
        render();
      } catch (error) {
        showError("Failed to load graph");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/**
 * Create new graph
 */
function newGraph() {
  if (confirm("Create a new graph? (Current changes will be lost)")) {
    nodes = [];
    connections = [];
    selectedNode = null;
    render();
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorEl = document.getElementById("errorMessage");
  errorEl.textContent = message;
  errorEl.classList.add("visible");
  setTimeout(() => {
    errorEl.classList.remove("visible");
  }, 5000);
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeEditor);
} else {
  initializeEditor();
}
