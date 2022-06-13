export interface IElectronAPI {
  showDialog: (msg: string) => Promise<any>
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}
