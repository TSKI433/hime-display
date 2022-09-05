import i18next from "@shared/locales/i18next";
import { trayMenuTemplate } from "../menus/tray";
import { Tray, Menu } from "electron";
import path from "path";
import { EventEmitter } from "events";
import is from "electron-is";
// 我其实已经注意到macOS上显示的菜单为英语了，之所以没有对其进行处理，是因为这个应用用不到那个菜单，但是如果把菜单弄成null的话，默认注册的快捷键会失效，复制粘贴什么都用不了，所以直接懒得干了
export class TrayManager extends EventEmitter {
  constructor() {
    super();
    this.template = trayMenuTemplate;
    if (is.macOS()) {
      this.tray = new Tray(
        path.resolve(__dirname, "./assets/trayTemplate.png")
      );
    } else {
      this.tray = new Tray(path.resolve(__dirname, "./assets/trayWindows.png"));
    }
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
