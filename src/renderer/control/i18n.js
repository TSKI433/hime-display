import i18next from "@shared/locales/i18next";
import I18NextVue from "i18next-vue";

export default function (app) {
  app.use(I18NextVue, { i18next });
  return app;
}
