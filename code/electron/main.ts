import { app, BrowserWindow, ipcMain, Menu, shell, nativeImage } from 'electron';
import * as path from 'path';
import serve from 'electron-serve'; // Importe a biblioteca nova

// --- Configurações ---
const IS_DEV = process.env.NODE_ENV === 'development';
const APP_TITLE = '360-Viewer';

// Caminhos
const PRELOAD_PATH = path.join(__dirname, 'preload.js');
const ASSETS_PATH = path.join(__dirname, '../assets');

// --- CONFIGURAÇÃO DO SERVIDOR DE ARQUIVOS ---
// Isso diz: "Sirva a pasta 'dist' como se fosse um site estático"
// O 'serve' lida automaticamente com os caminhos dentro do .asar
const loadURL = serve({ directory: 'dist' });

let mainWindow: BrowserWindow | null = null;

// Silenciar avisos
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// Correções de GPU (opcional, mas bom manter)
if (IS_DEV) {
  app.commandLine.appendSwitch('disable-gpu-process-crash-limit');
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

async function createWindow() {
  const iconPath = path.join(ASSETS_PATH, 'icon.ico');
  const icon = nativeImage.createFromPath(iconPath);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: APP_TITLE,
    icon: icon.isEmpty() ? undefined : icon,
    show: false,
    webPreferences: {
      preload: PRELOAD_PATH,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, 
    },
  });

  Menu.setApplicationMenu(createMenu());

  // --- CARREGAMENTO ---
  if (IS_DEV) {
    // Modo Desenvolvedor
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Modo Produção (Usando electron-serve)
    // Isso carrega app://-/index.html
    await loadURL(mainWindow); 
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Handler de links externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ... (O resto do arquivo: createMenu, App Lifecycle, IPC mantém igual) ...
// Copie as funções createMenu, app.on e ipcMain do seu arquivo anterior
// Elas não mudam.

// --- Menu Customizado (Copiado para facilitar) ---
function createMenu(): Electron.Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Arquivo',
      submenu: [{ label: 'Sair', click: () => app.quit() }]
    }
  ];
  return Menu.buildFromTemplate(template);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('window-minimize', (event) => BrowserWindow.fromWebContents(event.sender)?.minimize());
ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.isMaximized() ? win.unmaximize() : win.maximize();
});
ipcMain.on('window-close', (event) => BrowserWindow.fromWebContents(event.sender)?.close());