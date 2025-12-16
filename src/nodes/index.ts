/**
 * Index file for all node registrations.
 */

import { registerEventNodes } from './events.js';
import { registerFlowNodes } from './flow.js';
import { registerVariableNodes } from './variables.js';
import { registerValueNodes } from './values.js';
import { registerLogicNodes } from './logic.js';
import { registerMathNodes } from './math.js';
import { registerVectorNodes } from './vector.js';
import { registerStringNodes } from './string.js';
import { registerArrayNodes } from './array.js';
import { registerObjectNodes } from './object.js';
import { registerPhysicsNodes } from './physics.js';
import { registerTimeNodes } from './time.js';
import { registerAnimationNodes } from './animation.js';
import { registerAINodes } from './ai.js';
import { registerAudioNodes } from './audio.js';
import { registerUINodes } from './ui.js';
import { registerSaveLoadNodes } from './saveload.js';
import { registerNetworkNodes } from './network.js';
import { registerDebugNodes } from './debug.js';
import { registerUtilityNodes } from './utility.js';

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
  registerVectorNodes();
  registerStringNodes();
  registerArrayNodes();
  registerObjectNodes();
  registerPhysicsNodes();
  registerTimeNodes();
  registerAnimationNodes();
  registerAINodes();
  registerAudioNodes();
  registerUINodes();
  registerSaveLoadNodes();
  registerNetworkNodes();
  registerDebugNodes();
  registerUtilityNodes();
}
