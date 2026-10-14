const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hws', {
  bootstrap: () => ipcRenderer.invoke('hws:bootstrap'),
  run: (scenarioId) => ipcRenderer.invoke('hws:run', scenarioId),
  runAll: () => ipcRenderer.invoke('hws:run-all'),
  stop: () => ipcRenderer.invoke('hws:stop'),
  setMode: (mode) => ipcRenderer.invoke('hws:set-mode', mode),
  setProfile: (profile) => ipcRenderer.invoke('hws:set-profile', profile),
  onEvent: (handler) => ipcRenderer.on('hws:event', (_event, payload) => handler(payload))
});
