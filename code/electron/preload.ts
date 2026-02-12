import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Define o tipo esperado para o estado (ajuste conforme seu main process)
type WindowState = 'maximized' | 'normal';

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // ✨ MELHORIA CRÍTICA AQUI
  onWindowStateChange: (callback: (state: WindowState) => void) => {
    // 1. Criamos uma função de referência para poder removê-la depois
    const subscription = (_event: IpcRendererEvent, state: WindowState) => callback(state);
    
    // 2. Registra o listener
    ipcRenderer.on('window-state-changed', subscription);

    // 3. Retorna uma função de limpeza (unsubscribe)
    // O front-end DEVE chamar essa função quando o componente desmontar
    return () => {
      ipcRenderer.removeListener('window-state-changed', subscription);
    };
  },
});

// --- Atualização da Declaração de Tipos ---
declare global {
  interface Window {
    electronAPI: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      // Agora retorna uma função void (o unsubscribe)
      onWindowStateChange: (callback: (state: WindowState) => void) => () => void;
    };
  }
}