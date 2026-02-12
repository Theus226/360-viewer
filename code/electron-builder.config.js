module.exports = {
  appId: 'com.previsualize.360',
  productName: '360 Previsualize',
  
  directories: {
    buildResources: 'assets',
    output: 'dist',
  },
  
  // 🔥 CRITICAL: Arquivos que vão para o instalador
  files: [
    'dist/**/*',           // Build do React (Vite output)
    'dist-electron/**/*',  // Electron main/preload compilados
    'package.json',
    {
      from: 'assets',
      to: 'assets',
      filter: ['**/*'],
    },
  ],
  
  // 🔥 CRITICAL: ASAR configurado corretamente
  asar: true,
  // Desempacota apenas o necessário (dist-electron já está como .cjs)
  asarUnpack: [
    'dist-electron/**/*',
  ],
  
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
  },
  
  portable: {
    artifactName: '${productName}-${version}-portable.exe',
  },
  
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: '${productName}',
  },
  
  // 🔥 CRITICAL: Entry point correto (.cjs para CommonJS)
  extraMetadata: {
    main: 'dist-electron/main.cjs',
  },
};
