#!/usr/bin/env node

/**
 * Build script para compilar TypeScript do Electron
 * Compila TUDO como CommonJS - formato nativo do Electron
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = 'dist-electron';

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  Compilando TypeScript do Electron (CommonJS)');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// Criar diretório de output
if (!fs.existsSync(outDir)) {
  console.log(`Criando diretório ${outDir}/...`);
  fs.mkdirSync(outDir, { recursive: true });
}

try {
  // Compilar AMBOS como CommonJS - formato nativo do Electron
  execSync(
    'npx tsc ' +
    'electron/main.ts electron/preload.ts ' +
    '--outDir dist-electron ' +
    '--target ES2022 ' +
    '--module CommonJS ' +
    '--moduleResolution node ' +
    '--lib ES2022 ' +
    '--skipLibCheck ' +
    '--esModuleInterop ' +
    '--allowSyntheticDefaultImports ' +
    '--resolveJsonModule ' +
    '--isolatedModules ' +
    '--declaration false',
    {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    }
  );

  console.log('');
  console.log('✓ Compilação do Electron concluída com sucesso!');
  console.log('');

  // Renomear .js para .cjs (força CommonJS mesmo com "type": "module")
  for (const name of ['main', 'preload']) {
    const jsFile = path.join(outDir, `${name}.js`);
    const cjsFile = path.join(outDir, `${name}.cjs`);
    if (fs.existsSync(jsFile)) {
      if (fs.existsSync(cjsFile)) fs.unlinkSync(cjsFile);
      fs.renameSync(jsFile, cjsFile);
      console.log(`✓ Renomeado: ${name}.js → ${name}.cjs`);
    }
  }

  // Verificar arquivos gerados
  for (const file of ['main.cjs', 'preload.cjs']) {
    const filePath = path.join(outDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`✓ Gerado: ${filePath}`);
    } else {
      throw new Error(`Arquivo ${file} não foi gerado!`);
    }
  }

  console.log('');
} catch (error) {
  console.error('');
  console.error('✗ Erro ao compilar Electron:');
  console.error(error.message || error);
  console.error('');
  process.exit(1);
}
