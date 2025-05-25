import { type defaultConfig } from "./defaults/defaultConfig";
export interface DisplayConfigWrapper {
	windowName: string;
	config: DisplayConfig
}
export type DisplayConfig = typeof defaultConfig;