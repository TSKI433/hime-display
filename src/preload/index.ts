import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  showDialog: (msg: string) => ipcRenderer.invoke('show-dialog', msg)
})
