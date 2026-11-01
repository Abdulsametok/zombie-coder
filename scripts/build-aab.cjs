const { spawn } = require('child_process');
const path = require('path');
const { syncEnv } = require('./sync-env.cjs');

function main() {
  // Derleme oncesi .env anahtarlarini istemci koduna senkronize et
  syncEnv();

  const isWin = process.platform === 'win32';
  const androidDir = path.join(__dirname, '..', 'android');
  const gradleCmd = isWin ? 'gradlew.bat' : './gradlew';

  console.log('[ZombieCoder] Android App Bundle (AAB) derleniyor (bundleRelease)...');

  const child = spawn(gradleCmd, ['bundleRelease'], {
    cwd: androidDir,
    stdio: 'inherit',
    shell: isWin,
  });

  child.on('exit', code => {
    if (code === 0) {
      const aabPath = path.join(
        androidDir,
        'app',
        'build',
        'outputs',
        'bundle',
        'release',
        'app-release.aab',
      );
      console.log(`\n====================================================`);
      console.log(`[ZombieCoder] AAB BAŞARIYLA OLUŞTURULDU:`);
      console.log(aabPath);
      console.log(`====================================================\n`);
    } else {
      console.error(`\n[ZombieCoder] AAB derlemesi basarisiz oldu (Kod: ${code}).`);
    }
    process.exit(code ?? 0);
  });
}

main();
