/**
 * Example graphs demonstrating the node system.
 */

import { Graph } from '../core/graph.js';
import { NodeRegistry } from '../core/registry.js';

/**
 * Create a simple "Hello World" example graph.
 */
export function createHelloWorldExample(): Graph {
  const graph = new Graph('hello-world', 'Hello World Example');

  // Create nodes
  const beginPlay = NodeRegistry.create('BeginPlay', 'node_1');
  beginPlay.x = 100;
  beginPlay.y = 100;

  const printString = NodeRegistry.create('PrintString', 'node_2');
  printString.x = 400;
  printString.y = 100;

  // Add nodes to graph
  graph.addNode(beginPlay);
  graph.addNode(printString);

  // Connect nodes
  graph.connect('node_1', 'Then', 'node_2', 'Exec');

  return graph;
}

/**
 * Create a counter example that increments every frame.
 */
export function createCounterExample(): Graph {
  const graph = new Graph('counter', 'Frame Counter Example');

  // Add a counter variable
  graph.addVariable('Counter', { type: 'Int' } as any, 0);

  // BeginPlay - initialize counter
  const beginPlay = NodeRegistry.create('BeginPlay', 'node_1');
  beginPlay.x = 100;
  beginPlay.y = 100;

  const setVarInit = NodeRegistry.create('SetVariable', 'node_2');
  (setVarInit as any).variableName = 'Counter';
  (setVarInit as any).variableType = { type: 'Int' };
  setVarInit.x = 400;
  setVarInit.y = 100;

  const intLiteral = NodeRegistry.create('IntLiteral', 'node_3');
  (intLiteral as any).value = 0;
  intLiteral.x = 200;
  intLiteral.y = 150;

  // Tick - increment counter
  const tick = NodeRegistry.create('Tick', 'node_4');
  tick.x = 100;
  tick.y = 300;

  const getVar = NodeRegistry.create('GetVariable', 'node_5');
  (getVar as any).variableName = 'Counter';
  (getVar as any).variableType = { type: 'Int' };
  getVar.x = 200;
  getVar.y = 350;

  const addOne = NodeRegistry.create('Add', 'node_6');
  addOne.x = 400;
  addOne.y = 350;

  const oneLiteral = NodeRegistry.create('IntLiteral', 'node_7');
  (oneLiteral as any).value = 1;
  oneLiteral.x = 200;
  oneLiteral.y = 400;

  const setVar = NodeRegistry.create('SetVariable', 'node_8');
  (setVar as any).variableName = 'Counter';
  (setVar as any).variableType = { type: 'Int' };
  setVar.x = 600;
  setVar.y = 300;

  const printString = NodeRegistry.create('PrintString', 'node_9');
  printString.x = 900;
  printString.y = 300;

  // Add all nodes
  [beginPlay, setVarInit, intLiteral, tick, getVar, addOne, oneLiteral, setVar, printString].forEach(node => {
    graph.addNode(node);
  });

  // Connect BeginPlay flow
  graph.connect('node_1', 'Then', 'node_2', 'Exec');
  graph.connect('node_3', 'Value', 'node_2', 'Value');

  // Connect Tick flow
  graph.connect('node_4', 'Then', 'node_8', 'Exec');
  graph.connect('node_5', 'Value', 'node_6', 'A');
  graph.connect('node_7', 'Value', 'node_6', 'B');
  graph.connect('node_6', 'Result', 'node_8', 'Value');
  graph.connect('node_8', 'Then', 'node_9', 'Exec');

  return graph;
}

/**
 * Create a movement example using vectors.
 */
export function createMovementExample(): Graph {
  const graph = new Graph('movement', 'Actor Movement Example');

  // Tick event
  const tick = NodeRegistry.create('Tick', 'node_1');
  tick.x = 100;
  tick.y = 100;

  // Spawn actor
  const spawnActor = NodeRegistry.create('SpawnActor', 'node_2');
  spawnActor.x = 100;
  spawnActor.y = 200;

  // Make vector for movement
  const makeVector = NodeRegistry.create('MakeVector3', 'node_3');
  makeVector.x = 400;
  makeVector.y = 300;

  const floatX = NodeRegistry.create('FloatLiteral', 'node_4');
  (floatX as any).value = 1.0;
  floatX.x = 200;
  floatX.y = 320;

  // Get actor location
  const getLocation = NodeRegistry.create('GetActorLocation', 'node_5');
  getLocation.x = 400;
  getLocation.y = 150;

  // Add vectors
  const addVectors = NodeRegistry.create('VectorAdd', 'node_6');
  addVectors.x = 700;
  addVectors.y = 200;

  // Set new location
  const setLocation = NodeRegistry.create('SetActorLocation', 'node_7');
  setLocation.x = 1000;
  setLocation.y = 100;

  // Add nodes
  [tick, spawnActor, makeVector, floatX, getLocation, addVectors, setLocation].forEach(node => {
    graph.addNode(node);
  });

  // Connect flow
  graph.connect('node_1', 'Then', 'node_7', 'Exec');
  graph.connect('node_2', 'Actor', 'node_5', 'Actor');
  graph.connect('node_2', 'Actor', 'node_7', 'Actor');
  graph.connect('node_4', 'Value', 'node_3', 'X');
  graph.connect('node_5', 'Location', 'node_6', 'A');
  graph.connect('node_3', 'Vector', 'node_6', 'B');
  graph.connect('node_6', 'Result', 'node_7', 'Location');

  return graph;
}

