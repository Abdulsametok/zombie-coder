const { spawn } = require('child_process');
const path = require('path');
const { syncEnv } = require('./sync-env.cjs');

function main() {
  // Derleme oncesi .env anahtarlarini istemci koduna senkronize et
  syncEnv();

  const isWin = process.platform === 'win32';
  const androidDir = path.join(__dirname, '..', 'android');
  const gradleCmd = isWin ? 'gradlew.bat' : './gradlew';

  console.log('[ZombieCoder] Android Paket (APK) derleniyor (assembleRelease)...');

  const child = spawn(gradleCmd, ['assembleRelease'], {
    cwd: androidDir,
    stdio: 'inherit',
    shell: isWin,
  });

  child.on('exit', code => {
    if (code === 0) {
      const apkPath = path.join(
        androidDir,
        'app',
        'build',
        'outputs',
        'apk',
        'release',
        'app-release.apk',
      );
      console.log(`\n====================================================`);
      console.log(`[ZombieCoder] APK BAŞARIYLA OLUŞTURULDU:`);
      console.log(apkPath);
      console.log(`====================================================\n`);
    } else {
      console.error(`\n[ZombieCoder] APK derlemesi basarisiz oldu (Kod: ${code}).`);
    }
    process.exit(code ?? 0);
  });
}

main();
