/**
 * Backend'i (backend/src/index.ts) derleme adımı olmadan yerelde çalıştırır.
 * TypeScript, mevcut Babel kurulumu ile anlık dönüştürülür.
 */
require('@babel/register')({
  extensions: ['.ts', '.tsx', '.js'],
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
  babelrc: false,
  configFile: false,
  ignore: [/node_modules/],
});

const { loadBackendEnv } = require('../backend/src/config/env');
const { createBackendServer } = require('../backend/src/index');

const env = loadBackendEnv();
createBackendServer().listen(env.port, () => {
  console.log(
    `[ZombieCoder Backend] http://localhost:${env.port} (Personalzy: ${env.geminiModel}, NPC: ${env.geminiNpcModel}, API anahtarı: ${env.geminiApiKey ? 'var' : 'YOK'})`,
  );
});
