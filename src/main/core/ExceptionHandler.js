import { app, dialog } from "electron";
import { logger } from "./Logger";
import is from "electron-is";
export class ExceptionHandler {
  constructor() {
    this.init();
  }
  init() {
    if (is.dev()) {
      return;
    }
    process.on("uncaughtException", (error) => {
      const { message, stack } = error;
      logger.error(`[Hime Display] Uncaught exception: ${message}`);
      logger.error(stack);
      dialog.showErrorBox("Hime Display Error: ", stack);
      app.quit();
    });
  }
}
