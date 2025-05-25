import { ipc } from "@preload/display";
import { Application, ModelManagerType, ModelType } from "@display/Application";
interface BaseModelInfo {
	name: string;
	modelType: ModelType;
	extensionName: string;
	entranceFile: string;
	sourcePath: string;
	themeColor: string;
}

interface SpineModelInfo extends BaseModelInfo {
	modelType: ModelType.Spine;
	version: string;
}

interface OtherModelInfo extends BaseModelInfo {
	modelType: Exclude<ModelType, ModelType.Spine>;
}

declare global {
	interface Window {
		nodeAPI: {
			ipc: typeof ipc;
		},
		app: Application;
	}
	type NodeAPI = typeof window.nodeAPI;
	type ModelInfo = SpineModelInfo | OtherModelInfo;
}