import { v4 as uuid } from "uuid";
import { IPin, PinType, PinDirection } from "../types";

export class Pin implements IPin {
  id: string;
  name: string;
  type: PinType;
  direction: PinDirection;
  nodeId: string;
  defaultValue?: any;
  isArray?: boolean;
  isMap?: boolean;
  isSet?: boolean;
  isWildcard?: boolean;

  constructor(
    name: string,
    type: PinType,
    direction: PinDirection,
    nodeId: string,
    options: {
      defaultValue?: any;
      isArray?: boolean;
      isMap?: boolean;
      isSet?: boolean;
      isWildcard?: boolean;
      id?: string;
    } = {}
  ) {
    this.id = options.id || uuid();
    this.name = name;
    this.type = type;
    this.direction = direction;
    this.nodeId = nodeId;
    this.defaultValue = options.defaultValue;
    this.isArray = options.isArray || false;
    this.isMap = options.isMap || false;
    this.isSet = options.isSet || false;
    this.isWildcard = options.isWildcard || false;
  }

  // Check if two pins can be connected
  canConnectTo(other: Pin): boolean {
    // Exec pins only connect to exec pins
    if (this.type === PinType.Exec) {
      return other.type === PinType.Exec;
    }

    // Same direction pins cannot connect
    if (this.direction === other.direction) {
      return false;
    }

    // Wildcard pins can connect to anything
    if (this.isWildcard || other.isWildcard) {
      return true;
    }

    // Type must match
    if (this.type !== other.type) {
      return false;
    }

    // Collection type must match
    if (this.isArray !== other.isArray) {
      return false;
    }
    if (this.isMap !== other.isMap) {
      return false;
    }
    if (this.isSet !== other.isSet) {
      return false;
    }

    return true;
  }

  toJSON(): IPin {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      direction: this.direction,
      nodeId: this.nodeId,
      defaultValue: this.defaultValue,
      isArray: this.isArray,
      isMap: this.isMap,
      isSet: this.isSet,
      isWildcard: this.isWildcard,
    };
  }

  static fromJSON(data: IPin, nodeId: string): Pin {
    return new Pin(data.name, data.type, data.direction, nodeId, {
      id: data.id,
      defaultValue: data.defaultValue,
      isArray: data.isArray,
      isMap: data.isMap,
      isSet: data.isSet,
      isWildcard: data.isWildcard,
    });
  }
}
