import { app, dialog } from "electron";
import is from "electron-is";

import { logger } from "./Logger";

export class ExceptionHandler {
  constructor(options) {
    this.options = {
      showDialog: !is.dev(),
      ...options,
    };

    this.setup();
  }

  setup() {
    if (is.dev()) {
      return;
    }
    const { showDialog } = this.options;
    process.on("uncaughtException", (err) => {
      const { message, stack } = err;
      logger.error(`[Hime Display] Uncaught exception: ${message}`);
      logger.error(stack);

      if (showDialog && app.isReady()) {
        dialog.showErrorBox("Error: ", message);
      }
    });
  }
}
