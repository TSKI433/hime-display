import { Application, ModelManagerType } from "@display/Application";
import { DisplayConfig } from "@shared/types";

export type ManagerMessage = {
  channel: string;
  data: any;
}
type SendToModelControlCallback = ((managerMessage: ManagerMessage) => void)

export interface ModelControlInfo {
}

// 所有管理器的祖先
export abstract class ModelManager {
  config: DisplayConfig;
  stats: any;
  resolution: number;
  antialias: boolean;
  abstract modelType: ModelManagerType;
  _sendToModelControl: SendToModelControlCallback | null = null;
  abstract onWindowResize(): void;
  abstract loadModel(modelInfo: ModelInfo): Promise<ModelControlInfo>;
  constructor(parentApp: Application) {
    this.config = parentApp.config;
    this.stats = parentApp.stats;
    this.resolution = parentApp.resolution;
    this.antialias = parentApp.antialias;
  }
  onSendToModelControl(callback: SendToModelControlCallback) {
    this._sendToModelControl = callback;
  }
}
