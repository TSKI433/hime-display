import i18next from "@shared/locales/i18next";
import { trayMenuTemplate } from "../menus/tray";
import { Tray, Menu } from "electron";
import path from "path";
import { EventEmitter } from "events";
export class TrayManager extends EventEmitter {
  constructor() {
    super();
    this.template = trayMenuTemplate;
    this.tray = new Tray(path.resolve(__dirname, "./assets/iconTemplate.png"));
  }
  translateTemplate() {
    for (const item of this.template) {
      item.label = i18next.t(item.locale);
      item.click = () => {
        this.emit(item.event);
      };
    }
  }
  buildMenu() {
    this.translateTemplate();
    this.menu = Menu.buildFromTemplate(this.template);
    this.tray.setContextMenu(this.menu);
  }
}