/**
 * Create a branch example showing conditional logic.
 */
export function createBranchExample(): Graph {
  const graph = new Graph('branch', 'Conditional Branch Example');

  // Add a score variable
  graph.addVariable('Score', { type: 'Int' } as any, 0);

  const tick = NodeRegistry.create('Tick', 'node_1');
  tick.x = 100;
  tick.y = 100;

  const getScore = NodeRegistry.create('GetVariable', 'node_2');
  (getScore as any).variableName = 'Score';
  (getScore as any).variableType = { type: 'Int' };
  getScore.x = 200;
  getScore.y = 200;

  const threshold = NodeRegistry.create('IntLiteral', 'node_3');
  (threshold as any).value = 100;
  threshold.x = 200;
  threshold.y = 250;

  const comparison = NodeRegistry.create('Greater', 'node_4');
  comparison.x = 400;
  comparison.y = 200;

  const branch = NodeRegistry.create('Branch', 'node_5');
  branch.x = 600;
  branch.y = 100;

  const printWin = NodeRegistry.create('PrintString', 'node_6');
  printWin.x = 900;
  printWin.y = 50;

  const printLose = NodeRegistry.create('PrintString', 'node_7');
  printLose.x = 900;
  printLose.y = 150;

  // Add nodes
  [tick, getScore, threshold, comparison, branch, printWin, printLose].forEach(node => {
    graph.addNode(node);
  });

  // Connect
  graph.connect('node_1', 'Then', 'node_5', 'Exec');
  graph.connect('node_2', 'Value', 'node_4', 'A');
  graph.connect('node_3', 'Value', 'node_4', 'B');
  graph.connect('node_4', 'Result', 'node_5', 'Condition');
  graph.connect('node_5', 'True', 'node_6', 'Exec');
  graph.connect('node_5', 'False', 'node_7', 'Exec');

  return graph;
}

/**
 * Create a delay example showing latent actions.
 */
export function createDelayExample(): Graph {
  const graph = new Graph('delay', 'Delay Example');

  const beginPlay = NodeRegistry.create('BeginPlay', 'node_1');
  beginPlay.x = 100;
  beginPlay.y = 100;

  const print1 = NodeRegistry.create('PrintString', 'node_2');
  print1.x = 400;
  print1.y = 100;

  const delay = NodeRegistry.create('Delay', 'node_3');
  delay.x = 700;
  delay.y = 100;

  const delayTime = NodeRegistry.create('FloatLiteral', 'node_4');
  (delayTime as any).value = 2.0;
  delayTime.x = 500;
  delayTime.y = 150;

  const print2 = NodeRegistry.create('PrintString', 'node_5');
  print2.x = 1000;
  print2.y = 100;

  // Add nodes
  [beginPlay, print1, delay, delayTime, print2].forEach(node => {
    graph.addNode(node);
  });

  // Connect
  graph.connect('node_1', 'Then', 'node_2', 'Exec');
  graph.connect('node_2', 'Then', 'node_3', 'Exec');
  graph.connect('node_4', 'Value', 'node_3', 'Duration');
  graph.connect('node_3', 'Completed', 'node_5', 'Exec');

  return graph;
}

/**
 * Get all example graphs.
 */
export function getAllExamples(): { name: string; description: string; factory: () => Graph }[] {
  return [
    {
      name: 'Hello World',
      description: 'Simple BeginPlay + PrintString',
      factory: createHelloWorldExample,
    },
    {
      name: 'Counter',
      description: 'Increments a variable every frame',
      factory: createCounterExample,
    },
    {
      name: 'Movement',
      description: 'Move an actor using vectors',
      factory: createMovementExample,
    },
    {
      name: 'Branch',
      description: 'Conditional logic with Branch node',
      factory: createBranchExample,
    },
    {
      name: 'Delay',
      description: 'Latent action with delay',
      factory: createDelayExample,
    },
  ];
}
