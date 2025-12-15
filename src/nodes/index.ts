/**
 * Index file for all node registrations.
 */

import { registerEventNodes } from './events.js';
import { registerFlowNodes } from './flow.js';
import { registerVariableNodes } from './variables.js';
import { registerValueNodes } from './values.js';
import { registerLogicNodes } from './logic.js';
import { registerMathNodes } from './math.js';
import { registerTimeNodes } from './time.js';
import { registerDebugNodes } from './debug.js';

/**
 * Register all built-in nodes.
 */
export function registerAllNodes(): void {
  registerEventNodes();
  registerFlowNodes();
  registerVariableNodes();
  registerValueNodes();
  registerLogicNodes();
  registerMathNodes();
  registerTimeNodes();
  registerDebugNodes();
}
