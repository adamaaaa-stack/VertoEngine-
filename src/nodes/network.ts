/**
 * Networking nodes.
 */

import { Node, NodeCategory, ExecutionContext } from '../core/node.js';
import { PinFactory } from '../core/pin.js';
import { Types } from '../core/types.js';
import { NodeRegistry } from '../core/registry.js';

// Run on Server
class RunOnServerNode extends Node {
  constructor(id: string) {
    super({ id, type: 'RunOnServer', category: NodeCategory.Network, displayName: 'Run on Server' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.execOut('Then'));
  }

  execute(): string {
    // In a real implementation, this would execute on the server
    console.log('[Network] Running on Server');
    return 'Then';
  }
}

// Run on Client
class RunOnClientNode extends Node {
  constructor(id: string) {
    super({ id, type: 'RunOnClient', category: NodeCategory.Network, displayName: 'Run on Client' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.execOut('Then'));
  }

  execute(): string {
    console.log('[Network] Running on Client');
    return 'Then';
  }
}

// Has Authority
class HasAuthorityNode extends Node {
  constructor(id: string) {
    super({ id, type: 'HasAuthority', category: NodeCategory.Network, displayName: 'Has Authority' });
    (this as any).isPure = true;
    this.addPin(PinFactory.output('Has Authority', Types.Boolean));
  }

  execute(): null {
    // In a real implementation, this would check network authority
    this.setOutputValue('Has Authority', true);
    return null;
  }
}

// Switch Has Authority
class SwitchHasAuthorityNode extends Node {
  constructor(id: string) {
    super({ id, type: 'SwitchHasAuthority', category: NodeCategory.Network, displayName: 'Switch Has Authority' });
    this.addPin(PinFactory.execIn());
    this.addPin(PinFactory.execOut('Authority'));
    this.addPin(PinFactory.execOut('Remote'));
  }

  execute(): string {
    // In a real implementation, this would check network authority
    const hasAuthority = true;
    return hasAuthority ? 'Authority' : 'Remote';
  }
}

// Register networking nodes
export function registerNetworkNodes(): void {
  NodeRegistry.register({
    type: 'RunOnServer',
    category: NodeCategory.Network,
    displayName: 'Run on Server',
    description: 'Execute this code on the server',
    factory: (id) => new RunOnServerNode(id),
    keywords: ['run', 'server', 'network', 'rpc'],
  });

  NodeRegistry.register({
    type: 'RunOnClient',
    category: NodeCategory.Network,
    displayName: 'Run on Client',
    description: 'Execute this code on the client',
    factory: (id) => new RunOnClientNode(id),
    keywords: ['run', 'client', 'network', 'rpc'],
  });

  NodeRegistry.register({
    type: 'HasAuthority',
    category: NodeCategory.Network,
    displayName: 'Has Authority',
    description: 'Check if this machine has network authority',
    factory: (id) => new HasAuthorityNode(id),
    keywords: ['authority', 'network', 'server'],
  });

  NodeRegistry.register({
    type: 'SwitchHasAuthority',
    category: NodeCategory.Network,
    displayName: 'Switch Has Authority',
    description: 'Branch based on network authority',
    factory: (id) => new SwitchHasAuthorityNode(id),
    keywords: ['switch', 'authority', 'network', 'server', 'client'],
  });
}
